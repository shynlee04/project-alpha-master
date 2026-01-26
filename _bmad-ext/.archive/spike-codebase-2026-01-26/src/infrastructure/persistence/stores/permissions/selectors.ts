/**
 * @fileoverview Tool Permission Selectors
 * @module infrastructure/persistence/stores/permissions/selectors
 */

import type { ToolPermissionState, ToolTrustLevel, WorkspaceType } from './types';

/**
 * Check if a tool needs approval in a specific workspace
 * Combines persisted trust level with session trust
 */
export function selectNeedsApproval(toolId: string, workspaceType: WorkspaceType) {
    return (state: ToolPermissionState): boolean => {
        const sessionKey = `${toolId}:${workspaceType}`;

        // Session trust overrides everything
        if (state.sessionTrust.includes(sessionKey)) {
            return false;
        }

        // Check persisted trust level for workspace
        const trustLevel = state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;

        if (trustLevel === 'auto') {
            return false;
        }
        if (trustLevel === 'block') {
            return false; // Blocked tools don't need approval, they're denied
        }

        // 'prompt' or unknown tools need approval
        return true;
    };
}

/**
 * Check if a tool can execute in a specific workspace (not blocked)
 */
export function selectCanExecute(toolId: string, workspaceType: WorkspaceType) {
    return (state: ToolPermissionState): boolean => {
        const sessionKey = `${toolId}:${workspaceType}`;

        // Session trust overrides everything
        if (state.sessionTrust.includes(sessionKey)) {
            return true;
        }

        // Check persisted trust level for workspace
        const trustLevel = state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;
        return trustLevel !== 'block';
    };
}

/**
 * Get all tools by trust level in a specific workspace
 */
export function selectToolsByLevel(workspaceType: WorkspaceType, level: ToolTrustLevel) {
    return (state: ToolPermissionState): string[] => {
        return Object.entries(state.trustLevels)
            .filter(([_, workspaceLevels]) => workspaceLevels[workspaceType] === level)
            .map(([toolId]) => toolId);
    };
}

/**
 * Get trust level for a tool in a workspace (convenience selector)
 */
export function selectTrustLevel(toolId: string, workspaceType: WorkspaceType) {
    return (state: ToolPermissionState): ToolTrustLevel => {
        return state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;
    };
}
