/**
 * @fileoverview Cross-Workspace File Reference Type Definitions
 * @module infrastructure/sync/workspace-services/cross-workspace-file-references/types
 *
 * Type definitions for cross-workspace file references.
 * Part of the split cross-workspace-file-references module.
 *
 * @story ARCH-01.1.2
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { FileMetadata } from '../file-sync-service';

/**
 * Cross-workspace file reference types
 */
export type ReferenceType = 'link' | 'embed' | 'cite';

/**
 * Reasons why a reference is broken
 */
export type BrokenReferenceReason = 'not_found' | 'permission_denied' | 'workspace_not_mounted';

/**
 * Cross-workspace file reference
 *
 * Represents a reference from one workspace to a file in another workspace.
 * For example, a Note in Notes workspace referencing a PDF in IDE workspace.
 */
export interface CrossWorkspaceFileReference {
    /** Unique reference ID */
    id: string;
    /** Workspace creating the reference */
    sourceWorkspace: WorkspaceType;
    /** Workspace containing the referenced file */
    targetWorkspace: WorkspaceType;
    /** Path to the referenced file (relative to target workspace root) */
    targetFilePath: string;
    /** Type of reference */
    referenceType: ReferenceType;
    /** Timestamp when reference was created */
    createdAt: number;
    /** Optional metadata about the reference */
    metadata?: {
        title?: string;
        description?: string;
        noteId?: string;
        sourceId?: string;
        flashcardId?: string;
    };
}

/**
 * Resolved file reference
 *
 * Result of resolving a cross-workspace reference, including
 * the file content and metadata if the file exists.
 */
export interface ResolvedReference {
    /** The original reference */
    reference: CrossWorkspaceFileReference;
    /** File content (if file exists) */
    fileContent?: string;
    /** File metadata (if file exists) */
    fileMetadata?: FileMetadata;
    /** Whether the referenced file exists */
    exists: boolean;
    /** Reason why reference is broken (if exists is false) */
    brokenReason?: BrokenReferenceReason;
}

/**
 * Reference creation options
 */
export interface CreateReferenceOptions {
    sourceWorkspace: WorkspaceType;
    targetWorkspace: WorkspaceType;
    targetFilePath: string;
    referenceType: ReferenceType;
    metadata?: Record<string, unknown>;
}
