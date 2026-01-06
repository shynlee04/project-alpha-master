/**
 * Permission Grid Header Component
 *
 * Header row for workspace permission grid.
 *
 * @layer Presentation
 * @component PermissionGridHeader
 * @parent WorkspaceToolPermissionsConfig
 *
 * December 2025 Patterns:
 * - Single responsibility (header display only)
 * - Responsive (grid layout)
 * - Accessible (semantic structure)
 */

import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types'
import type { WorkspaceLabels, WorkspaceDescriptions } from './types'

export interface PermissionGridHeaderProps {
    workspaceTypes: WorkspaceType[]
    workspaceLabels: WorkspaceLabels
    workspaceDescriptions: WorkspaceDescriptions
}

/**
 * Permission Grid Header Component
 *
 * Displays column headers for workspace types.
 * Shows workspace labels and truncated descriptions.
 */
export function PermissionGridHeader({
    workspaceTypes,
    workspaceLabels,
    workspaceDescriptions
}: PermissionGridHeaderProps) {
    return (
        <div className="grid grid-cols-5 gap-px bg-border">
            {/* Empty cell for corner */}
            <div className="bg-muted p-3 font-medium text-sm">
                Tool \ Workspace
            </div>

            {/* Workspace headers */}
            {workspaceTypes.map((workspace) => (
                <div
                    key={workspace}
                    className="bg-muted p-3 text-center"
                >
                    <div className="font-medium text-sm mb-1">
                        {workspaceLabels[workspace]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {workspaceDescriptions[workspace].split(' ').slice(0, 3).join(' ')}...
                    </div>
                </div>
            ))}
        </div>
    )
}
