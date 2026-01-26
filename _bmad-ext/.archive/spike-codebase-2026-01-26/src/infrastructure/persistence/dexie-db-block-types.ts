/**
 * @fileoverview Saved Blocks Database Types
 * @module infrastructure/persistence/dexie-db-block-types
 * @governance UX-13
 * @ai-observable true
 *
 * Database-backed block types for reusable block content.
 * Users can save blocks for reuse across notes with favorites and usage tracking.
 *
 * Story UX-13: Database Backed Blocks
 */

import type { Table } from 'dexie';

// ============================================================================
// Saved Block Record Types
// ============================================================================

/**
 * Block type categories for saved blocks
 */
export type SavedBlockType =
    | 'text'           // Plain text block
    | 'callout'        // Callout block (info/warning/error/success/tip)
    | 'toggle'         // Toggle list (collapsible)
    | 'reference'      // Block reference
    | 'column'         // Column layout
    | 'synced'         // Synced block
    | 'aiImage'        // AI Image generation block
    | 'aiVision'       // AI Vision block
    | 'chart';         // Chart/Diagram block

/**
 * Saved block record for reusable block content
 *
 * Features:
 * - Save any block type with its full BlockNote JSON structure
 * - Workspace isolation (workspaceId field)
 * - Tag-based categorization
 * - Favorites system
 * - Usage tracking (useCount, lastUsedAt)
 * - Built-in vs user-created distinction
 *
 * @ai-observable Blocks can be shared across workspaces
 * @governance UX-13
 */
export interface SavedBlockRecord {
    /** Primary key - UUID */
    id: string;

    /** PERSIST-S002: Workspace isolation */
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';

    /** Block name (unique per workspace) */
    name: string;

    /** Optional description */
    description?: string;

    /** Block type category */
    blockType: SavedBlockType;

    /** Block data as BlockNote JSON structure */
    blockData: unknown;

    /** Tags for categorization and search */
    tags: string[];

    /** Optional category for organization */
    category?: string;

    /** Whether this block is marked as favorite */
    isFavorite: boolean;

    /** Number of times this block has been inserted */
    useCount: number;

    /** Timestamp of last use */
    lastUsedAt?: number;

    /** Creation timestamp */
    createdAt: number;

    /** Last update timestamp */
    updatedAt: number;

    /** Whether this is a built-in template (read-only) */
    isBuiltIn: boolean;

    // UX-14: Block Templates
    /** Whether this block is saved as a reusable template */
    isTemplate: boolean;

    /** Template icon name (for template gallery) */
    templateIcon?: string;

    /** Template color theme (for visual distinction) */
    templateColor?: string;
}

// ============================================================================
// Table Types
// ============================================================================

/**
 * Saved blocks table type
 */
export type SavedBlocksTable = Table<SavedBlockRecord, string>;

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Block template for creating new saved blocks
 */
export interface SavedBlockTemplate {
    name: string;
    description?: string;
    blockType: SavedBlockType;
    blockData: unknown;
    tags?: string[];
    category?: string;
}

/**
 * Saved block with display metadata
 */
export interface SavedBlockWithMeta extends SavedBlockRecord {
    /** Computed: whether this block can be edited */
    isEditable: boolean;
    /** Computed: formatted date string */
    createdDate: string;
    /** Computed: formatted last used date string */
    lastUsedDate?: string;
}
