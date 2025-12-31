/**
 * Agent Entity - Domain Layer
 *
 * Core business entity representing AI agents.
 * Aligned with mocks/agents.ts but as pure domain interface.
 *
 * @layer Domain
 * @module core/entities
 */

/**
 * Tool binding with per-workspace permissions
 */
export interface AgentToolBinding {
    toolId: string;
    toolName: string;
    isEnabled: boolean;
    workspacePermissions: {
        ide: boolean;
        knowledge: boolean;
        study: boolean;
        notes: boolean;
    };
    configuration?: Record<string, unknown>;
}

/**
 * Workspace binding configuration
 */
export interface WorkspaceBinding {
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
    isAvailable: boolean;
    uiVariant: 'full' | 'compact' | 'minimal';
    isDefault: boolean;
}

/**
 * Agent - Domain Entity
 *
 * Business rules:
 * - Agent must have provider and model
 * - Status transitions: offline → online → busy → error
 * - Tools are optional but must have permissions if present
 * - Workspace bindings define where agent is available
 */
export interface Agent {
    // Identity
    id: string;
    name: string;
    role: string;
    status: 'online' | 'offline' | 'busy' | 'error';

    // Configuration
    provider: 'OpenRouter' | 'OpenAI' | 'Anthropic' | 'Mistral' | 'Google' | 'OpenAI Compatible';
    model: string;
    description?: string;

    // LLM Parameters
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];

    // Provider-specific
    customBaseURL?: string;
    customHeaders?: Record<string, string>;
    enableNativeTools?: boolean;

    // Tools and Workspaces
    tools?: AgentToolBinding[];
    workspaceBindings?: WorkspaceBinding[];

    // Metadata
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;
    createdAt: string;
}

/**
 * Agent creation parameters (without auto-generated fields)
 */
export type AgentCreateParams = Omit<
    Agent,
    'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'
>;

/**
 * Agent update parameters (all fields optional except id)
 */
export type AgentUpdateParams = Partial<Omit<Agent, 'id'>> & { id: string };
