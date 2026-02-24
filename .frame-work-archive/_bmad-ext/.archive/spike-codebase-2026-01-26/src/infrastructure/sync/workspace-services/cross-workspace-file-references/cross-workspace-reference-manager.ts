/**
 * @fileoverview Cross-Workspace Reference Manager
 * @module infrastructure/sync/workspace-services/cross-workspace-file-references/manager
 *
 * Manager class and factory functions for cross-workspace file references.
 * Part of the split cross-workspace-file-references module.
 *
 * @story ARCH-01.1.2
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { FileSyncService } from '../file-sync-service';
import { WorkspacePermissionManager } from '@/lib/agent/workspace-permission-manager';
import { ToolPermissionManager } from '@/lib/agent/tool-permission-manager';
import type {
    CrossWorkspaceFileReference,
    ResolvedReference,
    CreateReferenceOptions
} from './cross-workspace-reference-types';

/**
 * Cross-Workspace Reference Manager
 *
 * Manages file references across workspace boundaries.
 * Provides permission checking, validation, and broken link detection.
 */
export class CrossWorkspaceReferenceManager {
    private references: Map<string, CrossWorkspaceFileReference>;
    private fileSyncServices: Map<WorkspaceType, FileSyncService>;
    private permissionManager: WorkspacePermissionManager;

    constructor() {
        this.references = new Map();
        this.fileSyncServices = new Map();
        const basePermissionManager = ToolPermissionManager.getInstance();
        this.permissionManager = new WorkspacePermissionManager(basePermissionManager);
    }

    registerFileSyncService(workspace: WorkspaceType, service: FileSyncService): void {
        this.fileSyncServices.set(workspace, service);
    }

    unregisterFileSyncService(workspace: WorkspaceType): void {
        this.fileSyncServices.delete(workspace);
    }

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

    async resolveReference(referenceId: string): Promise<ResolvedReference> {
        const reference = this.references.get(referenceId);

        if (!reference) {
            throw new Error(`Reference not found: ${referenceId}`);
        }

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

        const fileSyncService = this.fileSyncServices.get(reference.targetWorkspace);

        if (!fileSyncService) {
            return {
                reference,
                exists: false,
                brokenReason: 'workspace_not_mounted'
            };
        }

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
            await fileSyncService.getFileMetadata(reference.targetFilePath);
            return true;
        } catch {
            return false;
        }
    }

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

    async deleteReference(referenceId: string): Promise<void> {
        const deleted = this.references.delete(referenceId);

        if (deleted) {
            console.log(`[CrossWorkspaceReferenceManager] Deleted reference: ${referenceId}`);
        } else {
            throw new Error(`Reference not found: ${referenceId}`);
        }
    }

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

    getReference(referenceId: string): CrossWorkspaceFileReference | undefined {
        return this.references.get(referenceId);
    }

    getAllReferences(): CrossWorkspaceFileReference[] {
        return Array.from(this.references.values());
    }

    private async checkWorkspacePermission(
        sourceWorkspace: WorkspaceType,
        targetWorkspace: WorkspaceType
    ): Promise<boolean> {
        return this.permissionManager.checkCrossWorkspaceFilePermission(
            sourceWorkspace,
            targetWorkspace
        );
    }
}
