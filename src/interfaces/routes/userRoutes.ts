import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '@/interfaces/controllers/userController';
import { authMiddleware } from '@/infrastructure/webserver/middleware/authMiddleware';

const router = Router();
const userController = new UserController();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  userController.createUser(req, res, next),
);
router.get('/', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  userController.getUsers(req, res, next),
);
router.get('/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  userController.getUserById(req, res, next),
);
router.patch('/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  userController.updateUser(req, res, next),
);
router.delete('/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  userController.deleteUser(req, res, next),
);

export default router;
