/**
 * useAgentFormState - Agent Form State Management Hook
 *
 * Extracted from AgentConfigDialog (Phase 5: 539 → ~200 lines refactoring).
 * Manages all form state, store subscriptions, and local↔store synchronization.
 *
 * @module presentation/components/agent/hooks
 * @governance Ralph Loop Cycle 17, Phase 5
 * @pattern December 2025 React Hooks (single responsibility, shallow comparison)
 */

import { useState, useEffect, useMemo } from 'react'
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents'
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store'
import { credentialVault } from '@/lib/agent/providers'
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus'
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding'
import type { AgentToolBindingProps } from '@/domain/value-objects/tool-permission'

/**
 * Agent form state interface
 */
export interface AgentFormState {
    // Basic fields
    name: string
    description: string
    providerId: string
    modelId: string
    temperature: number
    maxTokens: number
    topP: number
    topK: number | undefined
    systemPrompt: string

    // Advanced settings
    customBaseURL: string
    customModelId: string
    customHeaders: Array<{ key: string; value: string }>
    enableNativeTools: boolean

    // Workspace bindings (WB-8.3)
    workspaceBindings: WorkspaceBindingProps[]

    // Tools array (WB-8.3)
    tools: AgentToolBindingProps[]

    // UI state
    activeTab: 'basic' | 'workspace' | 'advanced'
    isSubmitting: boolean
}

/**
 * Agent form setters interface
 */
export interface AgentFormSetters {
    setName: (value: string) => void
    setDescription: (value: string) => void
    setProviderId: (value: string) => void
    setModelId: (value: string) => void
    setTemperature: (value: number) => void
    setMaxTokens: (value: number) => void
    setTopP: (value: number) => void
    setTopK: (value: number | undefined) => void
    setSystemPrompt: (value: string) => void
    setCustomBaseURL: (value: string) => void
    setCustomModelId: (value: string) => void
    setCustomHeaders: (value: Array<{ key: string; value: string }>) => void
    setEnableNativeTools: (value: boolean) => void
    setWorkspaceBindings: (value: WorkspaceBindingProps[]) => void
    setTools: (value: AgentToolBindingProps[]) => void
    setActiveTab: (value: 'basic' | 'workspace' | 'advanced') => void
    setIsSubmitting: (value: boolean) => void
}

/**
 * useAgentFormState Hook
 *
 * Manages agent form state with local↔store synchronization.
 * Handles new agent creation vs. existing agent editing modes.
 *
 * @param agentId - Agent ID for editing mode (null for new agent)
 * @returns Form state and setters
 */
export function useAgentFormState(agentId: string | null) {
    // Store subscriptions (SELECTIVE - prevent infinite loops)
    // Use individual selectors to avoid infinite re-renders
    const addAgent = useAgentsStore(s => s.addAgent)
    const updateAgent = useAgentsStore(s => s.updateAgent)
    const removeAgent = useAgentsStore(s => s.removeAgent)
    const agent = useAgentsStore(s => s.agents.find(a => a.id === agentId))

    // ✅ useAppStore with individual selectors (fixed infinite loop)
    const providers = useAppStore(s => s.providers)
    const availableModels = useAppStore(s => s.availableModels)
    const storeLoadingModels = useAppStore(s => s.isLoadingModels)
    const fetchModels = useAppStore(s => s.fetchModels)

    // Default workspace bindings (WB-8.3)
    const defaultWorkspaceBindings: WorkspaceBindingProps[] = [
        { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
        { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
        { workspaceType: 'study', isAvailable: true, uiVariant: 'compact', isDefault: false },
        { workspaceType: 'notes', isAvailable: true, uiVariant: 'minimal', isDefault: false },
    ]

    // Default tools array (WB-8.3)
    const defaultTools: AgentToolBindingProps[] = [
        { toolId: 'read_file', toolName: 'Read File', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: true, notes: true } },
        { toolId: 'write_file', toolName: 'Write File', isEnabled: true, workspacePermissions: { ide: true, knowledge: false, study: false, notes: true } },
        { toolId: 'list_files', toolName: 'List Files', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: true, notes: true } },
        { toolId: 'execute_command', toolName: 'Execute Command', isEnabled: true, workspacePermissions: { ide: true, knowledge: false, study: false, notes: false } },
        { toolId: 'synthesize', toolName: 'Synthesize', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
        { toolId: 'process_pdf', toolName: 'Process PDF', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
        { toolId: 'process_image', toolName: 'Process Image', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
        { toolId: 'process_url', toolName: 'Process URL', isEnabled: true, workspacePermissions: { ide: false, knowledge: true, study: true, notes: false } },
    ]

    // Form state
    const [name, setName] = useState(agent?.name || '')
    const [description, setDescription] = useState(agent?.description || '')
    const [providerId, setProviderId] = useState(agent?.providerId || 'openrouter')
    const [modelId, setModelId] = useState(agent?.modelId || '')
    const [temperature, setTemperature] = useState(agent?.temperature ?? 0.7)
    const [maxTokens, setMaxTokens] = useState(agent?.maxTokens ?? 4096)
    const [topP, setTopP] = useState(agent?.topP ?? 0.95)
    const [topK, setTopK] = useState<number | undefined>(agent?.topK)
    const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt || '')
    const [customBaseURL, setCustomBaseURL] = useState('')
    const [customModelId, setCustomModelId] = useState('')
    const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([])
    const [enableNativeTools, setEnableNativeTools] = useState(true)
    const [workspaceBindings, setWorkspaceBindings] = useState<WorkspaceBindingProps[]>(
        agent?.workspaceBindings || defaultWorkspaceBindings
    )
    const [tools, setTools] = useState<AgentToolBindingProps[]>(agent?.tools || defaultTools)
    const [activeTab, setActiveTab] = useState<'basic' | 'workspace' | 'advanced'>('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // FIX-2026-01-07: Force update counter for when models are refreshed externally
    const [modelsUpdateCounter, setModelsUpdateCounter] = useState(0)

    // Initialize credentialVault on mount
    useEffect(() => {
        credentialVault.initialize().catch(console.error)
    }, [])

    // FIX-2026-01-07: Subscribe to ProviderModelsFetched event to force re-render
    // When models are loaded in ProviderConfigDialog after API key save,
    // this hook needs to know to update the models list
    useEffect(() => {
        const handleModelsFetched = (event: { providerId: string; modelCount: number }) => {
            console.log('[useAgentFormState] ProviderModelsFetched event received:', event)
            // If models were fetched for the current provider, force a re-render
            if (event.providerId === providerId) {
                console.log('[useAgentFormState] Models updated for current provider, forcing re-render')
                setModelsUpdateCounter(prev => prev + 1)
            }
        }

        crossWorkspaceEventBus.on('ProviderModelsFetched', handleModelsFetched)

        return () => {
            crossWorkspaceEventBus.off('ProviderModelsFetched', handleModelsFetched)
        }
    }, [providerId])

    // Sync local state when agent changes (e.g., switching between agents)
    useEffect(() => {
        if (agent) {
            setName(agent.name || '')
            setDescription(agent.description || '')
            setProviderId(agent.providerId || 'openrouter')
            setModelId(agent.modelId || '')
            setTemperature(agent.temperature ?? 0.7)
            setMaxTokens(agent.maxTokens ?? 4096)
            setTopP(agent.topP ?? 0.95)
            setTopK(agent.topK)
            setSystemPrompt(agent.systemPrompt || '')
            setWorkspaceBindings(agent.workspaceBindings || defaultWorkspaceBindings)
            setTools(agent.tools || defaultTools)
        } else if (!agentId) {
            // Reset to defaults for new agent
            setName('')
            setDescription('')
            setProviderId('openrouter')
            setModelId('')
            setTemperature(0.7)
            setMaxTokens(4096)
            setTopP(0.95)
            setTopK(undefined)
            setSystemPrompt('')
            setWorkspaceBindings(defaultWorkspaceBindings)
            setTools(defaultTools)
        }
    }, [agent, agentId])

    // Get models for current provider - use useMemo to stabilize array reference
    // CRITICAL: Only watch availableModels[providerId], NOT the entire availableModels object
    // Otherwise, loading models for ANY provider triggers re-render for ALL agents
    // FIX-2026-01-07: Added modelsUpdateCounter to dependency array to force re-render when models are fetched externally
    const models = useMemo(() => availableModels[providerId] || [], [availableModels[providerId], providerId, modelsUpdateCounter])
    const isLoadingModels = useMemo(() => storeLoadingModels[providerId] || false, [storeLoadingModels[providerId], providerId])

    return {
        // Store methods
        addAgent,
        updateAgent,
        removeAgent,
        agent,

        // Provider data
        providers,
        models,
        isLoadingModels,
        fetchModels,

        // Form state
        name,
        description,
        providerId,
        modelId,
        temperature,
        maxTokens,
        topP,
        topK,
        systemPrompt,
        customBaseURL,
        customModelId,
        customHeaders,
        enableNativeTools,
        workspaceBindings,
        tools,
        activeTab,
        isSubmitting,

        // Setters
        setName,
        setDescription,
        setProviderId,
        setModelId,
        setTemperature,
        setMaxTokens,
        setTopP,
        setTopK,
        setSystemPrompt,
        setCustomBaseURL,
        setCustomModelId,
        setCustomHeaders,
        setEnableNativeTools,
        setWorkspaceBindings,
        setTools,
        setActiveTab,
        setIsSubmitting,
    } as const
}
