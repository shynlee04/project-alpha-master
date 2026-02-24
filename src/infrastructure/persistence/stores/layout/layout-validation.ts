/**
 * @fileoverview Layout State Validation
 * @module infrastructure/persistence/stores/layout/layout-validation
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * State validation functions for layout persistence
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

import type { PluginId } from '@/domain/types/plugin-types';
import type { LayoutValidationResult } from './layout-types';
import {
  DEFAULT_LAYOUT_STATE,
  DEFAULT_ACTIVITY_BARS_STATE,
  DEFAULT_SIDEBAR_STATE,
} from './layout-constants';
import { validateSingleBarState } from './validation-helpers';

/**
 * Validate activity bar state
 */
export function validateActivityBarState(state: unknown): LayoutValidationResult {
  return validateSingleBarState(state);
}

/**
 * Validate sidebar state
 */
export function validateSidebarState(state: unknown): LayoutValidationResult {
  const errors: string[] = [];

  if (!state || typeof state !== 'object') {
    return { valid: false, errors: ['Sidebar state must be an object'] };
  }

  const s = state as Record<string, unknown>;

  if (typeof s.isExpanded !== 'boolean') {
    errors.push('isExpanded must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedState: {
      ...DEFAULT_LAYOUT_STATE,
      sidebar: {
        isExpanded: typeof s.isExpanded === 'boolean' ? s.isExpanded : true,
      },
    },
  };
}

/**
 * Validate complete layout state
 */
export function validateLayoutState(state: unknown): LayoutValidationResult {
  const errors: string[] = [];

  if (!state || typeof state !== 'object') {
    return {
      valid: false,
      errors: ['Layout state must be an object'],
      sanitizedState: DEFAULT_LAYOUT_STATE,
    };
  }

  const s = state as Record<string, unknown>;

  // Validate version and projectId
  if (typeof s.version !== 'number') errors.push('version must be a number');
  if (typeof s.projectId !== 'string') errors.push('projectId must be a string');

  // Validate activityBars
  let validatedActivityBars = DEFAULT_ACTIVITY_BARS_STATE;
  if (!s.activityBars || typeof s.activityBars !== 'object') {
    errors.push('activityBars must be an object');
  } else {
    const bars = s.activityBars as Record<string, unknown>;
    const leftResult = validateSingleBarState(bars.left || {});
    const mainTopResult = validateSingleBarState(bars.mainTop || {});
    const rightResult = validateSingleBarState(bars.right || {});

    errors.push(...leftResult.errors, ...mainTopResult.errors, ...rightResult.errors);

    validatedActivityBars = {
      left: leftResult.validatedBar,
      mainTop: mainTopResult.validatedBar,
      right: rightResult.validatedBar,
    };
  }

  // Validate sidebar
  let validatedSidebar = DEFAULT_SIDEBAR_STATE;
  if (!s.sidebar || typeof s.sidebar !== 'object') {
    errors.push('sidebar must be an object');
  } else {
    const sidebarResult = validateSidebarState(s.sidebar);
    errors.push(...sidebarResult.errors);
    validatedSidebar = sidebarResult.sanitizedState?.sidebar || DEFAULT_SIDEBAR_STATE;
  }

  // Check for duplicate plugins
  const allPlugins = new Set<PluginId>();
  const duplicates: PluginId[] = [];
  (['left', 'mainTop', 'right'] as const).forEach((barKey) => {
    validatedActivityBars[barKey].plugins.forEach((pluginId) => {
      if (allPlugins.has(pluginId)) duplicates.push(pluginId);
      else allPlugins.add(pluginId);
    });
  });

  if (duplicates.length > 0) {
    errors.push(`Duplicate plugins found: ${duplicates.join(', ')}`);
    const seen = new Set<PluginId>();
    (['left', 'mainTop', 'right'] as const).forEach((barKey) => {
      validatedActivityBars[barKey].plugins = validatedActivityBars[barKey].plugins.filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedState: {
      version: typeof s.version === 'number' ? s.version : 1,
      projectId: typeof s.projectId === 'string' ? s.projectId : '',
      activityBars: validatedActivityBars,
      sidebar: validatedSidebar,
    },
  };
}
