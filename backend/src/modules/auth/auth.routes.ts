import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authentication } from "../../shared/middleware/auth.middleware.js";
import { rateLimiter } from "../../shared/middleware/rateLimiter.middleware.js";

const router = Router();

// Public routes
router.post(
  "/login",
  rateLimiter({ window: 60, limit: 5 }),
  authController.login.bind(authController)
);
router.post(
  "/register",
  rateLimiter({ window: 60, limit: 5 }),
  authController.register.bind(authController)
);
router.post(
  "/refresh-token",
  rateLimiter({ window: 60, limit: 20 }),
  authController.refreshToken.bind(authController)
);

// Protected routes
router.post(
  "/profile",
  authentication,
  rateLimiter({ window: 60, limit: 20 }),
  authController.profile.bind(authController)
);

// Logout all
router.post(
  "/logout-all",
  authentication,
  authController.logoutAll.bind(authController)
);

// Logout
router.post("/logout", authController.logout.bind(authController));

export default router;
