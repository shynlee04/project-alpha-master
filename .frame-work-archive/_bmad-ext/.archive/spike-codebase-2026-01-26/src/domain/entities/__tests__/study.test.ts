import { describe, it, expect } from 'vitest';
import type {
  Flashcard,
  Quiz,
  StudySession,
  FlashcardCreateParams,
  QuizCreateParams,
  StudySessionCreateParams,
  FlashcardUpdateParams,
  QuizUpdateParams,
  StudySessionUpdateParams,
} from '../study';

describe('Study Domain Entities', () => {
  describe('Flashcard', () => {
    it('should define a valid Flashcard structure', () => {
      const card: Flashcard = {
        id: 'card-123',
        deckId: 'deck-001',
        front: 'Question?',
        back: 'Answer.',
        metadata: { tag: 'hard' },
        status: 'learning',
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.5,
        created: new Date(),
        updated: new Date(),
      };

      expect(card.id).toBe('card-123');
      expect(card.status).toBe('learning');
      expect(card.easeFactor).toBe(2.5);
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: FlashcardCreateParams = {
        deckId: 'deck-001',
        front: 'Q',
        back: 'A',
        metadata: {},
      };

      expect(params.front).toBe('Q');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
      // @ts-expect-error - status should not be in CreateParams
      expect(params.status).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: FlashcardUpdateParams = {
        id: 'card-123',
        status: 'review',
        easeFactor: 2.6,
      };

      expect(update.id).toBe('card-123');
      expect(update.status).toBe('review');
    });
  });

  describe('Quiz', () => {
    it('should define a valid Quiz structure', () => {
      const quiz: Quiz = {
        id: 'quiz-456',
        title: 'Unit 1 Test',
        questions: [
          {
            id: 'q1',
            text: 'Is this a test?',
            options: ['Yes', 'No'],
            correctOptionIndex: 0,
          },
        ],
        metadata: {},
        created: new Date(),
        updated: new Date(),
      };

      expect(quiz.id).toBe('quiz-456');
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].correctOptionIndex).toBe(0);
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: QuizCreateParams = {
        title: 'New Quiz',
        questions: [],
        metadata: {},
      };

      expect(params.title).toBe('New Quiz');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: QuizUpdateParams = {
        id: 'quiz-456',
        title: 'Updated Quiz',
      };

      expect(update.id).toBe('quiz-456');
      expect(update.title).toBe('Updated Quiz');
    });
  });

  describe('StudySession', () => {
    it('should define a valid StudySession structure', () => {
      const session: StudySession = {
        id: 'sess-789',
        type: 'flashcard',
        startTime: new Date(),
        endTime: new Date(),
        itemsReviewed: 10,
        score: 0.9,
        metadata: {},
      };

      expect(session.id).toBe('sess-789');
      expect(session.type).toBe('flashcard');
      expect(session.score).toBe(0.9);
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: StudySessionCreateParams = {
        type: 'quiz',
        startTime: new Date(),
        endTime: new Date(),
        itemsReviewed: 5,
        score: 1.0,
        metadata: {},
      };

      expect(params.type).toBe('quiz');
      // @ts-expect-error - id should not be in CreateParams
      expect(params.id).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: StudySessionUpdateParams = {
        id: 'sess-789',
        score: 0.95,
      };

      expect(update.id).toBe('sess-789');
      expect(update.score).toBe(0.95);
    });
  });
});
