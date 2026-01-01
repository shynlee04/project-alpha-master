/**
 * @fileoverview Agent Selection Store
 * @module infrastructure/persistence/stores/agents/agent-selection-store
 * @governance Architectural Specification v3.0
 * @ai-observable true
 *
 * Single source of truth for active agent selection.
 * Implements workspace-aware agent switching with hot-reload support.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import { useAppStore } from '../use-app-store';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { Agent } from '@/core/entities/Agent';
import { isAgentAvailableIn, isAgentDefaultFor } from '@/domain/services/agent-workspace-utils';

/**
 * Agent selection state
 */
interface AgentSelectionState {
  // ... existing interface ...
  activeAgentId: string | null;

  // Per-workspace default agent IDs
  defaultAgentIds: Record<WorkspaceType, string | null>;

  // Last selected agent per workspace
  lastSelectedAgentIds: Record<WorkspaceType, string | null>;

  // Hydration flag
  _hasHydrated: boolean;

  // Actions
  setActiveAgent: (agentId: string | null, workspaceType: WorkspaceType) => void;
  setDefaultAgent: (agentId: string, workspaceType: WorkspaceType) => void;
  getActiveAgent: () => Agent | null;
  getAgentForWorkspace: (workspaceType: WorkspaceType) => Agent | null;
  selectAgentForWorkspace: (workspaceType: WorkspaceType) => void;
  needsReselection: (workspaceType: WorkspaceType) => boolean;
  emitAgentSelected: (agent: Agent, workspaceType: WorkspaceType) => void;
  emitAgentDeselected: (workspaceType: WorkspaceType) => void;
  emitDefaultAgentChanged: (agent: Agent, workspaceType: WorkspaceType) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
}

/**
 * Create Dexie storage for agent selection
 */
function createAgentSelectionDexieStorage() {
  return createJSONStorage(() => createDexieStorage('agentConfigs'));
}

/**
 * Agent Selection Store
 * ...
 */
export const useAgentSelectionStore = create<AgentSelectionState>()(
  persist(
    (set, get) => ({
      // ... state ...
      activeAgentId: null,
      defaultAgentIds: {
        ide: null,
        knowledge: null,
        study: null,
        notes: null,
      },
      lastSelectedAgentIds: {
        ide: null,
        knowledge: null,
        study: null,
        notes: null,
      },
      _hasHydrated: false,
      // ... actions ...
      setActiveAgent: (agentId: string | null, workspaceType: WorkspaceType) => {
        // ... implementation ...
        if (agentId === null) {
          set({ activeAgentId: null });
          get().emitAgentDeselected(workspaceType);
          return;
        }

        // Get agent from agents store
        const agent = useAppStore.getState().getAgent(agentId);
        if (!agent) {
          console.warn(`[AgentSelectionStore] Agent not found: ${agentId}`);
          // Fallback allow setting ID anyway if it's during hydration or race condition?
          // For now, strict:
          throw new Error(`Agent not found: ${agentId}`);
        }

        // Validate agent is available in workspace
        if (!isAgentAvailableIn(agent, workspaceType)) {
          // Relax validation for 'ide' to avoid lockout if binding missing but needed
          console.warn(`Agent "${agent.name}" might not be available in workspace: ${workspaceType}`);
        }

        // Update active agent
        set({ activeAgentId: agentId });

        // Update last selected for workspace
        set((state) => ({
          lastSelectedAgentIds: {
            ...state.lastSelectedAgentIds,
            [workspaceType]: agentId,
          },
        }));

        // Emit event for hot-reload
        get().emitAgentSelected(agent, workspaceType);
      },
      // ... other actions ...
      setDefaultAgent: (agentId: string, workspaceType: WorkspaceType) => {
        // ... implementation ...
        const agent = useAppStore.getState().getAgent(agentId);
        if (!agent) throw new Error(`Agent not found: ${agentId}`);
        set((state) => ({
          defaultAgentIds: {
            ...state.defaultAgentIds,
            [workspaceType]: agentId,
          },
        }));
        get().emitDefaultAgentChanged(agent, workspaceType);
      },
      getActiveAgent: (): Agent | null => {
        const { activeAgentId } = get();
        if (!activeAgentId) return null;
        return useAppStore.getState().getAgent(activeAgentId) || null;
      },
      getAgentForWorkspace: (workspaceType: WorkspaceType): Agent | null => {
        const agents = useAppStore.getState().agents;
        const availableAgents = agents.filter(agent => isAgentAvailableIn(agent, workspaceType));

        if (availableAgents.length === 0) return null;

        // Rule 1: Prefer workspace-specific default
        const defaultAgentId = get().defaultAgentIds[workspaceType];
        if (defaultAgentId) {
          const defaultAgent = availableAgents.find(a => a.id === defaultAgentId);
          if (defaultAgent) return defaultAgent;
        }

        // Rule 2: Fall back to last selected
        const lastSelectedId = get().lastSelectedAgentIds[workspaceType];
        if (lastSelectedId) {
          const lastSelected = availableAgents.find(a => a.id === lastSelectedId);
          if (lastSelected) return lastSelected;
        }

        // Rule 3 & 4
        const markedDefault = availableAgents.find(agent => isAgentDefaultFor(agent, workspaceType));
        return markedDefault || availableAgents[0] || null;
      },
      selectAgentForWorkspace: (workspaceType: WorkspaceType) => {
        const agent = get().getAgentForWorkspace(workspaceType);
        if (agent) {
          set({ activeAgentId: agent.id });
          get().emitAgentSelected(agent, workspaceType);
        }
      },
      needsReselection: (workspaceType: WorkspaceType): boolean => {
        const activeAgent = get().getActiveAgent();
        if (!activeAgent) return true;
        return !isAgentAvailableIn(activeAgent, workspaceType);
      },

      emitAgentSelected: (agent: Agent, workspaceType: WorkspaceType) => {
        console.log('[AgentSelectionStore] Agent selected:', agent.name, 'for workspace:', workspaceType);
        eventBus.emit(DomainEventType.AGENT_SELECTED, {
          agentId: agent.id,
          agentName: agent.name,
          workspaceType,
        });
      },
      emitAgentDeselected: (workspaceType: WorkspaceType) => {
        console.log('[AgentSelectionStore] Agent deselected for workspace:', workspaceType);
        eventBus.emit(DomainEventType.AGENT_DESELECTED, {
          workspaceType,
        });
      },
      emitDefaultAgentChanged: (agent: Agent, workspaceType: WorkspaceType) => {
        console.log('[AgentSelectionStore] Default agent changed:', agent.name, 'for workspace:', workspaceType);
        eventBus.emit(DomainEventType.DEFAULT_AGENT_CHANGED, {
          agentId: agent.id,
          agentName: agent.name,
          workspaceType,
        });
      },
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },
      reset: () => {
        set({
          activeAgentId: null,
          defaultAgentIds: { ide: null, knowledge: null, study: null, notes: null },
          lastSelectedAgentIds: { ide: null, knowledge: null, study: null, notes: null },
          _hasHydrated: false,
        });
      },
    }),
    {
      name: 'agent-selection-store',
      storage: createAgentSelectionDexieStorage(),
      partialize: (state) => ({
        activeAgentId: state.activeAgentId,
        defaultAgentIds: state.defaultAgentIds,
        lastSelectedAgentIds: state.lastSelectedAgentIds,
      } as unknown as AgentSelectionState), // Cast to ensure type compatibility
      onRehydrateStorage: () => (state) => {
        // ... same hydration logic ...
        if (state) {
          const agents = useAppStore.getState().agents;
          const validAgentIds = new Set(agents.map(a => a.id));

          if (state.activeAgentId && !validAgentIds.has(state.activeAgentId)) {
            state.activeAgentId = null;
          }
          // ... rest of logic
          for (const workspaceType of Object.keys(state.defaultAgentIds)) {
            const key = workspaceType as WorkspaceType;
            if (state.defaultAgentIds[key] && !validAgentIds.has(state.defaultAgentIds[key]!)) {
              state.defaultAgentIds[key] = null;
            }
          }
          for (const workspaceType of Object.keys(state.lastSelectedAgentIds)) {
            const key = workspaceType as WorkspaceType;
            if (state.lastSelectedAgentIds[key] && !validAgentIds.has(state.lastSelectedAgentIds[key]!)) {
              state.lastSelectedAgentIds[key] = null;
            }
          }
        }
        return state;
      },
    }
  )
);

// Initialize hydration flag on mount
if (typeof window !== 'undefined') {
  useAgentSelectionStore.getState().setHasHydrated(true);
}

// Export types
export type { AgentSelectionState };

// Export helper functions
export function getActiveAgent(): Agent | null {
  return useAgentSelectionStore.getState().getActiveAgent();
}

export function getAgentForWorkspace(workspaceType: WorkspaceType): Agent | null {
  return useAgentSelectionStore.getState().getAgentForWorkspace(workspaceType);
}

export function selectAgentForWorkspace(workspaceType: WorkspaceType): void {
  useAgentSelectionStore.getState().selectAgentForWorkspace(workspaceType);
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * @deprecated Use useAgentSelectionStore instead
 * Alias for backward compatibility with simple agent-selection-store
 */
export const useAgentSelection = useAgentSelectionStore;

/**
 * @deprecated Use useAppStore instead
 * Helper hook for getting active agent from agents list
 * This is maintained for backward compatibility
 */
export function useActiveAgent(agents: Agent[]) {
  const { activeAgentId } = useAgentSelectionStore();
  return agents.find(agent => agent.id === activeAgentId) || null;
}
