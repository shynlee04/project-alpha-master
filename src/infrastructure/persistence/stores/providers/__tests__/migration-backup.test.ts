/**
 * Migration Backup System Tests
 *
 * Tests the 3-layer backup mechanism for provider state migration.
 *
 * @story 3.2 Phase 2.1 - Create backup & rollback mechanism
 * @priority P0 CRITICAL (Data loss prevention)
 */

// Set up crypto mock BEFORE importing the class
const mockDigest = vi.fn(async (algorithm: string, data: Uint8Array) => {
  // Return a mock hash (32 bytes of zeros)
  const hash = new Uint8Array(32);
  return hash.buffer;
});

// Set up global crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {};
}

if (!global.crypto.subtle) {
  (global as any).crypto.subtle = {
    digest: mockDigest,
  };
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

// Vitest globals available
import {
  MigrationBackupSystem,
  migrationBackup,
  type ProviderBackup,
} from '../migration-backup';
import type { ProviderConfig } from '../types';

describe('MigrationBackupSystem', () => {
  let backupSystem: MigrationBackupSystem;
  let mockProviders: ProviderConfig[];

  beforeEach(() => {
    backupSystem = new MigrationBackupSystem();

    // Mock provider data with old structure (apiKey field)
    mockProviders = [
      {
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'openai-compatible',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
        // @ts-expect-error - Old field structure
        apiKey: 'sk-test-123',
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
        hasApiKey: false,
      },
    ];

    // Clear localStorage before each test
    (global as any).localStorage.clear();
  });

  afterEach(() => {
    // Clean up IndexedDB
    indexedDB.deleteDatabase('migration-backups');
  });

  describe('createBackups', () => {
    it('should create all 3 backup layers', async () => {
      const result = await backupSystem.createBackups(mockProviders, 'openrouter');

      expect(result.success).toBe(true);
      expect(result.layers.indexedDB).toBe(true);
      expect(result.layers.localStorage).toBe(true);
      expect(result.layers.downloadable).toBe(true);
    });

    it('should include correct metadata in backup', async () => {
      const result = await backupSystem.createBackups(mockProviders, 'openrouter');

      expect(result.metadata.version).toBe('1.0.0');
      expect(result.metadata.providerCount).toBe(2);
      expect(result.metadata.hasApiKeyMigration).toBe(true); // Has apiKey field
      expect(result.metadata.checksum).toBeDefined();
      expect(result.metadata.timestamp).toBeDefined();
    });

    it('should handle empty provider array', async () => {
      const result = await backupSystem.createBackups([], null);

      expect(result.success).toBe(true);
      expect(result.metadata.providerCount).toBe(0);
    });

    it('should handle backup failures gracefully', async () => {
      // Mock localStorage full error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const result = await backupSystem.createBackups(mockProviders, 'openrouter');

      // Should still succeed if IndexedDB works
      expect(result.layers.indexedDB).toBe(true);
      expect(result.layers.localStorage).toBe(false);

      // Restore mock
      localStorage.setItem = originalSetItem;
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore from IndexedDB backup', async () => {
      // Create backup first
      await backupSystem.createBackups(mockProviders, 'openrouter');

      // Restore
      const result = await backupSystem.restoreFromBackup();

      expect(result.success).toBe(true);
      expect(result.source).toBe('indexedDB');
      expect(result.providerCount).toBe(2);
    });

    it('should fall back to localStorage if IndexedDB fails', async () => {
      // Create backup
      await backupSystem.createBackups(mockProviders, 'openrouter');

      // Delete IndexedDB to force fallback
      await indexedDB.deleteDatabase('migration-backups');

      // Restore
      const result = await backupSystem.restoreFromBackup();

      expect(result.success).toBe(true);
      expect(result.source).toBe('localStorage');
      expect(result.providerCount).toBe(2);
    });

    it('should return error if no backup exists', async () => {
      const result = await backupSystem.restoreFromBackup();

      expect(result.success).toBe(false);
      expect(result.source).toBe('manual');
      expect(result.error).toContain('No automated backup available');
    });
  });

  describe('verifyBackup', () => {
    it('should verify valid backup', async () => {
      const result = await backupSystem.createBackups(mockProviders, 'openrouter');

      // Get backup from IndexedDB
      const db = await backupSystem['openBackupDatabase']();
      const tx = db.transaction('migration-backups', 'readonly');
      const store = tx.objectStore('migration-backups');
      const request = store.get('latest');

      const backupData = await new Promise<any>((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });

      const isValid = await backupSystem.verifyBackup(backupData.backup);

      expect(isValid).toBe(true);
      db.close();
    });

    it('should detect corrupted backup', async () => {
      const invalidBackup: ProviderBackup = {
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          providerCount: 2,
          hasApiKeyMigration: false,
          checksum: 'invalid-checksum',
        },
        providers: mockProviders,
        activeProviderId: 'openrouter',
      };

      const isValid = await backupSystem.verifyBackup(invalidBackup);

      expect(isValid).toBe(false);
    });

    it('should detect missing backup structure', async () => {
      const invalidBackup = {} as any;

      const isValid = await backupSystem.verifyBackup(invalidBackup);

      expect(isValid).toBe(false);
    });
  });

  describe('generateDownloadableBackup', () => {
    it('should generate JSON blob', async () => {
      const blob = await backupSystem.generateDownloadableBackup(mockProviders, 'openrouter');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');

      const text = await blob.text();
      const json = JSON.parse(text);

      expect(json.metadata.version).toBe('1.0.0');
      expect(json.providers).toHaveLength(2);
    });

    it('should handle empty providers', async () => {
      const blob = await backupSystem.generateDownloadableBackup([], null);

      expect(blob).toBeInstanceOf(Blob);
      const text = await blob.text();
      const json = JSON.parse(text);

      expect(json.providers).toHaveLength(0);
      expect(json.activeProviderId).toBeNull();
    });
  });

  describe('cleanupOldBackups', () => {
    it('should remove backups older than retention period', async () => {
      // Create old backup (8 days ago)
      const oldBackup: ProviderBackup = {
        metadata: {
          timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
          version: '1.0.0',
          providerCount: 1,
          hasApiKeyMigration: false,
          checksum: 'old-checksum',
        },
        providers: [mockProviders[0]],
        activeProviderId: 'openrouter',
      };

      // Store old backup in localStorage
      localStorage.setItem('provider-state-backup', JSON.stringify(oldBackup));

      // Run cleanup
      await backupSystem.cleanupOldBackups();

      // Verify old backup removed
      const remaining = localStorage.getItem('provider-state-backup');
      expect(remaining).toBeNull();
    });

    it('should keep recent backups', async () => {
      // Create recent backup (1 day ago)
      const recentBackup: ProviderBackup = {
        metadata: {
          timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
          version: '1.0.0',
          providerCount: 1,
          hasApiKeyMigration: false,
          checksum: 'recent-checksum',
        },
        providers: [mockProviders[0]],
        activeProviderId: 'openrouter',
      };

      // Store recent backup
      localStorage.setItem('provider-state-backup', JSON.stringify(recentBackup));

      // Run cleanup
      await backupSystem.cleanupOldBackups();

      // Verify recent backup kept
      const remaining = localStorage.getItem('provider-state-backup');
      expect(remaining).not.toBeNull();
    });
  });

  describe('singleton instance', () => {
    it('should export singleton', () => {
      expect(migrationBackup).toBeInstanceOf(MigrationBackupSystem);
    });
  });
});
