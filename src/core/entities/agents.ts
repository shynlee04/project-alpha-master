/**
 * Mock Agent Data for VIA-GENT
 * 
 * @epic Epic-28 Story 28-15
 * @roadmap Replace with real API in Epic 25 (AI Foundation)
 * @see _bmad-output/epics/shards/epic-25-ai-foundation.md
 */

/**
 * Tool binding with per-workspace permissions
 * AC-03: Enhanced with workspace-specific tool permissions
 */
export interface AgentToolBinding {
    toolId: string
    toolName: string
    isEnabled: boolean

    // Workspace permissions (ide, knowledge, study, notes)
    workspacePermissions: {
        ide: boolean
        knowledge: boolean
        study: boolean
        notes: boolean
    }

    configuration?: Record<string, unknown>
}

/**
 * Workspace binding configuration
 * AC-03: Defines where an agent is available and how it's displayed
 */
export interface WorkspaceBinding {
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes'
    isAvailable: boolean
    uiVariant: 'full' | 'compact' | 'minimal'
    isDefault: boolean
}

export interface Agent {
    id: string
    name: string
    role: string
    status: 'online' | 'offline' | 'busy' | 'error'
    provider: 'OpenRouter' | 'OpenAI' | 'Anthropic' | 'Mistral' | 'Google' | 'OpenAI Compatible'
    model: string
    description?: string
    tasksCompleted: number
    successRate: number
    tokensUsed: number
    lastActive: string
    createdAt: string

    // OpenAI Compatible Provider support
    customBaseURL?: string
    customHeaders?: Record<string, string>
    enableNativeTools?: boolean

    // CC-2025-12-29: Standard LLM Parameters
    /** Temperature (0.0-2.0, default 0.7) - controls randomness */
    temperature?: number
    /** Max output tokens (model-specific max) */
    maxTokens?: number
    /** Top-p nucleus sampling (0.0-1.0, default 0.95) */
    topP?: number
    /** Top-k sampling (optional, for Gemini/local models) */
    topK?: number
    /** System prompt / agent personality */
    systemPrompt?: string
    /** Frequency penalty (-2.0 to 2.0, reduces repetition) */
    frequencyPenalty?: number
    /** Presence penalty (-2.0 to 2.0, encourages new topics) */
    presencePenalty?: number
    /** Stop sequences */
    stopSequences?: string[]

    // AC-03: Tool and workspace bindings
    /** Tools with workspace-specific permissions */
    tools?: AgentToolBinding[]
    /** Workspace availability configuration */
    workspaceBindings?: WorkspaceBinding[]
}

/**
 * Default tools available for agents
 */
const DEFAULT_TOOLS: AgentToolBinding[] = [
    {
        toolId: 'file-read',
        toolName: 'Read Files',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: true, study: true, notes: true }
    },
    {
        toolId: 'file-write',
        toolName: 'Write Files',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: false, study: true, notes: true }
    },
    {
        toolId: 'terminal',
        toolName: 'Terminal Commands',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: false, study: false, notes: false }
    },
    {
        toolId: 'web-search',
        toolName: 'Web Search',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: true, study: true, notes: true }
    }
]

/**
 * Default workspace bindings (available everywhere)
 */
const DEFAULT_WORKSPACE_BINDINGS: WorkspaceBinding[] = [
    { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
    { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
    { workspaceType: 'study', isAvailable: true, uiVariant: 'compact', isDefault: false },
    { workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false }
]

/**
 * Mock agents for development/demo purposes
 *
 * TODO: Replace with TanStack Query + API in Epic 25
 */
export const mockAgents: Agent[] = [
    {
        id: 'agt_001',
        name: 'Coder-Alpha-V2',
        role: 'Frontend Developer',
        status: 'online',
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet',
        description: 'Specialized in React, TypeScript, and component architecture',
        tasksCompleted: 247,
        successRate: 98.5,
        tokensUsed: 1_250_000,
        lastActive: new Date().toISOString(),
        createdAt: '2024-11-15T10:00:00Z',
        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS
    },
    {
        id: 'agt_002',
        name: 'Architect-Prime',
        role: 'System Architect',
        status: 'online',
        provider: 'OpenAI',
        model: 'gpt-4-turbo',
        description: 'Designs system architecture and API contracts',
        tasksCompleted: 89,
        successRate: 96.2,
        tokensUsed: 890_000,
        lastActive: new Date(Date.now() - 300000).toISOString(),
        createdAt: '2024-10-20T14:30:00Z',
        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS
    },
    {
        id: 'agt_003',
        name: 'Code-Reviewer',
        role: 'QA Engineer',
        status: 'busy',
        provider: 'Anthropic',
        model: 'claude-3-opus',
        description: 'Reviews code for quality, security, and best practices',
        tasksCompleted: 412,
        successRate: 99.1,
        tokensUsed: 2_100_000,
        lastActive: new Date(Date.now() - 60000).toISOString(),
        createdAt: '2024-09-05T08:15:00Z',
        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS
    },
    {
        id: 'agt_004',
        name: 'Doc-Writer',
        role: 'Technical Writer',
        status: 'offline',
        provider: 'Mistral',
        model: 'mistral-large-latest',
        description: 'Generates technical documentation and user guides',
        tasksCompleted: 156,
        successRate: 94.8,
        tokensUsed: 670_000,
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        createdAt: '2024-12-01T16:45:00Z',
        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS
    },
    {
        id: 'agt_005',
        name: 'Test-Generator',
        role: 'Test Engineer',
        status: 'online',
        provider: 'Google',
        model: 'gemini-2.0-flash',
        description: 'Creates unit tests and integration test suites',
        tasksCompleted: 318,
        successRate: 97.3,
        tokensUsed: 1_450_000,
        lastActive: new Date(Date.now() - 120000).toISOString(),
        createdAt: '2024-11-28T11:20:00Z',
        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS
    },
    {
        id: 'agt_006',
        name: 'Debug-Detective',
        role: 'Debugger',
        status: 'error',
        provider: 'OpenAI',
        model: 'gpt-4o',
        description: 'Analyzes errors and suggests fixes',
        tasksCompleted: 78,
        successRate: 88.5,
        tokensUsed: 320_000,
        lastActive: new Date(Date.now() - 7200000).toISOString(),
        createdAt: '2024-12-10T09:00:00Z',
        tools: DEFAULT_TOOLS,
        workspaceBindings: DEFAULT_WORKSPACE_BINDINGS
    }
]

export type { Agent as MockAgent }
