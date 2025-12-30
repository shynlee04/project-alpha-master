/**
 * @fileoverview Audio Capture Handler
 * @module lib/rag/audio-capture
 * @governance EPIC-10-1
 *
 * Audio capture from microphone using Web Audio API.
 * Optimized for voice recognition at 16kHz.
 */

import type {
  AudioChunk,
  AudioConfig,
  AudioCaptureError,
  DEFAULT_AUDIO_CONFIG,
} from './live-api-types';

/**
 * Audio capture handler configuration
 */
interface AudioCaptureConfig {
  /** Audio configuration */
  audioConfig?: Partial<AudioConfig>;
  /** Callback when audio chunk is captured */
  onChunk?: (chunk: AudioChunk) => void;
  /** Callback when volume level changes */
  onVolumeChange?: (level: number) => void;
  /** Callback on error */
  onError?: (error: AudioCaptureError) => void;
}

/**
 * Default configuration
 */
const DEFAULT_CAPTURE_CONFIG = {
  audioConfig: {
    sampleRate: 16000,
    channels: 1,
    chunkSize: 1024,
    format: 'float32',
  },
};

/**
 * Audio Capture Handler
 *
 * Captures audio from microphone using Web Audio API.
 * Optimized for voice recognition with 16kHz sample rate.
 */
export class AudioCaptureHandler {
  private config: AudioCaptureConfig;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isCapturing = false;
  private chunkIndex = 0;

  // Callbacks
  private onChunkCallback?: (chunk: AudioChunk) => void;
  private onVolumeChangeCallback?: (level: number) => void;
  private onErrorCallback?: (error: AudioCaptureError) => void;

  constructor(config: AudioCaptureConfig = {}) {
    this.config = {
      ...DEFAULT_CAPTURE_CONFIG,
      ...config,
      audioConfig: { ...DEFAULT_CAPTURE_CONFIG.audioConfig, ...config.audioConfig },
    };

    this.onChunkCallback = config.onChunk;
    this.onVolumeChangeCallback = config.onVolumeChange;
    this.onErrorCallback = config.onError;
  }

  /**
   * Check if audio capture is supported
   */
  static isSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';
  }

  /**
   * Check if capturing
   */
  isActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Start audio capture
   */
  async start(): Promise<void> {
    if (this.isCapturing) {
      return; // Already capturing
    }

    if (!AudioCaptureHandler.isSupported()) {
      this.handleError('Web Audio API is not supported', 'NOT_SUPPORTED');
      return;
    }

    try {
      // Get user media with specific audio constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.audioConfig!.sampleRate!,
          channelCount: this.config.audioConfig!.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context
      const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: this.config.audioConfig!.sampleRate!,
      });

      // Create source from media stream
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create script processor for audio processing
      const bufferSize = this.config.audioConfig!.chunkSize! * 2; // Buffer size
      this.processor = this.audioContext.createScriptProcessor(
        bufferSize,
        this.config.audioConfig!.channels!,
        this.config.audioConfig!.channels!
      );

      // Set up audio processing callback
      this.processor.onaudioprocess = this.handleAudioProcess.bind(this);

      // Connect nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isCapturing = true;

    } catch (error) {
      this.handleError(
        (error as Error).message || 'Failed to start audio capture',
        'START_FAILED'
      );
    }
  }

  /**
   * Stop audio capture
   */
  stop(): void {
    if (!this.isCapturing) {
      return; // Not capturing
    }

    this.isCapturing = false;

    // Disconnect and cleanup
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      // Stop all tracks
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.chunkIndex = 0;
  }

  /**
   * Handle audio process event
   */
  private handleAudioProcess(event: AudioProcessingEvent): void {
    if (!this.isCapturing) {
      return;
    }

    const inputBuffer = event.inputBuffer;
    const inputData = inputBuffer.getChannelData(0); // Get mono channel

    // Calculate volume level for visualization
    const volume = this.calculateVolumeLevel(inputData);
    this.onVolumeChangeCallback?.(volume);

    // Create audio chunk
    const chunk: AudioChunk = {
      data: new Float32Array(inputData),
      timestamp: Date.now(),
      index: this.chunkIndex++,
    };

    this.onChunkCallback?.(chunk);
  }

  /**
   * Calculate volume level (RMS) for visualization
   */
  private calculateVolumeLevel(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);
    return Math.min(1, rms * 10); // Scale for better visualization
  }

  /**
   * Handle error
   */
  private handleError(message: string, code: string): void {
    const error = Object.assign(new Error(message), {
      name: 'AudioCaptureError',
      code,
    }) as AudioCaptureError;

    this.onErrorCallback?.(error);
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioConfig {
    return { ...DEFAULT_CAPTURE_CONFIG.audioConfig!, ...this.config.audioConfig };
  }
}

/**
 * Singleton instance (lazy-loaded)
 */
let audioCapture: AudioCaptureHandler | null = null;

export function getAudioCapture(config?: AudioCaptureConfig): AudioCaptureHandler {
  if (!audioCapture) {
    audioCapture = new AudioCaptureHandler(config);
  }
  return audioCapture;
}

export function resetAudioCapture(): void {
  if (audioCapture) {
    audioCapture.stop();
    audioCapture = null;
  }
}
