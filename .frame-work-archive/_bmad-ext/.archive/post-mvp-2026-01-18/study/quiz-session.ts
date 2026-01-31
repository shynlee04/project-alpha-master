/**
 * @fileoverview Quiz session management
 * @module lib/study/quiz-session
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type { Quiz, QuizSession, QuizAnswer, QuizResult } from './quiz-types';

/**
 * Start a new quiz session
 */
export function startQuizSession(
  quiz: Quiz,
  userId?: string
): QuizSession {
  const shuffledQuestions = quiz.settings.shuffleQuestions
    ? [...quiz.questions].sort(() => Math.random() - 0.5)
    : quiz.questions;

  return {
    id: crypto.randomUUID(),
    quizId: quiz.id,
    userId,
    answers: [],
    score: 0,
    startedAt: new Date(),
    timeSpent: 0,
  };
}

/**
 * Submit an answer
 */
export function submitAnswer(
  session: QuizSession,
  questionId: string,
  answer: string | string[],
  timeSpent: number
): QuizSession {
  // Find question
  const question = session.questions?.find((q) => q.id === questionId);
  if (!question) {
    throw new Error(`Question not found: ${questionId}`);
  }

  // Check if correct
  const isCorrect = checkAnswer(question, answer);

  // Add answer
  const newAnswer: QuizAnswer = {
    questionId,
    answer,
    isCorrect,
    timeSpent,
  };

  return {
    ...session,
    answers: [...session.answers, newAnswer],
  };
}

/**
 * Check if answer is correct
 */
function checkAnswer(
  question: { correctAnswer: string | string[] },
  answer: string | string[]
): boolean {
  if (Array.isArray(question.correctAnswer) && Array.isArray(answer)) {
    return (
      question.correctAnswer.length === answer.length &&
      question.correctAnswer.every((a) => answer.includes(a))
    );
  }

  if (Array.isArray(question.correctAnswer) || Array.isArray(answer)) {
    return false;
  }

  return question.correctAnswer.toLowerCase() === answer.toLowerCase();
}

/**
 * Complete quiz session
 */
export function completeQuizSession(
  session: QuizSession,
  quiz: Quiz
): QuizResult {
  const correctAnswers = session.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  return {
    sessionId: session.id,
    quizId: quiz.id,
    totalQuestions,
    correctAnswers,
    score,
    passed: score >= quiz.settings.passingScore,
    timeSpent: session.timeSpent,
    questionResults: session.answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        correct: answer.isCorrect,
        userAnswer: answer.answer,
        correctAnswer: question?.correctAnswer || '',
      };
    }),
  };
}

/**
 * Calculate score
 */
export function calculateScore(
  answers: QuizAnswer[],
  questions: { points: number }[]
): number {
  return answers.reduce((total, answer, index) => {
    if (answer.isCorrect) {
      return total + (questions[index]?.points || 10);
    }
    return total;
  }, 0);
}
