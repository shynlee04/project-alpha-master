/**
 * @fileoverview Layout Validation Helpers
 * @module infrastructure/persistence/stores/layout/layout-validation-helpers
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * Helper functions for layout state validation
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

import type { PluginId } from '@/domain/types/plugin-types';
import type { PersistedActivityBarState } from './layout-types';

/**
 * Validate a plugin ID
 */
export function isValidPluginId(id: unknown): id is PluginId {
  return typeof id === 'string' && id.length > 0;
}

/**
 * Result of single bar validation
 */
export interface SingleBarValidationResult {
  valid: boolean;
  errors: string[];
  validatedBar: PersistedActivityBarState;
}

/**
 * Validate single activity bar state
 */
export function validateSingleBarState(state: unknown): SingleBarValidationResult {
  const errors: string[] = [];
  const defaultBar: PersistedActivityBarState = { plugins: [], activePluginId: null };

  if (!state || typeof state !== 'object') {
    return { valid: false, errors: ['Activity bar state must be an object'], validatedBar: defaultBar };
  }

  const s = state as Record<string, unknown>;

  // Validate plugins array
  let validPlugins: PluginId[] = [];
  if (!Array.isArray(s.plugins)) {
    errors.push('plugins must be an array');
  } else {
    validPlugins = s.plugins.filter((p): p is PluginId => isValidPluginId(p));
    if (validPlugins.length !== s.plugins.length) {
      errors.push(`Removed ${s.plugins.length - validPlugins.length} invalid plugin IDs`);
    }
    if (validPlugins.length > 3) {
      errors.push(`Truncated plugins from ${validPlugins.length} to 3`);
      validPlugins = validPlugins.slice(0, 3);
    }
  }

  // Validate activePluginId
  let activePluginId: PluginId | null = null;
  if (s.activePluginId !== null && !isValidPluginId(s.activePluginId)) {
    errors.push('activePluginId must be a string or null');
  } else {
    activePluginId = s.activePluginId as PluginId | null;
  }

  // Ensure active plugin is in the plugins list
  if (activePluginId && !validPlugins.includes(activePluginId)) {
    errors.push('activePluginId not in plugins list, using first plugin');
    activePluginId = validPlugins[0] || null;
  }

  return {
    valid: errors.length === 0,
    errors,
    validatedBar: { plugins: validPlugins, activePluginId },
  };
}
