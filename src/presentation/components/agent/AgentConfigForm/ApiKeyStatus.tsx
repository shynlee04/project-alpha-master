/**
 * API Key Status Component
 *
 * Displays API key status indicator and informational messages.
 *
 * @layer Presentation
 * @component ApiKeyStatus
 */

import { Key, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Label } from '@/presentation/components/ui/label'

interface ApiKeyStatusProps {
    providerId: string
    hasApiKey: boolean
    isCheckingKey: boolean
}

/**
 * API Key Status Component
 */
export function ApiKeyStatus({ providerId, hasApiKey, isCheckingKey }: ApiKeyStatusProps) {
    const isOptional = providerId === 'openrouter' || providerId === 'openai-compatible'

    if (isCheckingKey) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                    {!isOptional && <span className="text-destructive">*</span>}
                </Label>
                {hasApiKey ? (
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                ) : (
                    <XCircle className="w-3 h-3 text-destructive" />
                )}
            </div>

            {providerId === 'openrouter' && !hasApiKey && (
                <p className="text-xs text-info mt-2">
                    Free models work without API key. Add key for premium models.
                </p>
            )}

            {providerId === 'openai-compatible' && !hasApiKey && (
                <p className="text-xs text-info mt-2">
                    For local providers like LM Studio or Ollama, API key may not be required.
                </p>
            )}
        </div>
    )
}
