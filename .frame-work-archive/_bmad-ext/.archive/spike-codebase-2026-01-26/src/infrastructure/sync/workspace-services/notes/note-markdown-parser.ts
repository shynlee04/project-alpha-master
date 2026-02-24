/**
 * @fileoverview Note Markdown Parser (Reading)
 * @module infrastructure/sync/workspace-services/notes/note-markdown-parser
 *
 * Markdown to BlockNote conversion utilities for notes sync.
 * Handles parsing Markdown files into BlockNote blocks.
 * Supports embed blocks for common services (YouTube, Twitter, etc.)
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type { Block } from '@blocknote/core';

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
        } else if (isEmbedUrl(line)) {
            // Line contains embeddable URL - create embed block
            const urls = extractEmbedUrls(line);
            for (const url of urls) {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: 'embed',
                    props: {
                        url: url,
                        provider: detectProvider(url),
                        embedUrl: getEmbedUrl(url, detectProvider(url)),
                        title: url,
                        textAlignment: 'left',
                    },
                    content: [],
                    children: []
                } as unknown as Block);
            }
            // Also add any remaining text as paragraph
            let remainingText = line;
            for (const url of urls) {
                remainingText = remainingText.replace(url, '').trim();
            }
            if (remainingText) {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: 'paragraph',
                    props: { textColor: 'default', backgroundColor: 'default' },
                    content: [{ type: 'text', text: remainingText, styles: {} }],
                    children: []
                } as unknown as Block);
            }
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
