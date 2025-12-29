/**
 * @fileoverview Quiz generator service using Gemini API
 * @module lib/study/quiz-generator
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { quizGenerationSchema, quizQuestionSchema } from './quiz-types';
import type { QuizQuestion, QuizGenerationResult, QuizDifficulty } from './quiz-types';

/**
 * System prompt for quiz generation
 */
const QUIZ_SYSTEM_PROMPT = `You are an expert educator. Generate a multiple choice quiz from the provided content.

Requirements:
- Each question has 4 options (A, B, C, D)
- Exactly ONE option is correct
- Generate plausible distractors based on common misconceptions
- Include brief explanation (1-2 sentences) for why the correct answer is right
- Assign difficulty level based on complexity:
  * easy: Basic recall, simple definitions
  * medium: Application of concepts, comparisons
  * hard: Analysis, synthesis, edge cases
- Extract or infer topic tags from content
- Cite sources using the source IDs provided

Output: JSON object with quiz data following the provided schema.`;

/**
 * QuizGenerator class for generating quizzes using Gemini API
 */
export class QuizGenerator {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string) {
    // Use provided API key or get from environment
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    this.client = new GoogleGenAI({ api: key });
    this.model = 'gemini-2.5-flash'; // Using the latest flash model
  }

  /**
   * Generate quiz from content
   * @param content - The source content to generate quiz from
   * @param sourceId - The ID of the source content
   * @param options - Generation options
   * @returns Promise<QuizGenerationResult>
   */
  async generateFromContent(
    content: string,
    sourceId: string,
    options: {
      questionCount?: number;
      includeExplanation?: boolean;
      difficulty?: 'mixed' | QuizDifficulty;
      title?: string;
    } = {}
  ): Promise<QuizGenerationResult> {
    const { questionCount = 5, includeExplanation = true, difficulty = 'mixed', title } = options;

    const prompt = this.buildPrompt(content, sourceId, questionCount, difficulty, title);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: zodToJsonSchema(quizGenerationSchema),
      },
    });

    // Parse the response
    const text = response.text ?? '';
    const parsed = JSON.parse(text);

    // Validate with Zod
    const result = quizGenerationSchema.parse(parsed);

    // Ensure source IDs are set correctly
    const questionsWithSource: QuizQuestion[] = result.questions.map((q, index) => ({
      id: `qq-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      topic: q.topic,
      sourceIds: q.sourceIds.length > 0 ? q.sourceIds : [sourceId],
      createdAt: Date.now(),
    }));

    return {
      ...result,
      questions: questionsWithSource,
      totalQuestions: questionsWithSource.length,
      sourcesUsed: result.sourcesUsed.length > 0 ? result.sourcesUsed : [sourceId],
    };
  }

  /**
   * Generate quiz from multiple sources
   * @param sources - Array of { id, title, content } objects
   * @param options - Generation options
   * @returns Promise<QuizGenerationResult>
   */
  async generateFromSources(
    sources: Array<{ id: string; title: string; content: string }>,
    options: {
      questionCount?: number;
      includeExplanation?: boolean;
      difficulty?: 'mixed' | QuizDifficulty;
    } = {}
  ): Promise<QuizGenerationResult> {
    const { questionCount = 5, includeExplanation = true, difficulty = 'mixed' } = options;

    // Combine all source content with source IDs
    const combinedContent = sources
      .map((source) => `[${source.id}] ${source.title}\n${source.content}`)
      .join('\n\n---\n\n');

    const prompt = this.buildPrompt(
      combinedContent,
      sources.map((s) => s.id).join(','),
      questionCount,
      difficulty
    );

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: zodToJsonSchema(quizGenerationSchema),
      },
    });

    // Parse the response
    const text = response.text ?? '';
    const parsed = JSON.parse(text);

    // Validate with Zod
    const result = quizGenerationSchema.parse(parsed);

    // Map questions with proper IDs
    const questionsWithIds: QuizQuestion[] = result.questions.map((q, index) => ({
      id: `qq-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      topic: q.topic,
      sourceIds: q.sourceIds.length > 0 ? q.sourceIds : sources.map((s) => s.id),
      createdAt: Date.now(),
    }));

    return {
      ...result,
      questions: questionsWithIds,
      totalQuestions: questionsWithIds.length,
      sourcesUsed: result.sourcesUsed.length > 0 ? result.sourcesUsed : sources.map((s) => s.id),
    };
  }

  /**
   * Build the prompt for quiz generation
   */
  private buildPrompt(
    content: string,
    sourceId: string,
    questionCount: number,
    difficulty: 'mixed' | QuizDifficulty,
    customTitle?: string
  ): string {
    const difficultySection =
      difficulty === 'mixed'
        ? 'Include a mix of easy, medium, and hard questions'
        : `All questions should be ${difficulty} difficulty`;
    const sourceSection = `\nCite sources using format: [${sourceId}]`;

    return `${QUIZ_SYSTEM_PROMPT}

Content to process:
${content}

Generation settings:
- Question count: ${questionCount}
- ${difficultySection}
- Include explanations: Yes${customTitle ? `\nQuiz title: ${customTitle}` : ''}
${sourceSection}

Generate a ${questionCount}-question quiz covering the key concepts.`;
  }

  /**
   * Validate that API key is configured
   */
  isConfigured(): boolean {
    try {
      return typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.length > 0;
    } catch {
      return false;
    }
  }
}

/**
 * Mock quiz generator for testing without API
 */
export class MockQuizGenerator {
  /**
   * Generate mock quizzes for testing
   */
  generateMockQuiz(
    content: string,
    sourceId: string,
    questionCount: number = 5
  ): QuizGenerationResult {
    const questions: QuizQuestion[] = [];
    const topics = new Set<string>();
    const sourcesUsed = new Set<string>([sourceId]);

    // Generate mock questions based on content
    for (let i = 0; i < questionCount; i++) {
      const difficulty: QuizDifficulty = i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard';
      const topic = `Topic ${(i % 3) + 1}`;
      topics.add(topic);
      sourcesUsed.add(sourceId);

      questions.push({
        id: `qq-mock-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`,
        question: `Question ${i + 1}: What is a key concept about ${topic}?`,
        options: [
          `Correct answer about ${topic}`,
          `Incorrect answer about ${topic}`,
          `Another incorrect answer about ${topic}`,
          `Yet another incorrect answer about ${topic}`,
        ],
        correctIndex: 0,
        explanation: `This is the correct answer because it accurately describes ${topic}.`,
        difficulty,
        topic,
        sourceIds: [sourceId],
        createdAt: Date.now(),
      });
    }

    return {
      title: 'Mock Quiz',
      description: `A ${questionCount}-question quiz generated from the content`,
      questions,
      totalQuestions: questions.length,
      topics: Array.from(topics),
      sourcesUsed: Array.from(sourcesUsed),
    };
  }
}

/**
 * Create a quiz generator instance
 * @param apiKey - Optional API key override
 * @param useMock - Use mock generator for testing
 */
export function createQuizGenerator(
  apiKey?: string,
  useMock: boolean = false
): QuizGenerator | MockQuizGenerator {
  if (useMock || !apiKey) {
    return new MockQuizGenerator();
  }
  return new QuizGenerator(apiKey);
}

/**
 * Generate quiz from text content
 */
export async function generateQuiz(
  content: string,
  sourceId: string,
  options: {
    questionCount?: number;
    includeExplanation?: boolean;
    difficulty?: 'mixed' | QuizDifficulty;
    apiKey?: string;
    useMock?: boolean;
  } = {}
): Promise<QuizGenerationResult> {
  const generator = createQuizGenerator(options.apiKey, options.useMock);

  if (generator instanceof MockQuizGenerator) {
    return generator.generateMockQuiz(content, sourceId, options.questionCount || 5);
  }

  return generator.generateFromContent(content, sourceId, {
    questionCount: options.questionCount,
    includeExplanation: options.includeExplanation,
    difficulty: options.difficulty,
  });
}
