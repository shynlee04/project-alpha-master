/**
 * Permission Badge Component
 *
 * Displays enabled/disabled status for workspace permissions.
 *
 * @layer Presentation
 * @component PermissionBadge
 * @parent WorkspaceToolPermissionsConfig
 *
 * December 2025 Patterns:
 * - Single responsibility (status display only)
 * - Accessible (color + icon redundancy)
 * - Reusable (can be used in any permission context)
 */

import { Check, X } from 'lucide-react'
import { Badge } from '@/presentation/components/ui/badge'
import { cn } from '@/lib/utils'

export interface PermissionBadgeProps {
    enabled: boolean
    children?: React.ReactNode
}

/**
 * Permission Badge Component
 *
 * Shows green badge with check icon when enabled, red badge with X icon when disabled.
 * Provides clear visual feedback for permission states.
 */
export function PermissionBadge({ enabled, children }: PermissionBadgeProps) {
    const config = enabled
        ? 'bg-green-500/20 text-green-500 border-green-500/30'
        : 'bg-red-500/20 text-red-500 border-red-500/30'

    const Icon = enabled ? Check : X

    return (
        <Badge variant="outline" className={cn('text-xs', config)}>
            <Icon className="w-3 h-3 mr-1" />
            {children || (enabled ? 'Enabled' : 'Disabled')}
        </Badge>
    )
}
