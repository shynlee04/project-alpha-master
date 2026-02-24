/**
 * @fileoverview Quiz history store with Dexie persistence
 * @module lib/state/quiz-history-store
 */

import Dexie, { type Table } from 'dexie';
import { create } from 'zustand';
import type { QuizResult } from '@/lib/study/quiz-session';
import type { QuizHistoryRecord } from '@/lib/study/quiz-session';

/**
 * Dexie database for quiz history
 */
class QuizHistoryDatabase extends Dexie {
  quizHistory!: Table<QuizHistoryRecord>;

  constructor() {
    super('ProjectAlphaQuizHistoryDB');
    this.version(1).stores({
      quizHistory: 'id, quizId, completedAt, percentage',
    });
  }
}

// Lazy initialization
let db: QuizHistoryDatabase | null = null;

function getDB(): QuizHistoryDatabase {
  if (!db) {
    db = new QuizHistoryDatabase();
  }
  return db;
}

/**
 * Quiz history state interface
 */
export interface QuizHistoryState {
  history: QuizHistoryRecord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addResult: (result: QuizResult) => Promise<void>;
  getHistory: () => Promise<QuizHistoryRecord[]>;
  getHistoryByQuiz: (quizId: string) => Promise<QuizHistoryRecord[]>;
  getBestScore: (quizId: string) => Promise<QuizHistoryRecord | null>;
  clearHistory: () => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Quiz history store with Dexie persistence
 */
export const useQuizHistoryStore = create<QuizHistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  // Add a quiz result to history
  addResult: async (result: QuizResult) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDB();
      const record: QuizHistoryRecord = {
        id: `qh-${result.completedAt}-${Math.random().toString(36).substring(2, 9)}`,
        quizId: result.quizId,
        quizTitle: result.quizTitle,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        percentage: result.percentage,
        timeSpent: result.timeSpent,
        completedAt: result.completedAt,
      };

      await db.quizHistory.put(record);

      set((state) => ({
        history: [record, ...state.history],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save quiz result';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Get all history
  getHistory: async () => {
    try {
      const db = getDB();
      const records = await db.quizHistory.orderBy('completedAt').reverse().toArray();
      set({ history: records });
      return records;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load history';
      set({ error: errorMessage });
      return [];
    }
  },

  // Get history for specific quiz
  getHistoryByQuiz: async (quizId: string) => {
    try {
      const db = getDB();
      const records = await db.quizHistory
        .where('quizId')
        .equals(quizId)
        .sortBy('completedAt');
      return records.reverse();
    } catch (error) {
      return [];
    }
  },

  // Get best score for quiz
  getBestScore: async (quizId: string) => {
    try {
      const db = getDB();
      const records = await db.quizHistory
        .where('quizId')
        .equals(quizId)
        .toArray();
      if (records.length === 0) return null;
      return records.reduce((best, current) =>
        current.percentage > best.percentage ? current : best
      );
    } catch (error) {
      return null;
    }
  },

  // Clear all history
  clearHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDB();
      await db.quizHistory.clear();
      set({ history: [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear history';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Delete single history entry
  deleteHistory: async (id: string) => {
    try {
      const db = getDB();
      await db.quizHistory.delete(id);
      set((state) => ({
        history: state.history.filter((h) => h.id !== id),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete entry';
      set({ error: errorMessage });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Initialize quiz history store
 */
export async function initializeQuizHistoryStore(): Promise<void> {
  await useQuizHistoryStore.getState().getHistory();
}

/**
 * Hook for quiz history with stats
 */
export function useQuizHistory() {
  const store = useQuizHistoryStore();

  return {
    history: store.history,
    isLoading: store.isLoading,
    error: store.error,
    totalQuizzes: store.history.length,
    averageScore:
      store.history.length > 0
        ? store.history.reduce((sum, h) => sum + h.percentage, 0) / store.history.length
        : 0,
    addResult: store.addResult,
    getHistory: store.getHistory,
    getHistoryByQuiz: store.getHistoryByQuiz,
    getBestScore: store.getBestScore,
    clearHistory: store.clearHistory,
    deleteHistory: store.deleteHistory,
    clearError: store.clearError,
  };
}
