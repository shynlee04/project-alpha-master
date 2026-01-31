/**
 * @fileoverview Quiz generator (stub for deferred Study workspace)
 * @module lib/study/quiz-generator
 * @status DEFERRED - Study workspace is post-MVP
 */

import type { Quiz, QuizGenerationOptions } from './quiz-types';

/**
 * Quiz generator result
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface QuizGeneratorResult {
  quiz: Quiz;
  error?: string;
}

/**
 * Generate quiz from content (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export async function generateQuiz(
  _content: string,
  _options: QuizGenerationOptions
): Promise<QuizGeneratorResult> {
  throw new Error('Quiz generation is deferred to post-MVP');
}

/**
 * Quiz generator class (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export class QuizGenerator {
  async generate(_content: string, _options: QuizGenerationOptions): Promise<Quiz> {
    throw new Error('Quiz generation is deferred to post-MVP');
  }
}
