/**
 * Agent CRUD Slice - Pure Create, Read, Update, Delete Operations
 *
 * This slice contains ONLY pure CRUD operations.
 * No validation logic, no event emission.
 * Those concerns are handled by separate slices.
 *
 * @module agents/slices/agent-crud-slice
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

import { StateCreator } from 'zustand';
import type { Agent } from '@/core/entities/Agent';
import type { CombinedAgentsState } from '../types';

/**
 * Default agent created on first load
 */
const DEFAULT_AGENT: Agent = {
  id: 'agt_default_001',
  name: 'Via-Gent Coder',
  description: 'Default AI coding assistant powered by Devstral via OpenRouter',
  providerId: 'openrouter',
  modelId: 'mistralai/devstral-2512:free',
  systemPrompt: 'You are an expert AI coding assistant specializing in React, TypeScript, and full-stack web development. You help write clean, maintainable code following best practices.',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  tools: ['read', 'write', 'execute', 'browse'],
  workspaceBindings: [
    { workspaceType: 'ide', isAvailable: true, isDefault: true },
    { workspaceType: 'chat', isAvailable: true, isDefault: false },
    { workspaceType: 'terminal', isAvailable: true, isDefault: false },
  ],
  status: 'online',
  tasksCompleted: 0,
  successRate: 0,
  tokensUsed: 0,
  lastActive: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

/**
 * Generate unique agent ID
 */
function generateId(): string {
  return `agt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Agent CRUD Slice
 *
 * Pure CRUD operations:
 * - addAgent: Add new agent (no validation, no events)
 * - removeAgent: Remove agent by ID (no event emission)
 * - updateAgent: Update existing agent (no validation, no events)
 * - setActiveAgent: Set active agent for chat
 * - resetToDefaults: Reset to initial state
 */
export const createAgentCrudSlice: StateCreator<
  CombinedAgentsState,
  [],
  [],
  Omit<CombinedAgentsState, 'getAgentsForWorkspace' | 'updateWorkspaceBinding' | 'updateAgentWorkspaceBinding' | 'getAgentWorkspaceBinding' | 'isAgentAvailableInWorkspace' | 'validationErrors' | 'addAgentValidated' | 'updateAgentValidated' | 'clearValidationErrors' | 'addAgentWithEvent' | 'removeAgentWithEvent' | 'updateAgentWithEvent' | 'updateWorkspaceBindingWithEvent' | '_hasHydrated' | 'setHasHydrated' | 'getAgent' | 'updateAgentStatus' | 'getActiveAgent' | 'getAgentsCount'>
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  agents: [DEFAULT_AGENT],
  activeAgentId: DEFAULT_AGENT.id,

  // ========================================================================
  // CRUD OPERATIONS (pure, no validation, no events)
  // ========================================================================

  /**
   * Add a new agent
   *
   * NOTE: This is a pure CRUD operation.
   * For validation, use addAgentValidated from agent-validation-slice.
   * For event emission, use addAgentWithEvent from agent-events-slice.
   */
  addAgent: (agentData) => {
    const newAgent: Agent = {
      ...agentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      tasksCompleted: 0,
      successRate: 0,
      tokensUsed: 0,
    };

    console.log('[AgentCrudSlice] Adding agent:', newAgent.id, newAgent.name);
    set((state) => ({ agents: [...state.agents, newAgent] }));

    return newAgent;
  },

  /**
   * Remove an agent by ID
   *
   * NOTE: This is a pure CRUD operation.
   * For event emission, use removeAgentWithEvent from agent-events-slice.
   */
  removeAgent: (id) => {
    console.log('[AgentCrudSlice] Removing agent:', id);
    const currentActive = get().activeAgentId;

    set((state) => {
      const filteredAgents = state.agents.filter((a) => a.id !== id);

      // If removing active agent, switch to first remaining agent
      const newActiveId = currentActive === id
        ? (filteredAgents[0]?.id || null)
        : currentActive;

      return {
        agents: filteredAgents,
        activeAgentId: newActiveId
      };
    });
  },

  /**
   * Update an existing agent
   *
   * NOTE: This is a pure CRUD operation.
   * For validation, use updateAgentValidated from agent-validation-slice.
   * For event emission, use updateAgentWithEvent from agent-events-slice.
   */
  updateAgent: (id, updates) => {
    console.log('[AgentCrudSlice] Updating agent:', id, updates);
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? { ...a, ...updates, lastActive: new Date().toISOString() }
          : a
      ),
    }));
  },

  /**
   * Set active agent for chat
   */
  setActiveAgent: (id) => {
    console.log('[AgentCrudSlice] Setting active agent:', id);
    set({ activeAgentId: id });
  },

  /**
   * Reset to default agents
   */
  resetToDefaults: () => {
    console.log('[AgentCrudSlice] Resetting to defaults');
    set({
      agents: [DEFAULT_AGENT],
      activeAgentId: DEFAULT_AGENT.id
    });
  },
});

// Export DEFAULT_AGENT for reference
export { DEFAULT_AGENT };
