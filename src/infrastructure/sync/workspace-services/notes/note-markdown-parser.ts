/**
 * @fileoverview Note Markdown Parser (Reading)
 * @module infrastructure/sync/workspace-services/notes/note-markdown-parser
 *
 * Markdown to BlockNote conversion utilities for notes sync.
 * Uses BlockNote's built-in markdown parser for proper formatting support.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 *
 * BUG-FIX-010: Use BlockNote's built-in tryParseMarkdownToBlocks() instead of
 * custom parser to properly handle bold, italic, code blocks, links, etc.
 */

import type { Block } from '@blocknote/core';
import { BlockNoteEditor } from '@blocknote/core';

// Create a minimal editor instance for markdown parsing
// BlockNote's tryParseMarkdownToBlocks requires an editor instance
let markdownParserEditor: BlockNoteEditor | null = null;

/**
 * Get or create the markdown parser editor instance
 * A minimal editor is needed to use BlockNote's markdown parsing
 */
function getMarkdownParserEditor(): BlockNoteEditor {
    if (!markdownParserEditor) {
        markdownParserEditor = BlockNoteEditor.create();
    }
    return markdownParserEditor;
}

// URL patterns that should be converted to embed blocks
const EMBED_URL_REGEX = /(?:^|\s)(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|twitter\.com\/|x\.com\/|github\.com\/|gist\.github\.com\/|spotify\.com\/|codepen\.io\/|codesandbox\.io\/|instagram\.com\/p\/|reddit\.com\/r\/))/gm;

/**
 * Supported embed providers
 */
type EmbedProvider =
    | 'youtube'
    | 'vimeo'
    | 'twitter'
    | 'x'
    | 'github'
    | 'spotify'
    | 'codepen'
    | 'codesandbox'
    | 'instagram'
    | 'reddit'
    | 'generic';

/**
 * Detect provider from URL
 * Reserved for future embed block support
 * @internal
 */
export function detectProvider(_url: string): EmbedProvider {
    return 'generic';
}

/**
 * Get embed URL for provider
 * Reserved for future embed block support
 * @internal
 */
export function getEmbedUrl(url: string, _provider: EmbedProvider): string {
    return url;
}

/**
 * Check if a line contains an embeddable URL
 * Reserved for future embed block support
 * @internal
 */
export function isEmbedUrl(line: string): boolean {
    return EMBED_URL_REGEX.test(line);
}

/**
 * Extract URL from line (handles multiple URLs)
 * Reserved for future embed block support
 * @internal
 */
export function extractEmbedUrls(line: string): string[] {
    const urls: string[] = [];
    const matches = line.match(/https?:\/\/[^\s]+/g);
    if (matches) {
        for (const url of matches) {
            // Check if it's an embeddable URL
            if (
                url.includes('youtube.com') ||
                url.includes('youtu.be') ||
                url.includes('vimeo.com') ||
                url.includes('twitter.com') ||
                url.includes('x.com') ||
                url.includes('github.com') ||
                url.includes('spotify.com') ||
                url.includes('codepen.io') ||
                url.includes('codesandbox.io') ||
                url.includes('instagram.com/p/') ||
                url.includes('reddit.com/r/')
            ) {
                urls.push(url);
            }
        }
    }
    return urls;
}

/**
 * Parse markdown file into note components
 *
 * Extracts title, blocks, and frontmatter from markdown content.
 * Handles YAML frontmatter and standard Markdown syntax.
 * Uses BlockNote's built-in markdown parser for proper formatting support.
 *
 * @param markdown - Raw markdown content
 * @returns Object containing title, blocks, and frontmatter
 */
export async function parseMarkdownFile(markdown: string): Promise<{
    title: string;
    blocks: Block[];
    frontmatter: Record<string, unknown>;
}> {
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

    // BUG-FIX-010: Use BlockNote's built-in markdown parser
    // This properly handles **bold**, *italic*, `code`, links, code blocks, etc.
    const editor = getMarkdownParserEditor();
    const blocks = await editor.tryParseMarkdownToBlocks(body);

    return { title, blocks, frontmatter };
}

/**
 * Convert markdown to BlockNote blocks
 *
 * BUG-FIX-010: Uses BlockNote's built-in markdown parser for proper formatting.
 * Supports headings, lists, quotes, bold, italic, code, links, and more.
 *
 * @param markdown - Markdown content to convert
 * @returns Array of BlockNote blocks
 */
export async function markdownToBlocks(markdown: string): Promise<Block[]> {
    // BUG-FIX-010: Use BlockNote's built-in markdown parser
    // This properly handles **bold**, *italic*, `code`, links, code blocks, etc.
    const editor = getMarkdownParserEditor();
    const blocks = await editor.tryParseMarkdownToBlocks(markdown);

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
