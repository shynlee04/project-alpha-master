/**
 * @fileoverview AddPluginDialog - Dialog for adding plugins to layout
 * @module presentation/layouts/AddPluginDialog
 *
 * **CC-AR-08**: Extracted from PluginLayout.tsx (god component split)
 *
 * Modal dialog for selecting and adding available plugins.
 * Renders list of plugins that are available but not active.
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-08
 * @team Team B
 * @created 2026-01-26
 */

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PluginId } from '@/domain/types/plugin-types';
import type { FeaturePlugin } from '@/domain/interfaces/feature-plugin.interface';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * AddPluginDialog Props
 */
export interface AddPluginDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Available plugins that are not currently active */
  availablePluginsNotActive: FeaturePlugin[];
  /** Callback when a plugin is selected to add */
  onAddPlugin: (pluginId: PluginId) => void;
  /** Callback when dialog is closed */
  onClose: () => void;
}

// ============================================================================
// AddPluginDialog Component
// ============================================================================

/**
 * AddPluginDialog Component
 *
 * @returns Dialog JSX element or null if not open
 *
 * @remarks
 * - Modal overlay with plugin selection
 * - 8-bit design (sharp corners, pixel shadows)
 * - Lists available plugins not already active
 * - Closes on backdrop click or close button
 */
export function AddPluginDialog({
  isOpen,
  availablePluginsNotActive,
  onAddPlugin,
  onClose,
}: AddPluginDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-none shadow-[4px_4px_0_0] max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t('plugin.addPlugin')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-none bg-transparent text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1"
          >
            ×
          </button>
        </div>

        {/* Plugin List */}
        <div className="max-h-96 overflow-auto">
          {availablePluginsNotActive.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('plugin.allPluginsActive')}
            </p>
          ) : (
            <div className="space-y-2">
              {availablePluginsNotActive.map((plugin) => (
                <button
                  key={plugin.id}
                  onClick={() => onAddPlugin(plugin.id)}
                  className="w-full rounded-none bg-muted/10 text-left p-4 hover:bg-muted/20 border border-border/30 flex items-center gap-3 transition-colors"
                >
                  <div className="shrink-0">{plugin.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">
                      {plugin.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {plugin.description}
                    </div>
                  </div>
                  <Plus size={18} className="text-blue-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// No additional exports - AddPluginDialog exported above
// ============================================================================
