import { type Request, type Response } from "express";
import { authService } from "./auth.service.js";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: "Registration failed" });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  }
}

export const authController = new AuthController();
