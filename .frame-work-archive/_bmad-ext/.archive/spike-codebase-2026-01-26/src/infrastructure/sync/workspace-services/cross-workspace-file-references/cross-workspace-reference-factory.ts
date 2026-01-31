/**
 * @fileoverview Cross-Workspace Reference Factory Functions
 * @module infrastructure/sync/workspace-services/cross-workspace-file-references/factory
 *
 * Factory functions and singleton pattern for CrossWorkspaceReferenceManager.
 * Part of the split cross-workspace-file-references module.
 *
 * @story ARCH-01.1.2
 */

import { CrossWorkspaceReferenceManager } from './cross-workspace-reference-manager';

export function createCrossWorkspaceReferenceManager(): CrossWorkspaceReferenceManager {
    return new CrossWorkspaceReferenceManager();
}

let defaultManagerInstance: CrossWorkspaceReferenceManager | null = null;

export function getCrossWorkspaceReferenceManager(): CrossWorkspaceReferenceManager {
    if (!defaultManagerInstance) {
        defaultManagerInstance = createCrossWorkspaceReferenceManager();
    }
    return defaultManagerInstance;
}

export function setCrossWorkspaceReferenceManagerForTesting(
    manager: CrossWorkspaceReferenceManager | null
): void {
    defaultManagerInstance = manager;
}
