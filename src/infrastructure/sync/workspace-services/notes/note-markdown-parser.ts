/**
 * @fileoverview Note Markdown Parser (Reading)
 * @module infrastructure/sync/workspace-services/notes/note-markdown-parser
 *
 * Markdown to BlockNote conversion utilities for notes sync.
 * Handles parsing Markdown files into BlockNote blocks.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type { Block } from '@blocknote/core';

/**
 * Parse markdown file into note components
 *
 * Extracts title, blocks, and frontmatter from markdown content.
 * Handles YAML frontmatter and standard Markdown syntax.
 *
 * @param markdown - Raw markdown content
 * @returns Object containing title, blocks, and frontmatter
 */
export function parseMarkdownFile(markdown: string): {
    title: string;
    blocks: Block[];
    frontmatter: Record<string, unknown>;
} {
    let title = 'Untitled';
    let body = markdown;
    const frontmatter: Record<string, unknown> = {};

    // Check for frontmatter
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n\n/);
    if (frontmatterMatch) {
        const frontmatterContent = frontmatterMatch[1];
        frontmatterContent.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
                const key = match[1];
                const value = match[2];
                if (value === 'true') frontmatter[key] = true;
                else if (value === 'false') frontmatter[key] = false;
                else if (/^\d+$/.test(value)) frontmatter[key] = parseInt(value);
                else frontmatter[key] = value;
            }
        });
        body = markdown.slice(frontmatterMatch[0].length);
    }

    // Extract title from first H1
    const titleMatch = body.match(/^# (.+)$/m);
    if (titleMatch) {
        title = titleMatch[1].trim();
        body = body.replace(/^# .+\n\n/, '');
    }

    // Convert markdown to BlockNote blocks
    const blocks = markdownToBlocks(body);

    return { title, blocks, frontmatter };
}

/**
 * Convert markdown to BlockNote blocks
 *
 * Parses markdown syntax and converts to BlockNote block structure.
 * Supports headings, lists, quotes, and paragraphs.
 *
 * @param markdown - Markdown content to convert
 * @returns Array of BlockNote blocks
 */
export function markdownToBlocks(markdown: string): Block[] {
    const blocks: Block[] = [];
    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('# ')) {
            blocks.push({
                id: crypto.randomUUID(),
                type: 'heading',
                props: { level: 1, textColor: 'default', backgroundColor: 'default' },
                content: [{ type: 'text', text: line.slice(2), styles: {} }],
                children: []
            } as unknown as Block);
        } else if (line.startsWith('## ')) {
            blocks.push({
                id: crypto.randomUUID(),
                type: 'heading',
                props: { level: 2, textColor: 'default', backgroundColor: 'default' },
                content: [{ type: 'text', text: line.slice(3), styles: {} }],
                children: []
            } as unknown as Block);
        } else if (line.startsWith('### ')) {
            blocks.push({
                id: crypto.randomUUID(),
                type: 'heading',
                props: { level: 3, textColor: 'default', backgroundColor: 'default' },
                content: [{ type: 'text', text: line.slice(4), styles: {} }],
                children: []
            } as unknown as Block);
        } else if (line.startsWith('- ')) {
            blocks.push({
                id: crypto.randomUUID(),
                type: 'bulletListItem',
                props: { textColor: 'default', backgroundColor: 'default' },
                content: [{ type: 'text', text: line.slice(2), styles: {} }],
                children: []
            } as unknown as Block);
        } else if (line.match(/^\d+\.\s/)) {
            blocks.push({
                id: crypto.randomUUID(),
                type: 'numberedListItem',
                props: { textColor: 'default', backgroundColor: 'default' },
                content: [{ type: 'text', text: line.replace(/^\d+\.\s/, ''), styles: {} }],
                children: []
            } as unknown as Block);
        } else if (line.startsWith('> ')) {
            blocks.push({
                id: crypto.randomUUID(),
                type: 'quote',
                props: { textColor: 'default', backgroundColor: 'default' },
                content: [{ type: 'text', text: line.slice(2), styles: {} }],
                children: []
            } as unknown as Block);
        } else if (line.trim() !== '') {
            blocks.push({
                id: crypto.randomUUID(),
                type: 'paragraph',
                props: { textColor: 'default', backgroundColor: 'default' },
                content: [{ type: 'text', text: line, styles: {} }],
                children: []
            } as unknown as Block);
        }

        i++;
    }

    return blocks.length > 0 ? blocks : [{
        id: crypto.randomUUID(),
        type: 'paragraph',
        props: { textColor: 'default', backgroundColor: 'default' },
        content: [],
        children: []
    } as unknown as Block];
}

/**
 * Extract text content from a block
 *
 * Recursively extracts all text from block content array.
 * Handles nested content structures.
 *
 * @param block - BlockNote block to extract from
 * @returns Concatenated text content
 */
export function extractTextContent(block: Block): string {
    if (!block.content) return '';

    const content = block.content as Array<{ type?: string; text?: string }>;
    return content
        .map(item => item.text || '')
        .join('')
        .trim();
}
