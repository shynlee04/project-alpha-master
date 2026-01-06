/**
 * Notification CRUD Slice
 *
 * Manages notification creation, deletion, and read status updates.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/notifications/notification-crud-slice
 * @story S-033 - Notification System with Toast/Badge
 */

import type { StateCreator } from 'zustand';
import type { Notification, NotificationStoreState } from '@/lib/notifications/types';

/**
 * Notification CRUD State
 */
export interface NotificationCrudState {
  /** All notifications */
  notifications: Notification[];

  /** Maximum history size */
  maxHistorySize: number;
}

/**
 * Notification CRUD Actions
 */
export interface NotificationCrudActions {
  /** Add a new notification */
  addNotification: (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => string;

  /** Remove a notification by ID */
  removeNotification: (id: string) => void;

  /** Mark notification as read */
  markAsRead: (id: string) => void;

  /** Mark all notifications as read */
  markAllAsRead: () => void;

  /** Clear all notifications */
  clearAll: () => void;

  /** Clear notifications by type */
  clearByType: (type: Notification['type']) => void;
}

/**
 * Generate unique notification ID
 */
function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initial CRUD state
 */
const initialCrudState: NotificationCrudState = {
  notifications: [],
  maxHistorySize: 100,
};

/**
 * Notification CRUD Slice Creator
 */
export const createNotificationCrudSlice: StateCreator<
  NotificationCrudState & NotificationCrudActions,
  [],
  [],
  NotificationCrudState & NotificationCrudActions
> = (set, get) => ({
  ...initialCrudState,

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
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            groupCount: (existing.groupCount || 1) + 1,
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

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  clearByType: (type: Notification['type']) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.type !== type),
    }));
  },
});
