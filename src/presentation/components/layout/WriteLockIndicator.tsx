/**
 * @fileoverview WriteLockIndicator - Visual indicator for file write locks
 * @module presentation/components/layout/WriteLockIndicator
 *
 * EPIC-UXUI-04-08: Plugin Coordination Integration
 * Displays lock status for files with 8-bit pixel styling
 *
 * @story UXUI-04-08
 * @created 2026-01-30
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Lock, AlertCircle } from 'lucide-react';
import type { PluginId } from '@/domain/types/plugin-types';
import './WriteLockIndicator.css';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for WriteLockIndicator component
 */
export interface WriteLockIndicatorProps {
  /** File path/ID being locked */
  fileId: string;
  /** Plugin ID that holds the lock */
  lockedBy: PluginId | null;
  /** Whether the lock is held by the current plugin */
  isOwnLock?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props for WriteLockBadge component
 */
export interface WriteLockBadgeProps {
  /** Number of locked files */
  count: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component: WriteLockIndicator
// ============================================================================

/**
 * WriteLockIndicator Component
 *
 * Displays a visual indicator when a file is locked for editing.
 * Shows lock icon with tooltip indicating which plugin holds the lock.
 *
 * @example
 * ```tsx
 * // File is locked by Monaco editor
 * <WriteLockIndicator
 *   fileId="/path/to/file"
 *   lockedBy="monaco"
 *   isOwnLock={false}
 * />
 *
 * // File is locked by current plugin
 * <WriteLockIndicator
 *   fileId="/path/to/file"
 *   lockedBy="notes"
 *   isOwnLock={true}
 * />
 * ```
 */
export const WriteLockIndicator: React.FC<WriteLockIndicatorProps> = ({
  fileId: _fileId,
  lockedBy,
  isOwnLock = false,
  size = 'medium',
  className,
  onClick,
}) => {
  const { t } = useTranslation();

  // Get plugin display name
  const pluginName = useMemo(() => {
    if (!lockedBy) return '';

    const pluginNames: Record<PluginId, string> = {
      filetree: t('plugins.filetree.name', 'File Explorer'),
      monaco: t('plugins.monaco.name', 'Code Editor'),
      notes: t('plugins.notes.name', 'Notes'),
      terminal: t('plugins.terminal.name', 'Terminal'),
      chat: t('plugins.chat.name', 'Chat'),
      agents: t('plugins.agents.name', 'Agents'),
      preview: t('plugins.preview.name', 'Preview'),
    };

    return pluginNames[lockedBy] || lockedBy;
  }, [lockedBy, t]);

  // If no lock, don't render
  if (!lockedBy) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    small: 'write-lock-indicator--small',
    medium: 'write-lock-indicator--medium',
    large: 'write-lock-indicator--large',
  };

  // Status classes
  const statusClasses = isOwnLock
    ? 'write-lock-indicator--own'
    : 'write-lock-indicator--locked';

  // Tooltip text
  const tooltipText = isOwnLock
    ? t('coordination.lock.own', 'You have locked this file for editing')
    : t('coordination.lock.lockedBy', 'Locked by {{plugin}}', { plugin: pluginName });

  return (
    <div
      className={cn(
        'write-lock-indicator',
        sizeClasses[size],
        statusClasses,
        onClick && 'write-lock-indicator--clickable',
        className
      )}
      title={tooltipText}
      onClick={onClick}
      role="status"
      aria-label={tooltipText}
    >
      <Lock
        className="write-lock-indicator__icon"
        aria-hidden="true"
        size={size === 'small' ? 12 : size === 'large' ? 20 : 16}
      />
      {!isOwnLock && (
        <span className="write-lock-indicator__badge" aria-hidden="true">
          <AlertCircle size={8} />
        </span>
      )}
    </div>
  );
};

// ============================================================================
// Component: WriteLockBadge
// ============================================================================

/**
 * WriteLockBadge Component
 *
 * Displays a badge showing the count of locked files.
 * Used in activity bars or status indicators.
 *
 * @example
 * ```tsx
 * // 3 files locked
 * <WriteLockBadge count={3} />
 *
 * // No locked files (renders nothing)
 * <WriteLockBadge count={0} />
 * ```
 */
export const WriteLockBadge: React.FC<WriteLockBadgeProps> = ({
  count,
  className,
}) => {
  const { t } = useTranslation();

  // Don't render if no locks
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn('write-lock-badge', className)}
      title={t('coordination.lock.count', '{{count}} files locked', { count })}
      aria-label={t('coordination.lock.count', '{{count}} files locked', { count })}
    >
      <Lock size={10} aria-hidden="true" />
      <span className="write-lock-badge__count">{count}</span>
    </span>
  );
};

// ============================================================================
// Component: FileLockStatus
// ============================================================================

/**
 * FileLockStatus Component
 *
 * Comprehensive file lock status display with icon and text.
 * Shows lock holder and provides action buttons.
 *
 * @example
 * ```tsx
 * <FileLockStatus
 *   fileId="/path/to/file"
 *   lockedBy="monaco"
 *   isOwnLock={false}
 *   onRequestAccess={() => requestAccess()}
 * />
 * ```
 */
export interface FileLockStatusProps {
  /** File path/ID */
  fileId: string;
  /** Plugin ID that holds the lock */
  lockedBy: PluginId | null;
  /** Whether the lock is held by the current plugin */
  isOwnLock?: boolean;
  /** Handler for requesting access */
  onRequestAccess?: () => void;
  /** Handler for releasing own lock */
  onReleaseLock?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const FileLockStatus: React.FC<FileLockStatusProps> = ({
  fileId,
  lockedBy,
  isOwnLock = false,
  onRequestAccess,
  onReleaseLock,
  className,
}) => {
  const { t } = useTranslation();

  // Get plugin display name
  const pluginName = useMemo(() => {
    if (!lockedBy) return '';

    const pluginNames: Record<PluginId, string> = {
      filetree: t('plugins.filetree.name', 'File Explorer'),
      monaco: t('plugins.monaco.name', 'Code Editor'),
      notes: t('plugins.notes.name', 'Notes'),
      terminal: t('plugins.terminal.name', 'Terminal'),
      chat: t('plugins.chat.name', 'Chat'),
      agents: t('plugins.agents.name', 'Agents'),
      preview: t('plugins.preview.name', 'Preview'),
    };

    return pluginNames[lockedBy] || lockedBy;
  }, [lockedBy, t]);

  // If no lock, show available status
  if (!lockedBy) {
    return (
      <div className={cn('file-lock-status file-lock-status--available', className)}>
        <Lock size={16} className="file-lock-status__icon" aria-hidden="true" />
        <span className="file-lock-status__text">
          {t('coordination.lock.available', 'Available for editing')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'file-lock-status',
        isOwnLock ? 'file-lock-status--own' : 'file-lock-status--locked',
        className
      )}
    >
      <Lock
        size={16}
        className="file-lock-status__icon"
        aria-hidden="true"
      />
      <div className="file-lock-status__content">
        <span className="file-lock-status__text">
          {isOwnLock
            ? t('coordination.lock.youHaveLock', 'You have locked this file')
            : t('coordination.lock.lockedByFull', 'Locked by {{plugin}}', {
                plugin: pluginName,
              })}
        </span>
        <span className="file-lock-status__file">{fileId}</span>
      </div>
      {isOwnLock && onReleaseLock && (
        <button
          type="button"
          className="file-lock-status__action"
          onClick={onReleaseLock}
        >
          {t('coordination.lock.release', 'Release')}
        </button>
      )}
      {!isOwnLock && onRequestAccess && (
        <button
          type="button"
          className="file-lock-status__action"
          onClick={onRequestAccess}
        >
          {t('coordination.lock.request', 'Request Access')}
        </button>
      )}
    </div>
  );
};

export default WriteLockIndicator;
