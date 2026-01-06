/**
 * Notification Center Component
 *
 * Slide-out panel displaying notification history with filtering.
 * 8-bit gaming style without blur effects.
 *
 * @module components/notifications/NotificationCenter
 * @story S-033 - Notification System with Toast/Badge
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/infrastructure/persistence/stores/notification-store';
import type { Notification, NotificationType, NotificationAction } from '@/lib/notifications/types';

/**
 * Notification Center Props
 */
export interface NotificationCenterProps {
  open?: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
}

/**
 * Notification Type Filter
 */
type NotificationTypeFilter = 'all' | NotificationType;

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type: Notification['type']) {
  const iconClass = 'size-4 flex-shrink-0';

  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ⓘ';
    case 'system':
      return '⚙';
    default:
      return 'ⓘ';
  }
}

/**
 * Get notification color class
 */
function getNotificationColor(type: Notification['type']) {
  switch (type) {
    case 'success':
      return 'text-green-400 border-green-700 bg-green-950/50';
    case 'error':
      return 'text-red-400 border-red-700 bg-red-950/50';
    case 'warning':
      return 'text-yellow-400 border-yellow-700 bg-yellow-950/50';
    case 'info':
      return 'text-blue-400 border-blue-700 bg-blue-950/50';
    case 'system':
      return 'text-purple-400 border-purple-700 bg-purple-950/50';
    default:
      return 'text-gray-400 border-gray-700 bg-gray-950/50';
  }
}

/**
 * Notification Item Component
 */
interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
  onAction: (id: string, action: NotificationAction) => void;
}

function NotificationItem({ notification, onDismiss, onMarkRead, onAction }: NotificationItemProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'group relative rounded-sm border-2 p-3 transition-all duration-200',
        'hover:bg-gray-800/50',
        getNotificationColor(notification.type),
        !notification.read && 'border-l-4 border-l-current'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0 text-lg">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={cn(
            'text-sm font-semibold',
            notification.read ? 'text-gray-400' : 'text-gray-100'
          )}>
            {notification.title}
          </h4>

          {/* Message */}
          <p className="mt-1 text-sm text-gray-400 line-clamp-2">
            {notification.message}
          </p>

          {/* Grouped Count */}
          {notification.groupCount && notification.groupCount > 1 && (
            <span className="mt-1 inline-block text-xs text-gray-500">
              ({notification.groupCount} {t('notifications.grouped')})
            </span>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-xs text-gray-500">
            {formatRelativeTime(notification.createdAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              className="rounded-sm p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors"
              aria-label={t('notifications.markAsRead', 'Mark as read')}
            >
              <Check className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDismiss(notification.id)}
            className="rounded-sm p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
            aria-label={t('notifications.dismiss', 'Dismiss')}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {notification.actions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onAction(notification.id, action)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
                action.variant === 'primary'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : action.variant === 'secondary'
                  ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                  : 'bg-transparent text-gray-300 hover:bg-gray-800'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Notification Center Component
 */
export function NotificationCenter({ open = false, onClose, position = 'right' }: NotificationCenterProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<NotificationTypeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Store access with individual selectors
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);
  const clearByType = useNotificationStore((state) => state.clearByType);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') {
      return notifications;
    }
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  // Counts
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const typeCounts = useMemo(() => {
    const counts: Record<NotificationType, number> = {
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
      system: 0,
    };

    notifications.forEach((n) => {
      counts[n.type]++;
    });

    return counts;
  }, [notifications]);

  // Handle dismiss
  const handleDismiss = (id: string) => {
    const removeNotification = useNotificationStore.getState().removeNotification;
    removeNotification(id);
  };

  // Handle mark read
  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  // Handle action
  const handleAction = (id: string, action: NotificationAction) => {
    action.onClick();
    handleMarkRead(id);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Handle clear all
  const handleClearAll = () => {
    clearAll();
  };

  // Handle clear filtered
  const handleClearFiltered = () => {
    if (filter === 'all') {
      clearAll();
    } else {
      clearByType(filter);
    }
  };

  // Filter options
  const filterOptions: Array<{ value: NotificationTypeFilter; label: string; count?: number }> = [
    { value: 'all', label: t('notifications.all', 'All'), count: notifications.length },
    { value: 'success', label: t('notifications.success', 'Success'), count: typeCounts.success },
    { value: 'error', label: t('notifications.error', 'Error'), count: typeCounts.error },
    { value: 'warning', label: t('notifications.warning', 'Warning'), count: typeCounts.warning },
    { value: 'info', label: t('notifications.info', 'Info'), count: typeCounts.info },
    { value: 'system', label: t('notifications.system', 'System'), count: typeCounts.system },
  ];

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-y-0 z-50 w-full max-w-md bg-gray-950 border-2 border-gray-700 shadow-xl',
        'transition-transform duration-300 ease-in-out',
        position === 'left' ? 'left-0' : 'right-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-100">
            {t('notifications.title', 'Notifications')}
          </h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          aria-label={t('notifications.close', 'Close notification center')}
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="border-b-2 border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">
              {t('notifications.filter', 'Filter')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-sm p-1 text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          >
            <ChevronDown className={cn('size-4 transition-transform', showFilters && 'rotate-180')} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
              >
                {option.label}
                {option.count !== undefined && (
                  <span className="rounded-full bg-gray-700 px-1.5 py-0.5 text-[10px]">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between border-b-2 border-gray-700 px-4 py-2">
        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
            unreadCount > 0
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-900 text-gray-600 cursor-not-allowed'
          )}
        >
          <CheckCheck className="size-3" />
          {t('notifications.markAllRead', 'Mark all read')}
        </button>
        <button
          type="button"
          onClick={handleClearFiltered}
          disabled={filteredNotifications.length === 0}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
            filteredNotifications.length > 0
              ? 'bg-red-950 text-red-400 hover:bg-red-900'
              : 'bg-gray-900 text-gray-600 cursor-not-allowed'
          )}
        >
          <Trash2 className="size-3" />
          {t('notifications.clear', 'Clear')}
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 h-[calc(100vh-240px)]">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="size-12 text-gray-700 mb-4" />
            <p className="text-sm text-gray-500">
              {t('notifications.empty', 'No notifications')}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={handleDismiss}
              onMarkRead={handleMarkRead}
              onAction={handleAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Notification Center Trigger Button
 */
export interface NotificationCenterTriggerProps {
  unreadCount?: number;
  onClick?: () => void;
}

export function NotificationCenterTrigger({ unreadCount = 0, onClick }: NotificationCenterTriggerProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-sm p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      aria-label={t('notifications.openCenter', 'Open notification center')}
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
