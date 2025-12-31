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
import { useAgentsStore } from './agents-store';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { Agent } from '@/domain/entities/agent';

/**
 * Agent selection state
 */
interface AgentSelectionState {
  // Currently active agent ID
  activeAgentId: string | null;

  // Per-workspace default agent IDs
  defaultAgentIds: Record<WorkspaceType, string | null>;

  // Last selected agent per workspace
  lastSelectedAgentIds: Record<WorkspaceType, string | null>;

  // Hydration flag
  _hasHydrated: boolean;
}

/**
 * Create Dexie storage for agent selection
 */
function createAgentSelectionDexieStorage() {
  return createDexieStorage<AgentSelectionState>('agent-selection');
}

/**
 * Agent Selection Store
 *
 * Single source of truth for active agent selection.
 * Implements workspace-aware agent selection with business rules:
 * - Prefer workspace-specific default agent
 * - Fall back to last selected agent for workspace
 * - Fall back to first available agent
 * - Emit events for hot-reload
 *
 * December 2025 Zustand best practices:
 * - Slice pattern with type safety
 * - Dexie persistence for production-ready data storage
 * - Domain entity integration
 * - Event emission for cross-store communication
 *
 * @example
 * ```ts
 * // Set active agent for current workspace
 * agentSelectionStore.getState().setActiveAgent('agent-1', 'ide');
 *
 * // Get active agent
 * const activeAgent = agentSelectionStore.getState().getActiveAgent();
 *
 * // Set default agent for workspace
 * agentSelectionStore.getState().setDefaultAgent('agent-2', 'knowledge');
 * ```
 */
export const useAgentSelectionStore = create<AgentSelectionState>()(
  persist(
    (set, get) => ({
      // ========== STATE ==========
      activeAgentId: null,
      defaultAgentIds: {
        ide: null,
        knowledge: null,
        study: null,
        canvas: null,
      },
      lastSelectedAgentIds: {
        ide: null,
        knowledge: null,
        study: null,
        canvas: null,
      },
      _hasHydrated: false,

      // ========== ACTIONS ==========

      /**
       * Set active agent for workspace
       *
       * Business Rules:
       * 1. Validate agent exists
       * 2. Validate agent is available in workspace
       * 3. Update last selected for workspace
       * 4. Emit event for hot-reload
       */
      setActiveAgent: (agentId: string | null, workspaceType: WorkspaceType) => {
        if (agentId === null) {
          set({ activeAgentId: null });
          get().emitAgentDeselected(workspaceType);
          return;
        }

        // Get agent from agents store
        const agent = useAgentsStore.getState().getAgent(agentId);
        if (!agent) {
          throw new Error(`Agent not found: ${agentId}`);
        }

        // Validate agent is available in workspace
        if (!agent.isAvailableIn(workspaceType)) {
          throw new Error(
            `Agent "${agent.name}" is not available in workspace: ${workspaceType}`
          );
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

      /**
       * Set default agent for workspace
       *
       * Business Rules:
       * 1. Validate agent exists
       * 2. Validate agent is available in workspace
       * 3. Emit event for hot-reload
       */
      setDefaultAgent: (agentId: string, workspaceType: WorkspaceType) => {
        // Get agent from agents store
        const agent = useAgentsStore.getState().getAgent(agentId);
        if (!agent) {
          throw new Error(`Agent not found: ${agentId}`);
        }

        // Validate agent is available in workspace
        if (!agent.isAvailableIn(workspaceType)) {
          throw new Error(
            `Agent "${agent.name}" is not available in workspace: ${workspaceType}`
          );
        }

        // Update default agent for workspace
        set((state) => ({
          defaultAgentIds: {
            ...state.defaultAgentIds,
            [workspaceType]: agentId,
          },
        }));

        // Emit event for hot-reload
        get().emitDefaultAgentChanged(agent, workspaceType);
      },

      /**
       * Get active agent
       *
       * @returns Active agent or null
       */
      getActiveAgent: (): Agent | null => {
        const { activeAgentId } = get();
        if (!activeAgentId) return null;

        return useAgentsStore.getState().getAgent(activeAgentId) || null;
      },

      /**
       * Get agent for workspace
       *
       * Business Rules:
       * 1. Prefer workspace-specific default agent
       * 2. Fall back to last selected agent for workspace
       * 3. Fall back to first available agent for workspace
       *
       * @param workspaceType - Target workspace type
       * @returns Agent or null
       */
      getAgentForWorkspace: (workspaceType: WorkspaceType): Agent | null => {
        const agents = useAgentsStore.getState().agents;
        const availableAgents = agents.filter(agent => agent.isAvailableIn(workspaceType));

        if (availableAgents.length === 0) {
          return null;
        }

        // Rule 1: Prefer workspace-specific default
        const defaultAgentId = get().defaultAgentIds[workspaceType];
        if (defaultAgentId) {
          const defaultAgent = availableAgents.find(a => a.id === defaultAgentId);
          if (defaultAgent) {
            return defaultAgent;
          }
        }

        // Rule 2: Fall back to last selected
        const lastSelectedId = get().lastSelectedAgentIds[workspaceType];
        if (lastSelectedId) {
          const lastSelected = availableAgents.find(a => a.id === lastSelectedId);
          if (lastSelected) {
            return lastSelected;
          }
        }

        // Rule 3: Fall back to first available agent marked as default
        const markedDefault = availableAgents.find(agent => agent.isDefaultFor(workspaceType));
        if (markedDefault) {
          return markedDefault;
        }

        // Rule 4: Fall back to first available agent
        return availableAgents[0] || null;
      },

      /**
       * Select best agent for workspace
       *
       * Automatically selects best agent for workspace using business rules
       * and updates active agent ID.
       *
       * @param workspaceType - Target workspace type
       */
      selectAgentForWorkspace: (workspaceType: WorkspaceType) => {
        const agent = get().getAgentForWorkspace(workspaceType);

        if (agent) {
          set({ activeAgentId: agent.id });
          get().emitAgentSelected(agent, workspaceType);
        }
      },

      /**
       * Check if active agent needs reselection for workspace
       *
       * @param workspaceType - Target workspace type
       * @returns True if active agent is not available in workspace
       */
      needsReselection: (workspaceType: WorkspaceType): boolean => {
        const activeAgent = get().getActiveAgent();

        if (!activeAgent) {
          return true;
        }

        return !activeAgent.isAvailableIn(workspaceType);
      },

      // ========== EVENTS ==========

      /**
       * Emit agent selected event
       */
      emitAgentSelected: (agent: Agent, workspaceType: WorkspaceType) => {
        console.log('[AgentSelectionStore] Agent selected:', agent.name, 'for workspace:', workspaceType);

        eventBus.emit(DomainEventType.AGENT_SELECTED, {
          agentId: agent.id,
          agentName: agent.name,
          workspaceType,
        });
      },

      /**
       * Emit agent deselected event
       */
      emitAgentDeselected: (workspaceType: WorkspaceType) => {
        console.log('[AgentSelectionStore] Agent deselected for workspace:', workspaceType);

        eventBus.emit(DomainEventType.AGENT_DESELECTED, {
          workspaceType,
        });
      },

      /**
       * Emit default agent changed event
       */
      emitDefaultAgentChanged: (agent: Agent, workspaceType: WorkspaceType) => {
        console.log('[AgentSelectionStore] Default agent changed:', agent.name, 'for workspace:', workspaceType);

        eventBus.emit(DomainEventType.DEFAULT_AGENT_CHANGED, {
          agentId: agent.id,
          agentName: agent.name,
          workspaceType,
        });
      },

      // ========== HYDRATION ==========

      /**
       * Set hydrated flag
       */
      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set({
          activeAgentId: null,
          defaultAgentIds: {
            ide: null,
            knowledge: null,
            study: null,
            canvas: null,
          },
          lastSelectedAgentIds: {
            ide: null,
            knowledge: null,
            study: null,
            canvas: null,
          },
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
      }),
      onRehydrateStorage: (state) => {
        // Ensure valid agent IDs after hydration
        if (state) {
          const agents = useAgentsStore.getState().agents;
          const validAgentIds = new Set(agents.map(a => a.id));

          // Filter out invalid agent IDs
          if (state.activeAgentId && !validAgentIds.has(state.activeAgentId)) {
            console.warn('[AgentSelectionStore] Active agent ID invalid after hydration, clearing');
            state.activeAgentId = null;
          }

          // Filter invalid default agent IDs
          for (const workspaceType of Object.keys(state.defaultAgentIds)) {
            const agentId = state.defaultAgentIds[workspaceType as WorkspaceType];
            if (agentId && !validAgentIds.has(agentId)) {
              console.warn(`[AgentSelectionStore] Default agent ID invalid for ${workspaceType}, clearing`);
              state.defaultAgentIds[workspaceType as WorkspaceType] = null;
            }
          }

          // Filter invalid last selected agent IDs
          for (const workspaceType of Object.keys(state.lastSelectedAgentIds)) {
            const agentId = state.lastSelectedAgentIds[workspaceType as WorkspaceType];
            if (agentId && !validAgentIds.has(agentId)) {
              console.warn(`[AgentSelectionStore] Last selected agent ID invalid for ${workspaceType}, clearing`);
              state.lastSelectedAgentIds[workspaceType as WorkspaceType] = null;
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
