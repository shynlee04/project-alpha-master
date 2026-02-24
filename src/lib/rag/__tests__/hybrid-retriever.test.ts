/**
 * @file hybrid-retriever.test.ts
 * @module hybrid-retriever
 * @description Unit tests for hybrid search functionality
 */

import {
  hybridSearch,
  hybridSearchWithEmbedding,
  type HybridSearchConfig,
  type SearchFilters,
  DEFAULT_HYBRID_CONFIG,
} from '../hybrid-retriever';

vi.mock('../orama-index', () => ({
  searchIndex: vi.fn(({ term: _term, limit: _limit, filters: _filters }: { term?: string; limit?: number; filters?: Record<string, unknown> }) => {
    // Simulate full-text search
    const mockFulltextResults = [
      {
        id: 'doc-1',
        title: 'Introduction to TypeScript',
        score: 0.9,
        highlights: ['TypeScript is a typed superset of JavaScript'],
        metadata: { sourceType: 'pdf', tags: ['programming', 'typescript'] },
      },
      {
        id: 'doc-2',
        title: 'JavaScript Best Practices',
        score: 0.8,
        highlights: ['Best practices for JavaScript development'],
        metadata: { sourceType: 'markdown', tags: ['programming', 'javascript'] },
      },
    ];
    return Promise.resolve({ results: mockFulltextResults, count: 2 });
  }),
}));

// Mock embedding service
const mockCreateEmbedding = vi.fn();

vi.mock('../embedding-service', () => ({
  createEmbeddingService: () => ({
    createEmbedding: mockCreateEmbedding,
  }),
}));

describe('HybridRetriever', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('DEFAULT_HYBRID_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_HYBRID_CONFIG.weightVector).toBe(0.7);
      expect(DEFAULT_HYBRID_CONFIG.weightFulltext).toBe(0.3);
      expect(DEFAULT_HYBRID_CONFIG.minScore).toBe(0.1);
      expect(DEFAULT_HYBRID_CONFIG.limit).toBe(10);
    });
  });

  describe('hybridSearch', () => {
    it('should return empty results when no matches found', async () => {
      const results = await hybridSearchWithEmbedding('test-project','nonexistent query', {});
      expect(results).toEqual([]);
    });

    it('should combine vector and fulltext scores with default weights', async () => {
      const results = await hybridSearchWithEmbedding('test-project','TypeScript', {});

      // Should have results from fulltext search
      expect(results.length).toBeGreaterThan(0);

      // First result should be highest scored
      if (results.length >= 2) {
        expect(results[0].combinedScore).toBeGreaterThanOrEqual(
          results[1].combinedScore
        );
      }
    });

    it('should filter results by sourceType', async () => {
      const filters: SearchFilters = {
        sourceType: ['pdf'],
      };

      const results = await hybridSearchWithEmbedding('test-project','TypeScript', filters);

      // All results should have sourceType matching filter
      for (const result of results) {
        expect(filters.sourceType).toContain(result.metadata.sourceType);
      }
    });

    it('should filter results by tags', async () => {
      const filters: SearchFilters = {
        tags: ['programming'],
      };

      const results = await hybridSearchWithEmbedding('test-project','TypeScript', filters);

      // All results should have at least one matching tag
      for (const result of results) {
        const hasMatchingTag = result.metadata.tags?.some((tag: string) =>
          filters.tags?.includes(tag)
        );
        expect(hasMatchingTag).toBe(true);
      }
    });

    it('should filter results by date range', async () => {
      const filters: SearchFilters = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2025-12-31'),
        },
      };

      const results = await hybridSearchWithEmbedding('test-project','TypeScript', filters);

      // Results should be within date range
      for (const result of results) {
        const docDate = new Date(result.metadata.lastModified);
        expect(docDate.getTime()).toBeGreaterThanOrEqual(
          filters.dateRange!.start.getTime()
        );
        expect(docDate.getTime()).toBeLessThanOrEqual(
          filters.dateRange!.end.getTime()
        );
      }
    });

    it('should respect limit parameter', async () => {
      const config: HybridSearchConfig = {
        ...DEFAULT_HYBRID_CONFIG,
        limit: 3,
      };

      const results = await hybridSearchWithEmbedding('test-project','TypeScript', config);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should respect minScore threshold', async () => {
      const config: HybridSearchConfig = {
        ...DEFAULT_HYBRID_CONFIG,
        minScore: 0.5,
      };

      const results = await hybridSearchWithEmbedding('test-project','TypeScript', config);

      for (const result of results) {
        expect(result.combinedScore).toBeGreaterThanOrEqual(0.5);
      }
    });

    it('should apply custom weights', async () => {
      const config: HybridSearchConfig = {
        ...DEFAULT_HYBRID_CONFIG,
        weightVector: 0.2,
        weightFulltext: 0.8,
      };

      const results = await hybridSearchWithEmbedding('test-project','TypeScript', config);

      for (const result of results) {
        // Verify combined score calculation
        const expectedCombined = result.fulltextScore * 0.8 + result.vectorScore * 0.2;
        expect(result.combinedScore).toBeCloseTo(expectedCombined, 5);
      }
    });

    it('should include highlights in results', async () => {
      const results = await hybridSearchWithEmbedding('test-project','TypeScript', {});

      for (const result of results) {
        expect(result.highlights).toBeDefined();
        expect(Array.isArray(result.highlights)).toBe(true);
      }
    });

    it('should handle empty query gracefully', async () => {
      const results = await hybridSearchWithEmbedding('test-project','', {});
      expect(results).toEqual([]);
    });

    it('should handle whitespace-only query', async () => {
      const results = await hybridSearchWithEmbedding('test-project','   ', {});
      expect(results).toEqual([]);
    });
  });

  describe('hybridSearchWithEmbedding', () => {
    const mockEmbedding = new Array(384).fill(0).map((_, i) => 0.1 * (i + 1));

    beforeEach(() => {
      mockCreateEmbedding.mockResolvedValue(mockEmbedding);
    });

    it('should create embedding and perform hybrid search', async () => {
      const results = await hybridSearchWithEmbedding('test query', {});

      expect(mockCreateEmbedding).toHaveBeenCalledWith('test query');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle embedding creation error gracefully', async () => {
      mockCreateEmbedding.mockRejectedValue(new Error('Embedding failed'));

      // Should not throw, return empty results
      const results = await hybridSearchWithEmbedding('test query', {});
      expect(results).toEqual([]);
    });

    it('should pass config to hybrid search', async () => {
      const config: HybridSearchConfig = {
        ...DEFAULT_HYBRID_CONFIG,
        limit: 5,
        weightVector: 0.6,
        weightFulltext: 0.4,
      };

      const results = await hybridSearchWithEmbedding('test query', config);

      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('SearchFilters validation', () => {
    it('should handle undefined filters', async () => {
      const results = await hybridSearchWithEmbedding('test-project','TypeScript', undefined);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle empty filters object', async () => {
      const results = await hybridSearchWithEmbedding('test-project','TypeScript', {});
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle filters with no matching criteria', async () => {
      const filters: SearchFilters = {
        sourceType: ['nonexistent-type'],
        tags: ['nonexistent-tag'],
      };

      const results = await hybridSearchWithEmbedding('test-project','TypeScript', filters);
      expect(results).toEqual([]);
    });
  });

  describe('Result sorting', () => {
    it('should sort results by combined score descending', async () => {
      const results = await hybridSearchWithEmbedding('test-project','TypeScript', {});

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].combinedScore).toBeGreaterThanOrEqual(
          results[i].combinedScore
        );
      }
    });

    it('should break ties using vector score', async () => {
      const results = await hybridSearchWithEmbedding('test-project','TypeScript', {});

      for (let i = 1; i < results.length; i++) {
        if (results[i - 1].combinedScore === results[i].combinedScore) {
          expect(results[i - 1].vectorScore).toBeGreaterThanOrEqual(
            results[i].vectorScore
          );
        }
      }
    });
  });

  describe('Performance', () => {
    it('should complete search within 100ms', async () => {
      const start = performance.now();
      await hybridSearchWithEmbedding('test-project','TypeScript', {});
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('should handle concurrent searches', async () => {
      const promises = [
        hybridSearch('TypeScript', {}),
        hybridSearch('JavaScript', {}),
        hybridSearch('React', {}),
      ];

      const results = await Promise.all(promises);

      expect(results.length).toBe(3);
      for (const result of results) {
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Type definitions', () => {
    it('should have correct HybridSearchResult structure', async () => {
      const results = await hybridSearchWithEmbedding('test-project','TypeScript', {});

      for (const result of results) {
        expect(result).toHaveProperty('documentId');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('combinedScore');
        expect(result).toHaveProperty('vectorScore');
        expect(result).toHaveProperty('fulltextScore');
        expect(result).toHaveProperty('highlights');
        expect(result).toHaveProperty('metadata');

        expect(typeof result.documentId).toBe('string');
        expect(typeof result.title).toBe('string');
        expect(typeof result.combinedScore).toBe('number');
        expect(Array.isArray(result.highlights)).toBe(true);
      }
    });

    it('should have correct HybridSearchConfig structure', () => {
      const config: HybridSearchConfig = {
        weightVector: 0.7,
        weightFulltext: 0.3,
        minScore: 0.1,
        limit: 10,
      };

      expect(config.weightVector).toBe(0.7);
      expect(config.weightFulltext).toBe(0.3);
      expect(config.minScore).toBe(0.1);
      expect(config.limit).toBe(10);
    });
  });
});
