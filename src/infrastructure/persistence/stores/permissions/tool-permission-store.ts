/**
 * @fileoverview Tool Permission Store
 * @module infrastructure/persistence/stores/permissions/tool-permission-store
 * @governance ADR-024 State Management Consolidation
 *
 * CANONICAL LOCATION for workspace-scoped tool permission trust levels.
 *
 * Refactored using Slice Pattern (S-014b) to eliminate God Store Anti-Pattern.
 *
 * Architecture:
 * - types.ts (Interfaces)
 * - constants.ts (Default values)
 * - slices/permission-actions-slice.ts (Actions)
 * - selectors.ts (Selectors)
 * - migrations.ts (Schema evolution)
 *
 * @migration-status CANONICAL
 * @last-reviewed 2026-01-05
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import type { ToolPermissionState } from './types';
import {
  createDefaultTrustLevels,
  createDefaultCategoryApprovals,
  DEFAULT_YOLO_MODE
} from './constants';
import { createPermissionActionsSlice } from './slices/permission-actions-slice';
import { migrateToolPermissions } from './migrations';

// Re-export types and selectors for consumers
export * from './types';
export * from './selectors';
export * from './constants';

/**
 * Tool Permission Store
 * Refactored to compose slices
 * 
 * Original God Store (~800 lines) -> Now <100 lines structure
 */
export const useToolPermissionStore = create<ToolPermissionState>()(
  persist(
    (set, get) => ({
      // Initial State
      trustLevels: createDefaultTrustLevels(),
      defaultTrustLevel: 'prompt',
      sessionTrust: [],
      yoloMode: DEFAULT_YOLO_MODE,
      categoryApprovals: createDefaultCategoryApprovals(),
      version: 3,
      _hasHydrated: false,

      // Actions Slice
      // Cast 'set' to match the simpler signature expected by the slice if needed,
      // but usually Zustand types flow through correctly.
      ...createPermissionActionsSlice(set, get),
    }),
    {
      name: 'tool-permission-store',
      storage: createJSONStorage(() => createDexieStorage('agentConfigs')),

      /**
       * Partialize - Selective field persistence
       */
      partialize: (state) => ({
        trustLevels: state.trustLevels,
        defaultTrustLevel: state.defaultTrustLevel,
        version: state.version,
        yoloMode: state.yoloMode,
        categoryApprovals: state.categoryApprovals,
      }),

      version: 3,
      migrate: migrateToolPermissions,

      onRehydrateStorage: () => {
        console.log('[ToolPermissionStore] Hydration starting...');
        return (state, error) => {
          if (error) {
            console.error('[ToolPermissionStore] Hydration error:', error);
          } else if (state) {
            console.log('[ToolPermissionStore] Hydration complete');
            state._hasHydrated = true;

            // Check YOLO expiry
            if (state.yoloMode?.enabled && state.yoloMode?.expiryTime) {
              const now = Date.now();
              if (now > state.yoloMode.expiryTime) {
                state.yoloMode = { ...state.yoloMode, enabled: false, expiryTime: null };
                console.log('[ToolPermissionStore] YOLO mode expired during hydration');
              }
            }

            // Test environment reset
            if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
              if (state.yoloMode?.enabled) {
                state.yoloMode = { ...state.yoloMode, enabled: false, expiryTime: null };
              }
            }
          }
        };
      },
    }
  )
);
