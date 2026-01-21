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
import {
  createSession,
  getSession,
  getUserSessions,
  revokeSession,
  acquireUserLock,
  releaseUserLock,
} from "../../shared/session/redisSession.js";
import { randomUUID } from "crypto";

const MAX_SESSIONS = 5;

export class AuthService {
  // ---------------- LOGIN ----------------
  async login({
    email,
    password,
    deviceId,
    userAgent,
    ipAddress,
  }: LoginInput): Promise<AuthResponse> {
    // Step 1: Validate credentials (read-only, outside transaction)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new ApiError(
        401,
        "Invalid credentials",
        "AUTH_INVALID_CREDENTIALS"
      );

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new ApiError(
        401,
        "Invalid credentials",
        "AUTH_INVALID_CREDENTIALS"
      );

    // Step 2: Acquire distributed lock to prevent concurrent logins
    const lockAcquired = await acquireUserLock(user.id, 5000);
    if (!lockAcquired) {
      throw new ApiError(
        429,
        "Too many login attempts. Please try again.",
        "AUTH_CONCURRENT_LOGIN"
      );
    }

    try {
      // Handle Redis sessions (outside transaction, but before DB operations)
      const allSessionIds = await getUserSessions(user.id);

      // Filter out expired sessions and clean up Redis set
      // Only count valid (non-expired) sessions toward MAX_SESSIONS
      const validSessions: string[] = [];
      const expiredSessionIds: string[] = [];
      
      for (const sId of allSessionIds) {
        const sess = await getSession(sId);
        if (sess) {
          validSessions.push(sId);
        } else {
          expiredSessionIds.push(sId);
        }
      }

      // Clean up expired sessions from Redis
      for (const sId of expiredSessionIds) {
        await revokeSession(sId, user.id);
      }

      // Find oldest session for revocation if needed
      let oldestSessionId: string | null = null;
      if (validSessions.length >= MAX_SESSIONS) {
        let oldestTime = Date.now();
        for (const sId of validSessions) {
          const sess = await getSession(sId);
          if (sess && sess.createdAt < oldestTime) {
            oldestTime = sess.createdAt;
            oldestSessionId = sId;
          }
        }
      }

      // Collect session IDs to revoke (same device)
      const sameDeviceSessionIds: string[] = [];
      for (const sId of validSessions) {
        const sess = await getSession(sId);
        if (sess?.deviceId === deviceId) {
          sameDeviceSessionIds.push(sId);
        }
      }

      //  Execute all database operations in a transaction
      const sessionId = randomUUID();
      const refreshToken = generateRefreshToken();
      const refreshTokenExpiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );

      const result = await prisma.$transaction(
        async (tx) => {
          // Re-fetch user within transaction for consistency
          const userInTx = await tx.user.findUnique({ where: { id: user.id } });
          if (!userInTx) {
            throw new ApiError(404, "User not found", "AUTH_USER_NOT_FOUND");
          }

          const now = new Date();

          // Revoke oldest session's refresh tokens if exceeding MAX_SESSIONS
          if (oldestSessionId) {
            await tx.refreshToken.updateMany({
              where: {
                sessionId: oldestSessionId,
                userId: user.id,
                revokedAt: null,
              },
              data: { revokedAt: now },
            });
          }

          // Revoke refresh tokens for same device sessions
          if (sameDeviceSessionIds.length > 0) {
            await tx.refreshToken.updateMany({
              where: {
                sessionId: { in: sameDeviceSessionIds },
                userId: user.id,
                revokedAt: null,
              },
              data: { revokedAt: now },
            });
          }

          // Revoke active refresh tokens for same device/IP even if Redis session expired
          // This handles the case where Redis session expired but refresh token is still active
          await tx.refreshToken.updateMany({
            where: {
              userId: user.id,
              deviceId: deviceId,
              ipAddress: ipAddress,
              revokedAt: null,
              expiresAt: { gt: now },
            },
            data: { revokedAt: now },
          });

          // Create new refresh token
          await tx.refreshToken.create({
            data: {
              sessionId,
              userId: user.id,
              deviceId,
              userAgent,
              ipAddress,
              tokenHash: hashToken(refreshToken),
              expiresAt: refreshTokenExpiresAt,
            },
          });

          return { user: userInTx };
        },
        {
          maxWait: 5000, // Maximum time to wait for transaction
          timeout: 10000, // Maximum time transaction can run
        }
      );

      //  Handle Redis operations after successful DB transaction
      // Revoke Redis sessions for oldest and same device
      const redisSessionIdsToRevoke = new Set<string>();
      if (oldestSessionId) {
        redisSessionIdsToRevoke.add(oldestSessionId);
      }
      sameDeviceSessionIds.forEach((id) => redisSessionIdsToRevoke.add(id));

      // Also revoke sessions for tokens we just revoked in DB
      const revokedTokens = await prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          deviceId: deviceId,
          ipAddress: ipAddress,
          revokedAt: { not: null },
        },
        select: { sessionId: true },
        distinct: ["sessionId"],
      });

      revokedTokens.forEach((token) => {
        redisSessionIdsToRevoke.add(token.sessionId);
      });

      // Revoke Redis sessions
      for (const sId of redisSessionIdsToRevoke) {
        await revokeSession(sId, user.id);
      }

      // Create new Redis session
      await createSession(sessionId, {
        userId: result.user.id,
        deviceId,
        userAgent,
        ipAddress,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      });

  
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role,
        },
        accessToken: signAccessToken(result.user),
        refreshToken,
      };
    } finally {
      // Always release the lock
      await releaseUserLock(user.id);
    }
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

 
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new ApiError(
        409,
        "Email already registered",
        "AUTH_EMAIL_ALREADY_REGISTERED"
      );

  
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashed, role, phoneNumber },
    });

  
    const sessionId = randomUUID();
    await createSession(sessionId, {
      userId: user.id,
      deviceId,
      userAgent,
      ipAddress,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    });

 
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        sessionId,
        userId: user.id,
        deviceId,
        userAgent,
        ipAddress,
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
  }

  // ---------------- REFRESH TOKEN ----------------
  async refreshToken(oldRefreshToken: string, deviceId: string, ipAddress: string, userAgent: string) {
    const tokenHash = hashToken(oldRefreshToken);
  
    return await prisma.$transaction(async (tx) => {
      // Find the stored refresh token
      const storedToken = await tx.refreshToken.findUnique({
        where: { tokenHash },
      });
  
      if (!storedToken || storedToken.revokedAt) {
        // Refresh token invalid or reused
        if (storedToken) {
          // Try to revoke session if exists
          const sess = await getSession(storedToken.sessionId);
          if (sess) await revokeSession(storedToken.sessionId, sess.userId);
        }
        throw new ApiError(
          401,
          "Refresh token reuse detected",
          "AUTH_REFRESH_TOKEN_REUSE"
        );
      }
  
  
      let session = await getSession(storedToken.sessionId);
  
      if (!session) {
        // session expired in Redis, but refresh token is valid
        // Recreate session from DB info
        const user = await tx.user.findUnique({ where: { id: storedToken.userId } });
        if (!user) {
          throw new ApiError(404, "User not found", "AUTH_USER_NOT_FOUND");
        }
  
   
        session = await createSession(storedToken.sessionId, {
          sessionId: storedToken.sessionId, 
          userId: storedToken.userId,
          deviceId: session?.deviceId || deviceId,
          userAgent: session?.userAgent || userAgent, 
          ipAddress: session?.ipAddress || ipAddress,
          createdAt: session?.createdAt || Date.now(),
          lastUsedAt: Date.now(),
        });
      }
  
   
      if (session.deviceId !== deviceId) {
        throw new ApiError(403, "Device mismatch", "AUTH_DEVICE_MISMATCH");
      }
  
      // Update lastUsedAt
      await createSession(storedToken.sessionId, {
        ...session,
        lastUsedAt: Date.now(),
      });
  
      // Rotate refresh token
      const newRefreshToken = generateRefreshToken();
      const newToken = await tx.refreshToken.create({
        data: {
          sessionId: storedToken.sessionId,
          userId: storedToken.userId,
          deviceId,
          userAgent,
          ipAddress,
          tokenHash: hashToken(newRefreshToken),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
  
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date(), replacedById: newToken.id },
      });
  
   
      const user = await tx.user.findUnique({ where: { id: session.userId } });
      if (!user) {
        throw new ApiError(404, "User not found", "AUTH_USER_NOT_FOUND");
      }
  
      return {
        accessToken: signAccessToken(user),
        refreshToken: newRefreshToken,
      };
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
  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!storedToken) return;

    const session = await getSession(storedToken.sessionId);
    if (session) await revokeSession(storedToken.sessionId, session.userId);

    await prisma.refreshToken.updateMany({
      where: { sessionId: storedToken.sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ---------------- LOGOUT ALL DEVICES ----------------
  async logoutAll(userId: string) {
    const sessions = await getUserSessions(userId);
    await Promise.all(sessions.map((sId) => revokeSession(sId, userId)));

    await prisma.refreshToken.updateMany({
      where: { sessionId: { in: sessions }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const authService = new AuthService();
