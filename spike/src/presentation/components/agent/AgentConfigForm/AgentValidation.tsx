/**
 * Agent Validation Component
 *
 * Displays validation errors for agent configuration.
 *
 * @layer Presentation
 * @component AgentValidation
 */

import { AlertCircle } from 'lucide-react'

interface AgentValidationProps {
    errors?: {
        name?: string
        provider?: string
        model?: string
        apiKey?: string
        customBaseURL?: string
    }
}

/**
 * Agent Validation Component
 */
export function AgentValidation({ errors }: AgentValidationProps) {
    if (!errors || Object.keys(errors).length === 0) {
        return null
    }

    return (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-none">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-destructive">
                    Please fix the following errors:
                </p>
                <ul className="text-xs text-destructive/80 list-disc list-inside space-y-0.5">
                    {errors.name && <li>{errors.name}</li>}
                    {errors.provider && <li>{errors.provider}</li>}
                    {errors.model && <li>{errors.model}</li>}
                    {errors.apiKey && <li>{errors.apiKey}</li>}
                    {errors.customBaseURL && <li>{errors.customBaseURL}</li>}
                </ul>
            </div>
        </div>
    )
}
