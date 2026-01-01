/**
 * @fileoverview Tool Permission Store
 * @module lib/state/tool-permission-store
 *
 * Zustand store for tool permission trust levels with Dexie persistence.
 * Replaces in-memory Map-based ToolPermissionManager for cross-session persistence.
 *
 * @epic WB-8.3 - Cross-Workspace Event System
 * @story WB-8.3.1 - Tool Permission Persistence
 * @prio P0 - Critical UX Fix
 *
 * December 2025 Patterns:
 * - Single responsibility (tool permissions only)
 * - Type-safe state with proper TypeScript interfaces
 * - Ephemeral state (sessionTrust) excluded from persistence
 * - Dexie persistence via createDexieStorage adapter
 * - Partialize function for selective field persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from './dexie-storage';

/**
 * Trust level for a tool - determines when user approval is required
 */
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

/**
 * Tool permission state
 *
 * PERSISTED FIELDS:
 * - trustLevels: User-configured trust levels that survive browser restarts
 *
 * EPHEMERAL FIELDS (not persisted):
 * - sessionTrust: Temporary approvals for current session only
 */
export interface ToolPermissionState {
  /** Persisted trust levels for each tool */
  trustLevels: Record<string, ToolTrustLevel>;

  /** Session-based trust (cleared on reload, NOT persisted) */
  sessionTrust: string[];

  /** Actions */
  setTrustLevel: (toolId: string, level: ToolTrustLevel) => void;
  getTrustLevel: (toolId: string) => ToolTrustLevel;
  addSessionTrust: (toolId: string) => void;
  removeSessionTrust: (toolId: string) => void;
  clearSessionTrust: () => void;
  resetToDefaults: () => void;
}

/**
 * Default trust levels for all tools
 *
 * These match the defaults from ToolPermissionManager (tool-permission-manager.ts:71-79)
 */
const defaultTrustLevels: Record<string, ToolTrustLevel> = {
  read_file: 'auto',
  list_files: 'auto',
  read_directory: 'auto',
  write_file: 'prompt',
  create_directory: 'prompt',
  delete_file: 'block',
  execute_command: 'prompt',
};

/**
 * Tool Permission Store
 *
 * Zustand store with Dexie persistence for tool trust levels.
 * Session trust is intentionally ephemeral (not persisted).
 *
 * @example
 * ```tsx
 * function ToolApproval() {
 *   const { trustLevels, setTrustLevel } = useToolPermissionStore();
 *
 *   const handleApprove = (toolId: string) => {
 *     setTrustLevel(toolId, 'auto');
 *   };
 * }
 * ```
 */
export const useToolPermissionStore = create<ToolPermissionState>()(
  persist(
    (set, get) => ({
      // Initial state
      trustLevels: { ...defaultTrustLevels },
      sessionTrust: [],

      /**
       * Set the trust level for a tool (persisted)
       */
      setTrustLevel: (toolId: string, level: ToolTrustLevel) => {
        set((state) => ({
          trustLevels: {
            ...state.trustLevels,
            [toolId]: level,
          },
        }));
      },

      /**
       * Get the trust level for a tool
       * Falls back to 'prompt' if unknown (safe default)
       */
      getTrustLevel: (toolId: string) => {
        return get().trustLevels[toolId] ?? 'prompt';
      },

      /**
       * Add session-based trust for a tool (ephemeral)
       * Cleared on browser reload
       */
      addSessionTrust: (toolId: string) => {
        set((state) => {
          // Avoid duplicates
          if (state.sessionTrust.includes(toolId)) {
            return state;
          }
          return {
            sessionTrust: [...state.sessionTrust, toolId],
          };
        });
      },

      /**
       * Remove session-based trust for a tool
       */
      removeSessionTrust: (toolId: string) => {
        set((state) => ({
          sessionTrust: state.sessionTrust.filter((id) => id !== toolId),
        }));
      },

      /**
       * Clear all session-based trust (ephemeral)
       * Called automatically on page reload
       */
      clearSessionTrust: () => {
        set({ sessionTrust: [] });
      },

      /**
       * Reset all trust levels to defaults
       * Clears both persisted and session trust
       */
      resetToDefaults: () => {
        set({
          trustLevels: { ...defaultTrustLevels },
          sessionTrust: [],
        });
      },
    }),
    {
      name: 'tool-permission-store',
      storage: createJSONStorage(() => createDexieStorage('persistedState')),

      /**
       * Partialize - Selective field persistence
       *
       * CRITICAL: Only persist trustLevels, NOT sessionTrust
       * Session trust is intentionally ephemeral (cleared on reload)
       */
      partialize: (state) => ({
        trustLevels: state.trustLevels,
        // sessionTrust is EXCLUDED from persistence
      }),

      /**
       * Version for future migrations
       */
      version: 1,

      /**
       * Migration function (reserved for future schema changes)
       */
      migrate: (persistedState: any, version: number) => {
        // Future migrations can be handled here
        // Example: if (version === 0) { return { trustLevels: {}, sessionTrust: [] }; }
        return persistedState as ToolPermissionState;
      },
    }
  )
);

/**
 * Selectors for optimized component re-renders
 */

/**
 * Check if a tool needs approval
 * Combines persisted trust level with session trust
 */
export function selectNeedsApproval(toolId: string) {
  return (state: ToolPermissionState): boolean => {
    // Session trust overrides everything
    if (state.sessionTrust.includes(toolId)) {
      return false;
    }

    // Check persisted trust level
    const trustLevel = state.trustLevels[toolId];
    if (trustLevel === 'auto') {
      return false;
    }
    if (trustLevel === 'block') {
      return false; // Blocked tools don't need approval, they're denied
    }

    // 'prompt' or unknown tools need approval
    return true;
  };
}

/**
 * Check if a tool can execute (not blocked)
 */
export function selectCanExecute(toolId: string) {
  return (state: ToolPermissionState): boolean => {
    // Session trust overrides everything
    if (state.sessionTrust.includes(toolId)) {
      return true;
    }

    // Check persisted trust level
    const trustLevel = state.trustLevels[toolId];
    return trustLevel !== 'block';
  };
}

/**
 * Get all tools by trust level
 */
export function selectToolsByLevel(level: ToolTrustLevel) {
  return (state: ToolPermissionState): string[] => {
    return Object.entries(state.trustLevels)
      .filter(([_, trustLevel]) => trustLevel === level)
      .map(([toolId]) => toolId);
  };
}
