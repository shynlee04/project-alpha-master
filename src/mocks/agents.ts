/**
 * Mock Agent Data for VIA-GENT
 * 
 * @epic Epic-28 Story 28-15
 * @roadmap Replace with real API in Epic 25 (AI Foundation)
 * @see _bmad-output/epics/shards/epic-25-ai-foundation.md
 */

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
}

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
        createdAt: '2024-11-15T10:00:00Z'
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
        createdAt: '2024-10-20T14:30:00Z'
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
        createdAt: '2024-09-05T08:15:00Z'
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
        createdAt: '2024-12-01T16:45:00Z'
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
        createdAt: '2024-11-28T11:20:00Z'
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
        createdAt: '2024-12-10T09:00:00Z'
    }
]

export type { Agent as MockAgent }
