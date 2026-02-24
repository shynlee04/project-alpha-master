/**
 * @fileoverview Note Execution Context for Agent Tools
 * @module lib/workspace/note-context-tracker
 * @governance NS-2026-01-07
 * @created 2026-01-07T10:00:00+07:00
 *
 * Provides note context for AI agent tools in Notes workspace.
 * Ensures AI agents understand the current (on-view)(loaded note page.
 *
 * Story: Integrate scattered AI features into Notes workspace
 * - Track active note ID, title, blocks
 * - Extract plain text content for AI context
 * - Provide selection state for targeted operations
 *
 * Follows December 2025 Zustand patterns:
 * - Non-React access (uses Zustand stores directly)
 * - Graceful degradation (handles missing state)
 * - Single responsibility (context retrieval only)
 */

import { useNoteStore } from '@/lib/notes';
import { extractTextFromBlocks } from '@/lib/notes/types-embedding';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import type { Block } from '@blocknote/core';

/**
 * Note selection state for cursor position
 */
export interface NoteSelection {
  /** Current block index (if available) */
  blockIndex?: number;

  /** Current text offset within block */
  offset?: number;

  /** Selected text (if any) */
  selectedText?: string;
}

/**
 * Note execution context
 *
 * Retrieved from Zustand stores for AI agent awareness.
 * Provides complete context about the currently active note.
 */
export interface NoteExecutionContext {
  /** Whether a note is currently active/loaded */
  hasActiveNote: boolean;

  /** Active note ID */
  noteId: string | null;

  /** Note title */
  title: string;

  /** Note emoji (if set) */
  emoji?: string;

  /** BlockNote blocks structure */
  blocks: Block[];

  /** Plain text content of the note (for AI context) */
  contentText: string;

  /** Content length in characters */
  contentLength: number;

  /** Number of blocks */
  blockCount: number;

  /** Whether note is favorited */
  isFavorite: boolean;

  /** Selection state (cursor position) */
  selection: NoteSelection;

  /** Parent note ID (if nested) */
  parentId?: string;

  /** Project ID */
  projectId: string | null;

  /** Timestamps */
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Get note execution context for AI agent awareness
 *
 * This function is called from agent tool factory functions (non-React code).
 * It retrieves the current active note state from Zustand stores directly.
 *
 * @returns Note execution context
 *
 * @example
 * ```typescript
 * const summarizeNote = summarizeNoteDef.client(async (args: unknown) => {
 *   // Get note context
 *   const noteContext = getNoteExecutionContext();
 *
 *   if (!noteContext.hasActiveNote) {
 *     return {
 *       success: false,
 *       error: 'No active note. Please open a note first.',
 *       code: 'NO_ACTIVE_NOTE',
 *     };
 *   }
 *
 *   // Use note content for AI processing
 *   const summary = await generateSummary(noteContext.contentText);
 *
 *   return { success: true, summary };
 * });
 * ```
 */
export function getNoteExecutionContext(): NoteExecutionContext {
  // Get note store state
  const noteState = useNoteStore.getState();

  const activeNoteId = noteState.activeNoteId;
  const notes = noteState.notes;
  const projectId = noteState.currentProjectId;

  // Default empty context
  const emptyContext: NoteExecutionContext = {
    hasActiveNote: false,
    noteId: null,
    title: '',
    blocks: [],
    contentText: '',
    contentLength: 0,
    blockCount: 0,
    isFavorite: false,
    selection: {},
    projectId,
  };

  // No active note
  if (!activeNoteId) {
    return emptyContext;
  }

  // Get active note from store
  const note = notes.get(activeNoteId);

  if (!note) {
    return emptyContext;
  }

  // Extract plain text from blocks
  const contentText = extractTextFromBlocks(note.blocks);
  const blocks = note.blocks as Block[];

  return {
    hasActiveNote: true,
    noteId: activeNoteId,
    title: note.title || 'Untitled',
    emoji: note.emoji,
    blocks,
    contentText,
    contentLength: contentText.length,
    blockCount: blocks.length,
    isFavorite: note.isFavorite,
    selection: {}, // TODO: Integrate with BlockNote selection API
    parentId: note.parentId,
    projectId: projectId || note.projectId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

/**
 * Get formatted note summary for AI prompt context
 *
 * Formats note context as a structured string for inclusion in AI prompts.
 * Useful for providing context to LLM tools.
 *
 * @param context - Note execution context
 * @param maxLength - Maximum characters to include (default 2000)
 * @returns Formatted context string
 *
 * @example
 * ```typescript
 * const noteContext = getNoteExecutionContext();
 * const contextStr = formatNoteContextForPrompt(noteContext, 1000);
 *
 * // Returns:
 * // "Current Note: My Meeting Notes
 * // Content: This is the text content of the note...
 * // Blocks: 5 | Characters: 245"
 * ```
 */
export function formatNoteContextForPrompt(
  context: NoteExecutionContext,
  maxLength: number = 2000
): string {
  if (!context.hasActiveNote) {
    return '(No active note)';
  }

  let content = context.contentText;

  // Truncate if too long
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '...';
  }

  return `Current Note: ${context.title}
${context.emoji ? `Emoji: ${context.emoji}\n` : ''}Content: ${content}
Blocks: ${context.blockCount} | Characters: ${context.contentLength}`;
}

/**
 * Check if there's an active note for tool execution
 *
 * Convenience function for tools that require an active note.
 *
 * @returns True if an active note exists
 *
 * @example
 * ```typescript
 * const tool = someToolDef.client(async (args) => {
 *   if (!hasActiveNote()) {
 *     return {
 *       success: false,
 *       error: 'Please open a note first.',
 *       code: 'NO_ACTIVE_NOTE',
 *     };
 *   }
 *
 *   // Tool logic here...
 * });
 * ```
 */
export function hasActiveNote(): boolean {
  const noteState = useNoteStore.getState();
  return noteState.activeNoteId !== null;
}

/**
 * Get active note ID
 *
 * Convenience function for getting just the note ID.
 *
 * @returns Active note ID or null
 */
export function getActiveNoteId(): string | null {
  const noteState = useNoteStore.getState();
  return noteState.activeNoteId;
}

/**
 * Get active note record
 *
 * Convenience function for getting the full note record.
 *
 * @returns Active note record or null
 */
export function getActiveNote(): NoteRecord | null {
  const noteState = useNoteStore.getState();
  const activeNoteId = noteState.activeNoteId;

  if (!activeNoteId) {
    return null;
  }

  return noteState.notes.get(activeNoteId) || null;
}

/**
 * Note context error codes
 */
export enum NoteContextError {
  NO_ACTIVE_NOTE = 'NO_ACTIVE_NOTE',
  NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
  NOTE_READ_ONLY = 'NOTE_READ_ONLY',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
}

/**
 * Create a note context error response
 *
 * Standardized error response for tools that require note context.
 *
 * @param code - Error code from NoteContextError enum
 * @param message - Optional custom error message
 * @returns Error response object
 */
export function createNoteContextError(
  code: NoteContextError,
  message?: string
): {
  success: false;
  error: string;
  code: string;
} {
  const defaultMessages: Record<NoteContextError, string> = {
    [NoteContextError.NO_ACTIVE_NOTE]: 'No active note. Please open a note first.',
    [NoteContextError.NOTE_NOT_FOUND]: 'The active note could not be found.',
    [NoteContextError.NOTE_READ_ONLY]: 'This note is read-only.',
    [NoteContextError.EMPTY_CONTENT]: 'This note has no content to process.',
  };

  return {
    success: false,
    error: message || defaultMessages[code],
    code,
  };
}
