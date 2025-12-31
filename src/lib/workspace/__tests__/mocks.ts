/**
 * @fileoverview Test Mocks and Fixtures for Story WB-1
 * @governance EPIC-WB-1
 */

import { vi } from 'vitest';

/**
 * Mock File System Access API handle
 */
export const mockFSAHandle: FileSystemDirectoryHandle = {
    kind: 'directory',
    name: 'mock-project',
    queryPermission: vi.fn().mockResolvedValue('granted'),
    requestPermission: vi.fn().mockResolvedValue('granted'),
    isSameEntry: vi.fn().mockResolvedValue(false),
    getDirectoryHandle: vi.fn(),
    getFileHandle: vi.fn(),
    removeEntry: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    resolve: vi.fn(),
} as any;

/**
 * Mock crypto.randomUUID for consistent test IDs
 */
export const mockCrypto = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2),
};

// Stub global crypto
vi.stubGlobal('crypto', mockCrypto);
vi.stubGlobal('Crypto', mockCrypto);

/**
 * Mock IndexedDB database for testing schema migrations
 */
export const mockIndexedDB = {
    open: vi.fn().mockImplementation((name: string, version?: number) => ({
        onerror: vi.fn(),
        onupgradeneeded: vi.fn(),
        onsuccess: vi.fn(),
        result: {
            name,
            version: version || 1,
            objectStoreNames: {
                contains: vi.fn().mockReturnValue(true),
            },
            close: vi.fn(),
            createObjectStore: vi.fn(),
            transaction: vi.fn().mockReturnValue({
                objectStore: vi.fn().mockReturnValue({
                    put: vi.fn(),
                    get: vi.fn(),
                    getAll: vi.fn(),
                    delete: vi.fn(),
                }),
            }),
        },
    })),
};

// Stub global indexedDB
vi.stubGlobal('indexedDB', mockIndexedDB);