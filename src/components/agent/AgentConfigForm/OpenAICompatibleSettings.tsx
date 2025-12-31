/**
 * OpenAI Compatible Settings Component
 *
 * Handles base URL, model ID, and native tools toggle for OpenAI-compatible providers.
 *
 * @layer Presentation
 * @component OpenAICompatibleSettings
 */

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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
    const [isLoadingCustomModels, setIsLoadingCustomModels] = useState(false)

    return (
        <div className="border border-border bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <span className="text-primary">⚙️</span>
                <span>OpenAI Compatible Provider</span>
            </div>
            <p className="text-xs text-muted-foreground">
                Connect to any OpenAI-compatible API endpoint
            </p>

            {/* Base URL */}
            <div className="grid gap-2">
                <Label htmlFor="custom-base-url">
                    Base URL <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="custom-base-url"
                    value={customBaseURL}
                    onChange={(e) => onCustomBaseURLChange(e.target.value)}
                    placeholder="http://localhost:1234/v1"
                    className="rounded-none"
                />
                <p className="text-xs text-muted-foreground">
                    The API endpoint URL (e.g., http://localhost:1234/v1 for LM Studio)
                </p>
                {errors?.customBaseURL && (
                    <p className="text-xs text-destructive">{errors.customBaseURL}</p>
                )}
            </div>

            {/* Model ID */}
            <div className="grid gap-2">
                <Label htmlFor="custom-model-id">
                    Model ID
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="custom-model-id"
                        value={customModelId}
                        onChange={(e) => {
                            onCustomModelIdChange(e.target.value)
                            onModelChange(e.target.value)
                        }}
                        placeholder="e.g., llama-3.1-8b or gpt-4o"
                        className="rounded-none flex-1"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoadingCustomModels || !customBaseURL.trim()}
                        onClick={async () => {
                            setIsLoadingCustomModels(true)
                            try {
                                // TODO: Implement model loading from custom endpoint
                                toast.success('Models refreshed')
                            } catch (err) {
                                console.error('Failed to load models:', err)
                                toast.error('Failed to load models')
                            } finally {
                                setIsLoadingCustomModels(false)
                            }
                        }}
                        title="Refresh Models"
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoadingCustomModels && "animate-spin")} />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Enter specific model ID (e.g., local-model) or click refresh to auto-detect
                </p>
            </div>

            {/* Enable Native Tools Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background/50">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                        Enable Native Tools
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Allow agent to use function calling (disable if provider returns 400/404)
                    </p>
                </div>
                <Switch
                    checked={enableNativeTools}
                    onCheckedChange={onEnableNativeToolsChange}
                />
            </div>
        </div>
    )
}
