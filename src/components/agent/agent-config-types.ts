/**
 * @fileoverview Agent Configuration Types
 * @module components/agent/agent-config-types
 * @governance EPIC-P0.5
 *
 * Type definitions for agent configuration dialog.
 * Extracted from AgentConfigDialog.tsx for better code organization.
 */

import type { Agent } from '@/mocks/agents'

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
    provider?: string
    model?: string
    apiKey?: string
    customBaseURL?: string
}

/**
 * Agent configuration dialog props
 */
export interface AgentConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (agent: Agent) => void
    agent?: Agent
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
    role: string
    providerId: string
    model: string
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
