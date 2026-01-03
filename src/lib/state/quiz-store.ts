/**
 * @fileoverview Quiz store with Dexie persistence and Zustand state management
 * @module lib/state/quiz-store
 * 
 * @deprecated This store uses a separate Dexie database (ProjectAlphaQuizDB).
 * Future migrations should move quiz functionality to:
 * `@/infrastructure/persistence/stores/quiz/` using the unified ViaGentDatabase.
 * 
 * NOTE: This store handles Quiz CRUD operations (create, update, delete quizzes).
 * It is COMPLEMENTARY to study-store.ts which handles:
 * - Study sessions (SRS/Spaced Repetition System)
 * - Flashcard progress tracking
 * - Session statistics
 * 
 * Do NOT merge quiz-store into study-store - they serve different purposes.
 * 
 * @consumers
 * - src/infrastructure/persistence/stores/index.ts (barrel export)
 * - src/presentation/components/study/StudyPage.tsx
 * - src/presentation/components/notes/NoteStudyMenu.tsx
 * - src/presentation/components/knowledge/QuizPreviewPanel.tsx
 * 
 * @migration-status LEGACY (Epic 51 Platform Unification)
 * @last-reviewed 2026-01-03
 */

import Dexie, { type Table } from 'dexie';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Quiz, QuizQuestion, QuizFilter, QuizSettings } from '../study/quiz-types';

/**
 * Dexie database for quiz persistence
 */
class QuizDatabase extends Dexie {
  quizzes!: Table<QuizRecord>;
  quizQuestions!: Table<QuizQuestionRecord>;

  constructor() {
    super('ProjectAlphaQuizDB');
    this.version(1).stores({
      quizzes: 'id, title, createdAt, topic, *sourceIds',
      quizQuestions: 'id, quizId, difficulty, topic, *sourceIds',
    });
  }
}

interface QuizRecord {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  sourceIds: string[];
  settings: QuizSettings;
  createdAt: number;
  updatedAt: number;
}

interface QuizQuestionRecord {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

// Lazy initialization of database
let db: QuizDatabase | null = null;

function getDB(): QuizDatabase {
  if (!db) {
    db = new QuizDatabase();
  }
  return db;
}

/**
 * Quiz state interface
 */
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

      // Create quiz
      createQuiz: async (quizData) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDB();
          const now = Date.now();
          const id = `quiz-${now}-${Math.random().toString(36).substring(2, 9)}`;

          const quiz: Quiz = {
            ...quizData,
            id,
            createdAt: now,
            updatedAt: now,
          };

          // Save to IndexedDB
          const questionIds = quiz.questions.map((q) => q.id);

          await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
            // Save quiz metadata
            await db.quizzes.put({
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              questionIds,
              sourceIds: quiz.sourceIds,
              settings: quiz.settings,
              createdAt: quiz.createdAt,
              updatedAt: quiz.updatedAt,
            });

            // Save questions
            for (const question of quiz.questions) {
              await db.quizQuestions.put({
                id: question.id,
                quizId: quiz.id,
                question: question.question,
                options: question.options,
                correctIndex: question.correctIndex,
                explanation: question.explanation,
                difficulty: question.difficulty,
                topic: question.topic,
                sourceIds: question.sourceIds,
                createdAt: question.createdAt,
              });
            }
          });

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

      // Update quiz
      updateQuiz: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDB();
          const quiz = await getDB().quizzes.get(id);

          if (!quiz) {
            set({ isLoading: false, error: 'Quiz not found' });
            return null;
          }

          const updatedQuiz: Quiz = {
            ...quiz,
            ...updates,
            id: quiz.id,
            createdAt: quiz.createdAt,
            updatedAt: Date.now(),
          } as Quiz;

          await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
            await db.quizzes.put({
              ...quiz,
              title: updatedQuiz.title,
              description: updatedQuiz.description,
              settings: updatedQuiz.settings,
              updatedAt: updatedQuiz.updatedAt,
            });
          });

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

      // Delete quiz
      deleteQuiz: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDB();

          await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
            // Get question IDs first
            const quiz = await db.quizzes.get(id);
            if (quiz) {
              // Delete associated questions
              await db.quizQuestions.where('quizId').equals(id).delete();
            }
            // Delete quiz
            await db.quizzes.delete(id);
          });

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

      // Get quiz by ID
      getQuiz: async (id) => {
        try {
          const db = getDB();
          const quizRecord = await db.quizzes.get(id);

          if (!quizRecord) {
            return null;
          }

          // Load questions
          const questions = await db.quizQuestions
            .where('quizId')
            .equals(id)
            .toArray();

          const quiz: Quiz = {
            id: quizRecord.id,
            projectId: '', // TODO: Load from project context
            title: quizRecord.title,
            description: quizRecord.description,
            questions: questions.map((q) => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              difficulty: q.difficulty,
              topic: q.topic,
              sourceIds: q.sourceIds,
              createdAt: q.createdAt,
            })),
            sourceIds: quizRecord.sourceIds,
            sourcesUsed: [], // TODO: Load from source metadata
            settings: quizRecord.settings,
            createdAt: quizRecord.createdAt,
            updatedAt: quizRecord.updatedAt,
          };

          return quiz;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get quiz';
          set({ error: errorMessage });
          return null;
        }
      },

      // Load all quizzes
      loadQuizzes: async () => {
        set({ isLoading: true, error: null });
        try {
          const db = getDB();
          const quizRecords = await db.quizzes.orderBy('createdAt').reverse().toArray();

          const quizzes: Quiz[] = await Promise.all(
            quizRecords.map(async (quizRecord) => {
              const questions = await db.quizQuestions
                .where('quizId')
                .equals(quizRecord.id)
                .toArray();

              return {
                id: quizRecord.id,
                projectId: '', // TODO: Load from project context
                title: quizRecord.title,
                description: quizRecord.description,
                questions: questions.map((q) => ({
                  id: q.id,
                  question: q.question,
                  options: q.options,
                  correctIndex: q.correctIndex,
                  explanation: q.explanation,
                  difficulty: q.difficulty,
                  topic: q.topic,
                  sourceIds: q.sourceIds,
                  createdAt: q.createdAt,
                })),
                sourceIds: quizRecord.sourceIds,
                sourcesUsed: [], // TODO: Load from source metadata
                settings: quizRecord.settings,
                createdAt: quizRecord.createdAt,
                updatedAt: quizRecord.updatedAt,
              };
            })
          );

          set({ quizzes, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load quizzes';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Set current quiz
      setCurrentQuiz: (quiz) => {
        set({ currentQuiz: quiz, currentQuestion: null });
      },

      // Set current question
      setCurrentQuestion: (question) => {
        set({ currentQuestion: question });
      },

      // Add question to quiz
      addQuestion: async (quizId, questionData) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDB();
          const now = Date.now();
          const id = `qq-${now}-${Math.random().toString(36).substring(2, 9)}`;

          const question: QuizQuestion = {
            ...questionData,
            id,
            createdAt: now,
          };

          await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
            await db.quizQuestions.put({
              id: question.id,
              quizId,
              question: question.question,
              options: question.options,
              correctIndex: question.correctIndex,
              explanation: question.explanation,
              difficulty: question.difficulty,
              topic: question.topic,
              sourceIds: question.sourceIds,
              createdAt: question.createdAt,
            });

            // Update quiz's question count
            const quiz = await db.quizzes.get(quizId);
            if (quiz) {
              const questionIds = [...quiz.questionIds, question.id];
              await db.quizzes.update(quizId, { questionIds, updatedAt: now });
            }
          });

          set((state) => ({
            quizzes: state.quizzes.map((q) => {
              if (q.id === quizId) {
                return {
                  ...q,
                  questions: [...q.questions, question],
                  updatedAt: now,
                };
              }
              return q;
            }),
            currentQuiz:
              state.currentQuiz?.id === quizId
                ? {
                  ...state.currentQuiz,
                  questions: [...state.currentQuiz.questions, question],
                  updatedAt: now,
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

      // Update question
      updateQuestion: async (questionId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDB();
          const question = await db.quizQuestions.get(questionId);

          if (!question) {
            set({ isLoading: false, error: 'Question not found' });
            return null;
          }

          const updatedQuestion: QuizQuestionRecord = {
            ...question,
            ...updates,
          } as QuizQuestionRecord;

          await db.quizQuestions.put(updatedQuestion);

          set((state) => ({
            quizzes: state.quizzes.map((q) => {
              if (q.id === question.quizId) {
                return {
                  ...q,
                  questions: q.questions.map((qq) =>
                    qq.id === questionId
                      ? {
                        ...qq,
                        question: updatedQuestion.question,
                        options: updatedQuestion.options,
                        correctIndex: updatedQuestion.correctIndex,
                        explanation: updatedQuestion.explanation,
                        difficulty: updatedQuestion.difficulty,
                        topic: updatedQuestion.topic,
                        sourceIds: updatedQuestion.sourceIds,
                      }
                      : qq
                  ),
                };
              }
              return q;
            }),
            currentQuiz:
              state.currentQuiz?.id === question.quizId
                ? {
                  ...state.currentQuiz,
                  questions: state.currentQuiz.questions.map((qq) =>
                    qq.id === questionId
                      ? {
                        ...qq,
                        question: updatedQuestion.question,
                        options: updatedQuestion.options,
                        correctIndex: updatedQuestion.correctIndex,
                        explanation: updatedQuestion.explanation,
                        difficulty: updatedQuestion.difficulty,
                        topic: updatedQuestion.topic,
                        sourceIds: updatedQuestion.sourceIds,
                      }
                      : qq
                  ),
                }
                : state.currentQuiz,
            isLoading: false,
          }));

          return {
            id: updatedQuestion.id,
            question: updatedQuestion.question,
            options: updatedQuestion.options,
            correctIndex: updatedQuestion.correctIndex,
            explanation: updatedQuestion.explanation,
            difficulty: updatedQuestion.difficulty,
            topic: updatedQuestion.topic,
            sourceIds: updatedQuestion.sourceIds,
            createdAt: updatedQuestion.createdAt,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update question';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Delete question
      deleteQuestion: async (quizId, questionId) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDB();

          await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
            await db.quizQuestions.delete(questionId);

            const quiz = await db.quizzes.get(quizId);
            if (quiz) {
              const questionIds = quiz.questionIds.filter((id) => id !== questionId);
              await db.quizzes.update(quizId, { questionIds, updatedAt: Date.now() });
            }
          });

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

      // Filter quizzes
      filterQuizzes: async (filter) => {
        try {
          const db = getDB();
          let quizzes = await db.quizzes.orderBy('createdAt').reverse().toArray();

          // Apply filters
          if (filter.topic) {
            quizzes = quizzes.filter((q) => q.title.toLowerCase().includes(filter.topic!.toLowerCase()));
          }

          if (filter.difficulty) {
            // Filter quizzes that have at least one question with the specified difficulty
            for (const quiz of quizzes) {
              const questions = await db.quizQuestions.where('quizId').equals(quiz.id).toArray();
              if (!questions.some((q) => q.difficulty === filter.difficulty)) {
                quizzes = quizzes.filter((q) => q.id !== quiz.id);
              }
            }
          }

          if (filter.sourceId) {
            quizzes = quizzes.filter((q) => q.sourceIds.includes(filter.sourceId!));
          }

          return quizzes.map((q) => ({
            id: q.id,
            projectId: '', // TODO: Load from project context
            title: q.title,
            description: q.description,
            questions: [],
            sourceIds: q.sourceIds,
            sourcesUsed: [], // TODO: Load from source metadata
            settings: q.settings,
            createdAt: q.createdAt,
            updatedAt: q.updatedAt,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to filter quizzes';
          set({ error: errorMessage });
          return [];
        }
      },

      // Search quizzes
      searchQuizzes: async (query) => {
        try {
          const db = getDB();
          const lowerQuery = query.toLowerCase();
          const quizzes = await db.quizzes
            .filter((quiz) =>
              quiz.title.toLowerCase().includes(lowerQuery) ||
              (quiz.description !== undefined && quiz.description.toLowerCase().includes(lowerQuery))
            )
            .toArray();

          return quizzes.map((q) => ({
            id: q.id,
            projectId: '', // TODO: Load from project context
            title: q.title,
            description: q.description,
            questions: [],
            sourceIds: q.sourceIds,
            sourcesUsed: [], // TODO: Load from source metadata
            settings: q.settings,
            createdAt: q.createdAt,
            updatedAt: q.updatedAt,
          }));
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
