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
 */
function detectProvider(url: string): EmbedProvider {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
    if (lowerUrl.includes('vimeo.com')) return 'vimeo';
    if (lowerUrl.includes('twitter.com')) return 'twitter';
    if (lowerUrl.includes('x.com')) return 'x';
    if (lowerUrl.includes('gist.github.com')) return 'github';
    if (lowerUrl.includes('github.com')) return 'github';
    if (lowerUrl.includes('spotify.com')) return 'spotify';
    if (lowerUrl.includes('codepen.io')) return 'codepen';
    if (lowerUrl.includes('codesandbox.io')) return 'codesandbox';
    if (lowerUrl.includes('instagram.com/p/')) return 'instagram';
    if (lowerUrl.includes('reddit.com/r/')) return 'reddit';
    return 'generic';
}

/**
 * Get embed URL for provider
 */
function getEmbedUrl(url: string, provider: EmbedProvider): string {
    // Extract video/entity ID based on provider
    const extractId = (regex: RegExp): string | null => {
        const match = url.match(regex);
        return match?.[1] || null;
    };

    switch (provider) {
        case 'youtube': {
            const id = extractId(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
                extractId(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            return id ? `https://www.youtube.com/embed/${id}` : url;
        }
        case 'vimeo': {
            const id = extractId(/vimeo\.com\/(\d+)/);
            return id ? `https://player.vimeo.com/video/${id}` : url;
        }
        case 'twitter':
        case 'x': {
            const id = extractId(/twitter\.com\/[a-zA-Z0-9_]+\/status\/(\d+)/) ||
                extractId(/x\.com\/[a-zA-Z0-9_]+\/status\/(\d+)/);
            return id ? `https://platform.twitter.com/embed/index.html?conversation_id=${id}` : url;
        }
        case 'github':
            if (url.includes('gist.github.com')) {
                const id = extractId(/gist\.github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9]+)/);
                return id ? `https://gist.github.com/${id}.js` : url;
            }
            return url;
        case 'spotify': {
            const id = extractId(/spotify\.com\/(?:track|album|playlist)\/([a-zA-Z0-9]+)/);
            const type = url.includes('/track/') ? 'track' : url.includes('/album/') ? 'album' : 'playlist';
            return id ? `https://open.spotify.com/embed/${type}/${id}` : url;
        }
        case 'codepen': {
            const match = url.match(/codepen\.io\/([a-zA-Z0-9_-]+)\/pen\/([a-zA-Z0-9_-]+)/);
            return match ? `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result&theme-id=dark` : url;
        }
        case 'codesandbox': {
            const id = extractId(/codesandbox\.io\/s\/([a-zA-Z0-9_-]+)/) ||
                extractId(/codesandbox\.io\/embed\/([a-zA-Z0-9_-]+)/);
            return id ? `https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark` : url;
        }
        case 'instagram': {
            const id = extractId(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
            return id ? `https://www.instagram.com/p/${id}/embed` : url;
        }
        case 'reddit': {
            const subreddit = extractId(/reddit\.com\/r\/([^\/]+)/);
            const postId = extractId(/comments\/([a-zA-Z0-9]+)/);
            return (subreddit && postId) ?
                `https://www.reddit.com/r/${subreddit}/comments/${postId}/embed` : url;
        }
        default:
            return url;
    }
}

/**
 * Check if a line contains an embeddable URL
 */
function isEmbedUrl(line: string): boolean {
    return EMBED_URL_REGEX.test(line);
}

/**
 * Extract URL from line (handles multiple URLs)
 */
function extractEmbedUrls(line: string): string[] {
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
