/**
 * Mock Agent Data for VIA-GENT
 *
 * @epic Epic-28 Story 28-15
 * @roadmap Replace with real API in Epic 25 (AI Foundation)
 * @see _bmad-output/epics/shards/epic-25-ai-foundation.md
 *
 * REFACTORED: Types now imported as Props (plain objects) for store compatibility
 */

// Import Props types (plain objects) for store compatibility
import type { AgentProps } from '@/domain/entities/agent';
import type { AgentToolBindingProps } from '@/domain/value-objects/tool-permission';
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';

// Re-export for external consumers
export type { AgentProps } from '@/domain/entities/agent';
export type { AgentToolBindingProps } from '@/domain/value-objects/tool-permission';
export type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';

/**
 * Default tools available for agents
 * Note: 'ide' → 'editor' in new plugin schema
 */
export const DEFAULT_TOOLS: AgentToolBindingProps[] = [
    {
        toolId: 'file-read',
        toolName: 'Read Files',
        isEnabled: true,
        workspacePermissions: { editor: true, knowledge: true, study: true, notes: true }
    },
    {
        toolId: 'file-write',
        toolName: 'Write Files',
        isEnabled: true,
        workspacePermissions: { editor: true, knowledge: false, study: true, notes: true }
    },
    {
        toolId: 'terminal',
        toolName: 'Terminal Commands',
        isEnabled: true,
        workspacePermissions: { editor: true, knowledge: false, study: false, notes: false }
    },
    {
        toolId: 'web-search',
        toolName: 'Web Search',
        isEnabled: true,
        workspacePermissions: { editor: true, knowledge: true, study: true, notes: true }
    }
]

/**
 * Default workspace bindings (available everywhere)
 * Uses both pluginType (new) and workspaceType (deprecated) for compatibility
 */
export const DEFAULT_WORKSPACE_BINDINGS: WorkspaceBindingProps[] = [
    { pluginType: 'editor', workspaceType: 'editor', isAvailable: true, uiVariant: 'full', isDefault: true },
    { pluginType: 'knowledge', workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
    { pluginType: 'study', workspaceType: 'study', isAvailable: true, uiVariant: 'compact', isDefault: false },
    { pluginType: 'notes', workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false }
]

/**
 * Mock agents for development/demo purposes
 *
 * IMMUTABLE CONTRACT: Must match Sprint Change Proposal v2.0 specification
 * TODO: Replace with TanStack Query + API in Epic 25
 */
export const mockAgents: AgentProps[] = [
    {
        id: 'agt_001',
        name: 'Coder-Alpha-V2',
        description: 'Specialized in React, TypeScript, and component architecture',

        // Provider + Model reference (foreign keys)
        providerId: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        modelId: 'claude-3-5-sonnet-20241022',

        // LLM Parameters
        systemPrompt: 'You are an expert frontend developer specializing in React and TypeScript.',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,

        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,

        status: 'online',
        tasksCompleted: 247,
        successRate: 98.5,
        tokensUsed: 1_250_000,
        lastActive: new Date().toISOString(),
        createdAt: new Date('2024-11-15T10:00:00Z').getTime(),
        updatedAt: new Date('2024-11-15T10:00:00Z').getTime(),
    },
    {
        id: 'agt_002',
        name: 'Architect-Prime',
        description: 'Designs system architecture and API contracts',

        // Provider + Model reference
        providerId: 'openai',
        model: 'gpt-4-turbo',
        modelId: 'gpt-4-turbo',

        // LLM Parameters
        systemPrompt: 'You are a system architect helping design scalable applications.',
        temperature: 0.5,
        maxTokens: 4096,
        topP: 1.0,

        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,

        status: 'online',
        tasksCompleted: 89,
        successRate: 96.2,
        tokensUsed: 890_000,
        lastActive: new Date(Date.now() - 300000).toISOString(),
        createdAt: new Date('2024-10-20T14:30:00Z').getTime(),
        updatedAt: new Date('2024-10-20T14:30:00Z').getTime(),
    },
    {
        id: 'agt_003',
        name: 'Code-Reviewer',
        description: 'Reviews code for quality, security, and best practices',

        // Provider + Model reference
        providerId: 'anthropic',
        model: 'claude-3-opus-20240229',
        modelId: 'claude-3-opus-20240229',

        // LLM Parameters
        systemPrompt: 'You are a code reviewer focused on quality and security.',
        temperature: 0.3,
        maxTokens: 4096,
        topP: 1.0,

        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,

        status: 'busy',
        tasksCompleted: 412,
        successRate: 99.1,
        tokensUsed: 2_100_000,
        lastActive: new Date(Date.now() - 60000).toISOString(),
        createdAt: new Date('2024-09-05T08:15:00Z').getTime(),
        updatedAt: new Date('2024-09-05T08:15:00Z').getTime(),
    },
    {
        id: 'agt_004',
        name: 'Doc-Writer',
        description: 'Generates technical documentation and user guides',

        // Provider + Model reference
        providerId: 'mistral',
        model: 'mistral-large-latest',
        modelId: 'mistral-large-latest',

        // LLM Parameters
        systemPrompt: 'You are a technical writer creating clear documentation.',
        temperature: 0.8,
        maxTokens: 4096,
        topP: 1.0,

        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,

        status: 'offline',
        tasksCompleted: 156,
        successRate: 94.8,
        tokensUsed: 670_000,
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date('2024-12-01T16:45:00Z').getTime(),
        updatedAt: new Date('2024-12-01T16:45:00Z').getTime(),
    },
    {
        id: 'agt_005',
        name: 'Test-Generator',
        description: 'Creates unit tests and integration test suites',

        // Provider + Model reference
        providerId: 'google',
        model: 'gemini-2.0-flash-exp',
        modelId: 'gemini-2.0-flash-exp',

        // LLM Parameters
        systemPrompt: 'You are a test engineer writing comprehensive test suites.',
        temperature: 0.6,
        maxTokens: 4096,
        topP: 1.0,

        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,

        status: 'online',
        tasksCompleted: 318,
        successRate: 97.3,
        tokensUsed: 1_450_000,
        lastActive: new Date(Date.now() - 120000).toISOString(),
        createdAt: new Date('2024-11-28T11:20:00Z').getTime(),
        updatedAt: new Date('2024-11-28T11:20:00Z').getTime(),
    },
    {
        id: 'agt_006',
        name: 'Debug-Detective',
        description: 'Analyzes errors and suggests fixes',

        // Provider + Model reference
        providerId: 'openai',
        model: 'gpt-4o',
        modelId: 'gpt-4o',

        // LLM Parameters
        systemPrompt: 'You are a debugging expert helping find and fix errors.',
        temperature: 0.4,
        maxTokens: 4096,
        topP: 1.0,

        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS,

        status: 'error',
        tasksCompleted: 78,
        successRate: 88.5,
        tokensUsed: 320_000,
        lastActive: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date('2024-12-10T09:00:00Z').getTime(),
        updatedAt: new Date('2024-12-10T09:00:00Z').getTime(),
    }
]

export type { AgentProps as MockAgent }
