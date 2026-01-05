/**
 * useVoiceRecording Hook
 *
 * Chat-optimized voice recording hook for speech-to-text input.
 * Wraps AudioCaptureHandler from EPIC-10-1 for simplified chat integration.
 *
 * @module voice/use-voice-recording
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AudioCaptureHandler,
  getAudioCapture,
  type AudioCaptureConfig,
} from '@/lib/rag/audio-capture';

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
 * Wraps the existing AudioCaptureHandler from EPIC-10-1.
 *
 * @example
 * ```tsx
 * const { isRecording, startRecording, stopRecording, error } = useVoiceRecording();
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
  const { t } = useTranslation();
  const config = { ...DEFAULT_CONFIG, ...options };

  // State
  const [state, setState] = useState<UseVoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    volumeLevel: 0,
    error: null,
    isSupported: checkBrowserSupport(),
  });

  // Refs
  const audioHandlerRef = useRef<AudioCaptureHandler | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const lastVolumeTimeRef = useRef<number>(Date.now());
  const stopRecordingRef = useRef<(() => Promise<string | null>) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioHandlerRef.current) {
        audioHandlerRef.current.stop();
        audioHandlerRef.current = null;
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
      return null;
    }

    // Stop recording
    handler.stop();
    audioHandlerRef.current = null;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // For now, return null - transcript will be added in E2-2
    // This hook provides the recording foundation
    setState((prev) => ({
      ...prev,
      isRecording: false,
      isProcessing: false,
      volumeLevel: 0,
    }));

    // TODO: E2-2 will integrate with Gemini Live API for transcription
    return null;
  }, [config.minDuration, t]);

  // Keep ref updated
  stopRecordingRef.current = stopRecordingImpl;

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: t('voice.notSupported'),
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isRecording: true, error: null, isProcessing: false }));

      // Get or create audio handler with chat-optimized config
      const audioConfig: AudioCaptureConfig = {
        audioConfig: {
          sampleRate: config.sampleRate,
          channels: config.channels,
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

      // Set up auto-stop after max duration using ref to avoid circular dependency
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
          return;
        }
      }
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: t('voice.error'),
      }));
    }
  }, [state.isSupported, config, t, stopRecordingImpl]);

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
    if (handler) {
      handler.stop();
      audioHandlerRef.current = null;
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
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  };
}
