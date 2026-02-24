/**
 * Notification Store - Backward Compatibility Facade
 *
 * Re-exports from new sliced architecture for backward compatibility.
 *
 * @deprecated Import from @/infrastructure/persistence/stores/notifications instead.
 */

export {
  useNotificationStore,
  useNotificationStoreFacade,
  // Selectors/Hooks
  useNotifications,
  useUnreadNotifications,
  useUnreadCount,
  useNotificationPermission,
  useSoundEnabled,
  useNativeEnabled,
  useNotificationActions,
  useFilteredNotifications,
  useNotificationsByType,
} from './notifications';

// Re-export types
export type { NotificationStore, NotificationStoreState, NotificationStoreActions } from './notifications';
