/**
 * Notification System Types
 *
 * Defines the core notification data structures and types for the platform.
 * Supports toast messages, notification center, badge counters, and browser notifications.
 *
 * @module notifications/types
 * @story S-033 - Notification System with Toast/Badge
 */

/**
 * Notification Type Categories
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'system';

/**
 * Notification Priority Levels
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification Action Button
 */
export interface NotificationAction {
  /** Button label (i18n key or direct string) */
  label: string;
  /** Action handler function */
  onClick: () => void;
  /** Optional button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
}

/**
 * Core Notification Data Structure
 */
export interface Notification {
  /** Unique notification ID */
  id: string;

  /** Notification type */
  type: NotificationType;

  /** Notification title (i18n key or direct string) */
  title: string;

  /** Notification message (i18n key or direct string) */
  message: string;

  /** Notification priority */
  priority: NotificationPriority;

  /** Creation timestamp */
  createdAt: number;

  /** Whether notification has been read */
  read: boolean;

  /** Whether notification should persist in history */
  persistent: boolean;

  /** Auto-dismiss timeout in milliseconds (0 = no auto-dismiss) */
  duration: number;

  /** Optional action buttons */
  actions?: NotificationAction[];

  /** Optional URL to navigate on click */
  link?: string;

  /** Grouping key for similar notifications */
  groupKey?: string;

  /** Count of grouped notifications */
  groupCount?: number;

  /** Whether to show native browser notification */
  showNative?: boolean;

  /** Whether to play sound */
  sound?: boolean;

  /** Whether to vibrate (mobile) */
  vibrate?: boolean;

  /** Optional metadata for extensibility */
  metadata?: Record<string, unknown>;
}

/**
 * Notification Store State
 */
export interface NotificationStoreState {
  /** All notifications (history) */
  notifications: Notification[];

  /** Maximum notifications to keep in history */
  maxHistorySize: number;

  /** Browser notification permission status */
  permission: NotificationPermission;

  /** User preference for notification sounds */
  soundEnabled: boolean;

  /** User preference for native notifications */
  nativeEnabled: boolean;
}

/**
 * Notification Store Actions
 */
export interface NotificationStoreActions {
  /** Add a new notification */
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;

  /** Remove a notification by ID */
  removeNotification: (id: string) => void;

  /** Mark notification as read */
  markAsRead: (id: string) => void;

  /** Mark all notifications as read */
  markAllAsRead: () => void;

  /** Clear all notifications */
  clearAll: () => void;

  /** Clear notifications by type */
  clearByType: (type: NotificationType) => void;

  /** Group similar notifications */
  groupNotifications: (groupKey: string) => void;

  /** Request browser notification permission */
  requestPermission: () => Promise<NotificationPermission>;

  /** Update sound preference */
  setSoundEnabled: (enabled: boolean) => void;

  /** Update native notifications preference */
  setNativeEnabled: (enabled: boolean) => void;

  /** Get unread count */
  getUnreadCount: () => number;

  /** Get notifications by type */
  getByType: (type: NotificationType) => Notification[];

  /** Get filtered notifications */
  getFiltered: (filter: NotificationFilter) => Notification[];
}

/**
 * Notification Filter Options
 */
export interface NotificationFilter {
  /** Filter by type */
  type?: NotificationType | NotificationType[];

  /** Filter by priority */
  priority?: NotificationPriority | NotificationPriority[];

  /** Filter by read status */
  read?: boolean;

  /** Filter by date range */
  startDate?: number;
  endDate?: number;

  /** Maximum number of results */
  limit?: number;

  /** Search query */
  search?: string;
}

/**
 * Notification Manager Configuration
 */
export interface NotificationManagerConfig {
  /** Default auto-dismiss duration (ms) */
  defaultDuration: number;

  /** Maximum visible toast notifications */
  maxVisibleToasts: number;

  /** Maximum notifications in history */
  maxHistorySize: number;

  /** Whether native notifications are enabled by default */
  nativeEnabled: boolean;

  /** Whether sound is enabled by default */
  soundEnabled: boolean;

  /** Notification sound URL */
  soundUrl?: string;

  /** Vibration pattern for mobile (ms) */
  vibrationPattern?: number[];
}

/**
 * Notification Toast Position
 */
export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

/**
 * Notification Toast Props
 */
export interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction: (id: string, action: NotificationAction) => void;
  position?: ToastPosition;
}
