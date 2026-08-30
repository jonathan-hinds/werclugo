import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ERROR_CODES } from '@wurcluego/shared';
import { UserRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';

const deviceIdSchema = z.string().uuid();
const users = new UserRepository();
export async function anonymousUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = deviceIdSchema.safeParse(req.header('x-device-id'));
    if (!parsed.success) throw new AppError(401, ERROR_CODES.unauthorized, 'A valid anonymous Clue Citizen device seal is required.');
    req.clueUser = await users.findOrCreate(parsed.data);
    next();
  } catch (error) { next(error); }
}
