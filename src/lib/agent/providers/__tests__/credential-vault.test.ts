/**
 * @fileoverview Credential Vault Tests
 * @module lib/agent/providers/__tests__/credential-vault.test
 * 
 * @epic 2 - AI Chat That Just Works
 * @story 2-0 - Credential Vault Implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CredentialVault, credentialVault } from '../credential-vault';

// Mock Dexie db
const mockCredentialsTable = {
  put: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  delete: vi.fn().mockResolvedValue(undefined),
  toArray: vi.fn().mockResolvedValue([]),
};

const mockDb = {
  credentials: mockCredentialsTable,
};

vi.mock('../../state/dexie-db', () => mockDb);

describe('CredentialVault', () => {
  let vault: CredentialVault;

  beforeEach(() => {
    vi.clearAllMocks();
    vault = new CredentialVault();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should generate new master key if none exists', async () => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      // Mock crypto
      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({
            kty: 'oct',
            k: 'mock-key-data',
            alg: 'A256GCM',
            ext: true,
            key_ops: ['encrypt', 'decrypt'],
          }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('via-gent-master-key');
      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      expect(mockCrypto.subtle.exportKey).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'via-gent-master-key',
        expect.stringContaining('"kty"')
      );
    });

    it('should load existing master key from localStorage', async () => {
      const mockJwkKey = {
        kty: 'oct',
        k: 'mock-key-data',
        alg: 'A256GCM',
      };
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(JSON.stringify(mockJwkKey)),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue(mockJwkKey),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('via-gent-master-key');
      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        'jwk',
        mockJwkKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    });

    it('should throw error if master key is invalid', async () => {
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue('invalid-json'),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue(mockJwkKey),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await expect(vault.initialize()).rejects.toThrow();
    });
  });

  describe('storeCredentials', () => {
    it('should encrypt credentials before storing', async () => {
      const providerId = 'openrouter';
      const apiKey = 'test-api-key-123';

      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      // Mock crypto
      const mockKey: CryptoKey = {} as CryptoKey;
      const mockIv = new Uint8Array(12);
      const mockEncrypted = new Uint8Array(32);
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
          encrypt: vi.fn().mockResolvedValue(mockEncrypted.buffer),
        },
        getRandomValues: vi.fn().mockReturnValue(mockIv),
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      await vault.storeCredentials(providerId, apiKey);

      expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'AES-GCM',
          iv: mockIv,
        }),
        mockKey,
        expect.any(Uint8Array)
      );
      expect(mockCredentialsTable.put).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId,
          encrypted: expect.any(String),
          iv: expect.any(String),
          createdAt: expect.any(Date),
        })
      );
    });

    it('should generate unique IV for each encryption', async () => {
      const providerId = 'openrouter';
      const apiKey = 'test-api-key-123';

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockIv1 = new Uint8Array(12);
      const mockIv2 = new Uint8Array(12);
      const mockEncrypted = new Uint8Array(32);
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
          encrypt: vi.fn()
            .mockResolvedValueOnce(mockEncrypted.buffer)
            .mockResolvedValueOnce(mockEncrypted.buffer),
        },
        getRandomValues: vi.fn()
          .mockReturnValueOnce(mockIv1)
          .mockReturnValueOnce(mockIv2),
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      await vault.storeCredentials(providerId, apiKey);
      await vault.storeCredentials(providerId, apiKey);

      const firstCall = (mockCrypto.subtle.encrypt as any).mock.calls[0];
      const secondCall = (mockCrypto.subtle.encrypt as any).mock.calls[1];

      // IVs should be different
      expect(firstCall[0].iv).not.toBe(secondCall[0].iv);
    });

    it('should throw error if not initialized', async () => {
      const vault = new CredentialVault();

      await expect(
        vault.storeCredentials('openrouter', 'test-key')
      ).rejects.toThrow('Vault not initialized');
    });
  });

  describe('getCredentials', () => {
    it('should decrypt credentials from storage', async () => {
      const providerId = 'openrouter';
      const apiKey = 'test-api-key-123';

      const mockCredential = {
        providerId,
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        createdAt: new Date(),
      };

      mockCredentialsTable.get.mockResolvedValue(mockCredential);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockDecrypted = new Uint8Array(apiKey.length);
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
          decrypt: vi.fn().mockResolvedValue(mockDecrypted.buffer),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      const decrypted = await vault.getCredentials(providerId);

      expect(mockCredentialsTable.get).toHaveBeenCalledWith(providerId);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
    });

    it('should return null if credentials not found', async () => {
      mockCredentialsTable.get.mockResolvedValue(undefined);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      const decrypted = await vault.getCredentials('nonexistent');

      expect(decrypted).toBeNull();
    });

    it('should throw error if not initialized', async () => {
      const vault = new CredentialVault();

      await expect(
        vault.getCredentials('openrouter')
      ).rejects.toThrow('Vault not initialized');
    });
  });

  describe('hasCredentials', () => {
    it('should return true if credentials exist', async () => {
      const providerId = 'openrouter';

      const mockCredential = {
        providerId,
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        createdAt: new Date(),
      };

      mockCredentialsTable.get.mockResolvedValue(mockCredential);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      const hasCreds = await vault.hasCredentials(providerId);

      expect(hasCreds).toBe(true);
    });

    it('should return false if credentials do not exist', async () => {
      mockCredentialsTable.get.mockResolvedValue(undefined);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      const hasCreds = await vault.hasCredentials('nonexistent');

      expect(hasCreds).toBe(false);
    });

    it('should throw error if not initialized', async () => {
      const vault = new CredentialVault();

      await expect(
        vault.hasCredentials('openrouter')
      ).rejects.toThrow('Vault not initialized');
    });
  });

  describe('deleteCredentials', () => {
    it('should delete credentials from storage', async () => {
      const providerId = 'openrouter';

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      await vault.deleteCredentials(providerId);

      expect(mockCredentialsTable.delete).toHaveBeenCalledWith(providerId);
    });

    it('should throw error if not initialized', async () => {
      const vault = new CredentialVault();

      await expect(
        vault.deleteCredentials('openrouter')
      ).rejects.toThrow('Vault not initialized');
    });
  });

  describe('getStoredProviders', () => {
    it('should return list of stored provider IDs', async () => {
      const mockCredentials = [
        { providerId: 'openrouter', createdAt: new Date() },
        { providerId: 'anthropic', createdAt: new Date() },
      ];

      mockCredentialsTable.toArray.mockResolvedValue(mockCredentials);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      const providers = await vault.getStoredProviders();

      expect(providers).toEqual(['openrouter', 'anthropic']);
    });

    it('should return empty array if no credentials stored', async () => {
      mockCredentialsTable.toArray.mockResolvedValue([]);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      const providers = await vault.getStoredProviders();

      expect(providers).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should delete all credentials', async () => {
      const mockCredentials = [
        { providerId: 'openrouter' },
        { providerId: 'anthropic' },
      ];

      mockCredentialsTable.toArray.mockResolvedValue(mockCredentials);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
        removeItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      await vault.clear();

      expect(mockCredentialsTable.delete).toHaveBeenCalledTimes(2);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('via-gent-master-key');
    });

    it('should remove master key from localStorage', async () => {
      const mockCredentials = [];

      mockCredentialsTable.toArray.mockResolvedValue(mockCredentials);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn().mockImplementation(() => {}),
        removeItem: vi.fn().mockImplementation(() => {}),
      };
      vi.stubGlobal('localStorage', localStorageMock);

      const mockKey: CryptoKey = {} as CryptoKey;
      const mockCrypto = {
        subtle: {
          generateKey: vi.fn().mockResolvedValue(mockKey),
          importKey: vi.fn().mockResolvedValue(mockKey),
          exportKey: vi.fn().mockResolvedValue({ kty: 'oct' }),
        },
      };
      vi.stubGlobal('crypto', mockCrypto as any);

      await vault.initialize();
      await vault.clear();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('via-gent-master-key');
    });
  });

  describe('singleton', () => {
    it('should export singleton instance', () => {
      expect(credentialVault).toBeInstanceOf(CredentialVault);
    });
  });
});
