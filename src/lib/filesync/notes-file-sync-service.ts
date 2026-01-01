/**
 * @fileoverview Notes File Sync Service Implementation
 * @module lib/filesync/notes-file-sync-service
 *
 * Full FileSyncService implementation for Notes workspace.
 * Provides bidirectional sync between notes and Markdown files.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncStatus,
    SyncOptions,
    FileSyncConfig
} from './file-sync-service';
import type { LocalFSAdapter } from '../filesystem/local-fs-adapter';
import type { NoteRecord } from '../state/dexie-db';
import type { Block } from '@blocknote/core';

/**
 * Configuration for Notes file sync service
 */
export interface NotesFileSyncConfig extends FileSyncConfig {
    localAdapter: LocalFSAdapter;
    noteStore: {
        notes: Map<string, NoteRecord>;
        notesArray: NoteRecord[];
        updateNote: (params: {
            id: string;
            title?: string;
            blocks?: Block[];
        }) => Promise<void>;
        createNote: (params?: {
            title?: string;
            blocks?: Block[];
        }) => Promise<string>;
        loadNotes?: (projectId: string) => Promise<void>;
    };
    targetDirectory?: string;
    autoSync?: boolean;
    syncInterval?: number;
    enableFileWatching?: boolean;
}

/**
 * File change tracking
 */
interface FileChangeTracker {
    path: string;
    lastModified: number;
    checksum: string;
}

/**
 * Notes File Sync Service
 *
 * Full FileSyncService implementation for Notes workspace.
 * Provides bidirectional sync between notes and Markdown files.
 *
 * Features:
 * - Mount local directory for notes sync
 * - Bidirectional sync (notes ↔ Markdown files)
 * - Auto-sync on note changes
 * - File change watching
 * - Frontmatter support for metadata preservation
 */
export class NotesFileSyncService implements FileSyncService {
    private localAdapter: LocalFSAdapter;
    private noteStore: NotesFileSyncConfig['noteStore'];
    private changeListeners: Set<(event: FileChangeEvent) => void>;
    private disposed: boolean;
    private syncInProgress: boolean;
    private lastSyncTime: number;
    private syncTimer?: ReturnType<typeof setInterval>;
    private targetDirectory: string;
    private fileChangeTrackers: Map<string, FileChangeTracker>;
    private fileWatchTimer?: ReturnType<typeof setInterval>;
    private enableFileWatching: boolean;

    constructor(config: NotesFileSyncConfig) {
        this.localAdapter = config.localAdapter;
        this.noteStore = config.noteStore;
        this.changeListeners = new Set();
        this.disposed = false;
        this.syncInProgress = false;
        this.lastSyncTime = 0;
        this.targetDirectory = config.targetDirectory || '/notes';
        this.fileChangeTrackers = new Map();
        this.enableFileWatching = config.enableFileWatching !== false;

        // Setup auto-sync if enabled
        if (config.autoSync !== false) {
            const interval = config.syncInterval || 5000;
            this.syncTimer = setInterval(() => {
                this.syncNoteChanges().catch(error => {
                    console.error('[NotesFileSyncService] Auto-sync failed:', error);
                });
            }, interval);
        }

        // Setup file watching if enabled
        if (this.enableFileWatching) {
            this.setupFileWatcher();
        }
    }

    async readFile(path: string): Promise<string> {
        this.checkDisposed();
        const result = await this.localAdapter.readFile(path);
        return result.content;
    }

    async writeFile(path: string, content: string): Promise<void> {
        this.checkDisposed();
        await this.localAdapter.writeFile(path, content);
        this.emitChange({ type: 'modified', path, timestamp: Date.now() });
    }

    async deleteFile(path: string): Promise<void> {
        this.checkDisposed();
        await this.localAdapter.deleteFile(path);
        this.emitChange({ type: 'deleted', path, timestamp: Date.now() });
    }

    async listFiles(path: string, recursive = false): Promise<string[]> {
        this.checkDisposed();

        if (!recursive) {
            // Non-recursive: just list immediate directory
            const entries = await this.localAdapter.listDirectory(path);
            return entries.map(e => path ? `${path}/${e.name}` : e.name);
        }

        // Recursive: manually traverse directories
        const results: string[] = [];
        const queue: string[] = [path];

        while (queue.length > 0) {
            const currentPath = queue.shift()!;

            try {
                const entries = await this.localAdapter.listDirectory(currentPath);

                for (const entry of entries) {
                    const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                    results.push(entryPath);

                    if (entry.type === 'directory') {
                        queue.push(entryPath);
                    }
                }
            } catch (error) {
                console.warn(`[NotesFileSyncService] Failed to list ${currentPath}:`, error);
            }
        }

        return results;
    }

    async getFileMetadata(path: string): Promise<FileMetadata> {
        this.checkDisposed();

        // LocalFSAdapter doesn't have getFileStats, so we'll return basic metadata
        // by trying to read the file to check if it exists
        try {
            const result = await this.localAdapter.readFile(path);
            return {
                path,
                size: result.content.length,
                lastModified: Date.now(),
                contentType: 'text/markdown'
            };
        } catch (error) {
            throw new Error(`Failed to get metadata for ${path}: ${error}`);
        }
    }

    async writeBatch(operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();
        const errors: Array<{ path: string; error: string; code?: string }> = [];
        let processed = 0;

        for (const op of operations) {
            try {
                await this.writeFile(op.path, op.content);
                processed++;
            } catch (error) {
                errors.push({
                    path: op.path,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return {
            success: errors.length === 0,
            filesProcessed: processed,
            errors,
            duration: Date.now() - startTime
        };
    }

    async mount(source: FileSystemDirectoryHandle): Promise<void> {
        this.checkDisposed();
        await this.localAdapter.setDirectoryHandle(source);
        console.log('[NotesFileSyncService] Mounted directory for notes sync');
    }

    async sync(_options?: SyncOptions): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();

        try {
            await this.syncNoteChanges();

            return {
                success: true,
                filesProcessed: this.noteStore.notesArray.length,
                errors: [],
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                filesProcessed: 0,
                errors: [{
                    path: 'root',
                    error: error instanceof Error ? error.message : 'Sync failed',
                    code: 'SYNC_ERROR'
                }],
                duration: Date.now() - startTime
            };
        }
    }

    getSyncStatus(): SyncStatus {
        return {
            syncing: this.syncInProgress,
            lastSync: this.lastSyncTime > 0 ? this.lastSyncTime : null,
            filesProcessed: this.noteStore.notesArray.length,
            error: null
        };
    }

    onFileChange(callback: (event: FileChangeEvent) => void): () => void {
        this.checkDisposed();
        this.changeListeners.add(callback);
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    async dispose(): Promise<void> {
        this.disposed = true;
        this.changeListeners.clear();
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        if (this.fileWatchTimer) {
            clearInterval(this.fileWatchTimer);
        }
    }

    /**
     * Setup file watcher for external changes
     */
    private setupFileWatcher(): void {
        const watchInterval = 3000; // Check every 3 seconds

        this.fileWatchTimer = setInterval(() => {
            this.detectFileChanges().catch(error => {
                console.error('[NotesFileSyncService] File change detection failed:', error);
            });
        }, watchInterval);

        console.log('[NotesFileSyncService] File watcher enabled');
    }

    /**
     * Detect external file changes and import as notes
     */
    private async detectFileChanges(): Promise<void> {
        if (this.syncInProgress || this.disposed) {
            return;
        }

        try {
            // List all markdown files in target directory
            const files = await this.listFiles(this.targetDirectory, true);
            const markdownFiles = files.filter(f =>
                f.endsWith('.md') || f.endsWith('.markdown')
            );

            for (const filePath of markdownFiles) {
                const metadata = await this.getFileMetadata(filePath);
                const tracker = this.fileChangeTrackers.get(filePath);

                // Check if file is new or modified
                if (!tracker || tracker.lastModified < metadata.lastModified) {
                    await this.importFileAsNote(filePath);

                    // Update tracker
                    this.fileChangeTrackers.set(filePath, {
                        path: filePath,
                        lastModified: metadata.lastModified,
                        checksum: await this.generateChecksum(filePath)
                    });

                    console.log(`[NotesFileSyncService] Imported file: ${filePath}`);
                }
            }
        } catch (error) {
            console.error('[NotesFileSyncService] Failed to detect file changes:', error);
        }
    }

    /**
     * Import a file as a note
     */
    private async importFileAsNote(filePath: string): Promise<void> {
        try {
            const content = await this.readFile(filePath);
            const { title, blocks, frontmatter } = this.parseMarkdownFile(content);

            // Check if note already exists (from frontmatter ID)
            const noteId = frontmatter.id as string | undefined;
            if (noteId && this.noteStore.notes.has(noteId)) {
                // Update existing note
                await this.noteStore.updateNote({
                    id: noteId,
                    title,
                    blocks
                });
                console.log(`[NotesFileSyncService] Updated existing note: ${noteId}`);
            } else {
                // Create new note
                const newNoteId = await this.noteStore.createNote({
                    title,
                    blocks
                });
                console.log(`[NotesFileSyncService] Created new note: ${newNoteId}`);
            }
        } catch (error) {
            console.error(`[NotesFileSyncService] Failed to import file ${filePath}:`, error);
        }
    }

    /**
     * Parse markdown file into note components
     */
    private parseMarkdownFile(markdown: string): {
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
        const blocks = this.markdownToBlocks(body);

        return { title, blocks, frontmatter };
    }

    /**
     * Convert markdown to BlockNote blocks
     */
    private markdownToBlocks(markdown: string): Block[] {
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
                } as Block);
            } else if (line.startsWith('- ')) {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: 'bulletListItem',
                    props: { textColor: 'default', backgroundColor: 'default' },
                    content: [{ type: 'text', text: line.slice(2), styles: {} }],
                    children: []
                } as Block);
            } else if (line.match(/^\d+\.\s/)) {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: 'numberedListItem',
                    props: { textColor: 'default', backgroundColor: 'default' },
                    content: [{ type: 'text', text: line.replace(/^\d+\.\s/, ''), styles: {} }],
                    children: []
                } as Block);
            } else if (line.startsWith('> ')) {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: 'quote',
                    props: { textColor: 'default', backgroundColor: 'default' },
                    content: [{ type: 'text', text: line.slice(2), styles: {} }],
                    children: []
                } as Block);
            } else if (line.trim() !== '') {
                blocks.push({
                    id: crypto.randomUUID(),
                    type: 'paragraph',
                    props: { textColor: 'default', backgroundColor: 'default' },
                    content: [{ type: 'text', text: line, styles: {} }],
                    children: []
                } as Block);
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
     * Generate checksum for file change detection
     */
    private async generateChecksum(filePath: string): Promise<string> {
        try {
            const content = await this.readFile(filePath);
            // Simple hash function for change detection
            let hash = 0;
            for (let i = 0; i < content.length; i++) {
                const char = content.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString(36);
        } catch (error) {
            return '';
        }
    }

    /**
     * Sync note changes to files
     */
    private async syncNoteChanges(): Promise<void> {
        if (this.syncInProgress) {
            console.log('[NotesFileSyncService] Sync already in progress, skipping');
            return;
        }

        this.syncInProgress = true;

        try {
            // Get all notes
            const notes = this.noteStore.notesArray;

            // Sync each note to file
            for (const note of notes) {
                const filePath = this.noteToFilePath(note);
                const markdown = this.noteToMarkdown(note);
                await this.writeFile(filePath, markdown);
            }

            this.lastSyncTime = Date.now();
            console.log(`[NotesFileSyncService] Synced ${notes.length} notes to files`);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Convert note to Markdown format
     */
    private noteToMarkdown(note: NoteRecord): string {
        let markdown = '';

        // Add frontmatter
        markdown += this.generateFrontmatter(note);

        // Add title as H1
        const title = note.title || 'Untitled';
        markdown += `# ${title}\n\n`;

        // Convert blocks to markdown
        if (note.blocks && Array.isArray(note.blocks)) {
            markdown += this.blocksToMarkdown(note.blocks as Block[]);
        }

        return markdown;
    }

    /**
     * Generate frontmatter from note metadata
     */
    private generateFrontmatter(note: NoteRecord): string {
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
     */
    private blocksToMarkdown(blocks: Block[]): string {
        return blocks.map(block => {
            switch (block.type) {
                case 'heading':
                    const level = (block.props?.level as number) || 1;
                    const headingContent = this.extractTextContent(block);
                    return '#'.repeat(level) + ` ${headingContent}\n\n`;
                case 'paragraph':
                    const paraContent = this.extractTextContent(block);
                    return `${paraContent}\n\n`;
                case 'bulletListItem':
                    const bulletContent = this.extractTextContent(block);
                    return `- ${bulletContent}\n`;
                case 'numberedListItem':
                    const numberedContent = this.extractTextContent(block);
                    return `1. ${numberedContent}\n`;
                case 'codeBlock':
                    const codeContent = this.extractTextContent(block);
                    return `\`\`\`\n${codeContent}\n\`\`\`\n\n`;
                case 'quote':
                    const quoteContent = this.extractTextContent(block);
                    return `> ${quoteContent}\n\n`;
                case 'image':
                    return `![Image](${block.props?.url || ''})\n\n`;
                default:
                    return '';
            }
        }).join('');
    }

    /**
     * Extract text content from a block
     */
    private extractTextContent(block: Block): string {
        if (!block.content) return '';

        const content = block.content as Array<{ type?: string; text?: string }>;
        return content
            .map(item => item.text || '')
            .join('')
            .trim();
    }

    /**
     * Generate file path from note
     */
    private noteToFilePath(note: NoteRecord): string {
        const title = (note.title || 'untitled')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const id = note.id.slice(0, 8);
        return `${this.targetDirectory}/${title}-${id}.md`;
    }

    private emitChange(event: FileChangeEvent): void {
        this.changeListeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('[NotesFileSyncService] Error in change listener:', error);
            }
        });
    }

    private checkDisposed(): void {
        if (this.disposed) {
            throw new Error('NotesFileSyncService has been disposed');
        }
    }
}

/**
 * Factory function to create Notes file sync service
 */
export function createNotesFileSyncService(config: NotesFileSyncConfig): NotesFileSyncService {
    return new NotesFileSyncService(config);
}
