/**
 * @fileoverview Knowledge types (stub - DEFERRED)
 * @module lib/knowledge/types
 * @status DEFERRED - Knowledge workspace is post-MVP
 *
 * Provides type definitions for flashcards and knowledge items.
 * Actual implementation will be added when Knowledge workspace epic begins.
 */

// ============================================================
// Flashcard Types
// ============================================================

/**
 * Flashcard entity
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  projectId: string;
  sourceIds: string[];
  createdAt: number;
}

/**
 * Flashcard set entity
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  tags?: string[];
  sourceIds: string[];
  createdAt: number;
  updatedAt: number;
  isAutomatic?: boolean;
}

/**
 * Flashcard filter options
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface FlashcardFilter {
  setId?: string;
  difficulty?: Flashcard['difficulty'];
  tags?: string[];
  dueForReview?: boolean;
  searchQuery?: string;
  topic?: string;
  sourceId?: string;
}

// ============================================================
// Knowledge Item Types
// ============================================================

/**
 * Knowledge item entity
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface KnowledgeItem {
  id: string;
  type: 'document' | 'note' | 'url' | 'pdf' | 'image';
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  projectId: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

/**
 * Knowledge source entity
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface KnowledgeSource {
  id: string;
  type: 'file' | 'url' | 'text';
  uri: string;
  title: string;
  mimeType?: string;
  size?: number;
  processedAt?: number;
}
