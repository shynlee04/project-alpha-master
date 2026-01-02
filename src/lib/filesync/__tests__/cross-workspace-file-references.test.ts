/**
 * @fileoverview Unit tests for cross-workspace file reference system
 * @module lib/filesync/__tests__/cross-workspace-file-references.test
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { FileSyncService } from '../file-sync-service';
import {
    CrossWorkspaceReferenceManager,
    getCrossWorkspaceReferenceManager,
} from '../cross-workspace-file-references';
import type { CrossWorkspaceFileReference, ResolvedReference } from '../cross-workspace-file-references';

// Mock FileSyncService
const mockFileSyncService = {
    readFile: vi.fn(),
    getFileMetadata: vi.fn(),
} as unknown as FileSyncService;

// Mock ToolPermissionManager and WorkspacePermissionManager
vi.mock('@/lib/agent/tool-permission-manager', () => ({
    getToolPermissionManager: vi.fn(() => ({
        checkPermission: vi.fn(() => ({ canExecute: true, needsApproval: false })),
    })),
}));

vi.mock('@/lib/agent/workspace-permission-manager', () => ({
    WorkspacePermissionManager: class {
        constructor(private readonly baseManager: any) {}
        checkCrossWorkspaceFilePermission = vi.fn((source: string, target: string) => {
            // Return false for self-references to test permission_denied case
            return source !== target;
        });
    },
}));

describe('CrossWorkspaceReferenceManager', () => {
    let manager: CrossWorkspaceReferenceManager;

    beforeEach(() => {
        manager = new CrossWorkspaceReferenceManager();
        vi.clearAllMocks();
    });

    describe('createReference', () => {
        it('should create a new reference with valid ID', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/src/example.ts',
                referenceType: 'link',
                metadata: {
                    title: 'Example Reference',
                    description: 'Test description',
                },
            });

            expect(referenceId).toMatch(/^ref_\d+_[a-z0-9]+$/);
        });

        it('should store reference with correct properties', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'knowledge',
                targetWorkspace: 'study',
                targetFilePath: '/materials/quiz.json',
                referenceType: 'embed',
            });

            const reference = manager.getReference(referenceId);

            expect(reference).toBeDefined();
            expect(reference?.sourceWorkspace).toBe('knowledge');
            expect(reference?.targetWorkspace).toBe('study');
            expect(reference?.targetFilePath).toBe('/materials/quiz.json');
            expect(reference?.referenceType).toBe('embed');
        });

        it('should assign unique IDs to each reference', async () => {
            const id1 = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/file1.txt',
                referenceType: 'link',
            });

            const id2 = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/file2.txt',
                referenceType: 'link',
            });

            expect(id1).not.toBe(id2);
        });
    });

    describe('getReference', () => {
        it('should return undefined for non-existent reference', () => {
            const reference = manager.getReference('non-existent-id');

            expect(reference).toBeUndefined();
        });

        it('should return reference for valid ID', async () => {
            const createdId = await manager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'knowledge',
                targetFilePath: '/sources/paper.pdf',
                referenceType: 'cite',
                metadata: {
                    title: 'Research Paper',
                },
            });

            const reference = manager.getReference(createdId);

            expect(reference).toBeDefined();
            expect(reference?.id).toBe(createdId);
            expect(reference?.metadata?.title).toBe('Research Paper');
        });
    });

    describe('resolveReference', () => {
        beforeEach(() => {
            // Register mock file sync service
            manager.registerFileSyncService('ide', mockFileSyncService);
        });

        it('should resolve existing file successfully', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/src/test.ts',
                referenceType: 'link',
            });

            vi.mocked(mockFileSyncService.readFile).mockResolvedValue('file content');
            vi.mocked(mockFileSyncService.getFileMetadata).mockResolvedValue({
                path: '/src/test.ts',
                size: 12,
                lastModified: Date.now(),
                contentType: 'text/typescript',
            });

            const resolved = await manager.resolveReference(referenceId);

            expect(resolved.exists).toBe(true);
            expect(resolved.fileContent).toBe('file content');
            expect(resolved.fileMetadata).toBeDefined();
            expect(resolved.brokenReason).toBeUndefined();
        });

        it('should return not_found for missing file', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/src/missing.ts',
                referenceType: 'link',
            });

            vi.mocked(mockFileSyncService.readFile).mockRejectedValue(
                new Error('File not found')
            );

            const resolved = await manager.resolveReference(referenceId);

            expect(resolved.exists).toBe(false);
            expect(resolved.brokenReason).toBe('not_found');
        });

        it('should return permission_denied for self-references', async () => {
            // Register notes workspace file sync service so it passes the workspace_not_mounted check
            manager.registerFileSyncService('notes', mockFileSyncService);

            const referenceId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'notes', // Same workspace
                targetFilePath: '/test.txt',
                referenceType: 'link',
            });

            const resolved = await manager.resolveReference(referenceId);

            expect(resolved.exists).toBe(false);
            expect(resolved.brokenReason).toBe('permission_denied');
        });

        it('should return workspace_not_mounted for unregistered workspace', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'knowledge', // Not registered
                targetFilePath: '/test.pdf',
                referenceType: 'link',
            });

            const resolved = await manager.resolveReference(referenceId);

            expect(resolved.exists).toBe(false);
            expect(resolved.brokenReason).toBe('workspace_not_mounted');
        });
    });

    describe('validateReference', () => {
        beforeEach(() => {
            manager.registerFileSyncService('ide', mockFileSyncService);
        });

        it('should return true for valid reference', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'ide',
                targetFilePath: '/src/test.ts',
                referenceType: 'link',
            });

            vi.mocked(mockFileSyncService.readFile).mockResolvedValue('content');

            const isValid = await manager.validateReference(referenceId);

            expect(isValid).toBe(true);
        });

        it('should return false for broken reference', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'ide',
                targetFilePath: '/src/missing.ts',
                referenceType: 'link',
            });

            // Mock getFileMetadata to throw error for missing file
            vi.mocked(mockFileSyncService.getFileMetadata).mockRejectedValue(
                new Error('Not found')
            );

            const isValid = await manager.validateReference(referenceId);

            expect(isValid).toBe(false);
        });
    });

    describe('getReferencesForWorkspace', () => {
        it('should return references where workspace is source', async () => {
            await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/file1.ts',
                referenceType: 'link',
            });

            await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'knowledge',
                targetFilePath: '/file2.pdf',
                referenceType: 'embed',
            });

            await manager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'ide',
                targetFilePath: '/file3.ts',
                referenceType: 'cite',
            });

            const notesRefs = manager.getReferencesForWorkspace('notes', true);

            expect(notesRefs).toHaveLength(2);
            expect(notesRefs.every(ref => ref.sourceWorkspace === 'notes'));
        });

        it('should return references where workspace is target', async () => {
            await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/file1.ts',
                referenceType: 'link',
            });

            await manager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'ide',
                targetFilePath: '/file2.ts',
                referenceType: 'embed',
            });

            const ideRefs = manager.getReferencesForWorkspace('ide', false);

            expect(ideRefs).toHaveLength(2);
            expect(ideRefs.every(ref => ref.targetWorkspace === 'ide'));
        });
    });

    describe('deleteReference', () => {
        it('should remove reference from storage', async () => {
            const referenceId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/test.txt',
                referenceType: 'link',
            });

            expect(manager.getReference(referenceId)).toBeDefined();

            await manager.deleteReference(referenceId);

            expect(manager.getReference(referenceId)).toBeUndefined();
        });
    });

    describe('detectBrokenReferences', () => {
        beforeEach(() => {
            manager.registerFileSyncService('ide', mockFileSyncService);
        });

        it('should detect references with missing files', async () => {
            const goodRefId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/existing.txt',
                referenceType: 'link',
            });

            const brokenRefId = await manager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/missing.txt',
                referenceType: 'link',
            });

            // Mock getFileMetadata to throw error for missing file
            vi.mocked(mockFileSyncService.getFileMetadata)
                .mockImplementation((path) => {
                    if (path === '/existing.txt') return Promise.resolve({
                        path: '/existing.txt',
                        size: 7,
                        lastModified: Date.now(),
                        contentType: 'text/plain',
                    });
                    throw new Error('Not found');
                });

            const brokenRefs = await manager.detectBrokenReferences();

            expect(brokenRefs).toHaveLength(1);
            expect(brokenRefs[0].id).toBe(brokenRefId);
        });
    });

    describe('Singleton Pattern', () => {
        it('should return same instance from getCrossWorkspaceReferenceManager', () => {
            const instance1 = getCrossWorkspaceReferenceManager();
            const instance2 = getCrossWorkspaceReferenceManager();

            expect(instance1).toBe(instance2);
        });
    });
});
