/**
 * @fileoverview Quiz query actions (filter, search)
 * @module infrastructure/persistence/stores/quiz/quiz-query-actions
 */

import type { Quiz, QuizFilter } from '@/lib/study/quiz-types';
import { getQuizDB } from './quiz-database';

/**
 * Filter quizzes by criteria
 */
export async function filterQuizzes(filter: QuizFilter): Promise<Quiz[]> {
  const db = getQuizDB();
  let quizzes = await db.quizzes.orderBy('createdAt').reverse().toArray();

  // Apply filters
  if (filter.topic) {
    quizzes = quizzes.filter((q) =>
      q.title.toLowerCase().includes(filter.topic!.toLowerCase())
    );
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
    title: q.title,
    description: q.description,
    questions: [],
    sourceIds: q.sourceIds,
    settings: q.settings,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }));
}

/**
 * Search quizzes by query string
 */
export async function searchQuizzes(query: string): Promise<Quiz[]> {
  const db = getQuizDB();
  const lowerQuery = query.toLowerCase();
  const quizzes = await db.quizzes
    .filter((quiz) =>
      quiz.title.toLowerCase().includes(lowerQuery) ||
      quiz.description?.toLowerCase().includes(lowerQuery)
    )
    .toArray();

  return quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    questions: [],
    sourceIds: q.sourceIds,
    settings: q.settings,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }));
}
