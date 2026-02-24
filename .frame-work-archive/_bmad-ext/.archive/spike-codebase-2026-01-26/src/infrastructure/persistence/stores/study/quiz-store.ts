/**
 * @fileoverview Quiz store stub (deferred Study workspace)
 * @module infrastructure/persistence/stores/study/quiz-store
 * @status DEFERRED - Study workspace is post-MVP
 *
 * This is a stub file that exports empty implementations.
 * The actual quiz functionality will be implemented when
 * the Study workspace epic begins.
 */

import { create } from 'zustand';

/**
 * Quiz state interface (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface QuizState {
  quizzes: never[];
  currentQuiz: null;
  isLoading: boolean;
  error: null;
}

/**
 * Quiz store (stub implementation)
 * @deprecated Study workspace is deferred to post-MVP
 */
export const useQuizStore = create<QuizState>(() => ({
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
}));

/**
 * Initialize quiz store (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export async function initializeQuizStore(): Promise<void> {
  // Stub - no initialization needed
  return Promise.resolve();
}
