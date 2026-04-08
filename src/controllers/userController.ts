import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import User from '@/models/User';
import logger from '@/utils/logger';
import cacheService from '@/config/redisClient';
import { kafkaService } from '@/services/kafkaService';
import { KAFKA_ACTIONS } from '@/utils/kafkaEvents';

export class UserController {
    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await cacheService.getOrSet('users:all', async () => {
                return await User.find();
            }, 60);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const userId = (user as any).id || (user as any)._id;
            await kafkaService.sendMessage('user-topic', JSON.stringify({
                action: KAFKA_ACTIONS.USER_CREATED,
                payload: { id: userId, email: user.email }
            }), userId?.toString() || '');
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
            const updatedUser = await User.findByIdAndUpdate(id, { name, email }, { new: true });
            if (!updatedUser) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
            }
            await cacheService.del('users:all');
            await kafkaService.sendMessage('user-topic', JSON.stringify({
                action: KAFKA_ACTIONS.USER_UPDATED,
                payload: { id, email: updatedUser?.email }
            }), id);
            res.status(HTTP_STATUS.OK).json(updatedUser);
        } catch (error) {
            logger.error(`${ERROR_MESSAGES.UPDATE_USER_ERROR}:`, error);
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const deleted = await User.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
            }
            await cacheService.del('users:all');
            await kafkaService.sendMessage('user-topic', JSON.stringify({
                action: KAFKA_ACTIONS.USER_DELETED,
                payload: { id }
            }), id);
            res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
        } catch (error) {
            logger.error(`${ERROR_MESSAGES.DELETE_USER_ERROR}:`, error);
            next(error);
        }
    }
}
