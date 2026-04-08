import { env } from '@/config/env';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import logger from '@/utils/logger';
import morgan from 'morgan';
import { errorMiddleware } from '@/utils/errorMiddleware';
import { setupGracefulShutdown } from '@/utils/gracefulShutdown';
import healthRoutes from '@/routes/healthRoute';
import apiRoutes from '@/routes/api';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from '@/config/swagger';

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// View Engine Setup
import path from 'path';
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', apiRoutes);
app.get('/', (req: Request, res: Response) => {
  res.render('index', {
    projectName: 'NodeJS Service',
    architecture: 'MVC',
    database: 'MySQL',
    communication: 'REST APIs',
  });
});
app.use('/health', healthRoutes);

// Start Server Logic
const startServer = async () => {
  app.use(errorMiddleware);
  const server = app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });

  setupGracefulShutdown(server);
};

// Database Sync
import sequelize from '@/config/database';
const syncDatabase = async () => {
  let retries = 30;
  while (retries) {
    try {
      await sequelize.sync();
      logger.info('Database synced');
      // Start Server after DB is ready
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
