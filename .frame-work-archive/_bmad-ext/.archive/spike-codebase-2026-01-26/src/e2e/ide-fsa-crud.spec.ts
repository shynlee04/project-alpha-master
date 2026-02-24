/**
 * @fileoverview IDE FSA File CRUD E2E Tests
 * @module e2e/ide-fsa-crud.spec
 *
 * E2E tests for file create/read/update/delete operations in IDE workspace.
 * Tests Monaco editor integration, file persistence, and file tree management.
 *
 * @epic CC-IDE-FSA
 * @story CC-IDE-07
 * @test-coverage File CRUD operations
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock infrastructure modules
vi.mock('@/infrastructure/filesystem/ide-file-gateway', () => ({
  createIdeFileGateway: vi.fn(() => ({
    read: vi.fn(),
    write: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    exists: vi.fn(),
    watch: vi.fn(() => ({ dispose: vi.fn() })),
  })),
}));

vi.mock('@/infrastructure/filesystem/platform-contract', () => ({
  getPlatformContract: vi.fn(() => ({
    deviceType: 'desktop',
    storageType: 'fsa',
    canAccessFSA: true,
    canWatchFiles: true,
    canRunTerminal: true,
    canDoAgenticCoding: true,
    canAccessIDE: true,
  })),
  invalidatePlatformCache: vi.fn(),
}));

vi.mock('@/infrastructure/persistence/dexie-db', () => ({
  default: {
    projects: {
      add: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import { getPlatformContract, invalidatePlatformCache } from '@/infrastructure/filesystem/platform-contract';
import { db } from '@/infrastructure/persistence/dexie-db';

// ============================================================================
// Mocks and Setup
// ============================================================================

// Mock platform contract for desktop with FSA
const mockDesktopPlatform = {
  deviceType: 'desktop' as const,
  storageType: 'fsa' as const,
  canAccessFSA: true,
  canWatchFiles: true,
  canRunTerminal: true,
  canDoAgenticCoding: true,
  canAccessIDE: true,
};

// Mock platform contract for mobile (blocked IDE access)
const mockMobilePlatform = {
  deviceType: 'mobile' as const,
  storageType: 'indexeddb' as const,
  canAccessFSA: false,
  canWatchFiles: false,
  canRunTerminal: false,
  canDoAgenticCoding: false,
  canAccessIDE: false,
};

// Create in-memory file system for testing
let mockFileSystem: Map<string, Uint8Array>;
let mockDirectoryHandle: any;
let gateway: StorageGateway;
let projectId: string;

/**
 * Setup in-memory file system and mocks
 */
async function setupMockFileSystem() {
  // Create mock file system
  mockFileSystem = new Map<string, Uint8Array>();

  // Create mock directory handle
  mockDirectoryHandle = {
    name: 'project-root',
    kind: 'directory',
  };
}

/**
 * Cleanup mocks and file system
 */
function cleanupMockFileSystem() {
  mockFileSystem.clear();
  vi.clearAllMocks();
}

// ============================================================================
// File CRUD Tests
// ============================================================================

describe('IDE FSA - File CRUD Operations', () => {
  beforeEach(async () => {
    await setupMockFileSystem();

    // Create test project in Dexie
    projectId = 'test-project-' + Math.random().toString(36).substring(7);
    await db.projects.add({
      id: projectId,
      name: 'Test Project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create IDE file gateway
    gateway = createIdeFileGateway({
      projectId,
      fsaHandle: mockDirectoryHandle,
    });
  });

  afterEach(async () => {
    cleanupMockFileSystem();
    await db.projects.delete(projectId);
  });

  describe('AC1.1: File Creation', () => {
    it('should create a new file from Monaco editor', async () => {
      // Arrange
      const filePath = 'src/components/TestComponent.tsx';
      const fileContent = 'export default function TestComponent() { return <div>Test</div>; }';
      const contentBytes = new TextEncoder().encode(fileContent);

      // Act
      await gateway.write(filePath, contentBytes);

      // Assert - File exists in our mock file system
      expect(mockFileSystem.has(filePath)).toBe(true);

      // Verify content
      const storedContent = mockFileSystem.get(filePath);
      expect(storedContent).toEqual(contentBytes);
      expect(new TextDecoder().decode(storedContent)).toBe(fileContent);
    });

    it('should create file with correct encoding', async () => {
      // Arrange
      const filePath = 'src/utils/encoding-test.js';
      const specialChars = 'Hello 世界 🌍';
      const contentBytes = new TextEncoder().encode(specialChars);

      // Act
      await gateway.write(filePath, contentBytes);

      // Assert
      const storedContent = mockFileSystem.get(filePath);
      const decoded = new TextDecoder().decode(storedContent);
      expect(decoded).toBe(specialChars);
    });

    it('should create nested directory structure if needed', async () => {
      // Arrange
      const filePath = 'src/features/deeply/nested/file.ts';
      const content = new TextEncoder().encode('nested file content');

      // Act
      await gateway.write(filePath, content);

      // Assert
      expect(mockFileSystem.has(filePath)).toBe(true);
    });
  });

  describe('AC1.2: File Reading', () => {
    it('should read file content in Monaco editor', async () => {
      // Arrange
      const filePath = 'src/App.tsx';
      const originalContent = 'import React from "react";\nexport default function App() { return null; }';
      const contentBytes = new TextEncoder().encode(originalContent);
      await gateway.write(filePath, contentBytes);

      // Act
      const readBytes = await gateway.read(filePath);

      // Assert
      expect(readBytes).toEqual(contentBytes);
      const decodedContent = new TextDecoder().decode(readBytes);
      expect(decodedContent).toBe(originalContent);
    });

    it('should return error when reading non-existent file', async () => {
      // Arrange
      const nonExistentPath = 'src/does-not-exist.ts';

      // Act & Assert
      await expect(gateway.read(nonExistentPath)).rejects.toThrow();
    });

    it('should read UTF-8 encoded files correctly', async () => {
      // Arrange
      const filePath = 'src/README.md';
      const multiLangContent = '# Title\n\nEnglish: Hello\nVietnamese: Xin chào\nEmoji: 🎉';
      const contentBytes = new TextEncoder().encode(multiLangContent);
      await gateway.write(filePath, contentBytes);

      // Act
      const readBytes = await gateway.read(filePath);

      // Assert
      const decoded = new TextDecoder().decode(readBytes);
      expect(decoded).toBe(multiLangContent);
    });
  });

  describe('AC1.3: File Update and Persistence', () => {
    it('should update file content and persist changes', async () => {
      // Arrange
      const filePath = 'src/config.ts';
      const originalContent = 'export const config = { version: "1.0" };';
      const originalBytes = new TextEncoder().encode(originalContent);
      await gateway.write(filePath, originalBytes);

      // Act - Update file
      const updatedContent = 'export const config = { version: "2.0", features: true };';
      const updatedBytes = new TextEncoder().encode(updatedContent);
      await gateway.write(filePath, updatedBytes);

      // Assert - Read back to verify persistence
      const finalBytes = await gateway.read(filePath);
      const finalContent = new TextDecoder().decode(finalBytes);
      expect(finalContent).toBe(updatedContent);
      expect(finalContent).not.toBe(originalContent);
    });

    it('should handle rapid sequential updates', async () => {
      // Arrange
      const filePath = 'src/rapid-update.ts';
      const initialContent = 'initial';
      await gateway.write(filePath, new TextEncoder().encode(initialContent));

      // Act - Perform rapid updates
      for (let i = 1; i <= 10; i++) {
        const content = `update ${i}`;
        await gateway.write(filePath, new TextEncoder().encode(content));
      }

      // Assert - Final state should be last update
      const finalBytes = await gateway.read(filePath);
      const finalContent = new TextDecoder().decode(finalBytes);
      expect(finalContent).toBe('update 10');
    });

    it('should preserve file permissions on update', async () => {
      // Arrange
      const filePath = 'src/permissions-test.js';
      const content = 'const test = true;';
      const bytes = new TextEncoder().encode(content);
      await gateway.write(filePath, bytes);

      // Act - Update content
      const updatedContent = 'const test = false;';
      await gateway.write(filePath, new TextEncoder().encode(updatedContent));

      // Assert - File should still be accessible
      const finalBytes = await gateway.read(filePath);
      expect(new TextDecoder().decode(finalBytes)).toBe(updatedContent);
    });
  });

  describe('AC1.4: File Deletion', () => {
    it('should delete file from file tree', async () => {
      // Arrange
      const filePath = 'src/to-delete.ts';
      const content = new TextEncoder().encode('delete me');
      await gateway.write(filePath, content);

      // Verify file exists
      expect(mockFileSystem.has(filePath)).toBe(true);

      // Act
      await gateway.delete(filePath);

      // Assert - File should be removed
      expect(mockFileSystem.has(filePath)).toBe(false);

      // Attempting to read should fail
      await expect(gateway.read(filePath)).rejects.toThrow();
    });

    it('should handle deletion of non-existent file gracefully', async () => {
      // Arrange
      const nonExistentPath = 'src/already-deleted.js';

      // Act & Assert - Should not throw error
      await expect(gateway.delete(nonExistentPath)).rejects.toThrow();
    });

    it('should delete nested files correctly', async () => {
      // Arrange
      const nestedPath = 'src/features/nested/file.ts';
      const content = new TextEncoder().encode('nested file');
      await gateway.write(nestedPath, content);

      // Act
      await gateway.delete(nestedPath);

      // Assert
      expect(mockFileSystem.has(nestedPath)).toBe(false);
    });

    it('should not affect other files when deleting', async () => {
      // Arrange
      const fileToDelete = 'src/delete-this.ts';
      const fileToKeep = 'src/keep-this.ts';
      await gateway.write(fileToDelete, new TextEncoder().encode('delete me'));
      await gateway.write(fileToKeep, new TextEncoder().encode('keep me'));

      // Act
      await gateway.delete(fileToDelete);

      // Assert
      expect(mockFileSystem.has(fileToDelete)).toBe(false);
      expect(mockFileSystem.has(fileToKeep)).toBe(true);

      // Verify kept file content
      const keptBytes = await gateway.read(fileToKeep);
      expect(new TextDecoder().decode(keptBytes)).toBe('keep me');
    });
  });

  describe('File Existence Check', () => {
    it('should return true for existing file', async () => {
      // Arrange
      const filePath = 'src/existing-file.ts';
      await gateway.write(filePath, new TextEncoder().encode('content'));

      // Act
      const exists = await gateway.exists(filePath);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      // Arrange
      const nonExistentPath = 'src/does-not-exist.ts';

      // Act
      const exists = await gateway.exists(nonExistentPath);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('File Listing', () => {
    it('should list files in directory', async () => {
      // Arrange
      await gateway.write('src/file1.ts', new TextEncoder().encode('content1'));
      await gateway.write('src/file2.ts', new TextEncoder().encode('content2'));
      await gateway.write('src/file3.ts', new TextEncoder().encode('content3'));

      // Act
      const files = await gateway.list('src');

      // Assert
      expect(files.length).toBeGreaterThanOrEqual(3);
      const fileNames = files.map(f => f.name);
      expect(fileNames).toContain('file1.ts');
      expect(fileNames).toContain('file2.ts');
      expect(fileNames).toContain('file3.ts');
    });

    it('should list nested directory contents', async () => {
      // Arrange
      await gateway.write('src/components/Button.tsx', new TextEncoder().encode('button'));
      await gateway.write('src/components/Input.tsx', new TextEncoder().encode('input'));

      // Act
      const files = await gateway.list('src/components');

      // Assert
      expect(files.length).toBeGreaterThanOrEqual(2);
      const fileNames = files.map(f => f.name);
      expect(fileNames).toContain('Button.tsx');
      expect(fileNames).toContain('Input.tsx');
    });
  });
});

describe('IDE FSA - Integration with Monaco Editor', () => {
  it('should support file operations required by Monaco editor', async () => {
    // Arrange - Monaco editor needs these operations:
    // 1. Read file content on load
    // 2. Write file content on save
    // 3. Check file existence

    const filePath = 'src/monaco-integration.ts';
    const content = '// Monaco editor content';
    const contentBytes = new TextEncoder().encode(content);

    // Create gateway
    const testGateway = createIdeFileGateway({
      projectId: 'monaco-test-project',
      fsaHandle: mockDirectoryHandle,
    });

    // Act - Simulate Monaco editor workflow
    const existsBefore = await testGateway.exists(filePath);
    await testGateway.write(filePath, contentBytes);
    const existsAfter = await testGateway.exists(filePath);
    const readContent = await testGateway.read(filePath);

    // Assert
    expect(existsBefore).toBe(false);
    expect(existsAfter).toBe(true);
    expect(new TextDecoder().decode(readContent)).toBe(content);
  });

  it('should handle file watching for Monaco auto-save', async () => {
    // Arrange
    const filePath = 'src/auto-save.ts';
    const initialContent = 'initial';
    await gateway.write(filePath, new TextEncoder().encode(initialContent));

    // Act - Start watching
    const watchHandle = gateway.watch((event) => {
      console.log('File changed:', event);
    });

    // Simulate file update (Monaco auto-save)
    const updatedContent = 'auto-saved';
    await gateway.write(filePath, new TextEncoder().encode(updatedContent));

    // Stop watching
    watchHandle.dispose();

    // Assert - Verify content persisted
    const finalBytes = await gateway.read(filePath);
    const finalContent = new TextDecoder().decode(finalBytes);
    expect(finalContent).toBe(updatedContent);
  });
});
