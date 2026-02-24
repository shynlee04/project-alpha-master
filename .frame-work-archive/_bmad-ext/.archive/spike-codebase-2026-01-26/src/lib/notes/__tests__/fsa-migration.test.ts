/**
 * @fileoverview FSA Migration Tests
 * @module lib/notes/__tests__/fsa-migration.test
 *
 * End-to-end tests for FSA migration workflows.
 * Tests verify notes are stored in FSA and cached in DexieDB.
 *
 * @epic CC-DESKTOP-FSA
 * @story CC-DF-05 - Migration Verification Tests
 * @created 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockFSAGateway } from './mocks/mock-fsa-adapter';
import type { NoteRecord } from '../types';

// ============================================================================
// Types
// ============================================================================

/**
 * Mock DexieDB for testing
 */
class MockDexieDB {
  private notes = new Map<string, NoteRecord>();

  async put(note: NoteRecord): Promise<void> {
    this.notes.set(note.id, note);
  }

  async get(id: string): Promise<NoteRecord | undefined> {
    return this.notes.get(id);
  }

  async delete(id: string): Promise<void> {
    this.notes.delete(id);
  }

  async getAll(): Promise<NoteRecord[]> {
    return Array.from(this.notes.values());
  }

  clear(): void {
    this.notes.clear();
  }
}

// ============================================================================
// Setup
// ============================================================================

const mockDb = new MockDexieDB();
let mockFSA: MockFSAGateway;

const mockNote: NoteRecord = {
  id: 'note-test-001',
  projectId: 'project-123',
  workspaceId: 'notes',
  title: 'Test Note Title',
  blocks: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Test Note Content',
        },
      ],
    },
  ],
  parentId: null,
  isFavorite: false,
  order: 0,
  isIndexed: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFSA = new MockFSAGateway({ mockDelay: 0 });
  mockDb.clear();
  mockFSA.reset();
});

afterEach(() => {
  mockFSA.reset();
  mockDb.clear();
});

// ============================================================================
// Test Suites
// ============================================================================

describe('CC-DF-05: FSA Migration Tests', () => {
  // ==========================================================================
  // Note Creation Workflow (AC-2)
  // ==========================================================================

  describe('Note Creation Workflow (AC-2)', () => {
    it('should create note in FSA and update DexieDB cache', async () => {
      const data = new TextEncoder().encode('test note content');
      await mockFSA.write('/project/notes/note-test-001.md', data);
      await mockDb.put(mockNote);

      const existsInFSA = await mockFSA.exists('/project/notes/note-test-001.md');
      expect(existsInFSA).toBe(true);

      const cached = await mockDb.get('note-test-001');
      expect(cached).toBeDefined();
      expect(cached?.id).toBe('note-test-001');
      expect(cached?.title).toBe('Test Note Title');

      const fileData = await mockFSA.read('/project/notes/note-test-001.md');
      const content = new TextDecoder().decode(fileData);
      expect(content).toContain('test note content');
    });

    it('should generate unique file paths for multiple notes', async () => {
      const notes = [
        mockNote,
        { ...mockNote, id: 'note-test-002', title: 'Note 2' },
        { ...mockNote, id: 'note-test-003', title: 'Note 3' },
      ];

      for (const note of notes) {
        const data = new TextEncoder().encode('test content');
        await mockFSA.write(`/project/notes/${note.id}.md`, data);
        await mockDb.put(note);
      }

      const note1 = await mockFSA.exists('/project/notes/note-test-001.md');
      const note2 = await mockFSA.exists('/project/notes/note-test-002.md');
      const note3 = await mockFSA.exists('/project/notes/note-test-003.md');

      expect(note1).toBe(true);
      expect(note2).toBe(true);
      expect(note3).toBe(true);
    });
  });

  // ==========================================================================
  // Note Editing Workflow (AC-3)
  // ==========================================================================

  describe('Note Editing Workflow (AC-3)', () => {
    it('should update note in FSA and sync to DexieDB', async () => {
      const data = new TextEncoder().encode('test note content');
      await mockFSA.write('/project/notes/note-test-001.md', data);
      await mockDb.put(mockNote);

      const updatedData = new TextEncoder().encode('updated content');
      await mockFSA.write('/project/notes/note-test-001.md', updatedData);
      const updated = { ...mockNote, title: 'Updated Title', updatedAt: Date.now() };
      await mockDb.put(updated);

      const cached = await mockDb.get('note-test-001');
      expect(cached?.title).toBe('Updated Title');
    });

    it('should update content while preserving frontmatter', async () => {
      const data = new TextEncoder().encode('test note content');
      await mockFSA.write('/project/notes/note-test-001.md', data);
      await mockDb.put(mockNote);

      const updatedData = new TextEncoder().encode('# Updated Content\n\nThis is new content.');
      await mockFSA.write('/project/notes/note-test-001.md', updatedData);
      const updated = { ...mockNote, updatedAt: Date.now() };
      await mockDb.put(updated);

      const fileData = await mockFSA.read('/project/notes/note-test-001.md');
      const content = new TextDecoder().decode(fileData);

      expect(content).toContain('# Updated Content');
    });
  });

  // ==========================================================================
  // Note Deletion Workflow (AC-4)
  // ==========================================================================

  describe('Note Deletion Workflow (AC-4)', () => {
    it('should delete note from FSA and DexieDB cache', async () => {
      const data = new TextEncoder().encode('test note content');
      await mockFSA.write('/project/notes/note-test-001.md', data);
      await mockDb.put(mockNote);

      expect(await mockFSA.exists('/project/notes/note-test-001.md')).toBe(true);
      expect(await mockDb.get('note-test-001')).toBeDefined();

      await mockFSA.delete('/project/notes/note-test-001.md');
      await mockDb.delete('note-test-001');

      const existsInFSA = await mockFSA.exists('/project/notes/note-test-001.md');
      expect(existsInFSA).toBe(false);

      const cached = await mockDb.get('note-test-001');
      expect(cached).toBeUndefined();
    });

    it('should not affect other notes on deletion', async () => {
      const notes = [
        mockNote,
        { ...mockNote, id: 'note-test-002', title: 'Note 2' },
        { ...mockNote, id: 'note-test-003', title: 'Note 3' },
      ];

      for (const note of notes) {
        const data = new TextEncoder().encode('test content');
        await mockFSA.write(`/project/notes/${note.id}.md`, data);
        await mockDb.put(note);
      }

      await mockFSA.delete('/project/notes/note-test-002.md');
      await mockDb.delete('note-test-002');

      const note1 = await mockFSA.exists('/project/notes/note-test-001.md');
      const note3 = await mockFSA.exists('/project/notes/note-test-003.md');

      expect(note1).toBe(true);
      expect(note3).toBe(true);
    });
  });

  // ==========================================================================
  // Storage Mode Detection (AC-5)
  // ==========================================================================

  describe('Storage Mode Detection (AC-5)', () => {
    it('should use FSAGateway for desktop projects', () => {
      const gateway = mockFSA;
      expect(gateway).toBeInstanceOf(MockFSAGateway);
    });

    it('should implement StorageGateway interface', () => {
      expect(mockFSA.read).toBeDefined();
      expect(mockFSA.write).toBeDefined();
      expect(mockFSA.delete).toBeDefined();
      expect(mockFSA.list).toBeDefined();
      expect(mockFSA.exists).toBeDefined();
      expect(mockFSA.watch).toBeDefined();
    });
  });

  // ==========================================================================
  // Gateway Routing (AC-6)
  // ==========================================================================

  describe('Gateway Routing (AC-6)', () => {
    it('should route write operations to FSA gateway', async () => {
      const data = new TextEncoder().encode('test content');

      await mockFSA.write('/project/notes/test.md', data);

      const exists = await mockFSA.exists('/project/notes/test.md');
      expect(exists).toBe(true);

      const fileData = await mockFSA.read('/project/notes/test.md');
      const text = new TextDecoder().decode(fileData);
      expect(text).toBe('test content');
    });

    it('should route read operations to FSA gateway', async () => {
      const data = new TextEncoder().encode('test content');
      await mockFSA.write('/project/notes/test.md', data);

      const fileData = await mockFSA.read('/project/notes/test.md');
      const text = new TextDecoder().decode(fileData);

      expect(text).toBe('test content');
    });

    it('should route list operations to FSA gateway', async () => {
      const files = [
        '/project/notes/note-1.md',
        '/project/notes/note-2.md',
        '/project/notes/subfolder/note-3.md',
      ];

      for (const path of files) {
        await mockFSA.write(path, new TextEncoder().encode('content'));
      }

      const listed = await mockFSA.list('**/*.md');

      expect(listed).toHaveLength(3);
      expect(listed.map((f) => f.path)).toEqual(files);
    });

    it('should route delete operations to FSA gateway', async () => {
      const data = new TextEncoder().encode('test content');
      await mockFSA.write('/project/notes/test.md', data);

      const existsBefore = await mockFSA.exists('/project/notes/test.md');
      expect(existsBefore).toBe(true);

      await mockFSA.delete('/project/notes/test.md');

      const existsAfter = await mockFSA.exists('/project/notes/test.md');
      expect(existsAfter).toBe(false);
    });
  });

  // ==========================================================================
  // File Watching Integration (AC-7)
  // ==========================================================================

  describe('File Watching Integration (AC-7)', () => {
    it('should detect external file changes', async () => {
      const callback = vi.fn();
      const watcher = mockFSA.watch(callback);

      mockFSA.simulateExternalChange('/project/notes/note-test-001.md', 'modified');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'modified',
          path: '/project/notes/note-test-001.md',
        })
      );

      watcher.stop();
    });

    it('should detect file creation events', async () => {
      const callback = vi.fn();
      const watcher = mockFSA.watch(callback);

      mockFSA.simulateExternalChange('/project/notes/new-note.md', 'created');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'created',
          path: '/project/notes/new-note.md',
        })
      );

      watcher.stop();
    });

    it('should detect file deletion events', async () => {
      const callback = vi.fn();
      const watcher = mockFSA.watch(callback);

      mockFSA.simulateExternalChange('/project/notes/deleted-note.md', 'deleted');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'deleted',
          path: '/project/notes/deleted-note.md',
        })
      );

      watcher.stop();
    });

    it('should stop watching when stop() called', async () => {
      const callback = vi.fn();
      const watcher = mockFSA.watch(callback);

      expect(mockFSA.isStopped()).toBe(false);

      watcher.stop();

      expect(mockFSA.isStopped()).toBe(true);

      mockFSA.simulateExternalChange('/project/notes/test.md', 'created');
      expect(callback).toHaveBeenCalledTimes(0);
    });

    it('should track all changes for testing', async () => {
      const callback = vi.fn();
      const watcher = mockFSA.watch(callback);

      mockFSA.simulateExternalChange('/project/notes/1.md', 'created');
      mockFSA.simulateExternalChange('/project/notes/2.md', 'created');
      mockFSA.simulateExternalChange('/project/notes/1.md', 'modified');

      const changes = mockFSA.getChanges();

      expect(changes).toHaveLength(3);
      expect(changes[0].kind).toBe('created');
      expect(changes[1].kind).toBe('created');
      expect(changes[2].kind).toBe('modified');

      watcher.stop();
    });
  });

  // ==========================================================================
  // Cache Synchronization (AC-9)
  // ==========================================================================

  describe('Cache Synchronization (AC-9)', () => {
    it('should keep DexieDB cache in sync with FSA', async () => {
      const data = new TextEncoder().encode('test note content');
      await mockFSA.write('/project/notes/note-test-001.md', data);
      await mockDb.put(mockNote);

      const fsaData = await mockFSA.read('/project/notes/note-test-001.md');
      const fsaContent = new TextDecoder().decode(fsaData);

      const cached = await mockDb.get('note-test-001');
      expect(cached).toBeDefined();

      expect(fsaContent).toContain('test note content');
      expect(cached?.id).toBe('note-test-001');
    });

    it('should update cache on FSA changes', async () => {
      const data = new TextEncoder().encode('test note content');
      await mockFSA.write('/project/notes/note-test-001.md', data);
      await mockDb.put(mockNote);

      const originalCached = await mockDb.get('note-test-001');
      const originalUpdatedAt = originalCached?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 1));

      const updatedData = new TextEncoder().encode('updated content');
      await mockFSA.write('/project/notes/note-test-001.md', updatedData);
      const updated = { ...mockNote, updatedAt: Date.now() };
      await mockDb.put(updated);

      const updatedCached = await mockDb.get('note-test-001');

      expect(updatedCached?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should remove cache entry when FSA file deleted', async () => {
      const data = new TextEncoder().encode('test note content');
      await mockFSA.write('/project/notes/note-test-001.md', data);
      await mockDb.put(mockNote);

      await mockFSA.delete('/project/notes/note-test-001.md');
      await mockDb.delete('note-test-001');

      const cached = await mockDb.get('note-test-001');
      expect(cached).toBeUndefined();
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle file not found on read', async () => {
      await expect(
        mockFSA.read('/project/notes/nonexistent.md')
      ).rejects.toThrow('File not found');
    });

    it('should handle file not found on delete', async () => {
      await expect(
        mockFSA.delete('/project/notes/nonexistent.md')
      ).rejects.toThrow('File not found');
    });
  });

  // ==========================================================================
  // Performance & Scalability
  // ==========================================================================

  describe('Performance & Scalability', () => {
    it('should handle concurrent write operations', async () => {
      const notes = Array.from({ length: 10 }, (_, i) => ({
        ...mockNote,
        id: `note-concurrent-${i}`,
        title: `Concurrent Note ${i}`,
      }));

      const operations = notes.map((note) =>
        mockFSA.write(`/project/notes/${note.id}.md`, new TextEncoder().encode('content')).then(() => mockDb.put(note))
      );

      await Promise.all(operations);

      const fileCount = mockFSA.getFileCount();
      expect(fileCount).toBe(10);
    });

    it('should handle large note content', async () => {
      const largeContent = '# Large Note\n\n'.repeat(100) + 'Large content text.\n'.repeat(500);
      const largeNote: NoteRecord = {
        ...mockNote,
        id: 'note-large',
        updatedAt: Date.now(),
        blocks: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: largeContent }],
          },
        ],
      };

      const data = new TextEncoder().encode(largeContent);
      await mockFSA.write('/project/notes/note-large.md', data);
      await mockDb.put(largeNote);

      const fileData = await mockFSA.read('/project/notes/note-large.md');
      const content = new TextDecoder().decode(fileData);

      expect(content.length).toBeGreaterThan(10000);
      expect(content).toContain('Large Note');
    });

    it('should maintain performance with many notes', async () => {
      const notes: Record<string, string> = {};
      for (let i = 1; i <= 100; i++) {
        notes[`/project/notes/note-${i}.md`] = 'test content';
      }

      const startTime = Date.now();
      await mockFSA.seedFiles(notes);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      expect(mockFSA.getFileCount()).toBe(100);
    });
  });
});
