/**
 * Re-export from canonical location
 * @deprecated Import from '@/infrastructure/ai' instead
 * 
 * This file exists for backward compatibility with existing imports.
 * All credential vault functionality has been moved to:
 * - src/infrastructure/ai/credential-vault.ts (main API)
 * - src/infrastructure/ai/credential-encryption.ts (crypto operations)
 * - src/infrastructure/ai/credential-storage.ts (IndexedDB operations)
 */

// Re-export the canonical implementation
export { CredentialVault, credentialVault, type VaultStatus } from '@/infrastructure/ai/credential-vault.js';
import { credentialVault as vault } from '@/infrastructure/ai/credential-vault.js';

// Legacy Credential interface for backward compatibility
// This interface was part of the stub but is not used in the actual vault
// Keep it here to avoid breaking any code that might reference it
export interface Credential {
  key: string;
  value: string;
  providerId?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default vault;
