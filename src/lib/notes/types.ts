/**
 * @fileoverview Note System Types
 * @module lib/notes/types
 * @governance EPIC-26-1
 *
 * Type definitions for the note-taking system with BlockNote integration.
 * Follows patterns from Epic 6 (SourceRecord) and Epic 9 (Flashcard types).
 */

import type { Block } from '@blocknote/core';

// ============================================================================
// Note Record Types
// ============================================================================

/**
 * Note record for Dexie persistence
 * Stores BlockNote JSON blocks with hierarchical organization.
 *
 * @epic Epic 26 - Intelligent Knowledge Base
 * @story 26-1 - Integrated BlockNote Editor
 */
export interface NoteRecord {
    /** Primary key (UUID) */
    id: string;

    /** Foreign key to project */
    projectId: string;

    /** Note title (extracted from first heading or user-defined) */
    title: string;

    /** Optional emoji icon for the note */
    emoji?: string;

    /** BlockNote JSON block structure */
    blocks: Block[];

    /** Parent note ID for nesting (null = root level) */
    parentId?: string;

    /** Whether note is starred/favorited */
    isFavorite: boolean;

    /** Sort order within parent (for drag-and-drop) */
    order: number;

    /** Whether note is indexed for RAG (Story 26.2) */
    isIndexed?: boolean;

    /** Last indexed timestamp (Story 26.2) */
    indexedAt?: number;

    /** Creation timestamp */
    createdAt: number;

    /** Last update timestamp */
    updatedAt: number;
}

// ============================================================================
// Note State Types
// ============================================================================

/**
 * Save status for auto-save indicator
 */
export type NoteSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Note tree node for hierarchical display
 */
export interface NoteTreeNode {
    /** Note record */
    note: NoteRecord;

    /** Child nodes */
    children: NoteTreeNode[];

    /** Whether node is expanded in tree */
    isExpanded: boolean;
}

/**
 * Note editor state
 */
export interface NoteEditorState {
    /** Currently active note ID */
    activeNoteId: string | null;

    /** Save status for active note */
    saveStatus: NoteSaveStatus;

    /** Last save error message */
    saveError?: string;
}

// ============================================================================
// Note Store Actions
// ============================================================================

/**
 * Parameters for creating a new note
 */
export interface CreateNoteParams {
    /** Optional parent note ID for nesting */
    parentId?: string;

    /** Optional initial title */
    title?: string;

    /** Optional initial blocks */
    blocks?: Block[];

    /** Optional emoji icon */
    emoji?: string;
}

/**
 * Parameters for updating a note
 */
export interface UpdateNoteParams {
    /** Note ID to update */
    id: string;

    /** Updated title */
    title?: string;

    /** Updated blocks */
    blocks?: Block[];

    /** Updated emoji */
    emoji?: string;

    /** Updated parent ID (for moving) */
    parentId?: string;

    /** Updated favorite status */
    isFavorite?: boolean;

    /** Updated sort order */
    order?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Default empty blocks for new notes
 */
export const DEFAULT_NOTE_BLOCKS: Block[] = [
    {
        id: 'default-paragraph',
        type: 'paragraph',
        props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
        },
        content: [],
        children: [],
    } as unknown as Block,
];

/**
 * Generate a unique note ID
 */
export function generateNoteId(): string {
    return crypto.randomUUID();
}

/**
 * Extract title from BlockNote blocks
 * Uses first heading or first paragraph text
 */
export function extractTitleFromBlocks(blocks: Block[]): string {
    if (!blocks || blocks.length === 0) {
        return 'Untitled';
    }

    // Look for first heading
    const headingBlock = blocks.find(
        (block) => block.type === 'heading'
    );

    if (headingBlock && headingBlock.content) {
        const content = headingBlock.content as Array<{ text?: string }>;
        const text = content
            .map((item) => item.text || '')
            .join('')
            .trim();
        if (text) return text;
    }

    // Fallback to first paragraph with content
    const paragraphBlock = blocks.find(
        (block) => block.type === 'paragraph' && block.content
    );

    if (paragraphBlock && paragraphBlock.content) {
        const content = paragraphBlock.content as Array<{ text?: string }>;
        const text = content
            .map((item) => item.text || '')
            .join('')
            .trim();
        if (text) return text.substring(0, 50) + (text.length > 50 ? '...' : '');
    }

    return 'Untitled';
}
