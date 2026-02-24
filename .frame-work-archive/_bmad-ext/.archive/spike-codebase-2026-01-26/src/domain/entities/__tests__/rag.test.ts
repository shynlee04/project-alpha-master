import { describe, it, expect } from 'vitest';
import type {
  RagCollection,
  RagDocument,
  RagChunk,
  RagCollectionCreateParams,
  RagDocumentCreateParams,
  RagChunkCreateParams,
  RagCollectionUpdateParams,
  RagDocumentUpdateParams,
  RagChunkUpdateParams,
} from '../rag';

describe('RAG Domain Entities', () => {
  describe('RagCollection', () => {
    it('should define a valid RagCollection structure', () => {
      const collection: RagCollection = {
        id: 'col-123',
        name: 'Knowledge Base',
        description: 'Main documentation',
        created: new Date(),
        updated: new Date(),
        metadata: { version: '1.0' },
      };

      expect(collection.id).toBe('col-123');
      expect(collection.name).toBe('Knowledge Base');
      expect(collection.metadata.version).toBe('1.0');
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: RagCollectionCreateParams = {
        name: 'New Collection',
        description: 'Test',
        metadata: {},
      };

      expect(params.name).toBe('New Collection');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: RagCollectionUpdateParams = {
        id: 'col-123',
        name: 'Updated Name',
      };

      expect(update.id).toBe('col-123');
      expect(update.name).toBe('Updated Name');
      expect(update.description).toBeUndefined();
    });
  });

  describe('RagDocument', () => {
    it('should define a valid RagDocument structure', () => {
      const doc: RagDocument = {
        id: 'doc-456',
        collectionId: 'col-123',
        title: 'Architecture Guide',
        content: '# Architecture...',
        metadata: { author: 'Team B' },
        status: 'indexed',
        created: new Date(),
        updated: new Date(),
      };

      expect(doc.id).toBe('doc-456');
      expect(doc.collectionId).toBe('col-123');
      expect(doc.status).toBe('indexed');
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: RagDocumentCreateParams = {
        collectionId: 'col-123',
        title: 'New Doc',
        content: 'Content',
        metadata: {},
      };

      expect(params.title).toBe('New Doc');
      // @ts-expect-error - status should not be in CreateParams (defaults to pending in impl)
      expect(params.status).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: RagDocumentUpdateParams = {
        id: 'doc-456',
        status: 'processing',
      };

      expect(update.id).toBe('doc-456');
      expect(update.status).toBe('processing');
    });
  });

  describe('RagChunk', () => {
    it('should define a valid RagChunk structure', () => {
      const chunk: RagChunk = {
        id: 'chk-789',
        documentId: 'doc-456',
        content: 'Segment content',
        embedding: [0.1, 0.2, 0.3],
        metadata: { page: 1 },
        index: 0,
      };

      expect(chunk.id).toBe('chk-789');
      expect(chunk.embedding).toHaveLength(3);
      expect(chunk.index).toBe(0);
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: RagChunkCreateParams = {
        documentId: 'doc-456',
        content: 'Segment',
        embedding: [0.1],
        metadata: {},
        index: 1,
      };

      expect(params.content).toBe('Segment');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: RagChunkUpdateParams = {
        id: 'chk-789',
        metadata: { page: 2 },
      };

      expect(update.id).toBe('chk-789');
      expect(update.metadata?.page).toBe(2);
    });
  });
});
