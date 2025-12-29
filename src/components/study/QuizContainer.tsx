/**
 * @fileoverview Quiz taking container component managing quiz flow
 * @module components/study/QuizContainer
 */

import { useState, useCallback, useEffect } from 'react';
import type { Quiz } from '@/lib/study/quiz-types';
import type { QuizResult } from '@/lib/study/quiz-session';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import { QuizStartScreen } from './QuizStartScreen';
import { QuizQuestionView } from './QuizQuestionView';
import { QuizResults } from './QuizResults';
import { QuizReview } from './QuizReview';
import { cn } from '@/lib/utils';

interface QuizContainerProps {
  quiz: Quiz;
  onComplete?: (result: QuizResult) => void;
  onExit?: () => void;
}

/**
 * Main quiz container component
 * Manages state and renders appropriate view based on quiz progress
 */
export function QuizContainer({ quiz, onComplete, onExit }: QuizContainerProps) {
  const [result, setResult] = useState<QuizResult | null>(null);

  const {
    session,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isComplete,
    isReview,
    selectedAnswer,
    showResult,
    startSession,
    selectAnswer,
    confirmAndNext,
    goToQuestion,
    previousQuestion,
    nextQuestion,
    completeSession,
    resetSession,
    enterReview,
    exitReview,
  } = useQuizSession(quiz);

  const timer = useQuizTimer();

  // Start timer when session begins
  useEffect(() => {
    if (session && !session.completed && !isReview) {
      timer.start();
    } else {
      timer.pause();
    }
  }, [session?.completed, isReview, timer]);

  // Handle session completion
  const handleComplete = useCallback(() => {
    const quizResult = completeSession();
    timer.pause();
    setResult(quizResult);
    onComplete?.(quizResult);
  }, [completeSession, timer, onComplete]);

  // Handle exit
  const handleExit = useCallback(() => {
    timer.pause();
    resetSession();
    onExit?.();
  }, [timer, resetSession, onExit]);

  // Handle retake
  const handleRetake = useCallback(() => {
    timer.reset();
    setResult(null);
    startSession();
    timer.start();
  }, [timer, startSession]);

  // Render based on state
  if (isReview && result) {
    return (
      <div className="quiz-container w-full max-w-2xl mx-auto">
        <QuizReview
          quiz={quiz}
          answers={result.answers}
          onExit={handleExit}
        />
      </div>
    );
  }

  if (isComplete && result) {
    return (
      <div className="quiz-container w-full max-w-2xl mx-auto">
        <QuizResults
          result={result}
          quiz={quiz}
          onReview={enterReview}
          onRetake={handleRetake}
          onExit={handleExit}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="quiz-container w-full max-w-2xl mx-auto">
        <QuizStartScreen
          quiz={quiz}
          onStart={() => {
            startSession();
            timer.start();
          }}
          onExit={handleExit}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-container w-full max-w-2xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">No question available</p>
        <button
          onClick={handleExit}
          className="mt-4 px-4 py-2 bg-secondary rounded-lg"
        >
          Exit Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container w-full max-w-2xl mx-auto">
      <QuizQuestionView
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        selectedIndex={selectedAnswer}
        showResult={showResult}
        onSelect={selectAnswer}
        onNext={confirmAndNext}
        elapsedTime={timer.formatTime()}
        hasMoreQuestions={currentQuestionIndex < totalQuestions - 1}
        onPrevious={currentQuestionIndex > 0 ? previousQuestion : undefined}
        onFinish={handleComplete}
      />
    </div>
  );
}

/**
 * Quiz container with responsive layout
 */
export function ResponsiveQuizContainer({ quiz, onComplete, onExit }: QuizContainerProps) {
  return (
    <div className="quiz-wrapper w-full h-full flex flex-col">
      <QuizContainer quiz={quiz} onComplete={onComplete} onExit={onExit} />
    </div>
  );
}
