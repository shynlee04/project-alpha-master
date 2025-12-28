/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { ToolExecutionContext } from '../types';
import type { ToolPermissionManager, PermissionCheckResult } from '../../tool-permission-manager';
import { ToolPermissionManager as ToolPermissionManagerClass } from '../../tool-permission-manager';

describe('ToolExecutionContext with Permission Manager', () => {
  let permissionManager: ToolPermissionManagerClass;
  let context: ToolExecutionContext;

  beforeEach(() => {
    permissionManager = ToolPermissionManagerClass.createInstance();
    // Context should include permissionManager after Task 2 implementation
    context = {
      projectPath: '/test-project',
      language: 'en',
      permissionManager,
    };
  });

  describe('Context Structure', () => {
    it('should have permissionManager field in context', () => {
      expect(context.permissionManager).toBeDefined();
      expect(context.permissionManager).toBe(permissionManager);
    });

    it('should have required fields', () => {
      expect(context.projectPath).toBe('/test-project');
      expect(context.language).toBe('en');
      expect(context.permissionManager).toBeDefined();
    });
  });

  describe('Permission Check Integration', () => {
    it('should check permission for auto tool through context', () => {
      const result = context.permissionManager.checkPermission('read_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.reason).toBe('auto');
    });

    it('should check permission for prompt tool through context', () => {
      const result = context.permissionManager.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(true);
      expect(result.reason).toBe('prompt');
    });

    it('should check permission for blocked tool through context', () => {
      const result = context.permissionManager.checkPermission('delete_file');
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.reason).toBe('block');
    });

    it('should allow session trust override through context', () => {
      context.permissionManager.addSessionTrust('write_file');
      const result = context.permissionManager.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.reason).toBe('session');
    });
  });
});

describe('Permission Check in Tool Execution Flow', () => {
  let permissionManager: ToolPermissionManagerClass;

  beforeEach(() => {
    permissionManager = ToolPermissionManagerClass.createInstance();
  });

  describe('Auto Tool Execution Path', () => {
    it('should allow immediate execution for auto trust level', () => {
      const result = permissionManager.checkPermission('read_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      // Auto tools should execute without going to approval queue
    });

    it('should return correct tool info for auto execution', () => {
      const result = permissionManager.checkPermission('read_file');
      expect(result.toolName).toBe('Read File');
      expect(result.toolId).toBe('read_file');
    });
  });

  describe('Prompt Tool Execution Path', () => {
    it('should queue for approval when permission is prompt', () => {
      const result = permissionManager.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(true);
      // Should show approval overlay
    });

    it('should allow execution after approval with session trust', () => {
      permissionManager.addSessionTrust('write_file');
      const result = permissionManager.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.reason).toBe('session');
    });
  });

  describe('Blocked Tool Execution Path', () => {
    it('should prevent execution for blocked tools', () => {
      const result = permissionManager.checkPermission('delete_file');
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      // Should return blocked error without showing approval
    });

    it('should return blocked error message', () => {
      const result = permissionManager.checkPermission('delete_file');
      expect(result.reason).toBe('block');
      // UI should show: "⛔ [ToolName] is blocked. Enable it in agent settings to use."
    });

    it('should not be overridden by session trust', () => {
      permissionManager.addSessionTrust('delete_file');
      const result = permissionManager.checkPermission('delete_file');
      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe('block');
    });
  });
});
