/**
 * useAgents Hook - Agent Management State
 * 
 * @epic Epic-28 Story 28-15
 * @roadmap Replace mock with TanStack Query in Epic 25 (Story 25-1)
 * @see _bmad-output/epics/shards/epic-25-ai-foundation.md
 */

import { useState, useCallback } from 'react'
import { mockAgents, type Agent } from '../mocks/agents'

interface UseAgentsReturn {
    agents: Agent[]
    isLoading: boolean
    error: Error | null
    addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => void
    removeAgent: (id: string) => void
    updateAgentStatus: (id: string, status: Agent['status']) => void
    refreshAgents: () => void
}

/**
 * Hook for managing agent state
 * 
 * TODO: Epic 25 - Replace with:
 *   const { data, isLoading, refetch } = useQuery({
 *     queryKey: ['agents'],
 *     queryFn: () => agentApi.getAll()
 *   })
 */
export function useAgents(): UseAgentsReturn {
    const [agents, setAgents] = useState<Agent[]>(mockAgents)
    const [isLoading, setIsLoading] = useState(false)
    const [error] = useState<Error | null>(null)

    /**
     * Simulates adding a new agent
     * TODO: Replace with mutation in Epic 25
     */
    const addAgent = useCallback((agentData: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => {
        const newAgent: Agent = {
            ...agentData,
            id: `agt_${Date.now()}`,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            tasksCompleted: 0,
            successRate: 0,
            tokensUsed: 0,
        }
        setAgents(prev => [...prev, newAgent])
    }, [])

    /**
     * Simulates removing an agent
     * TODO: Replace with mutation in Epic 25
     */
    const removeAgent = useCallback((id: string) => {
        setAgents(prev => prev.filter(a => a.id !== id))
    }, [])

    /**
     * Updates agent status locally
     * TODO: Replace with real-time subscription in Epic 25
     */
    const updateAgentStatus = useCallback((id: string, status: Agent['status']) => {
        setAgents(prev => prev.map(a =>
            a.id === id ? { ...a, status, lastActive: new Date().toISOString() } : a
        ))
    }, [])

    /**
     * Simulates refreshing agents from server
     * TODO: Replace with refetch() in Epic 25
     */
    const refreshAgents = useCallback(() => {
        setIsLoading(true)
        // Simulate network delay
        setTimeout(() => {
            setAgents([...mockAgents])
            setIsLoading(false)
        }, 500)
    }, [])

    return {
        agents,
        isLoading,
        error,
        addAgent,
        removeAgent,
        updateAgentStatus,
        refreshAgents,
    }
}
