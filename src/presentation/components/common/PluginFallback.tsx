/**
 * @fileoverview PluginFallback Component - Graceful fallback UI for unsupported plugins
 * @module presentation/components/common/PluginFallback
 *
 * **EPIC-0.6-10**: Graceful Device Fallback
 *
 * Shows a friendly message when a plugin is not available on the current device.
 * Used by PluginRenderer to display fallback instead of broken UI.
 *
 * @epic EPIC-0.6
 * @story 0.6-10
 * @team Team A
 * @created 2026-01-27
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Monitor, Smartphone, Tablet, HardDrive, Puzzle } from 'lucide-react';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Types
// ============================================================================

/**
 * Fallback reason types
 */
export type FallbackReason = 'no-desktop' | 'no-fsa' | 'requires-plugin' | 'unsupported';

/**
 * PluginFallback Props
 */
export interface PluginFallbackProps {
  /** Plugin ID that is unavailable */
  pluginId: PluginId;

  /** Reason why plugin is unavailable */
  reason: FallbackReason;

  /** Suggested action text (optional) */
  suggestedAction?: string;
}

// ============================================================================
// Icon Map
// ============================================================================

const REASON_ICONS: Record<FallbackReason, React.ReactNode> = {
  'no-desktop': <Monitor size={32} className="text-muted-foreground/70" />,
  'no-fsa': <HardDrive size={32} className="text-muted-foreground/70" />,
  'requires-plugin': <Puzzle size={32} className="text-muted-foreground/70" />,
  'unsupported': <AlertCircle size={32} className="text-muted-foreground/70" />,
};

// ============================================================================
// Component
// ============================================================================

/**
 * PluginFallback Component
 *
 * @param props - PluginFallbackProps
 * @returns Fallback UI JSX element
 *
 * @remarks
 * 8-bit design compliant:
 * - Sharp corners (border-radius: 0)
 * - Solid backgrounds
 * - No glassmorphism
 *
 * i18n support:
 * - All text uses translation keys
 * - Falls back to English if key not found
 */
export function PluginFallback({ pluginId, reason, suggestedAction }: PluginFallbackProps) {
  const { t } = useTranslation();

  // Get localized strings
  const pluginName = t(`plugin.${pluginId}.name`, pluginId);
  const reasonText = t(`plugin.fallback.${reason}`, getDefaultReasonText(reason));
  const title = t(`plugin.${pluginId}.unavailable`, `${pluginName} unavailable`);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-6 bg-card/50">
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 bg-muted/50 border border-border rounded-none">
        {REASON_ICONS[reason]}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground text-center">
        {title}
      </h3>

      {/* Reason */}
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {reasonText}
      </p>

      {/* Device indicators */}
      <div className="flex items-center gap-3 text-muted-foreground/50">
        <div className="flex items-center gap-1 text-xs">
          <Monitor size={14} />
          <span>{t('plugin.fallback.desktopOnly', 'Desktop')}</span>
        </div>
        <span className="text-muted-foreground/30">|</span>
        <div className="flex items-center gap-1 text-xs opacity-50">
          <Tablet size={14} />
          <span>{t('plugin.fallback.tablet', 'Tablet')}</span>
        </div>
        <span className="text-muted-foreground/30">|</span>
        <div className="flex items-center gap-1 text-xs opacity-50">
          <Smartphone size={14} />
          <span>{t('plugin.fallback.mobile', 'Mobile')}</span>
        </div>
      </div>

      {/* Suggested action */}
      {suggestedAction && (
        <p className="text-xs text-primary/80 text-center mt-2">
          {suggestedAction}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get default reason text (fallback if i18n key not found)
 */
function getDefaultReasonText(reason: FallbackReason): string {
  switch (reason) {
    case 'no-desktop':
      return 'This plugin is only available on desktop devices.';
    case 'no-fsa':
      return 'This plugin requires File System Access which is not available on this device.';
    case 'requires-plugin':
      return 'This plugin requires another plugin to be enabled.';
    case 'unsupported':
    default:
      return 'This plugin is not available on your current device.';
  }
}

// ============================================================================
// Export
// ============================================================================

export default PluginFallback;
