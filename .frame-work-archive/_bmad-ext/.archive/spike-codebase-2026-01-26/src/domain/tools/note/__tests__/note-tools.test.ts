/**
 * @fileoverview Note Tools Unit Tests
 * @module domain/tools/note/__tests__
 * @governance EPIC-40 MM-04
 *
 * Unit tests for all note CRUD tool definitions.
 *
 * @story 40-04: Create Note CRUD Tool Definitions
 * @created 2026-01-10
 */

import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import {
  createNoteDef,
  readNoteDef,
  updateNoteDef,
  deleteNoteDef,
  listNotesDef,
} from '../index';

// Mock note store
const mockNoteStore = {
  createNote: vi.fn(),
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  notesArray: [
    {
      id: 'note-1',
      title: 'Test Note 1',
      content: 'Test content 1',
      parentId: null,
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'note-2',
      title: 'Test Note 2',
      content: 'Test content 2',
      parentId: 'folder-1',
      createdAt: '2026-01-10T01:00:00Z',
      updatedAt: '2026-01-10T01:00:00Z',
    },
  ],
  currentProjectId: 'project-1',
};

describe('Note Tools (Story 40-04)', () => {
  describe('create_note tool definition (AC-1)', () => {
    it('should have correct name and description', () => {
      expect(createNoteDef.name).toBe('create_note');
      expect(createNoteDef.description).toContain('Create a new note');
    });

    it('should validate input schema correctly', () => {
      const schema = createNoteDef.inputSchema;
      const input = {
        title: 'Test Note',
        content: 'Test content',
      };

      expect(() => schema.parse(input)).not.toThrow();
      expect(schema.parse(input)).toEqual(input);
    });

    it('should require title field', () => {
      const schema = createNoteDef.inputSchema;

      expect(() => schema.parse({ content: 'test' })).toThrow();
    });

    it('should accept optional parentId', () => {
      const schema = createNoteDef.inputSchema;
      const input = {
        title: 'Test Note',
        content: 'Test content',
        parentId: 'folder-1',
      };

      expect(() => schema.parse(input)).not.toThrow();
      expect(schema.parse(input).parentId).toBe('folder-1');
    });
  });

  describe('read_note tool definition (AC-2)', () => {
    it('should have correct name and description', () => {
      expect(readNoteDef.name).toBe('read_note');
      expect(readNoteDef.description.toLowerCase()).toContain('read');
    });

    it('should validate input schema correctly', () => {
      const schema = readNoteDef.inputSchema;
      const input = { noteId: 'note-1' };

      expect(() => schema.parse(input)).not.toThrow();
      expect(schema.parse(input)).toEqual(input);
    });

    it('should require noteId field', () => {
      const schema = readNoteDef.inputSchema;

      expect(() => schema.parse({})).toThrow();
    });
  });

  describe('update_note tool definition (AC-3)', () => {
    it('should have correct name and description', () => {
      expect(updateNoteDef.name).toBe('update_note');
      expect(updateNoteDef.description).toContain('update');
    });

    it('should validate input schema correctly', () => {
      const schema = updateNoteDef.inputSchema;

      // Valid with title only
      expect(() => schema.parse({ noteId: 'note-1', title: 'New Title' })).not.toThrow();

      // Valid with content only
      expect(() => schema.parse({ noteId: 'note-1', content: 'New content' })).not.toThrow();

      // Valid with both
      expect(() => schema.parse({
        noteId: 'note-1',
        title: 'New Title',
        content: 'New content',
      })).not.toThrow();
    });

    it('should require at least one field to update', () => {
      const schema = updateNoteDef.inputSchema;

      // Neither title nor content provided
      expect(() => schema.parse({ noteId: 'note-1' })).toThrow();
    });

    it('should require noteId field', () => {
      const schema = updateNoteDef.inputSchema;

      expect(() => schema.parse({ title: 'test' })).toThrow();
    });
  });

  describe('delete_note tool definition (AC-4)', () => {
    it('should have correct name and description', () => {
      expect(deleteNoteDef.name).toBe('delete_note');
      expect(deleteNoteDef.description).toContain('delete');
      expect(deleteNoteDef.description).toContain('cannot be undone');
    });

    it('should validate input schema correctly', () => {
      const schema = deleteNoteDef.inputSchema;
      const input = { noteId: 'note-1' };

      expect(() => schema.parse(input)).not.toThrow();
      expect(schema.parse(input)).toEqual(input);
    });

    it('should require noteId field', () => {
      const schema = deleteNoteDef.inputSchema;

      expect(() => schema.parse({})).toThrow();
    });
  });

  describe('list_notes tool definition (AC-5)', () => {
    it('should have correct name and description', () => {
      expect(listNotesDef.name).toBe('list_notes');
      expect(listNotesDef.description.toLowerCase()).toContain('list');
      expect(listNotesDef.description.toLowerCase()).toContain('pagination');
    });

    it('should validate input schema correctly', () => {
      const schema = listNotesDef.inputSchema;
      const input = { limit: 10, offset: 0 };

      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should apply default values for limit and offset', () => {
      const schema = listNotesDef.inputSchema;

      // Empty input should get defaults
      const result = schema.parse({});
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('should validate limit range (1-100)', () => {
      const schema = listNotesDef.inputSchema;

      expect(() => schema.parse({ limit: 0 })).toThrow();
      expect(() => schema.parse({ limit: 101 })).toThrow();
      expect(() => schema.parse({ limit: 50 })).not.toThrow();
    });

    it('should accept optional filters', () => {
      const schema = listNotesDef.inputSchema;
      const input = {
        limit: 10,
        parentId: 'folder-1',
        search: 'test',
      };

      expect(() => schema.parse(input)).not.toThrow();
    });
  });

  describe('Output schemas', () => {
    it('should have consistent success/error structure', () => {
      const allDefs = [createNoteDef, readNoteDef, updateNoteDef, deleteNoteDef, listNotesDef];

      for (const def of allDefs) {
        const schema = def.outputSchema;
        const parsed = schema.parse({
          success: true,
          message: 'test',
        });

        expect(parsed).toHaveProperty('success');
        expect(parsed).toHaveProperty('message');
      }
    });
  });

  describe('Tool naming consistency', () => {
    it('should follow snake_case naming convention', () => {
      const allDefs = [createNoteDef, readNoteDef, updateNoteDef, deleteNoteDef, listNotesDef];

      for (const def of allDefs) {
        expect(def.name).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(def.name).toContain('_');
      }
    });

    it('should have consistent note_ prefix', () => {
      const toolNames = [createNoteDef.name, readNoteDef.name, updateNoteDef.name, deleteNoteDef.name, listNotesDef.name];

      expect(toolNames).toEqual([
        'create_note',
        'read_note',
        'update_note',
        'delete_note',
        'list_notes',
      ]);
    });
  });

  describe('Zod schema validation', () => {
    it('should properly define input schemas', () => {
      expect(createNoteDef.inputSchema).toBeInstanceOf(z.ZodObject);
      expect(readNoteDef.inputSchema).toBeInstanceOf(z.ZodObject);
      expect(updateNoteDef.inputSchema).toBeInstanceOf(z.ZodObject);
      expect(deleteNoteDef.inputSchema).toBeInstanceOf(z.ZodObject);
      expect(listNotesDef.inputSchema).toBeInstanceOf(z.ZodObject);
    });

    it('should properly define output schemas', () => {
      expect(createNoteDef.outputSchema).toBeInstanceOf(z.ZodObject);
      expect(readNoteDef.outputSchema).toBeInstanceOf(z.ZodObject);
      expect(updateNoteDef.outputSchema).toBeInstanceOf(z.ZodObject);
      expect(deleteNoteDef.outputSchema).toBeInstanceOf(z.ZodObject);
      expect(listNotesDef.outputSchema).toBeInstanceOf(z.ZodObject);
    });
  });
});
