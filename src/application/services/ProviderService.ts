/**
 * ProviderService (Application Layer)
 * Orchestrates provider configuration operations
 *
 * Responsibilities:
 * - Provider CRUD operations
 * - API key management
 * - Model fetching and caching
 * - Cross-workspace provider synchronization
 */

import { emitStoreEvent } from '@/lib/events/store-events';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { providerAdapterFactory } from '@/lib/agent/providers/provider-adapter';
import type { ProviderModel } from '@/core/entities/Provider';
import { STORE_EVENTS } from '@/lib/events/store-events';

export class ProviderService {
  /**
   * Set API key for provider and trigger model loading
   */
  async setApiKey(providerId: string, apiKey: string): Promise<void> {
    // 1. Store key securely
    await credentialVault.storeCredentials(providerId, apiKey);

    // 2. Emit event for cross-workspace reactivity
    emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_SET, {
      providerId,
      timestamp: Date.now()
    });

    // 3. Auto-load models
    await this.fetchModels(providerId);
  }

  /**
   * Fetch models for a provider
   */
  async fetchModels(providerId: string): Promise<ProviderModel[]> {
    // 1. Get API key
    const apiKey = await credentialVault.getCredentials(providerId);
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${providerId}`);
    }

    // 2. Create adapter and fetch
    const adapter = providerAdapterFactory.createAdapter(providerId, { apiKey });
    const models = await adapter.getModels();

    // 3. Emit models loaded event
    emitStoreEvent(STORE_EVENTS.PROVIDER_MODELS_LOADED, {
      providerId,
      modelCount: models.length,
      timestamp: Date.now()
    });

    return models;
  }

  /**
   * Remove API key for provider
   */
  async removeApiKey(providerId: string): Promise<void> {
    await credentialVault.deleteCredentials(providerId);

    emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_REMOVED, {
      providerId,
      timestamp: Date.now()
    });
  }

  /**
   * Test provider connection
   */
  async testConnection(providerId: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const apiKey = await credentialVault.getCredentials(providerId);
    if (!apiKey) {
      return { success: false, latencyMs: 0, error: 'No API key' };
    }

    const adapter = providerAdapterFactory.createAdapter(providerId, { apiKey });
    return adapter.testConnection();
  }
}

// Singleton instance
export const providerService = new ProviderService();
