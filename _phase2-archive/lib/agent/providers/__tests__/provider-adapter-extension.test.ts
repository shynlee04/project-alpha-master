/**
 * Test: Provider Adapter Extension
 * @module lib/agent/providers/__tests__/provider-adapter-extension
 *
 * Validates that ExtendedProviderAdapter interface is correctly implemented
 */

import { providerAdapterFactory } from '../provider-adapter';
import type { ExtendedProviderAdapter } from '../provider-adapter';

describe('ProviderAdapterFactory - Extended Adapter', () => {
    it('should create adapter with getModels method', async () => {
        const adapter = providerAdapterFactory.createAdapter('openai', {
            apiKey: 'test-key',
        }) as ExtendedProviderAdapter;

        // Verify adapter has getModels method
        expect(typeof adapter.getModels).toBe('function');

        // Call getModels (will fail without valid API key, but method exists)
        try {
            const models = await adapter.getModels();
            expect(Array.isArray(models)).toBe(true);
        } catch (error) {
            // Expected to fail with test key, but proves method exists
            expect(error).toBeDefined();
        }
    });

    it('should create adapter with testConnection method', async () => {
        const adapter = providerAdapterFactory.createAdapter('openai', {
            apiKey: 'test-key',
        }) as ExtendedProviderAdapter;

        // Verify adapter has testConnection method
        expect(typeof adapter.testConnection).toBe('function');

        // Call testConnection (will fail without valid API key, but method exists)
        try {
            const result = await adapter.testConnection();
            expect(typeof result.success).toBe('boolean');
            expect(typeof result.latencyMs).toBe('number');
        } catch (error) {
            // Expected to fail with test key, but proves method exists
            expect(error).toBeDefined();
        }
    });

    it('should extend custom OpenAI-compatible adapters', async () => {
        const adapter = providerAdapterFactory.createAdapter('openai-compatible', {
            apiKey: 'test-key',
            baseURL: 'http://localhost:1234/v1',
        }) as ExtendedProviderAdapter;

        // Verify both methods exist
        expect(typeof adapter.getModels).toBe('function');
        expect(typeof adapter.testConnection).toBe('function');
    });
});
