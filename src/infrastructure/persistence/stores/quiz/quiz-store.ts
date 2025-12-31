/**
 * @fileoverview Quiz store with Dexie persistence and Zustand state management
 * @module infrastructure/persistence/stores/quiz/quiz-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Quiz, QuizQuestion, QuizFilter } from '@/lib/study/quiz-types';
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  loadAllQuizzes,
} from './quiz-actions';
import {
  addQuestion,
  updateQuestion as updateQuestionAction,
  deleteQuestion as deleteQuestionAction,
} from './quiz-question-actions';
import { filterQuizzes, searchQuizzes } from './quiz-query-actions';

/**
 * Quiz state interface
 */
interface QuizState {
  // Quizzes list
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentQuestion: QuizQuestion | null;
  isLoading: boolean;
  error: string | null;

  // Quiz CRUD operations
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quiz>;
  updateQuiz: (id: string, updates: Partial<Quiz>) => Promise<Quiz | null>;
  deleteQuiz: (id: string) => Promise<boolean>;
  getQuiz: (id: string) => Promise<Quiz | null>;
  loadQuizzes: () => Promise<void>;

  // Current quiz operations
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setCurrentQuestion: (question: QuizQuestion | null) => void;

  // Question operations
  addQuestion: (quizId: string, question: Omit<QuizQuestion, 'id' | 'createdAt'>) => Promise<QuizQuestion | null>;
  updateQuestion: (questionId: string, updates: Partial<QuizQuestion>) => Promise<QuizQuestion | null>;
  deleteQuestion: (quizId: string, questionId: string) => Promise<boolean>;

  // Filter and search
  filterQuizzes: (filter: QuizFilter) => Promise<Quiz[]>;
  searchQuizzes: (query: string) => Promise<Quiz[]>;

  // Utility
  clearError: () => void;
}

/**
 * Zustand quiz store with persistence
 */
export const useQuizStore = create<QuizState>()(
  persist(
    (set, _get) => ({
      // Initial state
      quizzes: [],
      currentQuiz: null,
      currentQuestion: null,
      isLoading: false,
      error: null,

      // Quiz CRUD operations
      createQuiz: async (quizData) => {
        set({ isLoading: true, error: null });
        try {
          const quiz = await createQuiz(quizData);
          set((state) => ({
            quizzes: [...state.quizzes, quiz],
            isLoading: false,
          }));
          return quiz;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create quiz';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateQuiz: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedQuiz = await updateQuiz(id, updates);
          if (!updatedQuiz) {
            set({ isLoading: false, error: 'Quiz not found' });
            return null;
          }
          set((state) => ({
            quizzes: state.quizzes.map((q) => (q.id === id ? updatedQuiz : q)),
            currentQuiz: state.currentQuiz?.id === id ? updatedQuiz : state.currentQuiz,
            isLoading: false,
          }));
          return updatedQuiz;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update quiz';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteQuiz: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const success = await deleteQuiz(id);
          if (!success) {
            set({ isLoading: false, error: 'Failed to delete quiz' });
            return false;
          }
          set((state) => ({
            quizzes: state.quizzes.filter((q) => q.id !== id),
            currentQuiz: state.currentQuiz?.id === id ? null : state.currentQuiz,
            isLoading: false,
          }));
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete quiz';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      getQuiz: async (id) => {
        try {
          const quiz = await getQuiz(id);
          return quiz;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get quiz';
          set({ error: errorMessage });
          return null;
        }
      },

      loadQuizzes: async () => {
        set({ isLoading: true, error: null });
        try {
          const quizzes = await loadAllQuizzes();
          set({ quizzes, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load quizzes';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Current quiz operations
      setCurrentQuiz: (quiz) => {
        set({ currentQuiz: quiz, currentQuestion: null });
      },

      setCurrentQuestion: (question) => {
        set({ currentQuestion: question });
      },

      // Question operations
      addQuestion: async (quizId, questionData) => {
        set({ isLoading: true, error: null });
        try {
          const question = await addQuestion(quizId, questionData);
          set((state) => ({
            quizzes: state.quizzes.map((q) => {
              if (q.id === quizId) {
                return {
                  ...q,
                  questions: [...q.questions, question],
                  updatedAt: Date.now(),
                };
              }
              return q;
            }),
            currentQuiz:
              state.currentQuiz?.id === quizId
                ? {
                    ...state.currentQuiz,
                    questions: [...state.currentQuiz.questions, question],
                    updatedAt: Date.now(),
                  }
                : state.currentQuiz,
            isLoading: false,
          }));
          return question;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add question';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateQuestion: async (questionId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedQuestion = await updateQuestionAction(questionId, updates);
          if (!updatedQuestion) {
            set({ isLoading: false, error: 'Question not found' });
            return null;
          }
          set((state) => ({
            quizzes: state.quizzes.map((q) => ({
              ...q,
              questions: q.questions.map((qq) =>
                qq.id === questionId ? updatedQuestion : qq
              ),
            })),
            currentQuiz: state.currentQuiz
              ? {
                  ...state.currentQuiz,
                  questions: state.currentQuiz.questions.map((qq) =>
                    qq.id === questionId ? updatedQuestion : qq
                  ),
                }
              : null,
            isLoading: false,
          }));
          return updatedQuestion;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update question';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteQuestion: async (quizId, questionId) => {
        set({ isLoading: true, error: null });
        try {
          const success = await deleteQuestionAction(quizId, questionId);
          if (!success) {
            set({ isLoading: false, error: 'Failed to delete question' });
            return false;
          }
          set((state) => ({
            quizzes: state.quizzes.map((q) => {
              if (q.id === quizId) {
                return {
                  ...q,
                  questions: q.questions.filter((qq) => qq.id !== questionId),
                };
              }
              return q;
            }),
            currentQuiz:
              state.currentQuiz?.id === quizId
                ? {
                    ...state.currentQuiz,
                    questions: state.currentQuiz.questions.filter((qq) => qq.id !== questionId),
                  }
                : state.currentQuiz,
            isLoading: false,
          }));
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete question';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Filter and search
      filterQuizzes: async (filter) => {
        try {
          return await filterQuizzes(filter);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to filter quizzes';
          set({ error: errorMessage });
          return [];
        }
      },

      searchQuizzes: async (query) => {
        try {
          return await searchQuizzes(query);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to search quizzes';
          set({ error: errorMessage });
          return [];
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
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
