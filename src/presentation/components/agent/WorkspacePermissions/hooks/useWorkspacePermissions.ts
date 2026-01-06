/**
 * Workspace Permissions Hook
 *
 * Business logic for workspace tool permissions.
 *
 * @module WorkspacePermissions/hooks/useWorkspacePermissions
 * @layer Presentation
 * @hook useWorkspacePermissions
 *
 * December 2025 Patterns:
 * - Custom hooks for business logic
 * - Memoized computations
 * - Callback stability
 */

import { useMemo, useCallback } from 'react'
import type { Agent } from '@/core/entities/Agent'
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types'
import type { ToolPermission, PermissionChecker, PermissionToggleHandler } from '../types'

export interface UseWorkspacePermissionsParams {
    agent: Agent
    onPermissionsChange: (toolId: string, workspaceType: WorkspaceType, isEnabled: boolean) => void
}

export interface UseWorkspacePermissionsReturn {
    tools: ToolPermission[]
    workspaceTypes: WorkspaceType[]
    isToolEnabledInWorkspace: PermissionChecker
    handlePermissionToggle: PermissionToggleHandler
}

/**
 * Workspace Permissions Hook
 *
 * Extracts business logic from WorkspaceToolPermissionsConfig component.
 * Provides tools list, permission checking, and toggle handling.
 */
export function useWorkspacePermissions({
    agent,
    onPermissionsChange
}: UseWorkspacePermissionsParams): UseWorkspacePermissionsReturn {
    // Extract unique tools from agent configuration
    const tools = useMemo(() => {
        return agent.tools.map((tool) => ({
            toolId: tool.toolId,
            toolName: tool.toolName,
        }))
    }, [agent.tools])

    // Get list of workspace types
    const workspaceTypes: WorkspaceType[] = useMemo(
        () => ['ide', 'knowledge', 'study', 'notes'],
        []
    )

    // Check if tool is enabled in workspace
    const isToolEnabledInWorkspace: PermissionChecker = useCallback(
        (toolId: string, workspaceType: WorkspaceType): boolean => {
            const tool = agent.tools.find((t) => t.toolId === toolId)
            if (!tool) return false
            return tool.workspacePermissions[workspaceType] ?? false
        },
        [agent.tools]
    )

    // Handle permission toggle
    const handlePermissionToggle: PermissionToggleHandler = useCallback(
        (toolId: string, workspaceType: WorkspaceType, enabled: boolean) => {
            onPermissionsChange(toolId, workspaceType, enabled)
        },
        [onPermissionsChange]
    )

    return {
        tools,
        workspaceTypes,
        isToolEnabledInWorkspace,
        handlePermissionToggle,
    }
}
