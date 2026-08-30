import { create } from 'zustand';
import type { UserProfile } from '@wurcluego/shared';
import { api } from '../api/client';

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  selectMode: () => Promise<void>;
  choose: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null, loading: true, error: null,
  setProfile: (profile) => set({ profile }),
  load: async () => { set({ loading: true, error: null }); try { const { profile } = await api<{ profile: UserProfile }>('/profile'); set({ profile, loading: false }); } catch (error) { set({ loading: false, error: error instanceof Error ? error.message : 'Clue profile unavailable' }); } },
  selectMode: async () => { const { profile } = await api<{ profile: UserProfile }>('/profile/select-mode', { method: 'POST' }); set({ profile }); },
  choose: async () => { const { profile } = await api<{ profile: UserProfile }>('/profile/choose', { method: 'POST' }); set({ profile }); },
}));
