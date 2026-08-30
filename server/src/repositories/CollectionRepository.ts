import type { Types } from 'mongoose';
import { CollectedItem } from '../models/CollectedItem';

export interface CollectionClaimRepository {
  claim(itemId: string, userId: Types.ObjectId, itemType: 'coin' | 'jig', cellId: string): Promise<boolean>;
  release(itemId: string): Promise<void>;
}

export class MongoCollectionRepository implements CollectionClaimRepository {
  async claim(itemId: string, userId: Types.ObjectId, itemType: 'coin' | 'jig', cellId: string): Promise<boolean> {
    try {
      await CollectedItem.create({ itemId, userId, itemType, cellId });
      return true;
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 11000) return false;
      throw error;
    }
  }
  async release(itemId: string): Promise<void> { await CollectedItem.deleteOne({ itemId }); }
}
