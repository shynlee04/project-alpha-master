/**
 * @file Quiz Types
 * @module lib/study/quiz-types
 * @deprecated This module is archived for MVP
 */

export interface Quiz {
  id: string;
  sourceId: string;
  questions: QuizQuestion[];
  createdAt: Date;
  options?: {
    questionCount?: number;
    includeExplanation?: boolean;
    difficulty?: 'mixed' | 'easy' | 'medium' | 'hard';
  };
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizGenerationResult {
  success: boolean;
  quiz?: Quiz;
  error?: string;
}

export interface QuizResult {
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  completedAt: Date;
  quizTitle?: string;
  totalQuestions?: number;
  correctAnswers?: number;
  percentage?: number;
  timeSpent?: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface QuizHistoryRecord {
  id: string;
  quizId: string;
  projectId: string;
  startedAt: number;
  completedAt?: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
}

export interface QuizSettings {
  questionCount: number;
  includeExplanation: boolean;
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
}

/**
 * Filter options for quiz queries
 */
export interface QuizFilter {
  projectId?: string;
  sourceId?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  searchQuery?: string;
}

export function calculateGrade(): number {
  return 0;
}
