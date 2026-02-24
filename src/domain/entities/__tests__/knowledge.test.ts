import { describe, it, expect } from 'vitest';
import type {
  KnowledgeSource,
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeSourceCreateParams,
  KnowledgeNodeCreateParams,
  KnowledgeEdgeCreateParams,
  KnowledgeSourceUpdateParams,
  KnowledgeNodeUpdateParams,
  KnowledgeEdgeUpdateParams,
} from '../knowledge';

describe('Knowledge Domain Entities', () => {
  describe('KnowledgeSource', () => {
    it('should define a valid KnowledgeSource structure', () => {
      const source: KnowledgeSource = {
        id: 'src-123',
        projectId: 'proj-001',
        type: 'file',
        uri: '/docs/architecture.md',
        title: 'Architecture Doc',
        metadata: { size: 1024 },
        status: 'processed',
        created: new Date(),
        updated: new Date(),
      };

      expect(source.id).toBe('src-123');
      expect(source.type).toBe('file');
      expect(source.status).toBe('processed');
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: KnowledgeSourceCreateParams = {
        projectId: 'proj-001',
        type: 'url',
        uri: 'https://example.com',
        title: 'Example',
        metadata: {},
      };

      expect(params.type).toBe('url');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: KnowledgeSourceUpdateParams = {
        id: 'src-123',
        status: 'error',
      };

      expect(update.id).toBe('src-123');
      expect(update.status).toBe('error');
    });
  });

  describe('KnowledgeNode', () => {
    it('should define a valid KnowledgeNode structure', () => {
      const node: KnowledgeNode = {
        id: 'node-456',
        label: 'Clean Architecture',
        type: 'concept',
        properties: { importance: 'high' },
        created: new Date(),
        updated: new Date(),
      };

      expect(node.id).toBe('node-456');
      expect(node.type).toBe('concept');
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: KnowledgeNodeCreateParams = {
        label: 'React',
        type: 'entity',
        properties: {},
      };

      expect(params.label).toBe('React');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: KnowledgeNodeUpdateParams = {
        id: 'node-456',
        label: 'Updated Label',
      };

      expect(update.id).toBe('node-456');
      expect(update.label).toBe('Updated Label');
    });
  });

  describe('KnowledgeEdge', () => {
    it('should define a valid KnowledgeEdge structure', () => {
      const edge: KnowledgeEdge = {
        id: 'edge-789',
        sourceId: 'node-456',
        targetId: 'node-999',
        type: 'relates_to',
        properties: { weight: 0.8 },
        created: new Date(),
        updated: new Date(),
      };

      expect(edge.id).toBe('edge-789');
      expect(edge.sourceId).toBe('node-456');
      expect(edge.type).toBe('relates_to');
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: KnowledgeEdgeCreateParams = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'contains',
        properties: {},
      };

      expect(params.type).toBe('contains');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: KnowledgeEdgeUpdateParams = {
        id: 'edge-789',
        properties: { weight: 0.9 },
      };

      expect(update.id).toBe('edge-789');
      expect(update.properties?.weight).toBe(0.9);
    });
  });
});
