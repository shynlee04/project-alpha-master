/**
 * @fileoverview Flashcard Preview Component
 * @module components/knowledge/flashcard-preview
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Flashcard, FlashcardGenerationResult } from '@/lib/knowledge/types';

interface FlashcardPreviewProps {
  preview: FlashcardGenerationResult;
  onApprove: (cards: Flashcard[]) => void;
  onDiscard: () => void;
  onEditCard?: (index: number, card: Flashcard) => void;
}

/**
 * Individual flashcard for preview display
 */
function FlashcardCard({
  card,
  index,
  onEdit,
  isFlipped,
  onFlip,
}: {
  card: Flashcard;
  index: number;
  onEdit?: (index: number, card: Flashcard) => void;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  const { t } = useTranslation();
  const difficultyColors = {
    easy: 'bg-success/20 text-success border-success/30',
    medium: 'bg-warning/20 text-warning border-warning/30',
    hard: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <div
      className={`relative w-full h-64 cursor-pointer perspective-1000 group`}
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-300 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full backface-hidden bg-card border-2 border-border rounded-none p-6 shadow-md"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground">{t('flashcards.preview.questionNumber', { number: index + 1 })}</span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${difficultyColors[card.difficulty]}`}
            >
              {card.difficulty}
            </span>
          </div>
          <p className="text-lg font-medium text-foreground">{card.question}</p>
          <p className="text-sm text-muted-foreground mt-4">{t('flashcards.preview.clickToReveal')}</p>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full backface-hidden bg-secondary border-2 border-border rounded-none p-6 shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground">{t('flashcards.preview.answer')}</span>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(index, card);
                }}
                className="text-xs text-info hover:text-info/80"
              >
                {t('flashcards.preview.edit')}
              </button>
            )}
          </div>
          <p className="text-lg font-medium text-foreground">{card.answer}</p>
          {card.topic && (
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="px-2 py-1 text-xs bg-info/20 text-info rounded-none">
                {card.topic}
              </span>
            </div>
          )}
          {card.sourceIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Sources: {card.sourceIds.map((id) => `[${id}]`).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * FlashcardPreview component displays generated flashcards before saving
 * Shows first 5 cards in a flip card interface with approve/discard options
 */
export function FlashcardPreview({ preview, onApprove, onDiscard, onEditCard }: FlashcardPreviewProps) {
  const { t } = useTranslation();
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  // Transform preview cards to ensure they have required Flashcard fields
  const [editedCards, setEditedCards] = useState<Flashcard[]>(
    preview.cards.map((card: Partial<Flashcard>) => ({
      ...card,
      id: card.id || `fc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: card.createdAt || Date.now(),
    } as Flashcard))
  );

  const toggleFlip = (index: number) => {
    setFlippedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleEditCard = (index: number, card: Flashcard) => {
    const newCards = [...editedCards];
    newCards[index] = card;
    setEditedCards(newCards);
    onEditCard?.(index, card);
  };

  // Show only first 5 cards for preview
  const previewCards = editedCards.slice(0, 5);
  const remainingCount = editedCards.length - 5;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t('flashcards.preview.title')}</h2>
        <p className="text-muted-foreground mt-1">
          {t('flashcards.preview.description')}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-info/10 border border-info/30 rounded-none p-4">
          <p className="text-sm text-info">{t('flashcards.preview.totalCards')}</p>
          <p className="text-2xl font-bold text-info">{preview.totalCards}</p>
        </div>
        <div className="bg-success/10 border border-success/30 rounded-none p-4">
          <p className="text-sm text-success">{t('flashcards.preview.topics')}</p>
          <p className="text-2xl font-bold text-success">{preview.topics.length}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-none p-4">
          <p className="text-sm text-purple-400">{t('flashcards.preview.sources')}</p>
          <p className="text-2xl font-bold text-purple-300">{preview.sourcesUsed.length}</p>
        </div>
      </div>

      {/* Topics and sources */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-2">
          {preview.topics.map((topic) => (
            <span key={topic} className="px-3 py-1 text-sm bg-info/20 text-info rounded-none">
              {topic}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Sources: {preview.sourcesUsed.map((id) => `[${id}]`).join(', ')}
        </p>
      </div>

      {/* Flashcard grid - show first 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {previewCards.map((card, index) => (
          <FlashcardCard
            key={card.id}
            card={card}
            index={index}
            onEdit={onEditCard ? handleEditCard : undefined}
            isFlipped={flippedIndices.has(index)}
            onFlip={() => toggleFlip(index)}
          />
        ))}
      </div>

      {/* Remaining cards notice */}
      {remainingCount > 0 && (
        <p className="text-center text-muted-foreground mb-6">
          And {remainingCount} more card{remainingCount > 1 ? 's' : ''}...
        </p>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onDiscard}
          className="px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-none hover:bg-muted transition-colors"
        >
          {t('flashcards.preview.discard')}
        </button>
        <button
          onClick={() => onApprove(editedCards)}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-none hover:bg-primary/90 transition-colors"
        >
          {t('flashcards.preview.saveAll', { count: editedCards.length })}
        </button>
      </div>
    </div>
  );
}

/**
 * Simple loading state for flashcard preview
 */
export function FlashcardPreviewLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-none"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state for no flashcards
 */
export function FlashcardPreviewEmpty() {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-4xl mx-auto p-6 text-center">
      <p className="text-muted-foreground">{t('flashcards.preview.empty')}</p>
    </div>
  );
}
