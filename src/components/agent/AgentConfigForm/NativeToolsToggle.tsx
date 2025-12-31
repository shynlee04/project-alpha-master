/**
 * Native Tools Toggle Component
 *
 * Handles enable/disable native tools toggle for OpenAI-compatible providers.
 *
 * @layer Presentation
 * @component NativeToolsToggle
 */

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface NativeToolsToggleProps {
    enabled: boolean
    onChange: (enabled: boolean) => void
}

/**
 * Native Tools Toggle Component
 */
export function NativeToolsToggle({ enabled, onChange }: NativeToolsToggleProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background/50">
            <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                    Enable Native Tools
                </Label>
                <p className="text-xs text-muted-foreground">
                    Allow agent to use function calling (disable if provider returns 400/404)
                </p>
            </div>
            <Switch checked={enabled} onCheckedChange={onChange} />
        </div>
    )
}
