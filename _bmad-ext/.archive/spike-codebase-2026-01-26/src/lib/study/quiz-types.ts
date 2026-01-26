/**
 * @fileoverview Quiz types (stub for deferred Study workspace)
 * @module lib/study/quiz-types
 * @status DEFERRED - Study workspace is post-MVP
 */

/**
 * Quiz question type
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

/**
 * Quiz type
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Quiz generation options
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface QuizGenerationOptions {
  topic: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * SRS item type for spaced repetition
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface SRSItem {
  id: string;
  content: string;
  interval: number;
  easeFactor: number;
  nextReviewDate: number;
  lastReviewDate: number;
  reviewCount: number;
}

/**
 * Card rating enum for SRS
 * @deprecated Study workspace is deferred to post-MVP
 */
export type CardRating = 0 | 1 | 2 | 3 | 4 | 5;
