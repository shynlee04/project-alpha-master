/**
 * Toast Component
 *
 * Individual toast notification with auto-dismiss and action buttons.
 * 8-bit gaming style without blur effects.
 *
 * @module components/notifications/Toast
 * @story S-033 - Notification System with Toast/Badge
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
} from 'lucide-react';
import type { Notification, NotificationAction } from '@/lib/notifications/types';
import { cn } from '@/lib/utils';

/**
 * Toast props
 */
export interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction: (id: string, action: NotificationAction) => void;
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type: Notification['type']) {
  const iconClass = 'size-5 flex-shrink-0';

  switch (type) {
    case 'success':
      return <CheckCircle className={cn(iconClass, 'text-green-500')} />;
    case 'error':
      return <XCircle className={cn(iconClass, 'text-red-500')} />;
    case 'warning':
      return <AlertTriangle className={cn(iconClass, 'text-yellow-500')} />;
    case 'info':
      return <Info className={cn(iconClass, 'text-blue-500')} />;
    case 'system':
      return <Bell className={cn(iconClass, 'text-purple-500')} />;
    default:
      return <Info className={cn(iconClass, 'text-gray-500')} />;
  }
}

/**
 * Get notification color classes based on type (8-bit style)
 */
function getNotificationColors(type: Notification['type']) {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-950 border-green-700',
        border: 'border-l-4 border-l-green-500',
      };
    case 'error':
      return {
        bg: 'bg-red-950 border-red-700',
        border: 'border-l-4 border-l-red-500',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-950 border-yellow-700',
        border: 'border-l-4 border-l-yellow-500',
      };
    case 'info':
      return {
        bg: 'bg-blue-950 border-blue-700',
        border: 'border-l-4 border-l-blue-500',
      };
    case 'system':
      return {
        bg: 'bg-purple-950 border-purple-700',
        border: 'border-l-4 border-l-purple-500',
      };
    default:
      return {
        bg: 'bg-gray-950 border-gray-700',
        border: 'border-l-4 border-l-gray-500',
      };
  }
}

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
    return `${seconds}s`;
  } else if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else {
    return `${days}d`;
  }
}

/**
 * Toast Component
 */
export function Toast({ notification, onDismiss, onAction }: ToastProps) {
  const { t } = useTranslation();
  const colors = getNotificationColors(notification.type);

  // Auto-dismiss timer
  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'relative flex w-full max-w-sm flex-col gap-2 rounded-sm border-2 p-4 shadow-lg transition-all duration-300',
        'animate-in slide-in-from-top-2 fade-in-50',
        colors.bg,
        colors.border
      )}
    >
      {/* Header: Icon, Title, Dismiss Button */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-100 truncate">
            {notification.title}
          </h4>

          {/* Message */}
          <p className="mt-1 text-sm text-gray-300 line-clamp-2">
            {notification.message}
          </p>

          {/* Grouped Count */}
          {notification.groupCount && notification.groupCount > 1 && (
            <span className="mt-1 inline-block text-xs text-gray-400">
              ({notification.groupCount} {t('notifications.grouped', 'notifications')})
            </span>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 rounded-sm p-1 text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          aria-label={t('notifications.dismiss', 'Dismiss notification')}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Action Buttons */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
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

      {/* Timestamp (for persistent notifications) */}
      {notification.persistent && (
        <div className="mt-2 text-xs text-gray-500">
          {formatRelativeTime(notification.createdAt)}
        </div>
      )}

      {/* Priority Indicator */}
      {notification.priority === 'urgent' && (
        <div className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </div>
      )}
    </div>
  );
}

/**
 * Toast Container Component
 *
 * Manages positioning of multiple toasts with 8-bit gaming style.
 */
export interface ToastContainerProps {
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  children: React.ReactNode;
}

export function ToastContainer({ position = 'bottom-right', children }: ToastContainerProps) {
  const positionClasses: Record<NonNullable<typeof position>, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-sm',
        positionClasses[position]
      )}
    >
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

/**
 * Toast Region for ARIA live announcements
 */
export function ToastRegion({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-label={children ? 'Notifications' : 'No notifications'}
      className="sr-only"
    >
      {children}
    </div>
  );
}
