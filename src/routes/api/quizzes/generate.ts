/**
 * @fileoverview API endpoint for quiz generation
 * @module routes/api/quizzes/generate
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { createQuizGenerator } from '@/lib/study/quiz-generator';

const app = new Hono();

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
 * POST /api/quizzes/generate
 * Generate a quiz from sources
 */
app.post('/generate', async (c) => {
  try {
    const body = await c.req.json();

    // Validate request
    const validated = generateQuizSchema.safeParse(body);
    if (!validated.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid request',
          details: validated.error.flatten(),
        },
        400
      );
    }

    const { sourceIds, options } = validated.data;

    // Get API key from environment or request header
    const apiKey = c.env?.GEMINI_API_KEY || c.req.header('x-gemini-api-key') || undefined;

    // Create generator
    const generator = createQuizGenerator(apiKey, !apiKey);

    // For now, use mock generation if no API key
    if (!apiKey) {
      const mockQuiz = generator.generateMockQuiz(
        'Sample content for quiz generation',
        sourceIds[0],
        options?.questionCount || 5
      );

      return c.json({
        success: true,
        data: mockQuiz,
      });
    }

    // TODO: Fetch source content from database
    // For now, return error indicating sources need to be loaded
    return c.json(
      {
        success: false,
        error: 'Source content loading not yet implemented',
        message: 'Epic 6 (Source Ingestion) must be completed first',
      },
      501
    );
  } catch (error) {
    console.error('Quiz generation error:', error);

    return c.json(
      {
        success: false,
        error: 'Failed to generate quiz',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * GET /api/quizzes/generate
 * Health check for quiz generation endpoint
 */
app.get('/generate', (c) => {
  return c.json({
    success: true,
    message: 'Quiz generation endpoint is ready',
    methods: ['POST'],
  });
});

export default app;
