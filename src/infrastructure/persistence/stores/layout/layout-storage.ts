/**
 * @fileoverview Layout Storage Helpers
 * @module infrastructure/persistence/stores/layout/layout-storage
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * Storage helper functions for layout persistence
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

import type { PersistedLayoutState } from './layout-types';
import { validateLayoutState } from './layout-validation';
import { migrateLayoutState } from './layout-migration';
import {
  LAYOUT_STATE_VERSION,
  LAYOUT_STORAGE_KEY_PREFIX,
  DEFAULT_LAYOUT_STORAGE_KEY,
  DEFAULT_LAYOUT_STATE,
} from './layout-constants';

/**
 * Get storage key for a project
 */
export function getLayoutStorageKey(projectId?: string): string {
  if (!projectId || projectId === 'default') {
    return DEFAULT_LAYOUT_STORAGE_KEY;
  }
  return `${LAYOUT_STORAGE_KEY_PREFIX}-${projectId}`;
}

/**
 * Clear all layout state from localStorage
 */
export function clearLayoutState(projectId?: string): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    if (projectId) {
      localStorage.removeItem(getLayoutStorageKey(projectId));
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(LAYOUT_STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('[layout-persistence] Failed to clear layout state:', error);
  }
}

/**
 * Load and validate layout state from localStorage
 */
export function loadLayoutState(projectId?: string): PersistedLayoutState | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const key = getLayoutStorageKey(projectId);
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    // Check version and migrate if needed
    const version = typeof parsed.version === 'number' ? parsed.version : 0;
    if (version !== LAYOUT_STATE_VERSION) {
      const migration = migrateLayoutState(parsed, version);
      return migration.state;
    }

    // Validate current version
    const validation = validateLayoutState(parsed);
    return validation.sanitizedState || DEFAULT_LAYOUT_STATE;
  } catch (error) {
    console.error('[layout-persistence] Failed to load layout state:', error);
    return null;
  }
}

/**
 * Save layout state to localStorage
 */
export function saveLayoutState(state: PersistedLayoutState, projectId?: string): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    const key = getLayoutStorageKey(projectId);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('[layout-persistence] Failed to save layout state:', error);
  }
}
