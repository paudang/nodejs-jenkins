import dotenv from 'dotenv';
import { z } from 'zod';
import logger from '@/infrastructure/log/logger';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.string().transform(Number),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  KAFKA_BROKER: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('your-secret-refresh-key'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  if (process.env.NODE_ENV !== 'test') {
    logger.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
  }
  logger.warn('⚠️ Environment validation failed. Continuing in test mode.');
}

export const env = (_env.success ? _env.data : process.env) as unknown as z.infer<typeof envSchema>;
