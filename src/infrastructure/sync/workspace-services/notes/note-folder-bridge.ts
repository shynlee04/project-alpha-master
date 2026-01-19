/**
 * @fileoverview Note Folder Bridge
 * @module infrastructure/sync/workspace-services/notes/note-folder-bridge
 *
 * Handles mapping between filesystem folder structure and Notes store.
 * Responsible for initial scanning and importing of notes from a mounted directory.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story S-007 - Fix Notes Workspace Project File Loading
 *
 * PHASE0-2: Made import idempotent using hash tracking
 * - Computes hash of file list before import
 * - Skips import if hash matches stored value
 * - Updates hash after successful import
 * - Allows forced re-import via options
 *
 * FIX-2026-01-06: Added proper error handling with user feedback
 * - Errors are now surfaced via toast notifications
 * - Progress tracking for large imports
 * - Structured error collection for partial failures
 */

import type { LocalFSAdapter } from '@/infrastructure/filesystem';
import type { NoteSyncStore } from './notes-file-sync-core';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import { importFileAsNote } from './note-crud-operations';
import { noteToMarkdown } from './note-markdown-writer';
import {
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showLoadingToast,
    dismissToast
} from '@/lib/utils/error-handling';
import { computeFileListHash } from '@/lib/utils/hash';
import { getNotesImportHash, setNotesImportHash } from '@/infrastructure/persistence/dexie-db';
import { startImport, endImport } from '@/lib/notes/slices/note-crud-slice';

/**
 * Import result with detailed error tracking
 */
export interface ImportResult {
    success: boolean;
    totalFiles: number;
    importedCount: number;
    failedFiles: Array<{ path: string; error: string }>;
    duration: number;
    skipped?: boolean;
    skipReason?: 'unchanged' | string;
}

/**
 * Progress callback for import operations
 */
export type ImportProgressCallback = (current: number, total: number, currentFile: string) => void;

/**
 * Save result with detailed error tracking
 */
export interface SaveResult {
    success: boolean;
    noteId: string;
    filePath: string;
    duration: number;
    error?: string;
}

export class NoteFolderBridge {
    constructor(
        private localAdapter: LocalFSAdapter,
        private noteStore: NoteSyncStore,
        private projectId?: string
    ) { }

    /**
     * Recursively scan directory and import all markdown files as notes.
     *
     * PHASE0-2: Now idempotent using hash tracking
     * - Computes hash of file list before import
     * - Skips import if hash matches stored value
     * - Updates hash after successful import
     * - Allows forced re-import via force: true option
     *
     * FIX-2026-01-06: Now surfaces errors properly with user feedback
     *
     * @param rootPath - Root path to start scanning from (relative to mount point)
     * @param onProgress - Optional progress callback for UI updates
     * @param options - Import options (force: true to bypass hash check)
     * @returns Import result with success/failure details
     */
    async importDirectory(
        rootPath: string = '',
        onProgress?: ImportProgressCallback,
        options?: { force?: boolean }
    ): Promise<ImportResult> {
        console.log(`[NoteFolderBridge] Starting import from: ${rootPath || 'root'}`);
        const startTime = Date.now();
        let importedCount = 0;
        const failedFiles: Array<{ path: string; error: string }> = [];

        // ✅ FIX #2: Start import tracking to handle missing projectId
        startImport(this.projectId || 'browser-mode');

        // PHASE0-2: Skip import if hash matches (unless forced)
        if (this.projectId && !options?.force) {
            try {
                const files = await this.listMarkdownFiles(rootPath);
                const currentHash = computeFileListHash(files);
                const existingHash = await getNotesImportHash(this.projectId);

                if (existingHash === currentHash && files.length > 0) {
                    console.log('[NoteFolderBridge] Files unchanged, skipping import');
                    return {
                        success: true,
                        totalFiles: files.length,
                        importedCount: 0,
                        failedFiles: [],
                        duration: Date.now() - startTime,
                        skipped: true,
                        skipReason: 'unchanged',
                    };
                }
            } catch (error) {
                console.warn('[NoteFolderBridge] Hash check failed, proceeding with import:', error);
                // Continue with import if hash check fails
            }
        }

        // Show loading toast
        const loadingToastId = 'notes-import-progress';
        showLoadingToast('Scanning folder for notes...', loadingToastId);

        try {
            const files = await this.listMarkdownFiles(rootPath);
            console.log(`[NoteFolderBridge] Found ${files.length} markdown files to import`);

            if (files.length === 0) {
                dismissToast(loadingToastId);
                showWarningToast('No markdown files found in the selected folder');
                return {
                    success: true,
                    totalFiles: 0,
                    importedCount: 0,
                    failedFiles: [],
                    duration: Date.now() - startTime,
                };
            }

            // Import each file with progress tracking
            for (let i = 0; i < files.length; i++) {
                const filePath = files[i];

                // Update progress callback if provided
                if (onProgress) {
                    onProgress(i + 1, files.length, filePath);
                }

                try {
                    await importFileAsNote(filePath, this.localAdapter, this.noteStore);
                    importedCount++;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`[NoteFolderBridge] Failed to import ${filePath}:`, error);
                    failedFiles.push({ path: filePath, error: errorMessage });
                }
            }

            const duration = Date.now() - startTime;
            dismissToast(loadingToastId);

            // Show result toast based on outcome
            if (failedFiles.length === 0) {
                showSuccessToast(`Successfully imported ${importedCount} notes`);
            } else if (importedCount > 0) {
                showWarningToast(
                    `Imported ${importedCount}/${files.length} notes. ${failedFiles.length} files failed.`
                );
            } else {
                showErrorToast(
                    new Error(`Failed to import any notes. ${failedFiles.length} files had errors.`),
                    {
                        action: 'retry',
                        actionLabel: 'Try Again',
                        id: 'notes-import-failed',
                    }
                );
            }

            console.log(`[NoteFolderBridge] Import complete. Imported ${importedCount}/${files.length} notes in ${duration}ms`);

            // PHASE0-2: Store hash after successful import
            if (this.projectId && importedCount > 0) {
                const hash = computeFileListHash(files);
                await setNotesImportHash(this.projectId, hash);
                console.log(`[NoteFolderBridge] Stored import hash: ${hash}`);
            }

            return {
                success: failedFiles.length === 0,
                totalFiles: files.length,
                importedCount,
                failedFiles,
                duration,
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            dismissToast(loadingToastId);

            console.error('[NoteFolderBridge] Directory import failed:', error);

            // Surface error to user with retry option
            showErrorToast(
                error instanceof Error ? error : new Error('Failed to read folder'),
                {
                    action: 'retry',
                    actionLabel: 'Try Again',
                    id: 'notes-import-error',
                    showDetails: true,
                }
            );

            return {
                success: false,
                totalFiles: 0,
                importedCount: 0,
                failedFiles: [{
                    path: rootPath || 'root',
                    error: error instanceof Error ? error.message : String(error)
                }],
                duration,
            };
        } finally {
            // ✅ FIX #2: End import tracking (always run, even on error)
            endImport();
        }
    }

    /**
     * Recursively list all markdown files in a directory.
     */
    private async listMarkdownFiles(dirPath: string): Promise<string[]> {
        const MAX_DEPTH = 20;
        const MAX_FILES = 5000;

        const results: string[] = [];
        const queue: Array<{ path: string; depth: number }> = [{ path: dirPath, depth: 0 }];
        const failedDirs: string[] = [];

        while (queue.length > 0) {
            const { path: currentPath, depth } = queue.shift()!;

            // Check depth and file count limits
            if (depth > MAX_DEPTH || results.length > MAX_FILES) {
                console.warn('[NoteFolderBridge] Scan limits reached', {
                    depth,
                    fileCount: results.length,
                    maxDepth: MAX_DEPTH,
                    maxFiles: MAX_FILES
                });
                break;
            }

            try {
                const entries = await this.localAdapter.listDirectory(currentPath);

                for (const entry of entries) {
                    // Handle root path logic (empty string vs actual path)
                    const entryPath = currentPath
                        ? `${currentPath}/${entry.name}`
                        : entry.name;

                    if (entry.type === 'file') {
                        if (this.isMarkdownFile(entry.name)) {
                            results.push(entryPath);
                        }
                    } else if (entry.type === 'directory') {
                        queue.push({ path: entryPath, depth: depth + 1 });
                    }
                }
            } catch (error) {
                console.warn(`[NoteFolderBridge] Failed to list contents of ${currentPath}:`, error);
                failedDirs.push(currentPath);
            }
        }

        // If some directories failed to list, warn user
        if (failedDirs.length > 0) {
            console.warn(`[NoteFolderBridge] ${failedDirs.length} directories could not be read`);
        }

        return results;
    }

    private isMarkdownFile(filename: string): boolean {
        const ext = filename.toLowerCase().split('.').pop();
        return ext === 'md' || ext === 'markdown';
    }

    /**
     * Save a single note to its markdown file.
     *
     * UJ-003: Export note to filesystem for persistence.
     * Generates file path from note metadata and writes markdown content.
     *
     * @param note - Note record to save
     * @param targetDirectory - Directory to save note in (defaults to root)
     * @returns Save result with success/failure details
     */
    async saveNoteToFile(
        note: NoteRecord,
        targetDirectory: string = ''
    ): Promise<SaveResult> {
        const startTime = Date.now();

        try {
            // Generate file path from note metadata
            const filePath = this.generateNoteFilePath(note, targetDirectory);

            // Convert note to markdown format
            const markdown = noteToMarkdown(note);

            // Write to filesystem
            await this.localAdapter.writeFile(filePath, markdown);

            const duration = Date.now() - startTime;

            console.log(`[NoteFolderBridge] Saved note ${note.id} to ${filePath} in ${duration}ms`);

            return {
                success: true,
                noteId: note.id,
                filePath,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            console.error(`[NoteFolderBridge] Failed to save note ${note.id}:`, error);

            return {
                success: false,
                noteId: note.id,
                filePath: '',
                duration,
                error: errorMessage,
            };
        }
    }

    /**
     * Generate file path from note metadata.
     *
     * Creates filesystem path from note title and ID.
     * Sanitizes title to create valid filename.
     *
     * @param note - Note record to generate path for
     * @param targetDirectory - Base directory for notes
     * @returns Relative file path for the note
     */
    private generateNoteFilePath(note: NoteRecord, targetDirectory: string): string {
        const title = (note.title || 'untitled')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const id = note.id.slice(0, 8);
        const filename = `${title}-${id}.md`;

        return targetDirectory ? `${targetDirectory}/${filename}` : filename;
    }
}

