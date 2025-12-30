/**
 * @fileoverview Study session component with card navigation
 * @module components/study/study-session
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Flashcard } from '@/lib/knowledge/types';
import type { SRSRating } from '@/lib/study/srs-types';
import { FlashcardView } from './flashcard';
import { StudyStatsDisplay } from './study-stats';
import { useStudySession, useStudyStore } from '@/lib/state/study-store';
import { cn } from '@/lib/utils';

/**
 * Study session component props
 */
export interface StudySessionProps {
  /** Initial cards to study (optional - will load from store if not provided) */
  initialCards?: Flashcard[];
  /** Callback when session is completed */
  onComplete?: (stats: { cardsStudied: number; correct: number; incorrect: number }) => void;
  /** Callback when user wants to exit the session */
  onExit?: () => void;
}

/**
 * Study session component with navigation
 * Supports swipe gestures and keyboard navigation
 */
export function StudySession({
  initialCards,
  onComplete,
  onExit,
}: StudySessionProps) {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const {
    currentSession,
    cards,
    currentCard,
    sessionStats,
    startSession,
    rateCard,
    nextCard,
    previousCard,
    completeSession,
    progress,
    currentIndex,
    totalCards,
    resetSession,
  } = useStudySession();

  const { resetCurrentSession } = useStudyStore();

  // Initialize session with cards
  useEffect(() => {
    if (initialCards && initialCards.length > 0) {
      startSession(initialCards);
    }
  }, [initialCards, startSession]);

  // Handle session completion
  useEffect(() => {
    if (currentSession?.completed && sessionStats && !showStats) {
      setShowStats(true);
      onComplete?.({
        cardsStudied: sessionStats.cardsStudied,
        correct: sessionStats.correct,
        incorrect: sessionStats.incorrect,
      });
    }
  }, [currentSession, sessionStats, showStats, onComplete]);

  // Handle card change - reset flip state
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focus is on interactive elements
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (currentSession?.completed) {
        if (e.key === 'Escape') {
          handleExit();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        case 'Escape':
          if (onExit) {
            e.preventDefault();
            handleExit();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSession, currentIndex, cards.length, onExit]);

  // Handle touch swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const diffX = touchStartRef.current.x - touchEnd.x;
    const diffY = Math.abs(touchStartRef.current.y - touchEnd.y);

    // Minimum swipe distance
    const SWIPE_THRESHOLD = 50;

    // Determine if swipe is horizontal (more horizontal than vertical)
    const isHorizontalSwipe = Math.abs(diffX) > diffY && Math.abs(diffX) > SWIPE_THRESHOLD;

    if (isHorizontalSwipe) {
      if (diffX > 0) {
        // Swipe left - next card
        handleNext();
      } else {
        // Swipe right - previous card
        handlePrevious();
      }
    }

    touchStartRef.current = null;
  }, []);

  // Handle card flip
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Handle card rating
  const handleRate = useCallback(
    (rating: SRSRating) => {
      rateCard(rating);

      // Auto-advance to next card after rating (with short delay for visual feedback)
      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          nextCard();
        } else {
          // Session complete
          completeSession();
        }
      }, 200);
    },
    [rateCard, currentIndex, cards.length, nextCard, completeSession]
  );

  // Navigate to next card
  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      nextCard();
    } else if (!currentSession?.completed) {
      // Complete the session
      completeSession();
    }
  }, [currentIndex, cards.length, currentSession, nextCard, completeSession]);

  // Navigate to previous card
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      previousCard();
    }
  }, [currentIndex, previousCard]);

  // Handle exit
  const handleExit = useCallback(() => {
    resetSession();
    resetCurrentSession();
    onExit?.();
  }, [resetSession, resetCurrentSession, onExit]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setShowStats(false);
    if (initialCards) {
      startSession(initialCards);
    }
  }, [initialCards, startSession]);

  // No cards to study
  if (!currentSession || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">{t('study.session.noCards')}</h2>
        {onExit && (
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-none"
          >
            {t('common.back')}
          </button>
        )}
      </div>
    );
  }

  // Show statistics after session completion
  if (showStats && sessionStats) {
    return (
      <StudyStatsDisplay
        stats={sessionStats}
        totalCardsStudied={cards.length}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full max-w-xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with exit button and progress */}
      <div className="flex items-center justify-between w-full mb-4">
        {onExit && (
          <button
            onClick={handleExit}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('study.navigation.exit')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}

        <span className="text-sm text-muted-foreground">
          {t('study.progress', { current: currentIndex + 1, total: totalCards })}
        </span>

        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Flashcard */}
      {currentCard && (
        <FlashcardView
          card={currentCard}
          onFlip={handleFlip}
          onRate={handleRate}
          isFlipped={isFlipped}
          currentIndex={currentIndex}
          totalCards={totalCards}
        />
      )}

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4 mt-6 w-full">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-none transition-colors',
            currentIndex === 0
              ? 'text-muted-foreground opacity-50'
              : 'bg-muted hover:bg-muted/80'
          )}
          aria-label={t('study.navigation.previous')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">{t('study.navigation.previous')}</span>
        </button>

        <button
          onClick={handleNext}
          className={cn(
            'flex items-center gap-2 px-6 py-2 rounded-none transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          aria-label={
            currentIndex < cards.length - 1
              ? t('study.navigation.next')
              : t('study.navigation.finish')
          }
        >
          <span className="hidden sm:inline">
            {currentIndex < cards.length - 1
              ? t('study.navigation.next')
              : t('study.navigation.finish')}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <p className="mt-4 text-xs text-muted-foreground text-center">
        {t('study.hints.keyboard')}
      </p>
    </div>
  );
}

/**
 * Study session page wrapper
 */
export function StudySessionPage() {
  const { t } = useTranslation();
  const [cards] = useState<Flashcard[]>([]); // Would load from store in real implementation

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('flashcards.studyMode')}</h1>
      <StudySession
        initialCards={cards}
        onExit={() => {
          // Navigate back
          window.history.back();
        }}
      />
    </div>
  );
}
