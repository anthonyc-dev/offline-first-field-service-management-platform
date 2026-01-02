import { Router } from 'express';
import { authController } from './auth.controller.js';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

export default router;

