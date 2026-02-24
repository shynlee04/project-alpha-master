/**
 * @fileoverview Quiz store with Dexie persistence and Zustand state management
 * @module infrastructure/persistence/stores/study/quiz-store
 * @governance ADR-024 State Management Consolidation, Epic 53
 *
 * CANONICAL LOCATION for Quiz CRUD operations.
 *
 * Refactored using Slice Pattern (S-012) to eliminate God Store Anti-Pattern.
 *
 * Architecture:
 * - quiz/types.ts (Interfaces)
 * - quiz/quiz-db.ts (Dexie Database)
 * - quiz/slices/quiz-management-slice.ts (Create/Update/Delete Quiz)
 * - quiz/slices/question-management-slice.ts (Add/Update/Delete Question)
 * - quiz/slices/quiz-query-slice.ts (Load/Get/Search/Filter)
 * - quiz/slices/quiz-ui-slice.ts (State selection)
 *
 * @migration-status CANONICAL (Epic 53 Story 53-5)
 * @last-reviewed 2026-01-05
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuizState } from './quiz/types';
import { createQuizManagementSlice } from './quiz/slices/quiz-management-slice';
import { createQuestionManagementSlice } from './quiz/slices/question-management-slice';
import { createQuizQuerySlice } from './quiz/slices/quiz-query-slice';
import { createQuizUISlice } from './quiz/slices/quiz-ui-slice';
// Re-export types
export * from './quiz/types';

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Initial state
      quizzes: [],
      currentQuiz: null,
      currentQuestion: null,
      isLoading: false,
      error: null,

      // Slices
      ...createQuizManagementSlice(set, get),
      ...createQuestionManagementSlice(set, get),
      ...createQuizQuerySlice(set),
      ...createQuizUISlice(set),
    }),
    {
      name: 'quiz-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentQuiz: state.currentQuiz,
      }),
    }
  )
);

/**
 * Initialize quiz store on app start
 */
export async function initializeQuizStore(): Promise<void> {
  const store = useQuizStore.getState();
  await store.loadQuizzes();
}
