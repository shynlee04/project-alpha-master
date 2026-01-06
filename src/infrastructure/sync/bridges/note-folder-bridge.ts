/**
 * @fileoverview Note Folder Bridge
 * @module infrastructure/sync/bridges/note-folder-bridge
 *
 * Bridges the gap between local filesystem Markdown files and Dexie-stored Notes.
 * Handles parsing, conversion, and synchronization.
 *
 * @epic 27 - State Management Consolidation
 * @story 27-2 - File System Integration
 */

import { getDb } from '@/infrastructure/persistence/dexie-db';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db-knowledge-types';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import { walkDirectory } from '@/lib/filesystem/directory-walker';

export class NoteFolderBridge {
    /**
     * Convert raw Markdown content to BlockNote-compatible blocks
     * This is a simplified parser until Phase 4
     */
    private parseMarkdownToBlocks(content: string): any[] {
        const lines = content.split('\n');
        const blocks: any[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('# ')) {
                blocks.push({
                    type: 'heading',
                    content: [{ type: 'text', text: trimmed.substring(2), styles: {} }],
                    props: { level: 1 }
                });
            } else if (trimmed.startsWith('## ')) {
                blocks.push({
                    type: 'heading',
                    content: [{ type: 'text', text: trimmed.substring(3), styles: {} }],
                    props: { level: 2 }
                });
            } else if (trimmed.startsWith('### ')) {
                blocks.push({
                    type: 'heading',
                    content: [{ type: 'text', text: trimmed.substring(4), styles: {} }],
                    props: { level: 3 }
                });
            } else if (trimmed.startsWith('- ')) {
                blocks.push({
                    type: 'bulletListItem',
                    content: [{ type: 'text', text: trimmed.substring(2), styles: {} }]
                });
            } else {
                // Default to paragraph
                blocks.push({
                    type: 'paragraph',
                    content: [{ type: 'text', text: trimmed, styles: {} }]
                });
            }
        }
        return blocks;
    }

    /**
     * Sync a single markdown file to a Note
     */
    async syncFileToNote(
        projectId: string,
        filePath: string,
        content: string,
        _lastModified: number
    ): Promise<string | null> {
        const db = getDb();
        if (!db) {
            console.error('[NoteFolderBridge] Database not initialized');
            return null;
        }

        // Simple title extraction from filename
        const filename = filePath.split('/').pop() || 'Untitled.md';
        const title = filename.replace(/\.md$/i, '');

        // Try to find existing note by title (Risky but simple start)
        // TODO: Add path metadata to NoteRecord in future
        const existingNote = await db.notes
            .where({ projectId })
            .filter(note => note.title === title)
            .first();

        const blocks = this.parseMarkdownToBlocks(content);
        const now = Date.now();

        if (existingNote) {
            // Update existing
            await db.notes.update(existingNote.id, {
                blocks,
                updatedAt: now,
                // We don't overwrite ID, creation time, or favorites
            });
            return existingNote.id;
        } else {
            // Create new
            const id = crypto.randomUUID();
            const newNote: NoteRecord = {
                id,
                projectId,
                workspaceId: 'notes', // PERSIST-S002: Workspace isolation (notes always go to notes workspace)
                title,
                blocks,
                isFavorite: false,
                order: 0,
                createdAt: now,
                updatedAt: now,
                // parentId undefined for root
            };
            await db.notes.add(newNote);
            return id;
        }
    }

    /**
     * Batch sync multiple files
     */
    async syncFiles(
        projectId: string,
        files: Array<{ path: string; content: string; lastModified: number }>
    ): Promise<string[]> {
        const results: string[] = [];
        for (const file of files) {
            // Only process markdown files
            if (file.path.toLowerCase().endsWith('.md')) {
                const id = await this.syncFileToNote(projectId, file.path, file.content, file.lastModified);
                if (id) results.push(id);
            }
        }
        return results;
    }

    /**
     * Sync from LocalFSAdapter
     */
    async syncFromAdapter(projectId: string, adapter: LocalFSAdapter): Promise<void> {
        console.log('[NoteFolderBridge] Syncing from adapter for project:', projectId);
        for await (const entry of walkDirectory(adapter, '', { recursive: true })) {
            if (entry.type === 'file' && entry.name.toLowerCase().endsWith('.md')) {
                try {
                    const result = await adapter.readFile(entry.path);
                    // Use Date.now() as fallback for modification time since adapter might not expose it easily yet
                    await this.syncFileToNote(projectId, entry.path, result.content, Date.now());
                } catch (err) {
                    console.warn('[NoteFolderBridge] Failed to sync file:', entry.path, err);
                }
            }
        }
    }
}

export const noteFolderBridge = new NoteFolderBridge();
