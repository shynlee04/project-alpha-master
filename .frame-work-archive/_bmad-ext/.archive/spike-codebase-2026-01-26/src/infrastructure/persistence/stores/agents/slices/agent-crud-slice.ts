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
import type { AgentStatus } from '@/domain/entities/agent';
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';
import type { AgentToolBindingProps } from '@/domain/value-objects/tool-permission';
import type { CombinedAgentsState, AgentCrudState, AgentData } from '../types';

/**
 * Default tool bindings for the default agent
 */
const DEFAULT_TOOL_BINDINGS: AgentToolBindingProps[] = [
  { toolId: 'read', toolName: 'File Read', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: true, notes: true } },
  { toolId: 'write', toolName: 'File Write', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: false, notes: true } },
  { toolId: 'execute', toolName: 'Terminal', isEnabled: true, workspacePermissions: { ide: true, knowledge: false, study: false, notes: false } },
  { toolId: 'browse', toolName: 'Web Browse', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: true, notes: true } },
];

/**
 * Default workspace bindings for the default agent
 */
const DEFAULT_WORKSPACE_BINDINGS: WorkspaceBindingProps[] = [
  { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
  { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
  { workspaceType: 'study', isAvailable: true, uiVariant: 'compact', isDefault: false },
  { workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false },
];

/**
 * Default agent - exported for use in tests and initialization
 */
export const DEFAULT_AGENT: AgentData = {
  id: 'agt_default_001',
  name: 'Via-Gent Coder',
  description: 'Default AI coding assistant powered by Devstral via OpenRouter',
  providerId: 'openrouter',
  model: 'mistralai/devstral-2512:free',
  modelId: 'mistralai/devstral-2512:free',
  systemPrompt: 'You are an expert AI coding assistant specializing in React, TypeScript, and full-stack web development. You help write clean, maintainable code following best practices.',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  tools: DEFAULT_TOOL_BINDINGS,
  workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,
  status: 'online' as AgentStatus,
  tasksCompleted: 0,
  successRate: 0,
  tokensUsed: 0,
  lastActive: new Date().toISOString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Default agent creation helper (returns plain data)
 */
function createDefaultAgent(): AgentData {
  return {
    id: 'agt_default_001',
    name: 'Via-Gent Coder',
    description: 'Default AI coding assistant powered by Devstral via OpenRouter',
    providerId: 'openrouter',
    model: 'mistralai/devstral-2512:free',
    modelId: 'mistralai/devstral-2512:free',
    systemPrompt: 'You are an expert AI coding assistant specializing in React, TypeScript, and full-stack web development. You help write clean, maintainable code following best practices.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    tools: DEFAULT_TOOL_BINDINGS,
    workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,
    status: 'online' as AgentStatus,
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
    lastActive: new Date().toISOString(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

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
 * - resetToDefaults: Reset to initial state
 */
export const createAgentCrudSlice: StateCreator<
  CombinedAgentsState,
  [],
  [],
  AgentCrudState
> = (set) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  /** Available models by provider ID (required by CombinedAgentsState) */
  availableModels: {},

  /** Active agent ID */
  activeAgentId: null,

  /** List of configured agents */
  agents: [createDefaultAgent()],

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
    const newAgent: AgentData = {
      ...agentData,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tasksCompleted: 0,
      successRate: 0,
      tokensUsed: 0,
      lastActive: new Date().toISOString(),
      // Ensure workspaceBindings and tools are arrays
      workspaceBindings: agentData.workspaceBindings || [],
      tools: agentData.tools || [],
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

    set((state) => {
      const filteredAgents = state.agents.filter((a) => a.id !== id);

      return {
        agents: filteredAgents
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
      agents: state.agents.map((agent) =>
        agent.id === id
          ? { ...agent, ...updates, updatedAt: Date.now() }
          : agent
      ),
    }));
  },

  /**
   * Reset to default agents
   */
  resetToDefaults: () => {
    console.log('[AgentCrudSlice] Resetting to defaults');
    set({
      agents: [createDefaultAgent()]
    });
  },

  /**
   * Set the active agent
   *
   * @param id - Agent ID to set as active
   */
  setActiveAgent: (id: string) => {
    console.log('[AgentCrudSlice] Setting active agent:', id);
    set({ activeAgentId: id });
  },
});
