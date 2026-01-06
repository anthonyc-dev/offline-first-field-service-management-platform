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
    if (!user) throw new Error("Invalid email or password");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid email or password");

    // limit active sessions per user
    const activeSessions = await prisma.refreshToken.count({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeSessions >= 5) {
      throw new Error("Too many active sessions");
    }

    const refreshToken = generateRefreshToken();

    // Pseudo Prisma example
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, deviceId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        deviceId,
        userAgent,
        ipAddress,
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
      throw new Error("Missing required fields");

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email already registered");

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

    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        deviceId,
        userAgent,
        ipAddress,
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
      // Find token in DB
      const storedToken = await tx.refreshToken.findUnique({
        where: { tokenHash },
      });

      // 🔥 TOKEN REUSE DETECTED
      if (!storedToken || storedToken.revokedAt) {
        // If this token was revoked, possible token reuse attack: revoke all tokens for this user if known!
        const stored = storedToken;
        if (stored) {
          await tx.refreshToken.updateMany({
            where: { userId: stored.userId },
            data: { revokedAt: new Date() },
          });
        }
        throw new Error("Refresh token reuse detected");
      }

      if (storedToken.expiresAt < new Date()) {
        throw new Error("Invalid refresh token");
      }

      if (storedToken.deviceId !== deviceId) {
        throw new Error("Device mismatch");
      }

      // Generate new refresh token
      const newRefreshToken = generateRefreshToken();

      const newToken = await tx.refreshToken.create({
        data: {
          userId: storedToken.userId,
          tokenHash: hashToken(newRefreshToken),
          deviceId: storedToken.deviceId,
          userAgent: storedToken.userAgent,
          ipAddress: storedToken.ipAddress,
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
        where: { id: storedToken.userId },
      });
      if (!user) throw new Error("User not found");

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
      throw new Error("Unauthorized");
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
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ---------------- LOGOUT ALL DEVICE ----------------
  async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const authService = new AuthService();
