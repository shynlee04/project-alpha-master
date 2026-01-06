/**
 * Collaboration Presence Hook
 * @module hooks/useCollaborationPresence
 *
 * React hook for real-time collaboration features.
 * Manages WebSocket connection, presence tracking, and cursor updates.
 * Provides typing indicators and user lists.
 *
 * @story S-025 - Real-Time Collaboration Indicators
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type {
  WebSocketClient,
  WebSocketClientConfig,
  PresenceData,
  CursorData,
  TypingData,
} from '@/lib/collaboration/websocket-client';
import { createWebSocketClient } from '@/lib/collaboration/websocket-client';
import {
  createPresenceManager,
  type UserPresence,
} from '@/lib/collaboration/presence-manager';
import {
  createCursorTracker,
  type RemoteCursor,
} from '@/lib/collaboration/cursor-tracker';

/**
 * Hook configuration
 */
export interface UseCollaborationPresenceConfig {
  /** WebSocket server URL */
  wsUrl: string;
  /** Current project ID */
  projectId: string;
  /** Current user ID (anonymized, GDPR-compliant) */
  userId: string;
  /** Current user name */
  userName: string;
  /** Current user avatar (optional) */
  userAvatar?: string;
  /** Whether connection is enabled */
  enabled?: boolean;
}

/**
 * Hook return value
 */
export interface UseCollaborationPresenceReturn {
  /** Users in current file */
  currentFileUsers: UserPresence[];
  /** All online users */
  onlineUsers: UserPresence[];
  /** Remote cursors for current file */
  remoteCursors: RemoteCursor[];
  /** Users typing in current file */
  typingUsers: string[];
  /** Connection status */
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  /** Update current file */
  setCurrentFile: (filePath: string | null) => void;
  /** Send cursor position */
  sendCursor: (filePath: string, lineNumber: number, column: number) => void;
  /** Send typing indicator */
  sendTypingStart: (filePath: string) => void;
  /** Send typing stop */
  sendTypingStop: (filePath: string) => void;
}

/**
 * Collaboration presence hook
 */
export function useCollaborationPresence(
  config: UseCollaborationPresenceConfig
): UseCollaborationPresenceReturn {
  const {
    wsUrl,
    projectId,
    userId,
    userName,
    userAvatar,
    enabled = true,
  } = config;

  // State
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [currentFileUsers, setCurrentFileUsers] = useState<UserPresence[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Refs
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const presenceManagerRef = useRef<ReturnType<typeof createPresenceManager> | null>(null);
  const cursorTrackerRef = useRef<ReturnType<typeof createCursorTracker> | null>(null);
  const currentFilePathRef = useRef<string | null>(null);

  // Initialize managers
  useEffect(() => {
    if (!enabled) return;

    // Create presence manager
    presenceManagerRef.current = createPresenceManager(
      userId,
      { projectId },
      {
        onPresenceChange: (users) => {
          setOnlineUsers(users);
          // Update current file users
          if (currentFilePathRef.current) {
            setCurrentFileUsers(
              users.filter(u => u.filePath === currentFilePathRef.current)
            );
          }
        },
        onTypingChange: (filePath, users) => {
          if (filePath === currentFilePathRef.current) {
            setTypingUsers(users);
          }
        },
      }
    );

    // Create cursor tracker
    cursorTrackerRef.current = createCursorTracker(
      {},
      {
        onCursorUpdate: (cursors) => {
          setRemoteCursors(Array.from(cursors.values()));
        },
      }
    );

    return () => {
      presenceManagerRef.current?.destroy();
      cursorTrackerRef.current?.destroy();
    };
  }, [enabled, userId, projectId]);

  // Initialize WebSocket client
  useEffect(() => {
    if (!enabled) return;

    setConnectionStatus('connecting');

    const client = createWebSocketClient(
      {
        url: wsUrl,
        projectId,
        userId,
        userName,
        userAvatar,
      },
      {
        onConnected: () => {
          console.log('[useCollaborationPresence] Connected');
          setConnectionStatus('connected');

          // Send initial presence
          client.sendPresence({
            projectId,
            filePath: currentFilePathRef.current,
            status: 'online',
            lastActivity: Date.now(),
          });
        },
        onDisconnected: () => {
          console.log('[useCollaborationPresence] Disconnected');
          setConnectionStatus('disconnected');
        },
        onError: (error) => {
          console.error('[useCollaborationPresence] Error:', error);
          setConnectionStatus('error');
        },
        onPresenceUpdate: (data) => {
          presenceManagerRef.current?.updatePresence(data);
        },
        onCursorUpdate: (data) => {
          cursorTrackerRef.current?.updateCursor(data);
        },
        onCursorRemove: (userId) => {
          cursorTrackerRef.current?.removeCursor(userId);
        },
        onTypingStart: (data) => {
          presenceManagerRef.current?.handleTyping(data, true);
        },
        onTypingStop: (data) => {
          presenceManagerRef.current?.handleTyping(data, false);
        },
        onUserJoin: (data) => {
          presenceManagerRef.current?.updatePresence(data);
        },
        onUserLeave: (userId) => {
          presenceManagerRef.current?.removeUser(userId);
        },
      }
    );

    wsClientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      wsClientRef.current = null;
    };
  }, [enabled, wsUrl, projectId, userId, userName, userAvatar]);

  // Set current file
  const setCurrentFile = useCallback((filePath: string | null) => {
    currentFilePathRef.current = filePath;

    // Update presence manager
    cursorTrackerRef.current?.setCurrentFile(filePath);

    // Send presence update
    if (wsClientRef.current?.isConnected()) {
      wsClientRef.current.sendPresence({
        projectId,
        filePath,
        status: 'online',
        lastActivity: Date.now(),
      });
    }

    // Update current file users
    if (presenceManagerRef.current) {
      setCurrentFileUsers(presenceManagerRef.current.getUsersInFile(filePath || ''));
    }
  }, [projectId]);

  // Send cursor position
  const sendCursor = useCallback(
    (filePath: string, lineNumber: number, column: number) => {
      if (!wsClientRef.current?.isConnected()) return;

      wsClientRef.current.sendCursor({
        filePath,
        position: { lineNumber, column },
      });
    },
    []
  );

  // Send typing start
  const sendTypingStart = useCallback((filePath: string) => {
    if (!wsClientRef.current?.isConnected()) return;
    wsClientRef.current.sendTypingStart(filePath);
  }, []);

  // Send typing stop
  const sendTypingStop = useCallback((filePath: string) => {
    if (!wsClientRef.current?.isConnected()) return;
    wsClientRef.current.sendTypingStop(filePath);
  }, []);

  return {
    currentFileUsers,
    onlineUsers,
    remoteCursors,
    typingUsers,
    connectionStatus,
    setCurrentFile,
    sendCursor,
    sendTypingStart,
    sendTypingStop,
  };
}

export default useCollaborationPresence;
