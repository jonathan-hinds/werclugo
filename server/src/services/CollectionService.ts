import { ERROR_CODES, type NearbyItem } from '@wurcluego/shared';
import type { HydratedDocument } from 'mongoose';
import { User, type IUser } from '../models/User';
import { ClueActivity } from '../models/ClueActivity';
import type { CollectionClaimRepository } from '../repositories/CollectionRepository';
import { AppError } from '../utils/AppError';
import type { NearbyGenerationService } from './NearbyGenerationService';
import type { BigClueService } from './BigClueService';

export class CollectionService {
  constructor(
    private readonly generator: Pick<NearbyGenerationService, 'verify'>,
    private readonly claims: CollectionClaimRepository,
    private readonly bigClue: Pick<BigClueService, 'materializePiece'>,
  ) {}

  async collect(user: HydratedDocument<IUser>, itemId: string, lat: number, lon: number): Promise<NearbyItem> {
    const item = this.generator.verify(itemId, lat, lon);
    if (!item) throw new AppError(400, ERROR_CODES.validation, 'The alleged clue is not generated within this sniffing jurisdiction.');
    if (!(await this.claims.claim(item.id, user._id, item.type, item.cellId))) {
      throw new AppError(409, ERROR_CODES.duplicate, 'This clue has already been collected, interpreted, or bureaucratically absorbed.');
    }
    try {
      const inc = item.type === 'coin' ? { clueCoins: 1 } : { jickerJigs: 1, piecesDiscovered: 1 };
      await User.updateOne({ _id: user._id }, { $inc: inc });
      if (item.type === 'jig') await this.bigClue.materializePiece(user._id, item.id);
      await ClueActivity.create({ userId: user._id, type: item.type === 'coin' ? 'coin_collected' : 'jig_collected', payload: { itemId: item.id, cellId: item.cellId } });
      return item;
    } catch (error) {
      await this.claims.release(item.id);
      throw error;
    }
  }
}
