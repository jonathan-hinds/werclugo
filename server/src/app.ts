import path from 'path';
import fs from 'fs';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { apiRouter } from './routes/api';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const app = express();
app.disable('x-powered-by');
app.use(pinoHttp({ logger }));
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.nodeEnv === 'production' ? false : env.corsOrigin?.split(',') ?? ['http://localhost:5173'] }));
app.use(compression());
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'possibly-ready', service: 'wurcluego', cluePressure: 'nominal' }));
app.use('/api/v1', apiRouter);

const clientDist = path.resolve(__dirname, '../../client/dist');
if (env.nodeEnv === 'production' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1d', setHeaders: (res, file) => { if (file.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache'); } }));
  app.get('*', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFoundHandler);
app.use(errorHandler);
