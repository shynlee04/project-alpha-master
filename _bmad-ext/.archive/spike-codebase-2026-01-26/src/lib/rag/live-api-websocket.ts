/**
 * @fileoverview Live API WebSocket Manager
 * @module lib/rag/live-api-websocket
 * @governance EPIC-10-1
 *
 * WebSocket connection manager for Gemini Live API.
 * Handles bidirectional audio streaming with retry logic.
 */

import type {
  AudioChunk,
  ClientContent,
  ConnectionState,
  RetryConfig,
  ServerContent,
  WebSocketError,
} from './live-api-types';

/**
 * WebSocket manager configuration
 */
interface WebSocketManagerConfig {
  /** Gemini API key */
  apiKey: string;
  /** Model to use for live audio */
  model?: string;
  /** Retry configuration */
  retryConfig?: Partial<RetryConfig>;
  /** Connection timeout in ms */
  connectionTimeout?: number;
  /** Message handler for server content */
  onMessage?: (message: ServerContent) => void;
  /** State change handler */
  onStateChange?: (state: ConnectionState) => void;
  /** Error handler */
  onError?: (error: WebSocketError) => void;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  model: 'gemini-2.5-flash-native-audio-preview-12-2025',
  connectionTimeout: 10000, // 10s
  retryConfig: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 4000,
    backoffFactor: 2,
  },
};

/**
 * WebSocket URL for Gemini Live API
 */
const getWebSocketUrl = (apiKey: string): string => {
  return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
};

/**
 * Live API WebSocket Manager
 *
 * Manages WebSocket connection to Gemini Live API for real-time audio streaming.
 */
export class LiveApiWebSocketManager {
  private config: Required<Omit<WebSocketManagerConfig, 'onMessage' | 'onStateChange' | 'onError'>>;
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState;
  private retryCount = 0;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: ClientContent[] = [];
  private isIntentionalClose = false;

  // Callbacks
  private onMessageCallback?: (message: ServerContent) => void;
  private onStateChangeCallback?: (state: ConnectionState) => void;
  private onErrorCallback?: (error: WebSocketError) => void;

  constructor(config: WebSocketManagerConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      retryConfig: { ...DEFAULT_CONFIG.retryConfig, ...config.retryConfig },
    };

    this.connectionState = {
      state: 'disconnected',
      retryCount: 0,
    };

    this.onMessageCallback = config.onMessage;
    this.onStateChangeCallback = config.onStateChange;
    this.onErrorCallback = config.onError;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionState.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected()) {
      return; // Already connected
    }

    if (this.connectionState.state === 'connecting') {
      return; // Already connecting
    }

    this.isIntentionalClose = false;
    this.updateState({ state: 'connecting', retryCount: this.retryCount });

    try {
      const wsUrl = getWebSocketUrl(this.config.apiKey);
      this.ws = new WebSocket(wsUrl);

      // Set up connection timeout
      this.connectionTimer = setTimeout(() => {
        if (this.connectionState.state === 'connecting') {
          this.ws?.close();
          this.handleConnectionError(new Error('Connection timeout'), 'TIMEOUT');
        }
      }, this.config.connectionTimeout);

      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

    } catch (error) {
      this.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        'CONNECTION_FAILED'
      );
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isIntentionalClose = true;

    // Clear timers
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }

    // Clear message queue
    this.messageQueue = [];
    this.retryCount = 0;

    this.updateState({
      state: 'disconnected',
      retryCount: 0,
    });
  }

  /**
   * Send message to server
   */
  send(message: ClientContent): void {
    if (!this.isConnected()) {
      // Queue message for later
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      this.onErrorCallback?.(
        Object.assign(new Error('Failed to send message'), {
          name: 'WebSocketError',
          code: 'SEND_FAILED',
          retryable: true,
        }) as WebSocketError
      );
    }
  }

  /**
   * Send audio chunk to server
   */
  sendAudioChunk(chunk: AudioChunk): void {
    const message: ClientContent = {
      clientContent: {
        parts: [
          {
            inline_data: {
              mime_type: 'audio/raw', // Raw audio data
              data: this.arrayBufferToBase64(chunk.data.buffer),
            },
          },
        ],
      },
    };

    this.send(message);
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    // Clear connection timeout
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    this.updateState({
      state: 'connected',
      retryCount: this.retryCount,
      connectedAt: Date.now(),
    });

    // Reset retry count on successful connection
    this.retryCount = 0;

    // Send queued messages
    this.flushMessageQueue();
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: ServerContent = JSON.parse(event.data);

      if (message.serverContent) {
        this.onMessageCallback?.(message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    // Clear connection timeout
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    // If intentional close, don't retry
    if (this.isIntentionalClose) {
      this.updateState({
        state: 'disconnected',
        retryCount: 0,
      });
      return;
    }

    // Connection lost, attempt retry
    this.handleConnectionError(
      new Error(event.reason || 'Connection closed'),
      'DISCONNECTED',
      event.code !== 1000 // Don't retry if clean close
    );
  }

  /**
   * Handle connection error with retry logic
   */
  private handleConnectionError(error: Error, code: string, retryable = true): void {
    const wsError = Object.assign(new Error(error.message), {
      name: 'WebSocketError',
      code,
      retryable,
    }) as WebSocketError;

    this.onErrorCallback?.(wsError);

    // Retry logic
    if (retryable && this.retryCount < this.config.retryConfig!.maxAttempts!) {
      this.retryCount++;
      const delay = Math.min(
        this.config.retryConfig!.initialDelay! *
          Math.pow(this.config.retryConfig!.backoffFactor!, this.retryCount - 1),
        this.config.retryConfig!.maxDelay!
      );

      this.updateState({
        state: 'connecting',
        retryCount: this.retryCount,
        lastError: error.message,
      });

      this.retryTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      // Max retries reached or not retryable
      this.updateState({
        state: 'error',
        retryCount: this.retryCount,
        lastError: error.message,
      });
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Update connection state and notify callback
   */
  private updateState(state: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...state };
    this.onStateChangeCallback?.(this.connectionState);
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBufferLike): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Singleton instance (lazy-loaded)
 */
let webSocketManager: LiveApiWebSocketManager | null = null;

export function getWebSocketManager(config: WebSocketManagerConfig): LiveApiWebSocketManager {
  if (!webSocketManager) {
    webSocketManager = new LiveApiWebSocketManager(config);
  }
  return webSocketManager;
}

export function resetWebSocketManager(): void {
  if (webSocketManager) {
    webSocketManager.disconnect();
    webSocketManager = null;
  }
}
