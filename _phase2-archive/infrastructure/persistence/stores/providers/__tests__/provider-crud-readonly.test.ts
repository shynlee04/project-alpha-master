/**
 * Provider CRUD Readonly Enforcement Tests
 *
 * Tests security validation preventing modification of built-in provider endpoints.
 *
 * @module providers/__tests__/provider-crud-readonly
 * @story P2 Remediation - Readonly enforcement at store level
 */

// Vitest globals available
import { createProviderCrudSlice } from '../provider-crud-slice';
import type { ProviderConfig } from '../types';

describe('ProviderCrudSlice - Readonly Enforcement', () => {
  let providers: ProviderConfig[];
  let setMock: any;
  let getMock: any;

  const builtInProvider: ProviderConfig = {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    hasApiKey: false,
    models: [],
    enabled: true,
  };

  const customProvider: ProviderConfig = {
    id: 'custom-local-llm',
    name: 'Custom Local LLM',
    type: 'openai-compatible',
    baseURL: 'http://localhost:11434/v1',
    defaultModel: 'llama-2-7b',
    hasApiKey: false,
    models: [],
    enabled: true,
    isCustom: true, // User-added provider
  };

  beforeEach(() => {
    // Reset providers array
    providers = [builtInProvider];

    // Mock set function
    setMock = (update: any) => {
      if (typeof update === 'function') {
        const newState = update({ providers });
        providers = newState.providers;
      } else {
        providers = update.providers;
      }
    };

    // Mock get function
    getMock = () => ({
      providers,
      activeProviderId: 'openrouter',
    });
  });

  describe('Built-in Provider Readonly Enforcement', () => {
    it('should allow updating non-baseURL fields of built-in providers', () => {
      // Create slice with mocks
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      // Should allow updating name, defaultModel, etc.
      expect(() => {
        slice.updateProvider('openrouter', {
          name: 'OpenRouter (Updated)',
          defaultModel: 'gpt-4',
        });
      }).not.toThrow();

      // Verify provider was updated
      expect(providers[0].name).toBe('OpenRouter (Updated)');
      expect(providers[0].defaultModel).toBe('gpt-4');
      expect(providers[0].baseURL).toBe(builtInProvider.baseURL); // Unchanged
    });

    it('should reject attempts to modify built-in provider base URL', () => {
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      // Attempt to change base URL of built-in provider
      expect(() => {
        slice.updateProvider('openrouter', {
          baseURL: 'https://malicious-endpoint.com/api/v1',
        });
      }).toThrow('Cannot modify built-in provider endpoint');
    });

    it('should allow setting base URL to same value (idempotent)', () => {
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      // Setting to same value should not throw (no actual change)
      expect(() => {
        slice.updateProvider('openrouter', {
          baseURL: 'https://openrouter.ai/api/v1', // Same as current
        });
      }).not.toThrow();
    });

    it('should provide clear error message with provider ID', () => {
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      try {
        slice.updateProvider('openrouter', {
          baseURL: 'https://evil.com/api',
        });
        // If we reach here, test should fail
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect((error as Error).message).toContain('openrouter');
        expect((error as Error).message).toContain('built-in');
      }
    });
  });

  describe('Custom Provider Flexibility', () => {
    beforeEach(() => {
      providers = [builtInProvider, customProvider];
    });

    it('should allow updating custom provider base URL', () => {
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      // Custom providers can modify their base URL
      expect(() => {
        slice.updateProvider('custom-local-llm', {
          baseURL: 'http://localhost:8080/v1',
        });
      }).not.toThrow();

      // Verify provider was updated
      expect(providers[1].baseURL).toBe('http://localhost:8080/v1');
    });

    it('should allow updating all fields of custom providers', () => {
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      // Custom providers have full flexibility
      expect(() => {
        slice.updateProvider('custom-local-llm', {
          name: 'Local LLM (Updated)',
          baseURL: 'http://localhost:9999/v1',
          defaultModel: 'llama-3-70b',
        });
      }).not.toThrow();

      // Verify all fields were updated
      expect(providers[1].name).toBe('Local LLM (Updated)');
      expect(providers[1].baseURL).toBe('http://localhost:9999/v1');
      expect(providers[1].defaultModel).toBe('llama-3-70b');
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle provider not found gracefully', () => {
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      // Updating non-existent provider should not crash
      expect(() => {
        slice.updateProvider('non-existent', {
          name: 'Should not crash',
        });
      }).not.toThrow();
    });

    it('should treat undefined isCustom as built-in', () => {
      // Providers with undefined isCustom are treated as built-in
      const providerWithoutIsCustom: ProviderConfig = {
        id: 'legacy-provider',
        name: 'Legacy Provider',
        type: 'openai-compatible',
        baseURL: 'https://legacy.com/api/v1',
        hasApiKey: false,
        models: [],
        enabled: true,
        // isCustom: undefined (defaults to built-in)
      };

      providers = [providerWithoutIsCustom];
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      expect(() => {
        slice.updateProvider('legacy-provider', {
          baseURL: 'https://malicious.com/api',
        });
      }).toThrow('Cannot modify built-in provider endpoint');
    });
  });

  describe('Integration with Existing Functionality', () => {
    it('should not break existing updateProvider functionality', () => {
      const slice = createProviderCrudSlice(setMock, getMock, {} as any);

      // Ensure we didn't break normal update operations
      const initialProvider = providers[0];
      expect(initialProvider.id).toBe('openrouter');

      slice.updateProvider('openrouter', {
        name: 'OpenRouter Renamed',
      });

      const updatedProvider = providers.find(p => p.id === 'openrouter');
      expect(updatedProvider?.name).toBe('OpenRouter Renamed');
      expect(updatedProvider?.baseURL).toBe(initialProvider.baseURL); // Unchanged
    });
  });
});
