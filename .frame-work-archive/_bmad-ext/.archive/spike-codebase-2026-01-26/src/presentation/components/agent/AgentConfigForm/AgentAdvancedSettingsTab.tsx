/**
 * Agent Advanced Settings Tab Component
 *
 * Orchestrates advanced settings for OpenAI-compatible providers.
 *
 * @layer Presentation
 * @component AgentAdvancedSettingsTab
 */

import { OpenAICompatibleSettings } from './OpenAICompatibleSettings'
import { CustomHeadersEditor } from './CustomHeadersEditor'

interface AgentAdvancedSettingsTabProps {
    providerId: string
    customBaseURL: string
    customModelId: string
    customHeaders: Array<{ key: string; value: string }>
    enableNativeTools: boolean
    onCustomBaseURLChange: (url: string) => void
    onCustomModelIdChange: (modelId: string) => void
    onCustomHeadersChange: (headers: Array<{ key: string; value: string }>) => void
    onEnableNativeToolsChange: (enabled: boolean) => void
    onModelChange: (model: string) => void
    errors?: {
        customBaseURL?: string
    }
}

/**
 * Agent Advanced Settings Tab Component
 */
export function AgentAdvancedSettingsTab({
    providerId,
    customBaseURL,
    customModelId,
    customHeaders,
    enableNativeTools,
    onCustomBaseURLChange,
    onCustomModelIdChange,
    onCustomHeadersChange,
    onEnableNativeToolsChange,
    onModelChange,
    errors
}: AgentAdvancedSettingsTabProps) {
    // Only show OpenAI-compatible section for that provider
    if (providerId !== 'openai-compatible') {
        return (
            <div className="text-sm text-muted-foreground p-4 text-center">
                No advanced settings available for this provider.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <OpenAICompatibleSettings
                customBaseURL={customBaseURL}
                customModelId={customModelId}
                enableNativeTools={enableNativeTools}
                onCustomBaseURLChange={onCustomBaseURLChange}
                onCustomModelIdChange={onCustomModelIdChange}
                onEnableNativeToolsChange={onEnableNativeToolsChange}
                onModelChange={onModelChange}
                errors={errors}
            />
            <CustomHeadersEditor
                headers={customHeaders}
                onHeadersChange={onCustomHeadersChange}
            />
        </div>
    )
}
