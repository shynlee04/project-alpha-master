/**
 * @fileoverview AI-powered flashcard generator
 * @module lib/knowledge/flashcard-generator
 */

import type { Flashcard, Deck } from './flashcard-types';

/**
 * Flashcard generation options
 */
export interface FlashcardGenerationOptions {
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'cloze' | 'basic' | 'both';
  includeImages?: boolean;
  sourceText: string;
}

/**
 * Generate flashcards from source text
 */
export async function generateFlashcards(
  options: FlashcardGenerationOptions
): Promise<Flashcard[]> {
  const { sourceText, count = 10, difficulty = 'medium', type = 'both' } = options;

  // In a real implementation, this would call an AI API
  // For now, simulate with simple extraction
  const sentences = extractSentences(sourceText);
  const flashcards: Flashcard[] = [];

  for (const sentence of sentences.slice(0, count)) {
    if (type === 'basic' || type === 'both') {
      const basicCard = generateBasicCard(sentence, difficulty);
      if (basicCard) {
        flashcards.push(basicCard);
      }
    }

    if (type === 'cloze' || type === 'both') {
      const clozeCard = generateClozeCard(sentence, difficulty);
      if (clozeCard) {
        flashcards.push(clozeCard);
      }
    }
  }

  return flashcards;
}

/**
 * Extract sentences from text
 */
function extractSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 200);
}

/**
 * Generate basic Q&A flashcard
 */
function generateBasicCard(
  sentence: string,
  difficulty: string
): Flashcard | null {
  const words = sentence.split(' ');

  // Find a key concept (longer words are more likely to be concepts)
  const conceptWords = words.filter((w) => w.length > 5);
  if (conceptWords.length === 0) return null;

  const concept = conceptWords[Math.floor(Math.random() * conceptWords.length)];
  const definition = getDefinitionForWord(concept, difficulty);

  if (!definition) return null;

  return {
    id: crypto.randomUUID(),
    front: `What is "${concept}"?`,
    back: definition,
    type: 'basic',
    difficulty,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Generate cloze deletion card
 */
function generateClozeCard(
  sentence: string,
  difficulty: string
): Flashcard | null {
  const words = sentence.split(' ');

  // Find a blankable word
  const blankableWords = words.filter(
    (w) => w.length > 4 && !w.includes('http')
  );
  if (blankableWords.length === 0) return null;

  const wordToBlank = blankableWords[Math.floor(Math.random() * blankableWords.length)];

  // Create cloze text
  const clozeText = sentence.replace(
    wordToBlank,
    `___${' '.repeat(Math.min(wordToBlank.length - 2, 8))}___`
  );

  return {
    id: crypto.randomUUID(),
    front: clozeText,
    back: wordToBlank,
    type: 'cloze',
    difficulty,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get definition for a word (placeholder - would use dictionary API)
 */
function getDefinitionForWord(
  word: string,
  difficulty: string
): string | null {
  // Placeholder - in real implementation, call dictionary API
  const definitions: Record<string, string[]> = {
    important: [
      'Of great significance or value',
      'Likely to have a major effect on success',
    ],
    concept: [
      'An abstract idea; a general notion',
      'Something conceived in the mind',
    ],
  };

  const lowerWord = word.toLowerCase();
  const defs = definitions[lowerWord];

  if (!defs) return null;

  if (difficulty === 'easy') return defs[0];
  if (difficulty === 'hard') return defs[1] || defs[0];
  return defs[Math.floor(Math.random() * defs.length)];
}

/**
 * Generate deck from multiple sources
 */
export async function generateDeckFromSources(
  sources: { text: string; title?: string }[],
  options: Partial<FlashcardGenerationOptions> = {}
): Promise<Deck> {
  const allFlashcards: Flashcard[] = [];

  for (const source of sources) {
    const flashcards = await generateFlashcards({
      ...options,
      sourceText: source.text,
    });
    allFlashcards.push(...flashcards);
  }

  return {
    id: crypto.randomUUID(),
    name: options.sourceText
      ? 'Generated Flashcards'
      : `Flashcards from ${sources.length} sources`,
    description: `Auto-generated deck with ${allFlashcards.length} flashcards`,
    cards: allFlashcards,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Analyze source text and suggest card count
 */
export function suggestCardCount(
  text: string,
  options: { sentencesPerCard?: number } = {}
): { suggestedCount: number; rationale: string } {
  const sentences = extractSentences(text);
  const { sentencesPerCard = 2 } = options;

  const suggestedCount = Math.ceil(sentences.length / sentencesPerCard);

  return {
    suggestedCount: Math.min(suggestedCount, 50), // Cap at 50
    rationale: `Based on ${sentences.length} sentences, suggesting ${suggestedCount} cards (${sentencesPerCard} sentences per card)`,
  };
}
