/**
 * Providers Store Facade - Backward Compatibility
 *
 * Re-exports from the unified provider slices (split into 4 for maintainability).
 * Exports slice creators for use in use-app-store single bounded store.
 *
 * **STORY BYOK-01**: Provider credentials slice has been split into 2 slices:
 * - credentials/vault-slice.ts: Pure vault operations
 * - credentials/crud-slice.ts: Metadata and validation
 *
 * The main provider-credentials-slice.ts is now an orchestrator that imports
 * from the credentials/ subdirectory.
 *
 * @module providers/index
 * @story AC-1.6 - Create provider slices
 * @story A-4 - BYOK Vault Integration (added credentials slice)
 * @story BYOK-01 - Split credentials god slice
 */

// Export types
export type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderState,
} from './types';

// Export vault integration types (now from credentials subdirectory)
export type {
  ProviderKeyMetadata,
  KeyValidationResult,
} from './credentials';

// Export slice creators (for use in use-app-store)
// Split into 4 slices to meet 300-line limit from sweeping-validation.md
export { createProviderCrudSlice } from './provider-crud-slice';
export { createProviderModelsSlice } from './provider-models-slice';
export { createProviderUtilsSlice } from './provider-utils-slice';

// Provider credentials slices (BYOK-01: split into vault + crud)
export {
  createProviderVaultSlice,
  createProviderCredentialsCrudSlice,
  createProviderCredentialsSlice,
} from './provider-credentials-slice';

// TODO: Export from use-app-store once single bounded store is fully integrated
// export { useAppStore } from '../use-app-store';
