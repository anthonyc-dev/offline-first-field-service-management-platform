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
export interface AuthResponse {
  token: string;
  user: Omit<
    {
      id: string;
      fullName: string;
      email: string;
      password: string;
      role: string;
      phoneNumber: string;
      createdAt: Date;
      updatedAt: Date;
    },
    "password"
  >;
}
