/**
 * @fileoverview Note Tools Facade - Agent Tool Interface
 * @module lib/agent/facades/note-tools
 *
 * Facade interface for note CRUD operations.
 * Abstracts the underlying note store from agent tools.
 *
 * @governance EPIC-40 Story 40-07
 * @story Wire Note CRUD Tools to Factory
 * @created 2026-01-10
 */

import type { NoteData, ListNotesResult, NotePaginationParams } from '@/domain/tools/note/types';

/**
 * AgentNoteTools - Facade interface for note CRUD operations
 *
 * This interface provides a clean abstraction layer between agent tools
 * and the underlying note store, enabling:
 * - Consistent error handling
 * - Workspace permission integration
 * - Format conversion (BlockNote blocks <-> Markdown)
 * - Testability
 */
export interface AgentNoteTools {
  /**
   * Create a new note
   *
   * @param params - Note creation parameters
   * @returns Created note data (in Markdown format)
   * @throws Error if creation fails
   */
  createNote(params: {
    title: string;
    content: string;
    parentId?: string;
  }): Promise<NoteData>;

  /**
   * Read a note by ID
   *
   * @param noteId - Note ID to read
   * @returns Note data or null if not found
   * @throws Error if read fails
   */
  readNote(noteId: string): Promise<NoteData | null>;

  /**
   * Update an existing note
   *
   * @param noteId - Note ID to update
   * @param params - Update parameters (partial)
   * @returns Updated note data
   * @throws Error if update fails or note not found
   */
  updateNote(
    noteId: string,
    params: { title?: string; content?: string }
  ): Promise<NoteData>;

  /**
   * Delete a note
   *
   * @param noteId - Note ID to delete
   * @returns void
   * @throws Error if deletion fails or note not found
   */
  deleteNote(noteId: string): Promise<void>;

  /**
   * List notes with pagination
   *
   * @param params - Pagination and filter parameters
   * @returns List of notes with pagination info
   * @throws Error if list fails
   */
  listNotes(params?: NotePaginationParams): Promise<ListNotesResult>;
}
