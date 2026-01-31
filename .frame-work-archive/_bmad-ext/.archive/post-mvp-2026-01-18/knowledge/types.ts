/**
 * @fileoverview Knowledge module types
 * @module lib/knowledge/types
 *
 * **DEFERRED - Post-MVP Archive**
 * See: _bmad-ext/.archive/post-mvp-2026-01-18/DEFER-log.md
 */

// Core types for the knowledge workspace
export interface KnowledgeSource {
  id: string;
  type: 'pdf' | 'url' | 'note' | 'document';
  title: string;
  content: string;
  metadata: {
    sourceUrl?: string;
    importedAt: Date;
    lastAccessed?: Date;
    wordCount: number;
    readingTime: number;
  };
  tags: string[];
  subjects: string[];
}

export interface KnowledgeVault {
  id: string;
  name: string;
  sources: KnowledgeSource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeSearchResult {
  source: KnowledgeSource;
  relevanceScore: number;
  highlights: string[];
  matchedTerms: string[];
}

export interface KnowledgeQuery {
  query: string;
  filters?: {
    tags?: string[];
    subjects?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  limit?: number;
}
