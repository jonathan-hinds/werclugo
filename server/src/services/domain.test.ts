import { describe, expect, it } from 'vitest';
import { ECONOMY, ERROR_CODES } from '@wurcluego/shared';
import { ClueEconomyService } from './ClueEconomyService';
import { GobblerService } from './GobblerService';
import { BigClueService } from './BigClueService';
import { CollectionService } from './CollectionService';
import { AppError } from '../utils/AppError';

const inertBigClue = { materializePiece: async () => undefined };
const inertClaims = { claim: async () => true, release: async () => undefined };

describe('Clue economy', () => {
  it('converts whole coin groups into puzzle points', () => {
    const service = new ClueEconomyService(inertBigClue);
    expect(service.quote('coins_to_points', 15)).toEqual({ spend: { clueCoins: 15 }, receive: { puzzlePoints: 3 }, minimum: ECONOMY.coinsPerPuzzlePoint });
  });
  it('prices both destructive Jicker Jig conversions from centralized values', () => {
    const service = new ClueEconomyService(inertBigClue);
    expect(service.quote('jig_to_coins', 2).receive).toEqual({ clueCoins: ECONOMY.jigToCoins * 2 });
    expect(service.quote('jig_to_points', 2).receive).toEqual({ puzzlePoints: ECONOMY.jigToPuzzlePoints * 2 });
  });
});

describe('Gobbler loot', () => {
  it('calculates rewards on the server-side loot table', () => {
    const rolls = [0.1, 0.5];
    const service = new GobblerService(inertClaims, inertBigClue, () => rolls.shift() ?? 0);
    expect(service.calculateSpew()).toEqual({ kind: 'coins', amount: 10 });
  });
  it('can return deliberately nothing', () => {
    const service = new GobblerService(inertClaims, inertBigClue, () => 0.95);
    expect(service.calculateSpew()).toEqual({ kind: 'nothing', amount: 0 });
  });
});

describe('Collection duplicate prevention', () => {
  it('rejects a generated item when the atomic claim repository reports it was already claimed', async () => {
    const item = { id: 'valid-item-id', type: 'coin' as const, cellId: '1:2', window: 1, distanceMeters: 4, bearing: 0, altitude: 0, rarity: 'ordinary' as const };
    const service = new CollectionService({ verify: () => item }, { claim: async () => false, release: async () => undefined }, inertBigClue);
    await expect(service.collect({ _id: 'fake' } as never, item.id, 1, 2)).rejects.toMatchObject<AppError>({ code: ERROR_CODES.duplicate, status: 409 });
  });
});

describe('Big Clue adjacency', () => {
  it('accepts complementary east/west connector signatures and rejects incompatible ones', () => {
    const service = new BigClueService();
    expect(service.areAdjacent({ connectors: { east: 2, west: 1 } }, { connectors: { west: 5, east: 3 } })).toBe(true);
    expect(service.areAdjacent({ connectors: { east: 2, west: 2 } }, { connectors: { west: 2, east: 2 } })).toBe(false);
  });
});
