/**
 * @fileoverview Quiz session hook for managing quiz taking state
 * @module hooks/useQuizSession
 */

import { useState, useCallback, useMemo } from 'react';
import type { Quiz, QuizQuestion } from '@/lib/study/quiz-types';
import {
  createQuizSession,
  selectAnswer,
  nextQuestion,
  previousQuestion,
  completeQuizSession,
  type QuizSession,
  type QuizResult,
} from '@/lib/study/quiz-session';

/**
 * Quiz session hook return type
 */
interface UseQuizSessionReturn {
  // State
  session: QuizSession | null;
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
  isReview: boolean;
  selectedAnswer: number | null;
  showResult: boolean;

  // Actions
  startSession: () => void;
  selectAnswer: (index: number) => void;
  confirmAndNext: () => void;
  goToQuestion: (index: number) => void;
  previousQuestion: () => void;
  nextQuestion: () => void;
  completeSession: () => QuizResult;
  resetSession: () => void;
  enterReview: () => void;
  exitReview: () => void;
}

/**
 * Hook for managing quiz session state
 */
export function useQuizSession(quiz: Quiz): UseQuizSessionReturn {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isReview, setIsReview] = useState(false);

  // Current question based on session
  const currentQuestion = useMemo((): QuizQuestion | null => {
    if (!session || session.currentQuestionIndex >= quiz.questions.length) {
      return null;
    }
    return quiz.questions[session.currentQuestionIndex];
  }, [session, quiz.questions]);

  const currentQuestionIndex = session?.currentQuestionIndex ?? 0;
  const totalQuestions = quiz.questions.length;

  // Check if answer has been selected for current question
  const selectedAnswer = useMemo((): number | null => {
    if (!session || !currentQuestion) return null;
    const answer = session.answers.get(currentQuestion.id);
    return answer?.selectedIndex ?? null;
  }, [session, currentQuestion]);

  // Show result if answer has been selected
  const showResult = selectedAnswer !== null;

  // Start a new session
  const startSession = useCallback(() => {
    const newSession = createQuizSession(quiz);
    setSession(newSession);
    setIsReview(false);
  }, [quiz]);

  // Select an answer
  const selectAnswerInternal = useCallback((index: number) => {
    if (!session || !currentQuestion || showResult) return;

    setSession((prev) => {
      if (!prev) return prev;
      return selectAnswer(prev, currentQuestion, index, 0);
    });
  }, [session, currentQuestion, showResult]);

  // Confirm answer and move to next
  const confirmAndNext = useCallback(() => {
    if (!session || !currentQuestion || !showResult) return;

    setSession((prev) => {
      if (!prev) return prev;
      return nextQuestion(prev, quiz.questions.length);
    });
  }, [session, currentQuestion, showResult, quiz.questions.length]);

  // Go to specific question
  const goToQuestion = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      if (index < 0 || index >= quiz.questions.length) return prev;
      return {
        ...prev,
        currentQuestionIndex: index,
      };
    });
  }, [quiz.questions.length]);

  // Navigate to previous question
  const previousQuestionInternal = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return previousQuestion(prev);
    });
  }, []);

  // Navigate to next question
  const nextQuestionInternal = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return nextQuestion(prev, quiz.questions.length);
    });
  }, [quiz.questions.length]);

  // Complete the session and get results
  const completeSession = useCallback(() => {
    if (!session) {
      throw new Error('No active session to complete');
    }

    const result = completeQuizSession(session, quiz, Date.now() - session.startTime);

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        completed: true,
        endTime: Date.now(),
      };
    });

    return result;
  }, [session, quiz]);

  // Reset the session
  const resetSession = useCallback(() => {
    setSession(null);
    setIsReview(false);
  }, []);

  // Enter review mode
  const enterReview = useCallback(() => {
    setIsReview(true);
  }, []);

  // Exit review mode
  const exitReview = useCallback(() => {
    setIsReview(false);
  }, []);

  return {
    session,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isComplete: session?.completed ?? false,
    isReview,
    selectedAnswer,
    showResult,
    startSession,
    selectAnswer: selectAnswerInternal,
    confirmAndNext,
    goToQuestion,
    previousQuestion: previousQuestionInternal,
    nextQuestion: nextQuestionInternal,
    completeSession,
    resetSession,
    enterReview,
    exitReview,
  };
}
