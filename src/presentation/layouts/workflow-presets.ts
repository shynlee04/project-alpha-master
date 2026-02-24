/**
 * @fileoverview Workflow-Based Layout Presets with Fixed CSS Grid Ratios
 * @module presentation/layouts/workflow-presets
 *
 * **Phase 1**: Replace Resizable with Fixed-Ratio CSS Grid Presets
 *
 * Provides predefined layout presets based on USE CASES, not plugin counts.
 * All ratios are FIXED - no user resizing allowed.
 *
 * Key Changes from layout-presets.ts:
 * - Use-case based instead of plugin-count based
 * - Fixed CSS Grid ratios (gridTemplateColumns)
 * - NO resizable panels
 *
 * @created 2026-01-27
 * @team Team A
 */

import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Workflow Preset Types
// ============================================================================

/**
 * Available workflow preset IDs
 *
 * @remarks
 * - default: Chat + FileTree + Note (3:2:5 ratio)
 * - focus: Chat + FileTree (7:3 ratio) - Agent-focused mode
 * - code: FileTree + Monaco + Preview (2:5:3 ratio) - Development layout
 * - full-editor: Monaco only (100%) - Deep coding mode
 */
export type WorkflowPreset = 'default' | 'focus' | 'code' | 'full-editor';

/**
 * Panel configuration within a preset
 */
export interface PresetConfig {
  /** Unique preset identifier */
  id: WorkflowPreset;

  /** Human-readable label for UI */
  label: string;

  /** i18n key for label */
  labelKey: string;

  /** Ordered list of panel plugin IDs */
  panels: PluginId[];

  /** CSS grid-template-columns value (e.g., '3fr 2fr 5fr') */
  gridTemplate: string;

  /** Human-readable description */
  description: string;

  /** i18n key for description */
  descriptionKey: string;
}

// ============================================================================
// Workflow Presets Definition
// ============================================================================

/**
 * Predefined workflow presets with FIXED ratios
 *
 * @remarks
 * Per Layout Architecture Specification:
 * - No user resizing allowed
 * - Ratios are fixed per preset
 * - User selects preset from dropdown, panels auto-arrange
 *
 * Ratio Reference:
 * - 3fr = 30%, 2fr = 20%, 5fr = 50% (totals 10fr = 100%)
 * - 7fr = 70%, 3fr = 30% (totals 10fr = 100%)
 */
export const WORKFLOW_PRESETS: Record<WorkflowPreset, PresetConfig> = {
  default: {
    id: 'default',
    label: 'Default',
    labelKey: 'layout.preset.default',
    panels: ['chat', 'filetree', 'notes'] as PluginId[],
    gridTemplate: '3fr 2fr 5fr', // 30%, 20%, 50%
    description: 'Chat + FileTree + Note editor',
    descriptionKey: 'layout.preset.defaultDescription',
  },

  focus: {
    id: 'focus',
    label: 'Focus',
    labelKey: 'layout.preset.focus',
    panels: ['chat', 'filetree'] as PluginId[],
    gridTemplate: '7fr 3fr', // 70%, 30%
    description: 'Agent-focused mode',
    descriptionKey: 'layout.preset.focusDescription',
  },

  code: {
    id: 'code',
    label: 'Code',
    labelKey: 'layout.preset.code',
    panels: ['filetree', 'monaco', 'preview'] as PluginId[],
    gridTemplate: '2fr 5fr 3fr', // 20%, 50%, 30%
    description: 'Development layout',
    descriptionKey: 'layout.preset.codeDescription',
  },

  'full-editor': {
    id: 'full-editor',
    label: 'Full Editor',
    labelKey: 'layout.preset.fullEditor',
    panels: ['monaco'] as PluginId[],
    gridTemplate: '1fr', // 100%
    description: 'Maximized editor',
    descriptionKey: 'layout.preset.fullEditorDescription',
  },
};

// ============================================================================
// Mobile Presets (2 tabs only)
// ============================================================================

/**
 * Mobile-specific presets with only 2 tabs
 *
 * @remarks
 * Per Layout Architecture Specification:
 * - Mobile shows only 2 plugins in tabs
 * - Swipe navigation between tabs
 */
export const MOBILE_PRESETS: Record<'default' | 'code', PluginId[]> = {
  default: ['chat', 'notes'] as PluginId[],
  code: ['filetree', 'monaco'] as PluginId[],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get preset configuration by ID
 *
 * @param presetId - Preset ID to look up
 * @returns PresetConfig or default preset if not found
 */
export function getPresetConfig(presetId: WorkflowPreset): PresetConfig {
  return WORKFLOW_PRESETS[presetId] ?? WORKFLOW_PRESETS.default;
}

/**
 * Get all available preset options for dropdown
 *
 * @returns Array of PresetConfig for all presets
 */
export function getAllPresets(): PresetConfig[] {
  return Object.values(WORKFLOW_PRESETS);
}

/**
 * Get the default preset ID for a given device type
 *
 * @param isMobile - Whether the device is mobile
 * @returns Default preset ID
 */
export function getDefaultPresetForDevice(isMobile: boolean): WorkflowPreset {
  return isMobile ? 'focus' : 'default';
}

// ============================================================================
// Exports
// ============================================================================

export default WORKFLOW_PRESETS;
