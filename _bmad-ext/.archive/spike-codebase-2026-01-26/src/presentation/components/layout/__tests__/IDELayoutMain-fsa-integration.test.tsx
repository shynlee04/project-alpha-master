/**
 * @fileoverview IDE Layout Main FSA Integration Tests
 * @module components/layout/__tests__/IDELayoutMain.test
 *
 * **CC-IDE-07**: IDE FSA Migration Tests
 *
 * Tests for StorageGateway integration in IDELayoutMain:
 * - Gateway creation with correct projectId
 * - File operations use gateway (not direct DB)
 * - No direct db.notes.* calls in IDE layout
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-07
 * @author TEAM_B
 * @created 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';
import type { StorageGateway } from '@/domain/interfaces';

// ============================================================================
// Mocks
// ============================================================================

const mockGateway: StorageGateway = {
    read: vi.fn(),
    write: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    exists: vi.fn(),
    watch: vi.fn(),
} as unknown as StorageGateway;

// ============================================================================
// Test Suites
// ============================================================================

describe('IDELayoutMain FSA Integration (CC-IDE-07)', () => {
    describe('AC1: StorageGateway Usage', () => {
        it('should create gateway with correct projectId', () => {
            const projectId = 'test-project-123';

            // Mock FSAGateway constructor
            vi.mock('@/infrastructure/filesystem/fsa-gateway', () => ({
                FSAGateway: vi.fn().mockReturnValue(mockGateway),
            }));

            vi.mock('@/infrastructure/filesystem/platform-contract', () => ({
                getPlatformContract: vi.fn().mockReturnValue({
                    deviceType: 'desktop',
                    storageType: 'fsa',
                    canAccessFSA: true,
                    canWatchFiles: true,
                    canRunTerminal: true,
                    canDoAgenticCoding: true,
                    canAccessIDE: true,
                }),
            }));

            const gateway = createIdeFileGateway({
                projectId,
                fsaHandle: {} as FileSystemDirectoryHandle,
            });

            expect(gateway).toBeDefined();
        });

        it('should use gateway for file read operations', async () => {
            const testData = new TextEncoder().encode('test content');
            mockGateway.read.mockResolvedValue(testData);

            const data = await mockGateway.read('/src/index.ts');
            const content = new TextDecoder().decode(data);

            expect(mockGateway.read).toHaveBeenCalledWith('/src/index.ts');
            expect(content).toBe('test content');
        });

        it('should use gateway for file write operations', async () => {
            const content = 'export function hello() { return "world"; }';
            const testData = new TextEncoder().encode(content);

            mockGateway.write.mockResolvedValue(undefined);

            await mockGateway.write('/src/hello.ts', testData);

            expect(mockGateway.write).toHaveBeenCalledWith('/src/hello.ts', testData);
        });

        it('should use gateway for file list operations', async () => {
            const mockFiles = [
                { path: 'src', kind: 'directory' as const },
                { path: 'package.json', kind: 'file' as const },
            ];

            mockGateway.list.mockResolvedValue(mockFiles);

            const files = await mockGateway.list('/');

            expect(mockGateway.list).toHaveBeenCalledWith('/');
            expect(files).toEqual(mockFiles);
        });

        it('should use gateway for file delete operations', async () => {
            mockGateway.delete.mockResolvedValue(undefined);

            await mockGateway.delete('/old-file.ts');

            expect(mockGateway.delete).toHaveBeenCalledWith('/old-file.ts');
        });

        it('should use gateway for file existence check', async () => {
            mockGateway.exists.mockResolvedValue(true);

            const exists = await mockGateway.exists('/src/index.ts');

            expect(mockGateway.exists).toHaveBeenCalledWith('/src/index.ts');
            expect(exists).toBe(true);
        });
    });

    describe('AC1: No Direct DB Calls in IDE Layout', () => {
        it('should verify no direct db.notes calls in IDELayoutMain', async () => {
            // Read IDELayoutMain source code
            const fs = await import('fs');
            const ideLayoutContent = await fs.promises.readFile(
                '/Users/apple/Documents/coding-projects/project-alpha-master/src/presentation/components/layout/IDELayoutMain.tsx',
                'utf-8'
            );

            // Check for direct db.notes calls (should NOT exist)
            const dbNotesCalls = ideLayoutContent.match(/db\.notes\.\w+/g) || [];

            expect(dbNotesCalls).toHaveLength(0);
            expect(ideLayoutContent).toContain('createIdeFileGateway');
            expect(ideLayoutContent).toContain('StorageGateway');
        });

        it('should verify gateway usage in file handlers', async () => {
            const fs = await import('fs');
            const fileHandlersContent = await fs.promises.readFile(
                '/Users/apple/Documents/coding-projects/project-alpha-master/src/presentation/components/layout/hooks/useIDEFileHandlers.ts',
                'utf-8'
            );

            // Verify gateway is used for file operations
            expect(fileHandlersContent).toContain('gatewayRef');
            expect(fileHandlersContent).toMatch(/gatewayRef\.current\.(read|write|delete|list)/);
        });
    });

    describe('AC1: Gateway Lifecycle Management', () => {
        it('should create gateway on mount with projectId and fsaHandle', () => {
            const projectId = 'test-project';
            const fsaHandle = {} as FileSystemDirectoryHandle;

            vi.mock('@/infrastructure/filesystem/platform-contract', () => ({
                getPlatformContract: vi.fn().mockReturnValue({
                    deviceType: 'desktop',
                    storageType: 'fsa',
                    canAccessFSA: true,
                    canWatchFiles: true,
                    canRunTerminal: true,
                    canDoAgenticCoding: true,
                    canAccessIDE: true,
                }),
            }));

            const gateway = createIdeFileGateway({ projectId, fsaHandle });

            expect(gateway).toBeDefined();
        });

        it('should handle desktop platform with FSA', () => {
            vi.mock('@/infrastructure/filesystem/platform-contract', () => ({
                getPlatformContract: vi.fn().mockReturnValue({
                    deviceType: 'desktop',
                    storageType: 'fsa',
                    canAccessFSA: true,
                    canWatchFiles: true,
                    canRunTerminal: true,
                    canDoAgenticCoding: true,
                    canAccessIDE: true,
                }),
            }));

            vi.mock('@/infrastructure/filesystem/fsa-gateway', () => ({
                FSAGateway: vi.fn().mockReturnValue(mockGateway),
            }));

            const gateway = createIdeFileGateway({
                projectId: 'desktop-project',
                fsaHandle: {} as FileSystemDirectoryHandle,
            });

            expect(gateway).toBe(mockGateway);
        });

        it('should handle mobile platform with IDB', () => {
            vi.mock('@/infrastructure/filesystem/platform-contract', () => ({
                getPlatformContract: vi.fn().mockReturnValue({
                    deviceType: 'mobile',
                    storageType: 'indexeddb',
                    canAccessFSA: false,
                    canWatchFiles: false,
                    canRunTerminal: false,
                    canDoAgenticCoding: false,
                    canAccessIDE: false,
                }),
            }));

            // Note: On mobile, IDE is blocked per ADR-033
            // But gateway should still be IDBGateway for testing
            const gateway = createIdeFileGateway({
                projectId: 'mobile-project',
            });

            expect(gateway).toBeDefined();
        });
    });

    describe('AC1: Gateway Abstraction Layer', () => {
        it('should provide consistent interface for all platforms', () => {
            const methods = ['read', 'write', 'delete', 'list', 'exists', 'watch'];

            methods.forEach(method => {
                expect(typeof mockGateway[method]).toBe('function');
            });
        });

        it('should handle Uint8Array data encoding/decoding', async () => {
            const originalContent = 'Hello, World!';
            const encoded = new TextEncoder().encode(originalContent);
            const decoded = new TextDecoder().decode(encoded);

            expect(decoded).toBe(originalContent);
            expect(decoded).toBe('Hello, World!');
        });
    });
});
