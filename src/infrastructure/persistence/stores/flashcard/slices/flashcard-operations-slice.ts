/**
 * @fileoverview Flashcard combined operations (cross-store coordination, initialization, cleanup)
 * @module infrastructure/persistence/stores/flashcard/slices/flashcard-operations-slice
 * @governance S-012-b | Phase 2 | API-001-REFACTOR
 */

import type { Flashcard, FlashcardSet } from '@/lib/knowledge/types';
import { getSafeFlashcardDb } from '../flashcard-utils';
import type { FlashcardRecord } from '../flashcard-db';

/**
 * Flashcard operations interface
 * Coordinates between flashcard-store and flashcard-set-store
 */
export interface FlashcardOperations {
  /**
   * Save generated flashcards and create set
   */
  saveGeneratedFlashcards: (cards: Flashcard[], sourceIds: string[]) => Promise<string>;

  /**
   * Initialize all flashcard stores (load from IndexedDB)
   */
  initialize: () => Promise<void>;

  /**
   * Clear all flashcard data (cards + sets)
   */
  clearAll: () => Promise<void>;
}

/**
 * Create flashcard operations (custom hook, not a Zustand slice)
 * This is a separate utility to avoid circular dependencies
 */
export const createFlashcardOperations = (
  flashcardStore: any, // Will be injected from composed store
  flashcardSetStore: any // Will be injected from composed store
): FlashcardOperations => {
  /**
   * Save generated flashcards and create a new set
   */
  const saveGeneratedFlashcards = async (cards: Flashcard[], sourceIds: string[]): Promise<string> => {
    const db = getSafeFlashcardDb();
    if (!db) throw new Error('Database not available');

    // Create a new set with the generated flashcards
    const setId = `fcs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();

    const set: FlashcardSet = {
      id: setId,
      name: `Flashcards ${new Date().toLocaleDateString()}`,
      description: `Generated from ${sourceIds.length} source(s)`,
      cardIds: cards.map((c) => c.id),
      sourceIds,
      createdAt: now,
      updatedAt: now,
    };

    // Save to IndexedDB
    await db.transaction('rw', 'flashcards', 'flashcardSets', async () => {
      const flashcardRecords: FlashcardRecord[] = cards.map((fc) => ({
        id: fc.id,
        question: fc.question,
        answer: fc.answer,
        difficulty: fc.difficulty,
        topic: fc.topic,
        projectId: fc.projectId,
        sourceIds: fc.sourceIds,
        createdAt: fc.createdAt,
      }));
      await db.table('flashcards').bulkAdd(flashcardRecords);
      await db.table('flashcardSets').add(set);
    });

    // Update stores
    flashcardStore.addFlashcards(cards);
    flashcardSetStore.setState((state: any) => ({
      flashcardSets: [...state.flashcardSets, set],
    }));

    return setId;
  };

  /**
   * Initialize all flashcard stores
   */
  const initialize = async () => {
    await Promise.all([
      flashcardStore.loadFlashcards(),
      flashcardSetStore.loadFlashcardSets(),
    ]);
  };

  /**
   * Clear all flashcard data
   */
  const clearAll = async () => {
    const db = getSafeFlashcardDb();
    if (!db) return;
    await db.transaction('rw', 'flashcards', 'flashcardSets', async () => {
      await db.table('flashcards').clear();
      await db.table('flashcardSets').clear();
    });
    flashcardStore.clearFlashcards();
    flashcardSetStore.setState({ flashcardSets: [], activeSetId: null });
  };

  return {
    saveGeneratedFlashcards,
    initialize,
    clearAll,
  };
};