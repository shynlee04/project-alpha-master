/**
 * @fileoverview Flashcard Generation API Route
 * @module routes/api/flashcards/generate
 *
 * TanStack Start server route for generating flashcards from sources.
 *
 * @story 9.1 - Flashcard Generator
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { generateFlashcards, MockFlashcardGenerator } from '../../../lib/knowledge/flashcard-generator';
import type { FlashcardGenerationResult } from '../../../lib/knowledge/types';

/**
 * Request body for flashcard generation
 */
interface FlashcardGenerationRequest {
  sourceId: string;
  sourceContent: string;
  sourceTitle?: string;
  options?: {
    minCards?: number;
    maxCards?: number;
    topics?: string[];
  };
  // API configuration
  apiKey?: string;
  useMock?: boolean;
}

/**
 * Error response helper
 */
function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): FlashcardGenerationRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const req = body as Record<string, unknown>;

  // Required fields
  if (!req.sourceId || typeof req.sourceId !== 'string') {
    return null;
  }
  if (!req.sourceContent || typeof req.sourceContent !== 'string') {
    return null;
  }

  // Options (optional)
  const options = req.options as Record<string, unknown> | undefined;
  const validatedOptions = {
    minCards: typeof options?.minCards === 'number' ? options.minCards : undefined,
    maxCards: typeof options?.maxCards === 'number' ? options.maxCards : undefined,
    topics:
      Array.isArray(options?.topics) && options.topics.every((t) => typeof t === 'string')
        ? (options.topics as string[])
        : undefined,
  };

  return {
    sourceId: req.sourceId as string,
    sourceContent: req.sourceContent as string,
    sourceTitle: typeof req.sourceTitle === 'string' ? req.sourceTitle : undefined,
    options: validatedOptions,
    apiKey: typeof req.apiKey === 'string' ? req.apiKey : undefined,
    useMock: req.useMock === true,
  };
}

/**
 * TanStack Start Server Route
 */
export const Route = createFileRoute('/api/flashcards/generate')({
  server: {
    handlers: {
      /**
       * POST handler - generate flashcards from sources
       */
      POST: async ({ request }) => {
        try {
          // Parse request body
          const body = await request.json().catch(() => null);
          const validRequest = validateRequest(body);

          if (!validRequest) {
            return errorResponse('Invalid request body. Required: sourceId (string), sourceContent (string)', 400);
          }

          // Generate flashcards
          let result: FlashcardGenerationResult;

          if (validRequest.useMock) {
            // Use mock generator for testing
            const mockGenerator = new MockFlashcardGenerator();
            result = mockGenerator.generateMockFlashcards(
              validRequest.sourceContent,
              validRequest.sourceId,
              validRequest.options?.maxCards || 5
            );
          } else {
            // Use real Gemini API
            result = await generateFlashcards(validRequest.sourceContent, validRequest.sourceId, {
              minCards: validRequest.options?.minCards,
              maxCards: validRequest.options?.maxCards,
              topics: validRequest.options?.topics,
              apiKey: validRequest.apiKey,
              useMock: false,
            });
          }

          // Return successful response
          return json({
            success: true,
            data: result,
          });
        } catch (error) {
          console.error('Flashcard generation error:', error);

          // Check for specific error types
          if (error instanceof Error) {
            if (error.message.includes('API key') || error.message.includes('authentication')) {
              return errorResponse('Authentication failed. Please check your API key.', 401);
            }
            if (error.message.includes('rate limit') || error.message.includes('429')) {
              return errorResponse('Rate limit exceeded. Please try again later.', 429);
            }
          }

          return errorResponse('Failed to generate flashcards. Please try again.', 500);
        }
      },
    },
  },
});
