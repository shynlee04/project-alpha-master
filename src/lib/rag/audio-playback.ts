/**
 * @fileoverview Audio Playback Handler
 * @module lib/rag/audio-playback
 * @governance EPIC-10-1
 *
 * Audio playback with jitter buffer for smooth streaming.
 * Handles network variability and audio underruns.
 */

import type {
  AudioChunk,
  AudioConfig,
  AudioPlaybackError,
  JitterBufferConfig,
  DEFAULT_JITTER_CONFIG,
} from './live-api-types';

/**
 * Audio playback handler configuration
 */
interface AudioPlaybackConfig {
  /** Audio configuration */
  audioConfig?: Partial<AudioConfig>;
  /** Jitter buffer configuration */
  jitterConfig?: Partial<JitterBufferConfig>;
  /** Callback when playback starts */
  onStart?: () => void;
  /** Callback when playback stops */
  onStop?: () => void;
  /** Callback when buffer underrun occurs */
  onUnderrun?: () => void;
  /** Callback on error */
  onError?: (error: AudioPlaybackError) => void;
}

/**
 * Default configuration
 */
const DEFAULT_PLAYBACK_CONFIG = {
  audioConfig: {
    sampleRate: 16000,
    channels: 1,
    chunkSize: 1024,
    format: 'float32',
  },
  jitterConfig: {
    minChunks: 2,
    maxChunks: 8,
    targetChunks: 4,
    adaptive: true,
  },
};

/**
 * Audio Playback Handler
 *
 * Plays audio chunks with jitter buffer for smooth playback.
 * Handles network variability and adaptive buffering.
 */
export class AudioPlaybackHandler {
  private config: AudioPlaybackConfig;
  private audioContext: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private jitterBuffer: AudioChunk[] = [];
  private playbackScheduled = false;
  private underrunCount = 0;

  // Callbacks
  private onStartCallback?: () => void;
  private onStopCallback?: () => void;
  private onUnderrunCallback?: () => void;
  private onErrorCallback?: (error: AudioPlaybackError) => void;

  constructor(config: AudioPlaybackConfig = {}) {
    this.config = {
      ...DEFAULT_PLAYBACK_CONFIG,
      ...config,
      audioConfig: { ...DEFAULT_PLAYBACK_CONFIG.audioConfig, ...config.audioConfig },
      jitterConfig: { ...DEFAULT_PLAYBACK_CONFIG.jitterConfig, ...config.jitterConfig },
    };

    this.onStartCallback = config.onStart;
    this.onStopCallback = config.onStop;
    this.onUnderrunCallback = config.onUnderrun;
    this.onErrorCallback = config.onError;
  }

  /**
   * Check if audio playback is supported
   */
  static isSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';
  }

  /**
   * Check if currently playing
   */
  isActive(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.jitterBuffer.length;
  }

  /**
   * Get buffer duration in ms
   */
  getBufferDuration(): number {
    const chunkDuration = (this.config.audioConfig!.chunkSize! /
      this.config.audioConfig!.sampleRate!) * 1000;
    return this.jitterBuffer.length * chunkDuration;
  }

  /**
   * Initialize audio context (must be called after user gesture)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) {
      return; // Already initialized
    }

    if (!AudioPlaybackHandler.isSupported()) {
      this.handleError('Web Audio API is not supported', 'NOT_SUPPORTED');
      return;
    }

    try {
      const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: this.config.audioConfig!.sampleRate!,
      });

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;
      this.gainNode.connect(this.audioContext.destination);

    } catch (error) {
      this.handleError(
        (error as Error).message || 'Failed to initialize audio context',
        'INIT_FAILED'
      );
    }
  }

  /**
   * Add audio chunk to buffer
   */
  addChunk(chunk: AudioChunk): void {
    // Check if buffer is full
    const maxChunks = this.config.jitterConfig!.maxChunks!;
    if (this.jitterBuffer.length >= maxChunks) {
      // Drop oldest chunk
      this.jitterBuffer.shift();
    }

    this.jitterBuffer.push(chunk);

    // Start playback if buffer is ready
    if (!this.isPlaying && !this.playbackScheduled) {
      const targetChunks = this.config.jitterConfig!.targetChunks!;
      if (this.jitterBuffer.length >= targetChunks) {
        this.startPlayback();
      }
    }

    // Schedule more chunks if playing
    if (this.isPlaying) {
      this.scheduleChunks();
    }
  }

  /**
   * Start playback
   */
  private startPlayback(): void {
    if (!this.audioContext || this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.playbackScheduled = true;
    this.underrunCount = 0;

    this.scheduleChunks();

    this.onStartCallback?.();
  }

  /**
   * Schedule audio chunks for playback
   */
  private scheduleChunks(): void {
    if (!this.audioContext || !this.isPlaying) {
      return;
    }

    const minChunks = this.config.jitterConfig!.minChunks!;
    // const targetChunks = this.config.jitterConfig!.targetChunks!;

    // Schedule chunks while buffer has enough data
    while (this.jitterBuffer.length >= minChunks) {
      const chunk = this.jitterBuffer.shift();
      if (!chunk) break;

      this.scheduleChunk(chunk);
    }

    // Check for buffer underrun
    if (this.jitterBuffer.length < minChunks) {
      this.handleUnderrun();
    }
  }

  /**
   * Schedule single chunk for playback
   */
  private scheduleChunk(chunk: AudioChunk): void {
    if (!this.audioContext || !this.gainNode) {
      return;
    }

    try {
      // Create audio buffer
      const audioBuffer = this.audioContext.createBuffer(
        this.config.audioConfig!.channels!,
        chunk.data.length,
        this.config.audioConfig!.sampleRate!
      );

      // Copy data to buffer
      audioBuffer.getChannelData(0).set(chunk.data);

      // Create source and schedule playback
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      // Calculate when to play this chunk
      const currentTime = this.audioContext.currentTime;
      source.start(currentTime);

      // Auto-schedule next chunks when this chunk ends
      source.onended = () => {
        // Schedule more chunks if available
        if (this.isPlaying) {
          this.scheduleChunks();
        }

        // Check if playback should stop
        if (this.jitterBuffer.length === 0 && this.isPlaying) {
          this.stopPlayback();
        }
      };

    } catch (error) {
      this.handleError(
        (error as Error).message || 'Failed to schedule audio chunk',
        'SCHEDULE_FAILED'
      );
    }
  }

  /**
   * Handle buffer underrun
   */
  private handleUnderrun(): void {
    this.underrunCount++;
    this.onUnderrunCallback?.();

    // Adaptive buffer: increase target if frequent underruns
    if (this.config.jitterConfig!.adaptive! && this.underrunCount > 3) {
      const newTarget = Math.min(
        this.config.jitterConfig!.targetChunks! + 1,
        this.config.jitterConfig!.maxChunks!
      );
      (this.config.jitterConfig as any).targetChunks = newTarget;
      this.underrunCount = 0; // Reset counter
    }

    // Stop playback if buffer is empty
    if (this.jitterBuffer.length === 0) {
      this.stopPlayback();
    }
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    if (!this.isPlaying) {
      return; // Not playing
    }

    this.isPlaying = false;
    this.playbackScheduled = false;

    // Stop current source
    if (this.source) {
      try {
        this.source.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.source.disconnect();
      this.source = null;
    }

    // Clear buffer
    this.jitterBuffer = [];

    this.onStopCallback?.();
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.jitterBuffer = [];
    this.underrunCount = 0;
  }

  /**
   * Handle error
   */
  private handleError(message: string, code: string): void {
    const error = Object.assign(new Error(message), {
      name: 'AudioPlaybackError',
      code,
    }) as AudioPlaybackError;

    this.onErrorCallback?.(error);
  }

  /**
   * Get current configuration
   */
  getConfig(): { audioConfig: AudioConfig; jitterConfig: JitterBufferConfig } {
    return {
      audioConfig: { ...DEFAULT_PLAYBACK_CONFIG.audioConfig!, ...this.config.audioConfig },
      jitterConfig: { ...DEFAULT_PLAYBACK_CONFIG.jitterConfig!, ...this.config.jitterConfig },
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopPlayback();

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Singleton instance (lazy-loaded)
 */
let audioPlayback: AudioPlaybackHandler | null = null;

export function getAudioPlayback(config?: AudioPlaybackConfig): AudioPlaybackHandler {
  if (!audioPlayback) {
    audioPlayback = new AudioPlaybackHandler(config);
  }
  return audioPlayback;
}

export function resetAudioPlayback(): void {
  if (audioPlayback) {
    audioPlayback.dispose();
    audioPlayback = null;
  }
}
