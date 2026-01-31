/**
 * @fileoverview Voice Output Hook - React Hook for Text-to-Speech
 * @module lib/agent/hooks/use-voice-output
 *
 * React hook wrapping the voice-output-tool for browser audio playback
 * using OpenAI TTS or Google Gemini TTS.
 *
 * @governance EPIC-40, MM-08
 * @story Multimodal Chat Unification - Voice Output Hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  generateTextToSpeech,
  quickSpeak,
  type VoiceOutputConfig,
  TTS_PROVIDERS,
  OPENAI_VOICES,
  GEMINI_VOICES,
} from '../tools/voice-output-tool';

/**
 * Voice output hook state
 */
export type VoiceOutputState =
  | 'idle'        // Ready to speak
  | 'generating'  // Generating speech
  | 'playing'     // Playing audio
  | 'paused'      // Audio paused
  | 'error';      // Error occurred

/**
 * Voice output hook options
 */
export interface UseVoiceOutputOptions {
  /** Provider to use for TTS */
  provider?: 'openai' | 'gemini';
  /** Voice name */
  voice?: string;
  /** Audio format */
  format?: 'mp3' | 'wav';
  /** Speech speed (0.25 to 4.0, default: 1.0) */
  speed?: number;
  /** Callback when speech starts playing */
  onStart?: () => void;
  /** Callback when speech finishes playing */
  onEnd?: () => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
  /** Callback when state changes */
  onStateChange?: (state: VoiceOutputState) => void;
}

/**
 * Queued utterance for sequential playback
 */
interface QueuedUtterance {
  text: string;
  config: VoiceOutputConfig;
}

/**
 * Voice output hook return type
 */
export interface UseVoiceOutputReturn {
  /** Current playback state */
  state: VoiceOutputState;
  /** Whether currently generating speech */
  isGenerating: boolean;
  /** Whether currently playing */
  isPlaying: boolean;
  /** Whether paused */
  isPaused: boolean;
  /** Current queue length */
  queueLength: number;
  /** Last error message */
  error: string | null;
  /** Speak text (adds to queue) */
  speak: (text: string, config?: Partial<VoiceOutputConfig>) => Promise<void>;
  /** Stop current playback and clear queue */
  stop: () => void;
  /** Pause current playback */
  pause: () => void;
  /** Resume paused playback */
  resume: () => void;
  /** Skip current utterance */
  skip: () => void;
  /** Clear the queue */
  clearQueue: () => void;
}

/**
 * React hook for voice output (text-to-speech)
 *
 * @param options - Voice output configuration
 * @returns Voice output controls and state
 *
 * @example
 * ```tsx
 * const { speak, stop, isPlaying } = useVoiceOutput({
 *   provider: 'openai',
 *   voice: 'nova',
 *   onEnd: () => console.log('Speech finished'),
 * });
 *
 * return (
 *   <>
 *     <button onClick={() => speak('Hello, world!')}>Speak</button>
 *     <button onClick={stop} disabled={!isPlaying}>Stop</button>
 *   </>
 * );
 * ```
 */
export function useVoiceOutput(options: UseVoiceOutputOptions = {}): UseVoiceOutputReturn {
  const {
    provider = 'openai',
    voice,
    format = 'mp3',
    speed = 1.0,
    onStart,
    onEnd,
    onError,
    onStateChange,
  } = options;

  // State
  const [state, setState] = useState<VoiceOutputState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [queueLength, setQueueLength] = useState(0);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueuedUtterance[]>([]);
  const isProcessingRef = useRef(false);

  // Update state with callback
  const updateState = useCallback((newState: VoiceOutputState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // Handle error
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    updateState('error');
    onError?.(errorMessage);
  }, [updateState, onError]);

  // Cleanup audio element
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  // Process queue
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const utterance = queueRef.current.shift();
    setQueueLength(queueRef.current.length);

    if (!utterance) {
      isProcessingRef.current = false;
      return;
    }

    try {
      updateState('generating');
      setError(null);

      // Generate speech
      const result = await generateTextToSpeech(utterance.text, utterance.config);

      if (!result.success || !result.data) {
        handleError(result.error || 'Failed to generate speech');
        isProcessingRef.current = false;
        processQueue(); // Continue with next in queue
        return;
      }

      // Create and play audio
      updateState('playing');
      onStart?.();

      const audio = new Audio(`data:${result.data.contentType};base64,${result.data.audio}`);
      audioRef.current = audio;

      // Set up event handlers
      audio.onended = () => {
        cleanupAudio();
        updateState('idle');
        onEnd?.();
        isProcessingRef.current = false;
        processQueue(); // Process next in queue
      };

      audio.onerror = () => {
        handleError('Audio playback failed');
        cleanupAudio();
        isProcessingRef.current = false;
        processQueue();
      };

      // Play audio
      await audio.play();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TTS failed';
      handleError(errorMessage);
      isProcessingRef.current = false;
      processQueue();
    }
  }, [updateState, handleError, cleanupAudio, onStart, onEnd]);

  // Speak text
  const speak = useCallback(async (text: string, config?: Partial<VoiceOutputConfig>) => {
    if (!text.trim()) {
      return;
    }

    // Build full config
    const fullConfig: VoiceOutputConfig = {
      provider: config?.provider || provider,
      voice: config?.voice || voice,
      format: config?.format || format,
      speed: config?.speed || speed,
      model: config?.model,
      languageCode: config?.languageCode,
      systemInstruction: config?.systemInstruction,
    };

    // Add to queue
    queueRef.current.push({ text, config: fullConfig });
    setQueueLength(queueRef.current.length);

    // Start processing if not already
    processQueue();
  }, [provider, voice, format, speed, processQueue]);

  // Stop playback and clear queue
  const stop = useCallback(() => {
    cleanupAudio();
    queueRef.current = [];
    setQueueLength(0);
    isProcessingRef.current = false;
    updateState('idle');
  }, [cleanupAudio, updateState]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      audioRef.current.pause();
      updateState('paused');
    }
  }, [state, updateState]);

  // Resume playback
  const resume = useCallback(() => {
    if (audioRef.current && state === 'paused') {
      audioRef.current.play();
      updateState('playing');
    }
  }, [state, updateState]);

  // Skip current utterance
  const skip = useCallback(() => {
    cleanupAudio();
    isProcessingRef.current = false;
    updateState('idle');
    processQueue();
  }, [cleanupAudio, updateState, processQueue]);

  // Clear queue
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueueLength(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      queueRef.current = [];
    };
  }, [cleanupAudio]);

  return {
    state,
    isGenerating: state === 'generating',
    isPlaying: state === 'playing',
    isPaused: state === 'paused',
    queueLength,
    error,
    speak,
    stop,
    pause,
    resume,
    skip,
    clearQueue,
  };
}

/**
 * Simple hook for one-off TTS without queue management
 */
export function useSpeakOnce(options: Omit<UseVoiceOutputOptions, 'onStart' | 'onEnd'> = {}) {
  const { provider = 'openai', voice, format = 'mp3', onError } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) {
      return false;
    }

    setIsSpeaking(true);
    setError(null);

    try {
      const result = await quickSpeak(text, { provider, voice, format });
      
      if (!result.success) {
        setError(result.error || 'TTS failed');
        onError?.(result.error || 'TTS failed');
        setIsSpeaking(false);
        return false;
      }

      // Play audio
      const audio = new Audio(URL.createObjectURL(result.audio));
      audioRef.current = audio;

      return new Promise((resolve) => {
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          resolve(true);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          setError('Playback failed');
          onError?.('Playback failed');
          audioRef.current = null;
          resolve(false);
        };

        audio.play().catch(() => {
          setIsSpeaking(false);
          setError('Playback failed');
          onError?.('Playback failed');
          resolve(false);
        });
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TTS failed';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsSpeaking(false);
      return false;
    }
  }, [provider, voice, format, onError]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    isSpeaking,
    error,
    speak,
    stop,
  };
}

// Re-export useful constants
export { TTS_PROVIDERS, OPENAI_VOICES, GEMINI_VOICES };
