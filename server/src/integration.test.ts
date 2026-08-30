import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import { app } from './app';
import { AppMetadata } from './models/AppMetadata';

describe('empty MongoDB application initialization and API smoke flow', () => {
  let database: MongoMemoryServer;
  const deviceId = randomUUID();

  beforeAll(async () => {
    database = await MongoMemoryServer.create();
    await mongoose.connect(database.getUri(), { dbName: 'wurcluego-empty' });
    await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
    await AppMetadata.updateOne({ key: 'world' }, { $setOnInsert: { key: 'world', value: { schemaVersion: 1, clueSpace: 45_000_000 } } }, { upsert: true });
  }, 120_000);

  afterAll(async () => { await mongoose.disconnect(); await database.stop(); });

  it('creates infrastructure, an anonymous profile, unlock state, and a verified nearby collection', async () => {
    expect(await AppMetadata.exists({ key: 'world' })).toBeTruthy();
    const headers = { 'x-device-id': deviceId };
    const profile = await request(app).get('/api/v1/profile').set(headers).expect(200);
    expect(profile.body.profile.clueCoins).toBe(0);

    await request(app).post('/api/v1/profile/select-mode').set(headers).expect(200);
    const chosen = await request(app).post('/api/v1/profile/choose').set(headers).expect(200);
    expect(chosen.body.profile.modeUnlocked).toBe(true);

    const nearby = await request(app).get('/api/v1/sniffer/nearby?lat=40.7128&lon=-74.006').set(headers).expect(200);
    const coin = nearby.body.items.find((item: { type: string }) => item.type === 'coin');
    const collected = await request(app).post('/api/v1/sniffer/collect').set(headers).send({ itemId: coin.id, lat: 40.7128, lon: -74.006 }).expect(200);
    expect(collected.body.profile.clueCoins).toBe(1);
    await request(app).post('/api/v1/sniffer/collect').set(headers).send({ itemId: coin.id, lat: 40.7128, lon: -74.006 }).expect(409);
    const refreshed = await request(app).get('/api/v1/sniffer/nearby?lat=40.7128&lon=-74.006').set(headers).expect(200);
    expect(refreshed.body.items.some((item: { id: string }) => item.id === coin.id)).toBe(false);
  }, 30_000);
});
