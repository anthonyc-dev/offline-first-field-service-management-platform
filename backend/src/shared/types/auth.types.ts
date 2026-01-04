// JWT payload type
export interface JwtPayload {
  userId: string;
  role: string;
}

// Login input
export interface LoginInput {
  email: string;
  password: string;
}

// Register input
export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  phoneNumber: string;
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
