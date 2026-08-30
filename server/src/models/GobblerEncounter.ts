import { Schema, model, type Types } from 'mongoose';

export interface IGobblerEncounter {
  encounterId: string;
  userId: Types.ObjectId;
  targetItemId: string;
  targetType: 'coin' | 'jig';
  status: 'active' | 'stunned' | 'gobbled' | 'escaped';
  stunUntil?: Date;
  createdAt: Date;
  expiresAt: Date;
}

const encounterSchema = new Schema<IGobblerEncounter>({
  encounterId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetItemId: { type: String, required: true },
  targetType: { type: String, enum: ['coin', 'jig'], required: true },
  status: { type: String, enum: ['active', 'stunned', 'gobbled', 'escaped'], default: 'active' },
  stunUntil: Date,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { versionKey: false });

export const GobblerEncounter = model<IGobblerEncounter>('GobblerEncounter', encounterSchema);
