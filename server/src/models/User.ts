import { Schema, model } from 'mongoose';
import { ECONOMY } from '@wurcluego/shared';

export interface IUser {
  deviceIdHash: string;
  displayName: string;
  clueCoins: number;
  puzzlePoints: number;
  jickerJigs: number;
  blasterBalls: number;
  modeSelected: boolean;
  modeUnlocked: boolean;
  gobblerEncounters: number;
  gobblerDefeats: number;
  gobblerSpews: number;
  piecesDiscovered: number;
  piecesLinked: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  deviceIdHash: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true, maxlength: 40 },
  clueCoins: { type: Number, default: 0, min: 0 },
  puzzlePoints: { type: Number, default: 0, min: 0 },
  jickerJigs: { type: Number, default: 0, min: 0 },
  blasterBalls: { type: Number, default: ECONOMY.initialBlasterBalls, min: 0 },
  modeSelected: { type: Boolean, default: false },
  modeUnlocked: { type: Boolean, default: false },
  gobblerEncounters: { type: Number, default: 0, min: 0 },
  gobblerDefeats: { type: Number, default: 0, min: 0 },
  gobblerSpews: { type: Number, default: 0, min: 0 },
  piecesDiscovered: { type: Number, default: 0, min: 0 },
  piecesLinked: { type: Number, default: 0, min: 0 },
}, { timestamps: true, versionKey: false });

export const User = model<IUser>('User', userSchema);
