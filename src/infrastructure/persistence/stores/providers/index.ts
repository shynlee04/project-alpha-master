/**
 * Providers Store Facade - Backward Compatibility
 *
 * Re-exports from the unified provider slices (split into 3 for maintainability).
 * Exports slice creators for use in use-app-store single bounded store.
 *
 * @module providers/index
 * @story AC-1.6 - Create provider slices
 */

// Export types
export type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderState,
} from './types';

// Export slice creators (for use in use-app-store)
// Split into 3 slices to meet 300-line limit from sweeping-validation.md
export { createProviderCrudSlice } from './provider-crud-slice';
export { createProviderModelsSlice } from './provider-models-slice';
export { createProviderUtilsSlice } from './provider-utils-slice';

// TODO: Export from use-app-store once single bounded store is fully integrated
// export { useAppStore } from '../use-app-store';
