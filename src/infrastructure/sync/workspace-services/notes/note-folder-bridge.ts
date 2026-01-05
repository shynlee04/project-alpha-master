/**
 * @fileoverview Note Folder Bridge
 * @module infrastructure/sync/workspace-services/notes/note-folder-bridge
 *
 * Handles the mapping between the filesystem folder structure and the Notes store.
 * Responsible for initial scanning and importing of notes from a mounted directory.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story S-007 - Fix Notes Workspace Project File Loading
 */

import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { NoteSyncStore } from './notes-file-sync-core';
import { importFileAsNote } from './note-crud-operations';

export class NoteFolderBridge {
    constructor(
        private localAdapter: LocalFSAdapter,
        private noteStore: NoteSyncStore
    ) {}

    /**
     * Recursively scan directory and import all markdown files as notes.
     * 
     * @param rootPath - Root path to start scanning from (relative to mount point)
     */
    async importDirectory(rootPath: string = ''): Promise<void> {
        console.log(`[NoteFolderBridge] Starting import from: ${rootPath || 'root'}`);
        const startTime = Date.now();
        let importedCount = 0;

        try {
            const files = await this.listMarkdownFiles(rootPath);
            console.log(`[NoteFolderBridge] Found ${files.length} markdown files to import`);

            for (const filePath of files) {
                try {
                    await importFileAsNote(filePath, this.localAdapter, this.noteStore);
                    importedCount++;
                } catch (error) {
                    console.error(`[NoteFolderBridge] Failed to import ${filePath}:`, error);
                }
            }

            const duration = Date.now() - startTime;
            console.log(`[NoteFolderBridge] Import complete. Imported ${importedCount}/${files.length} notes in ${duration}ms`);
        } catch (error) {
            console.error('[NoteFolderBridge] Directory import failed:', error);
            throw error;
        }
    }

    /**
     * Recursively list all markdown files in a directory.
     */
    private async listMarkdownFiles(dirPath: string): Promise<string[]> {
        const results: string[] = [];
        const queue: string[] = [dirPath];

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
            }
        }

        return results;
    }

    private isMarkdownFile(filename: string): boolean {
        const ext = filename.toLowerCase().split('.').pop();
        return ext === 'md' || ext === 'markdown';
    }
}
