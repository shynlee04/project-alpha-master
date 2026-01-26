/**
 * @fileoverview Note Gateway - StorageGateway Facade for Note Operations
 * @module domain/services/note-gateway
 *
 * **CC-SG-01**: Gateway Abstraction
 *
 * Wraps StorageGateway for note-specific operations:
 * - Handles NoteRecord ↔ Markdown serialization
 * - Provides high-level note CRUD operations
 * - Uses platform-aware gateway from factory
 *
 * Per ADR-033 Decision D2:
 * - Desktop with FSA → /notes/{id}.md (file system)
 * - Mobile/Tablet → IDB keys (IndexedDB)
 *
 * @epic EPIC-CC-ARC
 * @story CC-SG-01
 * @author Team B
 * @created 2026-01-18
 */

import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';

// ============================================================================
// Types
// ============================================================================

/**
 * Metadata header for note files (frontmatter format)
 */
interface NoteMetadata {
  id: string;
  projectId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  title: string;
  emoji?: string | undefined;
  parentId?: string | undefined;
  isFavorite: boolean;
  order: number;
  isIndexed?: boolean | undefined;
  indexedAt?: number | undefined;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Note Gateway Class
// ============================================================================

/**
 * Note Gateway - StorageGateway Facade for Note Operations
 *
 * @remarks
 * Wraps StorageGateway to provide note-specific CRUD operations.
 * Handles serialization between NoteRecord objects and markdown files.
 *
 * Per ADR-033:
 * - Notes stored as /notes/{id}.md (FSA projects)
 * - Notes stored with IDB key path (IndexedDB projects)
 * - Content is BlockNote JSON with metadata frontmatter
 *
 * @example
 * ```ts
 * const gateway = createStorageGateway(platform, { projectId, directoryHandle });
 * const noteGateway = new NoteGateway(gateway, projectId);
 *
 * // Create note
 * await noteGateway.createNote(noteRecord);
 *
 * // Update note
 * await noteGateway.updateNote(noteId, { title: 'New Title' });
 *
 * // Delete note
 * await noteGateway.deleteNote(noteId);
 *
 * // Read note
 * const note = await noteGateway.readNote(noteId);
 * ```
 */
export class NoteGateway {
  constructor(
    private gateway: StorageGateway
  ) {}

  /**
   * Get note file path for a note ID
   * Format: /notes/{noteId}.md
   */
  private getNotePath(noteId: string): string {
    return `/notes/${noteId}.md`;
  }

  /**
   * Serialize NoteRecord to Markdown with frontmatter
   */
  private serializeNote(note: NoteRecord): string {
    const metadata: NoteMetadata = {
      id: note.id,
      projectId: note.projectId,
      workspaceId: note.workspaceId,
      title: note.title,
      emoji: note.emoji,
      parentId: note.parentId,
      isFavorite: note.isFavorite,
      order: note.order,
      isIndexed: note.isIndexed,
      indexedAt: note.indexedAt,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    // Convert to YAML frontmatter
    const frontmatter = this.metadataToYaml(metadata);

    // Convert blocks to JSON string
    const blocksJson = JSON.stringify(note.blocks, null, 2);

    // Combine frontmatter + content
    return `---\n${frontmatter}\n---\n\n${blocksJson}`;
  }

  /**
   * Convert metadata object to YAML string
   */
  private metadataToYaml(metadata: NoteMetadata): string {
    const lines: string[] = [];

    // Helper to add field if value exists
    const addField = (key: string, value: any) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          lines.push(`${key}: "${value}"`);
        } else if (typeof value === 'number') {
          lines.push(`${key}: ${value}`);
        } else if (typeof value === 'boolean') {
          lines.push(`${key}: ${value ? 'true' : 'false'}`);
        }
      }
    };

    addField('id', metadata.id);
    addField('projectId', metadata.projectId);
    addField('workspaceId', metadata.workspaceId);
    addField('title', metadata.title);
    addField('emoji', metadata.emoji);
    addField('parentId', metadata.parentId);
    addField('isFavorite', metadata.isFavorite);
    addField('order', metadata.order);
    addField('isIndexed', metadata.isIndexed);
    addField('indexedAt', metadata.indexedAt);
    addField('createdAt', metadata.createdAt);
    addField('updatedAt', metadata.updatedAt);

    return lines.join('\n');
  }

  /**
   * Parse Markdown with frontmatter to NoteRecord
   */
  private parseMarkdown(markdown: string): NoteRecord {
    // Split frontmatter from content
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontmatterRegex);

    if (!match) {
      throw new Error('Invalid note format: missing frontmatter');
    }

    const [, frontmatterStr, contentStr] = match;

    // Parse YAML frontmatter
    const metadata = this.parseYamlMetadata(frontmatterStr);

    // Parse JSON blocks
    const blocks = JSON.parse(contentStr) as any[];

    return {
      id: metadata.id,
      projectId: metadata.projectId,
      workspaceId: metadata.workspaceId,
      title: metadata.title,
      emoji: metadata.emoji,
      blocks,
      parentId: metadata.parentId,
      isFavorite: metadata.isFavorite,
      order: metadata.order,
      isIndexed: metadata.isIndexed,
      indexedAt: metadata.indexedAt,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    };
  }

  /**
   * Simple YAML parser for metadata (simplified frontmatter)
   */
  private parseYamlMetadata(yaml: string): NoteMetadata {
    const lines = yaml.split('\n');
    const metadata: Partial<NoteMetadata> = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;

        // Remove quotes from string values
        const cleanValue = value.replace(/^"|"$/g, '');

        switch (key) {
          case 'id':
            metadata.id = cleanValue;
            break;
          case 'projectId':
            metadata.projectId = cleanValue;
            break;
          case 'workspaceId':
            // Validate workspaceId is one of the allowed values
            const validWorkspaceIds = ['ide', 'knowledge', 'study', 'notes'] as const;
            metadata.workspaceId = validWorkspaceIds.includes(cleanValue as any)
              ? cleanValue as 'ide' | 'knowledge' | 'study' | 'notes'
              : 'notes'; // Default fallback
            break;
          case 'title':
            metadata.title = cleanValue;
            break;
          case 'emoji':
            metadata.emoji = cleanValue;
            break;
          case 'parentId':
            metadata.parentId = cleanValue || undefined;
            break;
          case 'isFavorite':
            metadata.isFavorite = cleanValue === 'true';
            break;
          case 'order':
            metadata.order = parseInt(cleanValue, 10);
            break;
          case 'isIndexed':
            metadata.isIndexed = cleanValue === 'true' ? true : undefined;
            break;
          case 'indexedAt':
            metadata.indexedAt = cleanValue ? parseInt(cleanValue, 10) : undefined;
            break;
          case 'createdAt':
            metadata.createdAt = parseInt(cleanValue, 10);
            break;
          case 'updatedAt':
            metadata.updatedAt = parseInt(cleanValue, 10);
            break;
        }
      }
    }

    // Validate required fields
      if (!metadata.id || !metadata.projectId || !metadata.title || metadata.order === undefined) {
      throw new Error('Invalid note metadata: missing required fields');
    }

    // Ensure workspaceId is valid type
    const validWorkspaceIds = ['ide', 'knowledge', 'study', 'notes'] as const;
    if (metadata.workspaceId && !validWorkspaceIds.includes(metadata.workspaceId)) {
      metadata.workspaceId = 'notes'; // Default fallback
    }

    return metadata as NoteMetadata;
  }

  /**
   * Create a new note
   * @param note - Note record to create
   */
  async createNote(note: NoteRecord): Promise<void> {
    const path = this.getNotePath(note.id);
    const markdown = this.serializeNote(note);
    const encoder = new TextEncoder();
    const data = encoder.encode(markdown);

    await this.gateway.write(path, data);
    console.log(`[NoteGateway] Created note ${note.id} at ${path}`);
  }

  /**
   * Update a note (merges partial updates with existing)
   * @param noteId - Note ID to update
   * @param updates - Partial note fields to update
   */
  async updateNote(noteId: string, updates: Partial<NoteRecord>): Promise<void> {
    const path = this.getNotePath(noteId);

    // Read existing note
    const existing = await this.readNote(noteId);

    // Merge updates
    const updated: NoteRecord = {
      ...existing,
      ...updates,
      // Always update updatedAt if not provided
      updatedAt: updates.updatedAt || Date.now(),
    };

    // Serialize and write back
    const markdown = this.serializeNote(updated);
    const encoder = new TextEncoder();
    const data = encoder.encode(markdown);

    await this.gateway.write(path, data);
    console.log(`[NoteGateway] Updated note ${noteId} at ${path}`);
  }

  /**
   * Delete a note
   * @param noteId - Note ID to delete
   */
  async deleteNote(noteId: string): Promise<void> {
    const path = this.getNotePath(noteId);

    await this.gateway.delete(path);
    console.log(`[NoteGateway] Deleted note ${noteId} at ${path}`);
  }

  /**
   * Read a note
   * @param noteId - Note ID to read
   * @returns Note record
   */
  async readNote(noteId: string): Promise<NoteRecord> {
    const path = this.getNotePath(noteId);

    const data = await this.gateway.read(path);
    const decoder = new TextDecoder();
    const markdown = decoder.decode(data);

    return this.parseMarkdown(markdown);
  }

  /**
   * Check if a note exists
   * @param noteId - Note ID to check
   * @returns true if note exists
   */
  async noteExists(noteId: string): Promise<boolean> {
    const path = this.getNotePath(noteId);
    return await this.gateway.exists(path);
  }
}
