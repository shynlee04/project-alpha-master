/**
 * @fileoverview Flashcard filter and search operations slice
 * @module infrastructure/persistence/stores/flashcard/slices/flashcard-filter-slice
 * @governance S-012-b | Phase 2 | API-001-REFACTOR
 */

import type { Flashcard, FlashcardFilter } from '@/lib/knowledge/types';
import type { StoreApi } from 'zustand';
import type { FlashcardStoreState } from './flashcard-crud-slice';

export interface FlashcardFilterState {
  filterFlashcards: (filter: FlashcardFilter) => Flashcard[];
}

/**
 * Create flashcard filter slice
 *
 * @param get - Zustand getState function
 * @returns Flashcard filter action
 */
export const createFlashcardFilterSlice = (
  get: StoreApi<FlashcardStoreState>['getState']
): FlashcardFilterState => ({
  /**
   * Filter flashcards by topic, difficulty, sourceId, or search query
   */
  filterFlashcards: (filter: FlashcardFilter): Flashcard[] => {
    const { flashcards } = get();

    return flashcards.filter((fc) => {
      // Filter by topic
      if (filter.topic && fc.topic !== filter.topic) {
        return false;
      }

      // Filter by difficulty
      if (filter.difficulty && fc.difficulty !== filter.difficulty) {
        return false;
      }

      // Filter by sourceId
      if (filter.sourceId && !fc.sourceIds.includes(filter.sourceId)) {
        return false;
      }

      // Search query (case-insensitive)
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const questionMatch = fc.question.toLowerCase().includes(query);
        const answerMatch = fc.answer.toLowerCase().includes(query);
        const topicMatch = fc.topic.toLowerCase().includes(query);
        if (!questionMatch && !answerMatch && !topicMatch) {
          return false;
        }
      }

      return true;
    });
  },
});