/**
 * @fileoverview Quiz results display component
 * @module components/study/QuizResults
 */

import type { QuizResult } from '@/lib/study/quiz-session';
import type { Quiz } from '@/lib/study/quiz-types';
import { calculateGrade } from '@/lib/study/quiz-session';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface QuizResultsProps {
  result: QuizResult;
  quiz: Quiz;
  onReview: () => void;
  onRetake?: () => void;
  onExit?: () => void;
}

/**
 * Grade color mapping
 */
const GRADE_COLORS = {
  A: 'text-green-500',
  B: 'text-lime-500',
  C: 'text-yellow-500',
  D: 'text-orange-500',
  F: 'text-red-500',
};

const GRADE_BG_COLORS = {
  A: 'bg-green-500/20',
  B: 'bg-lime-500/20',
  C: 'bg-yellow-500/20',
  D: 'bg-orange-500/20',
  F: 'bg-red-500/20',
};

/**
 * Format time from seconds to readable string
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Quiz results component
 * Displays score, percentage, grade, time taken, and action buttons
 */
export function QuizResults({ result, quiz, onReview, onRetake, onExit }: QuizResultsProps) {
  const { t } = useTranslation();

  const grade = calculateGrade(result.percentage);

  return (
    <div className="quiz-results w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{t('quizzes.results.title')}</h1>
        <p className="text-muted-foreground">{quiz.title}</p>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(result.percentage / 100) * 440} 440`}
              className={cn(
                'transition-all duration-1000 ease-out',
                result.percentage >= 70 ? 'text-success' : result.percentage >= 50 ? 'text-yellow-500' : 'text-error'
              )}
              style={{
                strokeDasharray: `${(result.percentage / 100) * 440} 440`,
                transition: 'stroke-dasharray 1s ease-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold">{result.correctAnswers}/{result.totalQuestions}</div>
            <div className={cn('text-lg font-medium', GRADE_COLORS[grade])}>
              {t(`quizzes.grade.${grade.toLowerCase()}`)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Percentage */}
        <div className="quiz-stat-card p-4 bg-card border border-border rounded-none text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {t('quizzes.results.percentage')}
          </div>
          <div className={cn('text-2xl font-bold', GRADE_COLORS[grade])}>
            {result.percentage.toFixed(0)}%
          </div>
        </div>

        {/* Time */}
        <div className="quiz-stat-card p-4 bg-card border border-border rounded-none text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {t('quizzes.results.time-taken')}
          </div>
          <div className="text-2xl font-bold">
            {formatTime(Math.floor(result.timeSpent / 1000))}
          </div>
        </div>

        {/* Correct Answers */}
        <div className="quiz-stat-card p-4 bg-card border border-border rounded-none text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {t('quizzes.results.correct')}
          </div>
          <div className={cn('text-2xl font-bold', 'text-success')}>
            {result.correctAnswers}
          </div>
        </div>
      </div>

      {/* Performance Message */}
      <div className={cn('p-4 rounded-none mb-8 text-center', GRADE_BG_COLORS[grade])}>
        <p className={cn('font-medium', GRADE_COLORS[grade])}>
          {result.percentage >= 90 && t('quizzes.results.message.excellent')}
          {result.percentage >= 70 && result.percentage < 90 && t('quizzes.results.message.good')}
          {result.percentage >= 50 && result.percentage < 70 && t('quizzes.results.message.fair')}
          {result.percentage < 50 && t('quizzes.results.message.needs-improvement')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onReview}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-none font-medium hover:bg-primary/90 transition-colors"
        >
          {t('quizzes.results.review-button')}
        </button>
        {onRetake && (
          <button
            onClick={onRetake}
            className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-none font-medium hover:bg-secondary/80 transition-colors"
          >
            {t('quizzes.results.retake-button')}
          </button>
        )}
        {onExit && (
          <button
            onClick={onExit}
            className="w-full px-4 py-3 bg-muted text-muted-foreground rounded-none font-medium hover:bg-muted/80 transition-colors"
          >
            {t('quizzes.results.exit-button')}
          </button>
        )}
      </div>
    </div>
  );
}
