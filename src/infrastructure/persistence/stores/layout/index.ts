/**
 * @fileoverview Layout Stores Index
 * @module infrastructure/persistence/stores/layout
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * Central export point for all layout-related stores
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

// Sidebar store
export {
  useSidebarStore,
  hydrateSidebarStore,
  getSidebarWidth,
  shouldAutoCollapse,
} from './sidebar-store';

// Re-export sidebar types
export type {
  SidebarState,
  SidebarActions,
  SidebarStore,
  PersistedSidebarState,
} from '@/presentation/components/layout/types';

// Layout persistence utilities
export {
  // State validation
  validateActivityBarState,
  validateSidebarState,
  validateLayoutState,
  // State migration
  migrateLayoutState,
  // Storage helpers
  getLayoutStorageKey,
  clearLayoutState,
  // Constants
  LAYOUT_STATE_VERSION,
  LAYOUT_STORAGE_KEY_PREFIX,
} from './layout-persistence';

// Types for layout persistence
export type {
  PersistedActivityBarState,
  PersistedLayoutState,
  LayoutValidationResult,
  LayoutMigrationResult,
} from './layout-persistence';
