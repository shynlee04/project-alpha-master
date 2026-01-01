/**
 * Providers Store Facade - Backward Compatibility
 *
 * Re-exports from the unified provider slice.
 * This will be updated to export from use-app-store once the single bounded store is created.
 *
 * @module providers/index
 * @story AC-1.6 - Create provider slice
 */

// Export types
export type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderState,
} from './types';

// Export slice creator (for use in use-app-store)
export { createProviderSlice } from './provider-slice';

// TODO: Export from use-app-store once single bounded store is created
// export { useAppStore } from '../use-app-store';
