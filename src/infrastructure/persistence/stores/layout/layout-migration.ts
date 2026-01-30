/**
 * @fileoverview Layout State Migration
 * @module infrastructure/persistence/stores/layout/layout-migration
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * State migration functions for layout persistence
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

import type { PersistedLayoutState, LayoutMigrationResult } from './layout-types';
import { validateLayoutState } from './layout-validation';
import {
  LAYOUT_STATE_VERSION,
  DEFAULT_LAYOUT_STATE,
  DEFAULT_SIDEBAR_STATE,
} from './layout-constants';

/** Local default for single activity bar */
const DEFAULT_SINGLE_BAR_STATE = {
  plugins: [] as string[],
  activePluginId: null as string | null,
};

/**
 * Migrate layout state from older version to current
 */
export function migrateLayoutState(
  state: unknown,
  fromVersion: number
): LayoutMigrationResult {
  // If already at current version, just validate
  if (fromVersion === LAYOUT_STATE_VERSION) {
    const validation = validateLayoutState(state);
    return {
      success: validation.valid,
      state: validation.sanitizedState || DEFAULT_LAYOUT_STATE,
      errors: validation.errors,
    };
  }

  // Migration from version 0 (unversioned) to version 1
  if (fromVersion === 0) {
    const migrated: PersistedLayoutState = {
      version: LAYOUT_STATE_VERSION,
      projectId: '',
      activityBars: {
        left: { plugins: ['filetree'], activePluginId: 'filetree' },
        mainTop: { plugins: ['notes'], activePluginId: 'notes' },
        right: { plugins: ['chat'], activePluginId: 'chat' },
      },
      sidebar: DEFAULT_SIDEBAR_STATE,
    };

    // Try to extract data from old format
    if (state && typeof state === 'object') {
      const s = state as Record<string, unknown>;

      if (s.left || s.mainTop || s.right) {
        migrated.activityBars = {
          left: (s.left as PersistedLayoutState['activityBars']['left']) || DEFAULT_SINGLE_BAR_STATE as PersistedLayoutState['activityBars']['left'],
          mainTop: (s.mainTop as PersistedLayoutState['activityBars']['mainTop']) || DEFAULT_SINGLE_BAR_STATE as PersistedLayoutState['activityBars']['mainTop'],
          right: (s.right as PersistedLayoutState['activityBars']['right']) || DEFAULT_SINGLE_BAR_STATE as PersistedLayoutState['activityBars']['right'],
        };
      }

      if (typeof s.isExpanded === 'boolean') {
        migrated.sidebar.isExpanded = s.isExpanded;
      }
    }

    const validation = validateLayoutState(migrated);
    return {
      success: true,
      state: validation.sanitizedState || migrated,
      migratedFrom: 0,
      errors: validation.errors,
    };
  }

  // Unknown version - return defaults
  console.warn(`[layout-persistence] Unknown state version: ${fromVersion}, using defaults`);
  return {
    success: false,
    state: DEFAULT_LAYOUT_STATE,
    migratedFrom: fromVersion,
    errors: [`Unknown version: ${fromVersion}`],
  };
}
