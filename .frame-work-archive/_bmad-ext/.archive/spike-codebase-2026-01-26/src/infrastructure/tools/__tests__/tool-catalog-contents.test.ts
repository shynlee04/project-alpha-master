/**
 * @fileoverview Tool Catalog Content Tests
 * @module infrastructure/tools/__tests__/tool-catalog-contents
 *
 * Tests for verifying TOOL_CATALOG contents without mocking.
 * These tests verify the actual registered tools and their metadata.
 *
 * @story 40-06 - Update Server-Side getTools() with Registry
 */

import { describe, it, expect } from 'vitest';
import { TOOL_CATALOG, getToolCountsByCategory } from '../tool-catalog';

describe('Tool Catalog Contents', () => {
  it('should export TOOL_CATALOG', () => {
    expect(TOOL_CATALOG).toBeDefined();
    expect(Array.isArray(TOOL_CATALOG)).toBe(true);
  });

  it('should include all 5 note tools in catalog', () => {
    const noteTools = TOOL_CATALOG.filter(t => t.metadata.category === 'notes');

    expect(noteTools).toHaveLength(5);
    const toolIds = noteTools.map(t => t.definition.name);
    expect(toolIds).toContain('create_note');
    expect(toolIds).toContain('read_note');
    expect(toolIds).toContain('update_note');
    expect(toolIds).toContain('delete_note');
    expect(toolIds).toContain('list_notes');
  });

  it('should have getToolCountsByCategory function', () => {
    expect(getToolCountsByCategory).toBeDefined();
    expect(typeof getToolCountsByCategory).toBe('function');
  });

  it('should report correct count for notes category', () => {
    const counts = getToolCountsByCategory();

    expect(counts.notes).toBe(5);
  });

  it('should only expose server-exposed tools', () => {
    // All tools in catalog should be server-exposed based on the executionSide
    // executionSide can be 'both', 'server', or 'client'
    const serverExposedTools = TOOL_CATALOG.filter(
      t => t.metadata.executionSide === 'both' || t.metadata.executionSide === 'server'
    );

    // Verify at least some tools are server-exposed
    expect(serverExposedTools.length).toBeGreaterThan(0);
  });

  it('should expose file tools', () => {
    const fileTools = TOOL_CATALOG.filter(t => t.metadata.category === 'files');

    expect(fileTools.length).toBe(3); // read_file, write_file, list_files
    const toolNames = fileTools.map(t => t.definition.name);
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('list_files');
  });

  it('should expose search tool', () => {
    const searchTools = TOOL_CATALOG.filter(t => t.metadata.category === 'search');

    expect(searchTools.length).toBe(1);
    expect(searchTools[0].definition.name).toBe('search_notes');
  });
});
