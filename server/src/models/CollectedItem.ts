import { Schema, model, type Types } from 'mongoose';

export interface ICollectedItem { itemId: string; userId: Types.ObjectId; itemType: 'coin' | 'jig'; cellId: string; collectedAt: Date }
const collectedSchema = new Schema<ICollectedItem>({
  itemId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemType: { type: String, enum: ['coin', 'jig'], required: true },
  cellId: { type: String, required: true },
  collectedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
}, { versionKey: false });

collectedSchema.index({ userId: 1, itemId: 1 }, { unique: true });
export const CollectedItem = model<ICollectedItem>('CollectedItem', collectedSchema);
