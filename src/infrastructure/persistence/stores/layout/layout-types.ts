/**
 * @fileoverview Layout Persistence Types
 * @module infrastructure/persistence/stores/layout/layout-types
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * Type definitions for layout persistence
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

import type { PluginId } from '@/domain/types/plugin-types';

/**
 * Persisted activity bar state structure
 */
export interface PersistedActivityBarState {
  plugins: PluginId[];
  activePluginId: PluginId | null;
}

/**
 * Complete persisted layout state for all activity bars
 */
export interface PersistedActivityBarsState {
  left: PersistedActivityBarState;
  mainTop: PersistedActivityBarState;
  right: PersistedActivityBarState;
}

/**
 * Complete persisted layout state
 */
export interface PersistedLayoutState {
  version: number;
  projectId: string;
  activityBars: PersistedActivityBarsState;
  sidebar: {
    isExpanded: boolean;
  };
}

/**
 * Result of state validation
 */
export interface LayoutValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedState?: PersistedLayoutState;
}

/**
 * Result of state migration
 */
export interface LayoutMigrationResult {
  success: boolean;
  state: PersistedLayoutState;
  migratedFrom?: number;
  errors?: string[];
}
