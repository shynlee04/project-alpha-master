/**
 * @fileoverview Mistral Provider Adapter
 * @module lib/agent/providers/mistral-adapter
 *
 * Adapter for Mistral AI API using @tanstack/ai-openai.
 * Pixtral multimodal models with native vision support.
 *
 * Updated 2026-01-14 with official Mistral documentation.
 * Source: https://docs.mistral.ai
 *
 * @epic EPIC-PRV - Universal Provider Registry
 * @story PRV-MISTRAL - Mistral Integration
 */

import { createOpenaiChat } from '@tanstack/ai-openai';
import type { AdapterConfig, ConnectionTestResult } from './types';

/**
 * Mistral model IDs - Updated 2026-01-14
 * Source: https://docs.mistral.ai/getting-started/models/
 *
 * Categories:
 * - Pixtral: Multimodal models with native vision support
 * - Text: High-performance text models (Mistral Large 3)
 */
const MISTRAL_MODELS = [
  // === Pixtral Multimodal Models (Vision) ===
  'pixtral-12b-2409',
  'pixtral-large-2411',
  'pixtral-large-latest',

  // === Text Models ===
  'mistral-large-2411',
  'mistral-large-latest',
  'open-mistral-nemo',
  'open-codestral-mamba',
] as const;

export type MistralModelId = typeof MISTRAL_MODELS[number];

/**
 * Default Mistral model - Pixtral 12B for vision capabilities
 */
const DEFAULT_MODEL = 'pixtral-12b-2409' as const satisfies MistralModelId;

/**
 * Validate that a model ID is a supported Mistral model
 */
export function isValidMistralModel(model: string): model is MistralModelId {
  return MISTRAL_MODELS.includes(model as MistralModelId);
}

/**
 * Mistral adapter configuration
 */
export interface MistralAdapterConfig extends AdapterConfig {
  /** Custom headers for requests */
  headers?: Record<string, string>;
}

/**
 * MistralAdapter - Wrapper for TanStack AI OpenAI adapter (Mistral is OpenAI-compatible)
 *
 * Mistral provides Pixtral models with native vision understanding.
 * Unlike OpenAI, Pixtral uses base64-encoded images directly in content.
 */
export class MistralAdapter {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: MistralModelId;
  private adapter: ReturnType<typeof createOpenaiChat>;

  constructor(config: MistralAdapterConfig) {
    if (!config.apiKey) {
      throw new Error('MistralAdapter: API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.mistral.ai/v1';

    const modelId = config.model || DEFAULT_MODEL;
    validateMistralModelId(modelId);
    this.defaultModel = modelId;

    // Create OpenAI-compatible adapter for Mistral
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
   * Test connection to Mistral API
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
          error: `Mistral API error: ${response.status} - ${errorText}`,
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
   * Get available Mistral models
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

      return (data.data || [])
        .filter((m: { id: string }) => {
          // Filter to only supported models
          return MISTRAL_MODELS.some(supported => m.id.includes(supported.split('-')[0]));
        })
        .map((m: { id: string; name: string; max_tokens?: number }) => ({
          id: m.id,
          name: m.name || m.id,
          contextLength: m.max_tokens,
          vision: m.id.includes('pixtral'),
        }));
    } catch (error) {
      console.error('[MistralAdapter] Failed to fetch models:', error);
      // Return default models on error
      return [
        { id: 'pixtral-12b-2409', name: 'Pixtral 12B', contextLength: 8192, vision: true },
        { id: 'pixtral-large-2411', name: 'Pixtral Large', contextLength: 131072, vision: true },
        { id: 'mistral-large-2411', name: 'Mistral Large 3', contextLength: 131072, vision: false },
      ];
    }
  }
}

/**
 * Validate Mistral model ID
 */
function validateMistralModelId(model: string): asserts model is MistralModelId {
  if (!isValidMistralModel(model)) {
    const validModels = MISTRAL_MODELS.join(', ');
    throw new Error(
      `Invalid Mistral model: "${model}".\n` +
      `Supported models: ${validModels}\n` +
      `For the latest models, visit: https://docs.mistral.ai/getting-started/models/`
    );
  }
}

/**
 * Create Mistral adapter instance
 */
export function createMistralAdapter(config: MistralAdapterConfig): MistralAdapter {
  return new MistralAdapter(config);
}
