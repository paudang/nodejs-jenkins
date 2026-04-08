import { ERROR_MESSAGES } from '@/utils/errorMessages';
import User from '@/models/User';
import logger from '@/utils/logger';

export class UserController {
    async getUsers() {
        try {
            const users = await User.findAll();
            return users;
        } catch (error) {
            logger.error(`${ERROR_MESSAGES.FETCH_USERS_ERROR}:`, error);
            throw error;
        }
    }

    async createUser(data: { name: string, email: string }) {
        try {
            const { name, email } = data;
            const user = await User.create({ name, email });
            return user;
        } catch (error) {
            logger.error(`${ERROR_MESSAGES.CREATE_USER_ERROR}:`, error);
            throw error;
        }
    }

    async updateUser(id: string, data: { name?: string, email?: string }) {
        try {
            const user = await User.findByPk(id);
            if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
            await user.update(data);
            const updatedUser = user;
            return updatedUser;
        } catch (error) {
            logger.error(`${ERROR_MESSAGES.UPDATE_USER_ERROR}:`, error);
            throw error;
        }
    }

    async deleteUser(id: string) {
        try {
            const user = await User.findByPk(id);
            if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
            await user.destroy();
            return true;
        } catch (error) {
            logger.error(`${ERROR_MESSAGES.DELETE_USER_ERROR}:`, error);
            throw error;
        }
    }
}
