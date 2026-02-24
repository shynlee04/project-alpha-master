/**
 * @fileoverview Note Commands Tool - FSA-Based Agent Tools
 * @module lib/agent/tools/note-commands
 *
 * Agent tools for note CRUD operations using FSA-based storage.
 * Tools interact with StorageGateway abstraction created in CC-DF-02.
 *
 * @epic CC-DESKTOP-FSA
 * @story CC-DF-03 - Agent Tool Integration
 * @created 2026-01-18
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import { formatNoteForStorage, parseNoteFromStorage, getNoteFilename, extractNoteId } from '@/lib/notes/format/note-formatter';
import { createStorageAdapter } from '@/infrastructure/filesystem/StorageAdapterFactory';
import type { ToolResult } from './types';
import type { NoteRecord } from '@/lib/notes/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Output for list_notes tool
 */
interface ListNotesOutput {
  notes: Array<{
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    parentId?: string | null;
  }>;
  total: number;
}

/**
 * Output for read_note tool
 */
interface ReadNoteOutput {
  note: {
    id: string;
    title: string;
    content: string;
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Output for write_note tool
 */
interface WriteNoteOutput {
  note: {
    id: string;
    title: string;
    content: string;
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Output for delete_note tool
 */
interface DeleteNoteOutput {
  deletedNoteId: string;
  deletedTitle: string;
}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for list_notes tool input
 */
export const ListNotesInputSchema = z.object({
  projectId: z.string().describe('Project ID for storage context'),
  limit: z.number().optional().describe('Maximum number of notes to return'),
  offset: z.number().optional().describe('Pagination offset'),
});

/**
 * Schema for read_note tool input
 */
export const ReadNoteInputSchema = z.object({
  noteId: z.string().describe('Note ID to read'),
  projectId: z.string().describe('Project ID for storage context'),
});

/**
 * Schema for write_note tool input
 */
export const WriteNoteInputSchema = z.object({
  noteId: z.string().describe('Note ID (optional - auto-generate if not provided)'),
  title: z.string().describe('Note title'),
  content: z.string().describe('Note content (markdown format)'),
  projectId: z.string().describe('Project ID for storage context'),
  parentId: z.string().optional().describe('Parent note ID (optional)'),
});

/**
 * Schema for delete_note tool input
 */
export const DeleteNoteInputSchema = z.object({
  noteId: z.string().describe('Note ID to delete'),
  projectId: z.string().describe('Project ID for storage context'),
});

// ============================================================================
// Tool Definitions
// ============================================================================

/**
 * List notes tool definition
 *
 * Lists all notes in the FSA /notes/ directory.
 * Returns note metadata without content for performance.
 */
export const listNotesDef = toolDefinition({
  name: 'list_notes',
  description: 'List all notes in the project. Returns note metadata (title, dates, parent) without full content.',
  inputSchema: ListNotesInputSchema,
});

/**
 * Read note tool definition
 *
 * Reads a note by ID from FSA storage.
 * Returns full note content including markdown text.
 */
export const readNoteDef = toolDefinition({
  name: 'read_note',
  description: 'Read a note by ID. Returns full note content with markdown text and metadata.',
  inputSchema: ReadNoteInputSchema,
});

/**
 * Write note tool definition
 *
 * Creates or updates a note in FSA storage.
 * If noteId is provided, updates existing note.
 * Otherwise creates new note with auto-generated ID.
 */
export const writeNoteDef = toolDefinition({
  name: 'write_note',
  description: 'Create or update a note. If noteId provided, updates existing. Otherwise creates new note.',
  inputSchema: WriteNoteInputSchema,
});

/**
 * Delete note tool definition
 *
 * Deletes a note by ID from FSA storage.
 * Returns deleted note ID and title for confirmation.
 */
export const deleteNoteDef = toolDefinition({
  name: 'delete_note',
  description: 'Delete a note by ID. Returns deleted note ID and title for confirmation.',
  inputSchema: DeleteNoteInputSchema,
});

// ============================================================================
// Server Implementations
// ============================================================================

/**
 * Create a server implementation of list_notes tool
 *
 * Uses StorageGateway to list notes in /notes/ directory.
 * Returns note metadata from YAML frontmatter.
 */
export function createListNotesTool() {
  return listNotesDef.server(async (args: unknown): Promise<ToolResult<ListNotesOutput>> => {
    const { projectId, limit, offset } = args as {
      projectId: string;
      limit?: number;
      offset?: number;
    };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // List all .md files in /notes/ directory
      const filePaths = await storage.listFiles('notes/*.md');

      // Parse each note file to extract metadata
      const notes: ListNotesOutput['notes'] = [];
      for (const filePath of filePaths) {
        try {
          // Read file content
          const fileData = await storage.readFile(filePath);

          // Parse note metadata from markdown
          const noteId = extractNoteId(filePath.split('/').pop() || filePath);
          const parsed = parseNoteFromStorage(fileData.text || '', noteId);

          // Extract metadata without content
          notes.push({
            id: parsed.frontmatter.projectId || noteId,
            title: parsed.frontmatter.title,
            createdAt: parsed.frontmatter.created,
            updatedAt: parsed.frontmatter.modified,
            parentId: parsed.frontmatter.parentId || null,
          });
        } catch (error) {
          console.warn(`[note-commands] Failed to parse note: ${filePath}`, error);
        }
      }

      // Sort by updated date descending
      notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      // Apply pagination
      const startOffset = offset || 0;
      const limitValue = limit || notes.length;
      const paginatedNotes = notes.slice(startOffset, startOffset + limitValue);

      return {
        success: true,
        data: {
          notes: paginatedNotes,
          total: notes.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list notes',
      };
    }
  });
}

/**
 * Create a server implementation of read_note tool
 *
 * Uses StorageGateway to read note by ID.
 * Returns full note content including markdown text.
 */
export function createReadNoteTool() {
  return readNoteDef.server(async (args: unknown): Promise<ToolResult<ReadNoteOutput>> => {
    const { noteId, projectId } = args as {
      noteId: string;
      projectId: string;
    };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // Build file path: notes/{noteId}.md
      const filePath = `notes/${getNoteFilename(noteId)}`;

      // Read note file
      const fileData = await storage.readFile(filePath);

      // Parse note from markdown
      const parsed = parseNoteFromStorage(fileData.text || '', noteId);

      return {
        success: true,
        data: {
          note: {
            id: parsed.frontmatter.projectId || noteId,
            title: parsed.frontmatter.title,
            content: parsed.markdown,
            parentId: parsed.frontmatter.parentId || null,
            createdAt: parsed.frontmatter.created,
            updatedAt: parsed.frontmatter.modified,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read note',
      };
    }
  });
}

/**
 * Create a server implementation of write_note tool
 *
 * Uses StorageGateway to create or update a note in FSA storage.
 * Converts NoteRecord to markdown using formatNoteForStorage().
 */
export function createWriteNoteTool() {
  return writeNoteDef.server(async (args: unknown): Promise<ToolResult<WriteNoteOutput>> => {
    const { noteId: providedNoteId, title, projectId, parentId } = args as {
        noteId?: string;
        title: string;
        content: string; // Mark as used
        projectId: string;
        parentId?: string | undefined; // FIX: Use undefined instead of null
      };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // Determine note ID (use provided or generate new one)
      const finalNoteId = providedNoteId || crypto.randomUUID();

      // Parse content to NoteRecord format for formatter
      // Use simplified NoteRecord structure with required fields
      const noteRecord: NoteRecord = {
        id: finalNoteId,
        projectId,
        workspaceId: 'notes',
        title,
        blocks: [], // Simplified - content is markdown
        parentId: parentId || undefined,
        isFavorite: false,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Convert NoteRecord to markdown format
      const markdown = formatNoteForStorage(noteRecord);

      // Build file path: notes/{noteId}.md
      const filePath = `notes/${getNoteFilename(finalNoteId)}`;

      // Convert markdown string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(markdown);

      // Write note file
      await storage.writeFile(filePath, data);

      return {
        success: true,
        data: {
          note: {
            id: finalNoteId,
            title,
            content: markdown,
            parentId: parentId || null,
            createdAt: new Date(noteRecord.createdAt).toISOString(),
            updatedAt: new Date(noteRecord.updatedAt).toISOString(),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write note',
      };
    }
  });
}

/**
 * Create a server implementation of delete_note tool
 *
 * Uses StorageGateway to delete a note by ID from FSA storage.
 */
export function createDeleteNoteTool() {
  return deleteNoteDef.server(async (args: unknown): Promise<ToolResult<DeleteNoteOutput>> => {
    const { noteId, projectId } = args as {
      noteId: string;
      projectId: string;
    };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // Build file path: notes/{noteId}.md
      const filePath = `notes/${getNoteFilename(noteId)}`;

      // Read note to get title for response
      const fileData = await storage.readFile(filePath);
      const parsed = parseNoteFromStorage(fileData.text || '', noteId);

      // Delete note file
      await storage.deleteFile(filePath);

      return {
        success: true,
        data: {
          deletedNoteId: noteId,
          deletedTitle: parsed.frontmatter.title,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete note',
      };
    }
  });
}

// ============================================================================
// Client Implementations (for browser-side execution)
// ============================================================================

/**
 * Create a client implementation of list_notes tool
 *
 * Uses StorageGateway to list notes in /notes/ directory.
 * Returns note metadata from YAML frontmatter.
 */
export function createListNotesClientTool() {
  return listNotesDef.client(async (input: unknown): Promise<ToolResult<ListNotesOutput>> => {
    const { projectId, limit, offset } = input as {
      projectId: string;
      limit?: number;
      offset?: number;
    };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // List all .md files in /notes/ directory
      const filePaths = await storage.listFiles('notes/*.md');

      // Parse each note file to extract metadata
      const notes: ListNotesOutput['notes'] = [];
      for (const filePath of filePaths) {
        try {
          // Read file content
          const fileData = await storage.readFile(filePath);

          // Parse note metadata from markdown
          const noteId = extractNoteId(filePath.split('/').pop() || filePath);
          const parsed = parseNoteFromStorage(fileData.text || '', noteId);

          // Extract metadata without content
          notes.push({
            id: parsed.frontmatter.projectId || noteId,
            title: parsed.frontmatter.title,
            createdAt: parsed.frontmatter.created,
            updatedAt: parsed.frontmatter.modified,
            parentId: parsed.frontmatter.parentId || null,
          });
        } catch (error) {
          console.warn(`[note-commands] Failed to parse note: ${filePath}`, error);
        }
      }

      // Sort by updated date descending
      notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      // Apply pagination
      const startOffset = offset || 0;
      const limitValue = limit || notes.length;
      const paginatedNotes = notes.slice(startOffset, startOffset + limitValue);

      return {
        success: true,
        data: {
          notes: paginatedNotes,
          total: notes.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list notes',
      };
    }
  });
}

/**
 * Create a client implementation of read_note tool
 *
 * Uses StorageGateway to read note by ID.
 * Returns full note content including markdown text.
 */
export function createReadNoteClientTool() {
  return readNoteDef.client(async (input: unknown): Promise<ToolResult<ReadNoteOutput>> => {
    const { noteId, projectId } = input as {
      noteId: string;
      projectId: string;
    };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // Build file path: notes/{noteId}.md
      const filePath = `notes/${getNoteFilename(noteId)}`;

      // Read note file
      const fileData = await storage.readFile(filePath);

      // Parse note from markdown
      const parsed = parseNoteFromStorage(fileData.text || '', noteId);

      return {
        success: true,
        data: {
          note: {
            id: parsed.frontmatter.projectId || noteId,
            title: parsed.frontmatter.title,
            content: parsed.markdown,
            parentId: parsed.frontmatter.parentId || null,
            createdAt: parsed.frontmatter.created,
            updatedAt: parsed.frontmatter.modified,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read note',
      };
    }
  });
}

/**
 * Create a client implementation of write_note tool
 *
 * Uses StorageGateway to create or update a note in FSA storage.
 * Converts NoteRecord to markdown using formatNoteForStorage().
 */
export function createWriteNoteClientTool() {
  return writeNoteDef.client(async (input: unknown): Promise<ToolResult<WriteNoteOutput>> => {
    const { noteId: providedNoteId, title, projectId, parentId } = input as {
      noteId?: string;
      title: string;
      content: string; // Mark as used
      projectId: string;
      parentId?: string | undefined; // FIX: Use undefined instead of null
    };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // Determine note ID (use provided or generate new one)
      const finalNoteId = providedNoteId || crypto.randomUUID();

      // Parse content to NoteRecord format for formatter
      // Use simplified NoteRecord structure with required fields
      const noteRecord: NoteRecord = {
        id: finalNoteId,
        projectId,
        workspaceId: 'notes',
        title,
        blocks: [], // Simplified - content is markdown
        parentId: parentId || undefined, // FIX: Use undefined instead of null
        isFavorite: false,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Convert NoteRecord to markdown format
      const markdown = formatNoteForStorage(noteRecord);

      // Build file path: notes/{noteId}.md
      const filePath = `notes/${getNoteFilename(finalNoteId)}`;

      // Convert markdown string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(markdown);

      // Write note file
      await storage.writeFile(filePath, data);

      return {
        success: true,
        data: {
          note: {
            id: finalNoteId,
            title,
            content: markdown,
            parentId: parentId || null,
            createdAt: new Date(noteRecord.createdAt).toISOString(),
            updatedAt: new Date(noteRecord.updatedAt).toISOString(),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write note',
      };
    }
  });
}

/**
 * Create a client implementation of delete_note tool
 *
 * Uses StorageGateway to delete a note by ID from FSA storage.
 */
export function createDeleteNoteClientTool() {
  return deleteNoteDef.client(async (input: unknown): Promise<ToolResult<DeleteNoteOutput>> => {
    const { noteId, projectId } = input as {
      noteId: string;
      projectId: string;
    };

    try {
      // Get storage gateway for project
      const storage = createStorageAdapter({ projectId });

      // Build file path: notes/{noteId}.md
      const filePath = `notes/${getNoteFilename(noteId)}`;

      // Read note to get title for response
      const fileData = await storage.readFile(filePath);
      const parsed = parseNoteFromStorage(fileData.text || '', noteId);

      // Delete note file
      await storage.deleteFile(filePath);

      return {
        success: true,
        data: {
          deletedNoteId: noteId,
          deletedTitle: parsed.frontmatter.title,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete note',
      };
    }
  });
}
