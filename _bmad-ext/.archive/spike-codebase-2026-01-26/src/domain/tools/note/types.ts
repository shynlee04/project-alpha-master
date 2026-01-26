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

// NOTE: NoteRecord is defined in @/lib/notes/types but not used here
// The note tools work with NoteData (markdown content) not NoteRecord (BlockNote blocks)

/**
 * Generic result wrapper for note operations
 * Uses generic data type to support different tool outputs
 */
export interface NoteOperationResult<T = unknown> {
  /** Success flag */
  success: boolean;

  /** Operation result data (generic to support different schemas) */
  data?: T;

  /** Error message if failed */
  error?: string;

  /** Human-readable message */
  message?: string;
}

/**
 * Note data format for tool outputs (markdown content)
 * This differs from NoteRecord which uses BlockNote blocks
 */
export interface NoteData {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
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
  notes: NoteData[];

  /** Total count (for pagination) */
  total: number;

  /** Current offset */
  offset: number;

  /** Current limit */
  limit: number;

  /** Whether more notes exist */
  hasMore: boolean;
}
