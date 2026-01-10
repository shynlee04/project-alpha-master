/**
 * @fileoverview Request Builder (Debug)
 * @module routes/__debug__/provider-playground/lib/request-builder
 *
 * Builds request payloads based on modality type.
 * Each modality has a different request structure.
 */

import type { ModalityType } from './types.js';

/**
 * Text generation payload (OpenAI-compatible)
 */
export interface TextPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

/**
 * Image generation payload
 */
export interface ImagePayload {
  model?: string;
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
}

/**
 * Text-to-Speech payload
 */
export interface TTSPayload {
  text: string;
  speed?: number;
  voice?: string;
}

/**
 * Speech-to-Text payload
 */
export interface STTPayload {
  audio_b64: string;
  language?: string | null;
}

/**
 * Built request types
 */
export type BuiltRequest = TextPayload | ImagePayload | TTSPayload | STTPayload;

/**
 * Build request payload based on modality
 *
 * @param modality - The modality type
 * @param input - User input string
 * @returns Built request payload
 */
export function buildRequest(
  modality: ModalityType,
  input: string
): BuiltRequest {
  switch (modality) {
    case 'text':
      return {
        model: '', // Will be filled by executor
        messages: [{ role: 'user', content: input }],
        stream: false,
      };

    case 'image':
      return {
        prompt: input,
        width: 1024,
        height: 1024,
      };

    case 'tts':
      return {
        text: input,
        speed: 1.0,
      };

    case 'stt':
      return {
        audio_b64: input,
        language: null,
      };
  }
}
