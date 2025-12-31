/**
 * @fileoverview Quiz question CRUD actions
 * @module infrastructure/persistence/stores/quiz/quiz-question-actions
 */

import type { QuizQuestion } from '@/lib/study/quiz-types';
import type { QuizQuestionRecord } from './quiz-database';
import { getQuizDB } from './quiz-database';

/**
 * Add a question to a quiz
 */
export async function addQuestion(
  quizId: string,
  questionData: Omit<QuizQuestion, 'id' | 'createdAt'>
): Promise<QuizQuestion> {
  const db = getQuizDB();
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

    // Update quiz's questionIds array
    const quiz = await db.quizzes.get(quizId);
    if (quiz) {
      const questionIds = [...quiz.questionIds, question.id];
      await db.quizzes.update(quizId, { questionIds, updatedAt: now });
    }
  });

  return question;
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: string,
  updates: Partial<QuizQuestion>
): Promise<QuizQuestion | null> {
  const db = getQuizDB();
  const question = await db.quizQuestions.get(questionId);

  if (!question) {
    return null;
  }

  const updatedQuestion: QuizQuestionRecord = {
    ...question,
    ...updates,
  } as QuizQuestionRecord;

  await db.quizQuestions.put(updatedQuestion);

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
}

/**
 * Delete a question from a quiz
 */
export async function deleteQuestion(
  quizId: string,
  questionId: string
): Promise<boolean> {
  const db = getQuizDB();

  try {
    await db.transaction('rw', db.quizzes, db.quizQuestions, async () => {
      await db.quizQuestions.delete(questionId);

      const quiz = await db.quizzes.get(quizId);
      if (quiz) {
        const questionIds = quiz.questionIds.filter((id) => id !== questionId);
        await db.quizzes.update(quizId, { questionIds, updatedAt: Date.now() });
      }
    });
    return true;
  } catch {
    return false;
  }
}
