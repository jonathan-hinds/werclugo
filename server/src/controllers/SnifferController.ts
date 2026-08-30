import type { Request, Response } from 'express';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { CollectedItem } from '../models/CollectedItem';
import type { CollectionService } from '../services/CollectionService';
import type { NearbyGenerationService } from '../services/NearbyGenerationService';

export class SnifferController {
  private readonly users = new UserRepository();
  constructor(private readonly nearby: NearbyGenerationService, private readonly collection: CollectionService) {}
  getNearby = async (req: Request, res: Response): Promise<void> => {
    const { lat, lon } = req.query as unknown as { lat: number; lon: number };
    const generated = this.nearby.generate(lat, lon);
    const claimed = await CollectedItem.find({ userId: req.clueUser!._id, itemId: { $in: generated.map((item) => item.id) } }).select('itemId').lean();
    const unavailable = new Set(claimed.map((item) => item.itemId));
    res.json({ items: generated.filter((item) => !unavailable.has(item.id)), radiusMeters: 91.44, privacy: 'Coordinates are used for cell generation and are not stored.' });
  };
  collect = async (req: Request, res: Response): Promise<void> => {
    const { itemId, lat, lon } = req.body as { itemId: string; lat: number; lon: number };
    const item = await this.collection.collect(req.clueUser!, itemId, lat, lon);
    const user = await User.findById(req.clueUser!._id);
    res.json({ collected: item, profile: this.users.toProfile(user!) });
  };
}
