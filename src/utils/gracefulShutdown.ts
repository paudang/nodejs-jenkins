import { Server } from 'http';
import logger from '@/infrastructure/log/logger';
import mongoose from 'mongoose';
import redisService from '@/infrastructure/caching/redisClient';

export const setupGracefulShutdown = (
  server: Server,
  kafkaService: { disconnect: () => Promise<void> },
) => {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async (err: Error | undefined) => {
      if (err) {
        logger.error('Error closing HTTP server:', err);
        process.exit(1);
      }
      logger.info('HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed.');
        await redisService.quit();
        logger.info('Redis connection closed.');
        await kafkaService.disconnect();
        logger.info('Kafka connection closed.');
        logger.info('Graceful shutdown fully completed.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown:', err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 15000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};
