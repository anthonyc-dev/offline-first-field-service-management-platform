import type { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: string;
        exp: Date;
      } & JsonWebTokenPayload;
    }
  }
}

export {};
