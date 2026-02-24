/**
 * @fileoverview Layout Persistence - Main Export
 * @module infrastructure/persistence/stores/layout/layout-persistence
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * Main export point for layout persistence utilities
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

// Re-export all persistence utilities
export {
  // State validation
  validateActivityBarState,
  validateSidebarState,
  validateLayoutState,
} from './layout-validation';

export {
  // State migration
  migrateLayoutState,
} from './layout-migration';

export {
  // Storage helpers
  loadLayoutState,
  saveLayoutState,
  getLayoutStorageKey,
  clearLayoutState,
} from './layout-storage';

export {
  // Constants
  LAYOUT_STATE_VERSION,
  LAYOUT_STORAGE_KEY_PREFIX,
  DEFAULT_LAYOUT_STORAGE_KEY,
  DEFAULT_LAYOUT_STATE,
  DEFAULT_ACTIVITY_BARS_STATE,
  DEFAULT_SIDEBAR_STATE,
} from './layout-constants';

// Re-export types
export type {
  PersistedActivityBarState,
  PersistedActivityBarsState,
  PersistedLayoutState,
  LayoutValidationResult,
  LayoutMigrationResult,
} from './layout-types';
