import http from 'http';
import { app } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

async function main(): Promise<void> {
  await connectDatabase();
  const server = http.createServer(app);
  server.listen(env.port, '0.0.0.0', () => logger.info({ port: env.port }, 'Wurcluego clue system listening'));
  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Beginning controlled de-cluing');
    server.close(() => void disconnectDatabase().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

void main().catch((error) => { logger.fatal({ err: error }, 'Application startup failed'); process.exit(1); });
