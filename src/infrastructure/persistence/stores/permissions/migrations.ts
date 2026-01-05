/**
 * @fileoverview Tool Permission Migrations
 * @module infrastructure/persistence/stores/permissions/migrations
 */

import type { ToolPermissionState, ToolTrustLevel } from './types';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import {
    DEFAULT_YOLO_MODE,
    createDefaultCategoryApprovals,
    ALL_WORKSPACES
} from './constants';

/**
 * Migration function: v1 (flat) → v2 (workspace-scoped) → v3 (YOLO + categories)
 */
export const migrateToolPermissions = (persistedState: any, version: number): ToolPermissionState | any => {
    // v1 → v2 migration: Flat to workspace-scoped
    if (version === 1) {
        const legacyState = persistedState as {
            trustLevels: Record<string, ToolTrustLevel>;
            sessionTrust: string[];
        };

        // Migrate flat trust levels to workspace-scoped
        const workspaceScopedLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>> = {};

        for (const [toolId, level] of Object.entries(legacyState.trustLevels)) {
            // Replicate existing global level to all workspaces
            workspaceScopedLevels[toolId] = {
                ide: level,
                knowledge: level,
                notes: level,
                study: level,
            };
        }

        // Migrate session trust to workspace-scoped format
        const workspaceScopedSession: string[] = [];
        for (const toolId of legacyState.sessionTrust) {
            for (const workspace of ALL_WORKSPACES) {
                workspaceScopedSession.push(`${toolId}:${workspace}`);
            }
        }

        return {
            trustLevels: workspaceScopedLevels,
            defaultTrustLevel: 'prompt',
            sessionTrust: workspaceScopedSession,
            yoloMode: DEFAULT_YOLO_MODE,
            categoryApprovals: createDefaultCategoryApprovals(),
            version: 3,
        };
    }

    // v2 → v3 migration: Add YOLO mode and category approvals
    if (version === 2) {
        const v2State = persistedState as ToolPermissionState;
        return {
            ...v2State,
            yoloMode: DEFAULT_YOLO_MODE,
            categoryApprovals: createDefaultCategoryApprovals(),
            version: 3,
        };
    }

    // Already v3 or higher - return as-is
    return persistedState as ToolPermissionState;
};
