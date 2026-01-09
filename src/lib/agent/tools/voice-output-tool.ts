/**
 * @fileoverview Voice Output Tool - Text-to-Speech Agent Tool
 * @module lib/agent/tools/voice-output-tool
 *
 * Agent tool for converting text to speech using OpenAI TTS or Gemini TTS.
 * Supports multiple voices, formats, and provider selection.
 *
 * @governance EPIC-40, MM-06
 * @story Multimodal Chat Unification - Voice Output
 */

import { toolDefinition, generateSpeech } from '@tanstack/ai';
import { createOpenaiSpeech } from '@tanstack/ai-openai';
import { createGeminiSpeech } from '@tanstack/ai-gemini';
import { z } from 'zod';
import type { ToolResult } from './types';
import { credentialVault } from '../providers/credential-vault';

/**
 * Available TTS providers and their configurations
 */
export const TTS_PROVIDERS = {
  openai: {
    id: 'openai',
    name: 'OpenAI TTS',
    models: {
      'tts-1': {
        id: 'tts-1',
        name: 'TTS-1',
        description: 'Standard quality, fast generation',
        quality: 'standard',
      },
      'tts-1-hd': {
        id: 'tts-1-hd',
        name: 'TTS-1 HD',
        description: 'High definition quality, slower generation',
        quality: 'hd',
      },
    },
    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const,
    formats: ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'] as const,
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini TTS',
    models: {
      'gemini-2.5-flash-preview-tts': {
        id: 'gemini-2.5-flash-preview-tts',
        name: 'Gemini 2.5 Flash TTS',
        description: 'Experimental TTS with 30 voices and 24 languages',
        quality: 'experimental',
      },
    },
    // Gemini has 30 voices - these are the most commonly used ones
    voices: [
      'Kore', 'Charon', 'Fenrir', 'Aoede', 'Puck', 'Zephyr',
      'Orbit', 'Lyra', 'Vega', 'Nova', 'Atlas', 'Echo',
    ] as const,
    formats: ['wav', 'mp3'] as const,
  },
} as const;

/**
 * OpenAI voice descriptions
 */
export const OPENAI_VOICES = {
  alloy: { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
  echo: { id: 'echo', name: 'Echo', description: 'Warm and conversational' },
  fable: { id: 'fable', name: 'Fable', description: 'British accent, narrative style' },
  onyx: { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
  nova: { id: 'nova', name: 'Nova', description: 'Friendly and upbeat' },
  shimmer: { id: 'shimmer', name: 'Shimmer', description: 'Clear and professional' },
} as const;

/**
 * Gemini voice descriptions
 */
export const GEMINI_VOICES = {
  Kore: { id: 'Kore', name: 'Kore', description: 'Default, clear voice' },
  Charon: { id: 'Charon', name: 'Charon', description: 'Deep, measured' },
  Fenrir: { id: 'Fenrir', name: 'Fenrir', description: 'Authoritative' },
  Aoede: { id: 'Aoede', name: 'Aoede', description: 'Melodic, expressive' },
  Puck: { id: 'Puck', name: 'Puck', description: 'Playful, energetic' },
  Zephyr: { id: 'Zephyr', name: 'Zephyr', description: 'Gentle, calming' },
} as const;

/**
 * Supported audio formats
 */
export const TTS_FORMATS = {
  mp3: { id: 'mp3', mimeType: 'audio/mpeg', description: 'MP3 format (most compatible)' },
  opus: { id: 'opus', mimeType: 'audio/opus', description: 'Opus format (low latency)' },
  aac: { id: 'aac', mimeType: 'audio/aac', description: 'AAC format (Apple devices)' },
  flac: { id: 'flac', mimeType: 'audio/flac', description: 'FLAC format (lossless)' },
  wav: { id: 'wav', mimeType: 'audio/wav', description: 'WAV format (uncompressed)' },
  pcm: { id: 'pcm', mimeType: 'audio/pcm', description: 'PCM format (raw audio)' },
} as const;

/**
 * Maximum text length for TTS
 */
const MAX_TEXT_LENGTH = 4096;

/**
 * Voice output configuration schema
 */
const VoiceOutputConfigSchema = z.object({
  provider: z.enum(['openai', 'gemini']).optional().default('openai'),
  model: z.string().optional().describe('Model ID (e.g., "tts-1" for OpenAI, "gemini-2.5-flash-preview-tts" for Gemini)'),
  voice: z.string().optional().describe('Voice name (provider-specific)'),
  format: z.enum(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm']).optional().default('mp3'),
  speed: z.number().min(0.25).max(4.0).optional().default(1.0),
  // Gemini-specific options
  languageCode: z.string().optional().describe('Language code for Gemini TTS (e.g., "en-US")'),
  systemInstruction: z.string().optional().describe('Style instruction for Gemini TTS'),
});

/**
 * Voice output tool input schema
 */
const VoiceOutputInputSchema = z.object({
  text: z.string().min(1).max(4096).describe('Text to convert to speech'),
  config: VoiceOutputConfigSchema.optional().describe('TTS configuration'),
});

/**
 * Voice output tool output schema
 */
const VoiceOutputOutputSchema = z.object({
  audio: z.string().describe('Base64-encoded audio data'),
  contentType: z.string().describe('MIME type of audio'),
  format: z.string().describe('Audio format'),
  provider: z.string().describe('Provider used for TTS'),
  duration: z.number().optional().describe('Estimated audio duration in seconds'),
  characterCount: z.number().describe('Number of characters processed'),
});

export type VoiceOutputConfig = z.infer<typeof VoiceOutputConfigSchema>;
export type VoiceOutputInput = z.infer<typeof VoiceOutputInputSchema>;
export type VoiceOutputOutput = z.infer<typeof VoiceOutputOutputSchema>;

/**
 * Voice output tool definition
 */
export const voiceOutputDef = toolDefinition({
  name: 'voice_output',
  description: 'Convert text to speech using OpenAI TTS or Google Gemini TTS. OpenAI supports voices: alloy, echo, fable, onyx, nova, shimmer. Gemini supports 30 voices including Kore, Charon, Fenrir. Use this tool when the user requests audio output or text-to-speech conversion.',
  inputSchema: VoiceOutputInputSchema,
  needsApproval: false, // TTS is safe, no destructive operations
});

/**
 * Get API key for provider from credential vault
 */
async function getApiKey(provider: 'openai' | 'gemini'): Promise<string | null> {
  try {
    await credentialVault.initialize();
    return await credentialVault.getCredentials(provider);
  } catch (error) {
    console.error(`[VoiceOutputTool] Failed to get ${provider} API key:`, error);
    return null;
  }
}

/**
 * Generate speech using OpenAI TTS API
 */
async function generateWithOpenAI(
  text: string,
  config: VoiceOutputConfig
): Promise<ToolResult<VoiceOutputOutput>> {
  const apiKey = await getApiKey('openai');
  if (!apiKey) {
    return {
      success: false,
      error: 'OpenAI API key not configured. Please add your API key in Settings > AI Providers.',
    };
  }

  const model = (config.model || 'tts-1') as 'tts-1' | 'tts-1-hd';
  const voice = (config.voice || 'alloy') as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  const format = config.format || 'mp3';

  // Create TTS adapter
  const adapter = createOpenaiSpeech(model, apiKey);

  // Generate speech
  const result = await generateSpeech({
    // @ts-expect-error - TanStack AI types are complex, adapter is compatible
    adapter,
    text,
    voice,
    format,
    speed: config.speed || 1.0,
  });

  // Get format info
  const formatInfo = TTS_FORMATS[format];

  // Estimate duration (rough: ~150 words per minute, ~5 chars per word)
  const estimatedDuration = (text.length / 5 / 150) * 60 / (config.speed || 1.0);

  return {
    success: true,
    data: {
      audio: result.audio,
      contentType: result.contentType || formatInfo.mimeType,
      format,
      provider: 'openai',
      duration: Math.round(estimatedDuration * 10) / 10,
      characterCount: text.length,
    },
  };
}

/**
 * Generate speech using Gemini TTS API
 */
async function generateWithGemini(
  text: string,
  config: VoiceOutputConfig
): Promise<ToolResult<VoiceOutputOutput>> {
  const apiKey = await getApiKey('gemini');
  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API key not configured. Please add your API key in Settings > AI Providers.',
    };
  }

  try {
    const model = (config.model || 'gemini-2.5-flash-preview-tts') as 'gemini-2.5-flash-preview-tts';
    const voice = config.voice || 'Kore';

    // Create Gemini TTS adapter
    const adapter = createGeminiSpeech(model, apiKey);

    // Build model options for Gemini
    const modelOptions: Record<string, unknown> = {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voice,
        },
      },
    };

    if (config.languageCode) {
      modelOptions.languageCode = config.languageCode;
    }

    if (config.systemInstruction) {
      modelOptions.systemInstruction = config.systemInstruction;
    }

    // Generate speech
    const result = await generateSpeech({
      // @ts-expect-error - TanStack AI types are complex, adapter is compatible
      adapter,
      text,
      modelOptions,
    });

    // Estimate duration
    const estimatedDuration = (text.length / 5 / 150) * 60;

    return {
      success: true,
      data: {
        audio: result.audio,
        contentType: result.contentType || 'audio/wav',
        format: result.format || 'wav',
        provider: 'gemini',
        duration: Math.round(estimatedDuration * 10) / 10,
        characterCount: text.length,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini TTS error';
    console.error('[VoiceOutputTool] Gemini TTS failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate speech from text using the configured provider
 */
export async function generateTextToSpeech(
  text: string,
  config: VoiceOutputConfig = { provider: 'openai', format: 'mp3', speed: 1.0 }
): Promise<ToolResult<VoiceOutputOutput>> {
  try {
    // Validate text length
    if (text.length > MAX_TEXT_LENGTH) {
      return {
        success: false,
        error: `Text too long: ${text.length} characters. Maximum: ${MAX_TEXT_LENGTH} characters`,
      };
    }

    // Validate text is not empty
    if (!text.trim()) {
      return {
        success: false,
        error: 'Text cannot be empty',
      };
    }

    // Route to appropriate provider
    const provider = config.provider || 'openai';
    
    if (provider === 'gemini') {
      return await generateWithGemini(text, config);
    } else {
      return await generateWithOpenAI(text, config);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown TTS error';
    console.error('[VoiceOutputTool] TTS failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create client-side voice output tool implementation
 *
 * @returns TanStack AI tool client implementation
 */
export function createVoiceOutputClientTool() {
  return voiceOutputDef.client(async (input: unknown): Promise<ToolResult<VoiceOutputOutput>> => {
    const args = input as VoiceOutputInput;

    try {
      if (!args.text) {
        return {
          success: false,
          error: 'Text is required for text-to-speech conversion',
        };
      }

      return await generateTextToSpeech(args.text, args.config || { provider: 'openai', format: 'mp3', speed: 1.0 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown voice output error';
      console.error('[VoiceOutputTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}

/**
 * Quick speak helper for direct usage
 * Returns audio blob for playback
 */
export async function quickSpeak(
  text: string,
  options?: {
    provider?: 'openai' | 'gemini';
    voice?: string;
    format?: 'mp3' | 'wav';
  }
): Promise<{ audio: Blob; success: boolean; error?: string }> {
  const result = await generateTextToSpeech(text, {
    provider: options?.provider || 'openai',
    voice: options?.voice,
    format: options?.format || 'mp3',
    speed: 1.0,
  });
  
  if (result.success && result.data) {
    // Convert base64 to Blob
    const byteCharacters = atob(result.data.audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: result.data.contentType });
    
    return { audio: blob, success: true };
  }
  
  return { audio: new Blob(), success: false, error: result.error };
}

/**
 * Play audio from base64 string
 * Helper for browser playback
 */
export function playAudioFromBase64(
  base64Audio: string,
  contentType: string = 'audio/mpeg'
): HTMLAudioElement {
  const audio = new Audio(`data:${contentType};base64,${base64Audio}`);
  audio.play().catch((error) => {
    console.error('[VoiceOutputTool] Failed to play audio:', error);
  });
  return audio;
}
