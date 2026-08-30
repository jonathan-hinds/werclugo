import { randomBytes } from 'crypto';
import { ECONOMY, ERROR_CODES, type ExchangeOperation } from '@wurcluego/shared';
import type { HydratedDocument } from 'mongoose';
import { User, type IUser } from '../models/User';
import { BigCluePiece } from '../models/BigCluePiece';
import { ClueActivity } from '../models/ClueActivity';
import { AppError } from '../utils/AppError';
import type { BigClueService } from './BigClueService';

type Rng = () => number;
export class ClueEconomyService {
  constructor(private readonly bigClue: Pick<BigClueService, 'materializePiece'>, private readonly rng: Rng = Math.random) {}

  quote(operation: ExchangeOperation, amount: number) {
    if (!Number.isInteger(amount) || amount < 1) throw new AppError(400, ERROR_CODES.validation, 'Exchange quantity must be a positive whole clue number.');
    switch (operation) {
      case 'coins_to_points': return { spend: { clueCoins: amount }, receive: { puzzlePoints: Math.floor(amount / ECONOMY.coinsPerPuzzlePoint) }, minimum: ECONOMY.coinsPerPuzzlePoint };
      case 'jig_to_coins': return { spend: { jickerJigs: amount }, receive: { clueCoins: amount * ECONOMY.jigToCoins } };
      case 'jig_to_points': return { spend: { jickerJigs: amount }, receive: { puzzlePoints: amount * ECONOMY.jigToPuzzlePoints } };
      case 'points_to_jig_attempt': return { spend: { puzzlePoints: amount * ECONOMY.jigAttemptCost }, receive: { jigAttempts: amount } };
    }
  }

  async exchange(user: HydratedDocument<IUser>, operation: ExchangeOperation, amount: number) {
    const quote = this.quote(operation, amount);
    if (operation === 'coins_to_points' && (quote.receive.puzzlePoints ?? 0) < 1) throw new AppError(400, ERROR_CODES.validation, `At least ${ECONOMY.coinsPerPuzzlePoint} coins must enter the interpretation chamber.`);
    const spendEntries = Object.entries(quote.spend);
    const filter: Record<string, unknown> = { _id: user._id };
    const increments: Record<string, number> = {};
    for (const [currency, value] of spendEntries) { filter[currency] = { $gte: value }; increments[currency] = -value; }

    let acquiredJigs = 0;
    if (operation === 'points_to_jig_attempt') {
      for (let i = 0; i < amount; i += 1) if (this.rng() < ECONOMY.jigAttemptSuccessChance) acquiredJigs += 1;
      increments.jickerJigs = acquiredJigs;
      increments.piecesDiscovered = acquiredJigs;
    } else {
      for (const [currency, value] of Object.entries(quote.receive)) if (currency !== 'jigAttempts') increments[currency] = value;
    }
    const result = await User.findOneAndUpdate(filter, { $inc: increments }, { new: true });
    if (!result) throw new AppError(409, ERROR_CODES.insufficient, 'The account lacks the required pre-exchange clue pressure.');

    if (operation.startsWith('jig_to_')) {
      const consumed = await BigCluePiece.find({ discoveredBy: user._id, linked: false }).sort({ discoveredAt: 1 }).limit(amount).select('_id').lean();
      await BigCluePiece.deleteMany({ _id: { $in: consumed.map((piece) => piece._id) } });
    }
    if (acquiredJigs) {
      await Promise.all(Array.from({ length: acquiredJigs }, () => this.bigClue.materializePiece(user._id, `redeemed:${randomBytes(12).toString('hex')}`)));
    }
    await ClueActivity.create({ userId: user._id, type: 'exchange', payload: { operation, amount, acquiredJigs } });
    return { user: result, quote, acquiredJigs };
  }
}
