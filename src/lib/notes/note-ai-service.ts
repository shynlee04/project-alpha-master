/**
 * @fileoverview Note AI Service - PHASE 1A STUB
 * @module lib/notes/note-ai-service
 * @phase 1A
 * @stub true
 * 
 * PHASE 1A: AI features are disabled during foundation phase.
 * Original implementation archived to: _phase2-archive/lib/notes/note-ai-service.ts
 * 
 * This stub provides no-op implementations that return errors gracefully,
 * allowing the Notes workspace to function without AI capabilities.
 * 
 * When Phase 2 begins, restore the original implementation.
 */

import type { Block } from '@blocknote/core';

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
 * PHASE 1A STUB: Generate content for a note based on a prompt
 * 
 * AI features are disabled during Phase 1A foundation development.
 * Returns an error indicating AI is not available.
 */
export async function generateNoteContent(
    _prompt: string,
    _options?: NoteAIOptions
): Promise<string> {
    console.log('[NoteAIService] Phase 1A: AI content generation disabled');
    throw new NoteAIError(
        'PHASE_1A_DISABLED',
        'AI features are disabled during Phase 1A foundation development. They will be restored in Phase 2.'
    );
}

/**
 * PHASE 1A STUB: Stream content generation for a note
 * 
 * AI streaming features are disabled during Phase 1A foundation development.
 * Yields an error indicating AI is not available.
 */
export async function* generateNoteContentStream(
    _prompt: string,
    _options?: NoteAIOptions
): AsyncGenerator<{ text: string; done: boolean; error?: string }> {
    console.log('[NoteAIService] Phase 1A: AI streaming disabled');
    yield {
        text: '',
        done: true,
        error: 'AI features are disabled during Phase 1A foundation development. They will be restored in Phase 2.'
    };
}
