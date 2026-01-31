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
    OpenAICompatibleConfig,
} from './types';
export { PROVIDERS, FREE_MODELS } from './types';

// Provider Adapter
export {
    ProviderAdapterFactory,
    providerAdapterFactory,
    createProviderAdapter,
} from './provider-adapter';
export type { CustomAdapterConfig } from './provider-adapter';

// Anthropic Adapter
export { AnthropicAdapter, createAnthropicAdapter } from './anthropic-adapter';
export type { AnthropicAdapterConfig } from './anthropic-adapter';

// Gemini Adapter
export { GeminiAdapter, createGeminiAdapter } from './gemini-adapter';
export type {
    GeminiAdapterConfig,
    GeminiMessage,
    GeminiContentPart,
    GeminiTool,
    GeminiStreamChunk,
    GeminiModality,
    GeminiModelId,
} from './gemini-adapter';

// Credential Vault
export { CredentialVault, credentialVault } from './credential-vault';
export type { VaultStatus } from './credential-vault';

export { CredentialStorage } from './credential-storage';
export type { StorageResult } from './credential-storage';
export {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    uint8ArrayToBase64,
    base64ToUint8Array,
} from './credential-storage';

export {
    CredentialEncryption,
    credentialEncryption,
    ENCRYPTION_ALGORITHM,
    KEY_LENGTH,
    SALT_LENGTH,
    IV_LENGTH,
    ITERATIONS,
} from './credential-encryption';
export type { EncryptedData, VaultKeys } from './credential-encryption';

// Model Registry
export { ModelRegistry, modelRegistry } from './model-registry';
