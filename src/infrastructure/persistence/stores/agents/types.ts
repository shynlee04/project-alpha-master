/**
 * Agent Store Types - Combined State Interface
 *
 * Defines the union of all slice types for the agents store.
 * Each slice extends this combined type to enable cross-slice communication.
 *
 * @module agents/types
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBinding } from '@/core/entities/Agent';

// ============================================================================
// SLICE 1: CRUD
// ============================================================================

export interface AgentCrudState {
  /** List of configured agents */
  agents: Agent[];

  /** Currently active agent ID for chat */
  activeAgentId: string | null;

  /** Add a new agent (pure CRUD, no validation) */
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;

  /** Remove an agent by ID */
  removeAgent: (id: string) => void;

  /** Update an existing agent (pure CRUD, no validation) */
  updateAgent: (id: string, updates: Partial<Agent>) => void;

  /** Set active agent for chat */
  setActiveAgent: (id: string | null) => void;

  /** Reset to default agents */
  resetToDefaults: () => void;
}

// ============================================================================
// SLICE 2: Workspace Bindings
// ============================================================================

export interface AgentWorkspaceBindingsState {
  /** Get agents available in specific workspace */
  getAgentsForWorkspace: (workspaceType: WorkspaceType) => Agent[];

  /** Update workspace binding for an agent */
  updateWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;

  /** Update workspace binding with partial data (enhanced) */
  updateAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, binding: Partial<WorkspaceBinding>) => void;

  /** Get specific workspace binding for an agent */
  getAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType) => WorkspaceBinding | undefined;

  /** Check if agent is available in workspace */
  isAgentAvailableInWorkspace: (agentId: string, workspaceType: WorkspaceType) => boolean;
}

// ============================================================================
// SLICE 3: Validation
// ============================================================================

export interface AgentValidationState {
  /** Validation errors by agent ID */
  validationErrors: Record<string, string[]>;

  /** Add agent with validation (wraps addAgent with validation logic) */
  addAgentValidated: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;

  /** Update agent with validation (wraps updateAgent with validation logic) */
  updateAgentValidated: (id: string, updates: Partial<Agent>) => void;

  /** Clear validation errors for an agent */
  clearValidationErrors: (agentId: string) => void;
}

// ============================================================================
// SLICE 4: Events
// ============================================================================

export interface AgentEventsState {
  /** Add agent with event emission (wraps addAgent with event emission) */
  addAgentWithEvent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;

  /** Remove agent with event emission (wraps removeAgent with event emission) */
  removeAgentWithEvent: (id: string) => void;

  /** Update agent with event emission (wraps updateAgent with event emission) */
  updateAgentWithEvent: (id: string, updates: Partial<Agent>) => void;

  /** Update workspace binding with event emission (wraps updateWorkspaceBinding with event emission) */
  updateWorkspaceBindingWithEvent: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;
}

// ============================================================================
// SLICE 5: Utils
// ============================================================================

export interface AgentUtilsState {
  /** Whether the store has been hydrated from persistence */
  _hasHydrated: boolean;

  /** Set hydration status */
  setHasHydrated: (state: boolean) => void;

  /** Get agent by ID */
  getAgent: (id: string) => Agent | undefined;

  /** Update agent status */
  updateAgentStatus: (id: string, status: Agent['status']) => void;

  /** Get active agent */
  getActiveAgent: () => Agent | undefined;

  /** Get total agents count */
  getAgentsCount: () => number;
}

// ============================================================================
// COMBINED STATE
// ============================================================================

/**
 * Combined Agents State
 *
 * Union of all 5 slice types.
 * Each slice receives this as the first generic parameter to enable cross-slice communication.
 */
export type CombinedAgentsState = AgentCrudState & AgentWorkspaceBindingsState & AgentValidationState & AgentEventsState & AgentUtilsState;
