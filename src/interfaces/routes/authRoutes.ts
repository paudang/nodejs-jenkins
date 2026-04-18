import { Router } from 'express';
import { AuthController } from '@/interfaces/controllers/auth/authController';
import { authMiddleware } from '@/infrastructure/webserver/middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', authMiddleware, (req, res, next) => authController.logout(req, res, next));

export default router;
