import type { Roles } from "../constants/role.js";

// JWT payload type
export interface JwtPayload {
  userId: string;
  role: string;
}

// Login input
export interface LoginInput {
  email: string;
  password: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
}

// Register input
export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  phoneNumber: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

// Auth response type
interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

//Request Context type
export interface RequestContext {
  ipAddress: string;
  userAgent: string;
  deviceId: string;
}

export interface AuthPayload {
  userId: string;
  role: Roles;
}
