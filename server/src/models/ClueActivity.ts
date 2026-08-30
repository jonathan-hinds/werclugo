import { Schema, model, type Types } from 'mongoose';

export type ActivityType = 'coin_collected' | 'jig_collected' | 'gobbler_encounter' | 'gobbler_theft' | 'gobbler_spew' | 'exchange' | 'big_clue_link';
export interface IClueActivity { userId: Types.ObjectId; type: ActivityType; payload: Record<string, unknown>; createdAt: Date }

const activitySchema = new Schema<IClueActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, index: true },
  payload: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 180 },
}, { versionKey: false });

activitySchema.index({ userId: 1, createdAt: -1 });
export const ClueActivity = model<IClueActivity>('ClueActivity', activitySchema);
