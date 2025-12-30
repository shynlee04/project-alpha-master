/**
 * @fileoverview Study statistics display component
 * @module components/study/study-stats
 */

import { useTranslation } from 'react-i18next';
import type { StudyStats } from '@/lib/study/srs-types';
import { cn } from '@/lib/utils';

/**
 * Study stats display props
 */
export interface StudyStatsDisplayProps {
  /** Study session statistics */
  stats: StudyStats;
  /** Total cards studied in this session */
  totalCardsStudied: number;
  /** Callback to start a new session */
  onRestart?: () => void;
  /** Callback to exit to previous screen */
  onExit?: () => void;
}

/**
 * Format seconds to minutes:seconds
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `0:${secs.toString().padStart(2, '0')}`;
}

/**
 * Study statistics display component
 * Shows cards studied, accuracy, time spent, and streak
 */
export function StudyStatsDisplay({
  stats,
  totalCardsStudied,
  onRestart,
  onExit,
}: StudyStatsDisplayProps) {
  const { t } = useTranslation();

  // Calculate accuracy percentage
  const accuracy =
    stats.cardsStudied > 0
      ? Math.round((stats.correct / stats.cardsStudied) * 100)
      : 0;

  // Determine streak status
  const streakStatus = stats.streak > 0 ? 'hot' : 'cold';
  const streakEmoji = stats.streak > 0 ? '🔥' : '❄️';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6">
      {/* Session complete header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold">{t('study.session.complete')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('flashcards.accuracy', { percent: accuracy })}
        </p>
      </div>

      {/* Statistics grid */}
      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        {/* Cards studied */}
        <div className="bg-card border border-border rounded-none p-4 text-center">
          <div className="text-3xl font-bold text-primary">{stats.cardsStudied}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('study.stats.cardsStudied')}
          </div>
        </div>

        {/* Time spent */}
        <div className="bg-card border border-border rounded-none p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {formatTime(stats.timeSpent)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('study.stats.timeSpent')}
          </div>
        </div>

        {/* Correct/Incorrect */}
        <div className="bg-card border border-border rounded-none p-4 text-center">
          <div className="text-3xl font-bold text-green-500">{stats.correct}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('study.stats.correct')}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-card border border-border rounded-none p-4 text-center">
          <div className="text-3xl font-bold text-orange-500">
            {streakEmoji} {stats.streak}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('study.stats.streak')}
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      {Object.values(stats.ratingDistribution).some((v) => v > 0) && (
        <div className="w-full mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {t('study.stats.ratingDistribution')}
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.ratingDistribution).map(([rating, count]) => {
              if (count === 0) return null;
              const percentage = (count / stats.cardsStudied) * 100;
              const colors: Record<string, string> = {
                again: 'bg-red-500',
                hard: 'bg-orange-500',
                good: 'bg-green-500',
                easy: 'bg-blue-500',
              };

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-16 text-sm capitalize">
                    {t(`study.rating.${rating}`)}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-500', colors[rating])}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-right text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full">
        {onRestart && (
          <button
            onClick={onRestart}
            className={cn(
              'w-full py-3 px-4 rounded-none font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {t('flashcards.continue')}
          </button>
        )}

        {onExit && (
          <button
            onClick={onExit}
            className={cn(
              'w-full py-3 px-4 rounded-none font-medium transition-colors',
              'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            {t('flashcards.startNew')}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact study stats for display in headers/sidebars
 */
export function CompactStudyStats({
  totalCardsStudied,
  currentStreak,
  className,
}: {
  totalCardsStudied: number;
  currentStreak: number;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">{t('study.stats.cardsStudied')}:</span>
        <span className="font-medium">{totalCardsStudied}</span>
      </div>
      <div className="flex items-center gap-1">
        <span>🔥</span>
        <span className="font-medium">{currentStreak}</span>
      </div>
    </div>
  );
}
