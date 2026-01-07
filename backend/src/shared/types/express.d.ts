import type { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import type { RequestContext } from "./auth.types.ts";
import type { Roles } from "../constants/role.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: Roles;
        exp: Date;
      } & JsonWebTokenPayload;
      context?: {
        ipAddress?: string;
        userAgent: string;
        deviceId: string;
      };
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    context: RequestContext;
  }
}

export {};
