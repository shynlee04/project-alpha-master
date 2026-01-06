/**
 * @fileoverview Workspace Tool Permissions Configuration
 * @module components/agent/WorkspaceToolPermissionsConfig
 *
 * Grid UI for configuring workspace-specific tool permissions.
 * Allows users to enable/disable tools per workspace for each agent.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Security & Workspace Boundaries
 *
 * Ralph Loop Cycle 17 Phase 2:
 * - Refactored from 318 lines to ~100 lines (69% reduction)
 * - Split into 7 focused components + 1 custom hook
 * - December 2025 React patterns applied
 *
 * December 2025 Patterns:
 * - Single responsibility (orchestration only)
 * - Component composition (uses split components)
 * - Custom hooks for business logic
 * - Accessible form controls (proper labels and ARIA)
 * - Clear visual feedback (color-coded permission states)
 */

import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/core/entities/Agent'
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types'
import { Badge } from '@/presentation/components/ui/badge'
import {
    PermissionGridHeader,
    ToolPermissionRow,
    PermissionLegend,
    useWorkspacePermissions,
} from './WorkspacePermissions'

/**
 * Workspace metadata for display
 */
const WORKSPACE_LABELS: Record<WorkspaceType, string> = {
    ide: 'IDE',
    knowledge: 'Knowledge',
    study: 'Study',
    notes: 'Notes',
}

const WORKSPACE_DESCRIPTIONS: Record<WorkspaceType, string> = {
    ide: 'Full development environment with file and terminal access',
    knowledge: 'Knowledge synthesis and research tools',
    study: 'Focused study mode with limited tools',
    notes: 'Minimal note-taking interface',
}

/**
 * Props for WorkspaceToolPermissionsConfig component
 */
export interface WorkspaceToolPermissionsConfigProps {
    /** Agent to configure permissions for */
    agent: Agent

    /** Callback when permissions change */
    onPermissionsChange: (
        toolId: string,
        workspaceType: WorkspaceType,
        isEnabled: boolean
    ) => void

    /** CSS class name */
    className?: string
}

/**
 * Workspace Tool Permissions Configuration Component
 *
 * Orchestrator component that displays a grid of tools (rows) × workspaces (columns)
 * with switches to enable/disable tool access in each workspace.
 *
 * @example
 * ```tsx
 * <WorkspaceToolPermissionsConfig
 *   agent={agent}
 *   onPermissionsChange={(toolId, workspace, isEnabled) => {
 *     console.log(`${toolId} in ${workspace}: ${isEnabled}`);
 *   }}
 * />
 * ```
 */
export function WorkspaceToolPermissionsConfig({
    agent,
    onPermissionsChange,
    className,
}: WorkspaceToolPermissionsConfigProps) {
    // Business logic extracted to custom hook
    const { tools, workspaceTypes, isToolEnabledInWorkspace, handlePermissionToggle } =
        useWorkspacePermissions({ agent, onPermissionsChange })

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Workspace Tool Permissions</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    Configure which tools are available in each workspace. Use the switches
                    below to enable or disable tool access per workspace.
                </p>
            </div>

            {/* Permission Grid */}
            <div className="border rounded-lg overflow-hidden">
                {/* Header Row */}
                <PermissionGridHeader
                    workspaceTypes={workspaceTypes}
                    workspaceLabels={WORKSPACE_LABELS}
                    workspaceDescriptions={WORKSPACE_DESCRIPTIONS}
                />

                {/* Tool Rows */}
                {tools.map((tool, index) => (
                    <ToolPermissionRow
                        key={tool.toolId}
                        tool={tool}
                        workspaceTypes={workspaceTypes}
                        workspaceLabels={WORKSPACE_LABELS}
                        isEnabled={isToolEnabledInWorkspace}
                        onToggle={handlePermissionToggle}
                        index={index}
                    />
                ))}
            </div>

            {/* Legend and Info */}
            <PermissionLegend />
        </div>
    )
}

/**
 * Workspace permissions summary component
 *
 * Displays a compact summary of tool permissions across workspaces.
 */
export interface WorkspacePermissionsSummaryProps {
    agent: Agent
    className?: string
}

export function WorkspacePermissionsSummary({
    agent,
    className,
}: WorkspacePermissionsSummaryProps) {
    const workspaceTypes: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes']

    const counts = workspaceTypes.map((workspace) => {
        const enabled = agent.tools.filter(
            (tool) => tool.workspacePermissions[workspace]
        ).length
        const total = agent.tools.length
        const percentage = Math.round((enabled / total) * 100)

        return { workspace, enabled, total, percentage }
    })

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {counts.map(({ workspace, enabled, total, percentage }) => (
                <Badge key={workspace} variant="outline" className="text-xs">
                    {WORKSPACE_LABELS[workspace]}: {enabled}/{total} ({percentage}%)
                </Badge>
            ))}
        </div>
    )
}
