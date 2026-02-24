/**
 * @fileoverview Note Folder Bridge
 * @module infrastructure/sync/workspace-services/notes/note-folder-bridge
 *
 * Handles the mapping between the filesystem folder structure and the Notes store.
 * Responsible for initial scanning and importing of notes from a mounted directory.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story S-007 - Fix Notes Workspace Project File Loading
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

/**
 * Import result with detailed error tracking
 */
export interface ImportResult {
    success: boolean;
    totalFiles: number;
    importedCount: number;
    failedFiles: Array<{ path: string; error: string }>;
    duration: number;
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
        private noteStore: NoteSyncStore
    ) { }

    /**
     * Recursively scan directory and import all markdown files as notes.
     * 
     * FIX-2026-01-06: Now surfaces errors properly with user feedback
     * 
     * @param rootPath - Root path to start scanning from (relative to mount point)
     * @param onProgress - Optional progress callback for UI updates
     * @returns Import result with success/failure details
     */
    async importDirectory(
        rootPath: string = '',
        onProgress?: ImportProgressCallback
    ): Promise<ImportResult> {
        console.log(`[NoteFolderBridge] Starting import from: ${rootPath || 'root'}`);
        const startTime = Date.now();
        let importedCount = 0;
        const failedFiles: Array<{ path: string; error: string }> = [];

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
        }
    }

    /**
     * Recursively list all markdown files in a directory.
     */
    private async listMarkdownFiles(dirPath: string): Promise<string[]> {
        const results: string[] = [];
        const queue: string[] = [dirPath];
        const failedDirs: string[] = [];

        while (queue.length > 0) {
            const currentPath = queue.shift()!;

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
                        queue.push(entryPath);
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

