import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";

export const generateRefreshToken = () =>
  crypto.randomBytes(64).toString("hex");

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user: { id: string; role: string }) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
