export type UnlockState = 'awaiting-select' | 'awaiting-choose' | 'unlocked';
export function getUnlockState(modeSelected: boolean, modeUnlocked: boolean): UnlockState {
  if (modeUnlocked) return 'unlocked';
  if (modeSelected) return 'awaiting-choose';
  return 'awaiting-select';
}

export function permittedDestinations(state: UnlockState): string[] {
  return state === 'unlocked' ? ['/sniffer', '/exchange', '/big-clue'] : [];
}
