/**
 * @fileoverview Quiz question view component with answer options
 * @module components/study/QuizQuestionView
 */

import { useEffect, useCallback } from 'react';
import type { QuizQuestion } from '@/lib/study/quiz-types';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface QuizQuestionViewProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  elapsedTime?: string;
  hasMoreQuestions: boolean;
}

/**
 * Quiz question view component
 * Displays question text, answer options, and handles selection
 */
export function QuizQuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  showResult,
  onSelect,
  onNext,
  onPrevious,
  onFinish,
  elapsedTime,
  hasMoreQuestions,
}: QuizQuestionViewProps) {
  const { t } = useTranslation();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResult) {
        // After answering, arrow keys for navigation
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          onNext?.();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onPrevious?.();
        }
        return;
      }

      // Answer selection (1-4)
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 4) {
        e.preventDefault();
        onSelect(keyNum - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult, onSelect, onNext, onPrevious]);

  return (
    <div className="quiz-question-view w-full">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          {t('quizzes.question.progress', {
            current: questionNumber,
            total: totalQuestions,
          })}
        </div>
        {elapsedTime && (
          <div className="text-sm font-mono text-muted-foreground">
            {elapsedTime}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-medium leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === question.correctIndex;
          const showCorrect = showResult && isCorrect;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => !showResult && onSelect(index)}
              disabled={showResult}
              className={cn(
                'w-full p-4 text-left rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                // Base state
                !showResult && 'bg-card border-border hover:border-primary/50',
                // Selected state
                isSelected && !showResult && 'border-primary bg-primary/5',
                // Correct answer (always show if result is shown)
                showCorrect && 'border-success bg-success/5',
                // Incorrect selected answer
                showIncorrect && 'border-error bg-error/5',
                // Disabled state
                showResult && 'opacity-70'
              )}
              aria-pressed={isSelected}
              aria-label={`${String.fromCharCode(65 + index)}. ${option}`}
            >
              <div className="flex items-start gap-4">
                {/* Option Letter */}
                <span
                  className={cn(
                    'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm',
                    // Base
                    !showResult && 'bg-muted text-muted-foreground',
                    // Selected
                    isSelected && !showResult && 'bg-primary text-primary-foreground',
                    // Correct
                    showCorrect && 'bg-success text-success-foreground',
                    // Incorrect
                    showIncorrect && 'bg-error text-error-foreground'
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                {/* Option Text */}
                <span className="flex-1">{option}</span>

                {/* Result Icons */}
                {showResult && (
                  <span className="flex-shrink-0">
                    {showCorrect && (
                      <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {showIncorrect && (
                      <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && question.explanation && (
        <div className="p-4 bg-muted/50 rounded-xl mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium mb-1">{t('quizzes.explanation')}</div>
              <p className="text-muted-foreground text-sm">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        {onPrevious && (
          <button
            onClick={onPrevious}
            disabled={questionNumber <= 1}
            className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('quizzes.navigation.previous')}
          </button>
        )}
        <div className="flex-1" />
        {showResult && (
          <button
            onClick={() => {
              if (hasMoreQuestions) {
                onNext?.();
              } else {
                onFinish?.();
              }
            }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {hasMoreQuestions ? t('quizzes.navigation.next') : t('quizzes.navigation.finish')}
          </button>
        )}
      </div>

      {/* Keyboard Hints */}
      {!showResult && (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <span>{t('quizzes.hints.keyboard')}</span>
        </div>
      )}
    </div>
  );
}
