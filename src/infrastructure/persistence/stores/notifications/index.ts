/**
 * Notification Store (Refactored)
 *
 * Zustand store for managing notification state, history, and preferences.
 * Refactored into 3 slices following December 2025 Zustand best practices.
 *
 * @module stores/notifications
 * @story S-033 - Notification System with Toast/Badge
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationFilter, NotificationType } from '@/lib/notifications/types';
import { createNotificationCrudSlice, NotificationCrudState, NotificationCrudActions } from './notification-crud-slice';
import { createNotificationFilterSlice, NotificationFilterState, NotificationFilterActions } from './notification-filter-slice';
import { createNotificationPreferencesSlice, NotificationPreferencesState, NotificationPreferencesActions } from './notification-preferences-slice';

/**
 * Combined Notification Store State
 */
export type NotificationStoreState =
  & NotificationCrudState
  & NotificationFilterState
  & NotificationPreferencesState;

/**
 * Combined Notification Store Actions
 */
export type NotificationStoreActions =
  & NotificationCrudActions
  & NotificationFilterActions
  & NotificationPreferencesActions;

/**
 * Complete Notification Store Interface
 */
export interface NotificationStore extends NotificationStoreState, NotificationStoreActions {}

/**
 * Notification Store (Combined Slices with Persistence)
 *
 * Combines all 3 slices into a single store with Dexie persistence.
 */
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get, api) => ({
      // Slice 1: CRUD Operations
      ...createNotificationCrudSlice(set, get, api),

      // Slice 2: Filter/Query Operations
      ...createNotificationFilterSlice(set, get, api),

      // Slice 3: Preferences & Permissions
      ...createNotificationPreferencesSlice(set, get, api),
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
  useNotificationStore((state) => state.getByType(type as NotificationType));

// ============================================================================
// FACADE (Backward compatibility with old notification-store.ts)
// ============================================================================

/**
 * @deprecated Use `useNotificationStore` directly instead.
 */
export const useNotificationStoreFacade = useNotificationStore;
