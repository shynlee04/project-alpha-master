/**
 * @fileoverview Flashcard persistence operations slice (IndexedDB load/save)
 * @module infrastructure/persistence/stores/flashcard/slices/flashcard-persistence-slice
 * @governance S-012-b | Phase 2 | API-001-REFACTOR
 */

import type { Flashcard, FlashcardSet } from '@/lib/knowledge/types';
import type { StoreApi } from 'zustand';
import type { FlashcardStoreState } from './flashcard-crud-slice';
import { getSafeFlashcardDb } from '../flashcard-utils';
import type { FlashcardRecord, FlashcardSetRecord } from '../flashcard-db';

export interface FlashcardPersistenceState {
  loadFlashcards: () => Promise<void>;
  saveFlashcards: () => Promise<void>;
}

export interface FlashcardSetPersistenceState {
  loadFlashcardSets: () => Promise<void>;
}

/**
 * Create flashcard persistence slice for cards
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 * @returns Flashcard persistence actions
 */
export const createFlashcardPersistenceSlice = (
  set: StoreApi<FlashcardStoreState>['setState'],
  get: StoreApi<FlashcardStoreState>['getState']
): FlashcardPersistenceState => ({
  /**
   * Load flashcards from IndexedDB
   */
  loadFlashcards: async () => {
    try {
      const db = getSafeFlashcardDb();
      if (!db) {
        set({ flashcards: [] });
        return;
      }
      const records = await db.table('flashcards').toArray();
      const flashcards: Flashcard[] = records.map((record) => ({
        id: record.id,
        question: record.question,
        answer: record.answer,
        difficulty: record.difficulty,
        topic: record.topic,
        projectId: record.projectId,
        sourceIds: record.sourceIds,
        createdAt: record.createdAt,
      }));
      set({ flashcards });
    } catch (error) {
      console.error('[flashcard-store] Failed to load flashcards:', error);
      set({ flashcards: [] });
    }
  },

  /**
   * Save flashcards to IndexedDB
   */
  saveFlashcards: async () => {
    try {
      const db = getSafeFlashcardDb();
      if (!db) return;
      const { flashcards } = get();
      await db.transaction('rw', 'flashcards', async () => {
        await db.table('flashcards').clear();
        if (flashcards.length > 0) {
          const records: FlashcardRecord[] = flashcards.map((fc) => ({
            id: fc.id,
            question: fc.question,
            answer: fc.answer,
            difficulty: fc.difficulty,
            topic: fc.topic,
            projectId: fc.projectId,
            sourceIds: fc.sourceIds,
            createdAt: fc.createdAt,
          }));
          await db.table('flashcards').bulkAdd(records);
        }
      });
    } catch (error) {
      console.error('[flashcard-store] Failed to save flashcards:', error);
    }
  },
});

/**
 * Create flashcard set persistence slice
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 * @returns Flashcard set persistence action
 */
export const createFlashcardSetPersistenceSlice = (
  set: StoreApi<FlashcardSetStoreState>['setState'],
  get: StoreApi<FlashcardSetStoreState>['getState']
): FlashcardSetPersistenceState => ({
  /**
   * Load flashcard sets from IndexedDB
   */
  loadFlashcardSets: async () => {
    try {
      const db = getSafeFlashcardDb();
      if (!db) {
        set({ flashcardSets: [] });
        return;
      }
      const records = await db.table('flashcardSets').toArray();
      const flashcardSets: FlashcardSet[] = records.map((record) => ({
        id: record.id,
        name: record.name,
        description: record.description,
        cardIds: record.cardIds,
        sourceIds: record.sourceIds,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }));
      set({ flashcardSets });
    } catch (error) {
      console.error('[flashcard-set-store] Failed to load flashcard sets:', error);
      set({ flashcardSets: [] });
    }
  },
});