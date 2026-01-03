/**
 * @fileoverview Workspace State Management
 * @module lib/state/workspace-store
 *
 * Single source of truth for workspace state.
 * Orchestrates workspace-specific agent and tool availability.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - State Management Orchestration
 *
 * December 2025 Patterns:
 * - Single source of truth (no state duplication)
 * - Event-driven updates (emit on state change)
 * - Reactive filtering (computed derived state)
 * - Type-safe workspace types
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from './workspace-types';
import { crossWorkspaceEventBus } from '../events/cross-workspace-event-bus';

/**
 * Tool availability in workspace
 */
export interface ToolAvailability {
  toolId: string;
  toolName: string;
  enabled: boolean;
  hasPermission: boolean;
  needsApproval: boolean;
}

/**
 * Workspace state interface
 */
interface WorkspaceState {
  // Current workspace
  currentWorkspace: WorkspaceType;
  currentProjectId: string | null;

  // Workspace-specific availability (derived from agents store)
  availableAgents: Agent[];
  availableTools: Map<string, ToolAvailability>; // agentId → tools

  // Transition state
  isTransitioning: boolean;
  transitionFrom: WorkspaceType | null;
  transitionStartedAt: number | null;

  // Hydration tracking
  _hasHydrated: boolean;

  // Actions
  setCurrentWorkspace: (workspace: WorkspaceType) => void;
  setCurrentProject: (projectId: string | null) => void;
  startTransition: (from: WorkspaceType) => void;
  endTransition: () => void;

  // Computed values (for convenience)
  getWorkspaceLabel: (workspace: WorkspaceType) => string;
  getWorkspaceIcon: (workspace: WorkspaceType) => string;

  // Hydration action
  setHasHydrated: (hydrated: boolean) => void;
}

/**
 * Workspace store with persistence
 *
 * Architecture:
 * - Single source of truth for workspace state
 * - Emits events on workspace change
 * - Coordinates with agents store for filtering
 * - Persists current workspace to localStorage
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkspace: 'ide',
      currentProjectId: null,
      availableAgents: [],
      availableTools: new Map(),
      isTransitioning: false,
      transitionFrom: null,
      transitionStartedAt: null,
      _hasHydrated: false,

      // Set current workspace (with event emission)
      setCurrentWorkspace: (workspace: WorkspaceType) => {
        const previousWorkspace = get().currentWorkspace;

        // Start transition
        set({
          isTransitioning: true,
          transitionFrom: previousWorkspace,
          transitionStartedAt: Date.now(),
        });

        // Update workspace
        set({ currentWorkspace: workspace });

        // Emit event for other stores to react
        crossWorkspaceEventBus.emitWorkspaceChanged({
          from: previousWorkspace,
          to: workspace,
          timestamp: new Date().toISOString(),
        });

        // End transition after a brief delay (allows UI to update)
        setTimeout(() => {
          set({
            isTransitioning: false,
            transitionFrom: null,
          });
        }, 300);
      },

      // Set current project
      setCurrentProject: (projectId: string | null) => {
        set({ currentProjectId: projectId });
      },

      // Start transition
      startTransition: (from: WorkspaceType) => {
        set({
          isTransitioning: true,
          transitionFrom: from,
          transitionStartedAt: Date.now(),
        });
      },

      // End transition
      endTransition: () => {
        set({
          isTransitioning: false,
          transitionFrom: null,
          transitionStartedAt: null,
        });
      },

      // Get workspace display label
      getWorkspaceLabel: (workspace: WorkspaceType) => {
        const labels: Record<WorkspaceType, string> = {
          ide: 'IDE',
          knowledge: 'Knowledge',
          study: 'Study',
          notes: 'Notes',
        };
        return labels[workspace] || workspace;
      },

      // Get workspace icon
      getWorkspaceIcon: (workspace: WorkspaceType) => {
        const icons: Record<WorkspaceType, string> = {
          ide: '💻',
          knowledge: '📚',
          study: '📖',
          notes: '📝',
        };
        return icons[workspace] || '🔷';
      },

      // Set hydration completion status
      setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated } as Partial<WorkspaceState>);
      },
    }),
    {
      name: 'workspace-state',
      // Persist only essential fields
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        currentProjectId: state.currentProjectId,
      }),
      onRehydrateStorage: () => {
        console.log('[WorkspaceStore] Hydration starting...');
        return (state, error) => {
          if (error) {
            console.error('[WorkspaceStore] Hydration error:', error);
          } else {
            console.log('[WorkspaceStore] Hydration complete');
            state!._hasHydrated = true;
          }
        };
      },
    }
  )
);

/**
 * Hook to get workspace context (convenience)
 */
export function useWorkspaceContext() {
  return useWorkspaceStore((state) => ({
    currentWorkspace: state.currentWorkspace,
    currentProjectId: state.currentProjectId,
    isTransitioning: state.isTransitioning,
  }));
}

/**
 * Hook to get workspace metadata
 */
export function useWorkspaceMetadata() {
  return useWorkspaceStore((state) => ({
    getLabel: (ws: WorkspaceType) => state.getWorkspaceLabel(ws),
    getIcon: (ws: WorkspaceType) => state.getWorkspaceIcon(ws),
  }));
}
