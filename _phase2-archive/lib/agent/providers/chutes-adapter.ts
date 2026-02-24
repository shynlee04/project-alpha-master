/**
 * @fileoverview Chutes.ai Provider Adapter
 * @module lib/agent/providers/chutes-adapter
 *
 * Multi-modality AI provider with text, image, TTS, and STT endpoints.
 * OpenAI-compatible LLM endpoint with additional specialized endpoints.
 *
 * Source: https://chutes.ai/docs
 *
 * @epic EPIC-PRV - Universal Provider Registry
 * @story PRV-CHUTES - Chutes.ai Integration
 * @story PRV-07 - Type Consolidation
 */

import { createOpenaiChat } from '@tanstack/ai-openai';
import type { AdapterConfig, ConnectionTestResult } from './types';
import type { ModalityType } from '@/domain/types/llm/provider-types';

/**
 * Chutes.ai model IDs
 *
 * Categories:
 * - LLM: GLM models for text generation and chat
 * - Image: Qwen models for image generation
 * - TTS/STT: Voice models for audio processing
 */
const CHUTES_MODELS = [
  // === LLM Models ===
  'zai-org/GLM-4.7-TEE',
  'glm-4-plus',
  'glm-4-0520',
  'glm-4-air',
  'glm-4-flash',

  // === Image Models ===
  'qwen-image',
  'flux-dev',
  'flux-pro',
] as const;

export type ChutesModelId = typeof CHUTES_MODELS[number];

/**
 * Default Chutes model - GLM 4.7 TEE for comprehensive support
 */
const DEFAULT_MODEL = 'zai-org/GLM-4.7-TEE' as const satisfies ChutesModelId;

/**
 * Validate that a model ID is a supported Chutes model
 */
export function isValidChutesModel(model: string): model is ChutesModelId {
  return CHUTES_MODELS.includes(model as ChutesModelId);
}

/**
 * Chutes.ai endpoint URLs for different modalities
 */
export const CHUTES_ENDPOINTS = {
  text: 'https://llm.chutes.ai/v1',
  image: 'https://image.chutes.ai',
  tts: 'https://chutes-kokoro.chutes.ai',
  stt: 'https://chutes-whisper-large-v3.chutes.ai',
} as const;

/**
 * Modality types supported by Chutes.ai
 *
 * Chutes supports a subset of the canonical ModalityType from the domain layer.
 * Import ModalityType from @/domain/types/llm/provider-types for reference.
 *
 * @story PRV-07 - Type Consolidation - Use domain ModalityType as source
 */
export type ChutesModality = Extract<ModalityType, 'text' | 'image' | 'tts' | 'stt'>;

/**
 * Chutes adapter configuration
 */
export interface ChutesAdapterConfig extends AdapterConfig {
  /** Custom headers for requests */
  headers?: Record<string, string>;
  /** Image generation endpoint override */
  imageEndpoint?: string;
  /** TTS endpoint override */
  ttsEndpoint?: string;
  /** STT endpoint override */
  sttEndpoint?: string;
}

/**
 * ChutesAdapter - Multi-modality provider with specialized endpoints
 *
 * Supports:
 * - Text: OpenAI-compatible chat completion via llm.chutes.ai/v1
 * - Image: Image generation via image.chutes.ai
 * - TTS: Text-to-speech via chutes-kokoro.chutes.ai
 * - STT: Speech-to-text via chutes-whisper-large-v3.chutes.ai
 */
export class ChutesAdapter {
  private apiKey: string;
  private endpoints: Record<string, string>;
  private defaultModel: ChutesModelId;
  private adapter: ReturnType<typeof createOpenaiChat>;

  constructor(config: ChutesAdapterConfig) {
    if (!config.apiKey) {
      throw new Error('ChutesAdapter: API key is required');
    }
    this.apiKey = config.apiKey;
    this.endpoints = {
      text: config.baseURL || CHUTES_ENDPOINTS.text,
      image: config.imageEndpoint || CHUTES_ENDPOINTS.image,
      tts: config.ttsEndpoint || CHUTES_ENDPOINTS.tts,
      stt: config.sttEndpoint || CHUTES_ENDPOINTS.stt,
    } as Record<string, string>;

    const modelId = config.model || DEFAULT_MODEL;
    validateChutesModelId(modelId);
    this.defaultModel = modelId;

    // Create OpenAI-compatible adapter for LLM endpoint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.adapter = createOpenaiChat(modelId as any, this.apiKey, {
      baseURL: this.endpoints.text,
    } as any);
  }

  /**
   * Stream a chat completion (text modality)
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
   * Generate an image
   */
  async generateImage(options: {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    negativePrompt?: string;
  }): Promise<{ url?: string; base64?: string; error?: string }> {
    try {
      const response = await fetch(`${this.endpoints.image}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'qwen-image',
          prompt: options.prompt,
          width: options.width || 1024,
          height: options.height || 1024,
          negative_prompt: options.negativePrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `Image generation error: ${response.status} - ${errorText}` };
      }

      const data = await response.json();

      // Return URL or base64 data depending on response format
      if (data.url) {
        return { url: data.url };
      } else if (data.image) {
        return { base64: data.image };
      } else {
        return { error: 'Unknown image response format' };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Text-to-speech synthesis
   */
  async synthesizeSpeech(options: {
    text: string;
    voice?: string;
    speed?: number;
  }): Promise<{ audio?: string; error?: string }> {
    try {
      const response = await fetch(`${this.endpoints.tts}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice || 'default',
          speed: options.speed || 1.0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `TTS error: ${response.status} - ${errorText}` };
      }

      // Get audio as base64
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      return { audio: base64 };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Speech-to-text transcription
   */
  async transcribe(audio: {
    data: string; // base64 encoded audio
    format?: string;
  }): Promise<{ text?: string; error?: string }> {
    try {
      // Convert base64 to blob
      const binaryString = atob(audio.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const formData = new FormData();
      const blob = new Blob([bytes], { type: audio.format || 'audio/webm' });
      formData.append('audio', blob);

      const response = await fetch(`${this.endpoints.stt}/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `STT error: ${response.status} - ${errorText}` };
      }

      const data = await response.json();
      return { text: data.text || data.transcript };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test connection to Chutes API
   */
  async testConnection(modality: ChutesModality = 'text'): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const endpoint = this.endpoints[modality];
      const testPath = modality === 'text' ? '/models' : '/health';

      const response = await fetch(`${endpoint}${testPath}`, {
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
          error: `Chutes API error (${modality}): ${response.status} - ${errorText}`,
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
   * Get available Chutes models
   */
  async getAvailableModels(): Promise<Array<{ id: string; name: string; modalities: string[]; contextLength?: number }>> {
    try {
      const response = await fetch(`${this.endpoints.text}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();

      // Map response to standard format
      return (data.data || []).map((m: { id: string; name: string; capabilities?: string[] }) => ({
        id: m.id,
        name: m.name || m.id,
        modalities: m.capabilities || ['text'],
      }));
    } catch (error) {
      console.error('[ChutesAdapter] Failed to fetch models:', error);
      // Return default models on error
      return [
        {
          id: 'zai-org/GLM-4.7-TEE',
          name: 'GLM 4.7 TEE',
          modalities: ['text', 'tts', 'stt'],
          contextLength: 128000,
        },
        {
          id: 'qwen-image',
          name: 'Qwen Image',
          modalities: ['image'],
        },
      ];
    }
  }

  /**
   * Test all endpoint connections
   */
  async testAllConnections(): Promise<Record<ChutesModality, ConnectionTestResult>> {
    const results = await Promise.all(
      (Object.keys(CHUTES_ENDPOINTS) as ChutesModality[]).map(async (modality) => {
        const result = await this.testConnection(modality);
        return [modality, result] as const;
      })
    );

    return Object.fromEntries(results) as Record<ChutesModality, ConnectionTestResult>;
  }
}

/**
 * Validate Chutes model ID
 */
function validateChutesModelId(model: string): asserts model is ChutesModelId {
  if (!isValidChutesModel(model)) {
    const validModels = CHUTES_MODELS.join(', ');
    throw new Error(
      `Invalid Chutes model: "${model}".\n` +
      `Supported models: ${validModels}\n` +
      `For the latest models, visit: https://chutes.ai/docs`
    );
  }
}

/**
 * Create Chutes adapter instance
 */
export function createChutesAdapter(config: ChutesAdapterConfig): ChutesAdapter {
  return new ChutesAdapter(config);
}
