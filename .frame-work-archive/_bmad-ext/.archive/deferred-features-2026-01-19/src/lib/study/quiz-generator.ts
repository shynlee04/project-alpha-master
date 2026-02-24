/**
 * @file Quiz Generator
 * @module lib/study/quiz-generator
 * @deprecated This module is archived for MVP
 */

import type { Quiz, QuizGenerationResult, QuizQuestion } from './quiz-types';

export interface QuizGeneratorConfig {
  apiKey?: string;
  mockMode?: boolean;
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

/**
 * Generate a mock quiz for testing purposes
 */
export function generateMockQuiz(sourceId: string, questionCount: number = 5): Quiz {
  const questions: QuizQuestion[] = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      id: `q-${Date.now()}-${i}`,
      text: `Question ${i + 1} (mock)`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: 'This is a mock question for testing.',
    });
  }
  
  return {
    id: `quiz-${Date.now()}`,
    sourceId,
    questions,
    createdAt: new Date(),
    options: {
      questionCount,
      includeExplanation: true,
      difficulty: 'mixed',
    },
  };
}
