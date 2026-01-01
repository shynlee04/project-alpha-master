/**
 * Agent Events Slice - Event Emission Logic
 *
 * This slice wraps CRUD and workspace operations with event emission.
 * Emits cross-workspace events when agents are created/updated/deleted.
 *
 * @module agents/slices/agent-events-slice
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

import { StateCreator } from 'zustand';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { CombinedAgentsState } from '../types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';

/**
 * Agent Events Slice
 *
 * Event emission operations that wrap CRUD and workspace methods:
 * - addAgentWithEvent: Add agent with event emission
 * - removeAgentWithEvent: Remove agent with event emission
 * - updateAgentWithEvent: Update agent with event emission
 * - updateWorkspaceBindingWithEvent: Update workspace binding with event emission
 */
export const createAgentEventsSlice: StateCreator<
  CombinedAgentsState,
  [],
  [],
  Omit<CombinedAgentsState, 'agents' | 'activeAgentId' | 'addAgent' | 'removeAgent' | 'updateAgent' | 'setActiveAgent' | 'resetToDefaults' | 'getAgentsForWorkspace' | 'updateWorkspaceBinding' | 'updateAgentWorkspaceBinding' | 'getAgentWorkspaceBinding' | 'isAgentAvailableInWorkspace' | 'validationErrors' | 'addAgentValidated' | 'updateAgentValidated' | 'clearValidationErrors' | '_hasHydrated' | 'setHasHydrated' | 'getAgent' | 'updateAgentStatus' | 'getActiveAgent' | 'getAgentsCount'>
> = (_set, get) => ({
  // ========================================================================
  // EVENT EMISSION OPERATIONS (wrap CRUD with event emission)
  // ========================================================================

  /**
  * Add agent with event emission
  *
  * Calls addAgent from CRUD slice, then emits cross-workspace event.
  *
  * @param agent - Agent data (without id, createdAt, etc.)
  * @returns Created agent
  */
  addAgentWithEvent: (agent) => {
    // Call CRUD slice's addAgent method (cross-slice communication via get())
    const result = get().addAgent(agent);

    // Emit cross-workspace event with dynamic workspace detection
    const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
    crossWorkspaceEventBus.emitAgentConfigChange({
      workspaceId: currentWorkspace,
      agentId: result.id,
      changeType: 'created',
    });

    return result;
  },

  /**
   * Remove agent with event emission
   *
   * Calls removeAgent from CRUD slice, then emits cross-workspace event.
   *
   * @param id - Agent ID to remove
   */
  removeAgentWithEvent: (id) => {
    // Call CRUD slice's removeAgent method (cross-slice communication via get())
    get().removeAgent(id);

    // Emit cross-workspace event with dynamic workspace detection
    const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
    crossWorkspaceEventBus.emitAgentConfigChange({
      workspaceId: currentWorkspace,
      agentId: id,
      changeType: 'deleted',
    });
  },

  /**
   * Update agent with event emission
   *
   * Calls updateAgent from CRUD slice, then emits cross-workspace event.
   *
   * @param id - Agent ID to update
   * @param updates - Partial agent data to update
   */
  updateAgentWithEvent: (id, updates) => {
    // Call CRUD slice's updateAgent method (cross-slice communication via get())
    get().updateAgent(id, updates);

    // Emit cross-workspace event with dynamic workspace detection
    const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
    crossWorkspaceEventBus.emitAgentConfigChange({
      workspaceId: currentWorkspace,
      agentId: id,
      changeType: 'updated',
    });
  },

  /**
   * Update workspace binding with event emission
   *
   * Calls updateWorkspaceBinding from workspace bindings slice,
   * then emits cross-workspace event.
   *
   * @param agentId - Agent ID to update
   * @param workspaceType - Workspace type to update
   * @param isAvailable - Whether agent is available in this workspace
   */
  updateWorkspaceBindingWithEvent: (agentId: string, workspaceType: WorkspaceType, isAvailable: boolean) => {
    // Call workspace bindings slice's updateWorkspaceBinding method (cross-slice communication via get())
    get().updateWorkspaceBinding(agentId, workspaceType, isAvailable);

    // Emit cross-workspace event
    crossWorkspaceEventBus.emitAgentConfigChange({
      workspaceId: workspaceType,
      agentId,
      changeType: 'updated',
    });
  },
});
