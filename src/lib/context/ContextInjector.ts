/**
 * @fileoverview Context Injector for AI Chat
 * @module lib/context/ContextInjector
 * @governance EPIC-31-4
 *
 * Injects note context into AI system prompts.
 * Provides toggle, formatting, and token limit handling.
 *
 * Story 31.4: Context Injection System
 */

import { buildNoteContext } from './ContextEngine';
import type { NoteContext } from './ContextEngine';

// ============================================================================
// Types
// ============================================================================

/**
 * Model token limits (approximate)
 * Sources: Claude (200k), GPT-4 (128k), Gemini (1m)
 */
export interface ModelTokenLimit {
    /** Maximum context window tokens */
    maxTokens: number;
    /** Reserved tokens for system prompt + response */
    reserved: number;
    /** Available tokens for context */
    available: number; // maxTokens - reserved
}

/**
 * Context injection configuration
 */
export interface ContextInjectionConfig {
    /** Maximum tokens for context (auto-calculated from model if not set) */
    maxContextTokens?: number;
    /** Model name for token limit calculation */
    modelName?: string;
    /** Minimum tokens to reserve for response */
    minResponseTokens?: number;
}

/**
 * Injected context result
 */
export interface InjectedContext {
    /** Formatted context string for system prompt */
    context: string;
    /** Token count estimate */
    tokenCount: number;
    /** Whether context was truncated */
    wasTruncated: boolean;
    /** Number of notes included */
    noteCount: number;
}

/**
 * Context injection result with system prompt
 */
export interface ContextInjectionResult {
    /** System prompt with injected context */
    systemPrompt: string;
    /** Context metadata */
    context: InjectedContext;
}

// ============================================================================
// Model Token Limits
// ============================================================================

/** Approximate token limits for common models (conservative estimates) */
const MODEL_TOKEN_LIMITS: Record<string, ModelTokenLimit> = {
    // Claude models
    'claude-3-5-sonnet': { maxTokens: 200000, reserved: 8000, available: 192000 },
    'claude-3-5-haiku': { maxTokens: 200000, reserved: 8000, available: 192000 },
    'claude-3-opus': { maxTokens: 200000, reserved: 8000, available: 192000 },

    // GPT models
    'gpt-4': { maxTokens: 128000, reserved: 8000, available: 120000 },
    'gpt-4-turbo': { maxTokens: 128000, reserved: 4000, available: 124000 },
    'gpt-4o': { maxTokens: 128000, reserved: 4000, available: 124000 },

    // Gemini models
    'gemini-2.5': { maxTokens: 1000000, reserved: 8000, available: 992000 },
    'gemini-2.5-flash': { maxTokens: 1000000, reserved: 4000, available: 996000 },
    'gemini-2.0-flash': { maxTokens: 1000000, reserved: 4000, available: 996000 },
    'gemini-1.5': { maxTokens: 28000, reserved: 2000, available: 26000 },
    'gemini-1.5-flash': { maxTokens: 28000, reserved: 2000, available: 26000 },

    // Default fallback (conservative)
    'default': { maxTokens: 128000, reserved: 4000, available: 124000 },
};

/**
 * Get token limit for a model
 *
 * @param modelName - Model identifier
 * @returns Token limit info
 */
export function getModelTokenLimit(modelName: string): ModelTokenLimit {
    // Normalize model name (handle variations)
    const normalized = modelName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');

    // Find matching limit
    for (const [key, limit] of Object.entries(MODEL_TOKEN_LIMITS)) {
        if (normalized.includes(key)) {
            return limit;
        }
    }

    return MODEL_TOKEN_LIMITS.default;
}

// ============================================================================
// Token Estimation
// ============================================================================

/**
 * Approximate character to token ratio (conservative)
 * Using ~4 chars per token for estimation
 */
const CHARS_PER_TOKEN = 4;

/**
 * Estimate token count from text
 *
 * @param text - Text to estimate
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
    if (!text) return 0;
    // Simple estimation: chars / 4 (conservative)
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// ============================================================================
// Context Formatting
// ============================================================================

/**
 * Format context for system prompt injection
 *
 * Creates a clear separation between context and instructions.
 *
 * @param noteContext - Note context from buildNoteContext
 * @param config - Injection configuration
 * @returns Formatted context string
 */
export function formatContextForPrompt(
    noteContext: NoteContext
): string {
    if (!noteContext.currentNote) {
        return '';
    }

    const parts: string[] = [];

    // Header with clear boundary
    parts.push('╔════════════════════════════════════════════════════════════╗');
    parts.push('║               NOTE CONTEXT (READ-ONLY REFERENCE)              ║');
    parts.push('╚════════════════════════════════════════════════════════════╝');
    parts.push('');

    // Current note
    parts.push(`## 📌 Current Note: ${noteContext.currentNote.title}`);
    parts.push(noteContext.currentNote.content);
    parts.push('');

    // Related notes
    if (noteContext.relatedNotes.length > 0) {
        parts.push(`## 🔗 Related Notes (${noteContext.relatedNotes.length})`);
        parts.push('');

        for (let i = 0; i < noteContext.relatedNotes.length; i++) {
            const note = noteContext.relatedNotes[i];
            parts.push(`### ${i + 1}. ${note.title}`);
            parts.push(`*Relevance: ${Math.round(note.score * 100)}%*`);
            parts.push(note.content);
            parts.push('');
        }
    }

    // Footer with clear boundary
    parts.push('────────────────────────────────────────────────────────────');
    parts.push('**END OF CONTEXT** - Use above information for reference only.');
    parts.push('');

    return parts.join('\n');
}

/**
 * Format context with token limit (truncates if needed)
 *
 * @param noteContext - Note context from buildNoteContext
 * @param maxTokens - Maximum tokens for context
 * @returns Formatted context within token limit
 */
export function formatContextWithLimit(
    noteContext: NoteContext,
    maxTokens: number
): InjectedContext {
    const fullContext = formatContextForPrompt(noteContext);
    const estimatedTokens = estimateTokens(fullContext);

    // If within limit, return as-is
    if (estimatedTokens <= maxTokens) {
        return {
            context: fullContext,
            tokenCount: estimatedTokens,
            wasTruncated: false,
            noteCount: 1 + noteContext.relatedNotes.length,
        };
    }

    // Need to truncate - progressively drop related notes
    let context = fullContext;
    let noteCount = 1 + noteContext.relatedNotes.length;

    // First try: Drop all but top 3 related notes
    if (noteContext.relatedNotes.length > 3) {
        const truncatedContext: NoteContext = {
            ...noteContext,
            relatedNotes: noteContext.relatedNotes.slice(0, 3),
        };
        context = formatContextForPrompt(truncatedContext);
        noteCount = 1 + 3;
        if (estimateTokens(context) <= maxTokens) {
            return {
                context,
                tokenCount: estimateTokens(context),
                wasTruncated: true,
                noteCount,
            };
        }
    }

    // Second try: Drop all related notes, keep only current
    const currentOnly: NoteContext = {
        ...noteContext,
        relatedNotes: [],
    };
    context = formatContextForPrompt(currentOnly);
    noteCount = 1;
    if (estimateTokens(context) <= maxTokens) {
        return {
            context,
            tokenCount: estimateTokens(context),
            wasTruncated: true,
            noteCount,
        };
    }

    // Third try: Truncate current note content
    if (!noteContext.currentNote) {
        return {
            context: '',
            tokenCount: 0,
            wasTruncated: true,
            noteCount: 0,
        };
    }

    const maxChars = maxTokens * CHARS_PER_TOKEN * 0.8; // 80% safety margin
    const truncatedContent = noteContext.currentNote.content.slice(0, maxChars) + '\n\n...(truncated)';
    const minimalContext: NoteContext = {
        currentNote: {
            id: noteContext.currentNote.id,
            title: noteContext.currentNote.title,
            content: truncatedContent,
        },
        relatedNotes: [],
        totalChars: truncatedContent.length,
    };
    context = formatContextForPrompt(minimalContext);

    return {
        context,
        tokenCount: estimateTokens(context),
        wasTruncated: true,
        noteCount: 1,
    };
}

// ============================================================================
// Main Injection Function
// ============================================================================

/**
 * Inject note context into system prompt
 *
 * Combines system prompt with note context for context-aware AI.
 * Handles token limits and clear separation.
 *
 * @param baseSystemPrompt - Base system prompt without context
 * @param noteId - Current note ID to build context from
 * @param config - Injection configuration
 * @returns System prompt with injected context
 */
export async function injectContextIntoPrompt(
    baseSystemPrompt: string,
    noteId: string,
    config: ContextInjectionConfig = {}
): Promise<ContextInjectionResult> {
    const {
        maxContextTokens,
        modelName = 'gemini-2.5-flash',
        minResponseTokens = 4000,
    } = config;

    // Calculate available tokens for context
    let availableTokens = maxContextTokens;
    if (availableTokens === undefined) {
        const modelLimit = getModelTokenLimit(modelName);
        availableTokens = modelLimit.available - minResponseTokens;
    }

    // Build note context
    const noteContext = await buildNoteContext(noteId, {
        maxTotalChars: availableTokens * CHARS_PER_TOKEN,
    });

    // Format context with token limit
    const injected = formatContextWithLimit(noteContext, availableTokens);

    // Combine system prompt with context
    const combinedPrompt = injected.context
        ? `${injected.context}\n\n${baseSystemPrompt}`
        : baseSystemPrompt;

    return {
        systemPrompt: combinedPrompt,
        context: injected,
    };
}

/**
 * Quick inject (convenience function)
 *
 * Simplified version for common use cases.
 *
 * @param noteId - Current note ID
 * @returns System prompt with injected context, or null if no context
 */
export async function quickInject(
    noteId: string,
    baseSystemPrompt: string = ''
): Promise<string | null> {
    const result = await injectContextIntoPrompt(baseSystemPrompt, noteId);

    // Return null if no context was injected
    if (result.context.tokenCount === 0) {
        return null;
    }

    return result.systemPrompt;
}

/**
 * Check if context injection is available
 *
 * @param noteId - Note ID to check
 * @returns True if note exists and has content
 */
export function isContextAvailable(noteId: string): boolean {
    const { useNoteStore } = require('@/lib/notes/note-store');
    const note = useNoteStore.getState().notes.get(noteId);
    return !!note && note.blocks.length > 0;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get recommended context tokens for a model
 *
 * @param modelName - Model identifier
 * @returns Recommended max context tokens
 */
export function getRecommendedContextTokens(modelName: string): number {
    const limit = getModelTokenLimit(modelName);
    // Use 25% of available tokens for context (conservative)
    return Math.floor(limit.available * 0.25);
}

/**
 * Validate context fits within model limits
 *
 * @param context - Context string to validate
 * @param modelName - Model identifier
 * @returns True if context fits
 */
export function validateContextSize(context: string, modelName: string): boolean {
    const limit = getModelTokenLimit(modelName);
    const estimatedTokens = estimateTokens(context);
    return estimatedTokens <= limit.available;
}
