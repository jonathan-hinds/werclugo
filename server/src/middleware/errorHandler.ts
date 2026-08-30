import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ERROR_CODES } from '@wurcluego/shared';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, ERROR_CODES.notFound, `The requested clue route ${req.path} is not sufficiently present.`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof AppError) {
    if (error.status >= 500) logger.error({ err: error, path: req.path }, 'Known clue discrepancy');
    res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
    return;
  }
  logger.error({ err: error, path: req.path, method: req.method }, 'Unexpected API failure');
  res.status(500).json({ error: { code: ERROR_CODES.internal, message: 'The clue system has become briefly non-clue-compliant.' } });
};
