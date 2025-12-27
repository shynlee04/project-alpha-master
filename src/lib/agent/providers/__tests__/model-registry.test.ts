/**
 * @fileoverview Model Registry Tests
 * @module lib/agent/providers/__tests__/model-registry.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelRegistry, modelRegistry } from '../model-registry';
import { FREE_MODELS } from '../types';

// Mock fetch
global.fetch = vi.fn();

describe('ModelRegistry', () => {
    let registry: ModelRegistry;

    beforeEach(() => {
        vi.clearAllMocks();
        registry = new ModelRegistry();
    });

    describe('getDefaultModels', () => {
        it('should return free models for openrouter', () => {
            const models = registry.getDefaultModels('openrouter');
            expect(models.length).toBeGreaterThan(0);
            expect(models[0].providerId).toBe('openrouter');
        });

        it('should return default model for openai', () => {
            const models = registry.getDefaultModels('openai');
            expect(models.length).toBe(1);
            expect(models[0].id).toBe('gpt-4o');
        });

        it('should return empty array for unknown provider', () => {
            const models = registry.getDefaultModels('unknown');
            expect(models).toEqual([]);
        });
    });

    describe('getFreeModels', () => {
        it('should return predefined free models', () => {
            const models = registry.getFreeModels();
            expect(models).toEqual(FREE_MODELS);
            expect(models.length).toBeGreaterThan(0);
        });
    });

    describe('getModels', () => {
        it('should return defaults when no API key', async () => {
            const models = await registry.getModels('openrouter');
            expect(models.length).toBeGreaterThan(0);
        });

        it('should fetch from API with valid key', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: [
                        { id: 'model-1', name: 'Model One' },
                        { id: 'model-2:free', name: 'Model Two Free' },
                    ],
                }),
            } as Response);

            const models = await registry.getModels('openrouter', 'test-key');
            expect(models).toHaveLength(2);
            expect(models[1].isFree).toBe(true);
        });

        it('should cache API results', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: [{ id: 'model-1', name: 'Model One' }],
                }),
            } as Response);

            await registry.getModels('openrouter', 'test-key');
            await registry.getModels('openrouter', 'test-key');

            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should fallback to defaults on API error', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('API Error'));

            const models = await registry.getModels('openrouter', 'test-key');
            expect(models.length).toBeGreaterThan(0);
        });
    });

    describe('clearCache', () => {
        it('should clear cache for specific provider', async () => {
            vi.mocked(fetch).mockResolvedValue({
                ok: true,
                json: async () => ({ data: [{ id: 'test' }] }),
            } as Response);

            await registry.getModels('openrouter', 'key');
            registry.clearCache('openrouter');
            await registry.getModels('openrouter', 'key');

            expect(fetch).toHaveBeenCalledTimes(2);
        });
    });
});

describe('modelRegistry singleton', () => {
    it('should export singleton instance', () => {
        expect(modelRegistry).toBeInstanceOf(ModelRegistry);
    });
});
