/**
 * @fileoverview Question Management Slice
 * @module infrastructure/persistence/stores/study/quiz/slices/question-management-slice
 */

import type { QuizState } from '../types';
import { getQuizDB, type QuizQuestionRecord } from '../quiz-db';
import type { QuizQuestion } from '../../../../../../lib/study/quiz-types';

export type QuestionManagementSlice = Pick<QuizState, 'addQuestion' | 'updateQuestion' | 'deleteQuestion'>;

export const createQuestionManagementSlice = (
    set: (partial: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void,
    _get: () => QuizState
): QuestionManagementSlice => ({
    addQuestion: async (quizId, questionData) => {
        set({ isLoading: true, error: null });
        try {
            const db = getQuizDB();
            const now = Date.now();
            const id = `qq-${now}-${Math.random().toString(36).substring(2, 9)}`;

            const question: QuizQuestion = {
                ...questionData,
                id,
                createdAt: now,
            };

            await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
                // Get workspaceId from the quiz to associate the question with the same workspace
                const quiz = await db.quizzes.get(quizId);
                const workspaceId = quiz?.workspaceId || 'ide'; // Default to 'ide' if not found

                await db.quizQuestions.put({
                    id: question.id,
                    workspaceId,
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

    updateQuestion: async (questionId, updates) => {
        set({ isLoading: true, error: null });
        try {
            const db = getQuizDB();
            const questionRecord = await db.quizQuestions.get(questionId);

            if (!questionRecord) {
                set({ isLoading: false, error: 'Question not found' });
                return null;
            }

            const updatedQuestion: QuizQuestionRecord = {
                ...questionRecord,
                ...updates,
            } as QuizQuestionRecord;

            await db.quizQuestions.put(updatedQuestion);

            set((state) => ({
                quizzes: state.quizzes.map((q) => {
                    if (q.id === questionRecord.quizId) {
                        return {
                            ...q,
                            questions: q.questions.map((qq) =>
                                qq.id === questionId
                                    ? { ...qq, ...updates } as QuizQuestion
                                    : qq
                            ),
                        };
                    }
                    return q;
                }),
                currentQuiz:
                    state.currentQuiz?.id === questionRecord.quizId
                        ? {
                            ...state.currentQuiz,
                            questions: state.currentQuiz.questions.map((qq) =>
                                qq.id === questionId
                                    ? { ...qq, ...updates } as QuizQuestion
                                    : qq
                            ),
                        }
                        : state.currentQuiz,
                isLoading: false,
            }));

            // Return domain object
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

    deleteQuestion: async (quizId, questionId) => {
        set({ isLoading: true, error: null });
        try {
            const db = getQuizDB();

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
});
