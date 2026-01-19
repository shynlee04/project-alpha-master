/**
 * @fileoverview Note CRUD Operations
 * @module infrastructure/sync/workspace-services/notes/note-crud-operations
 *
 * Note CRUD operations for file synchronization.
 * Handles importing notes from files and exporting notes to files.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type { Block } from '@blocknote/core';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import { parseMarkdownFile } from './note-markdown-parser';
import { noteToMarkdown } from './note-markdown-writer';

/**
 * Note store interface for CRUD operations
 *
 * Provides access to note storage methods required for sync.
 */
export interface NoteStore {
    notes: Map<string, NoteRecord>;
    notesArray: NoteRecord[];
    updateNote: (params: {
        id: string;
        title?: string;
        blocks?: Block[];
    }) => Promise<void>;
    createNote: (params?: {
        title?: string;
        blocks?: Block[];
    }) => Promise<string>;
}

/**
 * File adapter interface for file operations
 *
 * Provides file system access methods required for note sync.
 */
export interface FileAdapter {
    readFile: (path: string) => Promise<{ content: string }>;
    writeFile?: (path: string, content: string) => Promise<void>;
}

/**
 * Import a file as a note
 *
 * Reads markdown file, parses content, and creates or updates note.
 * Uses frontmatter ID to detect existing notes.
 *
 * @param filePath - Path to markdown file
 * @param fileAdapter - File adapter for reading
 * @param noteStore - Note store for creating/updating
 * @returns Promise that resolves when import completes
 */
export async function importFileAsNote(
    filePath: string,
    fileAdapter: FileAdapter,
    noteStore: NoteStore
): Promise<void> {
    try {
        const result = await fileAdapter.readFile(filePath);
        const content = result.content;
        // BUG-FIX-010: await the async parseMarkdownFile function
        const { title, blocks, frontmatter } = await parseMarkdownFile(content);

        // Check if note already exists (from frontmatter ID)
        const noteId = frontmatter.id as string | undefined;
        if (noteId && noteStore.notes.has(noteId)) {
            // Update existing note
            await noteStore.updateNote({
                id: noteId,
                title,
                blocks
            });
            console.log(`[NotesFileSyncService] Updated existing note: ${noteId}`);
        } else {
            // Create new note
            const newNoteId = await noteStore.createNote({
                title,
                blocks
            });
            console.log(`[NotesFileSyncService] Created new note: ${newNoteId}`);
        }
    } catch (error) {
        console.error(`[NotesFileSyncService] Failed to import file ${filePath}:`, error);
    }
}

/**
 * Sync note changes to files
 *
 * Exports all notes from store to markdown files.
 * Generates file paths from note metadata.
 *
 * @param noteStore - Note store containing notes to sync
 * @param fileAdapter - File adapter for writing
 * @param targetDirectory - Directory to write files to
 * @returns Promise that resolves when sync completes
 */
export async function syncNoteChanges(
    noteStore: NoteStore,
    fileAdapter: FileAdapter,
    targetDirectory: string
): Promise<void> {
    // Get all notes
    const notes = noteStore.notesArray;

    // Sync each note to file
    for (const note of notes) {
        const filePath = noteToFilePath(note, targetDirectory);
        const markdown = noteToMarkdown(note);
        if (fileAdapter.writeFile) {
            await fileAdapter.writeFile(filePath, markdown);
        }
    }

    console.log(`[NotesFileSyncService] Synced ${notes.length} notes to files`);
}

/**
 * Generate file path from note
 *
 * Creates filesystem path from note title and ID.
 * Sanitizes title to create valid filename.
 *
 * @param note - Note record to generate path for
 * @param targetDirectory - Base directory for notes
 * @returns Relative file path for the note
 */
export function noteToFilePath(note: NoteRecord, targetDirectory: string): string {
    const title = (note.title || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const id = note.id.slice(0, 8);
    return `${targetDirectory}/${title}-${id}.md`;
}
