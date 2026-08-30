export const ECONOMY = {
  coinsPerPuzzlePoint: 5,
  jigToCoins: 24,
  jigToPuzzlePoints: 7,
  jigAttemptCost: 18,
  jigAttemptSuccessChance: 0.28,
  gobblerSpewCost: 12,
  bigClueLinkReward: 15,
  initialBlasterBalls: 6,
} as const;

export const BIG_CLUE_TOTAL_PIECES = 45_000_000;
export const LOCATION_CELL_PRECISION = 0.001;
export const NEARBY_TIME_WINDOW_MS = 15 * 60 * 1000;

export const ERROR_CODES = {
  validation: 'CLUE_INPUT_UNINTERPRETABLE',
  unauthorized: 'CLUE_CITIZEN_UNRECOGNIZED',
  notFound: 'CLUE_NOT_PRESENT',
  duplicate: 'CLUE_ALREADY_COLLECTED',
  insufficient: 'INSUFFICIENT_CLUE_PRESSURE',
  conflict: 'CLUE_STATE_CONTRADICTION',
  internal: 'MAJOR_CLUE_DISCREPANCY',
} as const;

