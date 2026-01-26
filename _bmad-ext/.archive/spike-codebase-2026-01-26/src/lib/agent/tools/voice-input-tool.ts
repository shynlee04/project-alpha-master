/**
 * @fileoverview Voice Input Tool - Speech-to-Text Agent Tool
 * @module lib/agent/tools/voice-input-tool
 *
 * Agent tool for transcribing audio to text using OpenAI Whisper or Gemini.
 * Supports multiple audio formats and languages with provider selection.
 *
 * @governance EPIC-40, MM-05
 * @story Multimodal Chat Unification - Voice Input
 */

import { toolDefinition, generateTranscription } from '@tanstack/ai';
import { createOpenaiTranscription } from '@tanstack/ai-openai';
import { z } from 'zod';
import type { ToolResult } from './types';
import { credentialVault } from '../providers/credential-vault';

/**
 * Supported audio formats for transcription
 */
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/webm',
  'audio/m4a',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
] as const;

/**
 * Available transcription providers and models
 */
export const TRANSCRIPTION_PROVIDERS = {
  openai: {
    id: 'openai',
    name: 'OpenAI Whisper',
    models: {
      'whisper-1': {
        id: 'whisper-1',
        name: 'Whisper V2',
        description: 'General purpose transcription model',
        maxFileSize: 25 * 1024 * 1024, // 25MB
      },
    },
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    models: {
      'gemini-2.5-flash': {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fast multimodal model with audio understanding',
        maxFileSize: 25 * 1024 * 1024, // 25MB
      },
      'gemini-2.5-pro': {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Advanced multimodal model with audio understanding',
        maxFileSize: 25 * 1024 * 1024, // 25MB
      },
    },
  },
} as const;

/**
 * Supported languages for transcription
 * ISO 639-1 codes
 */
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  vi: 'Vietnamese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
} as const;

/**
 * Voice input configuration schema
 */
const VoiceInputConfigSchema = z.object({
  provider: z.enum(['openai', 'gemini']).optional().default('openai'),
  model: z.string().optional().describe('Model ID (e.g., "whisper-1" for OpenAI, "gemini-2.5-flash" for Gemini)'),
  language: z.string().optional().describe('ISO 639-1 language code (e.g., "en", "vi")'),
  prompt: z.string().optional().describe('Optional prompt to guide transcription style'),
});

/**
 * Voice input tool input schema
 * 
 * NOTE: `audio` field is intentionally typed as z.string().optional() for schema
 * serialization compatibility with providers like Mistral. The actual File object
 * is handled at runtime in the client implementation (checking instanceof File).
 * LLMs should only send base64Audio, never this field.
 */
const VoiceInputInputSchema = z.object({
  // FIX: Changed from z.any() to z.string() for Mistral compatibility
  audio: z.string().optional().describe('Internal: Audio file reference (client-side only, LLM should not use this)'),
  base64Audio: z.string().describe('Base64-encoded audio content'),
  mimeType: z.string().describe('MIME type of audio (e.g., audio/mp3, audio/wav)'),
  filename: z.string().optional().describe('Original filename'),
  config: VoiceInputConfigSchema.optional().describe('Transcription configuration'),
});

/**
 * Voice input tool output schema
 */
const VoiceInputOutputSchema = z.object({
  text: z.string().describe('Transcribed text'),
  provider: z.string().describe('Provider used for transcription'),
  language: z.string().optional().describe('Detected language'),
  duration: z.number().optional().describe('Audio duration in seconds'),
  segments: z.array(z.object({
    text: z.string(),
    start: z.number(),
    end: z.number(),
  })).optional().describe('Timestamped segments'),
});

export type VoiceInputConfig = z.infer<typeof VoiceInputConfigSchema>;
export type VoiceInputInput = z.infer<typeof VoiceInputInputSchema>;
export type VoiceInputOutput = z.infer<typeof VoiceInputOutputSchema>;

/**
 * Voice input tool definition
 */
export const voiceInputDef = toolDefinition({
  name: 'voice_input',
  description: 'Transcribe audio to text using OpenAI Whisper or Google Gemini. Supports MP3, WAV, WebM, M4A, OGG, and FLAC formats. Use this tool when the user provides voice input or audio files that need to be converted to text.',
  inputSchema: VoiceInputInputSchema,
  needsApproval: false, // Audio transcription is safe, no destructive operations
});

/**
 * Convert base64 audio to File object
 */
function base64ToFile(base64: string, mimeType: string, filename = 'audio'): File {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const extension = mimeType.split('/')[1] || 'mp3';
  return new File([byteArray], `${filename}.${extension}`, { type: mimeType });
}

/**
 * Get API key for provider from credential vault
 */
async function getApiKey(provider: 'openai' | 'gemini'): Promise<string | null> {
  try {
    await credentialVault.initialize();
    return await credentialVault.getCredentials(provider);
  } catch (error) {
    console.error(`[VoiceInputTool] Failed to get ${provider} API key:`, error);
    return null;
  }
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
async function transcribeWithOpenAI(
  audio: File,
  config: VoiceInputConfig
): Promise<ToolResult<VoiceInputOutput>> {
  const apiKey = await getApiKey('openai');
  if (!apiKey) {
    return {
      success: false,
      error: 'OpenAI API key not configured. Please add your API key in Settings > AI Providers.',
    };
  }

  // Create transcription adapter
  const adapter = createOpenaiTranscription('whisper-1', apiKey);

  // Generate transcription
  const result = await generateTranscription({
    // @ts-expect-error - TanStack AI types are complex, adapter is compatible
    adapter,
    audio,
    language: config.language,
    prompt: config.prompt,
  });

  // Build output
  const output: VoiceInputOutput = {
    text: result.text,
    provider: 'openai',
    language: result.language,
    duration: result.duration,
  };

  // Add segments if available
  if (result.segments && result.segments.length > 0) {
    output.segments = result.segments.map((seg) => ({
      text: seg.text,
      start: seg.start,
      end: seg.end,
    }));
  }

  return { success: true, data: output };
}

/**
 * Transcribe audio using Gemini's multimodal capabilities
 * Uses the @google/genai SDK directly for audio understanding
 */
async function transcribeWithGemini(
  audio: File,
  config: VoiceInputConfig
): Promise<ToolResult<VoiceInputOutput>> {
  const apiKey = await getApiKey('gemini');
  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API key not configured. Please add your API key in Settings > AI Providers.',
    };
  }

  try {
    // Import Gemini SDK dynamically to avoid bundling issues
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey });

    // Convert audio file to base64
    const arrayBuffer = await audio.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Use Gemini's multimodal capabilities for audio understanding
    const model = config.model || 'gemini-2.5-flash';
    
    // Build prompt with language hint if provided
    let prompt = 'Please transcribe the following audio accurately. Return only the transcribed text, nothing else.';
    if (config.language) {
      const langName = SUPPORTED_LANGUAGES[config.language as keyof typeof SUPPORTED_LANGUAGES] || config.language;
      prompt = `Please transcribe the following audio in ${langName}. Return only the transcribed text, nothing else.`;
    }
    if (config.prompt) {
      prompt += ` Additional context: ${config.prompt}`;
    }

    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: audio.type || 'audio/mp3',
                data: base64Audio,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || '';

    return {
      success: true,
      data: {
        text: text.trim(),
        provider: 'gemini',
        language: config.language,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini transcription error';
    console.error('[VoiceInputTool] Gemini transcription failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Transcribe audio using the configured provider
 */
export async function transcribeAudio(
  audio: File,
  config: VoiceInputConfig = { provider: 'openai' }
): Promise<ToolResult<VoiceInputOutput>> {
  try {
    // Validate audio format
    if (!SUPPORTED_AUDIO_FORMATS.includes(audio.type as typeof SUPPORTED_AUDIO_FORMATS[number])) {
      return {
        success: false,
        error: `Unsupported audio format: ${audio.type}. Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`,
      };
    }

    // Validate file size (25MB limit for both providers)
    const maxSize = 25 * 1024 * 1024;
    if (audio.size > maxSize) {
      return {
        success: false,
        error: `Audio file too large: ${(audio.size / 1024 / 1024).toFixed(2)}MB. Maximum: 25MB`,
      };
    }

    // Route to appropriate provider
    const provider = config.provider || 'openai';
    
    if (provider === 'gemini') {
      return await transcribeWithGemini(audio, config);
    } else {
      return await transcribeWithOpenAI(audio, config);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';
    console.error('[VoiceInputTool] Transcription failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create client-side voice input tool implementation
 *
 * @returns TanStack AI tool client implementation
 */
export function createVoiceInputClientTool() {
  return voiceInputDef.client(async (input: unknown): Promise<ToolResult<VoiceInputOutput>> => {
    const args = input as VoiceInputInput;

    try {
      let audioFile: File;

      // Primary path: base64Audio (required for LLM calls)
      if (args.base64Audio && args.mimeType) {
        audioFile = base64ToFile(args.base64Audio, args.mimeType, args.filename);
      } else if (args.audio && (args.audio as unknown) instanceof File) {
        // Runtime check: args.audio might be a File object from client-side UI
        // Schema uses z.string() for API compatibility, but actual value can be File
        // Fallback: direct File object from client-side UI
        audioFile = args.audio as unknown as File;
      } else {
        return {
          success: false,
          error: 'base64Audio and mimeType are required',
        };
      }

      // Transcribe with defaults
      return await transcribeAudio(audioFile, args.config || { provider: 'openai' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown voice input error';
      console.error('[VoiceInputTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}

/**
 * Quick transcription helper for direct usage
 */
export async function quickTranscribe(
  audio: File | Blob,
  options?: { provider?: 'openai' | 'gemini'; language?: string }
): Promise<{ text: string; success: boolean; error?: string }> {
  const file = audio instanceof File ? audio : new File([audio], 'recording.webm', { type: audio.type });
  
  const result = await transcribeAudio(file, { 
    provider: options?.provider || 'openai',
    language: options?.language,
  });
  
  if (result.success && result.data) {
    return { text: result.data.text, success: true };
  }
  
  return { text: '', success: false, error: result.error };
}
