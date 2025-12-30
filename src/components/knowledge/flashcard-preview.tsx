/**
 * @fileoverview Flashcard Preview Component
 * @module components/knowledge/flashcard-preview
 */

import { useState } from 'react';
import type { Flashcard, FlashcardGenerationResult } from '../../lib/knowledge/types';

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
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hard: 'bg-red-100 text-red-800 border-red-300',
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
          className="absolute w-full h-full backface-hidden bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-medium text-gray-500">Question {index + 1}</span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${difficultyColors[card.difficulty]}`}
            >
              {card.difficulty}
            </span>
          </div>
          <p className="text-lg font-medium text-gray-900">{card.question}</p>
          <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full backface-hidden bg-gray-50 border-2 border-gray-200 rounded-lg p-6 shadow-md"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-medium text-gray-500">Answer</span>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(index, card);
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-lg font-medium text-gray-900">{card.answer}</p>
          {card.topic && (
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {card.topic}
              </span>
            </div>
          )}
          {card.sourceIds.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
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
        <h2 className="text-2xl font-bold text-gray-900">Flashcard Preview</h2>
        <p className="text-gray-600 mt-1">
          Review your generated flashcards before saving. Click a card to flip it.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
          <p className="text-sm text-blue-600">Total Cards</p>
          <p className="text-2xl font-bold text-blue-900">{preview.totalCards}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-none p-4">
          <p className="text-sm text-green-600">Topics</p>
          <p className="text-2xl font-bold text-green-900">{preview.topics.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-none p-4">
          <p className="text-sm text-purple-600">Sources</p>
          <p className="text-2xl font-bold text-purple-900">{preview.sourcesUsed.length}</p>
        </div>
      </div>

      {/* Topics and sources */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-2">
          {preview.topics.map((topic) => (
            <span key={topic} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-none">
              {topic}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">
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
        <p className="text-center text-gray-500 mb-6">
          And {remainingCount} more card{remainingCount > 1 ? 's' : ''}...
        </p>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onDiscard}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Discard
        </button>
        <button
          onClick={() => onApprove(editedCards)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save All {editedCards.length} Cards
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
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
  return (
    <div className="w-full max-w-4xl mx-auto p-6 text-center">
      <p className="text-gray-500">No flashcards to preview. Generate flashcards first.</p>
    </div>
  );
}
