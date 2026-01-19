/**
 * App State Types - Unified State Interface
 *
 * Defines the complete state interface for the single bounded store.
 * Combines agents, providers, and all other application state.
 *
 * @module stores/types
 * @story AC-1.7 - Create single bounded store
 */

import type { AgentProps, AgentStatus } from '@/domain/entities/agent';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';
import type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
} from './providers/types';
import type { AgentData } from './agents/types';

// ============================================================================
// AGENT STATE (from agents/types.ts - CombinedAgentsState)
// ============================================================================

/**
 * Agent Props for creating agents (without auto-generated fields)
 */
export type AgentCreateProps = Omit<AgentProps, 'id' | 'createdAt' | 'updatedAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>;

/**
 * Agent CRUD State
 *
 * Pure CRUD operations for agent management.
 */
export interface AgentCrudState {
  /** List of configured agents (plain data, not class instances) */
  agents: AgentData[];

  /** Active agent ID */
  activeAgentId: string | null;

  /** Add a new agent (pure CRUD, no validation) */
  addAgent: (agent: AgentCreateProps) => AgentData;

  /** Remove an agent by ID */
  removeAgent: (id: string) => void;

  /** Update an existing agent (pure CRUD, no validation) */
  updateAgent: (id: string, updates: Partial<AgentData>) => void;

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
  getAgentsForWorkspace: (workspaceType: WorkspaceType) => AgentData[];

  /** Update workspace binding for an agent */
  updateWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;

  /** Update workspace binding with partial data (enhanced) */
  updateAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType, binding: Partial<WorkspaceBindingProps>) => void;

  /** Get specific workspace binding for an agent */
  getAgentWorkspaceBinding: (agentId: string, workspaceType: WorkspaceType) => WorkspaceBindingProps | undefined;

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
  addAgentValidated: (agent: AgentCreateProps) => AgentData;

  /** Update agent with validation (wraps updateAgent with validation logic) */
  updateAgentValidated: (id: string, updates: Partial<AgentData>) => void;

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
  addAgentWithEvent: (agent: AgentCreateProps) => AgentData;

  /** Remove agent with event emission (wraps removeAgent with event emission) */
  removeAgentWithEvent: (id: string) => void;

  /** Update agent with event emission (wraps updateAgent with event emission) */
  updateAgentWithEvent: (id: string, updates: Partial<AgentData>) => void;

  /** Update workspace binding with event emission (wraps updateWorkspaceBinding with event emission) */
  updateWorkspaceBindingWithEvent: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => void;
}

/**
 * Agent Utils State
 *
 * Utility functions and selectors for agents.
 */
export interface AgentUtilsState {
  /** Available models by provider ID (cross-slice reference) */
  availableModels: Record<string, ModelInfo[]>;

  /** Whether the store has been hydrated from persistence */
  _hasHydrated: boolean;

  /** Set hydration status */
  setHasHydrated: (state: boolean) => void;

  /** Get agent by ID */
  getAgent: (id: string) => AgentData | undefined;

  /** Get active agent */
  getActiveAgent: () => AgentData | undefined;

  /** Update agent status */
  updateAgentStatus: (id: string, status: AgentStatus) => void;

  /** Get total agents count */
  getAgentsCount: () => number;

  /** Set active agent */
  setActiveAgent: (id: string) => void;
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

  /** Model cache by provider ID (for performance) */
  modelCache: Record<string, ModelStateEntry>;

  /** Loading state for models by provider ID */
  isLoadingModels: Record<string, boolean>;

  /** Add a new provider configuration */
  addProvider: (config: ProviderConfig) => void;

  /** Update an existing provider configuration */
  updateProvider: (id: string, updates: Partial<ProviderConfig>) => void;

  /** Remove a provider configuration (with optional agents array for dependency checking) */
  removeProvider: (id: string, agents?: any[]) => Promise<void>;

  /** Set the active provider */
  setActiveProvider: (id: string) => void;

  /** Fetch available models for a provider */
  fetchModels: (providerId: string) => Promise<void>;

  /** Load models for a provider from cache or API */
  loadModelsForProvider: (providerId: string) => Promise<void>;

  /** Update model settings for a provider */
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;

  /** Get available models (with caching) */
  getAvailableModels: (providerId: string) => ModelInfo[];

  /** Get selected model ID for a provider */
  getSelectedModel: (providerId: string) => string | null;

  /** Set selected model for a provider */
  setSelectedModel: (providerId: string, modelId: string) => void;

  /** Reset to default providers */
  resetToDefaults: () => void;

  /** Loading state (general) */
  isLoading: boolean;

  /** Currently selected model ID (for UI) */
  selectedModelId: string | null;
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
 * - Schema versioning for safe migrations
 *
 * @example
 * ```tsx
 * const { agents, providers, addAgent, fetchModels } = useAppStore();
 * ```
 */
export interface AppStateBase {
  /**
   * Schema version for safe migrations
   * Incremented when breaking changes are introduced to persisted state
   * Migrations run automatically on rehydration when version changes
   */
  version: number;
}

export type AppState = AppStateBase
  & AgentCrudState
  & AgentWorkspaceBindingsState
  & AgentValidationState
  & AgentEventsState
  & AgentUtilsState
  & ProviderState;
