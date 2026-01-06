/**
 * @fileoverview Agent Selection State Interface
 * @module infrastructure/persistence/stores/agents/slices/agent-selection-state
 * @governance Architectural Specification v3.0
 *
 * State interface and types for agent selection store.
 */

import type { Agent } from '@/core/entities/Agent';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Agent selection state interface
 */
export interface AgentSelectionState {
  // Active agent
  activeAgentId: string | null;

  // Per-workspace default agent IDs
  defaultAgentIds: Record<WorkspaceType, string | null>;

  // Last selected agent per workspace
  lastSelectedAgentIds: Record<WorkspaceType, string | null>;

  // Hydration flag
  _hasHydrated: boolean;

  // Actions - Core
  setActiveAgent: (agentId: string | null, workspaceType: WorkspaceType) => void;
  setDefaultAgent: (agentId: string, workspaceType: WorkspaceType) => void;

  // Actions - Queries
  getActiveAgent: () => Agent | null;
  getAgentForWorkspace: (workspaceType: WorkspaceType) => Agent | null;
  selectAgentForWorkspace: (workspaceType: WorkspaceType) => void;
  needsReselection: (workspaceType: WorkspaceType) => boolean;

  // Actions - Events
  emitAgentSelected: (agent: Agent, workspaceType: WorkspaceType) => void;
  emitAgentDeselected: (workspaceType: WorkspaceType) => void;
  emitDefaultAgentChanged: (agent: Agent, workspaceType: WorkspaceType) => void;

  // Actions - Utilities
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
}
