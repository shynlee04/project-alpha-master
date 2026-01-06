/**
 * Notification Store
 *
 * Zustand store for managing notification state, history, and preferences.
 * Follows December 2025 Zustand patterns with individual selectors.
 *
 * @module stores/notification-store
 * @story S-033 - Notification System with Toast/Badge
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Notification,
  NotificationStoreState,
  NotificationStoreActions,
  NotificationFilter,
  NotificationType,
  NotificationPriority,
} from '@/lib/notifications/types';

/**
 * Generate unique notification ID
 */
function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Notification Store State & Actions
 */
type NotificationState = NotificationStoreState & NotificationStoreActions;

/**
 * Default notification configuration
 */
const DEFAULT_CONFIG = {
  maxHistorySize: 100,
  soundEnabled: false,
  nativeEnabled: false,
};

/**
 * Create notification store
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // STATE
      // ========================================================================

      notifications: [],
      maxHistorySize: DEFAULT_CONFIG.maxHistorySize,
      permission: 'default' as NotificationPermission,
      soundEnabled: DEFAULT_CONFIG.soundEnabled,
      nativeEnabled: DEFAULT_CONFIG.nativeEnabled,

      // ========================================================================
      // ACTIONS
      // ========================================================================

      /**
       * Add a new notification
       */
      addNotification: (notificationData) => {
        const id = generateId();
        const notification: Notification = {
          ...notificationData,
          id,
          createdAt: Date.now(),
          read: false,
          persistent: notificationData.persistent ?? false,
          duration: notificationData.duration ?? 5000,
        };

        set((state) => {
          const updated = [...state.notifications];

          // Group similar notifications if groupKey provided
          if (notification.groupKey) {
            const existingIndex = updated.findIndex(
              (n) => n.groupKey === notification.groupKey && !n.read
            );

            if (existingIndex !== -1) {
              // Update existing grouped notification
              updated[existingIndex] = {
                ...updated[existingIndex],
                groupCount: (updated[existingIndex].groupCount || 1) + 1,
                createdAt: Date.now(),
                message: notification.message,
              };
              return { notifications: updated };
            }
          }

          // Add new notification
          updated.unshift(notification);

          // Trim history if exceeds max size
          if (updated.length > state.maxHistorySize) {
            updated.splice(state.maxHistorySize);
          }

          return { notifications: updated };
        });

        return id;
      },

      /**
       * Remove a notification by ID
       */
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      /**
       * Mark notification as read
       */
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      /**
       * Mark all notifications as read
       */
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      /**
       * Clear all notifications
       */
      clearAll: () => {
        set({ notifications: [] });
      },

      /**
       * Clear notifications by type
       */
      clearByType: (type) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.type !== type),
        }));
      },

      /**
       * Group similar notifications
       */
      groupNotifications: (groupKey) => {
        // This is handled automatically in addNotification
        // This method can be used to manually trigger grouping
        console.warn('[NotificationStore] Manual grouping not implemented, use addNotification with groupKey');
      },

      /**
       * Request browser notification permission
       */
      requestPermission: async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          console.warn('[NotificationStore] Notifications not supported in this browser');
          return 'denied' as NotificationPermission;
        }

        const permission = await Notification.requestPermission();
        set({ permission });

        return permission;
      },

      /**
       * Update sound preference
       */
      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },

      /**
       * Update native notifications preference
       */
      setNativeEnabled: (enabled) => {
        set({ nativeEnabled: enabled });
      },

      /**
       * Get unread count
       */
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      /**
       * Get notifications by type
       */
      getByType: (type) => {
        const notifications = get().notifications;
        if (Array.isArray(type)) {
          return notifications.filter((n) => type.includes(n.type));
        }
        return notifications.filter((n) => n.type === type);
      },

      /**
       * Get filtered notifications
       */
      getFiltered: (filter) => {
        let results = get().notifications;

        // Filter by type
        if (filter.type) {
          const types = Array.isArray(filter.type) ? filter.type : [filter.type];
          results = results.filter((n) => types.includes(n.type));
        }

        // Filter by priority
        if (filter.priority) {
          const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
          results = results.filter((n) => priorities.includes(n.priority));
        }

        // Filter by read status
        if (filter.read !== undefined) {
          results = results.filter((n) => n.read === filter.read);
        }

        // Filter by date range
        if (filter.startDate) {
          results = results.filter((n) => n.createdAt >= filter.startDate!);
        }
        if (filter.endDate) {
          results = results.filter((n) => n.createdAt <= filter.endDate!);
        }

        // Search query
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          results = results.filter(
            (n) =>
              n.title.toLowerCase().includes(searchLower) ||
              n.message.toLowerCase().includes(searchLower)
          );
        }

        // Limit results
        if (filter.limit) {
          results = results.slice(0, filter.limit);
        }

        return results;
      },
    }),
    {
      name: 'notification-store',

      // Partial persistence - only persist preferences and recent notifications
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep last 50
        soundEnabled: state.soundEnabled,
        nativeEnabled: state.nativeEnabled,
        permission: state.permission,
        maxHistorySize: state.maxHistorySize,
      }),
    }
  )
);

// ============================================================================
// SELECTORS (Individual selectors for December 2025 Zustand pattern)
// ============================================================================

/**
 * Get all notifications
 */
export const useNotifications = () => useNotificationStore((state) => state.notifications);

/**
 * Get unread notifications
 */
export const useUnreadNotifications = () =>
  useNotificationStore((state) => state.notifications.filter((n) => !n.read));

/**
 * Get unread count
 */
export const useUnreadCount = () => useNotificationStore((state) => state.getUnreadCount());

/**
 * Get notification permission status
 */
export const useNotificationPermission = () =>
  useNotificationStore((state) => state.permission);

/**
 * Get sound enabled preference
 */
export const useSoundEnabled = () => useNotificationStore((state) => state.soundEnabled);

/**
 * Get native enabled preference
 */
export const useNativeEnabled = () => useNotificationStore((state) => state.nativeEnabled);

/**
 * Get notification actions
 */
export const useNotificationActions = () =>
  useNotificationStore((state) => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead,
    clearAll: state.clearAll,
    clearByType: state.clearByType,
    requestPermission: state.requestPermission,
    setSoundEnabled: state.setSoundEnabled,
    setNativeEnabled: state.setNativeEnabled,
  }));

/**
 * Get filtered notifications
 */
export const useFilteredNotifications = (filter: NotificationFilter) =>
  useNotificationStore((state) => state.getFiltered(filter));

/**
 * Get notifications by type
 */
export const useNotificationsByType = (type: NotificationType | NotificationType[]) =>
  useNotificationStore((state) => state.getByType(type));
