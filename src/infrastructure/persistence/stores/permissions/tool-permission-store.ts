/**
 * @fileoverview Tool Permission Store
 * @module infrastructure/persistence/stores/permissions/tool-permission-store
 * @governance ADR-024 State Management Consolidation, Epic 53
 *
 * CANONICAL LOCATION for workspace-scoped tool permission trust levels.
 * Zustand store with Dexie persistence.
 * Replaces in-memory Map-based ToolPermissionManager for cross-session persistence.
 *
 * @epic WB-8.3 - Cross-Workspace Event System
 * @story WB-8.3.1 - Tool Permission Persistence
 * @story Ralph Loop 51-3 - Workspace-Scoped Tool Permissions
 * @story ARCH-01.4 - Agent Tool Permission Matrix (YOLO mode, category approvals)
 * @prio P0 - Critical UX Fix
 *
 * December 2025 Patterns:
 * - Single responsibility (tool permissions only)
 * - Type-safe state with proper TypeScript interfaces
 * - Ephemeral state (sessionTrust) excluded from persistence
 * - Dexie persistence via createDexieStorage adapter
 * - Partialize function for selective field persistence
 * - Zero-downtime migration from v1 (flat) to v2 (workspace-scoped)
 * - v3 migration: YOLO mode and category approvals
 *
 * @ Ralph Loop 51-3 Migration:
 * - v1: Flat trust levels (legacy)
 * - v2: Workspace-scoped trust levels (target)
 * - Automatic migration preserves all existing permissions
 *
 * @ ARCH-01.4 Migration:
 * - v3: YOLO mode and category approvals
 * - YOLO mode bypasses all permission prompts
 * - Category approvals allow bulk tool permissions
 *
 * @migration-status CANONICAL (Epic 53 Story 53-5)
 * @last-reviewed 2026-01-05
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Trust level for a tool - determines when user approval is required
 */
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

/**
 * Tool category for grouping related tools
 * Used for category-level approval (ARCH-01.4)
 */
export type ToolCategory = 'files' | 'terminal' | 'knowledge' | 'vision' | 'search' | 'web';

/**
 * Tool to category mapping
 * Used for category-based approval checks
 */
export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  // File operations
  read_file: 'files',
  list_files: 'files',
  read_directory: 'files',
  write_file: 'files',
  create_directory: 'files',
  delete_file: 'files',

  // Terminal operations
  execute_command: 'terminal',

  // Knowledge operations
  search_knowledge: 'knowledge',
  add_to_knowledge: 'knowledge',

  // Vision operations
  analyze_image: 'vision',
  capture_screen: 'vision',

  // Search operations
  web_search: 'search',
  search_files: 'search',

  // Web operations
  fetch_url: 'web',
  browse_web: 'web',
};

/**
 * Get the category for a tool
 * Returns 'files' as default for unknown tools
 */
export function getToolCategory(toolId: string): ToolCategory {
  return TOOL_CATEGORIES[toolId] || 'files';
}

/**
 * YOLO Mode state (You Only Live Once)
 * When enabled, all tool permissions are auto-approved without prompts
 * Auto-disables after expiry time for safety (default: 24 hours)
 */
export interface YOLOMode {
  /** Whether YOLO mode is currently enabled */
  enabled: boolean;
  /** Expiry timestamp (auto-disable after this time) */
  expiryTime: number | null;
  /** Optional duration in hours (default: 24) */
  durationHours: number;
}

/**
 * Default YOLO mode duration (24 hours)
 */
export const DEFAULT_YOLO_DURATION_HOURS = 24;

/**
 * Category approval state
 * When a category is approved, all tools in that category are auto-approved
 */
export type CategoryApprovalState = Record<ToolCategory, boolean>;

/**
 * Default category approvals (all disabled)
 */
export const DEFAULT_CATEGORY_APPROVALS: CategoryApprovalState = {
  files: false,
  terminal: false,
  knowledge: false,
  vision: false,
  search: false,
  web: false,
};

/**
 * Tool permission state
 *
 * PERSISTED FIELDS:
 * - trustLevels: User-configured workspace-scoped trust levels (v2)
 * - defaultTrustLevel: Fallback for new tool/workspace combinations
 * - version: Schema version for migration tracking
 * - yoloMode: YOLO mode state (v3 - auto-approve all tools)
 * - categoryApprovals: Category-level approval state (v3)
 *
 * EPHEMERAL FIELDS (not persisted):
 * - sessionTrust: Temporary approvals for current session only (workspace-scoped)
 *
 * MIGRATION: v1 (flat) → v2 (workspace-scoped) → v3 (YOLO + categories)
 * - All existing global permissions replicated to all 4 workspaces
 * - Zero data loss, automatic migration on store load
 */
export interface ToolPermissionState {
  /**
   * Nested trust levels: toolId -> workspaceType -> trustLevel
   *
   * Example:
   * {
   *   'read_file': {
   *     ide: 'auto',
   *     knowledge: 'auto',
   *     notes: 'prompt',
   *     study: 'auto',
   *   },
   *   'execute_command': {
   *     ide: 'prompt',
   *     knowledge: 'block',
   *     notes: 'block',
   *     study: 'block',
   *   }
   * }
   */
  trustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>>;

  /**
   * Default trust level for new tools/workspace combinations
   * Fallback when no specific level is set
   */
  defaultTrustLevel: ToolTrustLevel;

  /**
   * Session-based trust (cleared on reload, NOT persisted)
   * Format: toolId:workspaceType (e.g., "read_file:ide")
   */
  sessionTrust: string[];

  /**
   * YOLO Mode state (v3 - ARCH-01.4)
   * When enabled, all tools bypass permission checks
   * Auto-disables after expiryTime for safety
   */
  yoloMode: YOLOMode;

  /**
   * Category approval state (v3 - ARCH-01.4)
   * When a category is approved, all tools in that category are auto-approved
   * Workspace-specific: Record<workspaceType, CategoryApprovalState>
   */
  categoryApprovals: Record<WorkspaceType, CategoryApprovalState>;

  /**
   * Schema version for migration
   * v1: Flat trust levels (legacy)
   * v2: Workspace-scoped trust levels
   * v3: YOLO mode and category approvals
   */
  version: number;

  /**
   * Whether the store has finished hydrating from persistence
   */
  _hasHydrated: boolean;

  /** Actions */
  setTrustLevel: (toolId: string, workspaceType: WorkspaceType, level: ToolTrustLevel) => void;
  getTrustLevel: (toolId: string, workspaceType: WorkspaceType) => ToolTrustLevel;
  addSessionTrust: (toolId: string, workspaceType: WorkspaceType) => void;
  removeSessionTrust: (toolId: string, workspaceType: WorkspaceType) => void;
  clearSessionTrust: () => void;
  resetToDefaults: () => void;
  setHasHydrated: (hydrated: boolean) => void;

  /** YOLO Mode actions (v3 - ARCH-01.4) */
  toggleYOLO: (durationHours?: number) => void;
  setYOLOExpiry: (expiryTime: number) => void;
  checkYOLOExpiry: () => void;
  isYOLOActive: () => boolean;

  /** Category approval actions (v3 - ARCH-01.4) */
  setCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType, approved: boolean) => void;
  getCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType) => boolean;
  isCategoryApproved: (toolId: string, workspaceType: WorkspaceType) => boolean;
}

/**
 * Default trust levels for all tools across all workspaces
 *
 * These match the defaults from ToolPermissionManager (tool-permission-manager.ts:71-79)
 * Now structured as workspace-scoped defaults
 *
 * Ralph Loop 51-3: Each workspace can have different defaults
 * - IDE: Full tool access (needs terminal, file operations)
 * - Knowledge: Read-only (no terminal, limited file access)
 * - Notes: Read/write (no terminal)
 * - Study: Read-only (no terminal, no file modifications)
 */
const createDefaultTrustLevels = (): Record<string, Record<WorkspaceType, ToolTrustLevel>> => ({
  read_file: {
    ide: 'auto',
    knowledge: 'auto',
    notes: 'auto',
    study: 'auto',
  },
  list_files: {
    ide: 'auto',
    knowledge: 'auto',
    notes: 'auto',
    study: 'auto',
  },
  read_directory: {
    ide: 'auto',
    knowledge: 'auto',
    notes: 'auto',
    study: 'auto',
  },
  write_file: {
    ide: 'prompt',
    knowledge: 'block',
    notes: 'prompt',
    study: 'block',
  },
  create_directory: {
    ide: 'prompt',
    knowledge: 'block',
    notes: 'prompt',
    study: 'block',
  },
  delete_file: {
    ide: 'block',
    knowledge: 'block',
    notes: 'block',
    study: 'block',
  },
  execute_command: {
    ide: 'prompt',
    knowledge: 'block',
    notes: 'block',
    study: 'block',
  },
});

/**
 * All workspace types for iteration
 */
const ALL_WORKSPACES: WorkspaceType[] = ['ide', 'knowledge', 'notes', 'study'];

/**
 * Create default category approvals for all workspaces
 */
const createDefaultCategoryApprovals = (): Record<WorkspaceType, CategoryApprovalState> => ({
  ide: { ...DEFAULT_CATEGORY_APPROVALS },
  knowledge: { ...DEFAULT_CATEGORY_APPROVALS },
  notes: { ...DEFAULT_CATEGORY_APPROVALS },
  study: { ...DEFAULT_CATEGORY_APPROVALS },
});

/**
 * Default YOLO mode state (disabled)
 */
const DEFAULT_YOLO_MODE: YOLOMode = {
  enabled: false,
  expiryTime: null,
  durationHours: DEFAULT_YOLO_DURATION_HOURS,
};

/**
 * Tool Permission Store
 *
 * Zustand store with Dexie persistence for workspace-scoped tool trust levels.
 * Session trust is intentionally ephemeral (not persisted).
 *
 * Ralph Loop 51-3: Workspace-scoped permissions enable fine-grained control
 * - IDE: Can allow terminal (execute_command)
 * - Knowledge/Notes/Study: Can block terminal (no execute_command)
 *
 * @example
 * ```tsx
 * function ToolApproval() {
 *   const workspaceType = 'ide';
 *   const { trustLevels, setTrustLevel, getTrustLevel } = useToolPermissionStore();
 *
 *   const handleApprove = (toolId: string) => {
 *     setTrustLevel(toolId, workspaceType, 'auto');
 *   };
 *
 *   const level = getTrustLevel('read_file', workspaceType);
 * }
 * ```
 */
export const useToolPermissionStore = create<ToolPermissionState>()(
  persist(
    (set, get) => ({
      // Initial state
      trustLevels: createDefaultTrustLevels(),
      defaultTrustLevel: 'prompt',
      sessionTrust: [],
      yoloMode: DEFAULT_YOLO_MODE,
      categoryApprovals: createDefaultCategoryApprovals(),
      version: 3,
      _hasHydrated: false,

      /**
       * Set the trust level for a tool in a specific workspace (persisted)
       *
       * Ralph Loop 51-3: Workspace-scoped trust level setting
       * - Each workspace has independent trust levels
       * - Does not affect other workspaces
       */
      setTrustLevel: (toolId: string, workspaceType: WorkspaceType, level: ToolTrustLevel) => {
        set((state) => ({
          trustLevels: {
            ...state.trustLevels,
            [toolId]: {
              ...state.trustLevels[toolId],
              [workspaceType]: level,
            },
          },
        }));
      },

      /**
       * Get the trust level for a tool in a specific workspace
       * Falls back to defaultTrustLevel if unknown (safe default)
       *
       * Ralph Loop 51-3: Workspace-aware trust level lookup
       */
      getTrustLevel: (toolId: string, workspaceType: WorkspaceType) => {
        const state = get();
        return state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;
      },

      /**
       * Add session-based trust for a tool in a workspace (ephemeral)
       * Cleared on browser reload
       *
       * Ralph Loop 51-3: Session trust now workspace-scoped
       * - Format: "toolId:workspaceType" (e.g., "read_file:ide")
       * - Does not affect other workspaces
       */
      addSessionTrust: (toolId: string, workspaceType: WorkspaceType) => {
        const sessionKey = `${toolId}:${workspaceType}`;
        set((state) => {
          // Avoid duplicates
          if (state.sessionTrust.includes(sessionKey)) {
            return state;
          }
          return {
            sessionTrust: [...state.sessionTrust, sessionKey],
          };
        });
      },

      /**
       * Remove session-based trust for a tool in a workspace
       *
       * Ralph Loop 51-3: Workspace-scoped session trust removal
       */
      removeSessionTrust: (toolId: string, workspaceType: WorkspaceType) => {
        const sessionKey = `${toolId}:${workspaceType}`;
        set((state) => ({
          sessionTrust: state.sessionTrust.filter((key) => key !== sessionKey),
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
       * Also resets YOLO mode and category approvals (ARCH-01.4)
       */
      resetToDefaults: () => {
        set({
          trustLevels: createDefaultTrustLevels(),
          sessionTrust: [],
          // ARCH-01.4: Reset YOLO mode to default (disabled)
          yoloMode: DEFAULT_YOLO_MODE,
          // ARCH-01.4: Reset all category approvals
          categoryApprovals: createDefaultCategoryApprovals(),
        });
      },

      /**
       * Set hydration completion status
       * Called by persist middleware after rehydration
       */
      setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated } as Partial<ToolPermissionState>);
      },

      // ============================================================
      // YOLO Mode Actions (ARCH-01.4)
      // ============================================================

      /**
       * Toggle YOLO mode on/off
       * When enabled, all tool permissions are auto-approved
       * Auto-disables after expiry time for safety
       *
       * @param durationHours - Duration in hours (default: 24)
       */
      toggleYOLO: (durationHours?: number) => {
        const state = get();
        const now = Date.now();

        if (state.yoloMode.enabled) {
          // Disable YOLO mode
          set({
            yoloMode: { ...state.yoloMode, enabled: false, expiryTime: null },
          });
        } else {
          // Enable YOLO mode with expiry
          const duration = durationHours ?? DEFAULT_YOLO_DURATION_HOURS;
          const expiryTime = now + duration * 60 * 60 * 1000;
          set({
            yoloMode: {
              enabled: true,
              expiryTime,
              durationHours: duration,
            },
          });
          console.log(`[ToolPermissionStore] YOLO mode enabled for ${duration} hours`);
        }
      },

      /**
       * Set YOLO mode expiry time
       * Used for updating the expiry without changing enabled state
       */
      setYOLOExpiry: (expiryTime: number) => {
        set((state) => ({
          yoloMode: { ...state.yoloMode, expiryTime },
        }));
      },

      /**
       * Check if YOLO mode has expired and disable if needed
       * Should be called periodically or before permission checks
       */
      checkYOLOExpiry: () => {
        const state = get();
        if (state.yoloMode.enabled && state.yoloMode.expiryTime) {
          const now = Date.now();
          if (now > state.yoloMode.expiryTime) {
            set({
              yoloMode: { ...state.yoloMode, enabled: false, expiryTime: null },
            });
            console.log('[ToolPermissionStore] YOLO mode expired and disabled');
          }
        }
      },

      /**
       * Check if YOLO mode is currently active
       * Returns true if enabled and not expired
       */
      isYOLOActive: () => {
        const state = get();
        if (!state.yoloMode.enabled || !state.yoloMode.expiryTime) {
          return false;
        }
        // Check expiry
        const now = Date.now();
        return now <= state.yoloMode.expiryTime;
      },

      // ============================================================
      // Category Approval Actions (ARCH-01.4)
      // ============================================================

      /**
       * Set approval status for a tool category in a workspace
       * When approved, all tools in that category bypass permission checks
       *
       * @param category - Tool category to approve/disapprove
       * @param workspaceType - Workspace context
       * @param approved - Whether the category is approved
       */
      setCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType, approved: boolean) => {
        set((state) => ({
          categoryApprovals: {
            ...state.categoryApprovals,
            [workspaceType]: {
              ...state.categoryApprovals[workspaceType],
              [category]: approved,
            },
          },
        }));
      },

      /**
       * Get approval status for a category in a workspace
       *
       * @param category - Tool category to check
       * @param workspaceType - Workspace context
       * @returns Whether the category is approved
       */
      getCategoryApproval: (category: ToolCategory, workspaceType: WorkspaceType) => {
        const state = get();
        return state.categoryApprovals[workspaceType]?.[category] ?? false;
      },

      /**
       * Check if a tool's category is approved in a workspace
       * Combines tool-to-category mapping with category approval state
       *
       * @param toolId - Tool to check
       * @param workspaceType - Workspace context
       * @returns Whether the tool's category is approved
       */
      isCategoryApproved: (toolId: string, workspaceType: WorkspaceType) => {
        const category = getToolCategory(toolId);
        const state = get();
        return state.categoryApprovals[workspaceType]?.[category] ?? false;
      },
    }),
    {
      name: 'tool-permission-store',
      storage: createJSONStorage(() => createDexieStorage('agentConfigs')),

      /**
       * Partialize - Selective field persistence
       *
       * CRITICAL: Persist trustLevels, defaultTrustLevel, version, yoloMode, categoryApprovals
       * DO NOT persist sessionTrust (intentionally ephemeral)
       *
       * Ralph Loop 51-3: Persist workspace-scoped state
       * ARCH-01.4: Persist YOLO mode and category approvals
       */
      partialize: (state) => ({
        trustLevels: state.trustLevels,
        defaultTrustLevel: state.defaultTrustLevel,
        version: state.version,
        yoloMode: state.yoloMode,
        categoryApprovals: state.categoryApprovals,
        // sessionTrust is EXCLUDED from persistence
      }),

      /**
       * Version for schema migrations
       *
       * Ralph Loop 51-3: Version 2 (workspace-scoped)
       * ARCH-01.4: Version 3 (YOLO mode + category approvals)
       */
      version: 3,

      /**
       * Migration function: v1 (flat) → v2 (workspace-scoped) → v3 (YOLO + categories)
       *
       * Ralph Loop 51-3: Zero-downtime migration
       * - Migrates flat trust levels to workspace-scoped structure
       * - Replicates existing global permissions to all 4 workspaces
       * - Migrates session trust to workspace-scoped format
       * - Zero data loss, automatic migration on store load
       *
       * ARCH-01.4: v2 → v3 migration
       * - Adds YOLO mode state (disabled by default)
       * - Adds category approval state (all disabled by default)
       *
       * @param persistedState - State from IndexedDB (may be v1, v2, or v3)
       * @param version - Schema version of persisted state
       * @returns Migrated state in current format
       */
      migrate: (persistedState: any, version: number) => {
        // v1 → v2 migration: Flat to workspace-scoped
        if (version === 1) {
          const legacyState = persistedState as {
            trustLevels: Record<string, ToolTrustLevel>;
            sessionTrust: string[];
          };

          // Migrate flat trust levels to workspace-scoped
          const workspaceScopedLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>> = {};

          for (const [toolId, level] of Object.entries(legacyState.trustLevels)) {
            // Replicate existing global level to all workspaces
            workspaceScopedLevels[toolId] = {
              ide: level,
              knowledge: level,
              notes: level,
              study: level,
            };
          }

          // Migrate session trust to workspace-scoped format
          const workspaceScopedSession: string[] = [];
          for (const toolId of legacyState.sessionTrust) {
            for (const workspace of ALL_WORKSPACES) {
              workspaceScopedSession.push(`${toolId}:${workspace}`);
            }
          }

          return {
            trustLevels: workspaceScopedLevels,
            defaultTrustLevel: 'prompt',
            sessionTrust: workspaceScopedSession,
            yoloMode: DEFAULT_YOLO_MODE,
            categoryApprovals: createDefaultCategoryApprovals(),
            version: 3,
          };
        }

        // v2 → v3 migration: Add YOLO mode and category approvals
        if (version === 2) {
          const v2State = persistedState as ToolPermissionState;
          return {
            ...v2State,
            yoloMode: DEFAULT_YOLO_MODE,
            categoryApprovals: createDefaultCategoryApprovals(),
            version: 3,
          };
        }

        // Already v3 or higher - return as-is
        return persistedState as ToolPermissionState;
      },

      onRehydrateStorage: () => {
        console.log('[ToolPermissionStore] Hydration starting...');
        return (state, error) => {
          if (error) {
            console.error('[ToolPermissionStore] Hydration error:', error);
          } else {
            console.log('[ToolPermissionStore] Hydration complete');
            if (state) {
              state._hasHydrated = true;
              // Check YOLO mode expiry on rehydration
              if (state.yoloMode?.enabled && state.yoloMode?.expiryTime) {
                const now = Date.now();
                if (now > state.yoloMode.expiryTime) {
                  state.yoloMode = { ...state.yoloMode, enabled: false, expiryTime: null };
                  console.log('[ToolPermissionStore] YOLO mode expired during hydration');
                }
              }
              // TEST: Reset YOLO mode in test environment to ensure clean state
              if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
                if (state.yoloMode?.enabled) {
                  state.yoloMode = { ...state.yoloMode, enabled: false, expiryTime: null };
                  console.log('[ToolPermissionStore] YOLO mode reset for test environment');
                }
              }
            }
          }
        };
      },
    }
  )
);

/**
 * Selectors for optimized component re-renders
 *
 * Ralph Loop 51-3: Workspace-scoped selectors
 * - All selectors now require workspaceType parameter
 * - Session trust checked in workspace-scoped format
 * - Trust levels checked per-workspace
 */

/**
 * Check if a tool needs approval in a specific workspace
 * Combines persisted trust level with session trust
 *
 * Ralph Loop 51-3: Workspace-aware approval check
 *
 * @param toolId - Tool to check
 * @param workspaceType - Workspace context
 * @returns Selector function for Zustand
 */
export function selectNeedsApproval(toolId: string, workspaceType: WorkspaceType) {
  return (state: ToolPermissionState): boolean => {
    const sessionKey = `${toolId}:${workspaceType}`;

    // Session trust overrides everything
    if (state.sessionTrust.includes(sessionKey)) {
      return false;
    }

    // Check persisted trust level for workspace
    const trustLevel = state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;

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
 * Check if a tool can execute in a specific workspace (not blocked)
 *
 * Ralph Loop 51-3: Workspace-aware execution check
 *
 * @param toolId - Tool to check
 * @param workspaceType - Workspace context
 * @returns Selector function for Zustand
 */
export function selectCanExecute(toolId: string, workspaceType: WorkspaceType) {
  return (state: ToolPermissionState): boolean => {
    const sessionKey = `${toolId}:${workspaceType}`;

    // Session trust overrides everything
    if (state.sessionTrust.includes(sessionKey)) {
      return true;
    }

    // Check persisted trust level for workspace
    const trustLevel = state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;
    return trustLevel !== 'block';
  };
}

/**
 * Get all tools by trust level in a specific workspace
 *
 * Ralph Loop 51-3: Workspace-aware tool listing
 *
 * @param workspaceType - Workspace context
 * @param level - Trust level to filter by
 * @returns Selector function for Zustand
 */
export function selectToolsByLevel(workspaceType: WorkspaceType, level: ToolTrustLevel) {
  return (state: ToolPermissionState): string[] => {
    return Object.entries(state.trustLevels)
      .filter(([_, workspaceLevels]) => workspaceLevels[workspaceType] === level)
      .map(([toolId]) => toolId);
  };
}

/**
 * Get trust level for a tool in a workspace (convenience selector)
 *
 * Ralph Loop 51-3: Direct workspace-scoped trust level access
 *
 * @param toolId - Tool to check
 * @param workspaceType - Workspace context
 * @returns Selector function for Zustand
 */
export function selectTrustLevel(toolId: string, workspaceType: WorkspaceType) {
  return (state: ToolPermissionState): ToolTrustLevel => {
    return state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;
  };
}
