/**
 * @fileoverview Note Types and Utilities
 * @module lib/notes/types
 * @governance EPIC-26-1
 *
 * Core types and utilities for note CRUD operations.
 */

import type { NoteRecord as DexieNoteRecord } from '@/infrastructure/persistence/dexie-db-knowledge-types';

/**
 * Note record for BlockNote editor persistence
 * Re-export from Dexie types for barrel exports
 */
export type { DexieNoteRecord as NoteRecord };

/**
 * Save status for notes
 */
export type NoteSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Tree node for note hierarchy rendering
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
 * Editor state for active note
 */
export interface NoteEditorState {
    activeNoteId: string | null;
    isDirty: boolean;
    lastSavedAt: number | null;
    isFullWidth: boolean;
}

/**
 * Parameters for creating a new note
 */
export interface CreateNoteParams {
    /** Note title (optional, defaults to 'Untitled') */
    title?: string;

    /** Optional emoji icon */
    emoji?: string;

    /** Custom block content (optional, defaults to DEFAULT_NOTE_BLOCKS) */
    blocks?: unknown[];

    /** Parent note ID for nested notes (optional) */
    parentId?: string;
}

/**
 * Parameters for updating an existing note
 */
export interface UpdateNoteParams {
    /** Note ID to update */
    id: string;

    /** New title (optional) */
    title?: string;

    /** New blocks content (optional) */
    blocks?: unknown[];

    /** New parent ID (optional) */
    parentId?: string;

    /** New order (optional) */
    order?: number;

    /** Toggle favorite status (optional) */
    isFavorite?: boolean;
}

/**
 * Default block structure for a new empty note
 */
export const DEFAULT_NOTE_BLOCKS = [
    {
        id: 'root',
        type: 'heading',
        props: { level: 1 },
        content: [{ type: 'text', text: 'Untitled', styles: [] }],
        children: [],
    },
    {
        id: 'content',
        type: 'paragraph',
        props: {},
        content: [],
        children: [],
    },
];

/**
 * Generate a UUID for a new note
 * @returns UUID v4 string
 */
export function generateNoteId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Extract title from BlockNote blocks
 * Looks for the first heading block or falls back to first text content
 * @param blocks - BlockNote block structure
 * @returns Extracted title string
 */
export function extractTitleFromBlocks(blocks: unknown[]): string {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return 'Untitled';
    }

    // Find heading block
    for (const block of blocks) {
        const b = block as { type?: string; content?: unknown[] };
        if (b.type === 'heading' && Array.isArray(b.content)) {
            const headingContent = b.content[0];
            if (headingContent && typeof headingContent === 'object' && 'text' in headingContent) {
                const text = (headingContent as { text?: string }).text;
                if (text) return text;
            }
        }
    }

    // Fall back to first block's text content
    const firstBlock = blocks[0] as { content?: unknown[] };
    if (Array.isArray(firstBlock.content) && firstBlock.content.length > 0) {
        const firstContent = firstBlock.content[0];
        if (firstContent && typeof firstContent === 'object' && 'text' in firstContent) {
            const text = (firstContent as { text?: string }).text;
            if (text) return text;
        }
    }

    return 'Untitled';
}
