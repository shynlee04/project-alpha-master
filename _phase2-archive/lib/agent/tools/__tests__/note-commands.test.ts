/**
 * @fileoverview Note Commands Tool Tests
 * @module lib/agent/tools/__tests__/note-commands.test
 *
 * Unit tests for FSA-based agent note tools.
 *
 * @epic CC-DESKTOP-FSA
 * @story CC-DF-03 - Agent Tool Integration
 * @created 2026-01-18
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createListNotesTool,
  createReadNoteTool,
  createWriteNoteTool,
  createDeleteNoteTool,
  listNotesDef,
  readNoteDef,
  writeNoteDef,
  deleteNoteDef
} from '../note-commands';
import type { ToolResult } from '../types';

describe('Note Commands Tool', () => {
  let mockReadFile: ReturnType<typeof vi.fn>;
  let mockWriteFile: ReturnType<typeof vi.fn>;
  let mockDeleteFile: ReturnType<typeof vi.fn>;
  let mockListFiles: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock storage adapter
    mockReadFile = vi.fn();
    mockWriteFile = vi.fn();
    mockDeleteFile = vi.fn();
    mockListFiles = vi.fn();

    const { createStorageAdapter } = await import('@/infrastructure/filesystem/StorageAdapterFactory');

    (createStorageAdapter as any).mockReturnValue({
      readFile: mockReadFile,
      writeFile: mockWriteFile,
      deleteFile: mockDeleteFile,
      listFiles: mockListFiles,
      isAvailable: () => true,
    });
  });

  describe('listNotes tool', () => {
    it('should list notes successfully', async () => {
      const listNotesServer = listNotesDef.server;

      // Mock file list response
      mockListFiles.mockResolvedValue([
        'notes/note-1.md',
        'notes/note-2.md',
        'notes/note-3.md',
      ]);

      // Mock file content reads
      mockReadFile.mockResolvedValue({
        path: 'notes/note-1.md',
        data: new TextEncoder().encode(
          '---\ntitle: "Note 1"\ncreated: 2026-01-18T10:00:00.000Z\nmodified: 2026-01-18T10:30:00.000Z\n---\n# Note 1 Content'
        ),
        text: '---\ntitle: "Note 1"\ncreated: 2026-01-18T10:00:00.000Z\nmodified: 2026-01-18T10:30:00.000Z\n---\n# Note 1 Content',
        metadata: {
          path: 'notes/note-1.md',
          size: 150,
          lastModified: Date.now(),
          contentType: 'text/markdown',
          syncState: 'synced',
        },
      });

      mockReadFile.mockResolvedValue({
        path: 'notes/note-2.md',
        data: new TextEncoder().encode(
          '---\ntitle: "Note 2"\ncreated: 2026-01-18T11:00:00.000Z\nmodified: 2026-01-18T11:15:00.000Z\n---\n# Note 2 Content'
        ),
        text: '---\ntitle: "Note 2"\ncreated: 2026-01-18T11:00:00.000Z\nmodified: 2026-01-18T11:15:00.000Z\n---\n# Note 2 Content',
        metadata: {
          path: 'notes/note-2.md',
          size: 140,
          lastModified: Date.now(),
          contentType: 'text/markdown',
          syncState: 'synced',
        },
      });

      mockReadFile.mockResolvedValue({
        path: 'notes/note-3.md',
        data: new TextEncoder().encode(
          '---\ntitle: "Note 3"\ncreated: 2026-01-18T09:00:00.000Z\nmodified: 2026-01-18T09:10:00.000Z\n---\n# Note 3 Content'
        ),
        text: '---\ntitle: "Note 3"\ncreated: 2026-01-18T09:00:00.000Z\nmodified: 2026-01-18T09:10:00.000Z\n---\n# Note 3 Content',
        metadata: {
          path: 'notes/note-3.md',
          size: 130,
          lastModified: Date.now(),
          contentType: 'text/markdown',
          syncState: 'synced',
        },
      });

      // Execute tool
      const result = await listNotesServer({
        projectId: 'test-project',
      });

      // Verify result
      expect(result).toEqual({
        success: true,
        data: {
          notes: [
            {
              id: 'note-1',
              title: 'Note 1',
              createdAt: '2026-01-18T10:00:00.000Z',
              updatedAt: '2026-01-18T10:30:00.000Z',
              parentId: null,
            },
            {
              id: 'note-2',
              title: 'Note 2',
              createdAt: '2026-01-18T11:00:00.000Z',
              updatedAt: '2026-01-18T11:15:00.000Z',
              parentId: null,
            },
            {
              id: 'note-3',
              title: 'Note 3',
              createdAt: '2026-01-18T09:00:00.000Z',
              updatedAt: '2026-01-18T09:10:00.000Z',
              parentId: null,
            },
          ],
          total: 3,
        },
      });
    });

  it('should apply pagination correctly', async () => {
      const listNotesServer = listNotesDef.server;

      // Mock 5 notes
      mockListFiles.mockResolvedValue([
        'notes/note-1.md',
        'notes/note-2.md',
        'notes/note-3.md',
        'notes/note-4.md',
        'notes/note-5.md',
      ]);

      // Mock all file contents
      for (let i = 1; i <= 5; i++) {
        mockReadFile.mockResolvedValueOnce({
          path: `notes/note-${i}.md`,
          data: new TextEncoder().encode(
            `---\ntitle: "Note ${i}"\ncreated: 2026-01-18T10:00:00.000Z\nmodified: 2026-01-18T10:30:00.000Z\n---\n# Note ${i} Content`
          ),
          text: `---\ntitle: "Note ${i}"\ncreated: 2026-01-18T10:00:00.000Z\nmodified: 2026-01-18T10:30:00.000Z\n---\n# Note ${i} Content`,
          metadata: {
            path: `notes/note-${i}.md`,
            size: 100,
            lastModified: Date.now(),
            contentType: 'text/markdown',
            syncState: 'synced',
          },
        });
      }

      // Execute with offset and limit
      const result = await listNotesServer({
        projectId: 'test-project',
        offset: 1,
        limit: 2,
      });

      // Should return notes 2 and 3 (offset 1, limit 2)
      expect(result).toEqual({
        success: true,
        data: {
          notes: [
            {
              id: 'note-2',
              title: 'Note 2',
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              parentId: null,
            },
            {
              id: 'note-3',
              title: 'Note 3',
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              parentId: null,
            },
          ],
          total: 5,
        },
      });
    });

  it('should handle read errors', async () => {
      const listNotesServer = listNotesDef.server;

      // Mock error
      mockListFiles.mockRejectedValue(new Error('File system error'));

      const result = await listNotesServer({
        projectId: 'test-project',
      });

      expect(result).toEqual({
        success: false,
        error: 'File system error',
      });
    });

  it('should handle parse errors', async () => {
      const listNotesServer = listNotesDef.server;

      // Mock successful list but invalid markdown
      mockListFiles.mockResolvedValue(['notes/note-1.md']);

      mockReadFile.mockResolvedValue({
        path: 'notes/note-1.md',
        data: new Uint8Array(),
        text: 'invalid markdown without frontmatter',
        metadata: {
          path: 'notes/note-1.md',
          size: 50,
          lastModified: Date.now(),
          contentType: 'text/markdown',
          syncState: 'synced',
        },
      });

      const result = await listNotesServer({
        projectId: 'test-project',
      });

      // Should return default note from parseNoteFromStorage
      expect(result).toEqual({
        success: true,
        data: {
          notes: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: expect.any(String),
            }),
          ]),
          total: 1,
        },
      });
    });
});
