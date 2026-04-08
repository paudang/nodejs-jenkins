import { User } from '@/domain/user';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import cacheService from '@/infrastructure/caching/redisClient';
import logger from '@/infrastructure/log/logger';

export default class UpdateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number | string, data: { name?: string; email?: string }) {
    const updatedUser = await this.userRepository.update(id, data);

    try {
      await cacheService.del('users:all');
      logger.info('Invalidated users:all cache');
    } catch (error) {
      logger.error('Cache error (del):', error);
    }

    return updatedUser;
  }
}
