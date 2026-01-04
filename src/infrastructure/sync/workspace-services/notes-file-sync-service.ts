/**
 * @fileoverview Notes File Sync Service (Facade)
 * @module lib/filesync/notes-file-sync-service
 *
 * FACADE PATTERN: This file re-exports from the new modular structure.
 * Maintains backwards compatibility for existing imports.
 *
 * New location: src/infrastructure/sync/workspace-services/notes/
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 * @deprecated Import from './notes' instead. This facade will be removed in v2.0.
 */

// Re-export everything from the new modular structure
export {
    NotesFileSyncService,
    createNotesFileSyncService,
    type NotesFileSyncConfig,
    // CRUD operations
    importFileAsNote,
    syncNoteChanges,
    noteToFilePath,
    type NoteStore,
    type FileAdapter,
    // Markdown parser (reading)
    parseMarkdownFile,
    markdownToBlocks,
    extractTextContent,
    // Markdown writer (writing)
    noteToMarkdown,
    generateFrontmatter,
    blocksToMarkdown,
    // File watcher
    detectFileChanges,
    generateChecksum,
    setupFileWatcher,
    type FileChangeTracker,
    type FileWatcherDependencies
} from './notes';
