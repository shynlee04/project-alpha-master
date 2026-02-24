/**
 * Permission Switch Component
 *
 * Toggle switch for workspace permissions with integrated status badge.
 *
 * @layer Presentation
 * @component PermissionSwitch
 * @parent WorkspaceToolPermissionsConfig
 *
 * December 2025 Patterns:
 * - Single responsibility (toggle + status display only)
 * - Accessible (proper ARIA labels)
 * - Composable (uses PermissionBadge)
 */

import { Switch } from '@/presentation/components/ui/switch'
import { PermissionBadge } from './PermissionBadge'

export interface PermissionSwitchProps {
    toolId: string
    toolName: string
    workspace: string
    enabled: boolean
    onToggle: (enabled: boolean) => void
    disabled?: boolean
}

/**
 * Permission Switch Component
 *
 * Displays permission status badge alongside toggle switch.
 * Provides clear visual feedback and accessibility support.
 */
export function PermissionSwitch({
    toolId,
    toolName,
    workspace,
    enabled,
    onToggle,
    disabled = false
}: PermissionSwitchProps) {
    return (
        <div className="flex items-center gap-3">
            <PermissionBadge enabled={enabled}>
                {enabled ? 'Enabled' : 'Disabled'}
            </PermissionBadge>
            <Switch
                id={`${toolId}-${workspace}`}
                checked={enabled}
                onCheckedChange={onToggle}
                disabled={disabled}
                aria-label={`Toggle ${toolName} in ${workspace} workspace`}
            />
        </div>
    )
}
