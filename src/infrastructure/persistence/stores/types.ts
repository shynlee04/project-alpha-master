/**
 * App State Types - Unified State Interface
 *
 * Defines the complete state interface for the single bounded store.
 * Combines agents, providers, and all other application state.
 *
 * @module stores/types
 * @story AC-1.7 - Create single bounded store
 */

import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBinding } from '@/core/entities/Agent';
import type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
} from './providers/types';

// ============================================================================
// AGENT STATE (from agents/types.ts - CombinedAgentsState)
// ============================================================================

/**
 * Agent CRUD State
 *
 * Pure CRUD operations for agent management.
 */
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

/**
 * Agent Workspace Bindings State
 *
 * Workspace filtering operations for agents.
 */
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

/**
 * Agent Validation State
 *
 * Validation logic for agent operations.
 */
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

/**
 * Agent Events State
 *
 * Event emission operations for agent lifecycle.
 */
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

/**
 * Agent Utils State
 *
 * Utility functions and selectors for agents.
 */
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
// PROVIDER STATE (from providers/types.ts - ProviderState)
// ============================================================================

/**
 * Provider State
 *
 * Complete state interface for provider configuration.
 * Includes both provider-store and models-loader-store functionality.
 */
export interface ProviderState {
  /** List of configured providers */
  providers: ProviderConfig[];

  /** Currently active provider ID */
  activeProviderId: string | null;

  /** Model settings by provider ID */
  modelSettings: Record<string, ModelSettings>;

  /** Available models by provider ID (fetched from API) */
  availableModels: Record<string, ModelInfo[]>;

  /** Global loading state */
  isLoading: boolean;

  /** Loading state by provider ID (for model fetching) */
  isLoadingModels: Record<string, boolean>;

  /** Selected model ID (merged from models-loader-store) */
  selectedModelId: string | null;

  /** Model cache by provider ID (merged from models-loader-store) */
  modelCache: Record<string, ModelStateEntry>;

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /** Add a new provider configuration */
  addProvider: (config: ProviderConfig) => void;

  /** Update an existing provider configuration */
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void;

  /** Remove a provider (validates no dependent agents) */
  removeProvider: (id: string, agents?: Agent[]) => Promise<void>;

  /** Set the active provider */
  setActiveProvider: (id: string) => void;

  /** Update model settings for a provider */
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;

  /** Fetch models from API for a provider */
  fetchModels: (providerId: string) => Promise<void>;

  /** Get available models for a provider */
  getAvailableModels: (providerId: string) => ModelInfo[];

  /** Reset to initial providers */
  reset: () => void;

  /** Set selected model (merged from models-loader-store) */
  setSelectedModel: (modelId: string) => void;

  /** Load models with caching (merged from models-loader-store) */
  loadModelsForProvider: (providerId: string) => Promise<void>;

  /** Clear models cache for a provider (merged from models-loader-store) */
  clearModelsCache: (providerId: string) => void;
}

// ============================================================================
// COMBINED APP STATE
// ============================================================================

/**
 * App State - Single Bounded Store
 *
 * Complete state interface combining agents and providers.
 * This is the single source of truth for the application.
 *
 * Design Principles:
 * - Single bounded store (Zustand best practice)
 * - Slice pattern for modularity
 * - Cross-slice communication via get()
 * - No circular imports
 *
 * @example
 * ```tsx
 * const { agents, providers, addAgent, fetchModels } = useAppStore();
 * ```
 */
export type AppState = AgentCrudState
  & AgentWorkspaceBindingsState
  & AgentValidationState
  & AgentEventsState
  & AgentUtilsState
  & ProviderState;
