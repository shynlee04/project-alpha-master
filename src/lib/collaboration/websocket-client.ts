/**
 * WebSocket Client for Real-Time Collaboration
 * @module lib/collaboration/websocket-client
 *
 * Handles WebSocket connection with reconnection logic, exponential backoff,
 * and GDPR-compliant anonymized user IDs.
 *
 * @story S-025 - Real-Time Collaboration Indicators
 */

/**
 * WebSocket message types
 */
export type WebSocketMessageType =
  | 'presence:update'
  | 'cursor:update'
  | 'cursor:remove'
  | 'typing:start'
  | 'typing:stop'
  | 'user:join'
  | 'user:leave';

/**
 * Base WebSocket message
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  data: T;
  timestamp: number;
  userId: string; // Anonymized, GDPR-compliant
}

/**
 * Presence update data
 */
export interface PresenceData {
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId: string;
  filePath: string | null;
  status: 'online' | 'idle' | 'offline';
  lastActivity: number;
}

/**
 * Cursor position data
 */
export interface CursorData {
  userId: string;
  userName: string;
  filePath: string;
  position: {
    lineNumber: number;
    column: number;
  };
  selection?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
}

/**
 * Typing indicator data
 */
export interface TypingData {
  userId: string;
  userName: string;
  filePath: string;
}

/**
 * WebSocket client configuration
 */
export interface WebSocketClientConfig {
  url: string;
  projectId: string;
  userId: string; // Anonymized
  userName: string;
  userAvatar?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  connectionTimeout?: number;
}

/**
 * WebSocket client events
 */
export interface WebSocketClientEvents {
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
  onPresenceUpdate: (data: PresenceData) => void;
  onCursorUpdate: (data: CursorData) => void;
  onCursorRemove: (userId: string) => void;
  onTypingStart: (data: TypingData) => void;
  onTypingStop: (data: TypingData) => void;
  onUserJoin: (data: PresenceData) => void;
  onUserLeave: (userId: string) => void;
}

/**
 * WebSocket client implementation
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketClientConfig>;
  private events: Partial<WebSocketClientEvents>;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalClose = false;
  private pendingMessages: WebSocketMessage[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    config: WebSocketClientConfig,
    events: Partial<WebSocketClientEvents>
  ) {
    this.config = {
      reconnectInterval: 2000,
      maxReconnectAttempts: 10,
      connectionTimeout: 10000,
      ...config,
    };
    this.events = events;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('[WebSocketClient] Already connected');
      return;
    }

    try {
      const wsUrl = `${this.config.url}?projectId=${encodeURIComponent(this.config.projectId)}&userId=${encodeURIComponent(this.config.userId)}`;
      this.ws = new WebSocket(wsUrl);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          console.error('[WebSocketClient] Connection timeout');
          this.ws?.close();
          this.handleReconnect();
        }
      }, this.config.connectionTimeout);

      this.ws.onopen = () => {
        console.log('[WebSocketClient] Connected');
        this.clearConnectionTimeout();
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushPendingMessages();
        this.events.onConnected?.();
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocketClient] Disconnected:', event.code, event.reason);
        this.clearConnectionTimeout();
        this.stopHeartbeat();

        if (!this.isIntentionalClose) {
          this.handleReconnect();
        }

        this.events.onDisconnected?.();
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocketClient] Error:', error);
        const errorObj = new Error('WebSocket connection error');
        this.events.onError?.(errorObj);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    } catch (error) {
      console.error('[WebSocketClient] Failed to connect:', error);
      this.events.onError?.(error as Error);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionalClose = true;
    this.clearReconnectTimeout();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
  }

  /**
   * Send presence update
   */
  sendPresence(data: Omit<PresenceData, 'userId' | 'userName' | 'userAvatar'>): void {
    this.sendMessage<PresenceData>('presence:update', {
      ...data,
      userId: this.config.userId,
      userName: this.config.userName,
      userAvatar: this.config.userAvatar,
    });
  }

  /**
   * Send cursor position
   */
  sendCursor(data: Omit<CursorData, 'userId' | 'userName'>): void {
    this.sendMessage<CursorData>('cursor:update', {
      ...data,
      userId: this.config.userId,
      userName: this.config.userName,
    });
  }

  /**
   * Remove cursor (when leaving file)
   */
  removeCursor(filePath: string): void {
    this.sendMessage('cursor:remove', { filePath });
  }

  /**
   * Send typing indicator
   */
  sendTypingStart(filePath: string): void {
    this.sendMessage<TypingData>('typing:start', {
      userId: this.config.userId,
      userName: this.config.userName,
      filePath,
    });
  }

  /**
   * Stop typing indicator
   */
  sendTypingStop(filePath: string): void {
    this.sendMessage<TypingData>('typing:stop', {
      userId: this.config.userId,
      userName: this.config.userName,
      filePath,
    });
  }

  /**
   * Generic message sender
   */
  private sendMessage<T>(type: WebSocketMessageType, data: T): void {
    const message: WebSocketMessage<T> = {
      type,
      data,
      timestamp: Date.now(),
      userId: this.config.userId,
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocketClient] Not connected, queuing message:', type);
      this.pendingMessages.push(message as WebSocketMessage);
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as WebSocketMessage;

      // Ignore messages from self
      if (message.userId === this.config.userId) {
        return;
      }

      switch (message.type) {
        case 'presence:update':
          this.events.onPresenceUpdate?.(message.data as PresenceData);
          break;
        case 'cursor:update':
          this.events.onCursorUpdate?.(message.data as CursorData);
          break;
        case 'cursor:remove':
          this.events.onCursorRemove?.(message.data as string);
          break;
        case 'typing:start':
          this.events.onTypingStart?.(message.data as TypingData);
          break;
        case 'typing:stop':
          this.events.onTypingStop?.(message.data as TypingData);
          break;
        case 'user:join':
          this.events.onUserJoin?.(message.data as PresenceData);
          break;
        case 'user:leave':
          this.events.onUserLeave?.(message.data as string);
          break;
        default:
          console.warn('[WebSocketClient] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[WebSocketClient] Failed to parse message:', error);
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocketClient] Max reconnect attempts reached');
      this.events.onError?.(new Error('Failed to reconnect after max attempts'));
      return;
    }

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`[WebSocketClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Clear reconnection timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Flush pending messages after reconnection
   */
  private flushPendingMessages(): void {
    if (this.pendingMessages.length === 0) return;

    console.log(`[WebSocketClient] Flushing ${this.pendingMessages.length} pending messages`);

    for (const message of this.pendingMessages) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }

    this.pendingMessages = [];
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

/**
 * Factory function to create WebSocket client
 */
export function createWebSocketClient(
  config: WebSocketClientConfig,
  events: Partial<WebSocketClientEvents>
): WebSocketClient {
  return new WebSocketClient(config, events);
}
