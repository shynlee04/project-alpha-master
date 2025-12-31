/**
 * @fileoverview Agent Store with Workspace Bindings
 * @module infrastructure/persistence/stores/agents/agents-store
 * @governance Architectural Specification v3.0 - Single Source of Truth
 * @ai-observable true
 *
 * Centralized agent configuration store with workspace bindings,
 * tool permissions, and cross-workspace agent availability.
 *
 * Replaces: /src/stores/agents-store.ts
 * Merges: Duplicate implementations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';
import type { Agent } from '@/domain/entities/agent';
import type { AgentToolBinding } from '@/domain/value-objects/tool-permission';
import type { WorkspaceBinding } from '@/domain/value-objects/workspace-binding';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Agent store state
 */
interface AgentsState {
  agents: Agent[];
  activeAgentId: string | null;
  _hasHydrated: boolean;
}

/**
 * Create Dexie storage for agents
 */
function createAgentsDexieStorage() {
  return createDexieStorage<AgentsState>('agent-configs');
}

/**
 * Agents Store
 *
 * Single source of truth for agent configurations.
 * Implements workspace bindings and tool permissions from domain layer.
 *
 * December 2025 Zustand best practices:
 * - Slice pattern with type safety
 * - Dexie persistence for production-ready data storage
 * - Domain entity integration
 * - Event emission for cross-store communication
 *
 * @example
 * ```ts
 * // Create agent with workspace bindings
 * const agentId = agentsStore.getState().addAgent({
 *   name: 'Code Assistant',
 *   providerId: 'anthropic',
 *   modelId: 'claude-sonnet-4-5',
 *   systemPrompt: 'You are a helpful coding assistant.',
 *   workspaceBindings: [
 *     { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
 *     { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false }
 *   ],
 *   tools: [/* tool bindings */]
 * });
 *
 * // Set as active
 * agentsStore.getState().setActiveAgent(agentId);
 *
 * // Check availability in workspace
 * const agent = agentsStore.getState().getAgent(agentId);
 * const available = agent?.isAvailableIn('knowledge');
 * ```
 */
export const useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
      // ========== STATE ==========
      agents: [],
      activeAgentId: null,
      _hasHydrated: false,

      // ========== CRUD OPERATIONS ==========

      /**
       * Add new agent
       */
      addAgent: (agentData: Omit<Agent, 'id'>) => string => {
        // Validate model exists for provider
        if (agentData.providerId && agentData.modelId) {
          const { useProviderStore } = require('@/infrastructure/persistence/stores/agents/provider-config-store');

          const availableModels = useProviderStore.getState().availableModels;
          const providerModels = availableModels[agentData.providerId] || [];

          const modelExists = providerModels.some(m => m.id === agentData.modelId);
          if (!modelExists) {
            throw new Error(
              `Model "${agentData.modelId}" is not available for provider "${agentData.providerId}`. +
              `Available models: ${providerModels.map(m => m.id).join(', ')}`
            );
          }
        }

        // Create agent instance with domain logic
        const agent = new Agent({
          id: `agt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...agentData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Add to store
        set((state) => ({
          agents: [...state.agents, agent],
        }));

        // Set as active if first agent
        if (state.agents.length === 1) {
          set({ activeAgentId: agent.id });
        }

        // Emit event for hot-reload
        get().emitAgentCreated(agent);

        return agent.id;
      },

      /**
       * Update existing agent
       */
      updateAgent: (id: string, updates: Partial<Omit<Agent, 'id' | 'createdAt'>>) => void => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, ...updates, updatedAt: Date.now() }
              : agent
          ),
        }));

        const updated = get().getAgent(id);
        if (updated) {
          get().emitAgentUpdated(updated);
        }
      },

      /**
       * Remove agent
       */
      removeAgent: (id: string) => void => {
        // Check if agent is active
        if (get().activeAgentId === id) {
          // Select new active agent
          const remainingAgents = get().agents.filter(a => a.id !== id);
          const newActiveId = remainingAgents[0]?.id || null;
          set({ activeAgentId: newActiveId });
        }

        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
        }));

        get().emitAgentDeleted(id);
      },

      // // ========== QUERY OPERATIONS ==========

      /**
       * Get agent by ID
       */
      getAgent: (id: string) => Agent | undefined => {
        return get().agents.find(a => a.id === id);
      },

      /**
       * Get all agents available for workspace
       */
      getAvailableAgentsForWorkspace: (workspaceType: WorkspaceType) => Agent[] => {
        return get().agents.filter(agent =>
          agent.isAvailableIn(workspaceType)
        );
      },

      /**
       * Get default agent for workspace
       */
      getDefaultAgentForWorkspace: (workspaceType: WorkspaceType): Agent | null => {
        const availableAgents = get().getAvailableAgentsForWorkspace(workspaceType);
        return availableAgents.find(agent =>
          agent.isDefaultFor(workspaceType)
        ) || availableAgents[0] || null;
      },

      // ========== ACTIVE AGENT ==========

      /**
       * Set active agent
       */
      setActiveAgent: (id: string | null) => void => {
        if (id && !get().getAgent(id)) {
          throw new Error(`Agent not found: ${id}`);
        }

        set({ activeAgentId: id });

        if (id) {
          get().emitAgentSelected(get().getAgent(id)!);
        }
      },

      /**
       * Get active agent
       */
      getActiveAgent: () => Agent | null => {
        const { activeAgentId } = get();
        return activeAgentId ? get().getAgent(activeAgentId) || null : null;
      },

      // ========== DEFAULT AGENT ==========

      /**
       * Reset to default agent
       */
      resetToDefaults: () => {
        const defaultAgent = get().agents.find(a => a.id === 'default-agent');
        set({
          activeAgentId: defaultAgent?.id || get().agents[0]?.id || null,
        });
      },

      // ========== EVENTS ==========

      /**
       * Emit agent created event
       */
      emitAgentCreated: (agent: Agent) => {
        console.log('[AgentsStore] Agent created:', agent);
        // TODO: Integrate with global event bus
      },

      /**
       * Emit agent updated event
       */
      emitAgentUpdated: (agent: Agent) => {
        console.log('[AgentsStore] Agent updated:', agent);
        // TODO: Integrate with global event bus
      },

      /**
       * Emit agent selected event
       */
      emitAgentSelected: (agent: Agent) => {
        console.log('[AgentsStore] Agent selected:', agent);
        // TODO: Integrate with global event bus
      },

      /**
       * Emit agent deleted event
       */
      emitAgentDeleted: (id: string) => {
        console.log('[AgentsStore] Agent deleted:', id);
        // TODO: Integrate with global event bus
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
          agents: [],
          activeAgentId: null,
          _hasHydrated: false,
        });
      },
    }),
    {
      name: 'agent-config-store',
      storage: createAgentsDexieStorage(),
      partialize: (state) => ({
        agents: state.agents,
        activeAgentId: state.activeAgentId,
      }),
      onRehydrateStorage: (state) => {
        // Ensure default agent exists after hydration
        if (state && (!state.agents || state.agents.length === 0)) {
          console.log('[AgentsStore] Rehydrating with default agent');

          // Create default agent if none exists
          const { WorkspaceBinding } = require('@/domain/value-objects/workspace-binding');
          const { AgentToolBinding } = require('@/domain/value-objects/tool-permission');
          const { DEFAULT_MODEL_SETTINGS } = require('./provider-config-store');

          const defaultAgent = new Agent({
            id: 'default-agent',
            name: 'Default Agent',
            providerId: 'openai',
            modelId: 'gpt-4o',
            systemPrompt: 'You are a helpful AI assistant.',
            temperature: DEFAULT_MODEL_SETTINGS.openai.temperature,
            maxTokens: DEFAULT_MODEL_SETTINGS.openai.maxTokens,
            workspaceBindings: [
              new WorkspaceBinding({
                workspaceType: 'ide',
                isAvailable: true,
                uiVariant: 'full',
                isDefault: true,
              }),
              new WorkspaceBinding({
                workspaceType: 'knowledge',
                isAvailable: true,
                uiVariant: 'compact',
                isDefault: false,
              }),
            ],
            tools: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          state.agents = [defaultAgent];
          state.activeAgentId = defaultAgent.id;
        }

        return state;
      },
    }
  )
);

// Export types
export type { Agent, AgentToolBinding, WorkspaceBinding, WorkspaceType };

// Export helper functions
export function getAgents() {
  return useAgentsStore.getState().agents;
}

export function getAgent(id: string) {
  return useAgentsStore.getState().getAgent(id);
}

export function getActiveAgent() {
  return useAgentsStore.getState().getActiveAgent();
}

export function getAvailableAgentsForWorkspace(workspace: WorkspaceType) {
  return useAgentsStore.getState().getAvailableAgentsForWorkspace(workspace);
}

// Initialize hydration
if (typeof window !== 'undefined') {
  useAgentsStore.getState().setHasHydrated(true);
}
