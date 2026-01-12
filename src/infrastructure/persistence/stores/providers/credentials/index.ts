/**
 * Provider Credentials Slice - Orchestrator (Backward Compatibility)
 *
 * Re-exports from the split credential slices for backward compatibility.
 * The credentials module has been split into:
 * - vault-slice.ts: Pure vault operations (no state)
 * - crud-slice.ts: Metadata, validation, and provider sync
 *
 * @module providers/credentials
 * @story BYOK-01 - Split provider credentials god slice
 */

// Export slice creators (for use in use-app-store)
export { createProviderVaultSlice } from './vault-slice';
export { createProviderCredentialsCrudSlice } from './crud-slice';

// Export types
export type {
  ProviderKeyMetadata,
  KeyValidationResult,
} from './crud-slice';

// For backward compatibility, re-export as the main credential slice
// This allows existing imports to continue working
export { createProviderCredentialsCrudSlice as createProviderCredentialsSlice } from './crud-slice';

// Re-export types for backward compatibility
export type {
  ProviderKeyMetadata as KeyMetadata,
  KeyValidationResult as ValidationResult,
} from './crud-slice';
