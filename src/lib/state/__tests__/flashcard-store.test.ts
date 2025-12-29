/**
 * @fileoverview Flashcard Store Tests
 * @module lib/state/__tests__/flashcard-store.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage first - before any imports
const mockLocalStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Create mock Dexie tables - needs to be accessible by mock factory
const mockFlashcardTables = {
  flashcards: {
    get: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue('test-id'),
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue('test-id'),
    bulkAdd: vi.fn().mockResolvedValue(['id-1', 'id-2']),
  },
  flashcardSets: {
    get: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue('test-set-id'),
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue('test-id'),
  },
};

// Mock Dexie class - must be a constructor for extends to work
const { MockDexie } = vi.hoisted(() => {
  class MockDexie {
    version() { return this; }
    stores() { return this; }
    async transaction(_mode: string, _stores: string[], callback: () => Promise<void>) {
      await callback();
    }
    table(name: string) {
      return mockFlashcardTables[name as keyof typeof mockFlashcardTables] || mockFlashcardTables.flashcards;
    }
  }
  return { MockDexie };
});

// Setup Dexie mock - this gets hoisted by vitest
vi.mock('dexie', () => ({
  default: MockDexie,
  Dexie: MockDexie,
}));

// Import after mocking
const {
  useFlashcardStore,
  useFlashcardSetStore,
  generateFlashcardId,
  generateFlashcardSetId,
  FlashcardDatabase,
  getFlashcardDb,
  setFlashcardDbForTesting,
} = await import('../flashcard-store');

describe('Flashcard Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useFlashcardStore.setState({
      flashcards: [],
      activeSetId: null,
    });
    useFlashcardSetStore.setState({
      flashcardSets: [],
      activeSetId: null,
    });
  });

  describe('Flashcard ID Generation', () => {
    it('should generate unique flashcard IDs', () => {
      const id1 = generateFlashcardId();
      const id2 = generateFlashcardId();

      expect(id1).toMatch(/^fc-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^fc-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate unique flashcard set IDs', () => {
      const id1 = generateFlashcardSetId();
      const id2 = generateFlashcardSetId();

      expect(id1).toMatch(/^fcs-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^fcs-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Flashcard Management', () => {
    it('should add a single flashcard', () => {
      const { addFlashcard } = useFlashcardStore.getState();

      const flashcard = {
        id: generateFlashcardId(),
        question: 'What is AI?',
        answer: 'Artificial Intelligence...',
        difficulty: 'easy' as const,
        topic: 'AI',
        sourceIds: ['src-1'],
        createdAt: Date.now(),
      };

      addFlashcard(flashcard);

      const state = useFlashcardStore.getState();
      expect(state.flashcards).toHaveLength(1);
      expect(state.flashcards[0].id).toBe(flashcard.id);
      expect(state.flashcards[0].question).toBe('What is AI?');
    });

    it('should add multiple flashcards at once', () => {
      const { addFlashcards } = useFlashcardStore.getState();

      const flashcards = [
        {
          id: generateFlashcardId(),
          question: 'Q1',
          answer: 'A1',
          difficulty: 'easy' as const,
          topic: 'Topic1',
          sourceIds: ['src-1'],
          createdAt: Date.now(),
        },
        {
          id: generateFlashcardId(),
          question: 'Q2',
          answer: 'A2',
          difficulty: 'medium' as const,
          topic: 'Topic2',
          sourceIds: ['src-2'],
          createdAt: Date.now(),
        },
      ];

      addFlashcards(flashcards);

      const state = useFlashcardStore.getState();
      expect(state.flashcards).toHaveLength(2);
    });

    it('should update a flashcard', () => {
      const { addFlashcard, updateFlashcard } = useFlashcardStore.getState();
      const id = generateFlashcardId();

      addFlashcard({
        id,
        question: 'Original question',
        answer: 'Original answer',
        difficulty: 'easy' as const,
        topic: 'Topic',
        sourceIds: [],
        createdAt: Date.now(),
      });

      updateFlashcard(id, { question: 'Updated question', difficulty: 'hard' as const });

      const state = useFlashcardStore.getState();
      const updated = state.flashcards.find((fc) => fc.id === id);
      expect(updated?.question).toBe('Updated question');
      expect(updated?.difficulty).toBe('hard');
      expect(updated?.answer).toBe('Original answer'); // Unchanged
    });

    it('should delete a flashcard', () => {
      const { addFlashcard, deleteFlashcard } = useFlashcardStore.getState();
      const id = generateFlashcardId();

      addFlashcard({
        id,
        question: 'To delete',
        answer: 'Answer',
        difficulty: 'easy' as const,
        topic: 'Topic',
        sourceIds: [],
        createdAt: Date.now(),
      });

      expect(useFlashcardStore.getState().flashcards).toHaveLength(1);

      deleteFlashcard(id);

      expect(useFlashcardStore.getState().flashcards).toHaveLength(0);
    });

    it('should get flashcard by ID', () => {
      const { addFlashcard, getFlashcardById } = useFlashcardStore.getState();
      const id = generateFlashcardId();

      addFlashcard({
        id,
        question: 'Find me',
        answer: 'Found!',
        difficulty: 'easy' as const,
        topic: 'Topic',
        sourceIds: [],
        createdAt: Date.now(),
      });

      const found = getFlashcardById(id);
      expect(found).toBeDefined();
      expect(found?.question).toBe('Find me');

      const notFound = getFlashcardById('non-existent');
      expect(notFound).toBeUndefined();
    });

    it('should clear all flashcards', () => {
      const { addFlashcards, clearFlashcards } = useFlashcardStore.getState();

      addFlashcards([
        {
          id: generateFlashcardId(),
          question: 'Q1',
          answer: 'A1',
          difficulty: 'easy' as const,
          topic: 'Topic',
          sourceIds: [],
          createdAt: Date.now(),
        },
        {
          id: generateFlashcardId(),
          question: 'Q2',
          answer: 'A2',
          difficulty: 'medium' as const,
          topic: 'Topic',
          sourceIds: [],
          createdAt: Date.now(),
        },
      ]);

      expect(useFlashcardStore.getState().flashcards).toHaveLength(2);

      clearFlashcards();

      expect(useFlashcardStore.getState().flashcards).toHaveLength(0);
    });
  });

  describe('Flashcard Filtering', () => {
    beforeEach(() => {
      const { addFlashcards } = useFlashcardStore.getState();
      addFlashcards([
        {
          id: 'fc-1',
          question: 'What is ML?',
          answer: 'Machine Learning is...',
          difficulty: 'easy' as const,
          topic: 'AI',
          sourceIds: ['src-1'],
          createdAt: Date.now(),
        },
        {
          id: 'fc-2',
          question: 'What is Neural Network?',
          answer: 'Neural Networks are...',
          difficulty: 'medium' as const,
          topic: 'AI',
          sourceIds: ['src-2'],
          createdAt: Date.now(),
        },
        {
          id: 'fc-3',
          question: 'What is SQL?',
          answer: 'SQL is...',
          difficulty: 'hard' as const,
          topic: 'Database',
          sourceIds: ['src-1'],
          createdAt: Date.now(),
        },
      ]);
    });

    it('should filter by topic', () => {
      const { filterFlashcards } = useFlashcardStore.getState();

      const aiCards = filterFlashcards({ topic: 'AI' });

      expect(aiCards).toHaveLength(2);
      expect(aiCards.every((fc) => fc.topic === 'AI')).toBe(true);
    });

    it('should filter by difficulty', () => {
      const { filterFlashcards } = useFlashcardStore.getState();

      const easyCards = filterFlashcards({ difficulty: 'easy' });

      expect(easyCards).toHaveLength(1);
      expect(easyCards[0]?.difficulty).toBe('easy');
    });

    it('should filter by sourceId', () => {
      const { filterFlashcards } = useFlashcardStore.getState();

      const src1Cards = filterFlashcards({ sourceId: 'src-1' });

      expect(src1Cards).toHaveLength(2);
      expect(src1Cards.every((fc) => fc.sourceIds.includes('src-1'))).toBe(true);
    });

    it('should search by question content', () => {
      const { filterFlashcards } = useFlashcardStore.getState();

      const neuralCards = filterFlashcards({ searchQuery: 'Neural' });

      expect(neuralCards).toHaveLength(1);
      expect(neuralCards[0]?.question).toContain('Neural');
    });

    it('should search case-insensitively', () => {
      const { filterFlashcards } = useFlashcardStore.getState();

      const mlCards1 = filterFlashcards({ searchQuery: 'machine learning' });
      const mlCards2 = filterFlashcards({ searchQuery: 'MACHINE LEARNING' });
      const mlCards3 = filterFlashcards({ searchQuery: 'MaChInE lEaRnInG' });

      expect(mlCards1).toHaveLength(1);
      expect(mlCards2).toHaveLength(1);
      expect(mlCards3).toHaveLength(1);
    });

    it('should search by answer content', () => {
      const { filterFlashcards } = useFlashcardStore.getState();

      const dbCards = filterFlashcards({ searchQuery: 'SQL' });

      expect(dbCards).toHaveLength(1);
      expect(dbCards[0]?.topic).toBe('Database');
    });

    it('should apply multiple filters together', () => {
      const { filterFlashcards } = useFlashcardStore.getState();

      const filtered = filterFlashcards({
        topic: 'AI',
        difficulty: 'medium',
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('fc-2');
    });
  });

  describe('Flashcard Set Management', () => {
    it('should create a flashcard set', async () => {
      const { createFlashcardSet } = useFlashcardSetStore.getState();

      const setId = await createFlashcardSet('Test Set', 'A test description', ['src-1']);

      expect(setId).toMatch(/^fcs-\d+-[a-z0-9]+$/);
      const sets = useFlashcardSetStore.getState().flashcardSets;
      expect(sets).toHaveLength(1);
      expect(sets[0].name).toBe('Test Set');
      expect(sets[0].description).toBe('A test description');
      expect(sets[0].sourceIds).toEqual(['src-1']);
    });

    it('should delete a flashcard set', async () => {
      const { createFlashcardSet, deleteFlashcardSet } = useFlashcardSetStore.getState();

      const setId = await createFlashcardSet('To Delete');
      expect(useFlashcardSetStore.getState().flashcardSets).toHaveLength(1);

      await deleteFlashcardSet(setId);

      expect(useFlashcardSetStore.getState().flashcardSets).toHaveLength(0);
      expect(useFlashcardSetStore.getState().flashcardSets.find((s) => s.id === setId)).toBeUndefined();
    });

    it('should rename a flashcard set', async () => {
      const { createFlashcardSet, renameFlashcardSet } = useFlashcardSetStore.getState();

      const setId = await createFlashcardSet('Original Name');
      expect(useFlashcardSetStore.getState().flashcardSets.find((s) => s.id === setId)?.name).toBe('Original Name');

      await renameFlashcardSet(setId, 'New Name');

      expect(useFlashcardSetStore.getState().flashcardSets.find((s) => s.id === setId)?.name).toBe('New Name');
    });

    it('should add cards to a set', async () => {
      const { createFlashcardSet, addCardsToSet } = useFlashcardSetStore.getState();

      const setId = await createFlashcardSet('Test Set');
      const set = useFlashcardSetStore.getState().flashcardSets.find((s) => s.id === setId);

      expect(set?.cardIds).toHaveLength(0);

      await addCardsToSet(setId, ['fc-1', 'fc-2']);

      const updatedSet = useFlashcardSetStore.getState().flashcardSets.find((s) => s.id === setId);
      expect(updatedSet?.cardIds).toHaveLength(2);
      expect(updatedSet?.cardIds).toContain('fc-1');
      expect(updatedSet?.cardIds).toContain('fc-2');
    });

    it('should remove cards from a set', async () => {
      const { createFlashcardSet, addCardsToSet, removeCardsFromSet } = useFlashcardSetStore.getState();

      const setId = await createFlashcardSet('Test Set');
      await addCardsToSet(setId, ['fc-1', 'fc-2', 'fc-3']);

      await removeCardsFromSet(setId, ['fc-2']);

      const updatedSet = useFlashcardSetStore.getState().flashcardSets.find((s) => s.id === setId);
      expect(updatedSet?.cardIds).toHaveLength(2);
      expect(updatedSet?.cardIds).toContain('fc-1');
      expect(updatedSet?.cardIds).toContain('fc-3');
      expect(updatedSet?.cardIds).not.toContain('fc-2');
    });

    it('should get flashcard set by ID', async () => {
      const { createFlashcardSet, getFlashcardSetById } = useFlashcardSetStore.getState();

      await createFlashcardSet('Test Set');

      const sets = useFlashcardSetStore.getState().flashcardSets;
      expect(sets.length).toBeGreaterThan(0);
      const setId = sets[0].id;

      const found = getFlashcardSetById(setId);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Set');

      const notFound = getFlashcardSetById('non-existent');
      expect(notFound).toBeUndefined();
    });
  });

  describe('FlashcardDatabase', () => {
    it('should export KnowledgeCanvasDB class', () => {
      expect(FlashcardDatabase).toBeDefined();
      expect(typeof FlashcardDatabase).toBe('function');
    });

    it('should return singleton instance', () => {
      const db1 = getFlashcardDb();
      const db2 = getFlashcardDb();

      expect(db1).toBe(db2);
    });

    it('should allow setting mock database for testing', () => {
      const mockDb = {} as FlashcardDatabase;
      setFlashcardDbForTesting(mockDb);

      const db = getFlashcardDb();
      expect(db).toBe(mockDb);

      // Reset
      setFlashcardDbForTesting(null);
    });
  });
});
