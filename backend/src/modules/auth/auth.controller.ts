import { type Request, type Response } from "express";
import { authService } from "./auth.service.js";
import { config } from "../../config/env.js";

const isProduction = config.nodeEnv === "production";

export class AuthController {
  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    // Set access token cookie (7 days default, or from config)
    const accessTokenMaxAge = 7 * 24 * 60 * 60 * 1000;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: accessTokenMaxAge,
      path: "/",
    });

    // Set refresh token cookie (30 days)
    const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: refreshTokenMaxAge,
      path: "/",
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      // Set httpOnly cookies
      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      // Return user data only (tokens are in cookies)
      res.status(200).json({ user: result.user });
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const result = await authService.register(userData);

      // Set httpOnly cookies
      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      // Return user data only (tokens are in cookies)
      res.status(201).json({ user: result.user });
    } catch (error) {
      res.status(400).json({ error: "Registration failed" });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: "Refresh token not found" });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      // Set new httpOnly cookies
      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({ message: "Tokens refreshed successfully" });
    } catch (error) {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  }

  async profile(req: Request, res: Response): Promise<void> {
    try {
      const profile = authService.getProfileFromRequest(req);
      res.status(200).json(profile);
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookies
      this.clearAuthCookies(res);

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      // Clear cookies even if logout fails
      this.clearAuthCookies(res);
      res.status(400).json({ error: "Logout failed" });
    }
  }
}

export const authController = new AuthController();
