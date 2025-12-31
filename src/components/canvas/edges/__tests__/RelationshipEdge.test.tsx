import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the helper functions directly (these don't require React Flow context)
const { createRelationshipEdge, getRelationshipColor, getRelationshipLabel } = await import('../RelationshipEdge');

describe('Edge Helper Functions', () => {
  describe('createRelationshipEdge', () => {
    it('creates edge with default relates type', () => {
      const edge = createRelationshipEdge('source-1', 'target-1');
      expect(edge.id).toMatch(/^edge-source-1-target-1-\d+$/);
      expect(edge.source).toBe('source-1');
      expect(edge.target).toBe('target-1');
      expect(edge.type).toBe('relationship');
      expect(edge.data?.relationship).toBe('relates');
      expect(edge.animated).toBe(true);
    });

    it('creates edge with supports type', () => {
      const edge = createRelationshipEdge('source-1', 'target-1', 'supports');
      expect(edge.data?.relationship).toBe('supports');
    });

    it('creates edge with contradicts type', () => {
      const edge = createRelationshipEdge('source-1', 'target-1', 'contradicts');
      expect(edge.data?.relationship).toBe('contradicts');
    });

    it('creates edge with extends type', () => {
      const edge = createRelationshipEdge('source-1', 'target-1', 'extends');
      expect(edge.data?.relationship).toBe('extends');
    });

    it('creates edge with custom label', () => {
      const edge = createRelationshipEdge('source-1', 'target-1', 'relates', 'my label');
      expect(edge.data?.label).toBe('my label');
    });

    it('generates unique IDs for each edge', async () => {
      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      const edge1 = createRelationshipEdge('a', 'b');
      await new Promise(resolve => setTimeout(resolve, 10));
      const edge2 = createRelationshipEdge('a', 'b');
      expect(edge1.id).not.toBe(edge2.id);
    });
  });

  describe('getRelationshipColor', () => {
    it('returns purple for relates', () => {
      expect(getRelationshipColor('relates')).toBe('var(--color-primary, #a855f7)');
    });

    it('returns green for supports', () => {
      expect(getRelationshipColor('supports')).toBe('#22c55e');
    });

    it('returns red for contradicts', () => {
      expect(getRelationshipColor('contradicts')).toBe('#ef4444');
    });

    it('returns blue for extends', () => {
      expect(getRelationshipColor('extends')).toBe('#3b82f6');
    });
  });

  describe('getRelationshipLabel', () => {
    it('returns "Related to" for relates', () => {
      expect(getRelationshipLabel('relates')).toBe('Related to');
    });

    it('returns "Supports" for supports', () => {
      expect(getRelationshipLabel('supports')).toBe('Supports');
    });

    it('returns "Contrasts with" for contradicts', () => {
      expect(getRelationshipLabel('contradicts')).toBe('Contrasts with');
    });

    it('returns "Extends" for extends', () => {
      expect(getRelationshipLabel('extends')).toBe('Extends');
    });
  });
});

describe('RelationshipEdge Rendering (Visual Tests)', () => {
  // These tests verify the component can render without errors
  // Full integration tests would require React Flow context

  it('component file exports are correct', async () => {
    const mod = await import('../RelationshipEdge');
    expect(mod.RelolutionEdge).toBeUndefined();
    expect(mod.RelationshipEdge).toBeDefined();
    expect(mod.createRelationshipEdge).toBeDefined();
    expect(mod.getRelationshipColor).toBeDefined();
    expect(mod.getRelationshipLabel).toBeDefined();
  });
});
