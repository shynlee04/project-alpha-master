/**
 * @fileoverview Note Markdown Writer
 * @module infrastructure/sync/workspace-services/notes/note-markdown-writer
 *
 * BlockNote to Markdown conversion utilities for notes sync.
 * Handles converting BlockNote blocks into Markdown files.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import type { Block } from '@blocknote/core';
import { extractTextContent } from './note-markdown-parser';

/**
 * Convert note to Markdown format
 *
 * Converts a NoteRecord to complete Markdown with frontmatter.
 * Combines metadata, title, and blocks into standard Markdown.
 *
 * @param note - Note record to convert
 * @returns Complete Markdown document
 */
export function noteToMarkdown(note: NoteRecord): string {
    let markdown = '';

    // Add frontmatter
    markdown += generateFrontmatter(note);

    // Add title as H1
    const title = note.title || 'Untitled';
    markdown += `# ${title}\n\n`;

    // Convert blocks to markdown
    if (note.blocks && Array.isArray(note.blocks)) {
        markdown += blocksToMarkdown(note.blocks as unknown as Block[]);
    }

    return markdown;
}

/**
 * Generate frontmatter from note metadata
 *
 * Creates YAML frontmatter from NoteRecord properties.
 * Includes id, timestamps, favorite status, and emoji.
 *
 * @param note - Note record to extract metadata from
 * @returns YAML frontmatter string
 */
export function generateFrontmatter(note: NoteRecord): string {
    const metadata: Record<string, unknown> = {
        id: note.id,
        created: note.createdAt,
        updated: note.updatedAt,
        favorite: note.isFavorite,
        emoji: note.emoji,
    };

    if (note.parentId) {
        metadata.parentId = note.parentId;
    }

    // Convert to YAML frontmatter
    const yaml = Object.entries(metadata)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
            }
            return `${key}: ${value}`;
        })
        .join('\n');

    return `---\n${yaml}\n---\n\n`;
}

/**
 * Convert BlockNote blocks to Markdown
 *
 * Iterates through blocks and converts to Markdown syntax.
 * Handles all block types including headings, lists, and code.
 *
 * @param blocks - Array of BlockNote blocks
 * @returns Markdown string representation
 */
export function blocksToMarkdown(blocks: Block[]): string {
    return blocks.map(block => {
        switch (block.type) {
            case 'heading':
                const level = (block.props?.level as number) || 1;
                const headingContent = extractTextContent(block);
                return '#'.repeat(level) + ` ${headingContent}\n\n`;
            case 'paragraph':
                const paraContent = extractTextContent(block);
                return `${paraContent}\n\n`;
            case 'bulletListItem':
                const bulletContent = extractTextContent(block);
                return `- ${bulletContent}\n`;
            case 'numberedListItem':
                const numberedContent = extractTextContent(block);
                return `1. ${numberedContent}\n`;
            case 'codeBlock':
                const codeContent = extractTextContent(block);
                return `\`\`\`\n${codeContent}\n\`\`\`\n\n`;
            case 'quote':
                const quoteContent = extractTextContent(block);
                return `> ${quoteContent}\n\n`;
            case 'image':
                return `![Image](${block.props?.url || ''})\n\n`;
            default:
                return '';
        }
    }).join('');
}
