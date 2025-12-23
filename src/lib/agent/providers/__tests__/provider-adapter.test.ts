/**
 * @fileoverview Provider Adapter Factory Tests
 * @module lib/agent/providers/__tests__/provider-adapter.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @tanstack/ai-openai before importing the module under test
vi.mock('@tanstack/ai-openai', () => ({
    openai: vi.fn().mockImplementation((config) => ({
        _config: config,
        type: 'openai-adapter',
    })),
}));

import {
    ProviderAdapterFactory,
    providerAdapterFactory,
    createProviderAdapter,
} from '../provider-adapter';
import { PROVIDERS } from '../types';

// Mock fetch for connection tests
global.fetch = vi.fn();

describe('ProviderAdapterFactory', () => {
    let factory: ProviderAdapterFactory;

    beforeEach(() => {
        vi.clearAllMocks();
        factory = new ProviderAdapterFactory();
    });

    describe('createAdapter', () => {
        it('should create adapter for openai provider', () => {
            const adapter = factory.createAdapter('openai', {
                apiKey: 'test-key',
            });
            expect(adapter).toBeDefined();
        });

        it('should create adapter for openrouter provider', () => {
            const adapter = factory.createAdapter('openrouter', {
                apiKey: 'test-key',
            });
            expect(adapter).toBeDefined();
        });

        it('should throw for unknown provider', () => {
            expect(() =>
                factory.createAdapter('unknown-provider', { apiKey: 'test' })
            ).toThrow('Unknown provider');
        });

        it('should throw for disabled provider', () => {
            expect(() =>
                factory.createAdapter('anthropic', { apiKey: 'test' })
            ).toThrow('Provider not enabled');
        });
    });

    describe('getAdapter', () => {
        it('should cache and return adapter', () => {
            factory.createAdapter('openai', { apiKey: 'test' });
            const cached = factory.getAdapter('openai');
            expect(cached).toBeDefined();
        });

        it('should return undefined for non-cached provider', () => {
            const cached = factory.getAdapter('openai');
            expect(cached).toBeUndefined();
        });
    });

    describe('testConnection', () => {
        it('should return success for valid API key', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] }),
            } as Response);

            const result = await factory.testConnection('openai', 'valid-key');
            expect(result.success).toBe(true);
            expect(result.latencyMs).toBeDefined();
        });

        it('should return failure for invalid API key', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                text: async () => 'Unauthorized',
            } as Response);

            const result = await factory.testConnection('openai', 'invalid-key');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });

        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            const result = await factory.testConnection('openai', 'test-key');
            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
        });
    });

    describe('getProviderConfig', () => {
        it('should return config for valid provider', () => {
            const config = factory.getProviderConfig('openrouter');
            expect(config).toEqual(PROVIDERS.openrouter);
        });

        it('should return undefined for unknown provider', () => {
            const config = factory.getProviderConfig('unknown');
            expect(config).toBeUndefined();
        });
    });

    describe('getEnabledProviders', () => {
        it('should return only enabled providers', () => {
            const enabled = factory.getEnabledProviders();
            expect(enabled.length).toBeGreaterThan(0);
            enabled.forEach((p) => expect(p.enabled).toBe(true));
        });
    });

    describe('clearAdapter', () => {
        it('should remove cached adapter', () => {
            factory.createAdapter('openai', { apiKey: 'test' });
            factory.clearAdapter('openai');
            expect(factory.getAdapter('openai')).toBeUndefined();
        });
    });

    describe('clearAll', () => {
        it('should remove all cached adapters', () => {
            factory.createAdapter('openai', { apiKey: 'test1' });
            factory.createAdapter('openrouter', { apiKey: 'test2' });
            factory.clearAll();
            expect(factory.getAdapter('openai')).toBeUndefined();
            expect(factory.getAdapter('openrouter')).toBeUndefined();
        });
    });
});

describe('providerAdapterFactory singleton', () => {
    it('should export singleton instance', () => {
        expect(providerAdapterFactory).toBeInstanceOf(ProviderAdapterFactory);
    });
});

describe('createProviderAdapter helper', () => {
    it('should create adapter using singleton', () => {
        const adapter = createProviderAdapter('openrouter', {
            apiKey: 'test-key',
        });
        expect(adapter).toBeDefined();
    });
});
