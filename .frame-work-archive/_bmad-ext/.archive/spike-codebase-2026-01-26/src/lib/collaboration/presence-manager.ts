/**
 * Presence Manager for Real-Time Collaboration
 * @module lib/collaboration/presence-manager
 *
 * Manages user presence state across files and projects.
 * Provides privacy filtering (only same-project users visible).
 * Handles user status transitions and idle detection.
 *
 * @story S-025 - Real-Time Collaboration Indicators
 */

import type { PresenceData, TypingData } from './websocket-client';

/**
 * User presence with file context
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  filePath: string | null;
  status: 'online' | 'idle' | 'offline';
  lastActivity: number;
  isTyping?: boolean;
}

/**
 * Presence manager configuration
 */
export interface PresenceManagerConfig {
  projectId: string;
  idleTimeout?: number; // milliseconds before user marked idle
}

/**
 * Presence manager events
 */
export interface PresenceManagerEvents {
  onPresenceChange: (users: UserPresence[]) => void;
  onTypingChange: (filePath: string, typingUsers: string[]) => void;
}

/**
 * Presence manager implementation
 */
export class PresenceManager {
  private config: Required<PresenceManagerConfig>;
  private events: PresenceManagerEvents;
  private users = new Map<string, UserPresence>();
  private typingUsers = new Map<string, Set<string>>(); // filePath -> userIds
  private idleTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private currentUserId: string;

  constructor(
    currentUserId: string,
    config: PresenceManagerConfig,
    events: PresenceManagerEvents
  ) {
    this.currentUserId = currentUserId;
    this.config = {
      idleTimeout: 300000, // 5 minutes
      ...config,
    };
    this.events = events;
  }

  /**
   * Update user presence
   */
  updatePresence(data: PresenceData): void {
    // Privacy: Only track users in same project
    if (data.projectId !== this.config.projectId) {
      return;
    }

    const existing = this.users.get(data.userId);

    const updated: UserPresence = {
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      filePath: data.filePath,
      status: data.status,
      lastActivity: data.lastActivity,
      isTyping: existing?.isTyping || false,
    };

    this.users.set(data.userId, updated);

    // Reset idle timer for this user
    this.resetIdleTimer(data.userId);

    // Notify listeners
    this.notifyPresenceChange();
  }

  /**
   * Remove user (left project)
   */
  removeUser(userId: string): void {
    this.users.delete(userId);
    this.clearIdleTimer(userId);

    // Remove from typing users
    for (const [filePath, users] of this.typingUsers.entries()) {
      users.delete(userId);
      if (users.size === 0) {
        this.typingUsers.delete(filePath);
      }
    }

    this.notifyPresenceChange();
    this.notifyTypingChange();
  }

  /**
   * Handle typing indicator
   */
  handleTyping(data: TypingData, isTyping: boolean): void {
    const user = this.users.get(data.userId);
    if (!user) return;

    // Update user typing state
    user.isTyping = isTyping;
    this.users.set(data.userId, user);

    // Update file-specific typing users
    let typingSet = this.typingUsers.get(data.filePath);
    if (!typingSet) {
      typingSet = new Set();
      this.typingUsers.set(data.filePath, typingSet);
    }

    if (isTyping) {
      typingSet.add(data.userId);
    } else {
      typingSet.delete(data.userId);
    }

    // Auto-clear typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        this.handleTyping(data, false);
      }, 3000);
    }

    this.notifyTypingChange();
  }

  /**
   * Get users in a specific file
   */
  getUsersInFile(filePath: string): UserPresence[] {
    return Array.from(this.users.values()).filter(
      user => user.filePath === filePath && user.userId !== this.currentUserId
    );
  }

  /**
   * Get users typing in a specific file
   */
  getTypingUsers(filePath: string): string[] {
    return Array.from(this.typingUsers.get(filePath) || []);
  }

  /**
   * Get all online users (excluding current user)
   */
  getOnlineUsers(): UserPresence[] {
    return Array.from(this.users.values()).filter(
      user => user.status !== 'offline' && user.userId !== this.currentUserId
    );
  }

  /**
   * Get all users
   */
  getAllUsers(): UserPresence[] {
    return Array.from(this.users.values()).filter(
      user => user.userId !== this.currentUserId
    );
  }

  /**
   * Mark user as idle
   */
  markUserIdle(userId: string): void {
    const user = this.users.get(userId);
    if (user && user.status !== 'idle') {
      user.status = 'idle';
      this.users.set(userId, user);
      this.notifyPresenceChange();
    }
  }

  /**
   * Reset idle timer for user
   */
  private resetIdleTimer(userId: string): void {
    this.clearIdleTimer(userId);

    this.idleTimers.set(
      userId,
      setTimeout(() => {
        this.markUserIdle(userId);
      }, this.config.idleTimeout)
    );
  }

  /**
   * Clear idle timer for user
   */
  private clearIdleTimer(userId: string): void {
    const timer = this.idleTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(userId);
    }
  }

  /**
   * Notify presence change listeners
   */
  private notifyPresenceChange(): void {
    this.events.onPresenceChange(this.getAllUsers());
  }

  /**
   * Notify typing change listeners
   */
  private notifyTypingChange(): void {
    // Notify for each file with typing users
    for (const filePath of this.typingUsers.keys()) {
      const typingUsers = this.getTypingUsers(filePath);
      this.events.onTypingChange(filePath, typingUsers);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    for (const timer of this.idleTimers.values()) {
      clearTimeout(timer);
    }
    this.idleTimers.clear();
    this.users.clear();
    this.typingUsers.clear();
  }
}

/**
 * Factory function to create presence manager
 */
export function createPresenceManager(
  currentUserId: string,
  config: PresenceManagerConfig,
  events: PresenceManagerEvents
): PresenceManager {
  return new PresenceManager(currentUserId, config, events);
}
