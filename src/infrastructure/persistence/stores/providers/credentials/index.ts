/**
 * Provider Credentials Slice - Orchestrator (Backward Compatibility)
 *
 * Re-exports from the split credential slices for backward compatibility.
 * The credentials module has been split into:
 * - vault-slice.ts: Pure vault operations (no state)
 * - crud-slice.ts: Metadata, validation, and provider sync
 * - schemas.ts: Zod validation schemas for API keys (BYOK-02)
 *
 * @module providers/credentials
 * @story BYOK-01 - Split provider credentials god slice
 * @story BYOK-02 - Add Zod Validation Schemas
 */

// Export slice creators (for use in use-app-store)
export { createProviderVaultSlice } from './vault-slice';
export { createProviderCredentialsCrudSlice } from './crud-slice';

// Export types
export type {
  ProviderKeyMetadata,
  KeyValidationResult,
} from './crud-slice';

// Export validation schemas (BYOK-02)
export {
  apiKeySchema,
  openaiApiKeySchema,
  anthropicApiKeySchema,
  geminiApiKeySchema,
  openrouterApiKeySchema,
  groqApiKeySchema,
  mistralApiKeySchema,
  PROVIDER_KEY_SCHEMAS,
  VALIDATED_PROVIDERS,
  getProviderKeySchema,
  validateProviderApiKey,
  validateProviderApiKeyAsync,
} from './schemas';

// For backward compatibility, re-export as the main credential slice
// This allows existing imports to continue working
export { createProviderCredentialsCrudSlice as createProviderCredentialsSlice } from './crud-slice';

// Re-export types for backward compatibility
export type {
  ProviderKeyMetadata as KeyMetadata,
  KeyValidationResult as ValidationResult,
} from './crud-slice';
