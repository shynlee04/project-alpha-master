/**
 * PHASE 2 STUB: Agent Types
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/agents/types.ts
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import type { AgentProps, AgentStatus } from '@/domain/entities/agent';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';
import type { AgentToolBindingProps } from '@/domain/value-objects/tool-permission';
import type { ModelInfo } from '@/domain/types/llm';

// Re-export AgentProps for use by application services
export type { AgentProps, AgentStatus };

// Plain type for agents in store (no class methods)
export type AgentData = Omit<AgentProps, 'workspaceBindings' | 'tools'> & {
  workspaceBindings: WorkspaceBindingProps[];
  tools: AgentToolBindingProps[];
};

// ============================================================================
// SLICE 1: CRUD
// ============================================================================

export interface AgentCrudState {
  agents: AgentData[];
  activeAgentId: string | null;
  availableModels: Record<string, ModelInfo[]>;
  addAgent: (agent: Omit<AgentProps, 'id' | 'createdAt' | 'updatedAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => AgentData;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<AgentProps>) => void;
  resetToDefaults: () => void;
  setActiveAgent: (id: string) => void;
}

// ============================================================================
// SLICE 2: Workspace Bindings
// ============================================================================

export interface AgentWorkspaceBindingsState {
  getAgentsForWorkspace: (workspaceType: WorkspaceType) => AgentData[];
  updateWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;
  updateAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, binding: Partial<WorkspaceBindingProps>) => void;
  getAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType) => WorkspaceBindingProps | undefined;
  isAgentAvailableInWorkspace: (agentId: string, workspaceType: WorkspaceType) => boolean;
}

// ============================================================================
// SLICE 3: Validation
// ============================================================================

export interface AgentValidationState {
  validationErrors: Record<string, string[]>;
  addAgentValidated: (agent: Omit<AgentProps, 'id' | 'createdAt' | 'updatedAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => AgentData;
  updateAgentValidated: (id: string, updates: Partial<AgentProps>) => void;
  clearValidationErrors: (agentId: string) => void;
}

// ============================================================================
// SLICE 4: Events
// ============================================================================

export interface AgentEventsState {
  addAgentWithEvent: (agent: Omit<AgentProps, 'id' | 'createdAt' | 'updatedAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => AgentData;
  removeAgentWithEvent: (id: string) => void;
  updateAgentWithEvent: (id: string, updates: Partial<AgentProps>) => void;
  updateWorkspaceBindingWithEvent: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;
}

// ============================================================================
// SLICE 5: Utils
// ============================================================================

export interface AgentUtilsState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  getAgent: (id: string) => AgentData | undefined;
  getActiveAgent: () => AgentData | undefined;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  getAgentsCount: () => number;
  setActiveAgent: (id: string) => void;
}

// ============================================================================
// COMBINED STATE
// ============================================================================

export type CombinedAgentsState = AgentCrudState & AgentWorkspaceBindingsState & AgentValidationState & AgentEventsState & AgentUtilsState;

// Alias for backward compatibility
export type AgentsState = CombinedAgentsState;
