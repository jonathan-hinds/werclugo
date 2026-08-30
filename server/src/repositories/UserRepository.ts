import { createHash } from 'crypto';
import { User, type IUser } from '../models/User';

export class UserRepository {
  static hashDeviceId(deviceId: string): string { return createHash('sha256').update(deviceId).digest('hex'); }

  async findOrCreate(deviceId: string) {
    const hash = UserRepository.hashDeviceId(deviceId);
    const suffix = hash.slice(0, 4).toUpperCase();
    return User.findOneAndUpdate(
      { deviceIdHash: hash },
      { $setOnInsert: { deviceIdHash: hash, displayName: `CLUE CITIZEN ${suffix}` } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  toProfile(user: IUser & { _id?: unknown }) {
    return {
      id: String(user._id), displayName: user.displayName,
      clueCoins: user.clueCoins, puzzlePoints: user.puzzlePoints, jickerJigs: user.jickerJigs, blasterBalls: user.blasterBalls,
      modeSelected: user.modeSelected, modeUnlocked: user.modeUnlocked,
      gobblerEncounters: user.gobblerEncounters, gobblerDefeats: user.gobblerDefeats, gobblerSpews: user.gobblerSpews,
      piecesDiscovered: user.piecesDiscovered, piecesLinked: user.piecesLinked,
      createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
    };
  }
}
