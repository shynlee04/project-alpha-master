/**
 * @fileoverview Markdown Converter
 * @module lib/notes/markdown-converter
 * @governance NR-08: Markdown Import/Export UI
 *
 * Converts between BlockNote blocks and Markdown format.
 * Preserves formatting including headings, lists, code blocks, and quotes.
 */

import type { Block } from '@blocknote/core';
import type { NoteRecord } from '@/lib/state/dexie-db';

// ============================================================================
// Types
// ============================================================================

export interface MarkdownConversionOptions {
    /** Include YAML frontmatter with metadata */
    includeFrontmatter?: boolean;
    /** Frontmatter metadata to include */
    frontmatter?: Record<string, unknown>;
    /** Convert images to markdown syntax */
    convertImages?: boolean;
    /** Convert links to markdown syntax */
    convertLinks?: boolean;
}

export interface MarkdownParseResult {
    /** Parsed markdown content (without frontmatter) */
    content: string;
    /** Extracted title from markdown */
    title: string;
    /** Extracted frontmatter metadata */
    frontmatter: Record<string, unknown>;
    /** Parsed BlockNote blocks */
    blocks: Block[];
}

// ============================================================================
// Block to Markdown Conversion
// ============================================================================

/**
 * Convert a single BlockNote block to markdown
 */
function blockToMarkdown(block: Block): string {
    const content = getBlockTextContent(block);

    switch (block.type) {
        case 'heading':
            const level = (block.props?.level as number) || 1;
            return '#'.repeat(level) + ` ${content}\n\n`;

        case 'paragraph':
            return `${content}\n\n`;

        case 'bulletListItem':
            return `- ${content}\n`;

        case 'numberedListItem':
            // BlockNote doesn't use num prop, just use content
            return `1. ${content}\n`;

        case 'checkListItem':
            const checked = block.props?.checked as boolean;
            const checkbox = checked ? '[x]' : '[ ]';
            return `- ${checkbox} ${content}\n`;

        case 'codeBlock':
            const language = (block.props?.language as string) || '';
            return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;

        case 'quote':
            return `> ${content}\n\n`;

        case 'image':
            const url = content || (block.props?.url as string) || '';
            const caption = (block.props?.caption as string) || '';
            return `![${caption}](${url})\n\n`;

        case 'divider':
            return '---\n\n';

        case 'table':
            return tableToMarkdown(block);

        // Note: tableRow, tableCell, callout are not supported in current BlockNote version
        // These block types are removed from the switch statement

        case 'file':
            const fileUrl = content || (block.props?.url as string) || '';
            const fileName = (block.props?.name as string) || 'file';
            return `[📎 ${fileName}](${fileUrl})\n\n`;

        default:
            return `${content}\n\n`;
    }
}

/**
 * Get text content from a block
 */
function getBlockTextContent(block: Block): string {
    if (!block.content) return '';

    if (Array.isArray(block.content)) {
        return block.content
            .map((item: { text?: string; type?: string }) => {
                // Handle text content with potential styling
                if (item.type === 'text') {
                    return item.text || '';
                }
                return item.text || '';
            })
            .join('');
    }

    return String(block.content || '');
}

/**
 * Convert table block to markdown table
 */
function tableToMarkdown(block: Block): string {
    const rows = block.content as Block[] | undefined;
    if (!rows || rows.length === 0) return '';

    let markdown = '';

    // Extract header row
    const headerRow = rows[0];
    const headerCells = headerRow?.content as Block[] | undefined;
    
    if (headerCells && headerCells.length > 0) {
        const headers = headerCells.map((cell: Block) => getBlockTextContent(cell).padEnd(15));
        markdown += `| ${headers.join(' | ')} |\n`;
        
        // Separator row
        markdown += `|${headers.map(() => '---------------').join('|')}|\n`;
    }

    // Data rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row?.content as Block[] | undefined;
        
        if (cells) {
            const rowContent = cells.map((cell: Block) => {
                const text = getBlockTextContent(cell).padEnd(15);
                return text.substring(0, 15);
            });
            markdown += `| ${rowContent.join(' | ')} |\n`;
        }
    }

    return markdown + '\n';
}

// ============================================================================
// Markdown to Block Conversion
// ============================================================================

/**
 * Parse markdown content into BlockNote blocks
 */
function parseMarkdownToBlocks(markdown: string): Block[] {
    const blocks: Block[] = [];
    const lines = markdown.split('\n');
    
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        
        // Skip empty lines
        if (!line.trim()) {
            i++;
            continue;
        }

        // Check for frontmatter delimiter
        if (line === '---' && i === 0) {
            // Skip frontmatter
            while (i < lines.length && lines[i] !== '---') {
                i++;
            }
            i++; // Skip closing ---
            continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            blocks.push({
                id: generateBlockId(),
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
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            blocks.push({
                id: generateBlockId(),
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
            while (i < lines.length && lines[i].startsWith('>')) {
                quoteLines.push(line.replace(/^>\s*/, ''));
                i++;
            }
            blocks.push({
                id: generateBlockId(),
                type: 'quote',
                props: {},
                content: [{ type: 'text', text: quoteLines.join('\n') }],
                children: [],
            } as unknown as Block);
            continue;
        }

        // Checkbox items
        const checkboxMatch = line.match(/^-\s*\[([ xX])\]\s+(.+)$/);
        if (checkboxMatch) {
            blocks.push({
                id: generateBlockId(),
                type: 'checkListItem',
                props: { checked: checkboxMatch[1].toLowerCase() === 'x' },
                content: [{ type: 'text', text: checkboxMatch[2] }],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Bullet list items
        if (line.match(/^[-*]\s+/)) {
            blocks.push({
                id: generateBlockId(),
                type: 'bulletListItem',
                props: {},
                content: [{ type: 'text', text: line.replace(/^[-*]\s+/, '') }],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Numbered list items
        const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
        if (numberedMatch) {
            blocks.push({
                id: generateBlockId(),
                type: 'numberedListItem',
                props: { num: 1 },
                content: [{ type: 'text', text: numberedMatch[1] }],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Image
        const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
            blocks.push({
                id: generateBlockId(),
                type: 'image',
                props: { caption: imageMatch[1], url: imageMatch[2] },
                content: [{ type: 'text', text: imageMatch[2] }],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Links
        const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
            blocks.push({
                id: generateBlockId(),
                type: 'paragraph',
                props: {},
                content: [{ 
                    type: 'text', 
                    text: linkMatch[1],
                    href: linkMatch[2]
                }],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Horizontal rule
        if (line.match(/^[-*_]{3,}$/)) {
            blocks.push({
                id: generateBlockId(),
                type: 'divider',
                props: {},
                content: [],
                children: [],
            } as unknown as Block);
            i++;
            continue;
        }

        // Regular paragraph
        blocks.push({
            id: generateBlockId(),
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
 * Generate a unique block ID
 */
function generateBlockId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// Main Conversion Functions
// ============================================================================

/**
 * Convert a NoteRecord to Markdown
 */
export function noteToMarkdown(note: NoteRecord, options: MarkdownConversionOptions = {}): string {
    const { includeFrontmatter = true, frontmatter = {} } = options;

    let markdown = '';

    // Add frontmatter if enabled
    if (includeFrontmatter) {
        markdown += generateFrontmatter({
            id: note.id,
            title: note.title,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            favorite: note.isFavorite,
            ...frontmatter,
        });
    }

    // Add title as H1
    markdown += `# ${note.title || 'Untitled'}\n\n`;

    // Convert blocks to markdown
    if (note.blocks && Array.isArray(note.blocks)) {
        markdown += blocksToMarkdown(note.blocks as unknown as Block[]);
    }

    return markdown;
}

/**
 * Convert BlockNote blocks to Markdown
 */
export function blocksToMarkdown(blocks: Block[]): string {
    return blocks.map(block => blockToMarkdown(block)).join('');
}

/**
 * Generate YAML frontmatter
 */
function generateFrontmatter(metadata: Record<string, unknown>): string {
    const entries = Object.entries(metadata)
        .filter(([_, value]) => value !== undefined && value !== null);

    const yaml = entries
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
            }
            if (typeof value === 'object') {
                return `${key}: ${JSON.stringify(value)}`;
            }
            return `${key}: ${value}`;
        })
        .join('\n');

    return `---\n${yaml}\n---\n\n`;
}

/**
 * Parse markdown to blocks and extract metadata
 */
export function markdownToBlocks(markdown: string): MarkdownParseResult {
    let content = markdown;
    const frontmatter: Record<string, unknown> = {};

    // Extract frontmatter
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n\n/);
    if (frontmatterMatch) {
        content = markdown.slice(frontmatterMatch[0].length);
        parseFrontmatter(frontmatterMatch[1], frontmatter);
    }

    // Extract title from first heading
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    // Remove title line from content
    if (titleMatch) {
        content = content.replace(/^# .+\n\n/, '');
    }

    // Parse blocks
    const blocks = parseMarkdownToBlocks(content);

    return {
        content,
        title,
        frontmatter,
        blocks,
    };
}

/**
 * Parse YAML frontmatter
 */
function parseFrontmatter(yaml: string, target: Record<string, unknown>): void {
    yaml.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
            const key = match[1];
            const value = match[2];

            if (value.startsWith('- ')) {
                // Array
                target[key] = value
                    .split('\n')
                    .map(v => v.replace(/^  - /, '').trim())
                    .filter(Boolean);
            } else if (value === 'true') {
                target[key] = true;
            } else if (value === 'false') {
                target[key] = false;
            } else if (/^\d+$/.test(value)) {
                target[key] = parseInt(value, 10);
            } else if (/^\d+\.\d+$/.test(value)) {
                target[key] = parseFloat(value);
            } else if (value.startsWith('{') && value.endsWith('}')) {
                try {
                    target[key] = JSON.parse(value);
                } catch {
                    target[key] = value;
                }
            } else if (value) {
                target[key] = value;
            }
        }
    });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract plain text from blocks (for RAG indexing)
 */
export function blocksToPlainText(blocks: Block[]): string {
    return blocks
        .map(block => {
            const content = getBlockTextContent(block);
            if (block.type === 'bulletListItem') return `• ${content}`;
            if (block.type === 'numberedListItem') return `1. ${content}`;
            if (block.type === 'heading') {
                const level = (block.props?.level as number) || 1;
                return '#'.repeat(level) + ` ${content}`;
            }
            return content;
        })
        .filter(Boolean)
        .join('\n');
}

/**
 * Create a BlockNote block from plain text
 */
export function plainTextToBlock(text: string): Block {
    return {
        id: generateBlockId(),
        type: 'paragraph',
        props: {},
        content: [{ type: 'text', text }],
        children: [],
    } as unknown as Block;
}

/**
 * Validate markdown content
 */
export function isValidMarkdown(content: string): boolean {
    // Check for balanced code blocks
    const codeBlockCount = (content.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
        return false;
    }

    // Check for balanced frontmatter
    const frontmatterCount = (content.match(/---/g) || []).length;
    if (frontmatterCount === 1 || frontmatterCount > 2) {
        return false;
    }

    return true;
}

/**
 * Strip markdown formatting to get plain text
 */
export function stripMarkdown(markdown: string): string {
    return markdown
        // Code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Inline code
        .replace(/`([^`]+)`/g, '$1')
        // Headings
        .replace(/^#{1,6}\s+/gm, '')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        // Italic
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Strikethrough
        .replace(/~~([^~]+)~~/g, '$1')
        // Links
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Images
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // Blockquotes
        .replace(/^>\s+/gm, '')
        // Horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // List markers
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        // Checkboxes
        .replace(/^-\s*\[[ xX]\]\s*/gm, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
