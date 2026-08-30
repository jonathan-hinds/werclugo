import { describe, expect, it } from 'vitest';
import { getUnlockState, permittedDestinations } from './unlockMachine';

describe('ceremonial home navigation unlock', () => {
  it('keeps feature routes locked before SELECT MODE', () => { expect(getUnlockState(false, false)).toBe('awaiting-select'); expect(permittedDestinations('awaiting-select')).toEqual([]); });
  it('enables CHOOSE but not routes after SELECT MODE', () => { expect(getUnlockState(true, false)).toBe('awaiting-choose'); expect(permittedDestinations('awaiting-choose')).toEqual([]); });
  it('enables all operations only after CHOOSE', () => { expect(getUnlockState(true, true)).toBe('unlocked'); expect(permittedDestinations('unlocked')).toEqual(['/sniffer', '/exchange', '/big-clue']); });
});
