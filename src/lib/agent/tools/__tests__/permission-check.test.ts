/**
 * @vitest-environment jsdom
 */

import { ToolPermissionManager } from '../../tool-permission-manager';
import {
  checkToolPermission,
  getToolRiskLevel,
  createBlockedToolResult,
  categorizeTools,
} from '../permission-check';

describe('Permission Check Integration', () => {
  let permissionManager: ToolPermissionManager;

  beforeEach(() => {
    permissionManager = ToolPermissionManager.createInstance();
  });

  describe('checkToolPermission', () => {
    it('should return canExecute=true for auto tool', () => {
      const result = checkToolPermission(permissionManager, 'read_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(false);
      expect(result.result.reason).toBe('auto');
    });

    it('should return needsApproval=true for prompt tool', () => {
      const result = checkToolPermission(permissionManager, 'write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.result.reason).toBe('prompt');
    });

    it('should return blocked=true for blocked tool', () => {
      const result = checkToolPermission(permissionManager, 'delete_file');
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.result.reason).toBe('block');
    });

    it('should return correct result for session-trusted tool', () => {
      permissionManager.addSessionTrust('write_file');
      const result = checkToolPermission(permissionManager, 'write_file');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.result.reason).toBe('session');
    });
  });

  describe('getToolRiskLevel', () => {
    it('should return low for auto tools', () => {
      expect(getToolRiskLevel(permissionManager, 'read_file')).toBe('low');
      expect(getToolRiskLevel(permissionManager, 'list_files')).toBe('low');
    });

    it('should return medium for prompt tools by default', () => {
      expect(getToolRiskLevel(permissionManager, 'write_file')).toBe('medium');
    });

    it('should return high for execute_command even with prompt', () => {
      expect(getToolRiskLevel(permissionManager, 'execute_command')).toBe('high');
    });

    it('should return high for blocked tools', () => {
      expect(getToolRiskLevel(permissionManager, 'delete_file')).toBe('high');
    });
  });

  describe('createBlockedToolResult', () => {
    it('should return blocked error result', () => {
      const result = createBlockedToolResult('delete_file');
      expect(result.success).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.code).toBe('TOOL_BLOCKED');
      expect(result.toolName).toBe('delete_file');
      expect(result.error).toContain('blocked');
    });

    it('should include helpful message', () => {
      const result = createBlockedToolResult('execute_command');
      expect(result.error).toContain('Execute Command');
      expect(result.error).toContain('agent settings');
    });
  });

  describe('categorizeTools', () => {
    it('should categorize tools correctly', () => {
      const { allowed, blocked, approvalRequired } = categorizeTools(
        permissionManager,
        ['read_file', 'write_file', 'delete_file']
      );

      expect(allowed).toContain('read_file');
      expect(approvalRequired).toContain('write_file');
      expect(blocked).toContain('delete_file');
    });

    it('should handle session trust', () => {
      permissionManager.addSessionTrust('write_file');
      const { allowed, approvalRequired } = categorizeTools(
        permissionManager,
        ['read_file', 'write_file']
      );

      expect(allowed).toContain('read_file');
      expect(allowed).toContain('write_file');
      expect(approvalRequired).not.toContain('write_file');
    });

    it('should handle unknown tools', () => {
      const { approvalRequired } = categorizeTools(permissionManager, ['unknown_tool']);
      expect(approvalRequired).toContain('unknown_tool');
    });
  });
});
