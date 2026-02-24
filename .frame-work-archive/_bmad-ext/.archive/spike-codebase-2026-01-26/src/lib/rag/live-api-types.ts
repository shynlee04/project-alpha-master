/**
 * @fileoverview Live API WebSocket Types
 * @module lib/rag/live-api-types
 * @governance EPIC-10-1
 *
 * Type definitions for Gemini Live API WebSocket integration.
 * Supports real-time bidirectional audio streaming.
 */

/**
 * Voice mode states for UI state management
 */
export type VoiceModeState =
  | 'idle' // Microphone available, not active
  | 'connecting' // Establishing WebSocket connection
  | 'listening' // Capturing audio from microphone
  | 'processing' // Sending audio to server, awaiting response
  | 'speaking' // Server is sending audio response
  | 'error' // Connection or audio error
  | 'disconnected'; // WebSocket closed

/**
 * Audio configuration for capture and playback
 */
export interface AudioConfig {
  /** Sample rate in Hz (16000 for voice recognition) */
  sampleRate: number;
  /** Number of audio channels (1 = mono) */
  channels: number;
  /** Chunk size in samples */
  chunkSize: number;
  /** Audio format (float32, int16, etc.) */
  format: 'float32' | 'int16';
}

/**
 * Default audio configuration optimized for voice
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000, // 16kHz for voice recognition
  channels: 1, // Mono
  chunkSize: 1024, // 64ms at 16kHz
  format: 'float32',
};

/**
 * WebSocket connection state
 */
export interface ConnectionState {
  /** Current connection state */
  state: 'disconnected' | 'connecting' | 'connected' | 'error';
  /** Number of retry attempts */
  retryCount: number;
  /** Last error message (if any) */
  lastError?: string;
  /** Connection timestamp */
  connectedAt?: number;
}

/**
 * Gemini Live API WebSocket message parts
 */
export interface MessagePart {
  /** Text content */
  text?: string;
  /** Inline data (audio/video) */
  inline_data?: {
    mime_type: string;
    data: string; // base64 encoded
  };
}

/**
 * Client content sent to server
 */
export interface ClientContent {
  /** Client content wrapper */
  clientContent?: {
    /** Array of message parts */
    parts: MessagePart[];
  };
}

/**
 * Server content received from server
 */
export interface ServerContent {
  /** Server content wrapper */
  serverContent?: {
    /** Array of message parts */
    parts: MessagePart[];
    /** Role is always 'model' for server responses */
    role: 'model';
  };
}

/**
 * WebSocket message types
 */
export type WebSocketMessage = ClientContent | ServerContent;

/**
 * Audio chunk for streaming
 */
export interface AudioChunk {
  /** Audio data (Float32Array for float32, Int16Array for int16) */
  data: Float32Array | Int16Array;
  /** Timestamp when chunk was captured */
  timestamp: number;
  /** Chunk index in stream */
  index: number;
}

/**
 * Jitter buffer configuration for smooth playback
 */
export interface JitterBufferConfig {
  /** Minimum buffer size in chunks */
  minChunks: number;
  /** Maximum buffer size in chunks */
  maxChunks: number;
  /** Target buffer size in chunks */
  targetChunks: number;
  /** Adaptive buffer adjustment */
  adaptive: boolean;
}

/**
 * Default jitter buffer configuration
 */
export const DEFAULT_JITTER_CONFIG: JitterBufferConfig = {
  minChunks: 2, // ~128ms
  maxChunks: 8, // ~512ms
  targetChunks: 4, // ~256ms
  adaptive: true,
};

/**
 * Voice mode store state
 */
export interface VoiceModeStoreState {
  /** Current voice mode state */
  voiceState: VoiceModeState;
  /** WebSocket connection state */
  connection: ConnectionState;
  /** Whether microphone is enabled */
  microphoneEnabled: boolean;
  /** Platform detection result */
  isDesktop: boolean;
  /** Volume level (0-1) for visualization */
  volumeLevel: number;
  /** Current audio chunk being processed */
  currentChunk?: AudioChunk;
}

/**
 * Voice mode store actions
 */
export interface VoiceModeActions {
  /** Start voice mode (connect WebSocket) */
  startVoiceMode: () => Promise<void>;
  /** Stop voice mode (disconnect WebSocket) */
  stopVoiceMode: () => void;
  /** Toggle microphone on/off */
  toggleMicrophone: () => void;
  /** Send audio chunk to server */
  sendAudioChunk: (chunk: AudioChunk) => void;
  /** Receive audio chunk from server */
  receiveAudioChunk: (chunk: AudioChunk) => void;
  /** Set connection state */
  setConnectionState: (state: ConnectionState) => void;
  /** Set voice state */
  setVoiceState: (state: VoiceModeState) => void;
  /** Update volume level */
  setVolumeLevel: (level: number) => void;
  /** Handle connection error */
  handleConnectionError: (error: string) => void;
}

/**
 * Error types for WebSocket failures
 */
export class WebSocketError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'WebSocketError';
  }
}

/**
 * Audio capture error
 */
export class AudioCaptureError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AudioCaptureError';
  }
}

/**
 * Audio playback error
 */
export class AudioPlaybackError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AudioPlaybackError';
  }
}

/**
 * Platform detection result
 */
export interface PlatformInfo {
  /** Whether running on desktop */
  isDesktop: boolean;
  /** User agent string */
  userAgent: string;
  /** Screen width (for responsive detection) */
  screenWidth: number;
  /** Whether WebSocket is supported */
  webSocketSupported: boolean;
  /** Whether Web Audio API is supported */
  webAudioSupported: boolean;
}

/**
 * Retry configuration for WebSocket reconnection
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial retry delay in ms */
  initialDelay: number;
  /** Maximum retry delay in ms */
  maxDelay: number;
  /** Exponential backoff factor */
  backoffFactor: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000, // 1s
  maxDelay: 4000, // 4s
  backoffFactor: 2,
};
