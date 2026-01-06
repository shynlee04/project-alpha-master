/**
 * Notification Manager
 *
 * Central singleton for managing notifications across the platform.
 * Integrates with browser Notification API for native notifications,
 * handles sound playback, vibration (mobile), and toast display.
 *
 * @module notifications/notification-manager
 * @story S-033 - Notification System with Toast/Badge
 */

import type {
  Notification,
  NotificationManagerConfig,
  NotificationAction,
  NotificationType,
} from './types';
import { useNotificationStore } from '@/infrastructure/persistence/stores/notification-store';

/**
 * Notification Manager Singleton
 */
class NotificationManagerClass {
  private config: NotificationManagerConfig;
  private activeToasts: Map<string, NodeJS.Timeout> = new Map();
  private audio: HTMLAudioElement | null = null;

  constructor() {
    this.config = {
      defaultDuration: 5000,
      maxVisibleToasts: 5,
      maxHistorySize: 100,
      nativeEnabled: false,
      soundEnabled: false,
      vibrationPattern: [200, 100, 200],
    };

    // Initialize audio element
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.volume = 0.3;
    }
  }

  /**
   * Configure notification manager
   */
  configure(config: Partial<NotificationManagerConfig>): void {
    this.config = { ...this.config, ...config };

    // Update audio if sound URL changed
    if (config.soundUrl && this.audio) {
      this.audio.src = config.soundUrl;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationManagerConfig {
    return { ...this.config };
  }

  /**
   * Show a notification
   */
  show(notification: Omit<Notification, 'id' | 'createdAt'>): string {
    const store = useNotificationStore.getState();
    const id = store.addNotification(notification);

    // Auto-dismiss toast after duration
    if (notification.duration > 0) {
      const timeout = setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);

      this.activeToasts.set(id, timeout);
    }

    // Show native browser notification if enabled and permission granted
    const shouldShowNative =
      notification.showNative &&
      store.nativeEnabled &&
      store.permission === 'granted';

    if (shouldShowNative && typeof window !== 'undefined' && 'Notification' in window) {
      this.showNativeNotification(id, notification);
    }

    // Play sound if enabled and requested
    if (notification.sound && store.soundEnabled) {
      this.playSound();
    }

    // Vibrate if enabled and supported
    if (notification.vibrate && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      this.vibrate();
    }

    return id;
  }

  /**
   * Convenience method: Show success notification
   */
  success(
    title: string,
    message: string,
    options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>
  ): string {
    return this.show({
      type: 'success',
      title,
      message,
      priority: 'normal',
      read: false,
      persistent: false,
      duration: this.config.defaultDuration,
      ...options,
    });
  }

  /**
   * Convenience method: Show error notification
   */
  error(
    title: string,
    message: string,
    options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>
  ): string {
    return this.show({
      type: 'error',
      title,
      message,
      priority: 'high',
      read: false,
      persistent: true,
      duration: this.config.defaultDuration,
      ...options,
    });
  }

  /**
   * Convenience method: Show warning notification
   */
  warning(
    title: string,
    message: string,
    options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>
  ): string {
    return this.show({
      type: 'warning',
      title,
      message,
      priority: 'normal',
      read: false,
      persistent: false,
      duration: this.config.defaultDuration,
      ...options,
    });
  }

  /**
   * Convenience method: Show info notification
   */
  info(
    title: string,
    message: string,
    options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>
  ): string {
    return this.show({
      type: 'info',
      title,
      message,
      priority: 'low',
      read: false,
      persistent: false,
      duration: this.config.defaultDuration,
      ...options,
    });
  }

  /**
   * Dismiss a notification
   */
  dismiss(id: string): void {
    const store = useNotificationStore.getState();

    // Clear auto-dismiss timeout
    const timeout = this.activeToasts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.activeToasts.delete(id);
    }

    // Remove from store
    store.removeNotification(id);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    const store = useNotificationStore.getState();

    // Clear all timeouts
    this.activeToasts.forEach((timeout) => clearTimeout(timeout));
    this.activeToasts.clear();

    // Clear store
    store.clearAll();
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const store = useNotificationStore.getState();
    store.markAsRead(id);
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    const store = useNotificationStore.getState();
    store.markAllAsRead();
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    const store = useNotificationStore.getState();
    return store.getUnreadCount();
  }

  /**
   * Show native browser notification
   */
  private showNativeNotification(id: string, notification: Omit<Notification, 'id' | 'createdAt'>): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    try {
      const native = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.groupKey || id,
        requireInteraction: notification.priority === 'urgent',
      });

      // Handle click
      native.onclick = () => {
        window.focus();
        native.close();

        // Navigate if link provided
        if (notification.link) {
          window.location.href = notification.link;
        }

        // Mark as read
        this.markAsRead(id);
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        native.close();
      }, 5000);
    } catch (error) {
      console.error('[NotificationManager] Failed to show native notification:', error);
    }
  }

  /**
   * Play notification sound
   */
  private playSound(): void {
    if (!this.audio || !this.config.soundUrl) {
      return;
    }

    try {
      this.audio.currentTime = 0;
      this.audio.play().catch((error) => {
        console.warn('[NotificationManager] Failed to play sound:', error);
      });
    } catch (error) {
      console.error('[NotificationManager] Sound playback error:', error);
    }
  }

  /**
   * Vibrate device (mobile)
   */
  private vibrate(): void {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    try {
      navigator.vibrate(this.config.vibrationPattern);
    } catch (error) {
      console.warn('[NotificationManager] Vibration failed:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    const store = useNotificationStore.getState();
    return await store.requestPermission();
  }

  /**
   * Set sound enabled
   */
  setSoundEnabled(enabled: boolean): void {
    const store = useNotificationStore.getState();
    store.setSoundEnabled(enabled);
  }

  /**
   * Set native notifications enabled
   */
  setNativeEnabled(enabled: boolean): void {
    const store = useNotificationStore.getState();
    store.setNativeEnabled(enabled);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    const store = useNotificationStore.getState();
    store.clearAll();
  }

  /**
   * Clear notifications by type
   */
  clearByType(type: NotificationType): void {
    const store = useNotificationStore.getState();
    store.clearByType(type);
  }
}

/**
 * Export singleton instance
 */
export const NotificationManager = new NotificationManagerClass();

/**
 * Export hook for convenient access
 */
export function useNotificationManager() {
  return {
    show: (notification: Omit<Notification, 'id' | 'createdAt'>) => NotificationManager.show(notification),
    success: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) =>
      NotificationManager.success(title, message, options),
    error: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) =>
      NotificationManager.error(title, message, options),
    warning: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) =>
      NotificationManager.warning(title, message, options),
    info: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'createdAt' | 'type' | 'title' | 'message'>>) =>
      NotificationManager.info(title, message, options),
    dismiss: (id: string) => NotificationManager.dismiss(id),
    dismissAll: () => NotificationManager.dismissAll(),
    markAsRead: (id: string) => NotificationManager.markAsRead(id),
    markAllAsRead: () => NotificationManager.markAllAsRead(),
    getUnreadCount: () => NotificationManager.getUnreadCount(),
    requestPermission: () => NotificationManager.requestPermission(),
    setSoundEnabled: (enabled: boolean) => NotificationManager.setSoundEnabled(enabled),
    setNativeEnabled: (enabled: boolean) => NotificationManager.setNativeEnabled(enabled),
    clearAll: () => NotificationManager.clearAll(),
    clearByType: (type: NotificationType) => NotificationManager.clearByType(type),
    configure: (config: Partial<NotificationManagerConfig>) => NotificationManager.configure(config),
  };
}
