import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import { config } from "../../config/env.js";
import type {
  AuthResponse,
  JwtPayload,
  LoginInput,
  RegisterInput,
} from "../../shared/types/auth.types.js";

export class AuthService {
  // ---------------- LOGIN ----------------
  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid email or password");

    if (!config.jwtSecret) throw new Error("JWT secret is not configured");
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    const { password: _, ...userData } = user;
    return { token, user: userData };
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

    if (!config.jwtSecret) throw new Error("JWT secret is not configured");
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    const { password: _, ...userData } = user;
    return { token, user: userData };
  }

  // ---------------- REFRESH TOKEN ----------------
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      if (!config.jwtRefresh)
        throw new Error("JWT refresh secret is not configured");
      const payload = jwt.verify(refreshToken, config.jwtRefresh) as JwtPayload;

      if (!config.jwtSecret) throw new Error("JWT secret is not configured");
      const token = jwt.sign(
        { userId: payload.userId, role: payload.role },
        config.jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      return { token };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }
}

export const authService = new AuthService();
