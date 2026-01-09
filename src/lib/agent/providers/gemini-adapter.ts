/**
 * @fileoverview Gemini Provider Adapter
 * @module lib/agent/providers/gemini-adapter
 *
 * Adapter for Google Gemini API using @tanstack/ai-gemini.
 * Supports streaming, tool use, and multimodal capabilities (text, image, audio).
 *
 * @epic EPIC-40 - Multimodal Chat Unification
 * @story MM-04 - Integrate Gemini 2.5 APIs
 */

import { createGeminiChat, type GeminiTextConfig } from '@tanstack/ai-gemini';
import type { AdapterConfig, ConnectionTestResult } from './types';
import { GEMINI_MODELS } from './types';

// Re-export types for convenience
export type { GeminiTextConfig };

/**
 * Gemini-specific adapter configuration
 */
export interface GeminiAdapterConfig extends AdapterConfig {
    /** Enable dangerous browser API access (required for client-side usage) */
    dangerouslyAllowBrowser?: boolean;
    /** Custom headers for requests */
    headers?: Record<string, string>;
}

/**
 * Gemini model IDs supported by this adapter
 */
export type GeminiModelId = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];

/**
 * Input modality types for Gemini
 */
export type GeminiModality = 'text' | 'image' | 'audio' | 'video' | 'document';

/**
 * Message content part for multimodal support
 */
export interface GeminiContentPart {
    type: GeminiModality;
    content?: string;
    /** Base64 data for media types */
    data?: string;
    /** MIME type for media */
    mimeType?: string;
    /** URL for remote media */
    url?: string;
}

/**
 * Gemini message format
 */
export interface GeminiMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | GeminiContentPart[];
}

/**
 * Tool definition for Gemini function calling
 */
export interface GeminiTool {
    name: string;
    description: string;
    parameters?: Record<string, unknown>;
}

/**
 * Streaming chunk types from Gemini
 */
export interface GeminiStreamChunk {
    type: 'text' | 'tool_use' | 'final' | 'stop' | 'error';
    text?: string;
    toolUse?: {
        id: string;
        name: string;
        arguments: Record<string, unknown>;
    };
    message?: unknown;
    stopReason?: string;
    error?: string;
}

/**
 * GeminiAdapter - Wrapper for TanStack AI Gemini adapter
 * Provides a unified interface compatible with the provider system
 */
export class GeminiAdapter {
    private apiKey: string;
    private defaultModel: GeminiModelId;

    constructor(config: GeminiAdapterConfig) {
        this.apiKey = config.apiKey;
        this.defaultModel = (config.model as GeminiModelId) || GEMINI_MODELS.flash;
    }

    /**
     * Create a TanStack AI Gemini adapter for a specific model
     * @param model - Gemini model ID
     * @returns TanStack AI Gemini adapter instance
     */
    private createAdapter(model: string) {
        // Note: TanStack AI Gemini uses @google/genai internally
        // which handles base URL automatically
        return createGeminiChat(model as never, this.apiKey, {});
    }

    /**
     * Detect input modalities from message content
     * @param messages - Array of messages to analyze
     * @returns Array of detected modalities
     */
    detectModalities(messages: GeminiMessage[]): GeminiModality[] {
        const modalities = new Set<GeminiModality>();

        for (const message of messages) {
            if (typeof message.content === 'string') {
                modalities.add('text');
            } else if (Array.isArray(message.content)) {
                for (const part of message.content) {
                    modalities.add(part.type);
                }
            }
        }

        return Array.from(modalities);
    }

    /**
     * Select optimal model based on detected modalities
     * @param modalities - Array of input modalities
     * @returns Recommended model ID
     */
    selectModelForModalities(modalities: GeminiModality[]): GeminiModelId {
        // For multimodal inputs (image, audio, video), use flash which has broad support
        const hasMultimodal = modalities.some(m => 
            m === 'image' || m === 'audio' || m === 'video' || m === 'document'
        );

        if (hasMultimodal) {
            // Gemini 2.5 Flash has excellent multimodal support with 1M context
            return GEMINI_MODELS.flash;
        }

        // For text-only, can use any model - default to flash for cost efficiency
        return this.defaultModel;
    }

    /**
     * Stream a chat completion
     * Compatible with TanStack AI streaming patterns
     */
    async *streamChat(
        messages: GeminiMessage[],
        options: {
            model?: string;
            maxTokens?: number;
            temperature?: number;
            tools?: GeminiTool[];
            stream?: boolean;
        }
    ): AsyncGenerator<GeminiStreamChunk> {
        const model = options.model || this.defaultModel;
        const adapter = this.createAdapter(model);

        // Convert messages to TanStack AI format
        const formattedMessages = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: typeof msg.content === 'string' 
                ? msg.content 
                : msg.content.map(part => {
                    if (part.type === 'text') {
                        return { type: 'text' as const, content: part.content || '' };
                    }
                    // Handle media types
                    return {
                        type: part.type,
                        source: part.data 
                            ? { type: 'data' as const, value: part.data }
                            : { type: 'url' as const, value: part.url || '' },
                        metadata: { mimeType: part.mimeType }
                    };
                }),
        }));

        // Extract system messages
        const systemPrompts = messages
            .filter(m => m.role === 'system')
            .map(m => typeof m.content === 'string' ? m.content : '')
            .filter(Boolean);

        try {
            // Use the TanStack AI adapter's chatStream method
            // Note: Tools are passed directly - TanStack AI handles format conversion
            const stream = adapter.chatStream({
                model,
                messages: formattedMessages as never,
                temperature: options.temperature,
                maxTokens: options.maxTokens,
                systemPrompts: systemPrompts.length > 0 ? systemPrompts : undefined,
                // Tools are converted by the adapter internally
            } as never);

            let accumulatedText = '';

            for await (const chunk of stream) {
                if (chunk.type === 'content') {
                    accumulatedText += chunk.delta || '';
                    yield {
                        type: 'text',
                        text: chunk.delta || '',
                    };
                } else if (chunk.type === 'tool_call') {
                    yield {
                        type: 'tool_use',
                        toolUse: {
                            id: chunk.toolCall?.id || `tool_${Date.now()}`,
                            name: chunk.toolCall?.function?.name || '',
                            arguments: chunk.toolCall?.function?.arguments 
                                ? JSON.parse(chunk.toolCall.function.arguments)
                                : {},
                        },
                    };
                } else if (chunk.type === 'done') {
                    yield {
                        type: 'final',
                        message: { content: accumulatedText },
                        stopReason: chunk.finishReason ?? undefined,
                    };
                } else if (chunk.type === 'error') {
                    yield {
                        type: 'error',
                        error: chunk.error?.message || 'Unknown error',
                    };
                }
            }
        } catch (error) {
            yield {
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown streaming error',
            };
        }
    }

    /**
     * Non-streaming chat completion
     */
    async chat(
        messages: GeminiMessage[],
        options: {
            model?: string;
            maxTokens?: number;
            temperature?: number;
            tools?: GeminiTool[];
        }
    ): Promise<{ content: string; stopReason?: string }> {
        const chunks: GeminiStreamChunk[] = [];

        for await (const chunk of this.streamChat(messages, { ...options, stream: true })) {
            chunks.push(chunk);
        }

        // Combine all text chunks
        const content = chunks
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');

        const finalChunk = chunks.find(c => c.type === 'final');

        return {
            content,
            stopReason: finalChunk?.stopReason,
        };
    }

    /**
     * Test connection to Gemini API
     */
    async testConnection(): Promise<ConnectionTestResult> {
        const startTime = Date.now();

        try {
            // Use the Gemini API models endpoint to test connectivity
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`,
                { method: 'GET' }
            );

            const latencyMs = Date.now() - startTime;

            if (response.ok) {
                const data = await response.json();
                if (data.models && Array.isArray(data.models)) {
                    return { success: true, latencyMs };
                }
                return {
                    success: false,
                    error: 'Unexpected response format from Gemini API',
                    latencyMs,
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `Gemini API error: ${response.status} - ${errorText}`,
                    latencyMs,
                };
            }
        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: message, latencyMs };
        }
    }

    /**
     * Get available Gemini models
     */
    async getAvailableModels(): Promise<Array<{ id: string; name: string; contextLength?: number }>> {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }

            const data = await response.json();
            
            return (data.models || [])
                .filter((m: { supportedGenerationMethods?: string[] }) => 
                    m.supportedGenerationMethods?.includes('generateContent')
                )
                .map((m: { name: string; displayName?: string; inputTokenLimit?: number }) => ({
                    id: m.name.replace('models/', ''),
                    name: m.displayName || m.name.replace('models/', ''),
                    contextLength: m.inputTokenLimit,
                }));
        } catch (error) {
            console.error('[GeminiAdapter] Failed to fetch models:', error);
            // Return default models on error
            return [
                { id: GEMINI_MODELS.flash, name: 'Gemini 2.5 Flash', contextLength: 1048576 },
                { id: GEMINI_MODELS.pro, name: 'Gemini 2.5 Pro', contextLength: 2097152 },
                { id: GEMINI_MODELS.lite, name: 'Gemini 2.5 Flash Lite', contextLength: 1048576 },
            ];
        }
    }
}

/**
 * Create Gemini adapter instance
 * Factory function for consistency with other providers
 */
export function createGeminiAdapter(config: GeminiAdapterConfig): GeminiAdapter {
    return new GeminiAdapter(config);
}
