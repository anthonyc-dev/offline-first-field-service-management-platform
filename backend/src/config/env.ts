import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  dbUrl?: string | undefined;
  jwtSecret: string;
  jwtRefresh?: string | undefined;
  jwtExpiresIn: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue || "";
}

export const config: Config = {
  nodeEnv: getEnvVar("NODE_ENV"),
  port: parseInt(getEnvVar("PORT")),
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: getEnvVar("JWT_SECRET"),
  jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN", "7d"),
  jwtRefresh: process.env.JWT_REFRESH,
};
