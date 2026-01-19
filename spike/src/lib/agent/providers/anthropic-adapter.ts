/**
 * @fileoverview Anthropic Provider Adapter
 * @module lib/agent/providers/anthropic-adapter
 *
 * Adapter for Anthropic Claude API using the official Anthropic SDK.
 * Supports streaming, tool use, and vision capabilities.
 *
 * @epic 25 - AI Foundation Sprint
 * @story Enable Anthropic Provider
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AdapterConfig, ConnectionTestResult } from './types';

// Re-export types from Anthropic SDK for convenience
export type Message = Anthropic.Message;
export type Tool = Anthropic.Tool;

/**
 * Anthropic-specific adapter configuration
 */
export interface AnthropicAdapterConfig extends AdapterConfig {
    /** Anthropic API version (default: 2023-06-01) */
    version?: string;
    /** Default headers for requests */
    defaultHeaders?: Record<string, string>;
    /** Dangerous for direct use - only if user explicitly trusts */
    dangerouslyAllowBrowser?: boolean;
}

/**
 * Anthropic adapter wrapper
 * Provides a unified interface compatible with TanStack AI patterns
 */
export class AnthropicAdapter {
    private client: Anthropic;

    constructor(config: AnthropicAdapterConfig) {
        this.client = new Anthropic({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
            defaultHeaders: config.defaultHeaders,
            // TanStack AI runs in browser context
            dangerouslyAllowBrowser: config.dangerouslyAllowBrowser ?? true,
        });
    }

    /**
     * Stream a chat completion
     * Compatible with TanStack AI streaming patterns
     */
    async *streamChat(messages: Message[], options: {
        model?: string;
        maxTokens?: number;
        temperature?: number;
        tools?: Tool[];
        stream?: boolean;
    }) {
        const model = options.model || 'claude-3-5-sonnet-20241022';
        const maxTokens = options.maxTokens || 4096;

        if (options.tools && options.tools.length > 0) {
            // Use beta tool runner for tool support
            // @ts-expect-error - Beta tool runner types not fully exported in SDK
            const runner = this.client.beta.tools.stream({
                model: model as Anthropic.Model,
                max_tokens: maxTokens,
                messages: messages as Anthropic.MessageParam[],
                tools: options.tools as Anthropic.Tool[],
                stream: true,
            });

            for await (const message of runner) {
                const content = message.content as Array<{ type: string; text?: string } | undefined>;
                yield {
                    type: 'text',
                    text: content[0]?.text || '',
                };

                // Check if message has tool use
                if (message.stop_reason === 'tool_use') {
                    for (const block of message.content || []) {
                        if (block.type === 'tool_use') {
                            yield {
                                type: 'tool_use',
                                toolUse: block,
                            };
                        }
                    }
                }
            }

            // Get final message
            const finalMessage = await (runner as any).finalMessage();
            yield {
                type: 'final',
                message: finalMessage,
            };
        } else {
            // Regular streaming without tools
            const stream = this.client.messages.stream({
                model: model as Anthropic.Model,
                max_tokens: maxTokens,
                messages: messages as Anthropic.Message[],
                stream: true,
            });

            for await (const event of stream) {
                if (event.type === 'content_block_delta') {
                    // Cast delta to access text property
                    const delta = event.delta as { type: string; text?: string };
                    yield {
                        type: 'text',
                        text: delta.text || '',
                    };
                } else if (event.type === 'message_stop') {
                    yield {
                        type: 'stop',
                        // @ts-expect-error - message_stop event structure
                        stopReason: event.message?.stop_reason,
                    };
                }
            }

            // Get final message for complete response
            const finalText = await stream.finalText();
            yield {
                type: 'final_text',
                text: finalText,
            };
        }
    }

    /**
     * Non-streaming chat completion
     */
    async chat(messages: Message[], options: {
        model?: string;
        maxTokens?: number;
        temperature?: number;
        tools?: Tool[];
    }): Promise<{ content: string; stopReason?: string }> {
        const model = options.model || 'claude-3-5-sonnet-20241022';
        const maxTokens = options.maxTokens || 4096;

        if (options.tools && options.tools.length > 0) {
            // Use beta tools
            // @ts-expect-error - Beta tools API types not fully exported
            const response = await this.client.beta.tools.create({
                model: model as Anthropic.Model,
                max_tokens: maxTokens,
                messages: messages as Anthropic.MessageParam[],
                tools: options.tools as Anthropic.Tool[],
            });

            // Extract text from response content
            const content = response.content as Array<{ type: string; text?: string }>;
            const textBlock = content.find((block: { type: string }) => block.type === 'text');

            return {
                content: textBlock?.text || '',
                stopReason: response.stop_reason as string | undefined,
            };
        } else {
            // Regular message
            const response = await this.client.messages.create({
                model: model as Anthropic.Model,
                max_tokens: maxTokens,
                messages: messages as Anthropic.Message[],
            });

            // Extract text from response content
            const content = response.content as Array<{ type: string; text?: string }>;
            const textBlock = content.find((block) => block.type === 'text');

            return {
                content: textBlock?.text || '',
                stopReason: response.stop_reason as string | undefined,
            };
        }
    }

    /**
     * Test connection to Anthropic API
     */
    async testConnection(): Promise<ConnectionTestResult> {
        const startTime = Date.now();

        try {
            // Send a minimal message to test connectivity
            const response = await this.client.messages.create({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }],
            });

            const latencyMs = Date.now() - startTime;

            if (response.content) {
                return { success: true, latencyMs };
            } else {
                return {
                    success: false,
                    error: 'No content in response',
                    latencyMs,
                };
            }
        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: message, latencyMs };
        }
    }
}

/**
 * Create Anthropic adapter instance
 * Factory function for consistency with other providers
 */
export function createAnthropicAdapter(
    config: AnthropicAdapterConfig
): AnthropicAdapter {
    return new AnthropicAdapter(config);
}
