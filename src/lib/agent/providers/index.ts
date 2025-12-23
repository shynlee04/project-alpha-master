/**
 * @fileoverview Agent Providers Public API
 * @module lib/agent/providers
 * 
 * Public exports for AI provider adapters, credentials, and models.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

// Types
export type {
    ProviderType,
    ProviderConfig,
    AdapterConfig,
    ModelInfo,
    StoredCredential,
    ConnectionTestResult,
} from './types';
export { PROVIDERS, FREE_MODELS } from './types';

// Provider Adapter
export {
    ProviderAdapterFactory,
    providerAdapterFactory,
    createProviderAdapter,
} from './provider-adapter';

// Credential Vault
export { CredentialVault, credentialVault } from './credential-vault';

// Model Registry
export { ModelRegistry, modelRegistry } from './model-registry';
