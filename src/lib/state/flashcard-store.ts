/**
 * @fileoverview Flashcard store with Dexie persistence
 * @module lib/state/flashcard-store
 */

import { create } from 'zustand';
import Dexie from 'dexie';
import type { Flashcard, FlashcardSet, FlashcardFilter, FlashcardDifficulty } from '../knowledge/types';

// ============================================================
// IndexedDB database for flashcard persistence
// ============================================================

interface FlashcardRecord {
  id: string;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

interface FlashcardSetRecord {
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

// Singleton instance - can be replaced for testing
let flashcardDbInstance: FlashcardDatabase | null = null;

export function getFlashcardDb(): FlashcardDatabase {
  if (!flashcardDbInstance) {
    flashcardDbInstance = new FlashcardDatabase();
  }
  return flashcardDbInstance;
}

export function setFlashcardDbForTesting(db: FlashcardDatabase | null): void {
  flashcardDbInstance = db;
}

// For backwards compatibility
const flashcardDb = getFlashcardDb();

// ============================================================
// Flashcard Store with Persistence
// ============================================================

interface FlashcardStoreState {
  // Flashcards
  flashcards: Flashcard[];
  activeSetId: string | null;

  // Actions
  addFlashcard: (flashcard: Flashcard) => void;
  addFlashcards: (flashcards: Flashcard[]) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  getFlashcardById: (id: string) => Flashcard | undefined;
  clearFlashcards: () => void;

  // Filter and search
  filterFlashcards: (filter: FlashcardFilter) => Flashcard[];

  // Persistence
  loadFlashcards: () => Promise<void>;
  saveFlashcards: () => Promise<void>;
}

/**
 * Generate a unique flashcard ID
 */
export function generateFlashcardId(): string {
  return `fc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique flashcard set ID
 */
export function generateFlashcardSetId(): string {
  return `fcs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useFlashcardStore = create<FlashcardStoreState>((set, get) => ({
  flashcards: [],
  activeSetId: null,

  addFlashcard: (flashcard: Flashcard) => {
    set((state) => ({
      flashcards: [...state.flashcards, flashcard],
    }));
  },

  addFlashcards: (newFlashcards: Flashcard[]) => {
    set((state) => ({
      flashcards: [...state.flashcards, ...newFlashcards],
    }));
  },

  updateFlashcard: (id: string, updates: Partial<Flashcard>) => {
    set((state) => ({
      flashcards: state.flashcards.map((fc) =>
        fc.id === id ? { ...fc, ...updates } : fc
      ),
    }));
  },

  deleteFlashcard: (id: string) => {
    set((state) => ({
      flashcards: state.flashcards.filter((fc) => fc.id !== id),
    }));
  },

  getFlashcardById: (id: string) => {
    return get().flashcards.find((fc) => fc.id === id);
  },

  clearFlashcards: () => {
    set({ flashcards: [], activeSetId: null });
  },

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

  loadFlashcards: async () => {
    try {
      const records = await flashcardDb.table('flashcards').toArray();
      const flashcards: Flashcard[] = records.map((record) => ({
        id: record.id,
        question: record.question,
        answer: record.answer,
        difficulty: record.difficulty,
        topic: record.topic,
        sourceIds: record.sourceIds,
        createdAt: record.createdAt,
      }));
      set({ flashcards });
    } catch (error) {
      console.error('Failed to load flashcards:', error);
      set({ flashcards: [] });
    }
  },

  saveFlashcards: async () => {
    try {
      const { flashcards } = get();
      await flashcardDb.transaction('rw', 'flashcards', async () => {
        // Clear existing and bulk add for simplicity
        // For larger datasets, we'd use put() for updates
        await flashcardDb.table('flashcards').clear();
        if (flashcards.length > 0) {
          const records: FlashcardRecord[] = flashcards.map((fc) => ({
            id: fc.id,
            question: fc.question,
            answer: fc.answer,
            difficulty: fc.difficulty,
            topic: fc.topic,
            sourceIds: fc.sourceIds,
            createdAt: fc.createdAt,
          }));
          await flashcardDb.table('flashcards').bulkAdd(records);
        }
      });
    } catch (error) {
      console.error('Failed to save flashcards:', error);
    }
  },
}));

// ============================================================
// Flashcard Set Store
// ============================================================

interface FlashcardSetStoreState {
  // Flashcard sets
  flashcardSets: FlashcardSet[];
  activeSetId: string | null;

  // Actions
  createFlashcardSet: (name: string, description?: string, sourceIds?: string[]) => Promise<string>;
  deleteFlashcardSet: (setId: string) => Promise<void>;
  renameFlashcardSet: (setId: string, name: string) => Promise<void>;
  addCardsToSet: (setId: string, cardIds: string[]) => Promise<void>;
  removeCardsFromSet: (setId: string, cardIds: string[]) => Promise<void>;
  getFlashcardSetById: (setId: string) => FlashcardSet | undefined;
  loadFlashcardSets: () => Promise<void>;

  // Derived getters
  getActiveSet: () => FlashcardSet | undefined;
  getCardsForSet: (setId: string) => Flashcard[];
}

export const useFlashcardSetStore = create<FlashcardSetStoreState>((set, get) => ({
  flashcardSets: [],
  activeSetId: null,

  createFlashcardSet: async (name: string, description?: string, sourceIds: string[] = []) => {
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

    await flashcardDb.transaction('rw', 'flashcardSets', async () => {
      await flashcardDb.table('flashcardSets').add(newSet);
    });

    set((state) => ({
      flashcardSets: [...state.flashcardSets, newSet],
    }));

    return setId;
  },

  deleteFlashcardSet: async (setId: string) => {
    await flashcardDb.transaction('rw', 'flashcardSets', async () => {
      await flashcardDb.table('flashcardSets').delete(setId);
    });

    set((state) => ({
      flashcardSets: state.flashcardSets.filter((s) => s.id !== setId),
      activeSetId: state.activeSetId === setId ? null : state.activeSetId,
    }));
  },

  renameFlashcardSet: async (setId: string, name: string) => {
    await flashcardDb.transaction('rw', 'flashcardSets', async () => {
      await flashcardDb.table('flashcardSets').update(setId, {
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

  addCardsToSet: async (setId: string, cardIds: string[]) => {
    await flashcardDb.transaction('rw', 'flashcardSets', async () => {
      const set = await flashcardDb.table('flashcardSets').get(setId);
      if (set) {
        const existingIds = new Set(set.cardIds);
        const newIds = cardIds.filter((id) => !existingIds.has(id));
        await flashcardDb.table('flashcardSets').update(setId, {
          cardIds: [...set.cardIds, ...newIds],
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

  removeCardsFromSet: async (setId: string, cardIds: string[]) => {
    const cardIdSet = new Set(cardIds);

    await flashcardDb.transaction('rw', 'flashcardSets', async () => {
      const set = await flashcardDb.table('flashcardSets').get(setId);
      if (set) {
        const filteredIds = set.cardIds.filter((id) => !cardIdSet.has(id));
        await flashcardDb.table('flashcardSets').update(setId, {
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

  getFlashcardSetById: (setId: string) => {
    return get().flashcardSets.find((s) => s.id === setId);
  },

  loadFlashcardSets: async () => {
    try {
      const records = await flashcardDb.table('flashcardSets').toArray();
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
      console.error('Failed to load flashcard sets:', error);
      set({ flashcardSets: [] });
    }
  },

  getActiveSet: () => {
    const { activeSetId, flashcardSets } = get();
    if (!activeSetId) return undefined;
    return flashcardSets.find((s) => s.id === activeSetId);
  },

  getCardsForSet: (setId: string) => {
    const { flashcardSets, flashcards } = get();
    const set = flashcardSets.find((s) => s.id === setId);
    if (!set) return [];
    return flashcards.filter((fc) => set.cardIds.includes(fc.id));
  },
}));

// ============================================================
// Combined flashcard operations
// ============================================================

export interface FlashcardOperations {
  // Generate and save flashcards
  saveGeneratedFlashcards: (cards: Flashcard[], sourceIds: string[]) => Promise<string>;

  // Load all data
  initialize: () => Promise<void>;

  // Cleanup
  clearAll: () => Promise<void>;
}

export const useFlashcardOperations = () => {
  const { addFlashcards, clearFlashcards: clearStoreFlashcards } = useFlashcardStore();
  const { loadFlashcardSets } = useFlashcardSetStore();
  const flashcardDb = getFlashcardDb();

  return {
    saveGeneratedFlashcards: async (cards: Flashcard[], sourceIds: string[]): Promise<string> => {
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
      await flashcardDb.transaction('rw', 'flashcards', 'flashcardSets', async () => {
        const flashcardRecords: FlashcardRecord[] = cards.map((fc) => ({
          id: fc.id,
          question: fc.question,
          answer: fc.answer,
          difficulty: fc.difficulty,
          topic: fc.topic,
          sourceIds: fc.sourceIds,
          createdAt: fc.createdAt,
        }));
        await flashcardDb.table('flashcards').bulkAdd(flashcardRecords);
        await flashcardDb.table('flashcardSets').add(set);
      });

      // Update stores
      addFlashcards(cards);
      useFlashcardSetStore.setState((state) => ({
        flashcardSets: [...state.flashcardSets, set],
      }));

      return setId;
    },

    initialize: async () => {
      await Promise.all([
        useFlashcardStore.getState().loadFlashcards(),
        useFlashcardSetStore.getState().loadFlashcardSets(),
      ]);
    },

    clearAll: async () => {
      await flashcardDb.transaction('rw', 'flashcards', 'flashcardSets', async () => {
        await flashcardDb.table('flashcards').clear();
        await flashcardDb.table('flashcardSets').clear();
      });
      clearStoreFlashcards();
      useFlashcardSetStore.setState({ flashcardSets: [], activeSetId: null });
    },
  };
};

// ============================================================
// Initialize stores on module load
// ============================================================

async function initializeFlashcardStores() {
  try {
    await useFlashcardStore.getState().loadFlashcards();
    await useFlashcardSetStore.getState().loadFlashcardSets();
  } catch (error) {
    console.error('Failed to initialize flashcard stores:', error);
  }
}

// Only initialize in browser environment
if (typeof window !== 'undefined') {
  initializeFlashcardStores();
}
