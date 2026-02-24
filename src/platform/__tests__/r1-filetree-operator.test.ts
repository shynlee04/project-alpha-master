/**
 * @fileoverview R-1 FileTreePlatformOperator Tests - Operator lifecycle
 * @module @/platform/__tests__/r1-filetree-operator.test
 *
 * Tests for FileTreePlatformOperator:
 * - IPlatformOperator interface implementation
 * - Lifecycle methods (onMount, onUnmount, onProjectChange)
 * - Idempotent initialization
 * - Health check passthrough
 *
 * Note: Due to module isolation issues with vitest threads, the legacy
 * operator mock cannot be fully isolated. Tests focus on public API
 * behavior and interface conformance.
 *
 * @epic Strategic Rebuild
 * @phase R-1 (Platform Layer)
 * @created 2026-02-02
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { IPlatformOperator } from '../types';
import {
  FileTreePlatformOperator,
  fileTreePlatformOperator,
} from '../operators/filetree';

// ============================================================================
// Test Suites
// ============================================================================

describe('R-1: FileTreePlatformOperator', () => {
  let operator: FileTreePlatformOperator;

  beforeEach(() => {
    // Create fresh instance for each test
    operator = new FileTreePlatformOperator();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // IPlatformOperator Interface Tests
  // --------------------------------------------------------------------------

  describe('IPlatformOperator Interface', () => {
    it('implements id: "filetree"', () => {
      expect(operator.id).toBe('filetree');
      expect(fileTreePlatformOperator.id).toBe('filetree');
    });

    it('implements name: "FileTree"', () => {
      expect(operator.name).toBe('FileTree');
      expect(fileTreePlatformOperator.name).toBe('FileTree');
    });

    it('implements onMount(projectId)', () => {
      expect(typeof operator.onMount).toBe('function');
      expect(operator.onMount.length).toBe(1); // Takes 1 parameter
    });

    it('implements onUnmount()', () => {
      expect(typeof operator.onUnmount).toBe('function');
      expect(operator.onUnmount.length).toBe(0); // Takes no parameters
    });

    it('implements onProjectChange(newProjectId)', () => {
      expect(typeof operator.onProjectChange).toBe('function');
      expect(operator.onProjectChange.length).toBe(1); // Takes 1 parameter
    });

    it('implements healthCheck()', () => {
      expect(typeof operator.healthCheck).toBe('function');
    });

    it('conforms to IPlatformOperator type', () => {
      // Type check: This would fail at compile time if interface not satisfied
      const operatorAsInterface: IPlatformOperator = operator;

      expect(operatorAsInterface.id).toBe('filetree');
      expect(operatorAsInterface.name).toBe('FileTree');
      expect(typeof operatorAsInterface.onMount).toBe('function');
      expect(typeof operatorAsInterface.onUnmount).toBe('function');
      expect(typeof operatorAsInterface.onProjectChange).toBe('function');
    });
  });

  // --------------------------------------------------------------------------
  // Lifecycle Tests
  // --------------------------------------------------------------------------

  describe('Lifecycle', () => {
    it('onMount does not throw', () => {
      // onMount should execute without throwing
      expect(() => operator.onMount('test-project-1')).not.toThrow();
    });

    it('onMount stores current projectId (verified via onProjectChange)', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      operator.onMount('project-abc');
      operator.onProjectChange('project-xyz');

      // Project change should log the previous projectId
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project-abc')
      );
    });

    it('onUnmount does not throw', () => {
      // First mount
      operator.onMount('test-project');

      // Then unmount - should not throw
      expect(() => operator.onUnmount()).not.toThrow();
    });

    it('onProjectChange tracks new project', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      operator.onMount('initial-project');
      operator.onProjectChange('new-project');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('new-project')
      );
    });

    it('idempotent initialization (multiple mounts safe)', () => {
      // Mount multiple times - should not throw
      expect(() => {
        operator.onMount('project-1');
        operator.onMount('project-2');
        operator.onMount('project-3');
      }).not.toThrow();
    });

    it('handles mount after unmount correctly', () => {
      // First mount
      operator.onMount('first-mount');

      // Unmount
      operator.onUnmount();

      // Second mount should not throw
      expect(() => operator.onMount('second-mount')).not.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // Health Check Tests
  // --------------------------------------------------------------------------

  describe('Health Check', () => {
    it('healthCheck returns a promise', async () => {
      const result = operator.healthCheck();
      
      // Should return a promise
      expect(result).toBeInstanceOf(Promise);
      
      // Should resolve to an object with healthy property
      const health = await result;
      expect(health).toHaveProperty('healthy');
    });

    it('healthCheck result has expected shape', async () => {
      const result = await operator.healthCheck();

      // Should have healthy property (boolean)
      expect(result).toHaveProperty('healthy');
      expect(typeof result.healthy).toBe('boolean');
    });
  });

  // --------------------------------------------------------------------------
  // Singleton Export Tests
  // --------------------------------------------------------------------------

  describe('Singleton Export', () => {
    it('exports singleton instance', () => {
      expect(fileTreePlatformOperator).toBeDefined();
      expect(fileTreePlatformOperator.id).toBe('filetree');
      expect(fileTreePlatformOperator.name).toBe('FileTree');
    });

    it('singleton is same across imports', async () => {
      // Import again
      const { fileTreePlatformOperator: secondImport } = await import(
        '../operators/filetree'
      );

      expect(secondImport).toBe(fileTreePlatformOperator);
    });
  });

  // --------------------------------------------------------------------------
  // Governance Tests
  // --------------------------------------------------------------------------

  describe('Governance', () => {
    it('operator has no workspaceId property', () => {
      const operatorAsAny = operator as unknown as Record<string, unknown>;

      expect(operatorAsAny).not.toHaveProperty('workspaceId');
      expect(operatorAsAny).not.toHaveProperty('workspaceBindings');
      expect(operatorAsAny).not.toHaveProperty('onWorkspaceChange');
    });

    it('operator uses projectId not workspaceId', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      operator.onMount('my-project');

      // Should log with projectId, not workspaceId
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('project')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('workspace')
      );
    });
  });
});
