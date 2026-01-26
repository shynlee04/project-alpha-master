/**
 * @fileoverview Gemini Live API Transcription Service
 * @module lib/voice/gemini-transcription-service
 * @governance E2-2
 *
 * Orchestrates audio capture and WebSocket connection to Gemini Live API
 * for real-time speech-to-text transcription.
 */

import type { AudioChunk, ServerContent } from '@/lib/rag/live-api-types';
import { getWebSocketManager } from '@/lib/rag/live-api-websocket';

/**
 * Transcription session state
 */
export type TranscriptionState =
  | 'idle' // Not recording
  | 'connecting' // Establishing WebSocket connection
  | 'listening' // Connected, capturing audio
  | 'processing' // Waiting for transcription result
  | 'error' // Error occurred
  | 'disconnected'; // WebSocket disconnected

/**
 * Transcription result
 */
export interface TranscriptionResult {
  /** Transcribed text (empty if no speech detected) */
  text: string;
  /** Whether transcription was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Transcription service configuration
 */
export interface TranscriptionConfig {
  /** Gemini API key */
  apiKey: string;
  /** Language code for speech recognition (default: from i18n) */
  languageCode?: string;
  /** Callback for state changes */
  onStateChange?: (state: TranscriptionState) => void;
  /** Callback for errors */
  onError?: (error: string) => void;
  /** Callback for partial transcript (real-time) */
  onPartialTranscript?: (text: string) => void;
}

/**
 * Default language codes
 */
const LANGUAGE_CODES: Record<string, string> = {
  en: 'en-US',
  vi: 'vi-VN',
};

/**
 * Get language code from i18n language
 */
function getLanguageCode(i18nLanguage: string): string {
  return LANGUAGE_CODES[i18nLanguage] || LANGUAGE_CODES.en;
}

/**
 * Gemini Live API Transcription Service
 *
 * Orchestrates audio capture and WebSocket connection for speech-to-text.
 */
export class GeminiTranscriptionService {
  private config: TranscriptionConfig;
  private wsManager: ReturnType<typeof getWebSocketManager> | null = null;
  private state: TranscriptionState = 'idle';
  private transcriptBuffer: string[] = [];
  private sessionActive = false;

  constructor(config: TranscriptionConfig) {
    this.config = config;
  }

  /**
   * Get current state
   */
  getState(): TranscriptionState {
    return this.state;
  }

  /**
   * Start transcription session
   */
  async start(i18nLanguage: string = 'en'): Promise<void> {
    if (this.state === 'listening' || this.state === 'connecting') {
      return; // Already started
    }

    this.setState('connecting');
    this.transcriptBuffer = [];
    this.sessionActive = true;

    const languageCode = this.config.languageCode || getLanguageCode(i18nLanguage);

    try {
      // Initialize WebSocket manager
      this.wsManager = getWebSocketManager({
        apiKey: this.config.apiKey,
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        onStateChange: (wsState) => {
          if (wsState.state === 'error') {
            this.handleError(wsState.lastError || 'Connection error');
          }
        },
        onMessage: this.handleMessage.bind(this),
        onError: (error) => {
          this.handleError(error.message);
        },
      });

      // Connect to WebSocket
      await this.wsManager.connect();

      // Wait for connection to be established
      const connected = await this.waitForConnection(5000);
      if (!connected) {
        throw new Error('Connection timeout');
      }

      // Send session setup message
      this.sendSetupMessage(languageCode);

      this.setState('listening');

    } catch (error) {
      this.handleError(
        error instanceof Error ? error.message : 'Failed to start transcription'
      );
      this.stop();
    }
  }

  /**
   * Send audio chunk to server
   */
  sendAudioChunk(chunk: AudioChunk): void {
    if (this.state !== 'listening' || !this.wsManager) {
      return;
    }

    try {
      this.wsManager.sendAudioChunk(chunk);
    } catch (error) {
      console.error('Failed to send audio chunk:', error);
    }
  }

  /**
   * Stop transcription and get result
   */
  async stop(): Promise<TranscriptionResult> {
    if (this.state === 'idle') {
      return { text: '', success: true };
    }

    this.sessionActive = false;
    this.setState('processing');

    try {
      // Send end-of-speech signal
      this.sendEndOfSpeech();

      // Wait for final transcript (timeout 3s)
      const transcript = await this.waitForFinalTranscript(3000);

      // Disconnect WebSocket
      this.wsManager?.disconnect();
      this.wsManager = null;

      this.setState('idle');

      // Return result
      const text = transcript.trim();
      return {
        text,
        success: true,
      };

    } catch (error) {
      this.stopInternal();
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
      };
    }
  }

  /**
   * Cancel recording without getting transcript
   */
  cancel(): void {
    this.stopInternal();
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: ServerContent): void {
    if (!this.sessionActive) {
      return;
    }

    const serverContent = message.serverContent;
    if (!serverContent) {
      return;
    }

    // Extract text from parts
    for (const part of serverContent.parts) {
      if (part.text) {
        const text = part.text.trim();
        if (text) {
          this.transcriptBuffer.push(text);
          this.config.onPartialTranscript?.(text);
        }
      }
    }
  }

  /**
   * Send session setup message
   */
  private sendSetupMessage(languageCode: string): void {
    if (!this.wsManager) {
      return;
    }

    const setupMessage = {
      setup: {
        generationConfig: {
          responseModalities: ['AUDIO', 'TEXT'],
          speechConfig: {
            languageCode,
          },
        },
      },
    };

    this.wsManager.send({
      clientContent: {
        parts: [{ text: JSON.stringify(setupMessage) }],
      },
    });
  }

  /**
   * Send end-of-speech signal
   */
  private sendEndOfSpeech(): void {
    if (!this.wsManager) {
      return;
    }

    const eosMessage = {
      endOfSpeech: true,
    };

    this.wsManager.send({
      clientContent: {
        parts: [{ text: JSON.stringify(eosMessage) }],
      },
    });
  }

  /**
   * Wait for WebSocket connection
   */
  private waitForConnection(timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), timeoutMs);

      const checkInterval = setInterval(() => {
        if (this.wsManager?.isConnected()) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 50);

      // Clear interval if already connected
      if (this.wsManager?.isConnected()) {
        clearTimeout(timeout);
        clearInterval(checkInterval);
        resolve(true);
      }
    });
  }

  /**
   * Wait for final transcript
   */
  private waitForFinalTranscript(timeoutMs: number): Promise<string> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(this.transcriptBuffer.join(' '));
      }, timeoutMs);

      // Poll for transcript completion
      const checkInterval = setInterval(() => {
        const transcript = this.transcriptBuffer.join(' ').trim();
        if (transcript && !this.sessionActive) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(transcript);
        }
      }, 100);
    });
  }

  /**
   * Handle error
   */
  private handleError(message: string): void {
    this.setState('error');
    this.config.onError?.(message);
  }

  /**
   * Update state
   */
  private setState(state: TranscriptionState): void {
    this.state = state;
    this.config.onStateChange?.(state);
  }

  /**
   * Internal stop (cleanup only)
   */
  private stopInternal(): void {
    this.sessionActive = false;
    this.wsManager?.disconnect();
    this.wsManager = null;
    this.setState('idle');
  }
}

/**
 * Singleton instance (lazy-loaded)
 */
let transcriptionService: GeminiTranscriptionService | null = null;

export function getTranscriptionService(config: TranscriptionConfig): GeminiTranscriptionService {
  if (!transcriptionService) {
    transcriptionService = new GeminiTranscriptionService(config);
  }
  return transcriptionService;
}

export function resetTranscriptionService(): void {
  if (transcriptionService) {
    transcriptionService.cancel();
    transcriptionService = null;
  }
}
