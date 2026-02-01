/**
 * Workspace Provider Preferences Slice
 *
 * Manages per-workspace provider preferences. Each workspace can have
 * its own preferred AI provider and fallback chain. If not set, inherits
 * from global default.
 *
 * @story PRV-04 - Workspace-scoped Provider Preferences
 * @epic EPIC-PRV-UI - Provider Frontend Integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { WorkspaceType } from './workspace-types';

/**
 * Provider preference for a specific workspace
 */
export interface WorkspaceProviderPreference {
  /** Preferred provider ID for this workspace (null = use global default) */
  preferredProviderId: string | null;
  /** Fallback provider chain (null = use global default) */
  fallbackProviders: string[] | null;
  /** Whether to always use the workspace preference even if provider lacks key */
  strictMode: boolean;
}

/**
 * Full state for workspace provider preferences
 */
export interface WorkspaceProviderState {
  /** Per-workspace provider preferences */
  workspaceProviders: Record<WorkspaceType, WorkspaceProviderPreference>;

  // Actions
  setWorkspaceProvider: (workspace: WorkspaceType, providerId: string | null) => void;
  setWorkspaceFallbackChain: (workspace: WorkspaceType, fallbacks: string[] | null) => void;
  setWorkspaceStrictMode: (workspace: WorkspaceType, strict: boolean) => void;
  clearWorkspaceProvider: (workspace: WorkspaceType) => void;
  resetAllWorkspaceProviders: () => void;

  // Getters
  getWorkspacePreference: (workspace: WorkspaceType) => WorkspaceProviderPreference;
  getEffectiveProviderId: (
    workspace: WorkspaceType,
    globalDefault: string
  ) => string;
}

/**
 * Default provider preference for a workspace
 */
const DEFAULT_WORKSPACE_PREFERENCE: WorkspaceProviderPreference = {
  preferredProviderId: null,
  fallbackProviders: null,
  strictMode: false,
};

/**
 * Create the workspace provider preferences store
 *
 * Uses zustand persist to save preferences to localStorage.
 * Preferences are keyed by workspace type (ide, knowledge, study, notes).
 */
export const useWorkspaceProviderStore = create<WorkspaceProviderState>()(
  persist(
    (set, get) => ({
      // Initial state - all workspaces use global defaults
      workspaceProviders: {
        editor: { ...DEFAULT_WORKSPACE_PREFERENCE },
        chat: { ...DEFAULT_WORKSPACE_PREFERENCE },
        terminal: { ...DEFAULT_WORKSPACE_PREFERENCE },
        preview: { ...DEFAULT_WORKSPACE_PREFERENCE },
        knowledge: { ...DEFAULT_WORKSPACE_PREFERENCE },
        study: { ...DEFAULT_WORKSPACE_PREFERENCE },
        notes: { ...DEFAULT_WORKSPACE_PREFERENCE },
      },

      // Set preferred provider for a workspace
      setWorkspaceProvider: (workspace: WorkspaceType, providerId: string | null) => {
        set((state) => ({
          workspaceProviders: {
            ...state.workspaceProviders,
            [workspace]: {
              ...state.workspaceProviders[workspace],
              preferredProviderId: providerId,
            },
          },
        }));
      },

      // Set fallback chain for a workspace
      setWorkspaceFallbackChain: (workspace: WorkspaceType, fallbacks: string[] | null) => {
        set((state) => ({
          workspaceProviders: {
            ...state.workspaceProviders,
            [workspace]: {
              ...state.workspaceProviders[workspace],
              fallbackProviders: fallbacks,
            },
          },
        }));
      },

      // Set strict mode for a workspace
      setWorkspaceStrictMode: (workspace: WorkspaceType, strict: boolean) => {
        set((state) => ({
          workspaceProviders: {
            ...state.workspaceProviders,
            [workspace]: {
              ...state.workspaceProviders[workspace],
              strictMode: strict,
            },
          },
        }));
      },

      // Clear provider preference for a workspace (reverts to global default)
      clearWorkspaceProvider: (workspace: WorkspaceType) => {
        set((state) => ({
          workspaceProviders: {
            ...state.workspaceProviders,
            [workspace]: { ...DEFAULT_WORKSPACE_PREFERENCE },
          },
        }));
      },

      // Reset all workspace providers to defaults
      resetAllWorkspaceProviders: () => {
        set({
          workspaceProviders: {
            editor: { ...DEFAULT_WORKSPACE_PREFERENCE },
            chat: { ...DEFAULT_WORKSPACE_PREFERENCE },
            terminal: { ...DEFAULT_WORKSPACE_PREFERENCE },
            preview: { ...DEFAULT_WORKSPACE_PREFERENCE },
            knowledge: { ...DEFAULT_WORKSPACE_PREFERENCE },
            study: { ...DEFAULT_WORKSPACE_PREFERENCE },
            notes: { ...DEFAULT_WORKSPACE_PREFERENCE },
          },
        });
      },

      // Get preference for a workspace
      getWorkspacePreference: (workspace: WorkspaceType) => {
        return get().workspaceProviders[workspace] || { ...DEFAULT_WORKSPACE_PREFERENCE };
      },

      // Get effective provider ID (workspace preference or global default)
      getEffectiveProviderId: (workspace: WorkspaceType, globalDefault: string) => {
        const preference = get().workspaceProviders[workspace];
        return preference?.preferredProviderId || globalDefault;
      },
    }),
    {
      name: 'workspace-provider-preferences',
      partialize: (state) => ({
        workspaceProviders: state.workspaceProviders,
      }),
      onRehydrateStorage: () => {
        console.log('[WorkspaceProviderStore] Hydration starting...');
        return (_state, error) => {
          if (error) {
            console.error('[WorkspaceProviderStore] Hydration error:', error);
          } else {
            console.log('[WorkspaceProviderStore] Hydration complete');
          }
        };
      },
    }
  )
);

/**
 * Hook to get workspace provider preference
 * ⚠️ CRITICAL FIX (2026-01-14): Uses useShallow to prevent infinite loops
 * @param workspace - The workspace to get preference for
 * @returns The workspace's provider preference
 */
export function useWorkspaceProviderPreference(workspace: WorkspaceType) {
  return useWorkspaceProviderStore(useShallow((state) => ({
    preference: state.workspaceProviders[workspace] || { ...DEFAULT_WORKSPACE_PREFERENCE },
    setProviderId: (providerId: string | null) => state.setWorkspaceProvider(workspace, providerId),
    setFallbackChain: (fallbacks: string[] | null) => state.setWorkspaceFallbackChain(workspace, fallbacks),
    setStrictMode: (strict: boolean) => state.setWorkspaceStrictMode(workspace, strict),
    clearPreference: () => state.clearWorkspaceProvider(workspace),
  })));
}

/**
 * Hook to get all workspace provider preferences
 * ⚠️ CRITICAL FIX (2026-01-14): Uses useShallow to prevent infinite loops
 */
export function useAllWorkspaceProviderPreferences() {
  return useWorkspaceProviderStore(useShallow((state) => ({
    workspaceProviders: state.workspaceProviders,
    setWorkspaceProvider: state.setWorkspaceProvider,
    clearWorkspaceProvider: state.clearWorkspaceProvider,
    resetAll: state.resetAllWorkspaceProviders,
  })));
}
