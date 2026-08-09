import { create } from 'zustand';
import type { OrbState } from '@/types';

interface OrbStore {
  state: OrbState;
  setState: (state: OrbState) => void;
}

export const useOrbStore = create<OrbStore>((set) => ({
  state: 'idle',
  setState: (state) => set({ state }),
}));
