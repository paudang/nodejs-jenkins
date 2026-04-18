import { User } from '@/domain/user';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import cacheService from '@/infrastructure/caching/redisClient';
import logger from '@/infrastructure/log/logger';

export default class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string, password?: string) {
    let finalPassword = password;
    if (password) {
      finalPassword = await bcrypt.hash(password, 10);
    }
    const user = new User(null, name, email, finalPassword);
    const savedUser = await this.userRepository.save(user);

    try {
      await cacheService.del('users:all');
      logger.info('Invalidated users:all cache');
    } catch (error) {
      logger.error('Cache error (del):', error);
    }

    return savedUser;
  }
}
