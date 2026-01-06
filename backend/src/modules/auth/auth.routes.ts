import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authentication } from "../../shared/middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));

// Protected routes
router.post(
  "/profile",
  authentication,
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
