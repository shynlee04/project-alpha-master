/**
 * Provider Store Facade - Backward Compatibility
 *
 * Direct re-export of the unified app store (use-app-store.ts).
 * Maintains zero breaking changes for existing code.
 *
 * This file replaces the original 267-line provider-store implementation
 * with a simple re-export facade.
 *
 * CRITICAL: Must be a function re-export, not an object wrapper!
 * The store is used as useProviderStore(selector) in components.
 *
 * @module lib/state/provider-store
 * @story AC-1.8 - Create facade re-exports
 * @migration Migrated from standalone store (267 lines) to facade (direct re-export)
 */

import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

// ============================================================================
// FACADE - Direct Function Re-export
// ============================================================================

/**
 * Provider Store Facade
 *
 * Direct re-export of useAppStore as useProviderStore.
 * This maintains backward compatibility for all existing imports.
 *
 * @example
 * // Old import (still works)
 * import { useProviderStore } from '@/infrastructure/persistence/stores/use-app-store';
 * const providers = useProviderStore((state) => state.providers);
 *
 * // New import (recommended for new code)
 * import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
 * const providers = useAppStore((state) => state.providers);
 */
export const useProviderStore = useAppStore;

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

export type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderState,
} from '@/infrastructure/persistence/stores/providers/types';

// Re-export from core
export type { Agent } from '@/core/entities/Agent';

// ============================================================================
// DEFAULT EXPORT (for compatibility)
// ============================================================================

export default useAppStore;
