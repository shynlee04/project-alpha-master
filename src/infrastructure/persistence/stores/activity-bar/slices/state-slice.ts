/**
 * @fileoverview Activity Bar State Slice
 * @module infrastructure/persistence/stores/activity-bar/slices/state-slice
 */

import type { StateCreator } from 'zustand';
import type {
  ActivityBarPosition,
  ActivityBarsState,
} from '@/presentation/components/layout/activity-bar-types';

export interface ActivityBarStateSlice extends ActivityBarsState {
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  resetToDefaults: () => void;
}

const defaultState: ActivityBarsState = {
  left: { plugins: ['filetree'], activePluginId: 'filetree' },
  mainTop: { plugins: ['notes'], activePluginId: 'notes' },
  right: { plugins: ['chat'], activePluginId: 'chat' },
};

function getBarKey(position: ActivityBarPosition): keyof ActivityBarsState {
  switch (position) {
    case 'left': return 'left';
    case 'main-top': return 'mainTop';
    case 'right': return 'right';
    default: return 'left';
  }
}

export const createStateSlice: StateCreator<
  ActivityBarStateSlice,
  [],
  [],
  ActivityBarStateSlice
> = (set) => ({
  _hasHydrated: false,
  ...defaultState,

  setHasHydrated: (value) => set({ _hasHydrated: value }),
  resetToDefaults: () => set({ ...defaultState }),
});

export { getBarKey, defaultState };
