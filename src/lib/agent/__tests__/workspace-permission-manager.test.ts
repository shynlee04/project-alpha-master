/**
 * @fileoverview Workspace Permission Manager Tests
 * @module lib/agent/__tests__/workspace-permission-manager
 *
 * Tests for workspace-aware permission enforcement.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspacePermissionManager } from '../workspace-permission-manager';
import { ToolPermissionManager } from '../tool-permission-manager';
import type { AgentToolBinding, WorkspaceBinding } from '@/core/entities/Agent';

describe('WorkspacePermissionManager', () => {
  let basePermissionManager: ToolPermissionManager;
  let workspacePermissionManager: WorkspacePermissionManager;

  beforeEach(() => {
    basePermissionManager = ToolPermissionManager.getInstance();
    workspacePermissionManager = new WorkspacePermissionManager(basePermissionManager);
  });

  describe('checkWorkspacePermission', () => {
    const mockTools: AgentToolBinding[] = [
      {
        toolId: 'read_file',
        toolName: 'Read File',
        isEnabled: true,
        workspacePermissions: {
          ide: true,
          knowledge: true,
          study: false,
          notes: false,
        },
      },
      {
        toolId: 'write_file',
        toolName: 'Write File',
        isEnabled: true,
        workspacePermissions: {
          ide: true,
          knowledge: false,
          study: false,
          notes: true,
        },
      },
    ];

    const mockBindings: WorkspaceBinding[] = [
      { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
      { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
      { workspaceType: 'study', isAvailable: false, uiVariant: 'compact', isDefault: false },
      { workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false },
    ];

    it('should allow tool enabled in workspace where agent is available', () => {
      const result = workspacePermissionManager.checkWorkspacePermission(
        'read_file',
        mockTools,
        mockBindings,
        'ide'
      );

      expect(result.canExecute).toBe(true);
      expect(result.agentAvailableInWorkspace).toBe(true);
      expect(result.enabledInWorkspace).toBe(true);
      expect(result.workspaceType).toBe('ide');
    });

    it('should block tool disabled in workspace', () => {
      const result = workspacePermissionManager.checkWorkspacePermission(
        'read_file',
        mockTools,
        mockBindings,
        'study'
      );

      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe('block');
      expect(result.enabledInWorkspace).toBe(false);
    });

    it('should block tool when agent is not available in workspace', () => {
      const result = workspacePermissionManager.checkWorkspacePermission(
        'read_file',
        mockTools,
        mockBindings,
        'study'
      );

      expect(result.canExecute).toBe(false);
      expect(result.agentAvailableInWorkspace).toBe(false);
    });

    it('should block tool not in agent configuration', () => {
      const result = workspacePermissionManager.checkWorkspacePermission(
        'execute_command',
        mockTools,
        mockBindings,
        'ide'
      );

      expect(result.canExecute).toBe(false);
      expect(result.agentAvailableInWorkspace).toBe(true);
      expect(result.enabledInWorkspace).toBe(false);
    });

    it('should pass through base permission manager checks', () => {
      // Set execute_command to 'block' in base manager
      basePermissionManager.setTrustLevel('execute_command', 'block');

      const toolWithBlock: AgentToolBinding[] = [
        {
          toolId: 'execute_command',
          toolName: 'Execute Command',
          isEnabled: true,
          workspacePermissions: {
            ide: true,
            knowledge: true,
            study: true,
            notes: true,
          },
        },
      ];

      const result = workspacePermissionManager.checkWorkspacePermission(
        'execute_command',
        toolWithBlock,
        mockBindings,
        'ide'
      );

      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe('block');
    });
  });

  describe('getToolsForWorkspace', () => {
    const mockTools: AgentToolBinding[] = [
      {
        toolId: 'read_file',
        toolName: 'Read File',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: true, study: true, notes: true },
      },
      {
        toolId: 'write_file',
        toolName: 'Write File',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: false, study: false, notes: true },
      },
      {
        toolId: 'list_files',
        toolName: 'List Files',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: false, study: false, notes: false },
      },
    ];

    const mockBindings: WorkspaceBinding[] = [
      { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
      { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'compact', isDefault: false },
      { workspaceType: 'study', isAvailable: false, uiVariant: 'compact', isDefault: false },
      { workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false },
    ];

    it('should return tools enabled for workspace', () => {
      const tools = workspacePermissionManager.getToolsForWorkspace(
        mockTools,
        mockBindings,
        'ide'
      );

      expect(tools).toHaveLength(3);
      expect(tools.every(t => t.enabled)).toBe(true);
    });

    it('should filter tools for knowledge workspace', () => {
      const tools = workspacePermissionManager.getToolsForWorkspace(
        mockTools,
        mockBindings,
        'knowledge'
      );

      expect(tools).toHaveLength(1);
      expect(tools[0].toolId).toBe('read_file');
    });

    it('should return no tools for unavailable workspace', () => {
      const tools = workspacePermissionManager.getToolsForWorkspace(
        mockTools,
        mockBindings,
        'study'
      );

      // Agent is not available in 'study' workspace
      expect(tools).toHaveLength(0);
    });
  });

  describe('isAgentAvailableInWorkspace', () => {
    const bindings: WorkspaceBinding[] = [
      { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
      { workspaceType: 'knowledge', isAvailable: false, uiVariant: 'compact', isDefault: false },
      { workspaceType: 'study', isAvailable: false, uiVariant: 'compact', isDefault: false },
      { workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false },
    ];

    it('should return true for available workspace', () => {
      expect(workspacePermissionManager.isAgentAvailableInWorkspace(bindings, 'ide')).toBe(true);
      expect(workspacePermissionManager.isAgentAvailableInWorkspace(bindings, 'notes')).toBe(true);
    });

    it('should return false for unavailable workspace', () => {
      expect(workspacePermissionManager.isAgentAvailableInWorkspace(bindings, 'knowledge')).toBe(false);
      expect(workspacePermissionManager.isAgentAvailableInWorkspace(bindings, 'study')).toBe(false);
    });
  });

  describe('getWorkspaceUIVariant', () => {
    const bindings: WorkspaceBinding[] = [
      { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
      { workspaceType: 'knowledge', isAvailable: true, uiVariant: 'minimal', isDefault: false },
      { workspaceType: 'study', isAvailable: false, uiVariant: 'compact', isDefault: false },
      { workspaceType: 'notes', isAvailable: true, uiVariant: 'compact', isDefault: false },
    ];

    it('should return correct UI variant for each workspace', () => {
      expect(workspacePermissionManager.getWorkspaceUIVariant(bindings, 'ide')).toBe('full');
      expect(workspacePermissionManager.getWorkspaceUIVariant(bindings, 'knowledge')).toBe('minimal');
      expect(workspacePermissionManager.getWorkspaceUIVariant(bindings, 'study')).toBe('compact');
      expect(workspacePermissionManager.getWorkspaceUIVariant(bindings, 'notes')).toBe('compact');
    });

    it('should return compact as default for unknown workspace', () => {
      expect(workspacePermissionManager.getWorkspaceUIVariant(bindings, 'unknown' as any)).toBe('compact');
    });
  });

  describe('categorizeToolsByWorkspace', () => {
    const mockTools: AgentToolBinding[] = [
      {
        toolId: 'read_file',
        toolName: 'Read File',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: true, study: false, notes: false },
      },
      {
        toolId: 'write_file',
        toolName: 'Write File',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: false, study: false, notes: false },
      },
      {
        toolId: 'execute_command',
        toolName: 'Execute Command',
        isEnabled: false, // Globally disabled
        workspacePermissions: { ide: true, knowledge: true, study: true, notes: true },
      },
    ];

    it('should categorize tools correctly for IDE workspace', () => {
      const { enabled, disabled } = workspacePermissionManager.categorizeToolsByWorkspace(
        mockTools,
        'ide'
      );

      expect(enabled).toHaveLength(2); // read_file, write_file
      expect(disabled).toHaveLength(1); // execute_command (globally disabled)
    });

    it('should categorize tools correctly for knowledge workspace', () => {
      const { enabled, disabled } = workspacePermissionManager.categorizeToolsByWorkspace(
        mockTools,
        'knowledge'
      );

      expect(enabled).toHaveLength(1); // read_file only
      expect(disabled).toHaveLength(2); // write_file (disabled in knowledge), execute_command (globally disabled)
    });
  });

  describe('validateWorkspacePermissions', () => {
    it('should pass validation for complete workspace permissions', () => {
      const validTool: AgentToolBinding = {
        toolId: 'read_file',
        toolName: 'Read File',
        isEnabled: true,
        workspacePermissions: {
          ide: true,
          knowledge: true,
          study: true,
          notes: true,
        },
      };

      const result = workspacePermissionManager.validateWorkspacePermissions(validTool);

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for incomplete workspace permissions', () => {
      const invalidTool: AgentToolBinding = {
        toolId: 'read_file',
        toolName: 'Read File',
        isEnabled: true,
        workspacePermissions: {
          ide: true,
          knowledge: true,
          // Missing 'study' and 'notes'
        } as any,
      };

      const result = workspacePermissionManager.validateWorkspacePermissions(invalidTool);

      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(2);
      expect(result.missing).toContain('study');
      expect(result.missing).toContain('notes');
      expect(result.errors).toHaveLength(2);
    });
  });
});
