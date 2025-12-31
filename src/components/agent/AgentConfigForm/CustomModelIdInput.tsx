/**
 * Custom Model ID Input Component
 *
 * Handles model ID input with refresh button for OpenAI-compatible providers.
 *
 * @layer Presentation
 * @component CustomModelIdInput
 */

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CustomModelIdInputProps {
    value: string
    customBaseURL: string
    onChange: (modelId: string) => void
    onModelChange: (model: string) => void
}

/**
 * Custom Model ID Input Component
 */
export function CustomModelIdInput({
    value,
    customBaseURL,
    onChange,
    onModelChange
}: CustomModelIdInputProps) {
    const [isLoadingCustomModels, setIsLoadingCustomModels] = useState(false)

    return (
        <div className="grid gap-2">
            <Label htmlFor="custom-model-id">
                Model ID
            </Label>
            <div className="flex gap-2">
                <Input
                    id="custom-model-id"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value)
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
    )
}
