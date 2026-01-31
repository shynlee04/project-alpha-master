/**
 * Notification Badge Component
 *
 * Badge counter displaying unread notification count.
 * Shows "99+" for 100+ unread notifications.
 * 8-bit gaming style without blur effects.
 *
 * @module components/notifications/NotificationBadge
 * @story S-033 - Notification System with Toast/Badge
 */

import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/infrastructure/persistence/stores/notification-store';

/**
 * Notification Badge Props
 */
export interface NotificationBadgeProps {
  /**
   * Maximum count before showing "99+"
   * @default 99
   */
  maxCount?: number;

  /**
   * Badge position relative to icon
   * @default 'top-right'
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

  /**
   * Badge color variant
   * @default 'red'
   */
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';

  /**
   * Icon size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Custom count (overrides store count)
   */
  count?: number;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to show zero count
   * @default false
   */
  showZero?: boolean;

  /**
   * Whether to pulse the badge
   * @default false
   */
  pulse?: boolean;
}

/**
 * Size classes
 */
const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

const iconSizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

/**
 * Badge position classes
 */
const positionClasses = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
};

/**
 * Badge color classes
 */
const colorClasses = {
  red: 'bg-destructive text-destructive-foreground',
  blue: 'bg-info text-info-foreground',
  green: 'bg-success text-success-foreground',
  yellow: 'bg-warning text-warning-foreground',
  purple: 'bg-purple-600 text-purple-foreground',
};

/**
 * Format badge count
 */
function formatBadgeCount(count: number, max: number): string {
  if (count > max) {
    return `${max}+`;
  }
  return count.toString();
}

/**
 * Notification Badge Component
 */
export function NotificationBadge({
  maxCount = 99,
  position = 'top-right',
  color = 'red',
  size = 'md',
  count: customCount,
  onClick,
  className,
  showZero = false,
  pulse = false,
}: NotificationBadgeProps) {
  const { t } = useTranslation();

  // Get unread count from store (unless custom count provided)
  const unreadCount = useUnreadCount();
  const count = customCount !== undefined ? customCount : unreadCount;

  // Don't show badge if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative rounded-sm p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          className
        )}
        aria-label={t('notifications.noNotifications', 'No notifications')}
      >
        <Bell className={iconSizeClasses[size]} />
      </button>
    );
  }

  const formattedCount = formatBadgeCount(count, maxCount);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-sm p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
        className
      )}
      aria-label={t('notifications.unreadCount', '{{count}} unread notifications', { count })}
    >
      <Bell className={iconSizeClasses[size]} />

      {/* Badge */}
      <span
        className={cn(
          'absolute flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold leading-none',
          'animate-in zoom-in-50 fade-in-50',
          sizeClasses[size],
          positionClasses[position],
          colorClasses[color],
          pulse && 'animate-pulse'
        )}
        aria-hidden="true"
      >
        {formattedCount}
      </span>

      {/* Screen reader text */}
      <span className="sr-only">
        {t('notifications.unreadCount', '{{count}} unread notifications', { count })}
      </span>
    </button>
  );
}

/**
 * Notification Badge with Label (for header/sidebar)
 */
export interface NotificationBadgeWithLabelProps extends Omit<NotificationBadgeProps, 'className'> {
  label?: string;
}

export function NotificationBadgeWithLabel({
  label,
  ...badgeProps
}: NotificationBadgeWithLabelProps) {
  const { t } = useTranslation();
  const displayLabel = label || t('notifications.notifications', 'Notifications');

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{displayLabel}</span>
      <NotificationBadge {...badgeProps} />
    </div>
  );
}

/**
 * Notification Badge Dot (simpler version with just a dot)
 */
export interface NotificationBadgeDotProps {
  count?: number;
  onClick?: () => void;
  className?: string;
  showZero?: boolean;
}

export function NotificationBadgeDot({
  count: customCount,
  onClick,
  className,
  showZero = false,
}: NotificationBadgeDotProps) {
  const { t } = useTranslation();
  const unreadCount = useUnreadCount();
  const count = customCount !== undefined ? customCount : unreadCount;

  if (count === 0 && !showZero) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative rounded-sm p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          className
        )}
        aria-label={t('notifications.noNotifications', 'No notifications')}
      >
        <Bell className="size-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-sm p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
        className
      )}
      aria-label={t('notifications.unreadCount', '{{count}} unread notifications', { count })}
    >
      <Bell className="size-5" />

      {/* Dot indicator */}
      <span
        className={cn(
          'absolute top-1 right-1 flex h-3 w-3 rounded-full bg-destructive',
          'animate-in zoom-in-50 fade-in-50',
          count > 0 && 'animate-pulse'
        )}
        aria-hidden="true"
      />
    </button>
  );
}
