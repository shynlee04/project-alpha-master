/**
 * @fileoverview Flashcard Set CRUD operations slice
 * @module infrastructure/persistence/stores/flashcard/slices/flashcard-set-crud-slice
 * @governance S-012-b | Phase 2 | API-001-REFACTOR
 */

import type { FlashcardSet } from '@/lib/knowledge/types';
import type { StoreApi } from 'zustand';
import { getSafeFlashcardDb } from '../flashcard-utils';
import { generateFlashcardSetId } from '../flashcard-utils';

export interface FlashcardSetCrudState {
  // State
  flashcardSets: FlashcardSet[];
  activeSetId: string | null;

  // CRUD Actions
  createFlashcardSet: (name: string, description?: string, sourceIds?: string[]) => Promise<string>;
  deleteFlashcardSet: (setId: string) => Promise<void>;
  renameFlashcardSet: (setId: string, name: string) => Promise<void>;
  getFlashcardSetById: (setId: string) => FlashcardSet | undefined;

  // Card-to-set operations
  addCardsToSet: (setId: string, cardIds: string[]) => Promise<void>;
  removeCardsFromSet: (setId: string, cardIds: string[]) => Promise<void>;

  // Derived getters
  getActiveSet: () => FlashcardSet | undefined;
  getCardsForSet: (setId: string) => import('@/lib/knowledge/types').Flashcard[];
}

export interface FlashcardSetStoreState extends FlashcardSetCrudState {
  loadFlashcardSets: () => Promise<void>;
}

/**
 * Create flashcard set CRUD slice
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 * @returns Flashcard set CRUD actions
 */
export const createFlashcardSetCrudSlice = (
  set: StoreApi<FlashcardSetStoreState>['setState'],
  get: StoreApi<FlashcardSetStoreState>['getState']
): FlashcardSetCrudState => ({
  flashcardSets: [],
  activeSetId: null,

  /**
   * Create new flashcard set
   */
  createFlashcardSet: async (name: string, description?: string, sourceIds: string[] = []) => {
    const db = getSafeFlashcardDb();
    if (!db) throw new Error('Database not available');
    const setId = generateFlashcardSetId();
    const now = Date.now();

    const newSet: FlashcardSet = {
      id: setId,
      name,
      description,
      cardIds: [],
      sourceIds,
      createdAt: now,
      updatedAt: now,
    };

    await db.transaction('rw', 'flashcardSets', async () => {
      await db.table('flashcardSets').add(newSet);
    });

    set((state) => ({
      flashcardSets: [...state.flashcardSets, newSet],
    }));

    return setId;
  },

  /**
   * Delete flashcard set by ID
   */
  deleteFlashcardSet: async (setId: string) => {
    const db = getSafeFlashcardDb();
    if (!db) return;
    await db.transaction('rw', 'flashcardSets', async () => {
      await db.table('flashcardSets').delete(setId);
    });

    set((state) => ({
      flashcardSets: state.flashcardSets.filter((s) => s.id !== setId),
      activeSetId: state.activeSetId === setId ? null : state.activeSetId,
    }));
  },

  /**
   * Rename flashcard set
   */
  renameFlashcardSet: async (setId: string, name: string) => {
    const db = getSafeFlashcardDb();
    if (!db) return;
    await db.transaction('rw', 'flashcardSets', async () => {
      await db.table('flashcardSets').update(setId, {
        name,
        updatedAt: Date.now(),
      });
    });

    set((state) => ({
      flashcardSets: state.flashcardSets.map((s) =>
        s.id === setId ? { ...s, name, updatedAt: Date.now() } : s
      ),
    }));
  },

  /**
   * Add cards to flashcard set
   */
  addCardsToSet: async (setId: string, cardIds: string[]) => {
    const db = getSafeFlashcardDb();
    if (!db) return;
    await db.transaction('rw', 'flashcardSets', async () => {
      const setRecord = await db.table('flashcardSets').get(setId);
      if (setRecord) {
        const existingIds = new Set(setRecord.cardIds);
        const newIds = cardIds.filter((id) => !existingIds.has(id));
        await db.table('flashcardSets').update(setId, {
          cardIds: [...setRecord.cardIds, ...newIds],
          updatedAt: Date.now(),
        });
      }
    });

    set((state) => ({
      flashcardSets: state.flashcardSets.map((s) =>
        s.id === setId
          ? {
            ...s,
            cardIds: [...new Set([...s.cardIds, ...cardIds])],
            updatedAt: Date.now(),
          }
          : s
      ),
    }));
  },

  /**
   * Remove cards from flashcard set
   */
  removeCardsFromSet: async (setId: string, cardIds: string[]) => {
    const db = getSafeFlashcardDb();
    if (!db) return;
    const cardIdSet = new Set(cardIds);

    await db.transaction('rw', 'flashcardSets', async () => {
      const setRecord = await db.table('flashcardSets').get(setId);
      if (setRecord) {
        const filteredIds = setRecord.cardIds.filter((id: string) => !cardIdSet.has(id));
        await db.table('flashcardSets').update(setId, {
          cardIds: filteredIds,
          updatedAt: Date.now(),
        });
      }
    });

    set((state) => ({
      flashcardSets: state.flashcardSets.map((s) =>
        s.id === setId
          ? {
            ...s,
            cardIds: s.cardIds.filter((id) => !cardIdSet.has(id)),
            updatedAt: Date.now(),
          }
          : s
      ),
    }));
  },

  /**
   * Get flashcard set by ID
   */
  getFlashcardSetById: (setId: string) => {
    return get().flashcardSets.find((s) => s.id === setId);
  },

  /**
   * Get active flashcard set
   */
  getActiveSet: () => {
    const { activeSetId, flashcardSets } = get();
    if (!activeSetId) return undefined;
    return flashcardSets.find((s) => s.id === activeSetId);
  },

  /**
   * Get cards for a specific flashcard set
   * Cross-store coordination with flashcardStore
   * 
   * NOTE: This is a synchronous getter that returns empty array initially.
   * For proper cross-store access, use the helper function getCardsForSet 
   * exported from the index.ts file.
   */
  getCardsForSet: (setId: string) => {
    const { flashcardSets } = get();
    const set = flashcardSets.find((s) => s.id === setId);
    if (!set) return [];

    // To avoid circular dependency, we return an empty array here.
    // The actual cross-store coordination is handled by the 
    // getCardsForSet helper function in the index.ts file.
    // Components should use that helper instead.
    console.warn('[flashcard-set-crud-slice] getCardsForSet called directly - use getCardsForSet from index.ts instead');
    return [];
  },
});