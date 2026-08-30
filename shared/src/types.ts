export type ItemType = 'coin' | 'jig';
export type ExchangeOperation = 'coins_to_points' | 'jig_to_coins' | 'jig_to_points' | 'points_to_jig_attempt';

export interface Balances {
  clueCoins: number;
  puzzlePoints: number;
  jickerJigs: number;
  blasterBalls: number;
}

export interface UserProfile extends Balances {
  id: string;
  displayName: string;
  modeSelected: boolean;
  modeUnlocked: boolean;
  gobblerEncounters: number;
  gobblerDefeats: number;
  gobblerSpews: number;
  piecesDiscovered: number;
  piecesLinked: number;
  createdAt: string;
  updatedAt: string;
}

export interface NearbyItem {
  id: string;
  type: ItemType;
  distanceMeters: number;
  bearing: number;
  altitude: number;
  rarity: 'ordinary' | 'worrying' | 'historical';
  cellId: string;
  window: number;
}

export interface BigCluePieceDto {
  pieceId: string;
  sequence: number;
  rarity: string;
  weirdness: number;
  connectors: { north: number; east: number; south: number; west: number };
  linked: boolean;
  linkedTo?: string;
}

export interface ApiErrorShape {
  error: { code: string; message: string; details?: unknown };
}
