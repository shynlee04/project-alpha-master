/**
 * Trust Level Legend Component
 *
 * Displays legend for tool trust levels.
 *
 * @layer Presentation
 * @component TrustLevelLegend
 * @parent ToolTrustLevelManager
 *
 * December 2025 Patterns:
 * - Single responsibility (legend display only)
 * - Accessible (semantic structure)
 * - Reusable (can be used in any trust context)
 */

import { Shield, ShieldAlert, ShieldX } from 'lucide-react'
import type { ToolTrustLevel } from '@/lib/agent/tool-permission-manager'

const TRUST_LEVEL_DESCRIPTIONS: Record<
    ToolTrustLevel,
    { label: string; icon: any }
> = {
    auto: {
        label: 'Auto-Execute',
        icon: Shield,
    },
    prompt: {
        label: 'Require Approval',
        icon: ShieldAlert,
    },
    block: {
        label: 'Blocked',
        icon: ShieldX,
    },
}

/**
 * Trust Level Legend Component
 *
 * Shows all three trust levels with icons and labels.
 * Provides visual guidance for trust level meanings.
 */
export function TrustLevelLegend() {
    return (
        <div className="flex flex-wrap gap-3 text-sm">
            {Object.entries(TRUST_LEVEL_DESCRIPTIONS).map(([level, config]) => {
                const Icon = config.icon
                return (
                    <div key={level} className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{config.label}</span>
                    </div>
                )
            })}
        </div>
    )
}
