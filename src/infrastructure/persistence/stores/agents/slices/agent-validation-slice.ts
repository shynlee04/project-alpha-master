/**
 * Agent Validation Slice - Provider/Model Validation Logic
 *
 * This slice wraps CRUD operations with validation logic.
 * Validates that providerId/modelId combinations are valid.
 *
 * @module agents/slices/agent-validation-slice
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

import { StateCreator } from 'zustand';
import type { Agent } from '@/core/entities/Agent';
import type { CombinedAgentsState } from '../types';
import { AgentProviderValidator } from '@/domain/services/AgentProviderValidator';

/**
 * Agent Validation Slice
 *
 * Validation operations that wrap CRUD methods:
 * - addAgentValidated: Add agent with validation
 * - updateAgentValidated: Update agent with validation
 * - clearValidationErrors: Clear validation errors
 */
export const createAgentValidationSlice: StateCreator<
  CombinedAgentsState,
  [],
  [],
  Omit<CombinedAgentsState, 'agents' | 'activeAgentId' | 'addAgent' | 'removeAgent' | 'updateAgent' | 'setActiveAgent' | 'resetToDefaults' | 'getAgentsForWorkspace' | 'updateWorkspaceBinding' | 'updateAgentWorkspaceBinding' | 'getAgentWorkspaceBinding' | 'isAgentAvailableInWorkspace' | 'addAgentWithEvent' | 'removeAgentWithEvent' | 'updateAgentWithEvent' | 'updateWorkspaceBindingWithEvent' | '_hasHydrated' | 'setHasHydrated' | 'getAgent' | 'updateAgentStatus' | 'getActiveAgent' | 'getAgentsCount'>
> = (set, get) => ({
  // ========================================================================
  // STATE
  // ========================================================================

  validationErrors: {},

  // ========================================================================
  // VALIDATION OPERATIONS (wrap CRUD with validation)
  // ========================================================================

  /**
   * Add agent with validation
   *
   * Validates that providerId/modelId combination is valid
   * before calling addAgent from CRUD slice.
   *
   * @throws Error if validation fails
   * @returns Created agent
   */
  addAgentValidated: (agent) => {
    const { providerId, modelId } = agent;

    // Only validate if both providerId and modelId are provided (NEW schema)
    // Skip validation for OLD schema or partial data (defensive programming)
    if (providerId && modelId && typeof providerId === 'string' && typeof modelId === 'string') {
      // Use mediator to validate (breaks circular dependency)
      const availableModels = get().availableModels;
      const validationResult = AgentProviderValidator.validateProviderModel(
        providerId,
        modelId,
        availableModels
      );

      if (!validationResult.isValid) {
        const errors = [validationResult.error || 'Invalid provider/model combination'];
        set({ validationErrors: { [`temp_${Date.now()}`]: errors } });
        throw new Error(validationResult.error);
      }
    }

    // Call CRUD slice's addAgent method (cross-slice communication via get())
    const result = get().addAgent(agent);

    // Clear any validation errors
    set({ validationErrors: {} });

    return result;
  },

  /**
   * Update agent with validation
   *
   * Validates that providerId/modelId combination is valid
   * before calling updateAgent from CRUD slice.
   *
   * @throws Error if validation fails
   */
  updateAgentValidated: (id, updates) => {
    const { providerId, modelId } = updates;

    // Only validate if both providerId and modelId are being updated (NEW schema)
    // Skip validation for partial updates or OLD schema (defensive programming)
    if (providerId && modelId && typeof providerId === 'string' && typeof modelId === 'string') {
      // Use mediator to validate (breaks circular dependency)
      const availableModels = get().availableModels;
      const validationResult = AgentProviderValidator.validateProviderModel(
        providerId,
        modelId,
        availableModels
      );

      if (!validationResult.isValid) {
        const errors = [validationResult.error || 'Invalid provider/model combination'];
        set({ validationErrors: { [id]: errors } });
        throw new Error(validationResult.error);
      }
    }

    // Call CRUD slice's updateAgent method (cross-slice communication via get())
    get().updateAgent(id, updates);

    // Clear validation errors for this agent
    const currentErrors = get().validationErrors;
    delete currentErrors[id];
    set({ validationErrors: currentErrors });
  },

  /**
   * Clear validation errors for an agent
   *
   * @param agentId - Agent ID to clear errors for
   */
  clearValidationErrors: (agentId: string) => {
    const currentErrors = get().validationErrors;
    delete currentErrors[agentId];
    set({ validationErrors: { ...currentErrors } });
  },
});
