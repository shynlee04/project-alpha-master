/**
 * Tool Trust Row Component
 *
 * Single row in tool trust levels grid.
 *
 * @layer Presentation
 * @component ToolTrustRow
 * @parent ToolTrustLevelManager
 *
 * December 2025 Patterns:
 * - Single responsibility (single tool row only)
 * - Accessible (proper labels)
 * - Composable (uses Select component)
 */

import { Shield, ShieldAlert, ShieldX } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { Badge } from '@/presentation/components/ui/badge'
import type { ToolTrustLevel } from '@/lib/agent/tool-permission-manager'

const TRUST_LEVEL_DESCRIPTIONS: Record<
    ToolTrustLevel,
    { label: string; color: string; icon: any }
> = {
    auto: {
        label: 'Auto-Execute',
        color: 'bg-success/10 text-success border-success/20',
        icon: Shield,
    },
    prompt: {
        label: 'Require Approval',
        color: 'bg-warning/10 text-warning border-warning/20',
        icon: ShieldAlert,
    },
    block: {
        label: 'Blocked',
        color: 'bg-destructive/10 text-destructive border-destructive/20',
        icon: ShieldX,
    },
}

interface ToolTrustConfig {
    toolId: string
    toolName: string
    trustLevel: ToolTrustLevel
}

export interface ToolTrustRowProps {
    tool: ToolTrustConfig
    onTrustLevelChange: (toolId: string, newLevel: ToolTrustLevel) => void
}

/**
 * Tool Trust Row Component
 *
 * Displays tool name, current trust level badge, and dropdown selector.
 * Allows users to change trust level for individual tools.
 */
export function ToolTrustRow({ tool, onTrustLevelChange }: ToolTrustRowProps) {
    const config = TRUST_LEVEL_DESCRIPTIONS[tool.trustLevel]
    const Icon = config.icon

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tool.toolName}</span>
                <Badge className={config.color}>{config.label}</Badge>
            </div>

            <Select
                value={tool.trustLevel}
                onValueChange={(value) => onTrustLevelChange(tool.toolId, value as ToolTrustLevel)}
            >
                <SelectTrigger className="w-[160px] font-pixel">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(TRUST_LEVEL_DESCRIPTIONS).map(([level, config]) => (
                        <SelectItem key={level} value={level}>
                            <div className="flex items-center gap-2">
                                {level === 'auto' && <Shield className="w-4 h-4 text-success" />}
                                {level === 'prompt' && <ShieldAlert className="w-4 h-4 text-warning" />}
                                {level === 'block' && <ShieldX className="w-4 h-4 text-destructive" />}
                                {config.label}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
