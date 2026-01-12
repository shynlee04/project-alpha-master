/**
 * Provider Credentials Slice - Orchestrator (Backward Compatibility)
 *
 * This file has been refactored as an orchestrator that imports from the split
 * credential slices in the credentials/ subdirectory.
 *
 * **STORY BYOK-01**: Split Provider Credentials God Slice (396 lines → 2 slices)
 *
 * Before refactoring:
 * - Single file with 396 lines mixing vault, CRUD, and validation concerns
 *
 * After refactoring:
 * - vault-slice.ts: Pure vault operations (~150 lines with comments)
 * - crud-slice.ts: Metadata and validation (~280 lines with comments)
 * - provider-credentials-slice.ts: This orchestrator (~60 lines)
 *
 * Migration Guide:
 * - Existing imports continue to work (backward compatible)
 * - New code can import directly from credentials/ subdirectory
 *
 * @module providers/provider-credentials-slice
 * @story BYOK-01 - Split provider credentials god slice
 */

// Re-export slice creators from split modules
export {
  createProviderVaultSlice,
  createProviderCredentialsCrudSlice,
} from './credentials';

// Re-export main slice creator for backward compatibility
export {
  createProviderCredentialsSlice,
} from './credentials';

// Re-export types
export type {
  ProviderKeyMetadata,
  KeyValidationResult,
} from './credentials';

// Note: The actual implementation is now in:
// - credentials/vault-slice.ts: Vault operations (storeVaultCredential, retrieveVaultCredential, etc.)
// - credentials/crud-slice.ts: Metadata and validation (storeProviderKey, retrieveProviderKey, etc.)
//
// For new code, import directly from the split modules:
// import { createProviderVaultSlice } from '@/infrastructure/persistence/stores/providers/credentials/vault-slice';
// import { createProviderCredentialsCrudSlice } from '@/infrastructure/persistence/stores/providers/credentials/crud-slice';
