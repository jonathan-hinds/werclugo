import { ERROR_CODES } from '@wurcluego/shared';
import type { HydratedDocument } from 'mongoose';
import { User, type IUser } from '../models/User';
import { AppError } from '../utils/AppError';

export class UserProgressionService {
  async selectMode(user: HydratedDocument<IUser>) {
    return User.findByIdAndUpdate(user._id, { $set: { modeSelected: true } }, { new: true, runValidators: true });
  }
  async choose(user: HydratedDocument<IUser>) {
    if (!user.modeSelected) throw new AppError(409, ERROR_CODES.conflict, 'SELECT MODE must be selected before CHOOSE may become chosen.');
    return User.findByIdAndUpdate(user._id, { $set: { modeUnlocked: true } }, { new: true, runValidators: true });
  }
}
