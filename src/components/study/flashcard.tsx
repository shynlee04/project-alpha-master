/**
 * @fileoverview Flashcard component with 3D flip animation
 * @module components/study/flashcard
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import type { Flashcard } from '@/lib/knowledge/types';
import type { SRSRating } from '@/lib/study/srs-types';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Flashcard component props
 */
export interface FlashcardViewProps {
  /** The flashcard to display */
  card: Flashcard;
  /** Callback when card is flipped */
  onFlip?: () => void;
  /** Callback when user rates the card */
  onRate?: (rating: SRSRating) => void;
  /** Whether the card is currently flipped */
  isFlipped?: boolean;
  /** Current card index in the study session */
  currentIndex?: number;
  /** Total cards in the study session */
  totalCards?: number;
  /** Whether reduced motion is preferred */
  reduceMotion?: boolean;
}

/**
 * Rating button configuration
 */
const RATING_CONFIG: Record<SRSRating, { label: string; className: string; key: string }> = {
  again: { label: 'study.rating.again', className: 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30', key: '1' },
  hard: { label: 'study.rating.hard', className: 'bg-orange-500/20 border-orange-500 text-orange-400 hover:bg-orange-500/30', key: '2' },
  good: { label: 'study.rating.good', className: 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30', key: '3' },
  easy: { label: 'study.rating.easy', className: 'bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30', key: '4' },
};

/**
 * Keyboard shortcuts for rating
 */
const RATING_SHORTCUTS: Record<string, SRSRating> = {
  '1': 'again',
  '2': 'hard',
  '3': 'good',
  '4': 'easy',
};

/**
 * Flashcard component with 3D flip animation
 * Uses CSS transform: rotateX(180deg) for flip from bottom edge
 */
export function FlashcardView({
  card,
  onFlip,
  onRate,
  isFlipped: controlledFlipped,
  currentIndex,
  totalCards,
  reduceMotion: prefersReducedMotion = false,
}: FlashcardViewProps) {
  const { t } = useTranslation();
  const [internalFlipped, setInternalFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Use controlled or internal state
  const isFlipped = controlledFlipped ?? internalFlipped;

  const toggleFlip = useCallback(() => {
    const newFlipped = !isFlipped;
    if (controlledFlipped === undefined) {
      setInternalFlipped(newFlipped);
    }
    onFlip?.();
  }, [isFlipped, controlledFlipped, onFlip]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focus is on interactive elements
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          toggleFlip();
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
          // These are handled by parent for navigation
          break;
        default:
          // Check for rating shortcuts (only when flipped)
          if (isFlipped && onRate) {
            const rating = RATING_SHORTCUTS[e.key];
            if (rating) {
              e.preventDefault();
              onRate(rating);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFlip, isFlipped, onRate]);

  // Handle touch swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const diffX = touchStartRef.current.x - touchEnd.x;
    const diffY = touchStartRef.current.y - touchEnd.y;

    // Minimum swipe distance (50px)
    const SWIPE_THRESHOLD = 50;

    // Determine if swipe is horizontal (more horizontal than vertical)
    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD;

    if (isHorizontalSwipe) {
      // Left swipe (next card) or right swipe (previous card)
      // Parent handles navigation, so we don't prevent default here
    }

    touchStartRef.current = null;
  }, []);

  // Calculate progress percentage
  const progress = totalCards && currentIndex !== undefined
    ? ((currentIndex + 1) / totalCards) * 100
    : 0;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress indicator */}
      {totalCards !== undefined && currentIndex !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{t('study.progress', { current: currentIndex + 1, total: totalCards })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Flashcard container with perspective */}
      <div
        ref={containerRef}
        className="flashcard-container relative w-full min-h-[300px] perspective-1000"
        style={{ perspective: '1000px' }}
        onClick={toggleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={t(isFlipped ? 'study.flashcard.back' : 'study.flashcard.front')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
      >
        {/* The flashcard with 3D flip transform */}
        <div
          className={cn(
            'flashcard relative w-full h-full min-h-[300px]',
            'transform-style-3d transition-transform duration-600',
            'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            isFlipped && 'rotate-x-180',
            prefersReducedMotion && 'duration-0'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
            transition: prefersReducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
          }}
        >
          {/* Front face - Question */}
          <div
            className="flashcard-face flashcard-front absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-card border-2 border-border rounded-none text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                {t('study.flashcard.question')}
              </span>
              <p className="text-xl font-medium leading-relaxed">
                {card.question}
              </p>
            </div>
            <span className="text-sm text-muted-foreground mt-4">
              {t('study.flashcard.tapToFlip')}
            </span>
          </div>

          {/* Back face - Answer with rating buttons */}
          <div
            className="flashcard-face flashcard-back absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-card border-2 border-border rounded-none text-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
            }}
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                {t('study.flashcard.answer')}
              </span>
              <p className="text-xl font-medium leading-relaxed mb-6">
                {card.answer}
              </p>
              {card.topic && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {card.topic}
                </span>
              )}
            </div>

            {/* Rating buttons */}
            {onRate && (
              <div className="w-full mt-4">
                <p className="text-xs text-muted-foreground mb-3">
                  {t('study.rating.howWell')}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(RATING_CONFIG) as SRSRating[]).map((rating) => {
                    const config = RATING_CONFIG[rating];
                    return (
                      <button
                        key={rating}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRate(rating);
                        }}
                        className={cn(
                          'px-3 py-3 rounded-none border text-sm font-medium transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                          config.className
                        )}
                        aria-label={t(config.label)}
                        title={`${t(config.label)} (${config.key})`}
                      >
                        {t(config.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <span>{t('study.hints.keyboard')}</span>
      </div>
    </div>
  );
}

/**
 * Memoized flashcard component to prevent unnecessary re-renders
 * (Available for external use if needed)
 */
const MemoizedFlashcardView = memo(FlashcardView);
