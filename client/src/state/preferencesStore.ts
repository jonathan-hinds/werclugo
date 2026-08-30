import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const scannerEffects = ['Clue Vision', 'Hyper Clue', 'Gobbler Contrast', 'Jig Phase', 'Coin Thermal', 'Wet Radar', 'Wrong Spectrum', 'Evidence Bloom', 'Uncertain Night Vision'] as const;
interface PreferencesState {
  muted: boolean;
  effects: string[];
  quality: 'adaptive' | 'restrained';
  toggleMute: () => void;
  toggleEffect: (effect: string) => void;
  setQuality: (quality: 'adaptive' | 'restrained') => void;
}
export const usePreferencesStore = create<PreferencesState>()(persist((set) => ({
  muted: false, effects: ['Clue Vision'], quality: 'adaptive',
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  toggleEffect: (effect) => set((state) => ({ effects: state.effects.includes(effect) ? state.effects.filter((entry) => entry !== effect) : [...state.effects, effect].slice(-5) })),
  setQuality: (quality) => set({ quality }),
}), { name: 'wurcluego-device-preferences' }));
