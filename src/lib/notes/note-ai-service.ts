/**
 * @fileoverview Note AI Service - Phase C Implementation
 * @module lib/notes/note-ai-service
 * @phase C
 *
 * AI content generation for Notes workspace using the unified AI Gateway.
 * Supports text generation, streaming, and convenience methods (summarize, translate, etc.)
 */

import type { Block } from '@blocknote/core';
import { aiGateway } from '@/infrastructure/ai';

/**
 * Options for AI content generation
 */
export interface NoteAIOptions {
  /** Override default active agent */
  agentId?: string;
  /** Context blocks from current note */
  contextBlocks?: Block[];
  /** Override agent's system prompt */
  systemPromptOverride?: string;
  /** Model to use (default: gemini-2.0-flash) */
  model?: string;
  /** Provider to use (default: gemini) */
  provider?: 'gemini' | 'openrouter';
}

/**
 * Error codes for AI service
 */
export const NOTE_AI_ERRORS = {
  NO_AGENT: 'NO_AGENT',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  NO_API_KEY: 'NO_API_KEY',
  API_ERROR: 'API_ERROR',
  PHASE_1A_DISABLED: 'PHASE_1A_DISABLED',
} as const;

/**
 * Custom error class for AI service errors
 */
export class NoteAIError extends Error {
  code: keyof typeof NOTE_AI_ERRORS;

  constructor(code: keyof typeof NOTE_AI_ERRORS, message: string) {
    super(message);
    this.name = 'NoteAIError';
    this.code = code;
  }
}

/**
 * Build context from note blocks
 */
function buildContext(blocks?: Block[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      // Extract text content from block - handle various content types safely
      const content = block.content;
      if (!content) return '';
      
      // Content can be an array of inline content or a table content
      if (Array.isArray(content)) {
        return content
          .map((item) => {
            // Each item can be text, link, or other inline content
            if (typeof item === 'object' && item !== null && 'text' in item) {
              return (item as { text?: string }).text || '';
            }
            return '';
          })
          .join('');
      }
      
      // For non-array content (like TableContent), skip
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Generate content for a note based on a prompt
 *
 * Uses the AI Gateway to generate text content.
 *
 * @param prompt - The generation prompt
 * @param options - Generation options
 * @returns Generated content string
 */
export async function generateNoteContent(
  prompt: string,
  options?: NoteAIOptions
): Promise<string> {
  console.log('[NoteAIService] Generating content:', { prompt: prompt.slice(0, 50) });

  try {
    // Build context from blocks if provided
    const context = buildContext(options?.contextBlocks);
    const fullPrompt = context
      ? `Context:\n${context}\n\nRequest: ${prompt}`
      : prompt;

    // Use gateway generate method
    const result = await aiGateway.generate({
      type: 'text',
      provider: options?.provider ?? 'gemini',
      model: options?.model ?? 'gemini-2.0-flash',
      prompt: options?.systemPromptOverride
        ? `${options.systemPromptOverride}\n\n${fullPrompt}`
        : fullPrompt,
    });

    return result.text ?? '';
  } catch (error) {
    console.error('[NoteAIService] Generation failed:', error);

    if (error instanceof Error && error.message.includes('No API key')) {
      throw new NoteAIError(
        'NO_API_KEY',
        'No API key configured. Please add your API key in Settings > Providers.'
      );
    }

    throw new NoteAIError(
      'API_ERROR',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Stream content generation for a note
 *
 * Uses the AI Gateway to stream text content progressively.
 *
 * @param prompt - The generation prompt
 * @param options - Generation options
 * @yields Progress chunks with text and done flag
 */
export async function* generateNoteContentStream(
  prompt: string,
  options?: NoteAIOptions
): AsyncGenerator<{ text: string; done: boolean; error?: string }> {
  console.log('[NoteAIService] Starting stream:', { prompt: prompt.slice(0, 50) });

  try {
    // Build context from blocks if provided
    const context = buildContext(options?.contextBlocks);
    const fullPrompt = context
      ? `Context:\n${context}\n\nRequest: ${prompt}`
      : prompt;

    // Use gateway chat method for streaming
    const stream = aiGateway.chat({
      provider: options?.provider ?? 'gemini',
      model: options?.model ?? 'gemini-2.0-flash',
      messages: [
        ...(options?.systemPromptOverride
          ? [{ role: 'system' as const, content: options.systemPromptOverride }]
          : []),
        { role: 'user' as const, content: fullPrompt },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content' && chunk.delta) {
        yield { text: chunk.delta, done: false };
      } else if (chunk.type === 'error') {
        yield { text: '', done: true, error: chunk.error };
        return;
      } else if (chunk.type === 'done') {
        yield { text: '', done: true };
        return;
      }
    }

    yield { text: '', done: true };
  } catch (error) {
    console.error('[NoteAIService] Stream failed:', error);

    const errorMessage =
      error instanceof Error && error.message.includes('No API key')
        ? 'No API key configured. Please add your API key in Settings > Providers.'
        : error instanceof Error
          ? error.message
          : 'Unknown error';

    yield { text: '', done: true, error: errorMessage };
  }
}

/**
 * Summarize content
 *
 * @param content - Content to summarize
 * @param options - Generation options
 * @returns Summary string
 */
export async function summarize(
  content: string,
  options?: NoteAIOptions
): Promise<string> {
  return generateNoteContent(
    `Please summarize the following content concisely:\n\n${content}`,
    options
  );
}

/**
 * Continue writing from existing content
 *
 * @param content - Existing content to continue from
 * @param options - Generation options
 * @returns Continuation string
 */
export async function continueWriting(
  content: string,
  options?: NoteAIOptions
): Promise<string> {
  return generateNoteContent(
    `Continue writing naturally from this text:\n\n${content}`,
    options
  );
}

/**
 * Translate content to target language
 *
 * @param content - Content to translate
 * @param targetLanguage - Target language (e.g., 'Vietnamese', 'English')
 * @param options - Generation options
 * @returns Translated string
 */
export async function translate(
  content: string,
  targetLanguage: string,
  options?: NoteAIOptions
): Promise<string> {
  return generateNoteContent(
    `Translate the following text to ${targetLanguage}. Only provide the translation, no explanations:\n\n${content}`,
    options
  );
}

/**
 * Expand content with more detail
 *
 * @param content - Content to expand
 * @param options - Generation options
 * @returns Expanded string
 */
export async function expand(
  content: string,
  options?: NoteAIOptions
): Promise<string> {
  return generateNoteContent(
    `Expand on the following content with more detail and explanation:\n\n${content}`,
    options
  );
}

/**
 * Simplify content
 *
 * @param content - Content to simplify
 * @param options - Generation options
 * @returns Simplified string
 */
export async function simplify(
  content: string,
  options?: NoteAIOptions
): Promise<string> {
  return generateNoteContent(
    `Simplify the following content, making it easier to understand:\n\n${content}`,
    options
  );
}

/**
 * Generate an outline from content
 *
 * @param content - Content to outline
 * @param options - Generation options
 * @returns Outline string in markdown format
 */
export async function generateOutline(
  content: string,
  options?: NoteAIOptions
): Promise<string> {
  return generateNoteContent(
    `Create a structured outline from the following content using markdown bullet points:\n\n${content}`,
    options
  );
}

/**
 * Generate study questions from content
 *
 * @param content - Content to generate questions from
 * @param options - Generation options
 * @returns Questions string
 */
export async function generateQuestions(
  content: string,
  options?: NoteAIOptions
): Promise<string> {
  return generateNoteContent(
    `Generate 5 study questions to help understand and remember this content:\n\n${content}`,
    options
  );
}
