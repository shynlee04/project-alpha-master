/**
 * @fileoverview Notes File Sync Service Barrel Export
 * @module infrastructure/sync/workspace-services/notes
 *
 * Barrel export for notes file sync service modules.
 * Re-exports all public APIs from sub-modules.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

// Main service
export {
    NotesFileSyncService,
    createNotesFileSyncService,
    type NotesFileSyncConfig
} from './notes-file-sync-service';

// Core utilities
export {
    emitChange,
    checkDisposed,
    createFileSyncServiceImplementation,
    type NotesFileSyncState,
    type NotesFileSyncDependencies,
    type NoteSyncStore
} from './notes-file-sync-core';

// CRUD operations
export {
    importFileAsNote,
    syncNoteChanges,
    noteToFilePath,
    type NoteStore,
    type FileAdapter
} from './note-crud-operations';

// Markdown parser (reading)
export {
    parseMarkdownFile,
    markdownToBlocks,
    extractTextContent
} from './note-markdown-parser';

// Markdown writer (writing)
export {
    noteToMarkdown,
    generateFrontmatter,
    blocksToMarkdown
} from './note-markdown-writer';

// File watcher
export {
    detectFileChanges,
    generateChecksum,
    setupFileWatcher,
    type FileChangeTracker,
    type FileWatcherDependencies
} from './note-file-watcher';
