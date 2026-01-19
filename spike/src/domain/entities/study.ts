/**
 * Study Domain Entities - Domain Layer
 *
 * Core business entities representing Study and Spaced Repetition structures.
 * Aligned with Clean Architecture principles - pure domain logic with no infrastructure dependencies.
 *
 * @layer Domain
 * @module core/entities
 */

/**
 * Flashcard - Domain Entity
 *
 * Represents a single flashcard for spaced repetition learning.
 *
 * Business rules:
 * - Card must belong to a deck (or collection)
 * - Includes Spaced Repetition System (SRS) metadata (nextReview, interval, easeFactor)
 */
export interface Flashcard {
  /** Unique identifier */
  id: string;
  /** Deck or collection ID */
  deckId: string;
  /** Front content (question) */
  front: string;
  /** Back content (answer) */
  back: string;
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Learning status */
  status: 'new' | 'learning' | 'review' | 'relearning';
  /** Next review timestamp */
  nextReview?: Date;
  /** Interval in days */
  interval: number;
  /** Ease factor (multiplier) */
  easeFactor: number;
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
}

/**
 * Quiz Question - Value Object
 *
 * Represents a single question within a quiz.
 */
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

/**
 * Quiz - Domain Entity
 *
 * Represents a collection of questions for assessment.
 *
 * Business rules:
 * - Quiz contains ordered list of questions
 */
export interface Quiz {
  /** Unique identifier */
  id: string;
  /** Quiz title */
  title: string;
  /** List of questions */
  questions: QuizQuestion[];
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
}

/**
 * Study Session - Domain Entity
 *
 * Represents a completed learning session.
 *
 * Business rules:
 * - Tracks duration and performance
 */
export interface StudySession {
  /** Unique identifier */
  id: string;
  /** Session type */
  type: 'flashcard' | 'quiz';
  /** Start timestamp */
  startTime: Date;
  /** End timestamp */
  endTime: Date;
  /** Number of items reviewed */
  itemsReviewed: number;
  /** Score or accuracy (0.0 - 1.0) */
  score: number;
  /** Custom metadata */
  metadata: Record<string, unknown>;
}

// --- Create Params ---

/**
 * Flashcard creation parameters
 * Excludes auto-generated fields: id, created, updated, status (defaults to new), SRS fields (defaults)
 */
export type FlashcardCreateParams = Omit<
  Flashcard,
  | 'id'
  | 'created'
  | 'updated'
  | 'status'
  | 'nextReview'
  | 'interval'
  | 'easeFactor'
>;

/**
 * Quiz creation parameters
 * Excludes auto-generated fields: id, created, updated
 */
export type QuizCreateParams = Omit<Quiz, 'id' | 'created' | 'updated'>;

/**
 * StudySession creation parameters
 * Excludes auto-generated fields: id
 */
export type StudySessionCreateParams = Omit<StudySession, 'id'>;

// --- Update Params ---

/**
 * Flashcard update parameters
 * All fields optional except id
 */
export type FlashcardUpdateParams = Partial<Omit<Flashcard, 'id'>> & {
  id: string;
};

/**
 * Quiz update parameters
 * All fields optional except id
 */
export type QuizUpdateParams = Partial<Omit<Quiz, 'id'>> & { id: string };

/**
 * StudySession update parameters
 * All fields optional except id
 */
export type StudySessionUpdateParams = Partial<Omit<StudySession, 'id'>> & {
  id: string;
};
