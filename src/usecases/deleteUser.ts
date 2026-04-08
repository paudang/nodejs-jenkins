import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import cacheService from '@/infrastructure/caching/redisClient';
import logger from '@/infrastructure/log/logger';

export default class DeleteUser {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number | string) {
    const result = await this.userRepository.delete(id);

    try {
      await cacheService.del('users:all');
      logger.info('Invalidated users:all cache');
    } catch (error) {
      logger.error('Cache error (del):', error);
    }

    return result;
  }
}
