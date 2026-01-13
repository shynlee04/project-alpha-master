/**
 * @fileoverview YOLO Mode Toggle Component
 * @module presentation/components/agent/WorkspacePermissions/YOLOModeToggle
 *
 * YOLO (You Only Live Once) mode - Global bypass for all tool permissions
 * When enabled, all tools execute without user approval
 * Auto-disables after expiry time (default: 24 hours) for safety
 *
 * ARCH-01.4 - Agent Tool Permission Matrix
 *
 * Features:
 * - Toggle switch for YOLO mode
 * - Shows expiry time when enabled
 * - Warning message when active
 * - 8-bit styled UI
 */

import { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { useToolPermissionStore } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';

/**
 * Props for YOLOModeToggle component
 */
export interface YOLOModeToggleProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * Format timestamp to human-readable time remaining
 */
function formatExpiryTime(expiryTime: number): string {
  const now = Date.now();
  const remaining = expiryTime - now;

  if (remaining <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

/**
 * YOLO Mode Toggle Component
 *
 * Allows users to enable/disable YOLO mode which bypasses all tool permission checks
 * Shows warning message and expiry time when active
 */
export function YOLOModeToggle({ className = '' }: YOLOModeToggleProps) {
  const yoloMode = useToolPermissionStore((s) => s.yoloMode);
  const toggleYOLO = useToolPermissionStore((s) => s.toggleYOLO);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    if (yoloMode.enabled) {
      // Disable immediately (no confirmation needed)
      toggleYOLO();
    } else {
      // Show confirmation before enabling
      setShowConfirm(true);
    }
  };

  const handleConfirmEnable = () => {
    toggleYOLO(24); // Enable for 24 hours
    setShowConfirm(false);
  };

  const handleCancelEnable = () => {
    setShowConfirm(false);
  };

  const timeRemaining = yoloMode.enabled && yoloMode.expiryTime
    ? formatExpiryTime(yoloMode.expiryTime)
    : null;

  return (
    <div className={`yolo-mode-toggle ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-pixel text-warning">
            ⚡ YOLO Mode
          </span>
          {yoloMode.enabled && (
            <span className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded">
              Active
            </span>
          )}
        </div>

        <Switch
          checked={yoloMode.enabled}
          onCheckedChange={handleToggle}
          className={`yolo-switch ${yoloMode.enabled ? 'yolo-switch-active' : ''}`}
        />
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-2">
        Bypass all tool approval prompts. Auto-disables after 24 hours.
      </p>

      {/* Warning when active */}
      {yoloMode.enabled && timeRemaining && (
        <div className="p-2 bg-warning/10 border border-warning/30 rounded mb-2">
          <p className="text-xs text-warning mb-1">
            ⚠️ All tools will execute without approval!
          </p>
          <p className="text-xs text-muted-foreground">
            Expires in: {timeRemaining}
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-overlay)] z-50 p-4">
          <div className="bg-card border border-warning/50 rounded-lg p-4 max-w-sm w-full">
            <h3 className="text-lg font-pixel text-warning mb-2">
              ⚡ Enable YOLO Mode?
            </h3>
            <p className="text-sm text-foreground mb-4">
              This will allow all tools to execute without your approval. Are you sure?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEnable}
                className="px-3 py-1.5 text-sm bg-secondary hover:bg-muted rounded border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEnable}
                className="px-3 py-1.5 text-sm bg-warning hover:bg-warning/90 text-warning-foreground rounded font-bold"
              >
                Enable YOLO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8-bit styled switch */}
      <style>{`
        .yolo-switch {
          width: 44px;
          height: 24px;
          background: #374151;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }
        .yolo-switch-active {
          background: #eab308;
        }
        .yolo-switch[data-state="checked"] {
          background: #eab308;
        }
        .yolo-switch::before {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: transform 0.2s;
        }
        .yolo-switch[data-state="checked"]::before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
}
