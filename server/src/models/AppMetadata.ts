import { Schema, model } from 'mongoose';
export interface IAppMetadata { key: string; value: Record<string, unknown> }
const schema = new Schema<IAppMetadata>({ key: { type: String, required: true, unique: true }, value: { type: Schema.Types.Mixed, required: true } }, { versionKey: false });
export const AppMetadata = model<IAppMetadata>('AppMetadata', schema);
