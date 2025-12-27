import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProviderStore } from './provider-store';

// Mock CredentialVault
vi.mock('../agent/providers/credential-vault', () => ({
    credentialVault: {
        storeCredentials: vi.fn(),
        deleteCredentials: vi.fn(),
        getCredentials: vi.fn(),
    }
}));

// Mock Dexie Storage to behave synchronously/in-memory for tests
// or just bypass it since we are testing store logic
vi.mock('./dexie-storage', () => ({
    createDexieStorage: () => ({
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    })
}));

describe('Provider Store', () => {
    beforeEach(() => {
        useProviderStore.getState().reset();
    });

    it('should initialize with default providers', () => {
        const { providers, activeProviderId } = useProviderStore.getState();
        expect(providers.length).toBeGreaterThan(0);
        expect(activeProviderId).toBe('openrouter');
    });

    it('should add a provider', () => {
        const newProvider = {
            id: 'test-provider',
            name: 'Test Provider',
            type: 'openai-compatible' as const,
            enabled: true,
            isCustom: true
        };

        useProviderStore.getState().addProvider(newProvider);

        const { providers } = useProviderStore.getState();
        expect(providers).toContainEqual(newProvider);
    });

    it('should update a provider', () => {
        const id = 'openrouter';
        useProviderStore.getState().updateProvider(id, { name: 'Updated Name' });

        const { providers } = useProviderStore.getState();
        const updated = providers.find(p => p.id === id);
        expect(updated?.name).toBe('Updated Name');
    });

    it('should remove a provider', async () => {
        const newProvider = {
            id: 'to-remove',
            name: 'Remove Me',
            type: 'openai-compatible' as const,
            enabled: true
        };
        useProviderStore.getState().addProvider(newProvider);

        await useProviderStore.getState().removeProvider('to-remove');

        const { providers } = useProviderStore.getState();
        expect(providers.find(p => p.id === 'to-remove')).toBeUndefined();
    });

    it('should set active provider', () => {
        useProviderStore.getState().setActiveProvider('openai');
        expect(useProviderStore.getState().activeProviderId).toBe('openai');
    });

    it('should update model settings', () => {
        const providerId = 'openrouter';
        const settings = { temperature: 0.9 };

        useProviderStore.getState().updateModelSettings(providerId, settings);

        const { modelSettings } = useProviderStore.getState();
        expect(modelSettings[providerId].temperature).toBe(0.9);
        // Should preserve defaults
        expect(modelSettings[providerId].maxTokens).toBe(4096);
    });
});
