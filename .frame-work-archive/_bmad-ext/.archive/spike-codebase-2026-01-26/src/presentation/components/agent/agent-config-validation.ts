/**
 * @fileoverview Agent Configuration Validation
 * @module components/agent/agent-config-validation
 * @governance EPIC-P0.5
 *
 * Form validation schema and functions for agent configuration.
 * Extracted from AgentConfigDialog.tsx for better code organization.
 */

import { z } from 'zod'

// Re-export FormErrors for backward compatibility
export type { FormErrors } from './agent-config-types'
import type { FormErrors } from './agent-config-types'

/**
 * Form validation schema using Zod
 */
export const agentFormSchema = z.object({
    name: z.string().min(1, 'agents.config.validation.nameRequired'),
    role: z.string().optional(),
    providerId: z.string().min(1, 'agents.config.validation.providerRequired'),
    model: z.string().optional(),
    apiKey: z.string().optional(),
    // CC-2025-12-29: Allow empty string OR valid URL, not just valid URL
    customBaseURL: z.string().optional().refine(
        (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
        { message: 'agents.config.validation.invalidUrl' }
    ),
    customModelId: z.string().optional(),
    customHeaders: z.array(
        z.object({
            key: z.string().min(1),
            value: z.string(),
        })
    ).optional(),
    enableNativeTools: z.boolean().optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    topP: z.number().optional(),
    topK: z.number().optional(),
    systemPrompt: z.string().optional(),
})

export type AgentFormData = z.infer<typeof agentFormSchema>

/**
 * Validate form data using Zod schema
 *
 * @param formData - Form data to validate
 * @returns Object with success flag and errors if any
 */
export function validateAgentForm(formData: AgentFormData): {
    success: boolean
    errors: FormErrors
} {
    const result = agentFormSchema.safeParse(formData)

    if (!result.success) {
        const formattedErrors: FormErrors = {}
        result.error.issues.forEach((issue) => {
            const path = issue.path[0] as keyof FormErrors
            formattedErrors[path] = issue.message
        })
        return { success: false, errors: formattedErrors }
    }

    return { success: true, errors: {} }
}

/**
 * Additional validation for model selection
 * Checks if model is required and provided
 *
 * @param providerId - Provider ID
 * @param model - Selected model
 * @returns Error message if validation fails, undefined otherwise
 */
export function validateModelSelection(
    providerId: string,
    model: string
): string | undefined {
    if (providerId !== 'openai-compatible' && !model.trim()) {
        return 'agents.config.validation.modelRequired'
    }
    return undefined
}

/**
 * Additional validation for OpenAI Compatible provider
 * Checks if required fields are present
 *
 * @param providerId - Provider ID
 * @param customBaseURL - Custom base URL
 * @param customModelId - Custom model ID
 * @returns Error message if validation fails, undefined otherwise
 */
export function validateOpenAICompatible(
    providerId: string,
    customBaseURL: string,
    _customModelId: string
): string | undefined {
    if (providerId === 'openai-compatible') {
        if (!customBaseURL.trim()) {
            return 'agents.config.validation.baseUrlRequired'
        }
    }
    return undefined
}
