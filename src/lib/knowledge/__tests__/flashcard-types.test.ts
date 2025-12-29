/**
 * @fileoverview Flashcard Types Tests
 * @module lib/knowledge/__tests__/flashcard-types.test.ts
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  flashcardSchema,
  flashcardGenerationSchema,
  flashcardSetSchema,
  type Flashcard,
  type FlashcardDifficulty,
  type FlashcardSet,
} from '../types';

describe('Flashcard Types and Schemas', () => {
  describe('flashcardSchema', () => {
    it('should validate a valid flashcard', () => {
      const validFlashcard = {
        question: 'What is machine learning?',
        answer: 'Machine learning is a subset of AI that enables systems to learn from data.',
        difficulty: 'easy' as const,
        topic: 'Artificial Intelligence',
        sourceIds: ['src-1', 'src-2'],
      };

      const result = flashcardSchema.safeParse(validFlashcard);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.question).toBe(validFlashcard.question);
        expect(result.data.answer).toBe(validFlashcard.answer);
        expect(result.data.difficulty).toBe('easy');
        expect(result.data.topic).toBe('Artificial Intelligence');
        expect(result.data.sourceIds).toHaveLength(2);
      }
    });

    it('should reject a flashcard without question', () => {
      const invalidFlashcard = {
        answer: 'Machine learning is a subset of AI.',
        difficulty: 'easy' as const,
        topic: 'AI',
        sourceIds: ['src-1'],
      };

      const result = flashcardSchema.safeParse(invalidFlashcard);

      expect(result.success).toBe(false);
    });

    it('should reject a flashcard with invalid difficulty', () => {
      const invalidFlashcard = {
        question: 'What is AI?',
        answer: 'Artificial Intelligence is...',
        difficulty: 'expert' as any, // Invalid difficulty
        topic: 'AI',
        sourceIds: ['src-1'],
      };

      const result = flashcardSchema.safeParse(invalidFlashcard);

      expect(result.success).toBe(false);
    });

    it('should accept all valid difficulty levels', () => {
      const difficulties: FlashcardDifficulty[] = ['easy', 'medium', 'hard'];

      for (const difficulty of difficulties) {
        const flashcard = {
          question: 'Test question',
          answer: 'Test answer',
          difficulty,
          topic: 'Test',
          sourceIds: [],
        };

        const result = flashcardSchema.safeParse(flashcard);
        expect(result.success).toBe(true);
      }
    });

    it('should accept empty sourceIds array', () => {
      const flashcard = {
        question: 'Test question',
        answer: 'Test answer',
        difficulty: 'medium' as const,
        topic: 'Test',
        sourceIds: [],
      };

      const result = flashcardSchema.safeParse(flashcard);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceIds).toHaveLength(0);
      }
    });

    it('should accept long text content', () => {
      const longQuestion = 'A'.repeat(1000);
      const longAnswer = 'B'.repeat(2000);

      const flashcard = {
        question: longQuestion,
        answer: longAnswer,
        difficulty: 'hard' as const,
        topic: 'Long Content',
        sourceIds: ['src-long'],
      };

      const result = flashcardSchema.safeParse(flashcard);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.question.length).toBe(1000);
        expect(result.data.answer.length).toBe(2000);
      }
    });
  });

  describe('flashcardGenerationSchema', () => {
    it('should validate a valid generation result', () => {
      const validGeneration = {
        cards: [
          {
            question: 'What is ML?',
            answer: 'Machine Learning...',
            difficulty: 'easy' as const,
            topic: 'AI',
            sourceIds: ['src-1'],
          },
          {
            question: 'What is Deep Learning?',
            answer: 'Deep Learning is...',
            difficulty: 'medium' as const,
            topic: 'AI',
            sourceIds: ['src-2'],
          },
        ],
        totalCards: 2,
        topics: ['AI'],
        sourcesUsed: ['src-1', 'src-2'],
      };

      const result = flashcardGenerationSchema.safeParse(validGeneration);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cards).toHaveLength(2);
        expect(result.data.totalCards).toBe(2);
        expect(result.data.topics).toHaveLength(1);
        expect(result.data.sourcesUsed).toHaveLength(2);
      }
    });

    it('should validate generation result even when totalCards does not match cards length', () => {
      // Note: This is business logic validation, not schema validation
      // Zod does not automatically validate that totalCards equals cards.length
      const generationWithMismatchedCount = {
        cards: [
          {
            question: 'Test',
            answer: 'Answer',
            difficulty: 'easy' as const,
            topic: 'Test',
            sourceIds: [],
          },
        ],
        totalCards: 5, // Mismatch - but schema accepts this
        topics: ['Test'],
        sourcesUsed: [],
      };

      const result = flashcardGenerationSchema.safeParse(generationWithMismatchedCount);

      // Schema validates structure but not business logic
      expect(result.success).toBe(true);
    });

    it('should accept empty cards array at schema level', () => {
      // Empty cards is valid at schema level
      // Business logic validation should reject empty generations
      const emptyGeneration = {
        cards: [],
        totalCards: 0,
        topics: [],
        sourcesUsed: [],
      };

      const result = flashcardGenerationSchema.safeParse(emptyGeneration);

      // Schema validates structure - empty arrays are valid
      expect(result.success).toBe(true);
    });
  });

  describe('flashcardSetSchema', () => {
    it('should validate a valid flashcard set', () => {
      const validSet = {
        id: 'set-1',
        name: 'AI Fundamentals',
        description: 'Basic AI concepts',
        cardIds: ['fc-1', 'fc-2', 'fc-3'],
        sourceIds: ['src-1'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = flashcardSetSchema.safeParse(validSet);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('set-1');
        expect(result.data.name).toBe('AI Fundamentals');
        expect(result.data.cardIds).toHaveLength(3);
      }
    });

    it('should validate a set without optional description', () => {
      const validSet = {
        id: 'set-2',
        name: 'ML Basics',
        cardIds: ['fc-1'],
        sourceIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = flashcardSetSchema.safeParse(validSet);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should reject a set without required fields', () => {
      const invalidSet = {
        id: 'set-3',
        // Missing name
        cardIds: ['fc-1'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = flashcardSetSchema.safeParse(invalidSet);

      expect(result.success).toBe(false);
    });

    it('should accept empty cardIds and sourceIds', () => {
      const validSet = {
        id: 'set-4',
        name: 'Empty Set',
        cardIds: [],
        sourceIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = flashcardSetSchema.safeParse(validSet);

      expect(result.success).toBe(true);
    });
  });

  describe('TypeScript type inference', () => {
    it('should correctly infer Flashcard type from schema', () => {
      const validFlashcard = {
        question: 'Test question',
        answer: 'Test answer',
        difficulty: 'medium' as const,
        topic: 'Test',
        sourceIds: ['src-1'],
      };

      const parsed = flashcardSchema.parse(validFlashcard);

      // Verify the inferred type matches Flashcard interface structure
      expect(parsed.question).toBeDefined();
      expect(parsed.answer).toBeDefined();
      expect(parsed.difficulty).toBeDefined();
      expect(parsed.topic).toBeDefined();
      expect(parsed.sourceIds).toBeDefined();
    });

    it('should support creating Flashcard instances with generated IDs', () => {
      const now = Date.now();
      const flashcard: Flashcard = {
        id: `fc-${now}-abc123`,
        question: 'Generated question',
        answer: 'Generated answer',
        difficulty: 'hard',
        topic: 'Generated',
        sourceIds: ['src-generated'],
        createdAt: now,
      };

      expect(flashcard.id).toMatch(/^fc-\d+-abc123$/);
      expect(flashcard.createdAt).toBe(now);
    });

    it('should support creating FlashcardSet instances', () => {
      const now = Date.now();
      const set: FlashcardSet = {
        id: 'set-test',
        name: 'Test Set',
        description: 'A test set',
        cardIds: ['fc-1', 'fc-2'],
        sourceIds: ['src-1'],
        createdAt: now,
        updatedAt: now,
      };

      expect(set.id).toBe('set-test');
      expect(set.cardIds).toHaveLength(2);
      expect(set.createdAt).toBe(set.updatedAt);
    });
  });
});
