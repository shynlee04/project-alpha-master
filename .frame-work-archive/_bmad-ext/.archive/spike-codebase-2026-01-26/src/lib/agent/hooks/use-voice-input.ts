/**
 * @fileoverview Voice Input Hook - React Hook for Speech-to-Text
 * @module lib/agent/hooks/use-voice-input
 *
 * React hook wrapping the voice-input-tool for browser audio capture
 * and transcription using OpenAI Whisper or Google Gemini.
 *
 * @governance EPIC-40, MM-07
 * @story Multimodal Chat Unification - Voice Input Hook
 */

import { useState, useCallback, useRef } from 'react';
import {
  transcribeAudio,
  quickTranscribe,
} from '../tools/voice-input-tool';

/**
 * Voice input hook state
 */
export type VoiceInputState = 
  | 'idle'           // Not recording
  | 'requesting'     // Requesting microphone permission
  | 'recording'      // Currently recording
  | 'processing'     // Transcribing audio
  | 'error';         // Error occurred

/**
 * Voice input hook options
 */
export interface UseVoiceInputOptions {
  /** Provider to use for transcription */
  provider?: 'openai' | 'gemini';
  /** Language code for transcription */
  language?: string;
  /** Callback when transcription is complete */
  onTranscript?: (text: string) => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
  /** Callback when state changes */
  onStateChange?: (state: VoiceInputState) => void;
  /** Maximum recording duration in seconds (default: 60) */
  maxDuration?: number;
  /** Audio MIME type (default: audio/webm) */
  mimeType?: string;
}

/**
 * Voice input hook return type
 */
export interface UseVoiceInputReturn {
  /** Current recording state */
  state: VoiceInputState;
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether processing transcription */
  isProcessing: boolean;
  /** Last transcribed text */
  transcript: string | null;
  /** Last error message */
  error: string | null;
  /** Recording duration in seconds */
  duration: number;
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording and get transcription */
  stopRecording: () => Promise<string | null>;
  /** Cancel recording without transcription */
  cancelRecording: () => void;
  /** Check if browser supports recording */
  isSupported: boolean;
}

/**
 * React hook for voice input (speech-to-text)
 *
 * @param options - Voice input configuration
 * @returns Voice input controls and state
 *
 * @example
 * ```tsx
 * const { isRecording, startRecording, stopRecording, transcript } = useVoiceInput({
 *   provider: 'gemini',
 *   onTranscript: (text) => console.log('Transcribed:', text),
 * });
 *
 * return (
 *   <button onClick={isRecording ? stopRecording : startRecording}>
 *     {isRecording ? 'Stop' : 'Record'}
 *   </button>
 * );
 * ```
 */
export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    provider = 'openai',
    language,
    onTranscript,
    onError,
    onStateChange,
    maxDuration = 60,
    mimeType = 'audio/webm',
  } = options;

  // State
  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Refs for MediaRecorder and audio chunks
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    'mediaDevices' in navigator && 
    'MediaRecorder' in window;

  // Update state with callback
  const updateState = useCallback((newState: VoiceInputState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // Handle error
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    updateState('error');
    onError?.(errorMessage);
  }, [updateState, onError]);

  // Cleanup resources
  const cleanup = useCallback(() => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // Stop media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Clear audio chunks
    audioChunksRef.current = [];
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      handleError('Voice recording is not supported in this browser');
      return;
    }

    if (state === 'recording' || state === 'processing') {
      return;
    }

    try {
      // Reset state
      setTranscript(null);
      setError(null);
      setDuration(0);
      audioChunksRef.current = [];
      updateState('requesting');

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      // Find supported MIME type
      let selectedMimeType = mimeType;
      if (!MediaRecorder.isTypeSupported(selectedMimeType)) {
        const fallbackTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
        selectedMimeType = fallbackTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle stop event
      mediaRecorder.onstop = () => {
        // Don't cleanup here - let stopRecording handle it
      };

      // Handle error
      mediaRecorder.onerror = () => {
        handleError('Recording error occurred');
        cleanup();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      updateState('recording');

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Auto-stop if max duration reached
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      
      // Check for permission denied
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        handleError('Microphone permission denied. Please allow microphone access.');
      } else {
        handleError(errorMessage);
      }
      
      cleanup();
    }
  }, [isSupported, state, mimeType, maxDuration, updateState, handleError, cleanup]);

  // Stop recording and transcribe
  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (state !== 'recording' || !mediaRecorderRef.current) {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        updateState('processing');

        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });

        // Cleanup recording resources
        cleanup();

        // Transcribe
        try {
          const result = await quickTranscribe(audioBlob, { provider, language });
          
          if (result.success) {
            setTranscript(result.text);
            onTranscript?.(result.text);
            updateState('idle');
            resolve(result.text);
          } else {
            handleError(result.error || 'Transcription failed');
            resolve(null);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
          handleError(errorMessage);
          resolve(null);
        }
      };

      // Stop the recorder
      mediaRecorder.stop();
    });
  }, [state, provider, language, updateState, handleError, cleanup, onTranscript]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    cleanup();
    setDuration(0);
    updateState('idle');
  }, [cleanup, updateState]);

  return {
    state,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
    transcript,
    error,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    isSupported,
  };
}

/**
 * Hook for transcribing a file without recording
 */
export function useTranscribeFile(options: Omit<UseVoiceInputOptions, 'maxDuration' | 'mimeType'> = {}) {
  const { provider = 'openai', language, onTranscript, onError } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcribeFile = useCallback(async (file: File): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);
    setTranscript(null);

    try {
      const result = await transcribeAudio(file, { provider, language });
      
      if (result.success && result.data) {
        setTranscript(result.data.text);
        onTranscript?.(result.data.text);
        return result.data.text;
      } else {
        const errorMessage = result.error || 'Transcription failed';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [provider, language, onTranscript, onError]);

  return {
    isProcessing,
    transcript,
    error,
    transcribeFile,
  };
}
