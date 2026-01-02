/**
 * Provider API Key Migration Tests
 *
 * Tests the migration script that moves API keys from provider state
 * to encrypted credential vault.
 *
 * @story 3.2 Phase 2.2 - Migration Logic Implementation
 * @priority P0 CRITICAL (Data modification)
 */

// Vitest globals available
import {
  migrateApiKeysToVault,
  isMigrationNeeded,
  countProvidersNeedingMigration,
  rollbackMigration,
  type ProviderConfig,
} from '../migrate-api-keys-to-vault';

// Mock credential vault at module level
vi.mock('@/lib/agent/providers/credential-vault', () => ({
  credentialVault: {
    storeCredentials: vi.fn(async (providerId: string, apiKey: string) => {
      console.log(`[MockCredentialVault] Storing credentials for ${providerId}`);
    }),
    getCredentials: vi.fn(async (providerId: string) => {
      return `mock-api-key-for-${providerId}`;
    }),
  },
}));

// Mock crypto API (for both Node.js and jsdom environments)
const mockDigest = vi.fn(async (algorithm: string, data: Uint8Array) => {
  const hash = new Uint8Array(32);
  return hash.buffer;
});

const mockImportKey = vi.fn(async () => ({
  algorithm: { name: 'AES-GCM' },
  extractable: false,
  type: 'secret' as const,
}));

const mockEncrypt = vi.fn(async () => new ArrayBuffer(32));

const mockDeriveBits = vi.fn(async () => new ArrayBuffer(16));

const mockDeriveKey = vi.fn(async () => ({
  algorithm: { name: 'AES-GCM', length: 256 },
  extractable: false,
  type: 'secret' as const,
}));

if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {};
}

if (!global.crypto.subtle) {
  (global as any).crypto.subtle = {
    digest: mockDigest,
    importKey: mockImportKey,
    encrypt: mockEncrypt,
    deriveBits: mockDeriveBits,
    deriveKey: mockDeriveKey,
  };

  // Mock getRandomValues for IV generation
  (global as any).crypto.getRandomValues = vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  });
}

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

if (typeof global.localStorage === 'undefined') {
  (global as any).localStorage = localStorageMock;
}

// Mock window.crypto for browser-like tests
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {};
}
(global as any).window.crypto = (global as any).crypto;

describe('migrateApiKeysToVault', () => {
  let mockProviders: ProviderConfig[];
  let updateProviderCalls: Array<{ id: string; config: any }> = [];

  beforeEach(() => {
    // Reset update provider tracker
    updateProviderCalls = [];

    // Mock provider data with old structure (apiKey field)
    mockProviders = [
      {
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'openai-compatible',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
        // @ts-expect-error - Old field structure
        apiKey: 'sk-test-openrouter-123',
        models: [],
        enabled: true,
        lastModelFetchAt: undefined,
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'anthropic',
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-3-5-sonnet-20241022',
        models: [],
        enabled: true,
        lastModelFetchAt: undefined,
        // @ts-expect-error - Old field structure
        apiKey: 'sk-ant-123',
        hasApiKey: false,
      },
      {
        id: 'openai',
        name: 'OpenAI',
        type: 'openai',
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o',
        models: [],
        enabled: true,
        lastModelFetchAt: undefined,
        // Already migrated (no apiKey field)
        hasApiKey: true,
      },
      {
        id: 'google',
        name: 'Google Gemini',
        type: 'gemini',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-3.0-flash',
        models: [],
        enabled: true,
        lastModelFetchAt: undefined,
        // Empty API key (should be skipped)
        // @ts-expect-error - Old field structure
        apiKey: '',
        hasApiKey: false,
      },
    ];

    // Clear localStorage
    (global as any).localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up IndexedDB
    indexedDB.deleteDatabase('migration-backups');
  });

  describe('isMigrationNeeded', () => {
    it('should return true when providers have apiKey field', () => {
      const result = isMigrationNeeded(mockProviders);
      expect(result).toBe(true);
    });

    it('should return false when no providers have apiKey field', () => {
      const providersWithoutApiKey = mockProviders.map(p => {
        const { apiKey, ...rest } = p as any;
        return rest;
      });

      const result = isMigrationNeeded(providersWithoutApiKey);
      expect(result).toBe(false);
    });

    it('should return false for empty provider array', () => {
      const result = isMigrationNeeded([]);
      expect(result).toBe(false);
    });
  });

  describe('countProvidersNeedingMigration', () => {
    it('should count providers with non-empty apiKey field', () => {
      const count = countProvidersNeedingMigration(mockProviders);
      // openrouter (sk-test-openrouter-123), anthropic (sk-ant-123)
      // google (empty string) should not be counted
      expect(count).toBe(2);
    });

    it('should return 0 for providers already migrated', () => {
      const providersWithoutApiKey = mockProviders.map(p => {
        const { apiKey, ...rest } = p as any;
        return rest;
      });

      const count = countProvidersNeedingMigration(providersWithoutApiKey);
      expect(count).toBe(0);
    });
  });

  describe('migrateApiKeysToVault', () => {
    beforeEach(async () => {
      // Mock migration backup module
      const { migrationBackup } = await import('../migration-backup');

      vi.spyOn(migrationBackup, 'createBackups').mockResolvedValue({
        success: true,
        timestamp: Date.now(),
        layers: { indexedDB: true, localStorage: true, downloadable: true },
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          providerCount: mockProviders.length,
          hasApiKeyMigration: true,
          checksum: 'mock-checksum',
        },
      });

      vi.spyOn(migrationBackup, 'restoreFromBackup').mockResolvedValue({
        success: true,
        source: 'indexedDB' as const,
        timestamp: Date.now(),
        providerCount: mockProviders.length,
      });

      vi.spyOn(migrationBackup, 'getLatestBackup').mockResolvedValue({
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          providerCount: mockProviders.length,
          hasApiKeyMigration: true,
          checksum: 'mock-checksum',
        },
        providers: mockProviders,
        activeProviderId: 'openrouter',
      });
    });

    it('should successfully migrate all providers with API keys', async () => {
      const updateProvider = vi.fn((id, config) => {
        updateProviderCalls.push({ id, config });
        // Actually modify the mockProviders array for verification
        const providerIndex = mockProviders.findIndex(p => p.id === id);
        if (providerIndex !== -1) {
          mockProviders[providerIndex] = { ...mockProviders[providerIndex], ...config };
        }
      });

      const result = await migrateApiKeysToVault(
        mockProviders,
        'openrouter',
        updateProvider
      );

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(2);
      expect(result.failedProviders).toHaveLength(0);
      expect(result.backupResult.success).toBe(true);
      expect(result.rollbackAttempted).toBe(false);

      // Verify updateProvider was called correctly (2 for migration + 1 for empty google = 3 total)
      expect(updateProvider).toHaveBeenCalledTimes(3);

      // Check openrouter update
      const openRouterUpdate = updateProviderCalls.find(c => c.id === 'openrouter');
      expect(openRouterUpdate?.config.hasApiKey).toBe(true);
      expect(openRouterUpdate?.config.apiKey).toBeUndefined();

      // Check anthropic update
      const anthropicUpdate = updateProviderCalls.find(c => c.id === 'anthropic');
      expect(anthropicUpdate?.config.hasApiKey).toBe(true);
      expect(anthropicUpdate?.config.apiKey).toBeUndefined();
    });

    it('should skip providers with empty API keys', async () => {
      const updateProvider = vi.fn((id, config) => {
        updateProviderCalls.push({ id, config });
        // Actually modify the mockProviders array for verification
        const providerIndex = mockProviders.findIndex(p => p.id === id);
        if (providerIndex !== -1) {
          mockProviders[providerIndex] = { ...mockProviders[providerIndex], ...config };
        }
      });

      const result = await migrateApiKeysToVault(
        mockProviders,
        'openrouter',
        updateProvider
      );

      // Google has empty apiKey, should be skipped
      expect(result.migratedCount).toBe(2); // openrouter + anthropic only
      expect(result.success).toBe(true);
    });

    it('should return success=true when no migration needed', async () => {
      const providersWithoutApiKey = mockProviders.map(p => {
        const { apiKey, ...rest } = p as any;
        return rest;
      });

      const updateProvider = vi.fn();
      const result = await migrateApiKeysToVault(
        providersWithoutApiKey,
        null,
        updateProvider
      );

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(0);
      expect(updateProvider).not.toHaveBeenCalled();
    });

    it('should handle backup creation failure', async () => {
      const { migrationBackup } = await import('../migration-backup');

      // Mock backup failure
      vi.spyOn(migrationBackup, 'createBackups').mockResolvedValue({
        success: false,
        timestamp: Date.now(),
        layers: { indexedDB: false, localStorage: false, downloadable: false },
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          providerCount: 0,
          hasApiKeyMigration: false,
          checksum: '',
        },
        error: 'Backup failed',
      });

      const updateProvider = vi.fn();
      const result = await migrateApiKeysToVault(
        mockProviders,
        'openrouter',
        updateProvider
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Backup creation failed');
      expect(result.rollbackAttempted).toBe(false);
      expect(updateProvider).not.toHaveBeenCalled();
    });

    it('should handle credential vault storage failure', async () => {
      // Mock credential vault to throw error
      const { credentialVault } = await import('@/lib/agent/providers/credential-vault');
      vi.spyOn(credentialVault, 'storeCredentials').mockRejectedValue(new Error('Vault storage failed'));

      const updateProvider = vi.fn();
      const result = await migrateApiKeysToVault(
        mockProviders,
        'openrouter',
        updateProvider
      );

      expect(result.success).toBe(false);
      expect(result.migratedCount).toBe(0); // No migrations succeeded
      expect(result.failedProviders).toHaveLength(2); // Both providers failed
      expect(result.failedProviders[0].id).toBe('openrouter');
      expect(result.failedProviders[0].error).toContain('Vault storage failed');
    });
  });

  describe('rollbackMigration', () => {
    beforeEach(async () => {
      const { migrationBackup } = await import('../migration-backup');

      vi.spyOn(migrationBackup, 'restoreFromBackup').mockResolvedValue({
        success: true,
        source: 'indexedDB' as const,
        timestamp: Date.now(),
        providerCount: mockProviders.length,
      });

      vi.spyOn(migrationBackup, 'getLatestBackup').mockResolvedValue({
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          providerCount: mockProviders.length,
          hasApiKeyMigration: true,
          checksum: 'mock-checksum',
        },
        providers: mockProviders,
        activeProviderId: 'openrouter',
      });
    });

    it('should successfully rollback from backup', async () => {
      const updateProvider = vi.fn();

      const success = await rollbackMigration(mockProviders, 'openrouter', updateProvider);

      expect(success).toBe(true);
      expect(updateProvider).toHaveBeenCalled();
    });

    it('should return false if backup restore fails', async () => {
      const { migrationBackup } = await import('../migration-backup');

      // Mock restore failure
      vi.spyOn(migrationBackup, 'restoreFromBackup').mockResolvedValue({
        success: false,
        source: 'manual' as const,
        timestamp: Date.now(),
        providerCount: 0,
        error: 'No backup found',
      });

      const updateProvider = vi.fn();
      const success = await rollbackMigration(mockProviders, 'openrouter', updateProvider);

      expect(success).toBe(false);
      expect(updateProvider).not.toHaveBeenCalled();
    });
  });
});
