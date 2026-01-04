/**
 * @fileoverview Study File Sync Service Implementation
 * @module lib/filesync/study-file-sync-service
 *
 * READ-ONLY file sync service for Study workspace.
 * Prevents accidental data loss by blocking write operations.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncStatus,
    SyncOptions,
    FileSyncConfig
} from './file-sync-service';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { Quiz } from '@/lib/study/quiz-types';

/**
 * Configuration for Study file sync service
 */
export interface StudyFileSyncConfig extends FileSyncConfig {
    localAdapter: LocalFSAdapter;
}

/**
 * Result of importing study materials
 */
export interface ImportResult {
    success: boolean;
    filesProcessed: number;
    quizzesImported: number;
    pdfsFound: number;
    errors: Array<{ path: string; error: string }>;
}

/**
 * Study File Sync Service (READ-ONLY)
 *
 * Provides read-only access to study materials (PDFs, quiz JSONs, Markdown).
 * Intentionally blocks write/delete operations to prevent accidental data loss.
 *
 * Features:
 * - Read-only file operations (read, list, metadata)
 * - Import PDFs for flashcard generation
 * - Import quiz JSON files
 * - Scan directories for study materials
 * - Mount directory handle for browser-based access
 */
export class StudyFileSyncService implements FileSyncService {
    private localAdapter: LocalFSAdapter;
    private changeListeners: Set<(event: FileChangeEvent) => void>;
    private disposed: boolean;

    constructor(config: StudyFileSyncConfig) {
        this.localAdapter = config.localAdapter;
        this.changeListeners = new Set();
        this.disposed = false;
    }

    async readFile(path: string): Promise<string> {
        this.checkDisposed();
        const result = await this.localAdapter.readFile(path);
        return result.content;
    }

    /**
     * READ-ONLY: Throws error to prevent data loss
     */
    async writeFile(_path: string, _content: string): Promise<void> {
        this.checkDisposed();
        throw new Error(
            'Study workspace is read-only. Cannot write files. ' +
            'Study materials are consumed, not created. Use the Knowledge or Notes workspaces for content creation.'
        );
    }

    /**
     * READ-ONLY: Throws error to prevent data loss
     */
    async deleteFile(_path: string): Promise<void> {
        this.checkDisposed();
        throw new Error(
            'Study workspace is read-only. Cannot delete files. ' +
            'This prevents accidental loss of study materials.'
        );
    }

    async listFiles(path: string, recursive = false): Promise<string[]> {
        this.checkDisposed();

        if (!recursive) {
            const entries = await this.localAdapter.listDirectory(path);
            return entries.map((e: { name: string }) => path ? `${path}/${e.name}` : e.name);
        }

        // Manual recursive traversal
        const results: string[] = [];
        const queue: string[] = [path];

        while (queue.length > 0) {
            const currentPath = queue.shift()!;

            try {
                const entries = await this.localAdapter.listDirectory(currentPath);

                for (const entry of entries) {
                    const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                    results.push(entryPath);

                    if (entry.type === 'directory') {
                        queue.push(entryPath);
                    }
                }
            } catch (error) {
                console.warn(`[StudyFileSyncService] Failed to list ${currentPath}:`, error);
            }
        }

        return results;
    }

    async getFileMetadata(path: string): Promise<FileMetadata> {
        this.checkDisposed();

        try {
            const result = await this.localAdapter.readFile(path);
            return {
                path,
                size: result.content.length,
                lastModified: Date.now(),
                contentType: this.inferContentType(path)
            };
        } catch (error) {
            throw new Error(`Failed to get metadata for ${path}: ${error}`);
        }
    }

    async writeBatch(_operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
        this.checkDisposed();
        throw new Error(
            'Study workspace is read-only. Cannot write files in batch. ' +
            'Use read operations only.'
        );
    }

    async mount(_source: FileSystemDirectoryHandle): Promise<void> {
        this.checkDisposed();

        // LocalFSAdapter is already initialized with directory handle
        // This is a no-op but kept for interface consistency
        console.log('[StudyFileSyncService] Directory mounted successfully (read-only mode)');
    }

    async sync(_options?: SyncOptions): Promise<SyncResult> {
        this.checkDisposed();

        // Study workspace is read-only, so sync is a no-op
        // We just scan for available study materials
        return {
            success: true,
            filesProcessed: 0,
            errors: [],
            duration: 0
        };
    }

    getSyncStatus(): SyncStatus {
        return {
            syncing: false,
            lastSync: null,
            filesProcessed: 0,
            error: null
        };
    }

    onFileChange(callback: (event: FileChangeEvent) => void): () => void {
        this.checkDisposed();
        this.changeListeners.add(callback);
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    async dispose(): Promise<void> {
        this.disposed = true;
        this.changeListeners.clear();
    }

    // ============================================================
    // Study-specific import methods
    // ============================================================

    /**
     * Import PDF files for flashcard generation
     * Scans mounted directory for PDF files and returns list
     */
    async importPDFAsFlashcards(directory: string): Promise<string[]> {
        this.checkDisposed();

        const allFiles = await this.listFiles(directory, true);
        const pdfFiles = allFiles.filter(f => f.toLowerCase().endsWith('.pdf'));

        console.log(`[StudyFileSyncService] Found ${pdfFiles.length} PDF files for import`);

        return pdfFiles;
    }

    /**
     * Import quiz from JSON file
     * Validates and parses quiz JSON structure
     */
    async importQuizJSON(filePath: string): Promise<Quiz | null> {
        this.checkDisposed();

        try {
            const content = await this.readFile(filePath);
            const quizData = JSON.parse(content) as Quiz;

            // Basic validation
            if (!quizData.id || !quizData.questions || !Array.isArray(quizData.questions)) {
                throw new Error('Invalid quiz JSON structure');
            }

            console.log(`[StudyFileSyncService] Imported quiz: ${quizData.title} (${quizData.questions.length} questions)`);

            return quizData;
        } catch (error) {
            console.error(`[StudyFileSyncService] Failed to import quiz from ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Import all study materials from directory
     * Scans for PDFs, quiz JSONs, and Markdown files
     */
    async importStudyMaterials(directory: string): Promise<ImportResult> {
        this.checkDisposed();

        const errors: Array<{ path: string; error: string }> = [];
        let pdfCount = 0;
        let quizCount = 0;

        try {
            const allFiles = await this.listFiles(directory, true);

            // Count PDFs
            const pdfs = allFiles.filter(f => f.toLowerCase().endsWith('.pdf'));
            pdfCount = pdfs.length;

            // Import quiz JSONs
            const quizFiles = allFiles.filter(f => f.toLowerCase().endsWith('.json'));
            for (const quizFile of quizFiles) {
                try {
                    const quiz = await this.importQuizJSON(quizFile);
                    if (quiz) {
                        quizCount++;
                    }
                } catch (error) {
                    errors.push({
                        path: quizFile,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            console.log(`[StudyFileSyncService] Import complete: ${pdfCount} PDFs, ${quizCount} quizzes`);

            return {
                success: errors.length === 0,
                filesProcessed: allFiles.length,
                quizzesImported: quizCount,
                pdfsFound: pdfCount,
                errors,
            };
        } catch (error) {
            return {
                success: false,
                filesProcessed: 0,
                quizzesImported: 0,
                pdfsFound: 0,
                errors: [{
                    path: directory,
                    error: error instanceof Error ? error.message : 'Import failed'
                }]
            };
        }
    }

    // ============================================================
    // Private helper methods
    // ============================================================

    private checkDisposed(): void {
        if (this.disposed) {
            throw new Error('StudyFileSyncService has been disposed');
        }
    }

    private inferContentType(path: string): string {
        const ext = path.split('.').pop()?.toLowerCase();

        switch (ext) {
            case 'pdf':
                return 'application/pdf';
            case 'json':
                return 'application/json';
            case 'md':
            case 'markdown':
                return 'text/markdown';
            case 'txt':
                return 'text/plain';
            default:
                return 'application/octet-stream';
        }
    }
}

/**
 * Factory function to create Study file sync service
 */
export function createStudyFileSyncService(config: StudyFileSyncConfig): StudyFileSyncService {
    return new StudyFileSyncService(config);
}
