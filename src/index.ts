import { env } from '@/config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import logger from '@/infrastructure/log/logger';
import morgan from 'morgan';
import { errorMiddleware } from '@/utils/errorMiddleware';
import { setupGracefulShutdown } from '@/utils/gracefulShutdown';
import healthRoutes from '@/interfaces/routes/healthRoute';
import userRoutes from '@/interfaces/routes/userRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from '@/config/swagger';
import { kafkaService } from '@/infrastructure/messaging/kafkaClient';
const app = express();
const port = env.PORT;

// Security Middleware
app.use(helmet());
app.use(hpp());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });
app.use(limiter);

app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use('/api/users', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/health', healthRoutes);

// Start Server Logic
const startServer = async () => {
  app.use(errorMiddleware);
  const server = app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    kafkaService
      .connect()
      .then(async () => {
        logger.info('Kafka connected');
      })
      .catch((err) => {
        logger.error('Failed to connect to Kafka after retries:', (err as Error).message);
      });
  });

  setupGracefulShutdown(server, kafkaService);
};

// Database Sync
import sequelize from '@/infrastructure/database/database';

const syncDatabase = async () => {
  let retries = 30;
  while (retries) {
    try {
      await sequelize.sync();
      logger.info('Database synced');
      await startServer();
      break;
    } catch (error) {
      logger.error('Error syncing database:', error);
      retries -= 1;
      logger.info(`Retries left: ${retries}`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

syncDatabase();
