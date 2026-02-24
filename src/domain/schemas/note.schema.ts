/**
 * @fileoverview Note Zod Schema - Domain Layer
 * @module domain/schemas/note.schema
 *
 * Canonical Zod schema for Note entities.
 * Types are derived from schemas using z.infer for single source of truth.
 *
 * ARCHITECTURE: Project-centric model
 * - Note belongs to Project via projectId
 * - NO workspaceId - platform determines plugin availability
 *
 * @phase 02 - Schema Definitions
 */

import { z } from 'zod';

// ============================================================================
// Note Schema
// ============================================================================

/**
 * Note - Canonical Zod Schema
 *
 * BlockNote-based note with hierarchical organization.
 *
 * ARCHITECTURE:
 * - L3 (Persisted State) for metadata - stored in Dexie
 * - L4 (File State) for content - stored as .md files
 * - Read metadata via useLiveQuery()
 * - Read content via gateway.read()
 *
 * Project-centric: Note belongs to Project via projectId only.
 */
export const NoteSchema = z.object({
  /** Note ID (UUID) */
  id: z.string().uuid(),
  /** Project ID (foreign key) - the ONLY anchor */
  projectId: z.string().uuid(),
  /** Note title */
  title: z.string().min(1).max(255),
  /** Optional emoji icon */
  emoji: z.string().optional(),
  /** BlockNote JSON blocks */
  blocks: z.array(z.unknown()),
  /** Parent note ID for nesting */
  parentId: z.string().uuid().optional(),
  /** Whether note is starred/favorited */
  isFavorite: z.boolean().default(false),
  /** Sort order within parent */
  order: z.number().int().nonnegative().default(0),
  /** Whether note is indexed for RAG */
  isIndexed: z.boolean().optional(),
  /** Last indexed timestamp */
  indexedAt: z.number().optional(),
  /** Creation timestamp (Unix ms) */
  createdAt: z.number(),
  /** Last update timestamp (Unix ms) */
  updatedAt: z.number(),
});

// ============================================================================
// Derived Types
// ============================================================================

/** Note type */
export type Note = z.infer<typeof NoteSchema>;

// ============================================================================
// Param Schemas
// ============================================================================

/**
 * Note creation parameters
 * Excludes auto-generated fields: id, createdAt, updatedAt, order
 */
export const NoteCreateParamsSchema = NoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  order: true,
  isIndexed: true,
  indexedAt: true,
}).partial({
  blocks: true,
  isFavorite: true,
});

/** Note creation parameters type */
export type NoteCreateParams = z.infer<typeof NoteCreateParamsSchema>;

/**
 * Note update parameters
 */
export const NoteUpdateParamsSchema = NoteSchema.partial().required({
  id: true,
});

/** Note update parameters type */
export type NoteUpdateParams = z.infer<typeof NoteUpdateParamsSchema>;

// ============================================================================
// Tree Node Schema (for UI rendering)
// ============================================================================

/**
 * Note tree node type (for recursive schema)
 */
export interface NoteTreeNode {
  id: string;
  title: string;
  emoji?: string;
  order: number;
  isFavorite: boolean;
  parentId?: string;
  children: NoteTreeNode[];
  depth: number;
}

/**
 * Note tree node for hierarchical display
 */
export const NoteTreeNodeSchema: z.ZodType<NoteTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    emoji: z.string().optional(),
    order: z.number(),
    isFavorite: z.boolean(),
    parentId: z.string().optional(),
    children: z.array(NoteTreeNodeSchema),
    depth: z.number(),
  })
);
