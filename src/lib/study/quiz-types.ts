/**
 * @fileoverview Quiz types and Zod schemas for the Study system
 * @module lib/study/quiz-types
 */

import { z } from 'zod';

/**
 * Difficulty levels for quiz questions
 */
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Question type for quiz
 */
export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'multiple-select';

/**
 * Individual quiz question structure
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

/**
 * Quiz metadata and settings
 */
export interface QuizSettings {
  questionCount: number;
  includeExplanation: boolean;
  difficulty: 'mixed' | QuizDifficulty;
  questionTypes: QuizQuestionType[];
}

/**
 * Complete quiz structure
 */
export interface Quiz {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  sourceIds: string[];
  sourcesUsed: string[];
  settings: QuizSettings;
  createdAt: number;
  updatedAt: number;
}

/**
 * Preview state for generated quizzes before saving
 */
export interface QuizPreview {
  questions: (Omit<QuizQuestion, 'id' | 'createdAt'> & { id?: string; createdAt?: number })[];
  title: string;
  description?: string;
  topics: string[];
  sourcesUsed: string[];
  totalQuestions: number;
}

/**
 * Quiz generation request
 */
export interface QuizGenerationRequest {
  sourceIds: string[];
  options?: {
    questionCount?: number;
    includeExplanation?: boolean;
    difficulty?: 'mixed' | QuizDifficulty;
    questionTypes?: QuizQuestionType[];
  };
}

/**
 * Zod schema for individual quiz question validation
 */
export const quizQuestionSchema = z.object({
  question: z.string().describe('The question text'),
  options: z.array(z.string()).length(4).describe('Array of 4 answer choices'),
  correctIndex: z.number().min(0).max(3).describe('Index of correct answer (0-3)'),
  explanation: z.string().describe('Explanation for why the answer is correct'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level of the question'),
  topic: z.string().describe('Topic or category for this question'),
  sourceIds: z.array(z.string()).describe('Source IDs used for this question'),
});

/**
 * Zod schema for quiz generation response
 */
export const quizGenerationSchema = z.object({
  title: z.string().describe('Title of the quiz'),
  description: z.string().optional().describe('Optional description of the quiz'),
  questions: z.array(quizQuestionSchema).describe('Array of generated quiz questions'),
  totalQuestions: z.number().describe('Total number of questions generated'),
  topics: z.array(z.string()).describe('Unique topics identified in the questions'),
  sourcesUsed: z.array(z.string()).describe('Source IDs referenced in the questions'),
});

/**
 * Type inference from Zod schemas
 */
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
export type QuizGenerationResult = z.infer<typeof quizGenerationSchema>;

/**
 * Quiz filter options
 */
export interface QuizFilter {
  topic?: string;
  difficulty?: QuizDifficulty;
  sourceId?: string;
  searchQuery?: string;
}

/**
 * Dexie store types for IndexedDB persistence
 */
export interface QuizRecord {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  sourceIds: string[];
  settings: QuizSettings;
  createdAt: number;
  updatedAt: number;
}

export interface QuizQuestionRecord {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
  topic: string;
  sourceIds: string[];
  createdAt: number;
}
