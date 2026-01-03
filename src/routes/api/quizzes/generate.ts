/**
 * @fileoverview API endpoint for quiz generation
 * @module routes/api/quizzes/generate
 *
 * TanStack Start server route for quiz generation.
 *
 * @epic Epic 9 - Study Artifacts Generation
 * @story 9.2 - Quiz Generator
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { createQuizGenerator } from '@/lib/study/quiz-generator';

// Request validation schema
const generateQuizSchema = z.object({
  sourceIds: z.array(z.string()).min(1),
  options: z
    .object({
      questionCount: z.number().min(3).max(20).default(5),
      includeExplanation: z.boolean().default(true),
      difficulty: z.enum(['mixed', 'easy', 'medium', 'hard']).default('mixed'),
    })
    .optional(),
});

/**
 * Request body type
 */
interface GenerateQuizRequest {
  sourceIds: string[];
  options?: {
    questionCount?: number;
    includeExplanation?: boolean;
    difficulty?: 'mixed' | 'easy' | 'medium' | 'hard';
  };
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): { success: true; data: GenerateQuizRequest } | { success: false; error: any } {
  const result = generateQuizSchema.safeParse(body);
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }
  return { success: true, data: result.data };
}

/**
 * Error response helper
 */
function errorResponse(message: string, details?: any, status: number = 500) {
  return json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * TanStack Start Server Route
 */
export const Route = createFileRoute('/api/quizzes/generate')({
  server: {
    handlers: {
      /**
       * POST handler - generate quiz from sources
       */
      POST: async ({ request }) => {
        try {
          // Parse request body
          const body = await request.json();

          // Validate request
          const validated = validateRequest(body);
          if (!validated.success) {
            return errorResponse('Invalid request', validated.error, 400);
          }

          const { sourceIds, options } = validated.data;

          // Get API key from request header
          const apiKey = request.headers.get('x-gemini-api-key') || undefined;

          // Create generator
          const generator = createQuizGenerator(apiKey, !apiKey);

          // For now, use mock generation if no API key
          if (!apiKey) {
            // Type guard to check if it's MockQuizGenerator
            const mockGenerator = generator as any;
            if (typeof mockGenerator.generateMockQuiz === 'function') {
              const mockQuiz = mockGenerator.generateMockQuiz(
                'Sample content for quiz generation',
                sourceIds[0],
                options?.questionCount || 5
              );

              return json({
                success: true,
                data: mockQuiz,
              });
            }
          }

          // TODO: Fetch source content from database
          // For now, return error indicating sources need to be loaded
          return errorResponse(
            'Source content loading not yet implemented',
            { message: 'Epic 6 (Source Ingestion) must be completed first' },
            501
          );
        } catch (error) {
          console.error('Quiz generation error:', error);

          return errorResponse(
            'Failed to generate quiz',
            { message: error instanceof Error ? error.message : 'Unknown error' },
            500
          );
        }
      },
    },
  },
});
