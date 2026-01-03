/**
 * Flashcard Exporter - Knowledge → Study Workspace Bridge
 *
 * Exports Knowledge workspace synthesis results to Study workspace as flashcard decks.
 * Supports both single synthesis and batch RAG search result exports.
 *
 * @module lib/knowledge/flashcard-exporter
 * @governance Ralph Loop v3.0, Epic P2-10 AC1
 * @cross_workspace Knowledge → Study
 */

import type { Flashcard, FlashcardDeck } from '@/core/entities/Flashcard';
import type { SynthesisResult } from '@/lib/knowledge/synthesis-types';
import type { SearchResult } from '@/lib/rag/search-types';

/**
 * Flashcard generation options
 */
export interface FlashcardExportOptions {
  /** Flashcard deck name */
  deckName?: string;
  /** Include source citations in flashcards */
  includeSources?: boolean;
  /** Maximum flashcards per synthesis (default: 20) */
  maxCards?: number;
  /** Generate cloze deletion cards (default: true) */
  useClozeDeletion?: boolean;
}

/**
 * Export result
 */
export interface FlashcardExportResult {
  /** Generated flashcard deck */
  deck: FlashcardDeck;
  /** Number of flashcards generated */
  count: number;
  /** Export timestamp */
  exportedAt: Date;
}

/**
 * Flashcard Exporter Class
 *
 * Bridges Knowledge workspace synthesis results to Study workspace flashcards.
 *
 * @example
 * ```typescript
 * const exporter = new FlashcardExporter();
 *
 * // Export single synthesis
 * const result = await exporter.exportToStudy(synthesisResult, {
 *   deckName: 'Chapter 5: Neural Networks',
 *   includeSources: true
 * });
 *
 * // Batch export from RAG results
 * const batchResult = await exporter.generateFlashcardsFromRAG(searchResults, {
 *   deckName: 'AI Concepts Review',
 *   maxCards: 50
 * });
 * ```
 */
export class FlashcardExporter {
  /**
   * Export synthesis result to Study workspace as flashcard deck
   *
   * @param synthesis - Knowledge synthesis result
   * @param options - Export options
   * @returns Flashcard export result with deck metadata
   */
  async exportToStudy(
    synthesis: SynthesisResult,
    options: FlashcardExportOptions = {}
  ): Promise<FlashcardExportResult> {
    const {
      deckName = synthesis.title || 'Knowledge Export',
      includeSources = true,
      maxCards = 20,
      useClozeDeletion = true
    } = options;

    // Generate flashcards from synthesis content
    const flashcards = this.generateFlashcards(
      synthesis.content,
      synthesis.sources,
      {
        includeSources,
        maxCards,
        useClozeDeletion
      }
    );

    // Create flashcard deck
    const deck: FlashcardDeck = {
      id: this.generateDeckId(deckName),
      name: deckName,
      description: this.generateDeckDescription(synthesis),
      flashcards,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        source: 'knowledge-workspace',
        synthesisId: synthesis.id,
        sourceCount: synthesis.sources?.length || 0
      }
    };

    return {
      deck,
      count: flashcards.length,
      exportedAt: new Date()
    };
  }

  /**
   * Generate flashcards from batch RAG search results
   *
   * @param results - RAG search results
   * @param options - Export options
   * @returns Flashcard export result with batch metadata
   */
  async generateFlashcardsFromRAG(
    results: SearchResult[],
    options: FlashcardExportOptions = {}
  ): Promise<FlashcardExportResult> {
    const {
      deckName = 'RAG Search Results',
      includeSources = true,
      maxCards = 50,
      useClozeDeletion = true
    } = options;

    // Aggregate content from all search results
    const allFlashcards: Flashcard[] = [];

    for (const result of results.slice(0, maxCards)) {
      const cards = this.generateFlashcards(
        result.content,
        result.metadata?.sourceId ? [{ id: result.metadata.sourceId, title: result.metadata.title || 'Unknown' }] : [],
        {
          includeSources,
          maxCards: Math.ceil(maxCards / results.length),
          useClozeDeletion
        }
      );

      allFlashcards.push(...cards);
    }

    // Create deck from batch results
    const deck: FlashcardDeck = {
      id: this.generateDeckId(deckName),
      name: deckName,
      description: `Generated from ${results.length} RAG search results`,
      flashcards: allFlashcards,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        source: 'rag-search',
        resultCount: results.length
      }
    };

    return {
      deck,
      count: allFlashcards.length,
      exportedAt: new Date()
    };
  }

  /**
   * Generate flashcards from content with sources
   *
   * @private
   */
  private generateFlashcards(
    content: string,
    sources: Array<{ id: string; title: string }> = [],
    options: {
      includeSources: boolean;
      maxCards: number;
      useClozeDeletion: boolean;
    }
  ): Flashcard[] {
    const flashcards: Flashcard[] = [];
    const sentences = this.extractKeySentences(content);

    for (const sentence of sentences.slice(0, options.maxCards)) {
      if (options.useClozeDeletion) {
        // Generate cloze deletion card
        const cloze = this.generateClozeCard(sentence, sources, options.includeSources);
        flashcards.push(cloze);
      } else {
        // Generate Q&A card
        const qa = this.generateQACard(sentence, sources, options.includeSources);
        flashcards.push(qa);
      }
    }

    return flashcards;
  }

  /**
   * Extract key sentences from content
   *
   * @private
   */
  private extractKeySentences(content: string): string[] {
    // Split by periods and filter out empty/short sentences
    const sentences = content
      .split('.')
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200);

    return sentences;
  }

  /**
   * Generate cloze deletion flashcard
   *
   * @private
   */
  private generateClozeCard(
    sentence: string,
    sources: Array<{ id: string; title: string }>,
    includeSources: boolean
  ): Flashcard {
    // Find key term to cloze (first word > 5 chars)
    const words = sentence.split(' ');
    const keyIndex = words.findIndex(w => w.length > 5);
    const clozeIndex = keyIndex >= 0 ? keyIndex : Math.floor(words.length / 2);

    const clozedWords = [...words];
    clozedWords[clozeIndex] = '{{c1::' + clozedWords[clozeIndex] + '}}';

    return {
      id: this.generateCardId(),
      type: 'cloze',
      question: clozedWords.join(' '),
      answer: words[clozeIndex],
      context: includeSources ? sources.map(s => s.title).join(', ') : undefined,
      createdAt: new Date()
    };
  }

  /**
   * Generate Q&A flashcard
   *
   * @private
   */
  private generateQACard(
    sentence: string,
    sources: Array<{ id: string; title: string }>,
    includeSources: boolean
  ): Flashcard {
    // Convert statement to question
    const question = `What is described: ${sentence.slice(0, 50)}...?`;

    return {
      id: this.generateCardId(),
      type: 'basic',
      question,
      answer: sentence,
      context: includeSources ? sources.map(s => s.title).join(', ') : undefined,
      createdAt: new Date()
    };
  }

  /**
   * Generate deck ID from name
   *
   * @private
   */
  private generateDeckId(name: string): string {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `deck_${slug}_${Date.now()}`;
  }

  /**
   * Generate card ID
   *
   * @private
   */
  private generateCardId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate deck description from synthesis
   *
   * @private
   */
  private generateDeckDescription(synthesis: SynthesisResult): string {
    const sourceCount = synthesis.sources?.length || 0;
    return `Flashcards generated from: ${synthesis.title}\n` +
           `Sources: ${sourceCount} document${sourceCount !== 1 ? 's' : ''}\n` +
           `Created: ${new Date().toLocaleDateString()}`;
  }
}
