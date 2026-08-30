import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';
import { AppMetadata } from '../models/AppMetadata';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10_000 });
    await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
    await AppMetadata.updateOne(
      { key: 'world' },
      { $setOnInsert: { key: 'world', value: { schemaVersion: 1, clueSpace: 45_000_000 } } },
      { upsert: true },
    );
    logger.info({ database: mongoose.connection.name }, 'MongoDB connected and clue indexes synchronized');
  } catch (error) {
    logger.fatal({ err: error }, 'MongoDB connection failed; verify MONGODB_URI and network access');
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
