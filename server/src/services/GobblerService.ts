import { randomBytes, randomUUID } from 'crypto';
import { ECONOMY, ERROR_CODES } from '@wurcluego/shared';
import type { HydratedDocument } from 'mongoose';
import { GobblerEncounter } from '../models/GobblerEncounter';
import { User, type IUser } from '../models/User';
import { ClueActivity } from '../models/ClueActivity';
import type { CollectionClaimRepository } from '../repositories/CollectionRepository';
import { AppError } from '../utils/AppError';
import type { BigClueService } from './BigClueService';

type Rng = () => number;
export type SpewLoot = { kind: 'coins' | 'points' | 'jig' | 'cosmetic' | 'nothing'; amount: number; effect?: string };

export class GobblerService {
  constructor(private readonly claims: CollectionClaimRepository, private readonly bigClue: Pick<BigClueService, 'materializePiece'>, private readonly rng: Rng = Math.random) {}

  calculateSpew(): SpewLoot {
    const roll = this.rng();
    if (roll < 0.34) return { kind: 'coins', amount: 5 + Math.floor(this.rng() * 11) };
    if (roll < 0.58) return { kind: 'points', amount: 2 + Math.floor(this.rng() * 5) };
    if (roll < 0.68) return { kind: 'jig', amount: 1 };
    if (roll < 0.86) return { kind: 'cosmetic', amount: 0, effect: 'GOBBLER_MOISTURE' };
    return { kind: 'nothing', amount: 0 };
  }

  async start(user: HydratedDocument<IUser>, targetItemId: string, targetType: 'coin' | 'jig') {
    const encounterId = randomUUID();
    const encounter = await GobblerEncounter.create({ encounterId, userId: user._id, targetItemId, targetType, status: 'active', expiresAt: new Date(Date.now() + 120_000) });
    await Promise.all([
      User.updateOne({ _id: user._id }, { $inc: { gobblerEncounters: 1 } }),
      ClueActivity.create({ userId: user._id, type: 'gobbler_encounter', payload: { encounterId, targetType } }),
    ]);
    return encounter;
  }

  async fire(user: HydratedDocument<IUser>, encounterId: string) {
    const charged = await User.findOneAndUpdate({ _id: user._id, blasterBalls: { $gte: 1 } }, { $inc: { blasterBalls: -1 } }, { new: true });
    if (!charged) throw new AppError(409, ERROR_CODES.insufficient, 'No Blaster Balls remain sufficiently spherical.');
    const encounter = await GobblerEncounter.findOneAndUpdate({ encounterId, userId: user._id, status: { $in: ['active', 'stunned'] }, expiresAt: { $gt: new Date() } }, { $set: { status: 'stunned', stunUntil: new Date(Date.now() + 4_000) } }, { new: true });
    if (!encounter) {
      await User.updateOne({ _id: user._id }, { $inc: { blasterBalls: 1 } });
      throw new AppError(409, ERROR_CODES.conflict, 'The Gobbler is not currently positioned for ballistics.');
    }
    return { encounter, blasterBalls: charged.blasterBalls };
  }

  async gobble(user: HydratedDocument<IUser>, encounterId: string) {
    const encounter = await GobblerEncounter.findOne({ encounterId, userId: user._id, expiresAt: { $gt: new Date() } });
    if (!encounter || encounter.status === 'gobbled') throw new AppError(409, ERROR_CODES.conflict, 'The Gobbler cannot gobble this clue again.');
    if (encounter.stunUntil && encounter.stunUntil > new Date()) throw new AppError(409, 'GOBBLER_TEMPORARILY_HORIZONTAL', 'The Gobbler is stunned and cannot complete gobbling paperwork.');
    const claimed = await this.claims.claim(encounter.targetItemId, user._id, encounter.targetType, 'GOBBLER');
    encounter.status = claimed ? 'gobbled' : 'escaped';
    await encounter.save();
    if (claimed) await ClueActivity.create({ userId: user._id, type: 'gobbler_theft', payload: { encounterId, itemId: encounter.targetItemId } });
    return { gobbled: claimed };
  }

  async spew(user: HydratedDocument<IUser>) {
    const loot = this.calculateSpew();
    const increments: Record<string, number> = { puzzlePoints: -ECONOMY.gobblerSpewCost, gobblerSpews: 1 };
    if (loot.kind === 'coins') increments.clueCoins = loot.amount;
    if (loot.kind === 'points') increments.puzzlePoints += loot.amount;
    if (loot.kind === 'jig') { increments.jickerJigs = 1; increments.piecesDiscovered = 1; }
    const updated = await User.findOneAndUpdate({ _id: user._id, puzzlePoints: { $gte: ECONOMY.gobblerSpewCost } }, { $inc: increments }, { new: true });
    if (!updated) throw new AppError(409, ERROR_CODES.insufficient, 'Gobbler pressure requires additional Puzzle Points.');
    if (loot.kind === 'jig') await this.bigClue.materializePiece(user._id, `spew:${randomBytes(12).toString('hex')}`);
    await ClueActivity.create({ userId: user._id, type: 'gobbler_spew', payload: loot });
    return { loot, user: updated };
  }
}
