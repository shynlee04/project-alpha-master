/**
 * User Presence Indicator Component
 * @module components/collaboration/UserPresenceIndicator
 *
 * Displays avatar stack of users viewing/editing current file.
 * Shows tooltips with user info and last activity.
 * Maximum 5 avatars visible, overflow shows "+N more".
 *
 * @story S-025 - Real-Time Collaboration Indicators
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * User presence props
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'online' | 'idle' | 'offline';
  lastActivity: number;
  filePath: string | null;
}

/**
 * Avatar component with status indicator
 */
interface UserAvatarProps {
  user: UserPresence;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const statusColors = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  // Generate avatar from initials or use image
  const initials = user.userName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const lastActivity = useMemo(() => {
    const diff = Date.now() - user.lastActivity;
    if (diff < 60000) return t('collaboration.activity.justNow');
    if (diff < 3600000) return t('collaboration.activity.minutesAgo', { count: Math.floor(diff / 60000) });
    return t('collaboration.activity.hoursAgo', { count: Math.floor(diff / 3600000) });
  }, [user.lastActivity, t]);

  return (
    <div className="relative group">
      {/* Avatar */}
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full flex items-center justify-center font-medium text-white select-none',
          'border-2 border-primary/20' // 8-bit pixel art border
        )}
        style={{
          backgroundColor: user.userAvatar
            ? undefined
            : `hsl(${stringToHue(user.userId)}, 70%, 50%)`,
        }}
        title={`${user.userName} - ${t(`collaboration.status.${user.status}`)}`}
      >
        {user.userAvatar ? (
          <img
            src={user.userAvatar}
            alt={user.userName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Status indicator */}
      <div
        className={cn(
          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
          statusColors[user.status]
        )}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-border">
          <div className="font-medium">{user.userName}</div>
          <div className="text-muted-foreground">{t('collaboration.viewingThisFile')}</div>
          <div className="text-muted-foreground text-[10px] mt-0.5">
            {lastActivity}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main props
 */
export interface UserPresenceIndicatorProps {
  /** Users present in current file */
  users: UserPresence[];
  /** Maximum avatars to show */
  maxAvatars?: number;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** CSS className */
  className?: string;
}

/**
 * User presence indicator with avatar stack
 */
export const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  users,
  maxAvatars = 5,
  size = 'md',
  className,
}) => {
  const { t } = useTranslation();

  if (users.length === 0) {
    return null;
  }

  const visibleUsers = users.slice(0, maxAvatars);
  const overflowCount = users.length - maxAvatars;

  return (
    <div
      className={cn(
        'flex items-center -space-x-2', // Avatar stack
        'px-2 py-1', // Spacing
        className
      )}
    >
      {/* Visible avatars */}
      {visibleUsers.map(user => (
        <UserAvatar key={user.userId} user={user} size={size} />
      ))}

      {/* Overflow indicator */}
      {overflowCount > 0 && (
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            'bg-muted text-muted-foreground text-xs font-medium',
            'border-2 border-background' // 8-bit border
          )}
          title={t('collaboration.moreUsers', { count: overflowCount })}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
};

/**
 * Generate HSL color from string (for avatars)
 */
function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

export default UserPresenceIndicator;
