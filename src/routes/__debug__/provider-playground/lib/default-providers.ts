/**
 * @fileoverview Default Provider Configurations (Debug)
 * @module routes/__debug__/provider-playground/lib/default-providers
 *
 * Pre-configured provider templates for the test playground.
 * These are loaded on first visit and can be modified by the user.
 */

import type { UniversalProviderConfig } from './types.js';

/**
 * Default providers for the playground
 *
 * Based on 2026 research:
 * - Chutes.ai: Multi-modality provider with separate endpoints
 * - OpenRouter: Aggregates multiple providers with free tier
 * - LM Studio: Local inference on localhost:1234
 * - Ollama: Local inference on localhost:11434
 */
export const DEFAULT_PROVIDERS: UniversalProviderConfig[] = [
  {
    id: 'chutes',
    name: 'Chutes.ai',
    description: 'Multi-modality AI provider with text, image, TTS, and STT endpoints',
    endpoints: {
      text: 'https://llm.chutes.ai/v1',
      image: 'https://image.chutes.ai',
      tts: 'https://chutes-kokoro.chutes.ai',
      stt: 'https://chutes-whisper-large-v3.chutes.ai',
    },
    defaultApiKey: '',
    requiresApiKey: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'zai-org/GLM-4.7-TEE',
        name: 'GLM 4.7 TEE',
        modalities: ['text', 'tts', 'stt'],
        contextLength: 128000,
        supportsStreaming: true,
      },
      {
        id: 'qwen-image',
        name: 'Qwen Image',
        modalities: ['image'],
      },
    ],
    defaultModel: 'zai-org/GLM-4.7-TEE',
    docsUrl: 'https://chutes.ai/docs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified interface for multiple LLM providers with free tier available',
    endpoints: {
      text: 'https://openrouter.ai/api/v1',
    },
    defaultApiKey: '',
    requiresApiKey: true,
    defaultHeaders: {
      'HTTP-Referer': window.location.href,
      'X-Title': 'Provider Playground',
    },
    models: [
      {
        id: 'meta-llama/llama-3.1-8b-instruct:free',
        name: 'Llama 3.1 8B Instruct (Free)',
        modalities: ['text'],
        contextLength: 131072,
        isFree: true,
      },
      {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash (Free)',
        modalities: ['text'],
        contextLength: 1048576,
        isFree: true,
      },
      {
        id: 'meta-llama/llama-3.1-70b-instruct:free',
        name: 'Llama 3.1 70B Instruct (Free)',
        modalities: ['text'],
        contextLength: 131072,
        isFree: true,
      },
    ],
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    docsUrl: 'https://openrouter.ai/docs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'localhost-lmstudio',
    name: 'Localhost (LM Studio)',
    description: 'Local LLM server running on LM Studio',
    endpoints: {
      text: 'http://localhost:1234/v1',
    },
    defaultApiKey: '',
    requiresApiKey: false,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'local-model',
        name: 'Local Model (configure in LM Studio)',
        modalities: ['text'],
        contextLength: 8192,
      },
    ],
    defaultModel: 'local-model',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'localhost-ollama',
    name: 'Localhost (Ollama)',
    description: 'Ollama local server for open-source models',
    endpoints: {
      text: 'http://localhost:11434/v1',
    },
    defaultApiKey: '',
    requiresApiKey: false,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'llama3.2',
        name: 'Llama 3.2',
        modalities: ['text'],
      },
      {
        id: 'qwen2.5',
        name: 'Qwen 2.5',
        modalities: ['text'],
      },
    ],
    defaultModel: 'llama3.2',
    docsUrl: 'https://ollama.com/docs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
