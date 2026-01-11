import bcrypt from "bcryptjs";
import { prisma } from "../../config/db.js";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "../../shared/types/auth.types.js";
import {
  generateRefreshToken,
  hashToken,
  signAccessToken,
} from "../../shared/utils/tokens.js";
import { ApiError } from "../../shared/errors/ApiError.js";

export class AuthService {
  // ---------------- LOGIN ----------------
  async login({
    email,
    password,
    deviceId,
    userAgent,
    ipAddress,
  }: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new ApiError(
        401,
        "Invalid email or password",
        "AUTH_INVALID_CREDENTIALS"
      );

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      throw new ApiError(
        401,
        "Invalid email or password",
        "AUTH_INVALID_CREDENTIALS"
      );

    return await prisma.$transaction(async (tx) => {
      // Limit active sessions (global, not per device)
      const activeSessions = await tx.session.count({
        where: { userId: user.id, revokedAt: null },
      });

      const MAX_SESSION = 5;

      if (activeSessions >= MAX_SESSION) {
        // throw new Error("Too many active sessions");
        // Revoke oldest session automatically
        const oldestSession = await tx.session.findFirst({
          where: { userId: user.id, revokedAt: null },
          orderBy: { createdAt: "asc" },
        });

        if (oldestSession) {
          await tx.session.update({
            where: { id: oldestSession.id },
            data: { revokedAt: new Date() },
          });
        }

        // Option 2: Revoke ALL sessions from this specific device first
        // (This happens later in your code anyway)
        throw new ApiError(
          409,
          "Maximum sessions reached. Please log out from another device.",
          "AUTH_MAX_SESSIONS"
        );
      }

      // Revoke existing session(s) for this device
      const sessionsToRevoke = await tx.session.findMany({
        where: {
          userId: user.id,
          deviceId,
          revokedAt: null,
        },
        select: { id: true },
      });

      const sessionIds = sessionsToRevoke.map((s) => s.id);

      if (sessionIds.length > 0) {
        // Revoke refresh tokens first
        await tx.refreshToken.updateMany({
          where: {
            sessionId: { in: sessionIds },
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });

        // Revoke sessions
        await tx.session.updateMany({
          where: { id: { in: sessionIds } },
          data: { revokedAt: new Date() },
        });
      }

      // Create new session
      const session = await tx.session.create({
        data: {
          userId: user.id,
          deviceId,
          userAgent,
          ipAddress,
        },
      });

      // Create refresh token
      const refreshToken = generateRefreshToken();

      await tx.refreshToken.create({
        data: {
          sessionId: session.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken: signAccessToken(user),
        refreshToken,
      };
    });
  }

  // ---------------- REGISTER ----------------
  async register(input: RegisterInput): Promise<AuthResponse> {
    const {
      fullName,
      email,
      password,
      role = "user",
      phoneNumber,
      deviceId = "unknown",
      userAgent = "unknown",
      ipAddress = "unknown",
    } = input;

    if (!fullName || !email || !password || !phoneNumber)
      throw new ApiError(
        400,
        "Missing required fields",
        "AUTH_REGISTER_MISSING_FIELDS"
      );

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      throw new ApiError(
        409,
        "Email already registered",
        "AUTH_EMAIL_ALREADY_REGISTERED"
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        phoneNumber,
      },
    });

    // Create session for new user
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        deviceId,
        userAgent,
        ipAddress,
      },
    });

    // Generate and create refresh token linked to session
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        sessionId: session.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    return {
      user: safeUser,
      accessToken: signAccessToken(user),
      refreshToken,
    };
  }

  // ---------------- REFRESH TOKEN ----------------
  async refreshToken(
    oldRefreshToken: string,
    deviceId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = hashToken(oldRefreshToken);

    return await prisma.$transaction(async (tx) => {
      // Find token in DB with its session
      const storedToken = await tx.refreshToken.findUnique({
        where: { tokenHash },
        include: { session: true },
      });

      // 🔥 TOKEN REUSE DETECTED
      if (!storedToken || storedToken.revokedAt) {
        // If this token was revoked, possible token reuse attack: revoke all sessions for this user if known!
        if (storedToken?.session) {
          await tx.session.updateMany({
            where: { userId: storedToken.session.userId },
            data: { revokedAt: new Date() },
          });
        }
        throw new ApiError(
          401,
          "Refresh token reuse detected",
          "AUTH_REFRESH_TOKEN_REUSE"
        );
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        throw new ApiError(
          401,
          "Invalid refresh token",
          "AUTH_INVALID_REFRESH_TOKEN"
        );
      }

      // Check if session is revoked
      if (storedToken.session.revokedAt) {
        throw new ApiError(401, "Session revoked", "AUTH_SESSION_REVOKED");
      }

      // Check device mismatch
      if (storedToken.session.deviceId !== deviceId) {
        throw new ApiError(403, "Device mismatch", "AUTH_DEVICE_MISMATCH");
      }

      // Update session lastUsedAt
      await tx.session.update({
        where: { id: storedToken.sessionId },
        data: { lastUsedAt: new Date() },
      });

      // Generate new refresh token
      const newRefreshToken = generateRefreshToken();

      const newToken = await tx.refreshToken.create({
        data: {
          sessionId: storedToken.sessionId,
          tokenHash: hashToken(newRefreshToken),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Revoke OLD token and link → NEW token
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revokedAt: new Date(),
          replacedById: newToken.id,
        },
      });

      // Generate new access token
      const user = await tx.user.findUnique({
        where: { id: storedToken.session.userId },
      });
      if (!user)
        throw new ApiError(404, "User not found", "AUTH_USER_NOT_FOUND");

      const accessToken = signAccessToken(user);

      return { accessToken, refreshToken: newRefreshToken };
    });
  }

  //-----------------Protection Route------------------
  getProfileFromRequest(req: {
    user?: { sub: string; role: string; exp: Date };
  }): {
    sub: string;
    role: string;
    exp: Date;
  } {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized", "AUTH_UNAUTHORIZED");
    }
    // Return basic info from token payload
    return {
      sub: req.user.sub,
      role: req.user.role,
      exp: req.user.exp,
    };
  }

  // ---------------- LOGOUT ----------------
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true },
    });

    if (storedToken) {
      // Revoke the session and all its refresh tokens
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: { id: storedToken.sessionId },
          data: { revokedAt: new Date() },
        });

        await tx.refreshToken.updateMany({
          where: { sessionId: storedToken.sessionId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      });
    }
  }

  // ---------------- LOGOUT ALL DEVICE ----------------
  async logoutAll(userId: string) {
    await prisma.$transaction(async (tx) => {
      // 1. First, get all ACTIVE session IDs
      const activeSessions = await tx.session.findMany({
        where: {
          userId,
          revokedAt: null,
        },
        select: { id: true },
      });

      const activeSessionIds = activeSessions.map((s) => s.id);

      if (activeSessionIds.length > 0) {
        // 2. Revoke all refresh tokens for ACTIVE sessions
        await tx.refreshToken.updateMany({
          where: {
            sessionId: { in: activeSessionIds },
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });

        // 3. Revoke all ACTIVE sessions
        await tx.session.updateMany({
          where: {
            id: { in: activeSessionIds },
          },
          data: { revokedAt: new Date() },
        });
      }
    });
  }
}

export const authService = new AuthService();
