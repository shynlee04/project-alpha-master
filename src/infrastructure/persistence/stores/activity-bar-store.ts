/**
 * @fileoverview Activity Bar Store - Re-export for backward compatibility
 * @module infrastructure/persistence/stores/activity-bar-store
 *
 * @deprecated Use '@/infrastructure/persistence/stores/activity-bar' instead
 * This file is kept for backward compatibility during migration.
 */

export {
  useActivityBarStore,
  selectLeftBar,
  selectMainTopBar,
  selectRightBar,
  selectHasHydrated,
  selectIsPluginActiveAnywhere,
  selectPluginBar,
  selectIsBarFull,
} from './activity-bar';
