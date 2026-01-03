import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  dbUrl?: string | undefined;
  jwtSecret?: string | undefined;
  jwtRefresh?: string | undefined;
  jwtExpiresIn?: string | undefined;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue || "";
}

export const config: Config = {
  nodeEnv: getEnvVar("NODE_ENV", "development"),
  port: parseInt(getEnvVar("PORT", "3000"), 10),
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtRefresh: process.env.JWT_REFRESH,
};
