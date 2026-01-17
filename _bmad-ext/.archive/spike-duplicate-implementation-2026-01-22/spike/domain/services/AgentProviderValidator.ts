/**
 * @fileoverview Agent-Provider Validation Mediator Service
 * @module domain/services/AgentProviderValidator
 *
 * BREAKS CIRCULAR DEPENDENCY (Ralph Loop Cycle 12, Epic AC-1.1):
 *
 * Before: agents-store.ts ↔ provider-store.ts (circular import)
 * After: Both stores → AgentProviderValidator (unidirectional)
 *
 * @pattern Mediator Pattern
 * @prio P0 - Critical Architecture Fix
 * @effort 8 hours (implementation + testing)
 *
 * Responsibility:
 * - Validate provider-model combinations without store dependencies
 * - Validate provider deletion by checking dependent agents
 * - Pure functions (stateless, testable in isolation)
 *
 * @example
 * ```typescript
 * // In agents-store.ts (line 161-172):
 * AgentProviderValidator.validateProviderModel(
 *   providerId,
 *   modelId,
 *   availableModels
 * );
 *
 * // In provider-store.ts (line 118-128):
 * AgentProviderValidator.validateProviderDeletion(
 *   providerId,
 *   agents
 * );
 * ```
 */

import type { ModelInfo } from '@/lib/agent/providers/types';
import type { Agent } from '@/core/entities/Agent';

/**
 * Validation result with optional error message
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Agent-Provider Validation Mediator
 *
 * Stateless service for validating agent-provider relationships.
 * Pure functions - no store dependencies, no side effects.
 *
 * @architecture
 * Domain Layer (Layer 2) - Business Logic
 * - Depends on: Core entities (Agent, ModelInfo)
 * - Used by: Application stores (agents-store, provider-store)
 *
 * @testing
 * All methods are pure functions - testable without mocking stores.
 */
export class AgentProviderValidator {
  /**
   * Validate that a model belongs to a provider's available models
   *
   * Used by agents-store.ts when creating/updating agents.
   *
   * @param providerId - Provider ID to validate
   * @param modelId - Model ID to validate
   * @param availableModels - Record of providerId → ModelInfo[] (from provider store)
   * @returns ValidationResult with error message if invalid
   *
   * @example
   * ```typescript
   * const availableModels = {
   *   'openrouter': [{ id: 'gpt-4', name: 'GPT-4' }],
   *   'anthropic': [{ id: 'claude-3', name: 'Claude 3' }]
   * };
   *
   * const result = AgentProviderValidator.validateProviderModel(
   *   'openrouter',
   *   'gpt-4',
   *   availableModels
   * );
   * // result.isValid === true
   *
   * const invalid = AgentProviderValidator.validateProviderModel(
   *   'openrouter',
   *   'claude-3', // Wrong provider
   *   availableModels
   * );
   * // invalid.isValid === false
   * // invalid.error === "Model 'claude-3' is not available for provider 'openrouter'"
   * ```
   */
  static validateProviderModel(
    providerId: string,
    modelId: string,
    availableModels: Record<string, ModelInfo[]>
  ): ValidationResult {
    // Defensive: Skip validation if data is incomplete
    if (!providerId || !modelId || typeof providerId !== 'string' || typeof modelId !== 'string') {
      return {
        isValid: true, // Fail-open for partial data (e.g., OLD schema)
      };
    }

    // Get models for this provider
    const providerModels = availableModels[providerId] || [];

    // Validate: modelId must exist in provider's available models
    const modelExists = providerModels.some((m) => m.id === modelId);

    if (!modelExists) {
      return {
        isValid: false,
        error: `Model "${modelId}" is not available for provider "${providerId}"`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate that a provider can be deleted (no dependent agents)
   *
   * Used by provider-store.ts before deleting a provider.
   *
   * @param providerId - Provider ID to validate for deletion
   * @param agents - Array of all agents (from agents store)
   * @returns ValidationResult with error message if deletion would orphan agents
   *
   * @example
   * ```typescript
   * const agents = [
   *   { id: 'agt_1', name: 'Coder', providerId: 'openrouter' },
   *   { id: 'agt_2', name: 'Writer', providerId: 'anthropic' }
   * ];
   *
   * const canDelete = AgentProviderValidator.validateProviderDeletion(
   *   'openrouter',
   *   agents
   * );
   * // canDelete.isValid === false
   * // canDelete.error === "Cannot delete provider 'openrouter'. It is being used by 1 agent(s): Coder"
   *
   * const canDeleteOther = AgentProviderValidator.validateProviderDeletion(
   *   'unused_provider',
   *   agents
   * );
   * // canDeleteOther.isValid === true
   * ```
   */
  static validateProviderDeletion(
    providerId: string,
    agents: Agent[]
  ): ValidationResult {
    // Find agents using this provider
    const dependentAgents = agents.filter((agent) => agent.providerId === providerId);

    if (dependentAgents.length > 0) {
      const agentNames = dependentAgents.map((a) => a.name).join(', ');
      return {
        isValid: false,
        error: `Cannot delete provider "${providerId}". It is being used by ${dependentAgents.length} agent(s): ${agentNames}. Please reconfigure or delete these agents first.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate both provider-model combination and provider deletion safety
   *
   * Convenience method for validating agent updates that might change providers.
   *
   * @param agentId - Agent being updated (undefined for new agents)
   * @param newProviderId - New provider ID
   * @param newModelId - New model ID
   * @param availableModels - Provider models mapping
   * @param allAgents - All agents (for dependency check)
   * @returns ValidationResult
   *
   * @example
   * ```typescript
   * // Updating agent to use new provider-model combination
   * const result = AgentProviderValidator.validateAgentUpdate(
   *   'agt_001',
   *   'anthropic',
   *   'claude-3',
   *   availableModels,
   *   agents
   * );
   * ```
   */
  static validateAgentUpdate(
    agentId: string | undefined,
    newProviderId: string,
    newModelId: string,
    availableModels: Record<string, ModelInfo[]>,
    allAgents: Agent[]
  ): ValidationResult {
    // Validate provider-model combination
    const modelValidation = this.validateProviderModel(
      newProviderId,
      newModelId,
      availableModels
    );

    if (!modelValidation.isValid) {
      return modelValidation;
    }

    // For existing agents, check if we're removing the last agent from old provider
    // (Optional enhancement - not required for Epic AC-1.1)
    if (agentId) {
      const currentAgent = allAgents.find((a) => a.id === agentId);
      if (currentAgent && currentAgent.providerId !== newProviderId) {
        // Provider will change - validate old provider won't be orphaned
        const otherAgentsUsingOldProvider = allAgents.filter(
          (a) => a.providerId === currentAgent.providerId && a.id !== agentId
        );

        if (otherAgentsUsingOldProvider.length === 0) {
          // This is the last agent using the old provider
          // Warn user (but don't block - provider might be intentionally removed)
          console.warn(
            `[AgentProviderValidator] Agent ${agentId} is the last one using provider ${currentAgent.providerId}`
          );
        }
      }
    }

    return { isValid: true };
  }
}
