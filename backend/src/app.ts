import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import syncRoutes from "./modules/sync/sync.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/sync", syncRoutes);
  app.use("/api/tasks", taskRoutes);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}
