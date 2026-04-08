import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import User from '@/models/User';
import logger from '@/utils/logger';
import cacheService from '@/config/redisClient';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await cacheService.getOrSet(
        'users:all',
        async () => {
          return await User.findAll();
        },
        60,
      );
      res.json(users);
    } catch (error) {
      logger.error(`${ERROR_MESSAGES.FETCH_USERS_ERROR}:`, error);
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body || {};
      const user = await User.create({ name, email });
      await cacheService.del('users:all');
      res.status(HTTP_STATUS.CREATED).json(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email } = req.body || {};
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      await user.update({ name, email });
      const updatedUser = user;
      await cacheService.del('users:all');
      res.status(HTTP_STATUS.OK).json(updatedUser);
    } catch (error) {
      logger.error(`${ERROR_MESSAGES.UPDATE_USER_ERROR}:`, error);
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      await user.destroy();
      await cacheService.del('users:all');
      res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
      logger.error(`${ERROR_MESSAGES.DELETE_USER_ERROR}:`, error);
      next(error);
    }
  }
}
