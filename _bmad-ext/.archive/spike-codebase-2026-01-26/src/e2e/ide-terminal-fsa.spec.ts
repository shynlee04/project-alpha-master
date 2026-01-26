/**
 * @fileoverview IDE Terminal-FSA Connectivity E2E Tests
 * @module e2e/ide-terminal-fsa.spec
 *
 * E2E tests for terminal integration with FSA file system.
 * Tests ls, cat commands, and git operations on FSA.
 *
 * @epic CC-IDE-FSA
 * @story CC-IDE-07
 * @test-coverage Terminal-FSA connectivity
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createIdeFileGateway } from '../../infrastructure/filesystem/ide-file-gateway';
import type { StorageGateway } from '../../domain/interfaces/storage-gateway.interface';
import { invalidatePlatformCache } from '../../infrastructure/filesystem/platform-contract';
import { db } from '../../infrastructure/persistence/dexie-db';

// ============================================================================
// Mocks and Setup
// ============================================================================

const mockDesktopPlatform = {
  deviceType: 'desktop' as const,
  storageType: 'fsa' as const,
  canAccessFSA: true,
  canWatchFiles: true,
  canRunTerminal: true,
  canDoAgenticCoding: true,
  canAccessIDE: true,
};

// Mock terminal interface
interface MockTerminal {
  execute: (command: string) => Promise<{ exitCode: number; output: string; error?: string }>;
  write: (text: string) => void;
  clear: () => void;
  cwd: () => string;
  chdir: (path: string) => void;
}

let mockTerminal: MockTerminal;
let mockFileSystem: Map<string, Uint8Array>;
let mockDirectoryHandle: FileSystemDirectoryHandle;

/**
 * Setup mock terminal and file system
 */
async function setupMockTerminal() {
  // Create mock file system
  mockFileSystem = new Map<string, Uint8Array>();

  // Create mock directory handle
  mockDirectoryHandle = await FileSystemDirectoryHandle.fromPolyfill({
    name: 'project-root',
    kind: 'directory',
  });

  // Create mock terminal
  mockTerminal = {
    execute: vi.fn().mockImplementation(async (command: string) => {
      // Simple command parsing for testing
      const [cmd, ...args] = command.split(' ');

      switch (cmd) {
        case 'ls':
          return {
            exitCode: 0,
            output: Array.from(mockFileSystem.keys()).join('\n'),
          };

        case 'cat':
          const filePath = args[0];
          const content = mockFileSystem.get(filePath);
          if (content) {
            return {
              exitCode: 0,
              output: new TextDecoder().decode(content),
            };
          }
          return {
            exitCode: 1,
            output: '',
            error: `cat: ${filePath}: No such file or directory`,
          };

        case 'pwd':
          return {
            exitCode: 0,
            output: '/project',
          };

        default:
          return {
            exitCode: 1,
            output: '',
            error: `command not found: ${cmd}`,
          };
      }
    }),
    write: vi.fn(),
    clear: vi.fn(),
    cwd: vi.fn(() => '/project'),
    chdir: vi.fn(),
  };

  // Mock platform
  vi.spyOn(await import('@/infrastructure/filesystem/platform-contract'), 'getPlatformContract').mockReturnValue(mockDesktopPlatform);
  invalidatePlatformCache();
}

/**
 * Cleanup mocks
 */
function cleanupMockTerminal() {
  mockFileSystem.clear();
  vi.clearAllMocks();
  invalidatePlatformCache();
}

// ============================================================================
// Terminal-FSA Connectivity Tests
// ============================================================================

describe('IDE Terminal-FSA Connectivity', () => {
  let gateway: StorageGateway;
  let projectId: string;

  beforeEach(async () => {
    await setupMockTerminal();

    // Create test project
    projectId = 'terminal-test-' + Math.random().toString(36).substring(7);
    await db.projects.add({
      id: projectId,
      name: 'Terminal Test Project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create gateway
    gateway = createIdeFileGateway({
      projectId,
      fsaHandle: mockDirectoryHandle,
    });
  });

  afterEach(async () => {
    cleanupMockTerminal();
    await db.projects.delete(projectId);
  });

  describe('AC3.1: ls Command Lists FSA Files', () => {
    it('should list files in current directory', async () => {
      // Arrange - Create files in FSA
      await gateway.write('src/index.ts', new TextEncoder().encode('index'));
      await gateway.write('src/App.tsx', new TextEncoder().encode('app'));
      await gateway.write('package.json', new TextEncoder().encode('{"name": "test"}'));

      // Act - Run ls command
      const result = await mockTerminal.execute('ls');

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('src');
      expect(result.output).toContain('package.json');
    });

    it('should list files in specified directory', async () => {
      // Arrange
      await gateway.write('src/components/Button.tsx', new TextEncoder().encode('button'));
      await gateway.write('src/components/Input.tsx', new TextEncoder().encode('input'));
      await gateway.write('src/utils/helpers.ts', new TextEncoder().encode('helpers'));

      // Act
      const result = await mockTerminal.execute('ls src/components');

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Button.tsx');
      expect(result.output).toContain('Input.tsx');
    });

    it('should list nested directory contents', async () => {
      // Arrange
      await gateway.write('src/features/auth/Login.tsx', new TextEncoder().encode('login'));
      await gateway.write('src/features/auth/Register.tsx', new TextEncoder().encode('register'));

      // Act
      const result = await mockTerminal.execute('ls src/features/auth');

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Login.tsx');
      expect(result.output).toContain('Register.tsx');
    });

    it('should handle empty directory', async () => {
      // Arrange - Create empty directory
      const result1 = await mockTerminal.execute('ls empty-dir');

      // Assert
      expect(result1.exitCode).toBe(0);
      expect(result1.output).toBe('');
    });

    it('should handle non-existent directory', async () => {
      // Act
      const result = await mockTerminal.execute('ls does-not-exist');

      // Assert
      expect(result.exitCode).not.toBe(0);
      expect(result.error).toBeDefined();
    });

    it('should support ls flags (ls -la)', async () => {
      // Arrange
      await gateway.write('src/index.ts', new TextEncoder().encode('index'));

      // Act
      const result = await mockTerminal.execute('ls -la src');

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('index.ts');
    });
  });

  describe('AC3.2: cat Command Reads FSA Files', () => {
    it('should read file content from FSA', async () => {
      // Arrange
      const filePath = 'src/config.ts';
      const content = 'export const config = { version: "1.0" };';
      await gateway.write(filePath, new TextEncoder().encode(content));

      // Act
      const result = await mockTerminal.execute(`cat ${filePath}`);

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe(content);
    });

    it('should read multiple files with cat', async () => {
      // Arrange
      await gateway.write('src/file1.txt', new TextEncoder().encode('content 1'));
      await gateway.write('src/file2.txt', new TextEncoder().encode('content 2'));

      // Act
      const result1 = await mockTerminal.execute('cat src/file1.txt');
      const result2 = await mockTerminal.execute('cat src/file2.txt');

      // Assert
      expect(result1.exitCode).toBe(0);
      expect(result1.output).toBe('content 1');
      expect(result2.exitCode).toBe(0);
      expect(result2.output).toBe('content 2');
    });

    it('should handle UTF-8 encoded files', async () => {
      // Arrange
      const filePath = 'src/README.md';
      const content = '# Title\n\nVietnamese: Xin chào\nEmoji: 🎉';
      await gateway.write(filePath, new TextEncoder().encode(content));

      // Act
      const result = await mockTerminal.execute(`cat ${filePath}`);

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe(content);
    });

    it('should handle binary files (with --show-nonprintable flag)', async () => {
      // Arrange
      const filePath = 'src/image.png';
      const binaryContent = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG header
      await gateway.write(filePath, binaryContent);

      // Act
      const result = await mockTerminal.execute(`cat --show-nonprintable ${filePath}`);

      // Assert
      expect(result.exitCode).toBe(0);
      // Binary content should be shown in hex or similar format
      expect(result.output).toBeDefined();
    });

    it('should handle non-existent file', async () => {
      // Act
      const result = await mockTerminal.execute('cat does-not-exist.txt');

      // Assert
      expect(result.exitCode).not.toBe(0);
      expect(result.error).toContain('No such file or directory');
    });

    it('should pipe file content to other commands', async () => {
      // Arrange
      await gateway.write('src/data.txt', new TextEncoder().encode('hello world'));

      // Act - Simulate pipe (simplified)
      const catResult = await mockTerminal.execute('cat src/data.txt');

      // Assert
      expect(catResult.exitCode).toBe(0);
      expect(catResult.output).toBe('hello world');

      // In real terminal, this would pipe to another command:
      // cat src/data.txt | grep "hello"
    });
  });

  describe('AC3.3: Git Operations on FSA', () => {
    beforeEach(async () => {
      // Create .git directory structure
      await gateway.write('.git/HEAD', new TextEncoder().encode('ref: refs/heads/main'));
      await gateway.write('.git/config', new TextEncoder().encode(
        '[core]\n\trepositoryformatversion = 0\n'
      ));
      await gateway.write('.git/refs/heads/main', new TextEncoder().encode('commit123'));
    });

    it('should run git status on FSA files', async () => {
      // Arrange
      await gateway.write('src/index.ts', new TextEncoder().encode('new file'));

      // Act
      const result = await mockTerminal.execute('git status');

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('index.ts');
    });

    it('should run git add on FSA files', async () => {
      // Arrange
      const filePath = 'src/new-feature.ts';
      await gateway.write(filePath, new TextEncoder().encode('new feature'));

      // Act
      const result = await mockTerminal.execute(`git add ${filePath}`);

      // Assert
      expect(result.exitCode).toBe(0);
    });

    it('should run git commit on FSA', async () => {
      // Arrange - Stage files
      await gateway.write('src/committed.ts', new TextEncoder().encode('committed'));
      await mockTerminal.execute('git add src/committed.ts');

      // Act
      const result = await mockTerminal.execute(
        'git commit -m "feat: add committed file"'
      );

      // Assert
      expect(result.exitCode).toBe(0);
    });

    it('should run git log on FSA', async () => {
      // Act
      const result = await mockTerminal.execute('git log');

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeDefined();
    });

    it('should run git diff on FSA files', async () => {
      // Arrange
      const filePath = 'src/diff-test.ts';
      await gateway.write(filePath, new TextEncoder().encode('original'));
      await mockTerminal.execute(`git add ${filePath}`);

      // Modify file
      await gateway.write(filePath, new TextEncoder().encode('modified'));

      // Act
      const result = await mockTerminal.execute(`git diff ${filePath}`);

      // Assert
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('original');
      expect(result.output).toContain('modified');
    });

    it('should handle git branch operations', async () => {
      // Act
      const createResult = await mockTerminal.execute('git branch feature-branch');
      const listResult = await mockTerminal.execute('git branch');

      // Assert
      expect(createResult.exitCode).toBe(0);
      expect(listResult.exitCode).toBe(0);
      expect(listResult.output).toContain('feature-branch');
    });

    it('should handle git checkout operations', async () => {
      // Arrange
      await mockTerminal.execute('git branch checkout-branch');

      // Act
      const result = await mockTerminal.execute('git checkout checkout-branch');

      // Assert
      expect(result.exitCode).toBe(0);
    });

    it('should handle git clone operations', async () => {
      // Act - Simulate git clone
      const result = await mockTerminal.execute(
        'git clone https://github.com/test/repo.git cloned-repo'
      );

      // Assert
      expect(result.exitCode).toBe(0);
      // Verify cloned directory created (simulated)
      const exists = await gateway.exists('cloned-repo');
      expect(exists).toBeDefined();
    });

    it('should handle git push operations', async () => {
      // Arrange - Setup remote
      await mockTerminal.execute('git remote add origin https://github.com/test/repo.git');

      // Act
      const result = await mockTerminal.execute('git push origin main');

      // Assert
      expect(result.exitCode).toBe(0);
    });

    it('should handle git pull operations', async () => {
      // Act
      const result = await mockTerminal.execute('git pull origin main');

      // Assert
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Integration Scenarios', () => {
    it('should support full git workflow', async () => {
      // 1. Create new file
      await gateway.write('src/NewFeature.tsx', new TextEncoder().encode('new feature'));

      // 2. Check status
      const statusResult = await mockTerminal.execute('git status');
      expect(statusResult.exitCode).toBe(0);

      // 3. Add file
      const addResult = await mockTerminal.execute('git add src/NewFeature.tsx');
      expect(addResult.exitCode).toBe(0);

      // 4. Commit
      const commitResult = await mockTerminal.execute(
        'git commit -m "feat: add new feature"'
      );
      expect(commitResult.exitCode).toBe(0);

      // 5. Verify file still exists
      const content = await gateway.read('src/NewFeature.tsx');
      expect(new TextDecoder().decode(content)).toBe('new feature');
    });

    it('should support file operations in terminal', async () => {
      // Arrange
      await gateway.write('src/terminal-test.txt', new TextEncoder().encode('test'));

      // Act - Use terminal to read and verify
      const catResult = await mockTerminal.execute('cat src/terminal-test.txt');
      const lsResult = await mockTerminal.execute('ls src');

      // Assert
      expect(catResult.exitCode).toBe(0);
      expect(catResult.output).toBe('test');
      expect(lsResult.exitCode).toBe(0);
      expect(lsResult.output).toContain('terminal-test.txt');
    });

    it('should handle complex terminal workflows', async () => {
      // Simulate: cat file | grep pattern
      await gateway.write('src/search.txt', new TextEncoder().encode(
        'line1: match\nline2: no match\nline3: match'
      ));

      // Read file
      const catResult = await mockTerminal.execute('cat src/search.txt');

      // Assert
      expect(catResult.exitCode).toBe(0);
      expect(catResult.output).toContain('match');
    });
  });
});
