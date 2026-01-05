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
  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid email or password");

    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
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

  // ---------------- REGISTER ----------------
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { fullName, email, password, role = "user", phoneNumber } = input;

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
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = hashToken(oldRefreshToken);

    // Find token in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new Error("Invalid refresh token");
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate new access token
    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
    });
    if (!user) throw new Error("User not found");

    const accessToken = signAccessToken(user);

    return { accessToken, refreshToken: newRefreshToken };
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
      where: { tokenHash: hashToken(refreshToken) },
      data: { revokedAt: new Date() },
    });
  }
}

export const authService = new AuthService();
