/**
 * @fileoverview Layout Persistence Constants
 * @module infrastructure/persistence/stores/layout/layout-constants
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * Constants and default states for layout persistence
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

import type { PersistedLayoutState, PersistedActivityBarsState } from './layout-types';

/** Current layout state version for migrations */
export const LAYOUT_STATE_VERSION = 1;

/** localStorage key prefix for layout state */
export const LAYOUT_STORAGE_KEY_PREFIX = 'viagent-layout';

/** Default storage key when no project is active */
export const DEFAULT_LAYOUT_STORAGE_KEY = `${LAYOUT_STORAGE_KEY_PREFIX}-default`;

/** Default activity bars state */
export const DEFAULT_ACTIVITY_BARS_STATE: PersistedActivityBarsState = {
  left: { plugins: ['filetree'], activePluginId: 'filetree' },
  mainTop: { plugins: ['notes'], activePluginId: 'notes' },
  right: { plugins: ['chat'], activePluginId: 'chat' },
};

/** Default sidebar state */
export const DEFAULT_SIDEBAR_STATE = {
  isExpanded: true,
};

/** Default complete layout state */
export const DEFAULT_LAYOUT_STATE: PersistedLayoutState = {
  version: LAYOUT_STATE_VERSION,
  projectId: '',
  activityBars: DEFAULT_ACTIVITY_BARS_STATE,
  sidebar: DEFAULT_SIDEBAR_STATE,
};
