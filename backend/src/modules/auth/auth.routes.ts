import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authentication } from "../../shared/middleware/auth.middleware.js";

const router = Router();

router.post("/login", (req, res) => authController.login(req, res));
router.post("/register", (req, res) => authController.register(req, res));
router.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res)
);
router.post("/logout", (req, res) => authController.logout(req, res));
router.post("/profile", authentication, (req, res) =>
  authController.profile(req, res)
);

export default router;
