/**
 * @fileoverview Groq Provider Adapter
 * @module lib/agent/providers/groq-adapter
 *
 * Adapter for Groq API using @tanstack/ai-openai.
 * Ultra-fast LLM inference with LLaVA vision models.
 *
 * Updated 2026-01-14 with official Groq documentation.
 * Source: https://console.groq.com/docs
 *
 * @epic EPIC-PRV - Universal Provider Registry
 * @story PRV-GROQ - Groq Integration
 */

import { createOpenaiChat } from '@tanstack/ai-openai';
import type { AdapterConfig, ConnectionTestResult } from './types';

/**
 * Groq model IDs - Updated 2026-01-14
 * Source: https://console.groq.com/docs/models
 *
 * Categories:
 * - Vision: LLaVA models for image understanding
 * - Reasoning: High-performance reasoning models
 * - Lightning: Fastest inference models
 */
const GROQ_MODELS = [
  // === Vision Models ===
  'llava-v1.5-7b',
  'llava-v1.5-13b',

  // === Reasoning Models ===
  'deepseek-r1-distill-llama-70b',
  'llama-3.3-70b-versatile',

  // === Lightning Models (Fastest) ===
  'llama-3.1-8b-instant',
  'llama-3.2-1b-preview',
  'gemma2-9b-it',
] as const;

export type GroqModelId = typeof GROQ_MODELS[number];

/**
 * Default Groq model - LLaVA for vision capabilities
 */
const DEFAULT_MODEL = 'llava-v1.5-7b' as const satisfies GroqModelId;

/**
 * Validate that a model ID is a supported Groq model
 */
export function isValidGroqModel(model: string): model is GroqModelId {
  return GROQ_MODELS.includes(model as GroqModelId);
}

/**
 * Groq adapter configuration
 */
export interface GroqAdapterConfig extends AdapterConfig {
  /** Custom headers for requests */
  headers?: Record<string, string>;
}

/**
 * GroqAdapter - Wrapper for TanStack AI OpenAI adapter (Groq is OpenAI-compatible)
 *
 * Groq provides ultra-fast inference with OpenAI-compatible API.
 * Vision models use OpenAI's image_url format.
 */
export class GroqAdapter {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: GroqModelId;
  private adapter: ReturnType<typeof createOpenaiChat>;

  constructor(config: GroqAdapterConfig) {
    if (!config.apiKey) {
      throw new Error('GroqAdapter: API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.groq.com/openai/v1';

    const modelId = config.model || DEFAULT_MODEL;
    validateGroqModelId(modelId);
    this.defaultModel = modelId;

    // Create OpenAI-compatible adapter for Groq
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.adapter = createOpenaiChat(modelId as any, this.apiKey, {
      baseURL: this.baseURL,
    } as any);
  }

  /**
   * Stream a chat completion
   */
  async *streamChat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string | Array<{ type: string; [key: string]: unknown }> }>,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): AsyncGenerator<{ type: 'text' | 'final' | 'error'; text?: string; error?: string }> {
    try {
      const stream = this.adapter.chatStream({
        model: options.model || this.defaultModel,
        messages: messages as never,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      } as never);

      let accumulatedText = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content') {
          accumulatedText += chunk.delta || '';
          yield { type: 'text', text: chunk.delta || '' };
        } else if (chunk.type === 'done') {
          yield { type: 'final', text: accumulatedText };
        } else if (chunk.type === 'error') {
          yield { type: 'error', error: chunk.error?.message || 'Unknown error' };
        }
      }
    } catch (error) {
      yield { type: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Non-streaming chat completion
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string | Array<{ type: string; [key: string]: unknown }> }>,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<{ content: string; stopReason?: string }> {
    const chunks: Array<{ type: string; text?: string; error?: string }> = [];

    for await (const chunk of this.streamChat(messages, options)) {
      chunks.push(chunk);
    }

    const content = chunks
      .filter(c => c.type === 'text')
      .map(c => c.text || '')
      .join('');

    return { content };
  }

  /**
   * Test connection to Groq API
   */
  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return { success: true, latencyMs };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          error: `Groq API error: ${response.status} - ${errorText}`,
          latencyMs,
        };
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latencyMs,
      };
    }
  }

  /**
   * Get available Groq models
   */
  async getAvailableModels(): Promise<Array<{ id: string; name: string; contextLength?: number; vision?: boolean }>> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();

      return (data.data || []).map((m: { id: string; name: string; context_length?: number }) => ({
        id: m.id,
        name: m.name || m.id,
        contextLength: m.context_length,
        vision: m.id.includes('llava') || m.id.includes('vision'),
      }));
    } catch (error) {
      console.error('[GroqAdapter] Failed to fetch models:', error);
      // Return default models on error
      return [
        { id: 'llava-v1.5-7b', name: 'LLaVA v1.5 7B', contextLength: 4096, vision: true },
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', contextLength: 131072, vision: false },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', contextLength: 131072, vision: false },
      ];
    }
  }
}

/**
 * Validate Groq model ID
 */
function validateGroqModelId(model: string): asserts model is GroqModelId {
  if (!isValidGroqModel(model)) {
    const validModels = GROQ_MODELS.join(', ');
    throw new Error(
      `Invalid Groq model: "${model}".\n` +
      `Supported models: ${validModels}\n` +
      `For the latest models, visit: https://console.groq.com/docs/models`
    );
  }
}

/**
 * Create Groq adapter instance
 */
export function createGroqAdapter(config: GroqAdapterConfig): GroqAdapter {
  return new GroqAdapter(config);
}
