/**
 * @fileoverview Quiz CRUD actions for the quiz store
 * @module infrastructure/persistence/stores/quiz/quiz-actions
 */

import type { Quiz, QuizSettings } from '@/lib/study/quiz-types';
import { getQuizDB } from './quiz-database';

/**
 * Create a new quiz
 */
export async function createQuiz(
  quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Quiz> {
  const db = getQuizDB();
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

  return quiz;
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(
  id: string,
  updates: Partial<Quiz>
): Promise<Quiz | null> {
  const db = getQuizDB();
  const quiz = await db.quizzes.get(id);

  if (!quiz) {
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

  return updatedQuiz;
}

/**
 * Delete a quiz and its questions
 */
export async function deleteQuiz(id: string): Promise<boolean> {
  const db = getQuizDB();

  try {
    await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
      // Delete associated questions
      await db.quizQuestions.where('quizId').equals(id).delete();
      // Delete quiz
      await db.quizzes.delete(id);
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a quiz by ID with its questions
 */
export async function getQuiz(id: string): Promise<Quiz | null> {
  const db = getQuizDB();
  const quizRecord = await db.quizzes.get(id);

  if (!quizRecord) {
    return null;
  }

  // Load questions
  const questions = await db.quizQuestions.where('quizId').equals(id).toArray();

  return {
    id: quizRecord.id,
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
    settings: quizRecord.settings as QuizSettings,
    createdAt: quizRecord.createdAt,
    updatedAt: quizRecord.updatedAt,
  };
}

/**
 * Load all quizzes with their questions
 */
export async function loadAllQuizzes(): Promise<Quiz[]> {
  const db = getQuizDB();
  const quizRecords = await db.quizzes.orderBy('createdAt').reverse().toArray();

  return Promise.all(
    quizRecords.map(async (quizRecord) => {
      const questions = await db.quizQuestions
        .where('quizId')
        .equals(quizRecord.id)
        .toArray();

      return {
        id: quizRecord.id,
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
        settings: quizRecord.settings as QuizSettings,
        createdAt: quizRecord.createdAt,
        updatedAt: quizRecord.updatedAt,
      };
    })
  );
}
