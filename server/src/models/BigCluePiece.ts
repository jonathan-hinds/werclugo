import { Schema, model, type Types } from 'mongoose';

export interface IBigCluePiece {
  pieceId: string;
  sequence: number;
  discoveredBy: Types.ObjectId;
  discoveredAt: Date;
  linked: boolean;
  linkedTo?: string;
  linkedBy?: Types.ObjectId;
  linkedAt?: Date;
  rarity: string;
  weirdness: number;
  connectors: { north: number; east: number; south: number; west: number };
}

const pieceSchema = new Schema<IBigCluePiece>({
  pieceId: { type: String, required: true, unique: true, index: true },
  sequence: { type: Number, required: true, min: 0, max: 44_999_999, index: true },
  discoveredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  discoveredAt: { type: Date, default: Date.now },
  linked: { type: Boolean, default: false, index: true },
  linkedTo: String,
  linkedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  linkedAt: Date,
  rarity: { type: String, required: true },
  weirdness: { type: Number, required: true, min: 0, max: 100 },
  connectors: {
    north: { type: Number, required: true },
    east: { type: Number, required: true },
    south: { type: Number, required: true },
    west: { type: Number, required: true },
  },
}, { versionKey: false });

pieceSchema.index({ discoveredBy: 1, linked: 1 });
export const BigCluePiece = model<IBigCluePiece>('BigCluePiece', pieceSchema);
