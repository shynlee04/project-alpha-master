/**
 * @file Stub for archived study module
 * @deprecated This module is archived for MVP
 */

export interface QuizGeneratorConfig {
  apiKey?: string;
  mockMode?: boolean;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  sourceId: string;
  createdAt: Date;
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

export function createQuizGenerator(config?: QuizGeneratorConfig): { generateMockQuiz: () => null } {
  return {
    generateMockQuiz: () => null,
  };
}

export function generateQuiz(): QuizGenerationResult {
  return {
    success: false,
    error: 'Study module archived - quiz generation not available in MVP',
  };
}
