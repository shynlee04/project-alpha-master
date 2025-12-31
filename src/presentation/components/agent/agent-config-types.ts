/**
 * @fileoverview Agent Configuration Types
 * @module components/agent/agent-config-types
 * @governance EPIC-P0.5
 *
 * Type definitions for agent configuration dialog.
 * Extracted from AgentConfigDialog.tsx for better code organization.
 */

import type { Agent } from '@/core/entities/Agent'

/**
 * Connection status type
 */
export type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error'

/**
 * Configuration tab type
 */
export type ConfigTab = 'basic' | 'advanced'

/**
 * Form validation errors type
 */
export type FormErrors = {
    name?: string
    description?: string
    provider?: string
    modelId?: string
    apiKey?: string
    customBaseURL?: string
}

/**
 * Agent configuration dialog props
 * BF-01 FIX: Changed from agent prop to agentId for hot-reload support
 */
export interface AgentConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (agentId: string) => void // BF-01 FIX: Return agentId instead of full agent
    agentId: string | null // BF-01 FIX: Read from store by ID (single source of truth)
}

/**
 * Custom header type for OpenAI Compatible provider
 */
export interface CustomHeader {
    key: string
    value: string
}

/**
 * LLM Parameters for fine-tuning model behavior
 */
export interface LLMParameters {
    temperature: number
    maxTokens: number
    topP: number
    topK?: number
    systemPrompt?: string
}

/**
 * Agent form data interface
 */
export interface AgentFormData {
    name: string
    description: string
    providerId: string
    modelId: string
    apiKey: string
    customBaseURL?: string
    customModelId?: string
    customHeaders?: CustomHeader[]
    enableNativeTools?: boolean
    temperature?: number
    maxTokens?: number
    topP?: number
    topK?: number
    systemPrompt?: string
}

