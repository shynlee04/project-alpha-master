/**
 * @fileoverview Save Preset Dialog - Modal for saving custom layout presets
 * @module presentation/components/ui/SavePresetDialog
 *
 * **ARCH-03-03**: Layout Presets System
 *
 * Provides a dialog modal for users to save custom layout presets.
 * Includes name input with validation and displays current layout info.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-03
 * @team Team A
 * @created 2026-01-23
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { useShallow } from 'zustand/react/shallow';
import { useLayoutPresetsStore } from '@/infrastructure/persistence/stores/layout-presets-store';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { Button } from '@/presentation/components/ui/button';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Component Props
// ============================================================================

/**
 * Save Preset Dialog Props
 * / Props Dialog Lưu Preset
 */
export interface SavePresetDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
}

// ============================================================================
// Helper Function: Get Current Project ID
// ============================================================================

/**
 * Get current project ID from localStorage
 * / Lấy ID dự án hiện tại từ localStorage
 *
 * @remarks
 * - Reads project ID from project store's storage
 * - Returns undefined if no active project
 * - Used to verify project context before saving
 */
function getCurrentProjectId(): string | undefined {
  try {
    const projectStoreKey = 'project-storage';
    const projectData = localStorage.getItem(projectStoreKey);
    if (!projectData) return undefined;

    const parsed = JSON.parse(projectData);
    return parsed.state?.activeProjectId || undefined;
  } catch (error) {
    console.warn('[SavePresetDialog] Failed to read current project ID:', error);
    return undefined;
  }
}

// ============================================================================
// SavePresetDialog Component
// ============================================================================

/**
 * Save Preset Dialog Component
 * / Component Dialog Lưu Preset
 *
 * @remarks
 * - Radix UI Dialog for modal overlay and content
 * - Name input field with validation (required, max 50 chars)
 * - Displays current layout info (plugins, mode, panels)
 * - Save button disabled when name is empty
 * - On save: calls layoutPresetsStore.savePreset() with current layout
 * - 8-bit design: sharp corners, pixel shadows, solid colors
 * - i18n support for all user-facing strings
 * - Closes dialog on save, cancel, or backdrop click
 */
export function SavePresetDialog({ isOpen, onClose }: SavePresetDialogProps) {
  const { t } = useTranslation();

  // Get current layout from PluginLayoutStore
  const { activePlugins, layoutMode, panelSizes } = usePluginLayoutStore(
    useShallow((state) => ({
      activePlugins: state.activePlugins,
      layoutMode: state.layoutMode,
      panelSizes: state.panelSizes,
    }))
  );

  // Get savePreset action from layoutPresetsStore
  const { savePreset } = useLayoutPresetsStore(
    useShallow((state) => ({
      savePreset: state.savePreset,
    }))
  );

  // Name input state
  const [name, setName] = useState('');

  // Validation errors
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  /**
   * Validate preset name
   * / Kiểm tra tên preset
   *
   * @remarks
   * - Name cannot be empty
   * - Name max 50 characters
   */
  const validateName = (value: string): boolean => {
    const trimmed = value.trim();

    if (trimmed === '') {
      setError(t('layoutPresets.saveDialog.error.emptyName'));
      return false;
    }

    if (trimmed.length > 50) {
      setError(t('layoutPresets.saveDialog.error.nameTooLong'));
      return false;
    }

    setError('');
    return true;
  };

  /**
   * Handle name input change
   * / Xử lý khi thay đổi tên
   *
   * @param value - New name value
   */
  const handleNameChange = (value: string) => {
    setName(value);
    if (error) validateName(value);
  };

  /**
   * Handle save button click
   * / Xử lý khi nhấn nút lưu
   *
   * @remarks
   * - Validates name
   * - Gets current project ID
   * - Calls layoutPresetsStore.savePreset()
   * - Closes dialog on success
   */
  const handleSave = () => {
    if (!validateName(name)) return;

    const projectId = getCurrentProjectId();
    if (!projectId) {
      console.warn('[SavePresetDialog] Cannot save preset: no active project');
      return;
    }

    savePreset(name.trim(), activePlugins, layoutMode, panelSizes);
    onClose();
  };

  /**
   * Handle cancel button click
   * / Xử lý khi nhấn nút hủy
   */
  const handleCancel = () => {
    onClose();
  };

  /**
   * Handle dialog close (X button or backdrop)
   * / Xử lý khi đóng dialog
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // Get plugin display names
  const getPluginDisplayName = (pluginId: PluginId): string => {
    const pluginNames: Record<PluginId, string> = {
      filetree: t('plugins.fileTree.name', { defaultValue: 'File Tree' }),
      monaco: t('plugins.monaco.name', { defaultValue: 'Editor' }),
      terminal: t('plugins.terminal.name', { defaultValue: 'Terminal' }),
      chat: t('plugins.chat.name', { defaultValue: 'AI Chat' }),
      notes: t('plugins.notes.name', { defaultValue: 'Notes' }),
      agents: t('plugins.agents.name', { defaultValue: 'Agents' }),
      preview: t('plugins.preview.name', { defaultValue: 'Preview' }),
    };
    return pluginNames[pluginId] || pluginId;
  };

  // Get layout mode display name
  const getLayoutModeName = (): string => {
    const modeNames: Record<string, string> = {
      '1-column': t('layoutModes.singleColumn', { defaultValue: '1 Column' }),
      '2-column': t('layoutModes.twoColumns', { defaultValue: '2 Columns' }),
      '3-column': t('layoutModes.threeColumns', { defaultValue: '3 Columns' }),
      '2+1': t('layoutModes.twoPlusOne', { defaultValue: '2+1 (Split)' }),
    };
    return modeNames[layoutMode] || layoutMode;
  };

  // Disable save button if name is empty or has error
  const isSaveDisabled = name.trim() === '' || error !== '';

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {/* 8-bit overlay: solid dark background, no blur */}
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

      <Dialog.Portal>
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* 8-bit dialog content: sharp corners, solid colors, pixel shadows */}
          <div className="bg-gray-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] rounded-none">
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                {t('layoutPresets.saveDialog.title')}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" iconOnly className="h-8 w-8 min-h-[32px] min-w-[32px]">
                  ✕
                </Button>
              </Dialog.Close>
            </div>

            {/* Dialog Body */}
            <div className="p-4">
              {/* Current Layout Info */}
              <div className="mb-4 p-3 bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]">
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  {t('layoutPresets.saveDialog.currentLayout')}
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  {/* Plugins */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t('layoutPresets.saveDialog.plugins')}:
                    </span>
                    <span className="font-medium">
                      {activePlugins.map((p) => getPluginDisplayName(p)).join(', ')}
                    </span>
                  </div>
                  {/* Layout Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t('layoutPresets.saveDialog.layoutMode')}:
                    </span>
                    <span className="font-medium">{getLayoutModeName()}</span>
                  </div>
                  {/* Panel Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t('layoutPresets.saveDialog.panelCount')}:
                    </span>
                    <span className="font-medium">{activePlugins.length}</span>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-4">
                <label
                  htmlFor="preset-name"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  {t('layoutPresets.saveDialog.nameLabel')}
                </label>
                <input
                  id="preset-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t('layoutPresets.saveDialog.namePlaceholder')}
                  maxLength={50}
                  className={`
                    w-full px-3 py-2 border-2 border-black
                    bg-white text-gray-900 placeholder-gray-500
                    rounded-none shadow-none
                    focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                    ${error ? 'border-red-600' : 'border-black'}
                  `}
                />
                {error && (
                  <div className="mt-1 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t-2 border-black">
              {/* Cancel Button */}
              <Button variant="secondary" onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
              {/* Save Button */}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaveDisabled}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
