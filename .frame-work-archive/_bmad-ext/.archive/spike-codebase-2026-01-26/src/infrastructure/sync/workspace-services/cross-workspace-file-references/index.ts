/**
 * @fileoverview Cross-Workspace File References Barrel Export
 * @module infrastructure/sync/workspace-services/cross-workspace-file-references
 *
 * Public API barrel for cross-workspace file reference system.
 * Re-exports all types and manager functions from sub-modules.
 *
 * @story ARCH-01.1.2
 */

// Re-export types
export type {
    ReferenceType,
    BrokenReferenceReason,
    CrossWorkspaceFileReference,
    ResolvedReference,
    CreateReferenceOptions
} from './cross-workspace-reference-types';

// Re-export manager class
export { CrossWorkspaceReferenceManager } from './cross-workspace-reference-manager';

// Re-export factory functions
export {
    createCrossWorkspaceReferenceManager,
    getCrossWorkspaceReferenceManager,
    setCrossWorkspaceReferenceManagerForTesting
} from './cross-workspace-reference-factory';
