/**
 * Agent Service - Application Layer
 *
 * Orchestrates agent operations and business logic.
 * Mediates between presentation and infrastructure layers.
 *
 * @layer Application
 * @module application/services
 */

import type { Agent, AgentCreateParams, AgentUpdateParams } from '@/core/entities/Agent';

/**
 * Agent validation errors
 */
export class AgentValidationError extends Error {
    constructor(
        public field: string,
        message: string
    ) {
        super(`Agent validation failed: ${field} - ${message}`);
        this.name = 'AgentValidationError';
    }
}

/**
 * Agent Service - Business logic for agent management
 *
 * Responsibilities:
 * - Agent CRUD operations with validation
 * - Agent status transitions
 * - Tool permission validation
 * - Workspace binding validation
 */
export class AgentService {
    /**
     * Validate agent creation parameters
     */
    static validateCreate(params: AgentCreateParams): void {
        // Name validation
        if (!params.name?.trim()) {
            throw new AgentValidationError('name', 'Name is required');
        }

        if (params.name.length > 100) {
            throw new AgentValidationError('name', 'Name must be less than 100 characters');
        }

        // Provider validation
        if (!params.provider) {
            throw new AgentValidationError('provider', 'Provider is required');
        }

        // Model validation
        if (!params.model?.trim()) {
            throw new AgentValidationError('model', 'Model is required');
        }

        // Custom provider validation
        if (params.provider === 'OpenAI Compatible') {
            if (!params.customBaseURL?.trim()) {
                throw new AgentValidationError('customBaseURL', 'Base URL is required for custom providers');
            }

            try {
                new URL(params.customBaseURL);
            } catch {
                throw new AgentValidationError('customBaseURL', 'Invalid URL format');
            }
        }

        // Temperature validation
        if (params.temperature !== undefined) {
            if (params.temperature < 0 || params.temperature > 2) {
                throw new AgentValidationError('temperature', 'Temperature must be between 0 and 2');
            }
        }

        // Max tokens validation
        if (params.maxTokens !== undefined) {
            if (params.maxTokens < 1 || params.maxTokens > 128000) {
                throw new AgentValidationError('maxTokens', 'Max tokens must be between 1 and 128000');
            }
        }

        // Top-p validation
        if (params.topP !== undefined) {
            if (params.topP < 0 || params.topP > 1) {
                throw new AgentValidationError('topP', 'Top-p must be between 0 and 1');
            }
        }

        // Tool permissions validation
        if (params.tools) {
            params.tools.forEach((tool, index) => {
                if (!tool.toolId?.trim()) {
                    throw new AgentValidationError(`tools[${index}].toolId`, 'Tool ID is required');
                }

                // Ensure workspace permissions are boolean
                const wp = tool.workspacePermissions;
                if (typeof wp.ide !== 'boolean' ||
                    typeof wp.knowledge !== 'boolean' ||
                    typeof wp.study !== 'boolean' ||
                    typeof wp.notes !== 'boolean') {
                    throw new AgentValidationError(`tools[${index}].workspacePermissions`, 'All workspace permissions must be boolean');
                }
            });
        }

        // Workspace bindings validation
        if (params.workspaceBindings) {
            const workspaceTypes = new Set(params.workspaceBindings.map(wb => wb.workspaceType));
            if (workspaceTypes.size !== params.workspaceBindings.length) {
                throw new AgentValidationError('workspaceBindings', 'Duplicate workspace types detected');
            }
        }
    }

    /**
     * Validate agent update parameters
     */
    static validateUpdate(params: AgentUpdateParams): void {
        if (!params.id?.trim()) {
            throw new AgentValidationError('id', 'Agent ID is required');
        }

        // Re-use create validation for shared fields
        this.validateCreate(params as AgentCreateParams);
    }

    /**
     * Validate agent status transition
     */
    static validateStatusTransition(
        currentStatus: Agent['status'],
        newStatus: Agent['status']
    ): void {
        const validTransitions: Record<Agent['status'], Agent['status'][]> = {
            offline: ['online'],
            online: ['offline', 'busy', 'error'],
            busy: ['online', 'error', 'offline'],
            error: ['offline', 'online']
        };

        const allowed = validTransitions[currentStatus];
        if (!allowed.includes(newStatus)) {
            throw new AgentValidationError(
                'status',
                `Invalid status transition: ${currentStatus} → ${newStatus}`
            );
        }
    }

    /**
     * Check if agent is available in workspace
     */
    static isAvailableInWorkspace(
        agent: Agent,
        workspaceType: 'ide' | 'knowledge' | 'study' | 'notes'
    ): boolean {
        if (!agent.workspaceBindings) {
            return true; // Available everywhere if no bindings specified
        }

        const binding = agent.workspaceBindings.find(
            wb => wb.workspaceType === workspaceType
        );

        return binding?.isAvailable ?? false;
    }

    /**
     * Check if agent has tool enabled in workspace
     */
    static hasToolInWorkspace(
        agent: Agent,
        toolId: string,
        workspaceType: 'ide' | 'knowledge' | 'study' | 'notes'
    ): boolean {
        if (!agent.tools) {
            return false;
        }

        const tool = agent.tools.find(t => t.toolId === toolId);
        if (!tool || !tool.isEnabled) {
            return false;
        }

        return tool.workspacePermissions[workspaceType] === true;
    }

    /**
     * Get default workspace binding
     */
    static getDefaultWorkspaceBinding(agent: Agent): WorkspaceBinding | null {
        if (!agent.workspaceBindings) {
            return null;
        }

        return agent.workspaceBindings.find(wb => wb.isDefault) ?? null;
    }

    /**
     * Generate agent display name
     */
    static getDisplayName(agent: Agent): string {
        return `${agent.name} (${agent.modelId.split('/').pop()})`;
    }
}

/**
 * Workspace binding type (local type for service)
 */
interface WorkspaceBinding {
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
    isAvailable: boolean;
    uiVariant: 'full' | 'compact' | 'minimal';
    isDefault: boolean;
}
