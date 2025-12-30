/**
 * @fileoverview Timeout Warning Component
 * @module components/chat/TimeoutWarning
 * @governance EPIC-31-4
 *
 * Warning toast for approaching tool execution timeout.
 *
 * Story 31.4: Tool Execution Timeout & Graceful Degradation
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { formatTimeoutDuration } from '@/lib/agent/tools/tool-timeout';

export interface TimeoutWarningProps {
  /**
   * Tool name
   */
  toolName: string;

  /**
   * Elapsed time in milliseconds
   */
  elapsed: number;

  /**
   * Timeout threshold in milliseconds
   */
  timeout: number;

  /**
   * Show warning toast
   */
  showWarning?: boolean;

  /**
   * Dismiss handler
   */
  onDismiss?: () => void;
}

/**
 * Timeout warning component
 *
 * @example
 * ```tsx
 * <TimeoutWarning
 *   toolName="write_file"
 *   elapsed={25000}
 *   timeout={30000}
 *   showWarning={true}
 * />
 * ```
 */
export function TimeoutWarning({
  toolName,
  elapsed,
  timeout,
  showWarning = true,
  onDismiss,
}: TimeoutWarningProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  // Show warning when elapsed time approaches timeout
  useEffect(() => {
    if (showWarning && elapsed >= timeout * 0.83) {
      setVisible(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showWarning, elapsed, timeout, onDismiss]);

  // Calculate remaining time
  const remaining = Math.max(0, timeout - elapsed);
  const remainingFormatted = formatTimeoutDuration(remaining);

  if (!visible) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
      {/* Warning icon */}
      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 flex-shrink-0">
        ⚠️
      </div>

      {/* Message */}
      <div className="flex-1">
        <p className="text-sm font-medium text-yellow-500">
          {t('toolTimeout.warning.title')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('toolTimeout.warning.message', {
            tool: toolName,
            remaining: remainingFormatted,
          })}
        </p>
      </div>

      {/* Progress */}
      <div className="flex-1">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-yellow-500 h-full transition-all duration-300"
            style={{ width: `${(elapsed / timeout) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-1">
          {formatTimeoutDuration(elapsed)} / {formatTimeoutDuration(timeout)}
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        className="text-sm text-muted-foreground hover:text-foreground flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Show timeout error toast
 *
 * @param toolName - Tool name
 * @param timeout - Timeout in milliseconds
 */
export function showTimeoutError(toolName: string, timeout: number): void {
  const { t } = useTranslation();

  Toast.error(
    t('toolTimeout.error.title', { tool: toolName }),
    {
      description: t('toolTimeout.error.message', {
        tool: toolName,
        timeout: formatTimeoutDuration(timeout),
      }),
      action: {
        label: t('toolTimeout.error.retry'),
        onClick: () => {
          // Trigger retry - parent component should handle this
          console.log('Retry requested for', toolName);
        },
      },
    }
  );
}

/**
 * Show timeout options dialog
 *
 * @param toolName - Tool name
 * @param currentTimeout - Current timeout
 * @param onSelect - Selection callback
 */
export function showTimeoutOptions(
  toolName: string,
  currentTimeout: number,
  onSelect: (newTimeout: number) => void
): void {
  const { t } = useTranslation();
  const { getTimeoutOptions } = require('@/lib/agent/tools/tool-timeout');
  const options = getTimeoutOptions(currentTimeout);

  // For now, just log - in production, this would show a dialog
  console.log('Timeout options for', toolName, options);

  // TODO: Implement actual dialog with options
  // For now, just use the first option
  if (options.length > 0) {
    onSelect(options[0].value);
  }
}
