/**
 * @fileoverview Quiz Store Types
 * @module infrastructure/persistence/stores/study/quiz/types
 */

import type { Quiz, QuizQuestion, QuizFilter } from '@/lib/study/quiz-types';

export interface QuizState {
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
