import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ERROR_CODES } from '@wurcluego/shared';
import { AppError } from '../utils/AppError';

export const validate = (schema: ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(new AppError(400, ERROR_CODES.validation, 'The submitted clue shape cannot be interpreted.', result.error.flatten()));
    req[source] = result.data;
    next();
  };
