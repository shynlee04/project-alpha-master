/**
 * @fileoverview Quiz Store UI Slice
 * @module infrastructure/persistence/stores/study/quiz/slices/quiz-ui-slice
 */

import type { QuizState } from '../types';
import type { Quiz, QuizQuestion } from '../../../../../../lib/study/quiz-types';

export type QuizUISlice = Pick<QuizState, 'setCurrentQuiz' | 'setCurrentQuestion' | 'clearError'>;

export const createQuizUISlice = (
    set: (partial: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void
): QuizUISlice => ({
    setCurrentQuiz: (quiz: Quiz | null) => {
        set({ currentQuiz: quiz, currentQuestion: null });
    },

    setCurrentQuestion: (question: QuizQuestion | null) => {
        set({ currentQuestion: question });
    },

    clearError: () => {
        set({ error: null });
    },
});
