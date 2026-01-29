/**
 * PHASE 2 STUB: Credential Vault
 *
 * Original code archived to: _phase2-archive/lib/agent/providers/credential-vault.ts
 * This stub prevents runtime errors during Phase 1A development.
 *
 * @phase 2
 * @stub true
 * @created 2026-01-29
 * @updated 2026-01-29
 */

/**
 * Stub CredentialVault class for compatibility with code expecting the class
 */
export class CredentialVault {
  isInitialized = () => true;

  initialize = async () => {
    console.log('[CredentialVault STUB] Phase 2 feature - skipped initialization');
    return true;
  };

  getCredential = async (_key: string) => null;
  getCredentials = async (_providerId: string) => null;

  setCredential = async (_key: string, _value: string) => {
    console.log('[CredentialVault STUB] Phase 2 feature - credential not stored');
  };

  deleteCredential = async (_key: string) => {
    console.log('[CredentialVault STUB] Phase 2 feature - credential not deleted');
  };

  hasCredential = async (_key: string) => false;
  listCredentials = async () => [];

  clear = async () => {
    console.log('[CredentialVault STUB] Phase 2 feature - vault not cleared');
  };
}

/**
 * Singleton instance for direct import
 */
export const credentialVault = new CredentialVault();

export default credentialVault;
