/**
 * OpenAI Compatible Settings Component
 *
 * Orchestrates OpenAI-compatible provider settings.
 *
 * @layer Presentation
 * @component OpenAICompatibleSettings
 */

import { BaseUrlInput } from './BaseUrlInput'
import { CustomModelIdInput } from './CustomModelIdInput'
import { NativeToolsToggle } from './NativeToolsToggle'

interface OpenAICompatibleSettingsProps {
    customBaseURL: string
    customModelId: string
    enableNativeTools: boolean
    onCustomBaseURLChange: (url: string) => void
    onCustomModelIdChange: (modelId: string) => void
    onEnableNativeToolsChange: (enabled: boolean) => void
    onModelChange: (model: string) => void
    errors?: {
        customBaseURL?: string
    }
}

/**
 * OpenAI Compatible Settings Component
 */
export function OpenAICompatibleSettings({
    customBaseURL,
    customModelId,
    enableNativeTools,
    onCustomBaseURLChange,
    onCustomModelIdChange,
    onEnableNativeToolsChange,
    onModelChange,
    errors
}: OpenAICompatibleSettingsProps) {
    return (
        <div className="border border-border bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <span className="text-primary">⚙️</span>
                <span>OpenAI Compatible Provider</span>
            </div>
            <p className="text-xs text-muted-foreground">
                Connect to any OpenAI-compatible API endpoint
            </p>

            <BaseUrlInput
                value={customBaseURL}
                onChange={onCustomBaseURLChange}
                error={errors?.customBaseURL}
            />

            <CustomModelIdInput
                value={customModelId}
                customBaseURL={customBaseURL}
                onChange={onCustomModelIdChange}
                onModelChange={onModelChange}
            />

            <NativeToolsToggle
                enabled={enableNativeTools}
                onChange={onEnableNativeToolsChange}
            />
        </div>
    )
}
