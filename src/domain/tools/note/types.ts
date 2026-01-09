/**
 * @fileoverview Note Tool Types
 * @module domain/tools/note/types
 * @governance EPIC-40 MM-04
 *
 * Shared types for note CRUD tools.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';

/**
 * Result of a note CRUD operation
 */
export interface NoteOperationResult {
  /** Success flag */
  success: boolean;

  /** Operation result data */
  data?: NoteRecord | NoteRecord[];

  /** Error message if failed */
  error?: string;

  /** Human-readable message */
  message?: string;
}

/**
 * Pagination parameters for listing notes
 */
export interface NotePaginationParams {
  /** Maximum number of notes to return */
  limit?: number;

  /** Number of notes to skip (for pagination) */
  offset?: number;

  /** Parent folder ID to filter by */
  parentId?: string | null;

  /** Search query for filtering */
  search?: string;
}

/**
 * List notes result with pagination info
 */
export interface ListNotesResult {
  /** Array of notes */
  notes: NoteRecord[];

  /** Total count (for pagination) */
  total: number;

  /** Current offset */
  offset: number;

  /** Current limit */
  limit: number;

  /** Whether more notes exist */
  hasMore: boolean;
}
