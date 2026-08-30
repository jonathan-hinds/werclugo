import { createHash } from 'crypto';
import { BIG_CLUE_TOTAL_PIECES, ECONOMY, ERROR_CODES, type BigCluePieceDto } from '@wurcluego/shared';
import type { Types } from 'mongoose';
import { BigCluePiece } from '../models/BigCluePiece';
import { User } from '../models/User';
import { ClueActivity } from '../models/ClueActivity';
import { AppError } from '../utils/AppError';

export class BigClueService {
  connectorsFor(pieceId: string) {
    const bytes = createHash('sha256').update(pieceId).digest();
    return { north: bytes[0] % 7, east: bytes[1] % 7, south: bytes[2] % 7, west: bytes[3] % 7 };
  }

  areAdjacent(a: { connectors: { east: number; west?: number } }, b: { connectors: { east?: number; west: number } }): boolean {
    return (a.connectors.east + b.connectors.west) % 7 === 0 || ((b.connectors.east ?? 0) + (a.connectors.west ?? 0)) % 7 === 0;
  }

  async materializePiece(userId: Types.ObjectId, sourceId: string): Promise<void> {
    const hash = createHash('sha256').update(`jig:${sourceId}`).digest();
    const sequence = hash.readUInt32BE(0) % BIG_CLUE_TOTAL_PIECES;
    const pieceId = `JIG-${sequence.toString(36).toUpperCase()}-${hash.toString('hex').slice(0, 6).toUpperCase()}`;
    await BigCluePiece.updateOne({ pieceId }, { $setOnInsert: {
      pieceId, sequence, discoveredBy: userId, discoveredAt: new Date(), linked: false,
      rarity: hash[5] > 240 ? 'ominous' : hash[5] > 180 ? 'irregular' : 'municipal',
      weirdness: hash[6] % 101, connectors: this.connectorsFor(pieceId),
    } }, { upsert: true });
  }

  toDto(piece: { pieceId: string; sequence: number; rarity: string; weirdness: number; connectors: BigCluePieceDto['connectors']; linked: boolean; linkedTo?: string }): BigCluePieceDto {
    return { pieceId: piece.pieceId, sequence: piece.sequence, rarity: piece.rarity, weirdness: piece.weirdness, connectors: piece.connectors, linked: piece.linked, linkedTo: piece.linkedTo };
  }

  async piecesFor(userId: Types.ObjectId): Promise<BigCluePieceDto[]> {
    const pieces = await BigCluePiece.find({ discoveredBy: userId }).sort({ discoveredAt: -1 }).limit(40).lean();
    return pieces.map((piece) => this.toDto(piece));
  }

  async status() {
    const [discovered, linked] = await Promise.all([BigCluePiece.countDocuments(), BigCluePiece.countDocuments({ linked: true })]);
    return { totalPieces: BIG_CLUE_TOTAL_PIECES, discovered, linked, percentage: (linked / BIG_CLUE_TOTAL_PIECES) * 100, coherence: Math.min(99.999, 2.7 + Math.log10(linked + 1) * 4.2) };
  }

  async link(userId: Types.ObjectId, firstId: string, secondId: string) {
    if (firstId === secondId) throw new AppError(409, ERROR_CODES.conflict, 'A Jig cannot be adjacent to itself while also being itself.');
    const [first, second] = await Promise.all([BigCluePiece.findOne({ pieceId: firstId, discoveredBy: userId }), BigCluePiece.findOne({ pieceId: secondId, discoveredBy: userId })]);
    if (!first || !second) throw new AppError(404, ERROR_CODES.notFound, 'One or more Jigs have ceased belonging to your immediate clue authority.');
    if (first.linked || second.linked) throw new AppError(409, ERROR_CODES.conflict, 'At least one Jig has already been made adjacent elsewhere.');
    if (!this.areAdjacent(first, second)) return { linked: false, reason: 'CONNECTOR TEMPERATURES DISAGREE' };

    const updated = await BigCluePiece.updateMany({ _id: { $in: [first._id, second._id] }, linked: false }, { $set: { linked: true, linkedBy: userId, linkedAt: new Date() } });
    if (updated.modifiedCount !== 2) throw new AppError(409, ERROR_CODES.conflict, 'The global Jig shifted during adjacency approval.');
    await Promise.all([
      BigCluePiece.updateOne({ _id: first._id }, { $set: { linkedTo: second.pieceId } }),
      BigCluePiece.updateOne({ _id: second._id }, { $set: { linkedTo: first.pieceId } }),
      User.updateOne({ _id: userId }, { $inc: { clueCoins: ECONOMY.bigClueLinkReward, jickerJigs: -2, piecesLinked: 2 } }),
      ClueActivity.create({ userId, type: 'big_clue_link', payload: { firstId, secondId, reward: ECONOMY.bigClueLinkReward } }),
    ]);
    return { linked: true, reward: ECONOMY.bigClueLinkReward };
  }
}
