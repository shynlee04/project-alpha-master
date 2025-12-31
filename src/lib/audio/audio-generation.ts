/**
 * @fileoverview Audio Generation Service
 * @module lib/audio/audio-generation
 * @governance EPIC-10-3
 *
 * Generates audio overviews using Gemini 3.0 Flash text-to-speech.
 * Stores audio blobs in IndexedDB for offline playback.
 *
 * Story 10.3: Audio Overview Generator
 */

import type { CoreMessage } from '@tanstack/ai-core';

export interface AudioGenerationOptions {
  /**
   * Source content to summarize
   */
  sourceContent: string;

  /**
   * Source title for context
   */
  sourceTitle: string;

  /**
   * Language code (default: 'en' for English, 'vi' for Vietnamese)
   */
  language?: 'en' | 'vi';

  /**
   * Voice name (default: 'Aoede' for Gemini)
   */
  voiceName?: string;

  /**
   * Custom system prompt
   */
  systemPrompt?: string;

  /**
   * Progress callback
   */
  onProgress?: (stage: 'script' | 'audio', progress: number) => void;
}

export interface GeneratedAudio {
  /**
   * Audio blob URL
   */
  audioUrl: string;

  /**
   * Audio blob (for storage)
   */
  audioBlob: Blob;

  /**
   * Generated transcript
   */
  transcript: string;

  /**
   * Audio duration in seconds
   */
  duration: number;

  /**
   * Generation timestamp
   */
  generatedAt: number;

  /**
   * Source metadata
   */
  sourceId: string;
  sourceTitle: string;
}

export interface AudioGenerationRequest {
  sourceContent: string;
  sourceTitle: string;
  language: 'en' | 'vi';
  voiceName: string;
  systemPrompt: string;
  responseModalities: ['AUDIO'];
  speechConfig: {
    voiceName: string;
  };
}

/**
 * Default system prompts for audio generation
 */
const DEFAULT_SYSTEM_PROMPTS = {
  en: 'Create a lively 2-person dialogue debating key points from this source. Make it engaging and conversational.',
  vi: 'Tạo cuộc hội thoại sôi nổi giữa 2 người tranh luận các điểm chính từ nguồn này. Hãy làm cho nó thú vị và đối thoại.',
};

/**
 * Generate audio overview from source content
 *
 * @param options - Audio generation options
 * @param chatFn - TanStack AI chat function (injected for testability)
 * @returns Generated audio data
 *
 * @example
 * ```typescript
 * const audio = await generateAudioOverview({
 *   sourceContent: 'Chapter 1: Introduction to biology...',
 *   sourceTitle: 'Biology Textbook Ch1',
 *   language: 'en',
 *   onProgress: (stage, progress) => console.log(`${stage}: ${progress}%`),
 * });
 * ```
 */
export async function generateAudioOverview(
  options: AudioGenerationOptions,
  chatFn?: (messages: CoreMessage[]) => AsyncIterable<unknown>
): Promise<GeneratedAudio> {
  const {
    sourceContent,
    sourceTitle,
    language = 'en',
    // voiceName = 'Aoede',
    systemPrompt = DEFAULT_SYSTEM_PROMPTS[language],
    onProgress,
  } = options;

  // Build system message with context
  const systemMessage: CoreMessage = {
    role: 'system',
    content: `${systemPrompt}\n\nSource: ${sourceTitle}\n\nContent:\n${sourceContent}`,
  };

  // Build user message requesting audio generation
  const userMessage: CoreMessage = {
    role: 'user',
    content: 'Generate an audio overview as a 2-person dialogue. Make it engaging and conversational.',
  };

  try {
    // Notify script generation started
    onProgress?.('script', 0);

    if (!chatFn) {
      throw new Error('Chat function not provided. Use with TanStack AI SDK.');
    }

    // Call TanStack AI chat with audio response modality
    const responseStream = chatFn([systemMessage, userMessage]);

    // Collect response chunks
    let transcript = '';
    let audioChunks: Uint8Array[] = [];
    let scriptProgress = 0;

    for await (const chunk of responseStream) {
      // Parse response chunk (TanStack AI format)
      if (typeof chunk === 'object' && chunk !== null) {
        const response = chunk as {
          content?: Array<{ type: string; text?: string; data?: unknown }>;
          delta?: { content?: Array<{ type: string; text?: string; data?: unknown }> };
        };

        // Extract content (direct or delta)
        const content = response.content || response.delta?.content || [];

        for (const item of content) {
          if (item.type === 'text' && item.text) {
            // Text transcript
            transcript += item.text;
            scriptProgress = Math.min(scriptProgress + 10, 90);
            onProgress?.('script', scriptProgress);
          } else if (item.type === 'audio' && item.data) {
            // Audio data (Uint8Array or base64)
            if (item.data instanceof Uint8Array) {
              audioChunks.push(item.data);
            } else if (typeof item.data === 'string') {
              // Base64 audio data
              const binaryString = atob(item.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              audioChunks.push(bytes);
            }
            onProgress?.('audio', audioChunks.length * 10);
          }
        }
      }
    }

    // Combine audio chunks into single blob
    onProgress?.('audio', 95);

    if (audioChunks.length === 0) {
      throw new Error('No audio data received from Gemini API');
    }

    // Calculate total length
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);

    // Combine all chunks
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }

    // Create blob from combined array
    const audioBlob = new Blob([combinedArray], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Estimate audio duration (rough estimate: 150 words per minute)
    const wordCount = transcript.split(/\s+/).length;
    const estimatedDuration = Math.ceil((wordCount / 150) * 60);

    onProgress?.('audio', 100);

    return {
      audioUrl,
      audioBlob,
      transcript,
      duration: estimatedDuration,
      generatedAt: Date.now(),
      sourceId: generateSourceId(sourceTitle),
      sourceTitle,
    };
  } catch (error) {
    console.error('Audio generation failed:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a unique source ID from title
 */
function generateSourceId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Estimate audio generation time based on content length
 *
 * @param wordCount - Number of words in source
 * @returns Estimated time in seconds
 */
export function estimateGenerationTime(wordCount: number): number {
  // Rough estimate: 1 second per 10 words for script generation + audio synthesis
  return Math.ceil((wordCount / 10) * 1.5);
}

/**
 * Format duration as human-readable string
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "5:30")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if audio generation is supported
 *
 * @returns true if browser supports required APIs
 */
export function isAudioGenerationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  );
}

/**
 * Revoke audio URL to free memory
 *
 * @param audioUrl - Audio URL to revoke
 */
export function revokeAudioUrl(audioUrl: string): void {
  if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(audioUrl);
  }
}
