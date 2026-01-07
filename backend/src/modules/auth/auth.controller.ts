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

      const { deviceId, userAgent, ipAddress } = req.context;

      const result = await authService.login({
        email,
        password,
        deviceId,
        userAgent,
        ipAddress,
      });

      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({ user: result.user });
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: "Invalid credentials" });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, password, phoneNumber } = req.body;
      const { deviceId, userAgent, ipAddress } = req.context;

      const userData = {
        fullName,
        email,
        password,
        phoneNumber,
        deviceId,
        userAgent,
        ipAddress,
      };
      const result = await authService.register(userData);

      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(201).json({ user: result.user });
    } catch (error) {
      console.error(error);
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

      const { deviceId } = req.context;

      const result = await authService.refreshToken(refreshToken, deviceId);

      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({ message: "Tokens refreshed successfully" });
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: "Invalid refresh token" });
    }
  }

  async profile(req: Request, res: Response): Promise<void> {
    try {
      const profile = authService.getProfileFromRequest(req);
      res.status(200).json(profile);
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: "Unauthorized" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      this.clearAuthCookies(res);

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error(error);
      this.clearAuthCookies(res);
      res.status(400).json({ error: "Logout failed" });
    }
  }

  async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await authService.logoutAll(userId);

      this.clearAuthCookies(res);

      res
        .status(200)
        .json({ message: "Logged out from all devices successfully" });
    } catch (error) {
      console.error(error);
      this.clearAuthCookies(res);
      res.status(400).json({ error: "Logout all devices failed" });
    }
  }
}

export const authController = new AuthController();
