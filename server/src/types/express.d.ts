import type { HydratedDocument } from 'mongoose';
import type { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      clueUser?: HydratedDocument<IUser>;
    }
  }
}

export {};
