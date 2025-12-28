/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { ToolExecutionContext, ToolExecutionRequest } from '../types';
import { ToolPermissionManager } from '../../tool-permission-manager';

describe('ToolExecutionContext Types', () => {
  let permissionManager: ToolPermissionManager;

  beforeEach(() => {
    permissionManager = ToolPermissionManager.createInstance();
  });

  describe('Context with permissionManager', () => {
    it('should accept permissionManager in context', () => {
      const context: ToolExecutionContext = {
        projectPath: '/test-project',
        language: 'en',
        permissionManager,
      };
      expect(context.permissionManager).toBe(permissionManager);
    });

    it('should work without permissionManager (optional)', () => {
      const context: ToolExecutionContext = {
        projectPath: '/test-project',
        language: 'en',
      };
      expect(context.permissionManager).toBeUndefined();
    });
  });

  describe('ToolExecutionRequest', () => {
    it('should create request with permissionCheck', () => {
      const permissionCheck = permissionManager.checkPermission('write_file');
      const request: ToolExecutionRequest = {
        toolId: 'write_file',
        parameters: { path: 'test.txt', content: 'hello' },
        permissionCheck,
      };
      expect(request.toolId).toBe('write_file');
      expect(request.permissionCheck?.needsApproval).toBe(true);
    });

    it('should create request without permissionCheck', () => {
      const request: ToolExecutionRequest = {
        toolId: 'read_file',
        parameters: { path: 'test.txt' },
      };
      expect(request.permissionCheck).toBeUndefined();
    });
  });

  describe('Permission Integration through Context', () => {
    it('should check auto tool permission through context', () => {
      const context: ToolExecutionContext = {
        projectPath: '/test',
        permissionManager,
      };
      const result = context.permissionManager!.checkPermission('read_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
    });

    it('should check prompt tool permission through context', () => {
      const context: ToolExecutionContext = {
        projectPath: '/test',
        permissionManager,
      };
      const result = context.permissionManager!.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(true);
    });

    it('should check blocked tool permission through context', () => {
      const context: ToolExecutionContext = {
        projectPath: '/test',
        permissionManager,
      };
      const result = context.permissionManager!.checkPermission('delete_file');
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
    });

    it('should apply session trust through context', () => {
      permissionManager.addSessionTrust('write_file');
      const context: ToolExecutionContext = {
        projectPath: '/test',
        permissionManager,
      };
      const result = context.permissionManager!.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.reason).toBe('session');
    });
  });
});
