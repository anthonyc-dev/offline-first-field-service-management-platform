import type { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import type { RequestContext } from "./auth.types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: string;
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
