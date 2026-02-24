/**
 * @fileoverview Flashcard database initialization (Dexie IndexedDB)
 * @module infrastructure/persistence/stores/flashcard/flashcard-db
 * @governance S-012-b | Phase 1 | API-001-REFACTOR
 */

import Dexie from 'dexie';

/**
 * IndexedDB record types for flashcard persistence
 *
 * **ARC-D02**: Removed workspaceId field - projectId is the single source of truth
 * per ADR-033 Decision D4. Workspace context is derived from projectId.
 */
export interface FlashcardRecord {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Match FlashcardDifficulty from lib/knowledge/types
  topic: string;
  projectId: string;
  sourceIds: string[];
  createdAt: number;
}

export interface FlashcardSetRecord {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  sourceIds: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * FlashcardDatabase class for IndexedDB operations
 * Extends Dexie for type-safe database operations
 *
 * @version 1.0
 * @since 2026-01-05
 */
export class FlashcardDatabase extends Dexie {
  flashcards!: Dexie.Table<FlashcardRecord, string>;
  flashcardSets!: Dexie.Table<FlashcardSetRecord, string>;

  constructor() {
    super('FlashcardDB');
    this.version(1).stores({
      flashcards: 'id, topic, difficulty, createdAt, *sourceIds',
      flashcardSets: 'id, name, createdAt, updatedAt, *cardIds',
    });
  }
}

/**
 * Dexie database instance getter
 * Ensures singleton pattern for IndexedDB access
 *
 * @returns FlashcardDatabase instance
 */
let flashcardDbInstance: FlashcardDatabase | null = null;

export function getFlashcardDb(): FlashcardDatabase {
  if (!flashcardDbInstance) {
    flashcardDbInstance = new FlashcardDatabase();
  }
  return flashcardDbInstance;
}

/**
 * Set database instance for testing
 * Allows mock database injection in test environment
 *
 * @param db - Mock database instance or null to reset
 */
export function setFlashcardDbForTesting(db: FlashcardDatabase | null): void {
  flashcardDbInstance = db;
}