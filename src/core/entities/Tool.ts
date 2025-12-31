/**
 * Tool Entity - Domain Layer
 *
 * Represents tools that agents can use (file operations, terminal, web search, etc.)
 *
 * @layer Domain
 * @module core/entities
 */

/**
 * Tool - Domain Entity
 *
 * Business rules:
 * - Tools have workspace-specific availability
 * - Tools can be enabled/disabled per agent
 * - Tools may have configuration options
 */
export interface Tool {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;

    // Capabilities
    requiresAuth: boolean;
    supportedWorkspaces: WorkspaceType[];

    // Configuration schema
    configSchema?: ToolConfigSchema;

    // Availability
    isEnabled: boolean;
}

/**
 * Tool categories for organization
 */
export type ToolCategory =
    | 'file-operations'
    | 'terminal'
    | 'web-search'
    | 'knowledge'
    | 'rag'
    | 'code-generation'
    | 'testing';

/**
 * Tool configuration schema definition
 */
export interface ToolConfigSchema {
    properties: Record<string, ToolConfigProperty>;
    required?: string[];
}

/**
 * Tool configuration property definition
 */
export interface ToolConfigProperty {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    default?: unknown;
    enum?: unknown[];
    minimum?: number;
    maximum?: number;
}

/**
 * Workspace type
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Tool execution request
 */
export interface ToolExecutionRequest {
    toolId: string;
    agentId: string;
    workspaceType: WorkspaceType;
    arguments: Record<string, unknown>;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
    toolId: string;
    success: boolean;
    output: unknown;
    error?: string;
    metadata?: {
        executionTime: number;
        tokensUsed?: number;
    };
}
