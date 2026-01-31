/**
 * @fileoverview Quiz review component for reviewing all answers
 * @module components/study/QuizReview
 */

import { useState, useMemo } from 'react';
import type { Quiz } from '@/lib/study/quiz-types';
import type { QuizAnswer } from '@/lib/study/quiz-session';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface QuizReviewProps {
  quiz: Quiz;
  answers: QuizAnswer[];
  onQuestionClick?: (index: number) => void;
  onExit?: () => void;
}

/**
 * Quiz review component
 * Displays all questions with user answers and explanations
 */
export function QuizReview({ quiz, answers, onQuestionClick, onExit }: QuizReviewProps) {
  const { t } = useTranslation();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([0]));

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const correctCount = useMemo(
    () => answers.filter((a) => a.isCorrect).length,
    [answers]
  );

  const incorrectCount = useMemo(
    () => answers.filter((a) => !a.isCorrect).length,
    [answers]
  );

  return (
    <div className="quiz-review w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('quizzes.review.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {correctCount} {t('quizzes.review.correct')} • {incorrectCount} {t('quizzes.review.incorrect')}
          </p>
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="p-2 hover:bg-muted rounded-none transition-colors"
            aria-label={t('quizzes.review.exit')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {quiz.questions.map((question, index) => {
          const answer = answers.find((a) => a.questionId === question.id);
          const isExpanded = expandedQuestions.has(index);
          const isCorrect = answer?.isCorrect ?? false;

          return (
            <div
              key={question.id}
              className={cn(
                'rounded-none border overflow-hidden transition-colors',
                isCorrect
                  ? 'border-success/30 bg-success/5'
                  : 'border-error/30 bg-error/5'
              )}
            >
              {/* Question Header */}
              <button
                onClick={() => {
                  toggleQuestion(index);
                  onQuestionClick?.(index);
                }}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                aria-expanded={isExpanded}
              >
                {/* Question Number */}
                <span
                  className={cn(
                    'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-none font-bold text-sm',
                    isCorrect
                      ? 'bg-success text-success-foreground'
                      : 'bg-error text-error-foreground'
                  )}
                >
                  {index + 1}
                </span>

                {/* Question Preview */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{question.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {question.topic} • {question.difficulty}
                  </p>
                </div>

                {/* Result Badge */}
                <div
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium capitalize',
                    isCorrect
                      ? 'bg-success/20 text-success'
                      : 'bg-error/20 text-error'
                  )}
                >
                  {isCorrect ? t('quizzes.review.correct') : t('quizzes.review.incorrect')}
                </div>

                {/* Expand Icon */}
                <svg
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-border/50">
                  {/* Answer Options */}
                  <div className="space-y-2 mt-4">
                    {question.options.map((option, optIndex) => {
                      const isSelected = answer?.selectedIndex === optIndex;
                      const isCorrectOption = optIndex === question.correctIndex;

                      return (
                        <div
                          key={optIndex}
                          className={cn(
                            'p-3 rounded-none border',
                            isCorrectOption && 'border-success bg-success/10',
                            isSelected && !isCorrectOption && 'border-error bg-error/10'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-xs font-bold',
                                isCorrectOption && 'bg-success text-success-foreground',
                                isSelected && !isCorrectOption && 'bg-error text-error-foreground',
                                !isSelected && !isCorrectOption && 'bg-muted text-muted-foreground'
                              )}
                            >
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{option}</span>
                            {isCorrectOption && (
                              <svg className="w-4 h-4 text-success ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {isSelected && !isCorrectOption && (
                              <svg className="w-4 h-4 text-error ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Your Answer */}
                  <div className="mt-4 text-sm">
                    <span className="text-muted-foreground">
                      {t('quizzes.review.your-answer')}:{' '}
                    </span>
                    <span className={isCorrect ? 'text-success' : 'text-error'}>
                      {String.fromCharCode(65 + (answer?.selectedIndex ?? -1))}
                      {answer && ` - ${question.options[answer.selectedIndex]}`}
                    </span>
                  </div>

                  {/* Correct Answer */}
                  {!isCorrect && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {t('quizzes.review.correct-answer')}:{' '}
                      </span>
                      <span className="text-success">
                        {String.fromCharCode(65 + question.correctIndex)} - {question.options[question.correctIndex]}
                      </span>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-none">
                      <div className="font-medium text-sm mb-1">
                        {t('quizzes.explanation')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exit Button (bottom) */}
      {onExit && (
        <button
          onClick={onExit}
          className="w-full mt-6 px-4 py-3 bg-muted text-muted-foreground rounded-none font-medium hover:bg-muted/80 transition-colors"
        >
          {t('quizzes.review.exit-button')}
        </button>
      )}
    </div>
  );
}
