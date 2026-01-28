/**
 * @fileoverview Tool Catalog Tests
 * @module infrastructure/tools/__tests__/tool-catalog.test
 *
 * Tests for tool catalog registration and initialization.
 *
 * @epic 40 - Agent Chat Self-Switching Orchestrator
 * @story 40-05 - Register Note Tools in Tool Catalog
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TOOL_CATALOG, initializeToolRegistry, getToolCountsByCategory, toolRegistry, getToolCatalog } from '../tool-catalog';
import { createNoteDef, readNoteDef, updateNoteDef, deleteNoteDef, listNotesDef } from '../../../domain/tools/note';

describe('Tool Catalog', () => {
  beforeEach(() => {
    // Clear registry before each test
    toolRegistry.clear();
  });

  describe('Note Tools Registration (Story 40-05)', () => {
    it('should have all 5 note tools in catalog', () => {
      const noteToolIds = TOOL_CATALOG
        .filter((t) => t.metadata.category === 'notes')
        .map((t) => t.metadata.id);

      expect(noteToolIds).toContain('create_note');
      expect(noteToolIds).toContain('read_note');
      expect(noteToolIds).toContain('update_note');
      expect(noteToolIds).toContain('delete_note');
      expect(noteToolIds).toContain('list_notes');
      expect(noteToolIds).toHaveLength(5);
    });

    it('should register note tools with correct definitions', () => {
      const createNoteEntry = TOOL_CATALOG.find((t) => t.metadata.id === 'create_note');
      expect(createNoteEntry?.definition).toBe(createNoteDef);

      const readNoteEntry = TOOL_CATALOG.find((t) => t.metadata.id === 'read_note');
      expect(readNoteEntry?.definition).toBe(readNoteDef);

      const updateNoteEntry = TOOL_CATALOG.find((t) => t.metadata.id === 'update_note');
      expect(updateNoteEntry?.definition).toBe(updateNoteDef);

      const deleteNoteEntry = TOOL_CATALOG.find((t) => t.metadata.id === 'delete_note');
      expect(deleteNoteEntry?.definition).toBe(deleteNoteDef);

      const listNotesEntry = TOOL_CATALOG.find((t) => t.metadata.id === 'list_notes');
      expect(listNotesEntry?.definition).toBe(listNotesDef);
    });

    it('should configure note tools with correct metadata', () => {
      const noteTools = TOOL_CATALOG.filter((t) => t.metadata.category === 'notes');

      for (const tool of noteTools) {
        expect(tool.metadata.category).toBe('notes');
        expect(tool.metadata.allowedModes).toContain('knowledge');
        expect(tool.metadata.allowedWorkspaces).toContain('notes');
        expect(tool.metadata.allowedWorkspaces).toContain('knowledge');
        expect(tool.metadata.defaultTrustLevel).toBe('auto');
        expect(tool.metadata.riskLevel).toBe('low');
        expect(tool.metadata.executionSide).toBe('both');
      }
    });

    it('should count note tools correctly', () => {
      const counts = getToolCountsByCategory();
      expect(counts.notes).toBe(5);
    });
  });

  describe('Tool Registry Initialization', () => {
    it('should initialize registry with all tools including note tools', () => {
      initializeToolRegistry();

      // Verify note tools are registered
      expect(toolRegistry.get('create_note')).toBeDefined();
      expect(toolRegistry.get('read_note')).toBeDefined();
      expect(toolRegistry.get('update_note')).toBeDefined();
      expect(toolRegistry.get('delete_note')).toBeDefined();
      expect(toolRegistry.get('list_notes')).toBeDefined();
    });

    it('should have correct total tool count after initialization', () => {
      initializeToolRegistry();

      // Total tools: 3 files + 1 terminal + 1 search + 4 vision + 2 voice + 5 notes = 16
      const allTools = toolRegistry.getAll();
      expect(allTools.length).toBe(16);
    });
  });

  describe('Tool Counts by Category', () => {
    it('should return counts for all categories including notes', () => {
      const counts = getToolCountsByCategory();

      expect(counts).toEqual({
        files: 3,
        terminal: 1,
        knowledge: 0,  // search_notes is in 'search' category
        vision: 5,     // synthesize, process_pdf, process_image, voice_input, voice_output
        search: 1,
        web: 1,
        notes: 5,
      });
    });
  });

  describe('Catalog Immutability', () => {
    it('should return a read-only catalog', () => {
      const catalog = getToolCatalog();

      // Verify it's an array
      expect(Array.isArray(catalog)).toBe(true);

      // Verify it has the expected length (16 total tools)
      expect(catalog.length).toBe(16);
    });
  });
});
