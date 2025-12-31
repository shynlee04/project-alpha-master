/**
 * Agent Provider Selector Component
 *
 * Renders provider dropdown with icons and free model indicators.
 * Extracted from AgentConfigDialog to meet 120-line component limit.
 *
 * @layer Presentation
 * @component AgentProviderSelector
 */

import { Bot, Settings2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { ProviderConfig } from '@/lib/agent/providers/types'

interface AgentProviderSelectorProps {
    providers: ProviderConfig[]
    selectedProviderId: string
    onProviderChange: (providerId: string) => void
    error?: string
    disabled?: boolean
}

/**
 * Get icon for provider
 */
function getProviderIcon(id: string, _name: string) {
    if (id.includes('openai')) return <Bot className="w-5 h-5" />
    if (id.includes('anthropic')) return <Bot className="w-5 h-5" />
    if (id.includes('google')) return <Bot className="w-5 h-5" />
    return <Settings2 className="w-5 h-5" />
}

/**
 * Agent Provider Selector Component
 */
export function AgentProviderSelector({
    providers,
    selectedProviderId,
    onProviderChange,
    error,
    disabled = false
}: AgentProviderSelectorProps) {
    return (
        <div className="grid gap-2">
            <Label>
                LLM Provider <span className="text-destructive">*</span>
            </Label>
            <Select
                value={selectedProviderId}
                onValueChange={onProviderChange}
                disabled={disabled}
            >
                <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                    {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center gap-2">
                                {getProviderIcon(provider.id, provider.name)}
                                <span>{provider.name}</span>
                                {provider.id === 'openrouter' && (
                                    <span className="ml-2 text-xs text-success">
                                        (Free models available)
                                    </span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    )
}
