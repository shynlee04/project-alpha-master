/**
 * Tool Permission Row Component
 *
 * Single row in workspace permission grid for one tool.
 *
 * @layer Presentation
 * @component ToolPermissionRow
 * @parent WorkspaceToolPermissionsConfig
 *
 * December 2025 Patterns:
 * - Single responsibility (single tool row only)
 * - Accessible (proper labels)
 * - Composable (uses PermissionSwitch)
 */

import { cn } from '@/lib/utils'
import type { WorkspaceType } from '@/lib/state/workspace-types'
import type { ToolPermission, PermissionChecker, PermissionToggleHandler } from './types'
import { PermissionSwitch } from './PermissionSwitch'

interface ToolPermissionRowProps {
    tool: ToolPermission
    workspaceTypes: WorkspaceType[]
    workspaceLabels: Record<WorkspaceType, string>
    isEnabled: PermissionChecker
    onToggle: PermissionToggleHandler
    index: number
}

/**
 * Tool Permission Row Component
 *
 * Displays tool name and permission switches for all workspace types.
 * Uses alternating row colors for readability.
 */
export function ToolPermissionRow({
    tool,
    workspaceTypes,
    workspaceLabels,
    isEnabled,
    onToggle,
    index
}: ToolPermissionRowProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-5 gap-px bg-border',
                index % 2 === 0 ? 'bg-background/50' : 'bg-background'
            )}
        >
            {/* Tool Name */}
            <div className="bg-background p-3 flex items-center">
                <span className="font-medium text-sm">{tool.toolName}</span>
            </div>

            {/* Workspace Permission Switches */}
            {workspaceTypes.map((workspace) => {
                const enabled = isEnabled(tool.toolId, workspace)

                return (
                    <div
                        key={`${tool.toolId}-${workspace}`}
                        className="bg-background p-3 flex items-center justify-center"
                    >
                        <PermissionSwitch
                            toolId={tool.toolId}
                            toolName={tool.toolName}
                            workspace={workspaceLabels[workspace]}
                            enabled={enabled}
                            onToggle={(enabled) => onToggle(tool.toolId, workspace, enabled)}
                        />
                    </div>
                )
            })}
        </div>
    )
}
