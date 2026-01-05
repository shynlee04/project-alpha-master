/**
 * @fileoverview Quiz Query Slice
 * @module infrastructure/persistence/stores/study/quiz/slices/quiz-query-slice
 */

import type { QuizState } from '../types';
import { getQuizDB } from '../quiz-db';
import type { Quiz } from '@/lib/study/quiz-types';

export type QuizQuerySlice = Pick<QuizState, 'loadQuizzes' | 'getQuiz' | 'filterQuizzes' | 'searchQuizzes'>;

export const createQuizQuerySlice = (
    set: (partial: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void
): QuizQuerySlice => ({
    loadQuizzes: async () => {
        set({ isLoading: true, error: null });
        try {
            const db = getQuizDB();
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

    getQuiz: async (id) => {
        try {
            const db = getQuizDB();
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

    filterQuizzes: async (filter) => {
        try {
            const db = getQuizDB();
            let quizzes = await db.quizzes.orderBy('createdAt').reverse().toArray();

            // Apply filters (in memory for now as Dexie queries are complex with multi-criteria)
            // Ideally should be optimized with compound indexes
            if (filter.topic) {
                quizzes = quizzes.filter((q) => q.title.toLowerCase().includes(filter.topic!.toLowerCase()));
            }

            if (filter.difficulty) {
                // Filter quizzes that have at least one question with the specified difficulty
                // This is expensive as it requires checking questions.
                // Refactor opportunity: Store aggregated difficulty in quiz record?
                const filteredQuizzes = [];
                for (const quiz of quizzes) {
                    const questions = await db.quizQuestions.where('quizId').equals(quiz.id).toArray();
                    if (questions.some((q) => q.difficulty === filter.difficulty)) {
                        filteredQuizzes.push(quiz);
                    }
                }
                quizzes = filteredQuizzes;
            }

            if (filter.sourceId) {
                quizzes = quizzes.filter((q) => q.sourceIds.includes(filter.sourceId!));
            }

            return quizzes.map((q) => ({
                id: q.id,
                projectId: '',
                title: q.title,
                description: q.description,
                questions: [], // Shallow return for list view?
                sourceIds: q.sourceIds,
                sourcesUsed: [],
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

    searchQuizzes: async (query) => {
        try {
            const db = getQuizDB();
            const lowerQuery = query.toLowerCase();
            const quizzes = await db.quizzes
                .filter((quiz) =>
                    quiz.title.toLowerCase().includes(lowerQuery) ||
                    (quiz.description !== undefined && quiz.description.toLowerCase().includes(lowerQuery))
                )
                .toArray();

            return quizzes.map((q) => ({
                id: q.id,
                projectId: '',
                title: q.title,
                description: q.description,
                questions: [],
                sourceIds: q.sourceIds,
                sourcesUsed: [],
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
});
