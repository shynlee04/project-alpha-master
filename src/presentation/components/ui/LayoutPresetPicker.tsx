/**
 * @fileoverview Layout Preset Picker - Dropdown to select layouts
 * @module presentation/components/ui/LayoutPresetPicker
 *
 * **ARCH-03-03**: Layout Presets System
 *
 * Provides a dropdown menu for users to select layout presets (built-in or custom).
 * Includes option to save custom layouts and delete custom presets.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-03
 * @team Team A
 * @created 2026-01-23
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Save, Trash2, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useShallow } from 'zustand/react/shallow';
import { useLayoutPresetsStore, type LayoutPreset } from '@/infrastructure/persistence/stores/layout-presets-store';
import { useAdvancedLayouts } from '@/infrastructure/persistence/stores/user-preferences-store';
import { SavePresetDialog } from './SavePresetDialog';
import { useBreakpoint } from '@/presentation/layouts/useBreakpoint';
import { Button } from '@/presentation/components/ui/button';

// ============================================================================
// Component Props
// ============================================================================

/**
 * Layout Preset Picker Props
 * / Props Chọn Preset Layout
 */
export interface LayoutPresetPickerProps {
  currentPresetId?: string;
}

// ============================================================================
// LayoutPresetPicker Component
// ============================================================================

/**
 * Layout Preset Picker Component
 * / Component Chọn Preset Layout
 *
 * @remarks
 * - Dropdown menu for selecting layout presets
 * - Shows all presets (built-in + custom for current project)
 * - Active preset highlighted (checkmark or bold)
 * - Built-in presets: NOT deletable
 * - Custom presets: Show delete button
 * - "Save Custom Layout" option at bottom
 * - 8-bit design compliant: sharp corners, pixel shadows, solid colors
 * - Hidden on mobile (< 768px)
 */
export function LayoutPresetPicker() {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();

  const { presets, loadPreset, deletePreset, activePresetId } = useLayoutPresetsStore(
    useShallow((state) => ({
      presets: state.presets,
      loadPreset: state.loadPreset,
      deletePreset: state.deletePreset,
      activePresetId: state.activePresetId,
    }))
  );

  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false);

  // ARCH-03-05: Advanced layouts toggle
  const { showAdvanced, toggle } = useAdvancedLayouts();

  /**
   * Handle preset selection
   * / Xử lý khi chọn preset
   */
  const handlePresetSelect = (preset: LayoutPreset) => {
    loadPreset(preset.id);
  };

  /**
   * Handle custom preset deletion
   * / Xử lý khi xóa preset tùy chỉnh
   */
  const handleDeletePreset = (e: React.MouseEvent, preset: LayoutPreset) => {
    e.stopPropagation();
    if (confirm(t('layoutPresets.picker.confirmDelete', { name: preset.name }))) {
      deletePreset(preset.id);
    }
  };

  /**
   * Handle save custom layout button click
   * / Xử lý khi nhấn nút lưu layout tùy chỉnh
   */
  const handleSaveCustomLayout = () => {
    setIsSaveDialogOpen(true);
  };

  /**
   * Handle save dialog close
   * / Xử lý khi đóng dialog lưu
   */
  const handleSaveDialogClose = () => {
    setIsSaveDialogOpen(false);
  };

  /**
   * Check if preset is active
   * / Kiểm tra preset có hoạt động không
   */
  const isPresetActive = (preset: LayoutPreset): boolean => {
    return preset.id === activePresetId;
  };

  // Hide on mobile (< 768px)
  if (breakpoint === 'mobile' || breakpoint === 'mobileLg') {
    return null;
  }

  // Filter presets for current project (built-ins + custom)
  // ARCH-03-05: Filter based on advanced layouts preference
  const currentProjectPresets = presets.filter((preset) => {
    // Always show built-in presets that are simple (writing, focus)
    // Always show custom presets
    // Only show advanced built-in presets (coding) when showAdvanced is true
    const isSimpleBuiltIn = preset.isBuiltIn && (preset.id === 'preset-writing' || preset.id === 'preset-focus');
    const isCustom = !preset.isBuiltIn;
    const isAdvancedBuiltIn = preset.isBuiltIn && preset.id === 'preset-coding';

    return isSimpleBuiltIn || isCustom || (showAdvanced && isAdvancedBuiltIn);
  });

  return (
    <>
      {/* Preset Picker Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" className="flex items-center gap-2 min-w-[180px]">
            <Layout size={16} />
            <span className="flex-1 text-left">
              {activePresetId
                ? presets.find(p => p.id === activePresetId)?.name || t('layoutPresets.picker.custom')
                : t('layoutPresets.picker.custom')}
            </span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          className="bg-gray-50 border-2 border-black shadow-4 min-w-[250px] z-50"
          align="end"
          sideOffset={4}
        >
          <div className="py-1">
            {/* Preset List */}
            {currentProjectPresets.map((preset) => (
              <DropdownMenu.Item
                key={preset.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-200 cursor-pointer border-0 bg-transparent"
                onClick={() => handlePresetSelect(preset)}
              >
                {/* Preset Name */}
                <span className="flex items-center gap-2 flex-1">
                  {/* Checkmark for active preset */}
                  {isPresetActive(preset) && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                  <span className={isPresetActive(preset) ? 'font-bold text-gray-900' : 'text-gray-700'}>
                    {preset.name}
                  </span>
                </span>

                {/* Delete button for custom presets */}
                {!preset.isBuiltIn && (
                  <button
                    className="p-1 hover:bg-red-100 transition-colors border-0 bg-transparent text-red-600"
                    onClick={(e) => handleDeletePreset(e, preset)}
                    aria-label={t('layoutPresets.picker.delete', { name: preset.name })}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </DropdownMenu.Item>
            ))}

            {/* Divider */}
            <div className="border-t-2 border-black my-1" />

            {/* Save Custom Layout Option */}
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 cursor-pointer border-0 bg-transparent"
              onClick={handleSaveCustomLayout}
            >
              <Save size={16} />
              <span className="font-semibold text-gray-900">
                {t('layoutPresets.picker.saveCustomLayout')}
              </span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
       </DropdownMenu.Root>

       {/* ARCH-03-05: More Layouts Toggle Button */}
       <button
         onClick={toggle}
         className="ml-2 text-xs text-gray-600 hover:text-black transition-colors px-2 py-1 border-2 border-gray-300 bg-gray-50"
       >
         {showAdvanced
           ? t('layoutPresets.hideAdvanced')
           : t('layoutPresets.showAdvanced')}
       </button>

       {/* Save Preset Dialog */}
       <SavePresetDialog
        isOpen={isSaveDialogOpen}
        onClose={handleSaveDialogClose}
      />
    </>
  );
}

// ============================================================================
// Keyboard Shortcuts Hook
// ============================================================================

/**
 * Layout Presets Keyboard Shortcuts Hook
 * / Hook Phím tắt Presets Layout
 *
 * @remarks
 * - Cmd+1: Load Coding preset
 * - Cmd+2: Load Writing preset
 * - Cmd+3: Load Focus preset
 * - Prevents default browser behavior
 */
export function useLayoutShortcuts() {
  const { loadPreset } = useLayoutPresetsStore(
    useShallow((state) => ({
      loadPreset: state.loadPreset,
    }))
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+1 (Coding preset)
      if (e.metaKey && e.key === '1') {
        e.preventDefault();
        loadPreset('preset-coding');
      }
      // Cmd+2 (Writing preset)
      else if (e.metaKey && e.key === '2') {
        e.preventDefault();
        loadPreset('preset-writing');
      }
      // Cmd+3 (Focus preset)
      else if (e.metaKey && e.key === '3') {
        e.preventDefault();
        loadPreset('preset-focus');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadPreset]);
}

// ============================================================================
// No additional exports - component already exported above
// ============================================================================
