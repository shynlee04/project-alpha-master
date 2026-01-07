/**
 * Providers Store Facade - Backward Compatibility
 *
 * Re-exports from the unified provider slices (split into 4 for maintainability).
 * Exports slice creators for use in use-app-store single bounded store.
 *
 * @module providers/index
 * @story AC-1.6 - Create provider slices
 * @story A-4 - BYOK Vault Integration (added credentials slice)
 */

// Export types
export type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderState,
} from './types';

// Export vault integration types
export type {
  ProviderKeyMetadata,
  KeyValidationResult,
} from './provider-credentials-slice';

// Export slice creators (for use in use-app-store)
// Split into 4 slices to meet 300-line limit from sweeping-validation.md
export { createProviderCrudSlice } from './provider-crud-slice';
export { createProviderModelsSlice } from './provider-models-slice';
export { createProviderUtilsSlice } from './provider-utils-slice';
export { createProviderCredentialsSlice } from './provider-credentials-slice';

// TODO: Export from use-app-store once single bounded store is fully integrated
// export { useAppStore } from '../use-app-store';
