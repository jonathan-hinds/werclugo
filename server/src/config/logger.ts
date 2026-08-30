import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  base: { service: 'wurcluego-api', environment: env.nodeEnv },
  redact: ['req.headers.authorization', 'req.headers.x-device-id', 'mongoUri'],
});
