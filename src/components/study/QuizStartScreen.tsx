/**
 * @fileoverview Quiz start screen component displaying quiz info
 * @module components/study/QuizStartScreen
 */

import { useMemo } from 'react';
import type { Quiz } from '@/lib/study/quiz-types';
import { getDifficultyBreakdown, estimateQuizTime, getQuizTopics } from '@/lib/study/quiz-session';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface QuizStartScreenProps {
  quiz: Quiz;
  onStart: () => void;
  onExit?: () => void;
}

/**
 * Difficulty badge colors
 */
const DIFFICULTY_COLORS = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

/**
 * Quiz start screen component
 * Displays quiz title, question count, difficulty breakdown, and start button
 */
export function QuizStartScreen({ quiz, onStart, onExit }: QuizStartScreenProps) {
  const { t } = useTranslation();

  const difficultyBreakdown = useMemo(
    () => getDifficultyBreakdown(quiz.questions),
    [quiz.questions]
  );

  const estimatedTime = useMemo(
    () => estimateQuizTime(quiz.questions),
    [quiz.questions]
  );

  const topics = useMemo(
    () => getQuizTopics(quiz.questions),
    [quiz.questions]
  );

  return (
    <div className="quiz-start-screen w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-muted-foreground">{quiz.description}</p>
        )}
      </div>

      {/* Quiz Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Question Count */}
        <div className="quiz-info-card p-4 bg-card border border-border rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">
            {t('quizzes.start.questions')}
          </div>
          <div className="text-2xl font-bold">
            {quiz.questions.length}
          </div>
        </div>

        {/* Estimated Time */}
        <div className="quiz-info-card p-4 bg-card border border-border rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">
            {t('quizzes.start.time-estimate')}
          </div>
          <div className="text-2xl font-bold">
            {Math.ceil(estimatedTime / 60)} {t('quizzes.start.minutes')}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('quizzes.start.difficulty')}
        </h3>
        <div className="space-y-2">
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
            const count = difficultyBreakdown[difficulty];
            const percentage = quiz.questions.length > 0
              ? (count / quiz.questions.length) * 100
              : 0;

            return (
              <div key={difficulty} className="flex items-center gap-3">
                <div
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium capitalize border',
                    DIFFICULTY_COLORS[difficulty]
                  )}
                >
                  {t(`quizzes.difficulty.${difficulty}`)}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        difficulty === 'easy' && 'bg-green-500',
                        difficulty === 'medium' && 'bg-yellow-500',
                        difficulty === 'hard' && 'bg-red-500'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground w-8">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {t('quizzes.start.topics')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 text-sm bg-muted rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {onExit && (
          <button
            onClick={onExit}
            className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            {t('quizzes.start.exit-button')}
          </button>
        )}
        <button
          onClick={onStart}
          className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {t('quizzes.start.start-button')}
        </button>
      </div>
    </div>
  );
}
