/**
 * Agent Model Selector Component
 *
 * Renders model dropdown with refresh capability and loading state.
 *
 * @layer Presentation
 * @component AgentModelSelector
 */

import { Loader2, RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { Label } from '@/presentation/components/ui/label'
import { Button } from '@/presentation/components/ui/button'
import { cn } from '@/lib/utils'

interface ProviderModel {
    id: string
    name: string
    isFree?: boolean
}

interface AgentModelSelectorProps {
    models: ProviderModel[]
    selectedModel: string
    onModelChange: (model: string) => void
    onRefresh: () => Promise<void>
    isLoading: boolean
    disabled?: boolean
    error?: string
}

/**
 * Agent Model Selector Component
 */
export function AgentModelSelector({
    models,
    selectedModel,
    onModelChange,
    onRefresh,
    isLoading,
    disabled = false,
    error
}: AgentModelSelectorProps) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label>
                    Model <span className="text-destructive">*</span>
                </Label>
                <Button
                    variant="ghost"
                    iconOnly
                    className="h-6 w-6"
                    onClick={async (e) => {
                        e.preventDefault()
                        await onRefresh()
                    }}
                    disabled={isLoading}
                    title="Refresh models"
                >
                    <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                </Button>
            </div>
            <Select
                value={selectedModel}
                onValueChange={onModelChange}
                disabled={disabled || isLoading}
            >
                <SelectTrigger className="rounded-none">
                    <SelectValue placeholder={
                        isLoading
                            ? "Loading models..."
                            : "Select model..."
                    } />
                </SelectTrigger>
                <SelectContent className="rounded-none max-h-60">
                    {models.length === 0 ? (
                        <SelectItem value="none" disabled>
                            No models found
                        </SelectItem>
                    ) : (
                        models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                                {model.name}
                                {model.isFree && (
                                    <span className="ml-2 text-xs text-success">
                                        (Free)
                                    </span>
                                )}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    )
}
