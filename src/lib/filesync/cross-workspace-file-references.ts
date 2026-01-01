/**
 * @fileoverview Cross-Workspace File Reference System
 * @module lib/filesync/cross-workspace-file-references
 *
 * Data structures and manager for cross-workspace file references.
 * Allows Notes, Study, and Knowledge workspaces to reference files from IDE workspace.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { FileMetadata } from './file-sync-service';
import type { FileSyncService } from './file-sync-service';
import { WorkspacePermissionManager } from '@/lib/agent/workspace-permission-manager';
import { getToolPermissionManager } from '@/lib/agent/tool-permission-manager';

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

/**
 * Cross-Workspace Reference Manager
 *
 * Manages file references across workspace boundaries.
 * Provides permission checking, validation, and broken link detection.
 *
 * Features:
 * - Create and delete references
 * - Resolve references with permission checking
 * - Detect broken references
 * - Query references by workspace
 */
export class CrossWorkspaceReferenceManager {
    private references: Map<string, CrossWorkspaceFileReference>;
    private fileSyncServices: Map<WorkspaceType, FileSyncService>;
    private permissionManager: WorkspacePermissionManager;

    constructor() {
        this.references = new Map();
        this.fileSyncServices = new Map();
        // Initialize workspace permission manager
        const basePermissionManager = getToolPermissionManager();
        this.permissionManager = new WorkspacePermissionManager(basePermissionManager);
    }

    /**
     * Register a file sync service for a workspace
     */
    registerFileSyncService(workspace: WorkspaceType, service: FileSyncService): void {
        this.fileSyncServices.set(workspace, service);
    }

    /**
     * Unregister a file sync service
     */
    unregisterFileSyncService(workspace: WorkspaceType): void {
        this.fileSyncServices.delete(workspace);
    }

    /**
     * Create a new cross-workspace reference
     *
     * @returns Reference ID
     */
    async createReference(options: CreateReferenceOptions): Promise<string> {
        const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const reference: CrossWorkspaceFileReference = {
            id,
            sourceWorkspace: options.sourceWorkspace,
            targetWorkspace: options.targetWorkspace,
            targetFilePath: options.targetFilePath,
            referenceType: options.referenceType,
            createdAt: Date.now(),
            metadata: options.metadata as CrossWorkspaceFileReference['metadata']
        };

        this.references.set(id, reference);

        console.log(
            `[CrossWorkspaceReferenceManager] Created reference: ${options.sourceWorkspace} -> ${options.targetWorkspace}:${options.targetFilePath}`
        );

        return id;
    }

    /**
     * Resolve a reference by ID
     *
     * Attempts to read the referenced file and return its content.
     * Checks workspace permissions and file existence.
     */
    async resolveReference(referenceId: string): Promise<ResolvedReference> {
        const reference = this.references.get(referenceId);

        if (!reference) {
            throw new Error(`Reference not found: ${referenceId}`);
        }

        // Check workspace permission
        const hasPermission = await this.checkWorkspacePermission(
            reference.sourceWorkspace,
            reference.targetWorkspace
        );

        if (!hasPermission) {
            return {
                reference,
                exists: false,
                brokenReason: 'permission_denied'
            };
        }

        // Get file sync service for target workspace
        const fileSyncService = this.fileSyncServices.get(reference.targetWorkspace);

        if (!fileSyncService) {
            return {
                reference,
                exists: false,
                brokenReason: 'workspace_not_mounted'
            };
        }

        // Try to read file
        try {
            const content = await fileSyncService.readFile(reference.targetFilePath);
            const metadata = await fileSyncService.getFileMetadata(reference.targetFilePath);

            return {
                reference,
                fileContent: content,
                fileMetadata: metadata,
                exists: true
            };
        } catch (error) {
            return {
                reference,
                exists: false,
                brokenReason: 'not_found'
            };
        }
    }

    /**
     * Validate a reference without reading file content
     *
     * Faster than resolveReference() for checking if reference exists.
     */
    async validateReference(referenceId: string): Promise<boolean> {
        const reference = this.references.get(referenceId);

        if (!reference) {
            return false;
        }

        const hasPermission = await this.checkWorkspacePermission(
            reference.sourceWorkspace,
            reference.targetWorkspace
        );

        if (!hasPermission) {
            return false;
        }

        const fileSyncService = this.fileSyncServices.get(reference.targetWorkspace);

        if (!fileSyncService) {
            return false;
        }

        try {
            // Just check if file exists by trying to get metadata
            await fileSyncService.getFileMetadata(reference.targetFilePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get all references for a workspace
     *
     * @param workspace - Workspace to query (source or target)
     * @param asSource - If true, query references where workspace is source. If false, query where workspace is target.
     */
    getReferencesForWorkspace(
        workspace: WorkspaceType,
        asSource: boolean = true
    ): CrossWorkspaceFileReference[] {
        const results: CrossWorkspaceFileReference[] = [];

        for (const reference of this.references.values()) {
            if (asSource && reference.sourceWorkspace === workspace) {
                results.push(reference);
            } else if (!asSource && reference.targetWorkspace === workspace) {
                results.push(reference);
            }
        }

        return results;
    }

    /**
     * Delete a reference
     */
    async deleteReference(referenceId: string): Promise<void> {
        const deleted = this.references.delete(referenceId);

        if (deleted) {
            console.log(`[CrossWorkspaceReferenceManager] Deleted reference: ${referenceId}`);
        } else {
            throw new Error(`Reference not found: ${referenceId}`);
        }
    }

    /**
     * Detect all broken references
     *
     * @returns Array of broken references
     */
    async detectBrokenReferences(): Promise<CrossWorkspaceFileReference[]> {
        const broken: CrossWorkspaceFileReference[] = [];

        for (const reference of this.references.values()) {
            const isValid = await this.validateReference(reference.id);

            if (!isValid) {
                broken.push(reference);
            }
        }

        return broken;
    }

    /**
     * Get reference by ID
     */
    getReference(referenceId: string): CrossWorkspaceFileReference | undefined {
        return this.references.get(referenceId);
    }

    /**
     * Get all references
     */
    getAllReferences(): CrossWorkspaceFileReference[] {
        return Array.from(this.references.values());
    }

    /**
     * Check if source workspace has permission to access target workspace
     *
     * Integrates with WorkspacePermissionManager for actual permission checking.
     * Phase 1: Allows all cross-workspace references (with permission checking structure in place)
     * Phase 2: Add agent config-based restrictions (future story)
     * Phase 3: Add user-level permission controls (future story)
     */
    private async checkWorkspacePermission(
        sourceWorkspace: WorkspaceType,
        targetWorkspace: WorkspaceType
    ): Promise<boolean> {
        // Delegate to WorkspacePermissionManager
        return this.permissionManager.checkCrossWorkspaceFilePermission(
            sourceWorkspace,
            targetWorkspace
        );
    }
}

/**
 * Factory function to create cross-workspace reference manager
 */
export function createCrossWorkspaceReferenceManager(): CrossWorkspaceReferenceManager {
    return new CrossWorkspaceReferenceManager();
}

/**
 * Singleton instance for app-wide use
 */
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
