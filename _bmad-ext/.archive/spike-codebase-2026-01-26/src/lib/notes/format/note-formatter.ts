/**
 * @fileoverview Note File Format Formatter
 * @module lib/notes/format/note-formatter
 * @governance CC-DF-01 - Note File Format Migration
 *
 * Converts between Dexie NoteRecord and FSA markdown file format.
 * Handles YAML frontmatter with proper ISO 8601 timestamps.
 */

import grayMatter from 'gray-matter';
import type { NoteRecord } from '@/lib/notes/types';
import type { Block } from '@blocknote/core';

// ============================================================================
// Types
// ============================================================================

/**
 * Frontmatter metadata structure for note files
 */
export interface NoteFrontmatter {
    /** Note title */
    title: string;

    /** Optional emoji icon */
    emoji?: string;

    /** Creation timestamp (ISO 8601) */
    created: string;

    /** Last modified timestamp (ISO 8601) */
    modified: string;

    /** Optional tags for categorization */
    tags?: string[];

    /** Project ID for multi-project support */
    projectId?: string;

    /** Workspace ID (ide, knowledge, study, notes) */
    workspaceId?: string;

    /** Parent note ID for hierarchical notes */
    parentId?: string;

    /** Whether note is favorited */
    favorite?: boolean;

    /** Sort order */
    order?: number;

    /** Whether note is indexed for RAG */
    indexed?: boolean;

    /** Last indexed timestamp */
    indexedAt?: string;
}

/**
 * Parsed note from markdown file
 */
export interface ParsedNote {
    /** Note content (blocks) */
    blocks: Block[];

    /** Frontmatter metadata */
    frontmatter: NoteFrontmatter;

    /** Raw markdown content */
    markdown: string;
}

// ============================================================================
// File Naming
// ============================================================================

/**
 * Generate filename for a note
 * Format: {note-id}.md
 *
 * @param noteId - Note UUID or slug
 * @returns Filename with .md extension
 */
export function getNoteFilename(noteId: string): string {
    // Sanitize note ID for filename
    const sanitized = noteId.replace(/[^a-zA-Z0-9-_]/g, '-');
    return `${sanitized}.md`;
}

/**
 * Extract note ID from filename
 * Format: {note-id}.md -> note-id
 *
 * @param filename - Markdown filename
 * @returns Note ID without extension
 */
export function extractNoteId(filename: string): string {
    return filename.replace(/\.md$/, '');
}

// ============================================================================
// Formatting (NoteRecord -> Markdown)
// ============================================================================

/**
 * Format a NoteRecord for storage as markdown file
 *
 * Converts Dexie NoteRecord to FSA markdown format with YAML frontmatter.
 * Uses ISO 8601 timestamps and proper type handling.
 *
 * @param note - Note record from Dexie
 * @returns Markdown string with frontmatter
 *
 * @example
 * ```typescript
 * const markdown = formatNoteForStorage(noteRecord);
 * // Output:
 * // ---
 * // title: "My Note"
 * // created: 2026-01-18T10:00:00.000Z
 * // modified: 2026-01-18T11:30:00.000Z
 * // tags: ["important", "work"]
 * // ---
 * //
 * // # My Note
 * // Content...
 * // ```
 */
export function formatNoteForStorage(note: NoteRecord): string {
    const frontmatter: NoteFrontmatter = {
        title: note.title,
        created: numberToISOString(note.createdAt),
        modified: numberToISOString(note.updatedAt),
    };

    // Optional fields
    if (note.emoji) {
        frontmatter.emoji = note.emoji;
    }

    if (note.parentId) {
        frontmatter.parentId = note.parentId;
    }

    if (note.projectId) {
        frontmatter.projectId = note.projectId;
    }

    frontmatter.workspaceId = note.workspaceId;

    if (note.isFavorite) {
        frontmatter.favorite = true;
    }

    if (typeof note.order === 'number') {
        frontmatter.order = note.order;
    }

    if (note.isIndexed !== undefined) {
        frontmatter.indexed = note.isIndexed;
    }

    if (note.indexedAt) {
        frontmatter.indexedAt = numberToISOString(note.indexedAt);
    }

    // Convert to markdown using gray-matter
    const matterObject = grayMatter.stringify('', frontmatter);
    const frontmatterStr = matterObject;

    // Convert blocks to markdown
    const blocksMarkdown = blocksToMarkdown(note.blocks);

    return `${frontmatterStr}\n${blocksMarkdown}`;
}

/**
 * Convert timestamp number to ISO 8601 string
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns ISO 8601 formatted string (e.g., "2026-01-18T10:30:00.000Z")
 */
function numberToISOString(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toISOString();
}

/**
 * Convert BlockNote blocks to markdown
 *
 * Simplified markdown conversion for note content.
 * For full conversion, use @/lib/notes/markdown-converter
 *
 * @param blocks - BlockNote blocks
 * @returns Markdown string
 */
function blocksToMarkdown(blocks: Block[]): string {
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
        return '';
    }

    return blocks
        .map((block) => blockToMarkdown(block))
        .join('\n\n');
}

/**
 * Convert a single BlockNote block to markdown
 *
 * @param block - BlockNote block
 * @returns Markdown string
 */
function blockToMarkdown(block: Block): string {
    const content = getBlockTextContent(block);

    switch (block.type) {
        case 'heading':
            const level = (block.props?.level as number) || 1;
            return '#'.repeat(level) + ` ${content}`;

        case 'paragraph':
            return content;

        case 'bulletListItem':
            return `- ${content}`;

        case 'numberedListItem':
            return `1. ${content}`;

        case 'checkListItem':
            const checked = block.props?.checked as boolean;
            const checkbox = checked ? '[x]' : '[ ]';
            return `- ${checkbox} ${content}`;

        case 'codeBlock':
            const language = (block.props?.language as string) || '';
            return `\`\`\`${language}\n${content}\n\`\`\``;

        case 'quote':
            return `> ${content}`;

        case 'divider':
            return '---';

        case 'image':
            const url = content || (block.props?.url as string) || '';
            const caption = (block.props?.caption as string) || '';
            return `![${caption}](${url})`;

        default:
            return content;
    }
}

/**
 * Get text content from a block
 *
 * @param block - BlockNote block
 * @returns Plain text content
 */
function getBlockTextContent(block: Block): string {
    if (!block.content) return '';

    if (Array.isArray(block.content)) {
        return block.content
            .map((item: { text?: string; type?: string }) => {
                if (item.type === 'text') {
                    return item.text || '';
                }
                return item.text || '';
            })
            .join('');
    }

    return String(block.content || '');
}

// ============================================================================
// Parsing (Markdown -> NoteRecord)
// ============================================================================

/**
 * Parse a markdown file into NoteRecord format
 *
 * Extracts YAML frontmatter and converts markdown content to blocks.
 * Handles ISO 8601 timestamps properly.
 *
 * @param markdown - Markdown file content with frontmatter
 * @param noteId - Note ID for the record
 * @returns Parsed note with frontmatter and blocks
 *
 * @example
 * ```typescript
 * const parsed = parseNoteFromStorage(markdownContent, 'note-123');
 * // Returns: { frontmatter: {...}, blocks: [...], markdown: '...' }
 * ```
 */
export function parseNoteFromStorage(
    markdown: string,
    noteId: string,
): ParsedNote {
    // Parse with gray-matter
    const { data: frontmatter, content: markdownContent } =
        grayMatter(markdown);

    // Convert frontmatter to NoteFrontmatter
    const typedFrontmatter: NoteFrontmatter = {
        title: frontmatter.title as string || 'Untitled',
        created: ensureIsoString(frontmatter.created),
        modified: ensureIsoString(frontmatter.modified),
    };

    // Optional fields
    if (frontmatter.emoji) {
        typedFrontmatter.emoji = frontmatter.emoji as string;
    }

    if (frontmatter.parentId) {
        typedFrontmatter.parentId = frontmatter.parentId as string;
    }

    if (frontmatter.projectId) {
        typedFrontmatter.projectId = frontmatter.projectId as string;
    }

    if (frontmatter.workspaceId) {
        typedFrontmatter.workspaceId =
            frontmatter.workspaceId as 'ide' | 'knowledge' | 'study' | 'notes';
    }

    if (frontmatter.favorite) {
        typedFrontmatter.favorite = frontmatter.favorite as boolean;
    }

    if (typeof frontmatter.order === 'number') {
        typedFrontmatter.order = frontmatter.order as number;
    }

    if (typeof frontmatter.indexed === 'boolean') {
        typedFrontmatter.indexed = frontmatter.indexed as boolean;
    }

    if (frontmatter.indexedAt) {
        typedFrontmatter.indexedAt = ensureIsoString(frontmatter.indexedAt);
    }

    if (Array.isArray(frontmatter.tags)) {
        typedFrontmatter.tags = frontmatter.tags as string[];
    }

    // Parse markdown to blocks (simplified)
    const blocks = parseMarkdownToBlocks(markdownContent);

    return {
        blocks,
        frontmatter: typedFrontmatter,
        markdown,
    };
}

/**
 * Ensure value is ISO 8601 string
 *
 * @param value - Unknown value (string, number, Date, or undefined)
 * @returns ISO 8601 string
 */
function ensureIsoString(value: unknown): string {
    if (typeof value === 'string') {
        // Validate ISO format
        if (isValidIsoDate(value as string)) {
            return value as string;
        }
        // Fallback to current time if invalid
        return new Date().toISOString();
    }

    if (typeof value === 'number') {
        return numberToISOString(value);
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    // Fallback to current time
    return new Date().toISOString();
}

/**
 * Validate ISO 8601 date string
 *
 * @param dateString - Date string to validate
 * @returns true if valid ISO 8601 format
 */
function isValidIsoDate(dateString: string): boolean {
    try {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
}

/**
 * Parse markdown to BlockNote blocks (simplified)
 *
 * Note: This is a simplified parser. For full conversion,
 * use @/lib/notes/markdown-converter.markdownToBlocks()
 *
 * @param markdown - Markdown content (without frontmatter)
 * @returns Array of BlockNote blocks
 */
function parseMarkdownToBlocks(markdown: string): Block[] {
    const blocks: Block[] = [];
    const lines = markdown.split('\n');

    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            i++;
            continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            blocks.push({
                id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: 'heading',
                props: { level: headingMatch[1].length },
                content: [{ type: 'text', text: headingMatch[2] }],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Code blocks
        const codeMatch = line.match(/^```(\w*)$/);
        if (codeMatch) {
            const language = codeMatch[1];
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            blocks.push({
                id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: 'codeBlock',
                props: { language },
                content: [{ type: 'text', text: codeLines.join('\n') }],
                children: [],
            } as unknown as Block);
            i++; // Skip closing ```
            continue;
        }

        // Blockquotes
        if (line.startsWith('>')) {
            const quoteLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
                i++;
            }
            blocks.push({
                id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: 'quote',
                props: {},
                content: [
                    { type: 'text', text: quoteLines.join('\n') },
                ],
                children: [],
            } as unknown as Block);
            continue;
        }

        // Bullet list items
        if (line.match(/^-\s+/)) {
            blocks.push({
                id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: 'bulletListItem',
                props: {},
                content: [
                    { type: 'text', text: line.replace(/^-\s+/, '') },
                ],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Checkbox items
        const checkboxMatch = line.match(/^-\s*\[([ xX])\]\s+(.+)$/);
        if (checkboxMatch) {
            blocks.push({
                id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: 'checkListItem',
                props: {
                    checked: checkboxMatch[1].toLowerCase() === 'x',
                },
                content: [{ type: 'text', text: checkboxMatch[2] }],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Default to paragraph
        blocks.push({
            id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            type: 'paragraph',
            props: {},
            content: [{ type: 'text', text: line }],
            children: [],
        } as unknown as Block);
        i++;
    }

    return blocks;
}

/**
 * Convert ParsedNote to NoteRecord
 *
 * @param parsed - Parsed note with frontmatter and blocks
 * @returns NoteRecord compatible with Dexie
 */
export function parsedToNoteRecord(
    parsed: ParsedNote,
): NoteRecord {
    // Generate a unique note ID
    const noteId = crypto.randomUUID();
    return {
        id: noteId,
        projectId: parsed.frontmatter.projectId || '',
        workspaceId:
            parsed.frontmatter.workspaceId === 'ide' ||
            parsed.frontmatter.workspaceId === 'knowledge' ||
            parsed.frontmatter.workspaceId === 'study' ||
            parsed.frontmatter.workspaceId === 'notes'
                ? parsed.frontmatter.workspaceId
                : 'notes',
        title: parsed.frontmatter.title,
        emoji: parsed.frontmatter.emoji,
        blocks: parsed.blocks,
        parentId: parsed.frontmatter.parentId,
        isFavorite: parsed.frontmatter.favorite || false,
        order: parsed.frontmatter.order || 0,
        isIndexed: parsed.frontmatter.indexed,
        indexedAt: parsed.frontmatter.indexedAt
            ? new Date(parsed.frontmatter.indexedAt).getTime()
            : undefined,
        createdAt: new Date(parsed.frontmatter.created).getTime(),
        updatedAt: new Date(parsed.frontmatter.modified).getTime(),
    };
}
