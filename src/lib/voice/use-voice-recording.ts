/**
 * useVoiceRecording Hook
 *
 * Chat-optimized voice recording hook for speech-to-text input.
 * Integrates AudioCaptureHandler and GeminiTranscriptionService for full speech-to-text.
 *
 * @module voice/use-voice-recording
 * @governance E2-1, E2-2
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AudioChunk } from '@/lib/rag/live-api-types';
import {
  AudioCaptureHandler,
  getAudioCapture,
  type AudioCaptureConfig,
} from '@/lib/rag/audio-capture';
import {
  getTranscriptionService,
  type TranscriptionResult,
} from '@/lib/voice/gemini-transcription-service';
import { GeminiTranscriptionService } from '@/lib/voice/gemini-transcription-service';

// Type alias for the ref
type TranscriptionService = GeminiTranscriptionService;

/**
 * Voice recording state
 */
export interface UseVoiceRecordingState {
  /** Is recording audio */
  isRecording: boolean;
  /** Is processing transcript */
  isProcessing: boolean;
  /** Volume level 0-1 for visualization */
  volumeLevel: number;
  /** Error message if any */
  error: string | null;
  /** Whether browser supports voice input */
  isSupported: boolean;
}

/**
 * Voice recording actions
 */
export interface UseVoiceRecordingActions {
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording and get transcript */
  stopRecording: () => Promise<string | null>;
  /** Cancel recording */
  cancelRecording: () => void;
  /** Clear current error */
  clearError: () => void;
}

/**
 * Result of useVoiceRecording hook
 */
export type UseVoiceRecordingResult = UseVoiceRecordingState & UseVoiceRecordingActions;

/**
 * Configuration options for voice recording
 */
export interface UseVoiceRecordingOptions {
  /** Minimum recording duration in ms (default: 500ms) */
  minDuration?: number;
  /** Maximum recording duration in ms (default: 30000ms) */
  maxDuration?: number;
  /** Auto-send after silence duration in ms (default: 2000ms) */
  autoSendAfterSilence?: number;
  /** Sample rate for audio capture (default: 16000Hz for voice) */
  sampleRate?: number;
  /** Number of audio channels (default: 1) */
  channels?: number;
  /** Gemini API key (required for transcription) */
  apiKey?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<UseVoiceRecordingOptions> = {
  minDuration: 500,
  maxDuration: 30000,
  autoSendAfterSilence: 2000,
  sampleRate: 16000,
  channels: 1,
  apiKey: '',
};

/**
 * Check if browser supports audio recording
 */
function checkBrowserSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * Hook for voice recording in chat interfaces.
 *
 * Provides a simplified API for voice-to-text input in chat.
 * Integrates AudioCaptureHandler and GeminiTranscriptionService.
 *
 * @example
 * ```tsx
 * const { isRecording, startRecording, stopRecording, error } = useVoiceRecording({
 *   apiKey: import.meta.env.VITE_GEMINI_API_KEY,
 * });
 *
 * <MicButton
 *   isRecording={isRecording}
 *   onPress={startRecording}
 *   onRelease={stopRecording}
 * />
 * ```
 */
export function useVoiceRecording(
  options: UseVoiceRecordingOptions = {}
): UseVoiceRecordingResult {
  const { t, i18n } = useTranslation();
  const config = { ...DEFAULT_CONFIG, ...options };

  // State - isSupported is static per session, so separate it
  const isSupported = checkBrowserSupport();
  const [state, setState] = useState<Omit<UseVoiceRecordingState, 'isSupported'>>({
    isRecording: false,
    isProcessing: false,
    volumeLevel: 0,
    error: null,
  });

  // Refs
  const audioHandlerRef = useRef<AudioCaptureHandler | null>(null);
  const transcriptionServiceRef = useRef<TranscriptionService | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const lastVolumeTimeRef = useRef<number>(Date.now());
  const transcriptResultRef = useRef<TranscriptionResult | null>(null);

  // Create transcription service with API key
  const transcriptionService = useMemo(() => {
    const apiKey = config.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return getTranscriptionService({
      apiKey,
      onStateChange: (transcriptionState) => {
        // Map transcription state to hook state
        if (transcriptionState === 'processing') {
          setState((prev) => ({ ...prev, isProcessing: true }));
        }
      },
      onError: (errorMessage) => {
        setState((prev) => ({
          ...prev,
          error: errorMessage || t('voice.error'),
          isRecording: false,
          isProcessing: false,
        }));
      },
      onPartialTranscript: () => {
        // Optional: Show partial transcript in real-time
        // For now, we wait for final result
      },
    });
  }, [config.apiKey, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioHandlerRef.current) {
        audioHandlerRef.current.stop();
        audioHandlerRef.current = null;
      }
      if (transcriptionServiceRef.current) {
        transcriptionServiceRef.current.cancel();
        transcriptionServiceRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  /**
   * Internal stop implementation (not exposed)
   */
  const stopRecordingImpl = useCallback(async (): Promise<string | null> => {
    const handler = audioHandlerRef.current;
    const service = transcriptionServiceRef.current;

    if (!handler) {
      return null;
    }

    const recordingDuration = Date.now() - recordingStartTimeRef.current;

    // Check minimum duration
    if (recordingDuration < config.minDuration) {
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: t('voice.tooShort'),
      }));
      handler.stop();
      audioHandlerRef.current = null;
      service?.cancel();
      transcriptionServiceRef.current = null;
      return null;
    }

    // Stop audio capture
    handler.stop();
    audioHandlerRef.current = null;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Get transcription from service
    let transcript = '';
    if (service) {
      const result: TranscriptionResult = await service.stop();
      transcriptResultRef.current = result;

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          error: result.error || t('voice.error'),
        }));
      }
      transcript = result.text;
      transcriptionServiceRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isProcessing: false,
      volumeLevel: 0,
    }));

    return transcript || null;
  }, [config.minDuration, t]);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: t('voice.notSupported'),
      }));
      return;
    }

    if (!transcriptionService) {
      setState((prev) => ({
        ...prev,
        error: t('voice.apiKeyMissing', 'Gemini API key not configured'),
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isRecording: true, error: null, isProcessing: false }));
      transcriptResultRef.current = null;

      // Start transcription service
      await transcriptionService.start(i18n.language);
      transcriptionServiceRef.current = transcriptionService;

      // Get or create audio handler with chat-optimized config
      const audioConfig: AudioCaptureConfig = {
        audioConfig: {
          sampleRate: config.sampleRate,
          channels: config.channels,
        },
        onChunk: (chunk: AudioChunk) => {
          // Stream audio chunk to transcription service
          transcriptionServiceRef.current?.sendAudioChunk(chunk);
        },
        onVolumeChange: (level: number) => {
          setState((prev) => ({ ...prev, volumeLevel: level }));
          lastVolumeTimeRef.current = Date.now();

          // Check for silence to auto-send
          if (
            level < 0.01 &&
            Date.now() - recordingStartTimeRef.current > config.minDuration
          ) {
            // Silence detected, could auto-send here
            // For now, just track the last silence time
          }
        },
        onError: (error) => {
          setState((prev) => ({
            ...prev,
            isRecording: false,
            isProcessing: false,
            error: error.message || t('voice.error'),
          }));
        },
      };

      const handler = getAudioCapture(audioConfig);
      await handler.start();
      audioHandlerRef.current = handler;
      recordingStartTimeRef.current = Date.now();

      // Set up auto-stop after max duration
      silenceTimerRef.current = setTimeout(async () => {
        if (audioHandlerRef.current) {
          await stopRecordingImpl();
        }
      }, config.maxDuration);
    } catch (err) {
      if (err instanceof Error) {
        // Check for permission denied
        if (err.name === 'NotAllowedError' || err.message.includes('Permission')) {
          setState((prev) => ({
            ...prev,
            isRecording: false,
            isProcessing: false,
            error: t('voice.permissionDenied'),
          }));
          transcriptionService?.cancel();
          return;
        }
      }
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: t('voice.error'),
      }));
      transcriptionService?.cancel();
    }
  }, [isSupported, config, transcriptionService, i18n.language, t, stopRecordingImpl]);

  /**
   * Stop recording and return transcript
   */
  const stopRecording = useCallback(async (): Promise<string | null> => {
    return stopRecordingImpl();
  }, [stopRecordingImpl]);

  /**
   * Cancel recording
   */
  const cancelRecording = useCallback(() => {
    const handler = audioHandlerRef.current;
    const service = transcriptionServiceRef.current;

    if (handler) {
      handler.stop();
      audioHandlerRef.current = null;
    }

    if (service) {
      service.cancel();
      transcriptionServiceRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isProcessing: false,
      volumeLevel: 0,
      error: null,
    }));
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  };
}
