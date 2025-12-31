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
 * IMMUTABLE CONTRACT from Sprint Change Proposal v2.0
 * Business rules:
 * - Agent must have providerId and modelId (foreign keys to LLMProvider and ProviderModel)
 * - Status transitions: offline → online → busy → error
 * - Tools are optional but must have permissions if present
 * - Workspace bindings define where agent is available
 */
export interface Agent {
    // Core identity
    id: string;
    name: string;
    description: string;

    // Provider + Model reference (CRITICAL LINKAGE)
    providerId: string;                // Foreign key to LLMProvider
    modelId: string;                   // Foreign key to ProviderModel

    // LLM Parameters
    systemPrompt: string;
    temperature: number;               // 0.0-2.0
    maxTokens: number;
    topP: number;                      // 0.0-1.0
    topK?: number;                     // Optional (for Gemini/local)
    frequencyPenalty?: number;
    presencePenalty?: number;

    // Tool Configuration (CONDITIONAL PER WORKSPACE)
    tools: AgentToolBinding[];

    // Workspace Bindings (WHERE THIS AGENT IS AVAILABLE)
    workspaceBindings: WorkspaceBinding[];

    // Status
    status: 'online' | 'offline' | 'busy' | 'error';

    // Metrics
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;                // ISO 8601 date string
    createdAt: string;                 // ISO 8601 date string
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
