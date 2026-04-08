import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/utils/httpCodes';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import CreateUser from '@/usecases/createUser';
import GetAllUsers from '@/usecases/getAllUsers';
import UpdateUser from '@/usecases/updateUser';
import DeleteUser from '@/usecases/deleteUser';
import logger from '@/infrastructure/log/logger';
import { kafkaService } from '@/infrastructure/messaging/kafkaClient';
import { KAFKA_ACTIONS } from '@/utils/kafkaEvents';

export class UserController {
  private createUserUseCase: CreateUser;
  private getAllUsersUseCase: GetAllUsers;
  private updateUserUseCase: UpdateUser;
  private deleteUserUseCase: DeleteUser;

  constructor() {
    const userRepository = new UserRepository();
    this.createUserUseCase = new CreateUser(userRepository);
    this.getAllUsersUseCase = new GetAllUsers(userRepository);
    this.updateUserUseCase = new UpdateUser(userRepository);
    this.deleteUserUseCase = new DeleteUser(userRepository);
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body || {};
      const user = await this.createUserUseCase.execute(name, email);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (user as any).id || (user as any)._id;
      await kafkaService.sendMessage(
        'user-topic',
        JSON.stringify({
          action: KAFKA_ACTIONS.USER_CREATED,
          payload: { id: userId, email: user.email },
        }),
        userId?.toString() || '',
      );
      res.status(HTTP_STATUS.CREATED).json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`${ERROR_MESSAGES.CREATE_USER_ERROR}:`, message);
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.getAllUsersUseCase.execute();
      res.json(users);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`${ERROR_MESSAGES.FETCH_USERS_ERROR}:`, message);
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email } = req.body || {};
      const user = await this.updateUserUseCase.execute(id, { name, email });
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      await kafkaService.sendMessage(
        'user-topic',
        JSON.stringify({
          action: KAFKA_ACTIONS.USER_UPDATED,
          payload: { id, email: user.email },
        }),
        id,
      );
      res.json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`${ERROR_MESSAGES.UPDATE_USER_ERROR}:`, message);
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await this.deleteUserUseCase.execute(id);
      if (!deleted) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }
      await kafkaService.sendMessage(
        'user-topic',
        JSON.stringify({
          action: KAFKA_ACTIONS.USER_DELETED,
          payload: { id },
        }),
        id,
      );
      res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`${ERROR_MESSAGES.DELETE_USER_ERROR}:`, message);
      next(error);
    }
  }
}
