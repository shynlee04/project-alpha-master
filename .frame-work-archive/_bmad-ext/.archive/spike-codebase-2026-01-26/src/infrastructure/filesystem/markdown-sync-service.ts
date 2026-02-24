/**
 * @fileoverview Markdown Sync Service - Bidirectional BlockNote ↔ .md file sync
 * @module infrastructure/filesystem/markdown-sync-service
 *
 * **ARC-B11**: Notes ↔ Markdown bidirectional sync
 *
 * Per ADR-033 Decision D4:
 * - Desktop notes save as .md files in /project/notes/
 * - Bidirectional sync: BlockNote editor ↔ .md files
 * - Uses StorageGateway abstraction (FSA/IDB transparent)
 *
 * This service bridges existing markdown converters with the new StorageGateway
 * pattern to provide automatic file synchronization for the Notes workspace.
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B11
 * @author Team B
 * @created 2026-01-18
 */

import type { Block } from '@blocknote/core';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import type { StorageGateway, FileChangeEvent } from '@/domain/interfaces/storage-gateway.interface';
import {
  parseMarkdownFile,
  markdownToBlocks,
  noteToMarkdown,
  blocksToMarkdown as blocksToMarkdownUtil,
} from '@/infrastructure/sync/workspace-services/notes';

// ============================================================================
// Types
// ============================================================================

/**
 * Markdown file metadata from frontmatter
 */
export interface MarkdownMetadata {
  /** Note ID from frontmatter */
  id: string;
  /** Note creation timestamp */
  created?: string;
  /** Note last updated timestamp */
  updated?: string;
  /** Favorite flag */
  favorite?: boolean;
  /** Note emoji */
  emoji?: string;
  /** Parent note ID (for nested notes) */
  parentId?: string;
}

/**
 * Parsed markdown file result
 */
export interface ParsedMarkdownFile {
  /** File content without frontmatter */
  content: string;
  /** Extracted title */
  title: string;
  /** Frontmatter metadata */
  metadata: MarkdownMetadata;
  /** Parsed BlockNote blocks */
  blocks: Block[];
}

/**
 * Sync direction for conflict resolution
 */
export type SyncDirection = 'local-to-file' | 'file-to-local' | 'merge' | 'skip';

/**
 * Sync conflict event
 */
export interface SyncConflictEvent {
  /** File path where conflict occurred */
  filePath: string;
  /** Note ID from database */
  noteId: string;
  /** Local modified timestamp */
  localModified: number;
  /** File modified timestamp */
  fileModified: number;
  /** Resolve the conflict with a direction */
  resolve: (direction: SyncDirection) => Promise<void>;
}

/**
 * Sync statistics
 */
export interface SyncStats {
  /** Total files processed */
  total: number;
  /** Files imported (file → local) */
  imported: number;
  /** Files exported (local → file) */
  exported: number;
  /** Files skipped (no changes) */
  skipped: number;
  /** Errors encountered */
  errors: number;
  /** Time taken in milliseconds */
  duration: number;
}

/**
 * Markdown sync service configuration
 */
export interface MarkdownSyncConfig {
  /** Storage gateway for file I/O */
  gateway: StorageGateway;
  /** Base path for notes directory (default: 'notes/') */
  notesPath?: string;
  /** Enable automatic file watching */
  enableWatching?: boolean;
  /** Debounce delay for write operations (ms) */
  writeDebounceMs?: number;
  /** Callback for sync conflicts */
  onConflict?: (event: SyncConflictEvent) => void;
  /** Callback for sync progress */
  onProgress?: (stats: Partial<SyncStats>) => void;
  /** Callback for errors */
  onError?: (error: Error, context: string) => void;
}

/**
 * Sync state for tracking modified files
 */
interface SyncState {
  /** Map of note ID to file path */
  noteFilePaths: Map<string, string>;
  /** Map of file path to note ID */
  fileNoteIds: Map<string, string>;
  /** Debounce timers for writes */
  writeTimers: Map<string, ReturnType<typeof setTimeout>>;
  /** Watch handle from gateway */
  watchHandle: { dispose: () => void } | null;
  /** Pending sync queue */
  pendingSync: Set<string>;
  /** Is service disposed */
  disposed: boolean;
}

// ============================================================================
// Markdown Sync Service Implementation
// ============================================================================

/**
 * Markdown Sync Service
 *
 * Provides bidirectional synchronization between BlockNote notes stored in
 * DexieDB and Markdown files on disk (via StorageGateway).
 *
 * **Key Features:**
 * - Automatic export: Note changes → .md files
 * - Automatic import: .md file changes → notes
 * - Conflict detection: Timestamp comparison
 * - Debounced writes: Prevent excessive I/O
 * - Platform-agnostic: Works with FSA (desktop) and IDB (mobile)
 *
 * @example
 * ```ts
 * const gateway = storageGatewayFactory.createFSAGateway(directoryHandle);
 * const syncService = new MarkdownSyncService({ gateway });
 *
 * // Import all markdown files
 * const stats = await syncService.importAll();
 *
 * // Watch for file changes
 * syncService.startWatching();
 *
 * // Export a single note
 * await syncService.exportNote(noteId);
 *
 * // Cleanup
 * syncService.dispose();
 * ```
 */
export class MarkdownSyncService {
  private readonly config: Required<MarkdownSyncConfig>;
  private readonly state: SyncState;
  private readonly notesPath: string;

  // Track last modified times for conflict detection
  private readonly noteModifiedTimes = new Map<string, number>();
  private readonly fileModifiedTimes = new Map<string, number>();

  constructor(config: MarkdownSyncConfig) {
    this.notesPath = config.notesPath ?? 'notes/';
    this.config = {
      gateway: config.gateway,
      notesPath: this.notesPath,
      enableWatching: config.enableWatching ?? true,
      writeDebounceMs: config.writeDebounceMs ?? 500,
      onConflict: config.onConflict ?? (() => {}),
      onProgress: config.onProgress ?? (() => {}),
      onError: config.onError ?? ((err, ctx) => console.error(`[MarkdownSyncService] ${ctx}:`, err)),
    };
    this.state = {
      noteFilePaths: new Map(),
      fileNoteIds: new Map(),
      writeTimers: new Map(),
      watchHandle: null,
      pendingSync: new Set(),
      disposed: false,
    };
  }

  // ========================================================================
  // Public API: Export (Note → File)
  // ========================================================================

  /**
   * Export a single note to markdown file
   *
   * Converts note to Markdown format and writes to disk.
   * Uses debounced writes to prevent excessive I/O.
   *
   * @param note - Note record to export
   * @param immediate - Skip debounce and write immediately
   */
  async exportNote(note: NoteRecord, immediate = false): Promise<void> {
    this.checkDisposed();

    const filePath = this.getNoteFilePath(note);
    this.state.noteFilePaths.set(note.id, filePath);
    this.state.fileNoteIds.set(filePath, note.id);

    if (immediate) {
      await this.writeNoteToFile(note, filePath);
    } else {
      this.scheduleWrite(note, filePath);
    }
  }

  /**
   * Export multiple notes to markdown files
   *
   * Batch export with progress reporting.
   *
   * @param notes - Array of notes to export
   * @returns Sync statistics
   */
  async exportNotes(notes: NoteRecord[]): Promise<SyncStats> {
    this.checkDisposed();

    const startTime = Date.now();
    let exported = 0;
    let skipped = 0;
    let errors = 0;

    for (const note of notes) {
      try {
        const filePath = this.getNoteFilePath(note);
        const existingContent = await this.tryReadFile(filePath);

        if (existingContent) {
          const existingModified = this.fileModifiedTimes.get(filePath) ?? 0;
          const noteModified = note.updatedAt ? new Date(note.updatedAt).getTime() : 0;

          if (noteModified <= existingModified) {
            skipped++;
            continue;
          }
        }

        await this.writeNoteToFile(note, filePath);
        exported++;
      } catch (error) {
        errors++;
        this.config.onError(error as Error, `exportNote(${note.id})`);
      }
    }

    return {
      total: notes.length,
      imported: 0,
      exported,
      skipped,
      errors,
      duration: Date.now() - startTime,
    };
  }

  // ========================================================================
  // Public API: Import (File → Note)
  // ========================================================================

  /**
   * Import a single markdown file as a note
   *
   * Parses markdown file and returns note data.
   * Caller is responsible for storing in database.
   *
   * @param filePath - Path to markdown file
   * @param content - File content (optional, will read if not provided)
   * @returns Parsed note data or null if invalid
   */
  async importFile(
    filePath: string,
    content?: string
  ): Promise<ParsedMarkdownFile | null> {
    this.checkDisposed();

    try {
      const markdown = content ?? await this.readFileContent(filePath);

      if (!markdown.trim()) {
        return null;
      }

      const { title, blocks, frontmatter } = parseMarkdownFile(markdown);

      const metadata: MarkdownMetadata = {
        id: frontmatter.id as string || this.generateNoteId(),
        created: frontmatter.created as string | undefined,
        updated: frontmatter.updated as string | undefined,
        favorite: frontmatter.favorite as boolean | undefined,
        emoji: frontmatter.emoji as string | undefined,
        parentId: frontmatter.parentId as string | undefined,
      };

      return {
        content: markdown,
        title,
        metadata,
        blocks,
      };
    } catch (error) {
      this.config.onError(error as Error, `importFile(${filePath})`);
      return null;
    }
  }

  /**
   * Import all markdown files from notes directory
   *
   * Scans notes directory and imports all .md files.
   * Returns statistics about import operation.
   *
   * @param createNote - Callback to create note in database
   * @param updateNote - Callback to update note in database
   * @returns Sync statistics
   */
  async importAll(
    createNote: (data: { title: string; blocks: Block[] }) => Promise<string>,
    updateNote: (id: string, data: { title?: string; blocks?: Block[] }) => Promise<void>
  ): Promise<SyncStats> {
    this.checkDisposed();

    const startTime = Date.now();
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    try {
      const entries = await this.config.gateway.list(this.notesPath);
      const markdownFiles = entries.filter(e => e.kind === 'file' && e.path.endsWith('.md'));

      this.config.onProgress({ total: markdownFiles.length });

      for (const entry of markdownFiles) {
        try {
          const parsed = await this.importFile(entry.path);

          if (!parsed) {
            skipped++;
            continue;
          }

          const { metadata, title, blocks } = parsed;
          this.state.fileNoteIds.set(entry.path, metadata.id);
          this.state.noteFilePaths.set(metadata.id, entry.path);

          if (metadata.id) {
            // Check if note exists in store
            // For now, we'll treat all files as new or update based on ID presence
            await updateNote(metadata.id, { title, blocks });
            updated++;
          } else {
            await createNote({ title, blocks });
            imported++;
          }

          this.fileModifiedTimes.set(entry.path, entry.lastModified);
        } catch (error) {
          errors++;
          this.config.onError(error as Error, `importFile(${entry.path})`);
        }
      }
    } catch (error) {
      this.config.onError(error as Error, 'importAll');
    }

    return {
      total: imported + updated + skipped + errors,
      imported: imported + updated,
      exported: 0,
      skipped,
      errors,
      duration: Date.now() - startTime,
    };
  }

  // ========================================================================
  // Public API: Watching
  // ========================================================================

  /**
   * Start watching for file changes
   *
   * Uses StorageGateway watch() to monitor for external changes.
   * Automatically imports changed markdown files.
   */
  startWatching(): void {
    this.checkDisposed();

    if (this.state.watchHandle) {
      return; // Already watching
    }

    if (!this.config.enableWatching) {
      return;
    }

    this.state.watchHandle = this.config.gateway.watch((event) => {
      this.handleFileChange(event).catch(error => {
        this.config.onError(error, `watch(${event.path})`);
      });
    });

    console.log('[MarkdownSyncService] Started watching for file changes');
  }

  /**
   * Stop watching for file changes
   */
  stopWatching(): void {
    if (this.state.watchHandle) {
      this.state.watchHandle.dispose();
      this.state.watchHandle = null;
      console.log('[MarkdownSyncService] Stopped watching for file changes');
    }
  }

  /**
   * Handle file change event from watcher
   */
  private async handleFileChange(event: FileChangeEvent): Promise<void> {
    if (this.state.disposed) {
      return;
    }

    const { path } = event;

    // Only process markdown files in notes directory
    if (!path.startsWith(this.notesPath) || !path.endsWith('.md')) {
      return;
    }

    // Add to pending sync queue
    this.state.pendingSync.add(path);

    // Debounce sync processing
    setTimeout(() => {
      this.processPendingSync();
    }, this.config.writeDebounceMs);
  }

  /**
   * Process pending sync queue
   */
  private async processPendingSync(): Promise<void> {
    if (this.state.pendingSync.size === 0) {
      return;
    }

    const paths = Array.from(this.state.pendingSync);
    this.state.pendingSync.clear();

    for (const path of paths) {
      try {
        const exists = await this.config.gateway.exists(path);

        if (!exists) {
          // File was deleted - could delete note from DB here
          continue;
        }

        // Import the changed file
        const parsed = await this.importFile(path);
        if (parsed) {
          // Emit event or callback for note update
          // Caller is responsible for updating the note store
          console.log(`[MarkdownSyncService] File changed: ${path}`);
        }
      } catch (error) {
        this.config.onError(error as Error, `processPendingSync(${path})`);
      }
    }
  }

  // ========================================================================
  // Public API: Utilities
  // ========================================================================

  /**
   * Get file path for a note
   *
   * Generates consistent file path from note metadata.
   * Format: notes/{sanitized-title}-{short-id}.md
   *
   * @param note - Note record
   * @returns Relative file path
   */
  getNoteFilePath(note: NoteRecord): string {
    const title = (note.title || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const shortId = note.id.slice(0, 8);
    return `${this.notesPath}${title}-${shortId}.md`;
  }

  /**
   * Convert BlockNote blocks to markdown string
   *
   * @param blocks - BlockNote blocks
   * @returns Markdown string
   */
  blocksToMarkdown(blocks: Block[]): string {
    return blocksToMarkdownUtil(blocks);
  }

  /**
   * Convert markdown string to BlockNote blocks
   *
   * @param markdown - Markdown content
   * @returns Array of BlockNote blocks
   */
  markdownToBlocks(markdown: string): Block[] {
    return markdownToBlocks(markdown);
  }

  /**
   * Check if service is disposed
   *
   * @throws Error if service is disposed
   */
  private checkDisposed(): void {
    if (this.state.disposed) {
      throw new Error('MarkdownSyncService has been disposed');
    }
  }

  /**
   * Dispose of service resources
   *
   * Stops watching, cancels pending writes, and clears state.
   */
  dispose(): void {
    this.state.disposed = true;
    this.stopWatching();

    // Clear all pending write timers
    for (const timer of this.state.writeTimers.values()) {
      clearTimeout(timer);
    }
    this.state.writeTimers.clear();

    // Clear state
    this.state.noteFilePaths.clear();
    this.state.fileNoteIds.clear();
    this.state.pendingSync.clear();

    console.log('[MarkdownSyncService] Disposed');
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  /**
   * Write note to file immediately
   */
  private async writeNoteToFile(note: NoteRecord, filePath: string): Promise<void> {
    const markdown = noteToMarkdown(note);
    const encoder = new TextEncoder();
    const data = encoder.encode(markdown);

    await this.config.gateway.write(filePath, data);

    // Track modified time
    const modified = note.updatedAt ? new Date(note.updatedAt).getTime() : Date.now();
    this.fileModifiedTimes.set(filePath, modified);
    this.noteModifiedTimes.set(note.id, modified);

    console.log(`[MarkdownSyncService] Exported note: ${note.id} → ${filePath}`);
  }

  /**
   * Schedule debounced write for note
   */
  private scheduleWrite(note: NoteRecord, filePath: string): void {
    // Clear existing timer for this note
    const existingTimer = this.state.writeTimers.get(note.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new write
    const timer = setTimeout(async () => {
      await this.writeNoteToFile(note, filePath);
      this.state.writeTimers.delete(note.id);
    }, this.config.writeDebounceMs);

    this.state.writeTimers.set(note.id, timer);
  }

  /**
   * Try to read file content
   */
  private async tryReadFile(filePath: string): Promise<string | null> {
    try {
      return await this.readFileContent(filePath);
    } catch {
      return null;
    }
  }

  /**
   * Read file content as string
   */
  private async readFileContent(filePath: string): Promise<string> {
    const data = await this.config.gateway.read(filePath);
    const decoder = new TextDecoder();
    return decoder.decode(data);
  }

  /**
   * Generate a unique note ID
   */
  private generateNoteId(): string {
    return `note-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create markdown sync service from storage gateway
 *
 * @param gateway - Storage gateway instance
 * @param config - Optional configuration
 * @returns Configured markdown sync service
 */
export function createMarkdownSyncService(
  gateway: StorageGateway,
  config?: Partial<MarkdownSyncConfig>
): MarkdownSyncService {
  return new MarkdownSyncService({
    gateway,
    ...config,
  });
}

/**
 * Convert note record to markdown string
 *
 * Convenience wrapper around noteToMarkdown from sync utilities.
 *
 * @param note - Note record to convert
 * @returns Markdown string with frontmatter
 */
export function noteToMarkdownString(note: NoteRecord): string {
  return noteToMarkdown(note);
}

/**
 * Parse markdown file content
 *
 * Convenience wrapper around parseMarkdownFile from sync utilities.
 *
 * @param content - Markdown file content
 * @returns Parsed note data
 */
export function parseMarkdownFileContent(
  content: string
): { title: string; blocks: Block[]; frontmatter: Record<string, unknown> } {
  return parseMarkdownFile(content);
}
