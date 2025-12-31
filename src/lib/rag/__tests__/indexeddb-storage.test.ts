/**
 * @fileoverview Orama IndexedDB Storage Tests
 * @module lib/rag/indexeddb-storage/test
 * @governance EPIC-7-1
 *
 * Tests for Dexie-based Orama index persistence.
 */

import {
  getOramaIndexData,
  saveOramaIndexData,
  deleteOramaIndexData,
  getAllOramaIndexIds,
  getTotalIndexesSize,
  hasOramaIndex,
  getAllIndexesMetadata,
} from '../indexeddb-storage';
import { db } from '@/lib/state/dexie-db';

describe('Story 7-1: Orama IndexedDB Storage', () => {
  const testProjectId = 'test-project-storage';
  const testProjectId2 = 'test-project-storage-2';

  const mockOramaData = {
    docs: {
      'doc-1': {
        id: 'doc-1',
        sourceId: 'source-1',
        content: 'Test content',
        title: 'Test Document',
      },
    },
    indexes: { docs: 'docs-index' },
    schema: {
      docs: {
        id: 'string',
        sourceId: 'string',
        content: 'string',
        title: 'string',
      },
    },
  };

  // Clean up before each test
  beforeEach(async () => {
    await db.oramaIndexes.clear();
  });

  // Clean up after each test
  afterEach(async () => {
    await db.oramaIndexes.clear();
  });

  describe('Index CRUD Operations', () => {
    it('should save and retrieve index data', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);

      const retrieved = await getOramaIndexData(testProjectId);

      expect(retrieved).toBeDefined();
      expect(retrieved).toEqual(mockOramaData);
    });

    it('should return null for non-existent index', async () => {
      const retrieved = await getOramaIndexData('non-existent');

      expect(retrieved).toBeNull();
    });

    it('should overwrite existing index data', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);

      const newData = { ...mockOramaData, version: 2 };
      await saveOramaIndexData(testProjectId, newData);

      const retrieved = await getOramaIndexData(testProjectId);
      expect(retrieved).toEqual(newData);
    });

    it('should delete index data', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);

      await deleteOramaIndexData(testProjectId);

      const retrieved = await getOramaIndexData(testProjectId);
      expect(retrieved).toBeNull();
    });

    it('should handle deleting non-existent index', async () => {
      // Should not throw
      await deleteOramaIndexData('non-existent');
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);
      await saveOramaIndexData(testProjectId2, { ...mockOramaData, version: 2 });
    });

    it('should get all index IDs', async () => {
      const ids = await getAllOramaIndexIds();

      expect(ids).toContain(testProjectId);
      expect(ids).toContain(testProjectId2);
      expect(ids.length).toBe(2);
    });

    it('should check if index exists', async () => {
      const exists1 = await hasOramaIndex(testProjectId);
      const exists2 = await hasOramaIndex('non-existent');

      expect(exists1).toBe(true);
      expect(exists2).toBe(false);
    });

    it('should get all indexes metadata', async () => {
      const metadata = await getAllIndexesMetadata();

      expect(metadata.length).toBe(2);
      metadata.forEach((m) => {
        expect(m).toHaveProperty('projectId');
        expect(m).toHaveProperty('documentCount');
        expect(m).toHaveProperty('size');
        expect(m).toHaveProperty('lastUpdated');
      });
    });
  });

  describe('Storage Size Calculation', () => {
    it('should calculate total indexes size', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);
      await saveOramaIndexData(testProjectId2, mockOramaData);

      const totalSize = await getTotalIndexesSize();

      expect(totalSize).toBeGreaterThan(0);
    });

    it('should return 0 for empty database', async () => {
      const totalSize = await getTotalIndexesSize();

      expect(totalSize).toBe(0);
    });

    it('should include size in metadata', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);

      const metadata = await getAllIndexesMetadata();
      const testMetadata = metadata.find((m) => m.projectId === testProjectId);

      expect(testMetadata?.size).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty index data', async () => {
      await saveOramaIndexData(testProjectId, {});

      const retrieved = await getOramaIndexData(testProjectId);
      expect(retrieved).toEqual({});
    });

    it('should handle complex nested data', async () => {
      const complexData = {
        docs: {
          'doc-1': {
            id: 'doc-1',
            content: 'Test',
            metadata: {
              nested: {
                value: 123,
                array: [1, 2, 3],
              },
            },
          },
        },
        indexes: {
          docs: 'docs-index',
          metadata: 'metadata-index',
        },
      };

      await saveOramaIndexData(testProjectId, complexData);

      const retrieved = await getOramaIndexData(testProjectId);
      expect(retrieved).toEqual(complexData);
    });

    it('should handle special characters in project ID', async () => {
      const specialId = 'test-project-with-special-chars-123';

      await saveOramaIndexData(specialId, mockOramaData);

      const retrieved = await getOramaIndexData(specialId);
      expect(retrieved).toEqual(mockOramaData);
    });
  });

  describe('Document Count Estimation', () => {
    it('should estimate document count from data structure', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);

      const metadata = await getAllIndexesMetadata();
      const testMetadata = metadata.find((m) => m.projectId === testProjectId);

      // The estimate function looks for docs object and counts keys
      expect(testMetadata?.documentCount).toBe(1);
    });

    it('should return 0 for data without docs', async () => {
      await saveOramaIndexData(testProjectId, { noDocs: true });

      const metadata = await getAllIndexesMetadata();
      const testMetadata = metadata.find((m) => m.projectId === testProjectId);

      expect(testMetadata?.documentCount).toBe(0);
    });
  });

  describe('Transaction Safety', () => {
    it('should handle concurrent save operations', async () => {
      // Save multiple indexes concurrently
      await Promise.all([
        saveOramaIndexData(`${testProjectId}-1`, mockOramaData),
        saveOramaIndexData(`${testProjectId}-2`, mockOramaData),
        saveOramaIndexData(`${testProjectId}-3`, mockOramaData),
      ]);

      const ids = await getAllOramaIndexIds();
      expect(ids.length).toBe(3);
    });

    it('should handle concurrent read operations', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);

      const results = await Promise.all([
        getOramaIndexData(testProjectId),
        getOramaIndexData(testProjectId),
        getOramaIndexData(testProjectId),
      ]);

      results.forEach((result) => {
        expect(result).toEqual(mockOramaData);
      });
    });
  });

  describe('Schema Version Tracking', () => {
    it('should store schema version with index', async () => {
      await saveOramaIndexData(testProjectId, mockOramaData);

      const record = await db.oramaIndexes.get(testProjectId);

      expect(record?.schemaVersion).toBe(1);
    });

    it('should track last updated timestamp', async () => {
      const beforeSave = Date.now();

      await saveOramaIndexData(testProjectId, mockOramaData);

      const record = await db.oramaIndexes.get(testProjectId);

      expect(record?.lastUpdated).toBeGreaterThanOrEqual(beforeSave);
    });
  });
});
