/**
 * @fileoverview Flashcard CRUD operations slice
 * @module infrastructure/persistence/stores/flashcard/slices/flashcard-crud-slice
 * @governance S-012-b | Phase 2 | API-001-REFACTOR
 */

import type { Flashcard } from '@/lib/knowledge/types';
import type { StoreApi } from 'zustand';

/**
 * Flashcard CRUD state and actions
 */
export interface FlashcardCrudState {
  // State
  flashcards: Flashcard[];

  // Actions
  addFlashcard: (flashcard: Flashcard) => void;
  addFlashcards: (flashcards: Flashcard[]) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  getFlashcardById: (id: string) => Flashcard | undefined;
  clearFlashcards: () => void;
}

/**
 * Flashcard store state interface (includes Crud + Filter + Persistence)
 */
export interface FlashcardStoreState extends FlashcardCrudState {
  // Flashcard Sets
  flashcardSets: import('@/lib/knowledge/types').FlashcardSet[];

  activeSetId: string | null;
  filterFlashcards: (filter: import('@/lib/knowledge/types').FlashcardFilter) => Flashcard[];
  loadFlashcards: () => Promise<void>;
  saveFlashcards: () => Promise<void>;
}

/**
 * Create flashcard CRUD slice
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 * @returns Flashcard CRUD actions
 */
export const createFlashcardCrudSlice = (
  set: StoreApi<FlashcardStoreState>['setState'],
  get: StoreApi<FlashcardStoreState>['getState']
): FlashcardCrudState => ({
  flashcards: [],

  /**
   * Add a single flashcard
   */
  addFlashcard: (flashcard: Flashcard) => {
    set((state) => ({
      flashcards: [...state.flashcards, flashcard],
    }));
  },

  /**
   * Add multiple flashcards
   */
  addFlashcards: (newFlashcards: Flashcard[]) => {
    set((state) => ({
      flashcards: [...state.flashcards, ...newFlashcards],
    }));
  },

  /**
   * Update flashcard by ID
   */
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => {
    set((state) => ({
      flashcards: state.flashcards.map((fc) =>
        fc.id === id ? { ...fc, ...updates } : fc
      ),
    }));
  },

  /**
   * Delete flashcard by ID
   */
  deleteFlashcard: (id: string) => {
    set((state) => ({
      flashcards: state.flashcards.filter((fc) => fc.id !== id),
    }));
  },

  /**
   * Get flashcard by ID (synchronous lookup)
   */
  getFlashcardById: (id: string) => {
    return get().flashcards.find((fc) => fc.id === id);
  },

  /**
   * Clear all flashcards
   */
  clearFlashcards: () => {
    set({ flashcards: [], activeSetId: null });
  },
});