/**
 * useNotifications Hook
 *
 * React hook for accessing notification manager and store.
 * Provides convenient methods for showing notifications and accessing state.
 *
 * @module hooks/useNotifications
 * @story S-033 - Notification System with Toast/Badge
 */

import { useNotificationManager } from '@/lib/notifications/notification-manager';
import {
  useNotifications,
  useUnreadNotifications,
  useUnreadCount,
  useNotificationPermission,
  useSoundEnabled,
  useNativeEnabled,
  useNotificationActions,
  useFilteredNotifications,
  useNotificationsByType,
} from '@/infrastructure/persistence/stores/notification-store';
import type { Notification, NotificationFilter, NotificationType } from '@/lib/notifications/types';

/**
 * Main hook for notifications
 *
 * Combines notification manager methods with store access.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { success, error, unreadCount } = useNotifications();
 *
 *   const handleSave = () => {
 *     try {
 *       // save operation
 *       success('Saved!', 'Your changes have been saved.');
 *     } catch (err) {
 *       error('Save Failed', 'Could not save changes.');
 *     }
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useNotificationsHook() {
  const manager = useNotificationManager();

  return {
    // Notification manager methods
    ...manager,

    // Store access
    notifications: useNotifications(),
    unreadNotifications: useUnreadNotifications(),
    unreadCount: useUnreadCount(),
    permission: useNotificationPermission(),
    soundEnabled: useSoundEnabled(),
    nativeEnabled: useNativeEnabled(),
  };
}

/**
 * Hook for filtered notifications
 *
 * @example
 * ```tsx
 * const errorNotifications = useFiltered({ type: 'error', limit: 10 });
 * ```
 */
export function useFiltered(filter: NotificationFilter) {
  return useFilteredNotifications(filter);
}

/**
 * Hook for notifications by type
 *
 * @example
 * ```tsx
 * const successNotifications = useByType('success');
 * ```
 */
export function useByType(type: NotificationType | NotificationType[]) {
  return useNotificationsByType(type);
}

/**
 * Hook for notification actions only (no state)
 *
 * Useful for avoiding unnecessary re-renders when you only need to trigger notifications.
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const { success, error } = useNotificationActions();
 *   // Component won't re-render when notifications change
 * }
 * ```
 */
export function useNotificationActionsHook() {
  const manager = useNotificationManager();
  const actions = useNotificationActions();

  return {
    show: manager.show,
    success: manager.success,
    error: manager.error,
    warning: manager.warning,
    info: manager.info,
    dismiss: manager.dismiss,
    dismissAll: manager.dismissAll,
    markAsRead: actions.markAsRead,
    markAllAsRead: actions.markAllAsRead,
    clearAll: actions.clearAll,
    clearByType: actions.clearByType,
    requestPermission: manager.requestPermission,
    setSoundEnabled: actions.setSoundEnabled,
    setNativeEnabled: actions.setNativeEnabled,
  };
}

/**
 * Hook for notification settings
 *
 * @example
 * ```tsx
 * function NotificationSettings() {
 *   const { soundEnabled, nativeEnabled, permission, setSoundEnabled, setNativeEnabled } = useNotificationSettings();
 *
 *   return (
 *     <div>
 *       <label>Sound <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} /></label>
 *       <label>Native <input type="checkbox" checked={nativeEnabled} onChange={(e) => setNativeEnabled(e.target.checked)} /></label>
 *       <p>Permission: {permission}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNotificationSettings() {
  return {
    soundEnabled: useSoundEnabled(),
    nativeEnabled: useNativeEnabled(),
    permission: useNotificationPermission(),
    setSoundEnabled: useNotificationManager().setSoundEnabled,
    setNativeEnabled: useNotificationManager().setNativeEnabled,
    requestPermission: useNotificationManager().requestPermission,
  };
}

// Re-export main hook as default
export default useNotificationsHook;
