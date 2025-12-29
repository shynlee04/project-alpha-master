/**
 * @fileoverview Flashcard generator service using Gemini API
 * @module lib/knowledge/flashcard-generator
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { flashcardSchema, flashcardGenerationSchema } from './types';
import type { Flashcard, FlashcardGenerationResult, FlashcardDifficulty } from './types';

/**
 * System prompt for flashcard generation
 */
const FLASHCARD_SYSTEM_PROMPT = `You are an expert educator. Generate high-quality flashcards from the provided content.

Requirements:
- Each flashcard has a question (front) and answer (back)
- Focus on key concepts, definitions, and important facts
- Assign difficulty level based on complexity:
  * easy: Basic recall, simple definitions
  * medium: Application of concepts, comparisons
  * hard: Analysis, synthesis, edge cases
- Extract or infer topic tags from content
- Cite sources using the source IDs provided

Output: JSON object with cards array following the provided schema.`;

/**
 * FlashcardGenerator class for generating flashcards using Gemini API
 */
export class FlashcardGenerator {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string) {
    // Use provided API key or get from environment
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    this.client = new GoogleGenAI({ api: key });
    this.model = 'gemini-2.5-flash'; // Using the latest flash model
  }

  /**
   * Generate flashcards from content
   * @param content - The source content to generate flashcards from
   * @param sourceId - The ID of the source content
   * @param options - Generation options
   * @returns Promise<FlashcardGenerationResult>
   */
  async generateFromContent(
    content: string,
    sourceId: string,
    options: {
      minCards?: number;
      maxCards?: number;
      topics?: string[];
    } = {}
  ): Promise<FlashcardGenerationResult> {
    const { minCards = 5, maxCards = 15, topics = [] } = options;

    const prompt = this.buildPrompt(content, sourceId, minCards, maxCards, topics);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: zodToJsonSchema(flashcardGenerationSchema),
      },
    });

    // Parse the response
    const text = response.text ?? '';
    const parsed = JSON.parse(text);

    // Validate with Zod
    const result = flashcardGenerationSchema.parse(parsed);

    // Ensure source IDs are set correctly
    const cardsWithSource: Flashcard[] = result.cards.map((card, index) => ({
      id: `fc-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty as FlashcardDifficulty,
      topic: card.topic,
      sourceIds: card.sourceIds.length > 0 ? card.sourceIds : [sourceId],
      createdAt: Date.now(),
    }));

    return {
      ...result,
      cards: cardsWithSource,
      totalCards: cardsWithSource.length,
      sourcesUsed: result.sourcesUsed.length > 0 ? result.sourcesUsed : [sourceId],
    };
  }

  /**
   * Generate flashcards from multiple sources
   * @param sources - Array of { id, title, content } objects
   * @param options - Generation options
   * @returns Promise<FlashcardGenerationResult>
   */
  async generateFromSources(
    sources: Array<{ id: string; title: string; content: string }>,
    options: {
      minCards?: number;
      maxCards?: number;
      topics?: string[];
    } = {}
  ): Promise<FlashcardGenerationResult> {
    const { minCards = 5, maxCards = 15, topics = [] } = options;

    // Combine all source content with source IDs
    const combinedContent = sources
      .map((source, index) => `[${source.id}] ${source.title}\n${source.content}`)
      .join('\n\n---\n\n');

    const prompt = this.buildPrompt(combinedContent, sources.map((s) => s.id).join(','), minCards, maxCards, topics);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: zodToJsonSchema(flashcardGenerationSchema),
      },
    });

    // Parse the response
    const text = response.text ?? '';
    const parsed = JSON.parse(text);

    // Validate with Zod
    const result = flashcardGenerationSchema.parse(parsed);

    // Map cards with proper IDs
    const cardsWithIds: Flashcard[] = result.cards.map((card, index) => ({
      id: `fc-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty as FlashcardDifficulty,
      topic: card.topic,
      sourceIds: card.sourceIds.length > 0 ? card.sourceIds : sources.map((s) => s.id),
      createdAt: Date.now(),
    }));

    return {
      ...result,
      cards: cardsWithIds,
      totalCards: cardsWithIds.length,
      sourcesUsed: result.sourcesUsed.length > 0 ? result.sourcesUsed : sources.map((s) => s.id),
    };
  }

  /**
   * Build the prompt for flashcard generation
   */
  private buildPrompt(
    content: string,
    sourceId: string,
    minCards: number,
    maxCards: number,
    topics: string[]
  ): string {
    const topicSection = topics.length > 0 ? `\nFocus on these topics: ${topics.join(', ')}` : '';
    const sourceSection = `\nCite sources using format: [${sourceId}]`;

    return `${FLASHCARD_SYSTEM_PROMPT}

Content to process:
${content}

Generation settings:
- Minimum cards: ${minCards}
- Maximum cards: ${maxCards}
${topicSection}
${sourceSection}

Generate ${minCards}-${maxCards} flashcards covering the key concepts.`;
  }

  /**
   * Validate that API key is configured
   */
  isConfigured(): boolean {
    try {
      // Check if we can make a simple validation
      return typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.length > 0;
    } catch {
      return false;
    }
  }
}

/**
 * Mock flashcard generator for testing without API
 */
export class MockFlashcardGenerator {
  /**
   * Generate mock flashcards for testing
   */
  generateMockFlashcards(
    content: string,
    sourceId: string,
    count: number = 5
  ): FlashcardGenerationResult {
    const cards: Flashcard[] = [];
    const topics = new Set<string>();
    const sourcesUsed = new Set<string>([sourceId]);

    // Generate mock flashcards based on content
    for (let i = 0; i < count; i++) {
      const difficulty: FlashcardDifficulty = i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard';
      const topic = `Topic ${(i % 3) + 1}`;
      topics.add(topic);

      cards.push({
        id: `fc-mock-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`,
        question: `Question ${i + 1} about ${topic}?`,
        answer: `Answer ${i + 1} provides detailed information about ${topic}.`,
        difficulty,
        topic,
        sourceIds: [sourceId],
        createdAt: Date.now(),
      });
    }

    return {
      cards,
      totalCards: cards.length,
      topics: Array.from(topics),
      sourcesUsed: Array.from(sourcesUsed),
    };
  }
}

/**
 * Create a flashcard generator instance
 * @param apiKey - Optional API key override
 * @param useMock - Use mock generator for testing
 */
export function createFlashcardGenerator(apiKey?: string, useMock: boolean = false): FlashcardGenerator | MockFlashcardGenerator {
  if (useMock || !apiKey) {
    return new MockFlashcardGenerator();
  }
  return new FlashcardGenerator(apiKey);
}

/**
 * Generate flashcards from text content
 */
export async function generateFlashcards(
  content: string,
  sourceId: string,
  options: {
    minCards?: number;
    maxCards?: number;
    topics?: string[];
    apiKey?: string;
    useMock?: boolean;
  } = {}
): Promise<FlashcardGenerationResult> {
  const generator = createFlashcardGenerator(options.apiKey, options.useMock);

  if (generator instanceof MockFlashcardGenerator) {
    return generator.generateMockFlashcards(content, sourceId, options.maxCards || 5);
  }

  return generator.generateFromContent(content, sourceId, {
    minCards: options.minCards,
    maxCards: options.maxCards,
    topics: options.topics,
  });
}
