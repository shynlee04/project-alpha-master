/**
 * @fileoverview Note File Sync Service
 * @module lib/notes/note-file-sync
 * @governance NR-06: Notes → FileSync Binding
 *
 * Provides FileSync integration for notes:
 * - Export notes to Markdown files
 * - Import Markdown files as notes
 * - Batch sync notes to directory
 * - Integration with FileSyncService from ARC module
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import type { FileSyncService, SyncResult } from '@/lib/filesync/file-sync-service';
import { SyncError } from '@/infrastructure/sync/types';
import { emitStoreEvent, STORE_EVENTS } from '@/infrastructure/events/event-bus';
import type { FileSavedPayload } from '@/infrastructure/events/event-bus';

/**
 * Note file sync options
 */
export interface NoteFileSyncOptions {
    /** Target directory path for sync operations */
    targetDirectory?: string;
    /** File extension for exported notes */
    fileExtension?: '.md' | '.markdown';
    /** Include note metadata in frontmatter */
    includeFrontmatter?: boolean;
    /** Overwrite existing files */
    overwrite?: boolean;
}

/**
 * Note file sync result
 */
export interface NoteSyncResult {
    /** Total notes processed */
    totalNotes: number;
    /** Successfully synced notes */
    successCount: number;
    /** Failed notes */
    failureCount: number;
    /** Details of each operation */
    operations: Array<{
        noteId: string;
        noteTitle: string;
        filePath: string;
        success: boolean;
        error?: string;
    }>;
}

/**
 * Import result for markdown files
 */
export interface NoteImportResult {
    /** Number of files imported */
    importedCount: number;
    /** Number of files skipped */
    skippedCount: number;
    /** Errors encountered */
    errors: Array<{
        filePath: string;
        error: string;
    }>;
    /** Created note IDs */
    createdNoteIds: string[];
}

/**
 * Default sync options
 */
const DEFAULT_OPTIONS: NoteFileSyncOptions = {
    targetDirectory: '/notes',
    fileExtension: '.md',
    includeFrontmatter: true,
    overwrite: false,
};

/**
 * NoteFileSyncService - Handles FileSync operations for notes
 *
 * Features:
 * - Export single/multiple notes to Markdown files
 * - Import Markdown files as notes
 * - Batch sync notes to target directory
 * - Frontmatter support for metadata preservation
 * - File naming based on note titles
 */
export class NoteFileSyncService {
    private fileSyncService: FileSyncService;
    private options: NoteFileSyncOptions;
    private projectId: string;

    constructor(fileSyncService: FileSyncService, options?: NoteFileSyncOptions, projectId?: string) {
        this.fileSyncService = fileSyncService;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.projectId = projectId || 'default';
    }

    /**
     * Update project ID for event emission
     */
    setProjectId(projectId: string): void {
        this.projectId = projectId;
    }

    /**
     * Update sync options
     */
    setOptions(options: Partial<NoteFileSyncOptions>): void {
        this.options = { ...this.options, ...options };
    }

    /**
     * Export a single note to Markdown file
     *
     * @param note - The note to export
     * @param customPath - Optional custom file path
     * @returns Promise resolving to the file path
     */
    async exportNote(note: NoteRecord, customPath?: string): Promise<string> {
        const markdown = this.noteToMarkdown(note);
        const filePath = customPath || this.generateFilePath(note);

        await this.fileSyncService.writeFile(filePath, markdown);

        // Emit FILE_SAVED event for cross-workspace reactivity (UJ-004)
        const payload: FileSavedPayload = {
            filePath,
            workspaceType: 'notes',
            projectId: this.projectId,
            timestamp: Date.now(),
        };
        emitStoreEvent<FileSavedPayload>(STORE_EVENTS.FILE_SAVED, payload);

        return filePath;
    }

    /**
     * Export multiple notes to files
     *
     * @param notes - Notes to export
     * @returns Promise resolving to sync result
     */
    async exportNotes(notes: NoteRecord[]): Promise<NoteSyncResult> {
        const result: NoteSyncResult = {
            totalNotes: notes.length,
            successCount: 0,
            failureCount: 0,
            operations: [],
        };

        for (const note of notes) {
            try {
                const filePath = await this.exportNote(note);
                result.successCount++;
                result.operations.push({
                    noteId: note.id,
                    noteTitle: note.title || 'Untitled',
                    filePath,
                    success: true,
                });
            } catch (error) {
                result.failureCount++;
                result.operations.push({
                    noteId: note.id,
                    noteTitle: note.title || 'Untitled',
                    filePath: '',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return result;
    }

    /**
     * Export all notes to the target directory
     *
     * @param notes - All notes to export
     * @returns Promise resolving to sync result
     */
    async exportAllNotes(notes: NoteRecord[]): Promise<NoteSyncResult> {
        // Ensure target directory exists
        await this.ensureDirectory(this.options.targetDirectory!);
        return this.exportNotes(notes);
    }

    /**
     * Import a single Markdown file as a note
     *
     * @param filePath - Path to the Markdown file
     * @param noteCreator - Function to create a new note
     * @returns Promise resolving to created note ID
     */
    async importNote(
        filePath: string,
        noteCreator: (content: string, title: string, metadata?: Record<string, unknown>) => Promise<NoteRecord>
    ): Promise<string> {
        const content = await this.fileSyncService.readFile(filePath);
        const { title, body, frontmatter } = this.parseMarkdown(content);

        const note = await noteCreator(body, title, frontmatter);
        return note.id;
    }

    /**
     * Import multiple Markdown files as notes
     *
     * @param filePaths - Paths to Markdown files
     * @param noteCreator - Function to create a new note
     * @returns Promise resolving to import result
     */
    async importNotes(
        filePaths: string[],
        noteCreator: (content: string, title: string, metadata?: Record<string, unknown>) => Promise<NoteRecord>
    ): Promise<NoteImportResult> {
        const result: NoteImportResult = {
            importedCount: 0,
            skippedCount: 0,
            errors: [],
            createdNoteIds: [],
        };

        for (const filePath of filePaths) {
            try {
                const noteId = await this.importNote(filePath, noteCreator);
                result.importedCount++;
                result.createdNoteIds.push(noteId);
            } catch (error) {
                result.errors.push({
                    filePath,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return result;
    }

    /**
     * Import all Markdown files from target directory
     *
     * @param noteCreator - Function to create a new note
     * @returns Promise resolving to import result
     */
    async importAllNotes(
        noteCreator: (content: string, title: string, metadata?: Record<string, unknown>) => Promise<NoteRecord>
    ): Promise<NoteImportResult> {
        const files = await this.fileSyncService.listFiles(this.options.targetDirectory!, true);
        const markdownFiles = files.filter(f =>
            f.endsWith('.md') || f.endsWith('.markdown')
        );

        return this.importNotes(markdownFiles, noteCreator);
    }

    /**
     * Sync notes to target directory (export + import bidirectional)
     * Currently only supports export direction
     *
     * @param notes - Notes to sync
     * @returns Promise resolving to sync result
     */
    async syncNotes(notes: NoteRecord[]): Promise<SyncResult> {
        await this.ensureDirectory(this.options.targetDirectory!);
        const result = await this.exportNotes(notes);

        return {
            success: result.failureCount === 0,
            filesProcessed: result.operations.length,
            errors: result.operations
                .filter(op => !op.success)
                .map(op => new SyncError(
                    op.error || 'Unknown error',
                    'UNKNOWN',
                    op.filePath || ''
                )),
            duration: 0,
        };
    }

    /**
     * Convert note to Markdown format
     *
     * @param note - The note to convert
     * @returns Markdown string
     */
    private noteToMarkdown(note: NoteRecord): string {
        let markdown = '';

        // Add frontmatter if enabled
        if (this.options.includeFrontmatter) {
            markdown += this.generateFrontmatter(note);
        }

        // Add title as H1
        const title = note.title || 'Untitled';
        markdown += `# ${title}\n\n`;

        // Convert blocks to markdown
        if (note.blocks && Array.isArray(note.blocks)) {
            markdown += this.blocksToMarkdown(note.blocks as Array<{ type: string; content?: string; props?: Record<string, unknown> }>);
        }
        // NoteRecord uses blocks, not content property

        return markdown;
    }

    /**
     * Generate frontmatter from note metadata
     *
     * @param note - The note
     * @returns Frontmatter string
     */
    private generateFrontmatter(note: NoteRecord): string {
        const metadata: Record<string, unknown> = {
            id: note.id,
            created: note.createdAt,
            updated: note.updatedAt,
            favorite: note.isFavorite || false,
            tags: [], // NoteRecord doesn't have tags property
        };

        if (note.parentId) {
            metadata.parentId = note.parentId;
        }

        // Convert to YAML frontmatter
        const yaml = Object.entries(metadata)
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
     * @param blocks - BlockNote blocks
     * @returns Markdown string
     */
    private blocksToMarkdown(blocks: Array<{ type: string; content?: string; props?: Record<string, unknown> }>): string {
        return blocks.map(block => {
            switch (block.type) {
                case 'heading':
                    const level = (block.props?.level as number) || 1;
                    return '#'.repeat(level) + ` ${block.content || ''}\n\n`;
                case 'paragraph':
                    return `${block.content || ''}\n\n`;
                case 'bulletListItem':
                    return `- ${block.content || ''}\n`;
                case 'numberedListItem':
                    return `1. ${block.content || ''}\n`;
                case 'codeBlock':
                    return `\`\`\`\n${block.content || ''}\n\`\`\`\n\n`;
                case 'quote':
                    return `> ${block.content || ''}\n\n`;
                case 'image':
                    return `![${block.props?.caption || ''}](${block.content || ''})\n\n`;
                default:
                    return `${block.content || ''}\n\n`;
            }
        }).join('');
    }

    /**
     * Parse Markdown content into note parts
     *
     * @param markdown - Markdown string
     * @returns Parsed components
     */
    private parseMarkdown(markdown: string): {
        title: string;
        body: string;
        frontmatter: Record<string, unknown>;
    } {
        let title = 'Untitled';
        let body = markdown;
        const frontmatter: Record<string, unknown> = {};

        // Check for frontmatter
        const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n\n/);
        if (frontmatterMatch) {
            // Parse frontmatter
            const frontmatterContent = frontmatterMatch[1];
            frontmatterContent.split('\n').forEach(line => {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const key = match[1];
                    const value = match[2];
                    // Simple type parsing
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

        return { title, body, frontmatter };
    }

    /**
     * Generate file path from note
     *
     * @param note - The note
     * @returns File path
     */
    private generateFilePath(note: NoteRecord): string {
        const title = (note.title || 'untitled')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const id = note.id.slice(0, 8);
        return `${this.options.targetDirectory}/${title}-${id}${this.options.fileExtension}`;
    }

    /**
     * Ensure directory exists
     *
     * @param path - Directory path
     */
    private async ensureDirectory(_path: string): Promise<void> {
        // Note: FileSyncService doesn't have mkdir, we rely on writeFile creating directories
        // This is a placeholder for any pre-sync directory setup
    }
}

/**
 * Create a NoteFileSyncService instance
 *
 * @param fileSyncService - The FileSyncService from ARC module
 * @param options - Optional sync options
 * @returns NoteFileSyncService instance
 */
export function createNoteFileSyncService(
    fileSyncService: FileSyncService,
    options?: NoteFileSyncOptions
): NoteFileSyncService {
    return new NoteFileSyncService(fileSyncService, options);
}
