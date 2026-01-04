/**
 * @fileoverview Note File Watcher
 * @module infrastructure/sync/workspace-services/notes/note-file-watcher
 *
 * File watching and change detection for notes sync.
 * Monitors filesystem for external changes and imports modified files.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type { FileMetadata } from '../file-sync-service';
import { importFileAsNote, type NoteStore } from './note-crud-operations';

/**
 * File change tracking record
 *
 * Stores metadata for detecting file modifications.
 */
export interface FileChangeTracker {
    path: string;
    lastModified: number;
    checksum: string;
}

/**
 * File watcher dependencies
 *
 * Services required for file watching operations.
 */
export interface FileWatcherDependencies {
    targetDirectory: string;
    fileAdapter: {
        readFile: (path: string) => Promise<{ content: string }>;
        writeFile?: (path: string, content: string) => Promise<void>;
    };
    noteStore: NoteStore;
    listFiles: (path: string, recursive?: boolean) => Promise<string[]>;
    getFileMetadata: (path: string) => Promise<FileMetadata>;
}

/**
 * Generate checksum for file change detection
 *
 * Creates simple hash of file content for comparison.
 * Uses basic string hashing algorithm.
 *
 * @param filePath - Path to file to hash
 * @param readFile - File reading function
 * @returns Promise resolving to checksum string
 */
export async function generateChecksum(
    filePath: string,
    readFile: (path: string) => Promise<{ content: string }>
): Promise<string> {
    try {
        const result = await readFile(filePath);
        const content = result.content;
        // Simple hash function for change detection
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    } catch (error) {
        return '';
    }
}

/**
 * Detect external file changes and import as notes
 *
 * Scans target directory for modified markdown files.
 * Compares file metadata against tracking records.
 *
 * @param dependencies - File watcher dependencies
 * @param fileChangeTrackers - Map of tracked file changes
 * @returns Promise resolving to map of updated trackers
 */
export async function detectFileChanges(
    dependencies: FileWatcherDependencies,
    fileChangeTrackers: Map<string, FileChangeTracker>
): Promise<Map<string, FileChangeTracker>> {
    const {
        targetDirectory,
        fileAdapter,
        noteStore,
        listFiles,
        getFileMetadata
    } = dependencies;

    const updatedTrackers = new Map(fileChangeTrackers);

    try {
        // List all markdown files in target directory
        const files = await listFiles(targetDirectory, true);
        const markdownFiles = files.filter(f =>
            f.endsWith('.md') || f.endsWith('.markdown')
        );

        for (const filePath of markdownFiles) {
            const metadata = await getFileMetadata(filePath);
            const tracker = fileChangeTrackers.get(filePath);

            // Check if file is new or modified
            if (!tracker || tracker.lastModified < metadata.lastModified) {
                await importFileAsNote(filePath, fileAdapter, noteStore);

                // Update tracker
                updatedTrackers.set(filePath, {
                    path: filePath,
                    lastModified: metadata.lastModified,
                    checksum: await generateChecksum(filePath, fileAdapter.readFile)
                });

                console.log(`[NotesFileSyncService] Imported file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('[NotesFileSyncService] Failed to detect file changes:', error);
    }

    return updatedTrackers;
}

/**
 * Create file watcher instance
 *
 * Initializes periodic file scanning for external changes.
 * Returns cleanup function to stop watching.
 *
 * @param dependencies - File watcher dependencies
 * @param onFilesChanged - Callback when changes detected
 * @param watchInterval - Interval between scans (default: 3000ms)
 * @returns Cleanup function to stop watcher
 */
export function setupFileWatcher(
    dependencies: FileWatcherDependencies,
    onFilesChanged: (trackers: Map<string, FileChangeTracker>) => void,
    watchInterval: number = 3000
): () => void {
    let fileChangeTrackers = new Map<string, FileChangeTracker>();

    const fileWatchTimer = setInterval(() => {
        detectFileChanges(dependencies, fileChangeTrackers)
            .then(updatedTrackers => {
                fileChangeTrackers = updatedTrackers;
                onFilesChanged(fileChangeTrackers);
            })
            .catch(error => {
                console.error('[NotesFileSyncService] File change detection failed:', error);
            });
    }, watchInterval);

    console.log('[NotesFileSyncService] File watcher enabled');

    // Return cleanup function
    return () => {
        clearInterval(fileWatchTimer);
        console.log('[NotesFileSyncService] File watcher disabled');
    };
}
