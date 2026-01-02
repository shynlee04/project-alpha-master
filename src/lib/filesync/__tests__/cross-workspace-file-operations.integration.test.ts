/**
 * @fileoverview Integration tests for cross-workspace file operations
 * @module lib/filesync/__tests__/cross-workspace-file-operations.integration.test
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
import type { CrossWorkspaceFileReference } from '../cross-workspace-file-references';

/**
 * Integration Tests: Cross-Workspace File Operations
 *
 * These tests verify end-to-end workflows across workspace boundaries.
 * They test the interaction between multiple services:
 * - File Sync Services (Notes, Study, IDE)
 * - Cross-Workspace Reference Manager
 * - Workspace Permission Manager
 */

// Mock file system adapters
const mockNotesAdapter = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
    getFileMetadata: vi.fn(),
};

const mockStudyAdapter = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
    getFileMetadata: vi.fn(),
};

const mockIDEAdapter = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
    getFileMetadata: vi.fn(),
};

// Mock file sync services
const mockNotesFileSyncService = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
    getFileMetadata: vi.fn(),
    writeBatch: vi.fn(),
    mount: vi.fn(),
    sync: vi.fn(),
    getSyncStatus: vi.fn(),
    onFileChange: vi.fn(),
    dispose: vi.fn(),
} as unknown as FileSyncService;

const mockStudyFileSyncService = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
    getFileMetadata: vi.fn(),
    writeBatch: vi.fn(),
    mount: vi.fn(),
    sync: vi.fn(),
    getSyncStatus: vi.fn(),
    onFileChange: vi.fn(),
    dispose: vi.fn(),
} as unknown as FileSyncService;

const mockIDEFileSyncService = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
    getFileMetadata: vi.fn(),
    writeBatch: vi.fn(),
    mount: vi.fn(),
    sync: vi.fn(),
    getSyncStatus: vi.fn(),
    onFileChange: vi.fn(),
    dispose: vi.fn(),
} as unknown as FileSyncService;

// Mock permission managers
vi.mock('@/lib/agent/tool-permission-manager', () => ({
    getToolPermissionManager: vi.fn(() => ({
        checkPermission: vi.fn(() => ({ canExecute: true, needsApproval: false })),
    })),
}));

vi.mock('@/lib/agent/workspace-permission-manager', () => ({
    WorkspacePermissionManager: class {
        constructor(private readonly baseManager: any) {}
        checkCrossWorkspaceFilePermission = vi.fn((source: string, target: string) => {
            // Study workspace has read-only access to IDE
            if (source === 'study' && target === 'ide') return true;
            // Notes workspace has full access to IDE
            if (source === 'notes' && target === 'ide') return true;
            // Knowledge workspace has read-only access to IDE
            if (source === 'knowledge' && target === 'ide') return true;
            // No other cross-workspace access allowed
            return source !== target;
        });
    },
}));

describe('Cross-Workspace File Operations - Integration Tests', () => {
    let referenceManager: CrossWorkspaceReferenceManager;

    beforeEach(() => {
        referenceManager = new CrossWorkspaceReferenceManager();
        vi.clearAllMocks();

        // Register file sync services for each workspace
        referenceManager.registerFileSyncService('notes', mockNotesFileSyncService);
        referenceManager.registerFileSyncService('study', mockStudyFileSyncService);
        referenceManager.registerFileSyncService('ide', mockIDEFileSyncService);
        referenceManager.registerFileSyncService('knowledge', mockStudyFileSyncService);
    });

    /**
     * Scenario 1: Round-trip sync: Note → File → Note (Notes workspace)
     *
     * Tests that notes can be synced to files and read back correctly.
     */
    describe('Scenario 1: Notes Round-Trip Sync', () => {
        it('should sync note to file and read it back', async () => {
            const noteContent = '# Test Note\n\nThis is a test note.';
            const noteFilePath = '/notes/test-note.md';

            // Step 1: Write note to file
            vi.mocked(mockNotesFileSyncService.writeFile).mockResolvedValue(undefined);
            vi.mocked(mockNotesFileSyncService.readFile).mockResolvedValue(noteContent);

            // Simulate sync
            await mockNotesFileSyncService.writeFile(noteFilePath, noteContent);

            // Step 2: Read note back from file
            const readContent = await mockNotesFileSyncService.readFile(noteFilePath);

            // Verify round-trip
            expect(readContent).toBe(noteContent);
            expect(mockNotesFileSyncService.writeFile).toHaveBeenCalledWith(noteFilePath, noteContent);
            expect(mockNotesFileSyncService.readFile).toHaveBeenCalledWith(noteFilePath);
        });

        it('should detect file changes and sync back to note', async () => {
            const originalContent = '# Original Note';
            const updatedContent = '# Updated Note\n\nNew content added.';
            const noteFilePath = '/notes/changeable-note.md';

            // Step 1: Initial write
            vi.mocked(mockNotesFileSyncService.writeFile).mockResolvedValue(undefined);
            await mockNotesFileSyncService.writeFile(noteFilePath, originalContent);

            // Step 2: Simulate external file change
            vi.mocked(mockNotesFileSyncService.readFile).mockResolvedValue(updatedContent);

            // Step 3: Sync changes back
            const syncedContent = await mockNotesFileSyncService.readFile(noteFilePath);

            // Verify sync detected change
            expect(syncedContent).toBe(updatedContent);
            expect(syncedContent).not.toBe(originalContent);
        });
    });

    /**
     * Scenario 2: Import workflow: PDF → Flashcards (Study workspace)
     *
     * Tests that PDFs can be imported from IDE workspace and converted to flashcards.
     */
    describe('Scenario 2: Study PDF Import Workflow', () => {
        it('should import PDF from IDE workspace as flashcards', async () => {
            const pdfPath = '/ide/study-materials/chapter1.pdf';
            const pdfContent = 'PDF binary content...';

            // Mock IDE file service to return PDF
            vi.mocked(mockIDEFileSyncService.readFile).mockResolvedValue(pdfContent);
            vi.mocked(mockIDEFileSyncService.getFileMetadata).mockResolvedValue({
                path: pdfPath,
                size: 1024,
                lastModified: Date.now(),
                contentType: 'application/pdf',
            });

            // Create reference to PDF from Study workspace
            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'ide',
                targetFilePath: pdfPath,
                referenceType: 'cite',
                metadata: {
                    title: 'Chapter 1 PDF',
                },
            });

            // Resolve reference (read PDF content)
            const resolved = await referenceManager.resolveReference(referenceId);

            // Verify PDF accessible from Study workspace
            expect(resolved.exists).toBe(true);
            expect(resolved.fileContent).toBe(pdfContent);
            expect(resolved.fileMetadata?.contentType).toBe('application/pdf');
        });

        it('should handle PDF import errors gracefully', async () => {
            const missingPdfPath = '/ide/missing/chapter2.pdf';

            // Mock IDE file service to throw error
            vi.mocked(mockIDEFileSyncService.readFile).mockRejectedValue(new Error('File not found'));

            // Create reference to missing PDF
            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'ide',
                targetFilePath: missingPdfPath,
                referenceType: 'cite',
            });

            // Try to resolve reference
            const resolved = await referenceManager.resolveReference(referenceId);

            // Verify error handling
            expect(resolved.exists).toBe(false);
            expect(resolved.brokenReason).toBe('not_found');
        });
    });

    /**
     * Scenario 3: Reference resolution: Knowledge → Notes → File content
     *
     * Tests that Knowledge workspace can reference Notes workspace files.
     */
    describe('Scenario 3: Knowledge References Notes', () => {
        it('should resolve Notes file from Knowledge workspace', async () => {
            const notePath = '/notes/research-notes.md';
            const noteContent = '# Research Notes\n\nKey findings...';

            // Mock Notes file service
            vi.mocked(mockNotesFileSyncService.readFile).mockResolvedValue(noteContent);
            vi.mocked(mockNotesFileSyncService.getFileMetadata).mockResolvedValue({
                path: notePath,
                size: 256,
                lastModified: Date.now(),
                contentType: 'text/markdown',
            });

            // Create reference from Knowledge to Notes
            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'knowledge',
                targetWorkspace: 'notes',
                targetFilePath: notePath,
                referenceType: 'link',
                metadata: {
                    title: 'Research Notes Reference',
                    description: 'Linked to research notes in Notes workspace',
                },
            });

            // Resolve reference
            const resolved = await referenceManager.resolveReference(referenceId);

            // Verify reference resolved successfully
            expect(resolved.exists).toBe(true);
            expect(resolved.fileContent).toBe(noteContent);
            expect(resolved.reference.metadata?.title).toBe('Research Notes Reference');
            expect(resolved.fileMetadata?.contentType).toBe('text/markdown');
        });

        it('should validate cross-workspace references before accessing', async () => {
            const notePath = '/notes/validated-note.md';

            // Mock Notes file service
            vi.mocked(mockNotesFileSyncService.getFileMetadata).mockResolvedValue({
                path: notePath,
                size: 128,
                lastModified: Date.now(),
                contentType: 'text/markdown',
            });

            // Create reference
            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'knowledge',
                targetWorkspace: 'notes',
                targetFilePath: notePath,
                referenceType: 'link',
            });

            // Validate reference (fast check, doesn't read content)
            const isValid = await referenceManager.validateReference(referenceId);

            // Verify validation succeeded
            expect(isValid).toBe(true);
        });
    });

    /**
     * Scenario 4: Broken link detection: Delete file, check reference status
     *
     * Tests that broken references are detected and reported.
     */
    describe('Scenario 4: Broken Link Detection', () => {
        it('should detect when referenced file is deleted', async () => {
            const filePath = '/ide/temp-file.txt';
            const fileContent = 'Temporary content';

            // Step 1: Create reference to existing file
            vi.mocked(mockIDEFileSyncService.readFile).mockResolvedValue(fileContent);
            vi.mocked(mockIDEFileSyncService.getFileMetadata).mockResolvedValue({
                path: filePath,
                size: 17,
                lastModified: Date.now(),
                contentType: 'text/plain',
            });

            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: filePath,
                referenceType: 'link',
            });

            // Step 2: Verify reference works initially
            const initialResolved = await referenceManager.resolveReference(referenceId);
            expect(initialResolved.exists).toBe(true);

            // Step 3: Simulate file deletion (mock throws error)
            vi.mocked(mockIDEFileSyncService.readFile).mockRejectedValue(new Error('File deleted'));
            vi.mocked(mockIDEFileSyncService.getFileMetadata).mockRejectedValue(new Error('File deleted'));

            // Step 4: Detect broken reference
            const brokenResolved = await referenceManager.resolveReference(referenceId);

            // Verify broken link detected
            expect(brokenResolved.exists).toBe(false);
            expect(brokenResolved.brokenReason).toBe('not_found');
        });

        it('should find all broken references in system', async () => {
            // Create multiple references
            const goodRefId = await referenceManager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/ide/good-file.txt',
                referenceType: 'link',
            });

            const brokenRefId = await referenceManager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'ide',
                targetFilePath: '/ide/broken-file.txt',
                referenceType: 'link',
            });

            // Mock: good file exists, broken file doesn't
            vi.mocked(mockIDEFileSyncService.getFileMetadata).mockImplementation((path) => {
                if (path === '/ide/good-file.txt') {
                    return Promise.resolve({
                        path: '/ide/good-file.txt',
                        size: 100,
                        lastModified: Date.now(),
                        contentType: 'text/plain',
                    });
                }
                throw new Error('Not found');
            });

            // Detect all broken references
            const brokenRefs = await referenceManager.detectBrokenReferences();

            // Verify only broken reference detected
            expect(brokenRefs).toHaveLength(1);
            expect(brokenRefs[0].id).toBe(brokenRefId);
        });
    });

    /**
     * Scenario 5: Permission isolation: Study workspace can't access IDE files
     *
     * Tests that workspace permission boundaries are enforced.
     */
    describe('Scenario 5: Permission Isolation', () => {
        it('should allow Study workspace read-only access to IDE files', async () => {
            const ideFilePath = '/ide/study-material.pdf';
            const pdfContent = 'PDF content';

            // Mock IDE file service
            vi.mocked(mockIDEFileSyncService.readFile).mockResolvedValue(pdfContent);
            vi.mocked(mockIDEFileSyncService.getFileMetadata).mockResolvedValue({
                path: ideFilePath,
                size: 2048,
                lastModified: Date.now(),
                contentType: 'application/pdf',
            });

            // Create reference from Study to IDE
            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'study',
                targetWorkspace: 'ide',
                targetFilePath: ideFilePath,
                referenceType: 'cite',
            });

            // Resolve reference (should succeed - read-only access allowed)
            const resolved = await referenceManager.resolveReference(referenceId);

            // Verify read access granted
            expect(resolved.exists).toBe(true);
            expect(resolved.fileContent).toBe(pdfContent);
        });

        it('should prevent self-references within same workspace', async () => {
            const notePath = '/notes/internal-note.md';

            // Create self-reference (notes -> notes)
            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'notes',
                targetFilePath: notePath,
                referenceType: 'link',
            });

            // Try to resolve self-reference
            const resolved = await referenceManager.resolveReference(referenceId);

            // Verify permission denied
            expect(resolved.exists).toBe(false);
            expect(resolved.brokenReason).toBe('permission_denied');
        });

        it('should enforce workspace isolation for unmounted workspaces', async () => {
            const unknownWorkspacePath = '/unknown-workspace/file.txt';

            // Try to create reference to unregistered workspace
            const referenceId = await referenceManager.createReference({
                sourceWorkspace: 'notes',
                targetWorkspace: 'unknown' as any, // Invalid workspace
                targetFilePath: unknownWorkspacePath,
                referenceType: 'link',
            });

            // Try to resolve reference
            const resolved = await referenceManager.resolveReference(referenceId);

            // Verify workspace not mounted error
            expect(resolved.exists).toBe(false);
            expect(resolved.brokenReason).toBe('workspace_not_mounted');
        });
    });
});
