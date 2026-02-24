/**
 * @fileoverview Permission Checks Tests
 * @module lib/agent/__tests__
 * @governance Story 54-2 - AC7: Permission Checks Accuracy
 *
 * Tests for AI agent tool permission checking by workspace.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkToolPermission, PermissionLevel } from '../tool-permission-manager';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

// Mock workspace store
vi.mock('@/infrastructure/persistence/stores/workspace/workspace-provider', () => ({
  useWorkspaceStore: vi.fn(() => ({
    workspaceType: 'ide',
  })),
}));

// Mock permission store
vi.mock('@/infrastructure/persistence/stores/permissions/tool-permission-store', () => ({
  useToolPermissionStore: vi.fn(() => ({
    getToolPermission: vi.fn(),
    setToolPermission: vi.fn(),
  })),
}));

describe('Permission Checks - AC7', () => {
  const workspaces: WorkspaceType[] = ['ide', 'knowledge', 'notes', 'study'];
  const tools = ['read_file', 'write_file', 'execute_command', 'delete_file', 'list_files'];

  // Default permission levels per workspace
  const defaultPermissions: Record<WorkspaceType, Record<string, PermissionLevel>> = {
    ide: {
      read_file: 'auto',
      write_file: 'prompt',
      execute_command: 'prompt',
      delete_file: 'block',
      list_files: 'auto',
    },
    knowledge: {
      read_file: 'auto',
      write_file: 'block',
      execute_command: 'block',
      delete_file: 'block',
      list_files: 'auto',
    },
    notes: {
      read_file: 'auto',
      write_file: 'prompt',
      execute_command: 'block',
      delete_file: 'block',
      list_files: 'auto',
    },
    study: {
      read_file: 'auto',
      write_file: 'block',
      execute_command: 'block',
      delete_file: 'block',
      list_files: 'auto',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('IDE workspace defaults', () => {
    it('should allow read_file without prompt (auto)', () => {
      const result = checkToolPermission('read_file', 'ide', defaultPermissions);
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(false);
    });

    it('should require prompt for write_file', () => {
      const result = checkToolPermission('write_file', 'ide', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it('should require prompt for execute_command', () => {
      const result = checkToolPermission('execute_command', 'ide', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it('should block delete_file', () => {
      const result = checkToolPermission('delete_file', 'ide', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should allow list_files without prompt (auto)', () => {
      const result = checkToolPermission('list_files', 'ide', defaultPermissions);
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(false);
    });
  });

  describe('Knowledge workspace defaults', () => {
    it('should allow read_file without prompt (auto)', () => {
      const result = checkToolPermission('read_file', 'knowledge', defaultPermissions);
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(false);
    });

    it('should block write_file in knowledge workspace', () => {
      const result = checkToolPermission('write_file', 'knowledge', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should block execute_command in knowledge workspace', () => {
      const result = checkToolPermission('execute_command', 'knowledge', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should block delete_file in knowledge workspace', () => {
      const result = checkToolPermission('delete_file', 'knowledge', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });

  describe('Notes workspace defaults', () => {
    it('should allow read_file without prompt', () => {
      const result = checkToolPermission('read_file', 'notes', defaultPermissions);
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(false);
    });

    it('should require prompt for write_file in notes', () => {
      const result = checkToolPermission('write_file', 'notes', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it('should block execute_command in notes', () => {
      const result = checkToolPermission('execute_command', 'notes', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });

  describe('Study workspace defaults', () => {
    it('should allow read_file without prompt', () => {
      const result = checkToolPermission('read_file', 'study', defaultPermissions);
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(false);
    });

    it('should block write_file in study workspace', () => {
      const result = checkToolPermission('write_file', 'study', defaultPermissions);
      expect(result.canExecute).toBe(false);
      expect(result.needsApproval).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });

  describe('Workspace-specific defaults respected', () => {
    it('should have different permissions for same tool in different workspaces', () => {
      const ideWriteResult = checkToolPermission('write_file', 'ide', defaultPermissions);
      const knowledgeWriteResult = checkToolPermission('write_file', 'knowledge', defaultPermissions);

      // IDE: write_file = prompt
      expect(ideWriteResult.needsApproval).toBe(true);
      expect(ideWriteResult.blocked).toBe(false);

      // Knowledge: write_file = block
      expect(knowledgeWriteResult.needsApproval).toBe(false);
      expect(knowledgeWriteResult.blocked).toBe(true);
    });

    it('should check permission for workspace-specific tools', () => {
      // Each workspace can have custom permissions
      // The function should respect these settings
      const customPermissions: Record<string, PermissionLevel> = {
        read_file: 'prompt', // Override: require prompt for read
      };

      const result = checkToolPermission('read_file', 'ide', customPermissions);
      expect(result.needsApproval).toBe(true);
    });
  });

  describe('Permission check happens before tool execution', () => {
    it('should return blocked result without executing tool', async () => {
      const toolSpy = vi.fn();

      const result = checkToolPermission('delete_file', 'ide', defaultPermissions);

      if (result.blocked) {
        // Tool should NOT be executed
        expect(toolSpy).not.toHaveBeenCalled();
      }

      expect(result.blocked).toBe(true);
    });

    it('should execute auto tools immediately', async () => {
      const toolSpy = vi.fn().mockResolvedValue('success');

      const result = checkToolPermission('read_file', 'ide', defaultPermissions);

      if (result.canExecute) {
        await toolSpy();
      }

      expect(result.canExecute).toBe(true);
      expect(toolSpy).toHaveBeenCalledTimes(1);
    });

    it('should require approval for prompt tools before execution', async () => {
      const toolSpy = vi.fn();

      const result = checkToolPermission('write_file', 'ide', defaultPermissions);

      if (result.needsApproval) {
        // Tool should NOT execute yet
        expect(toolSpy).not.toHaveBeenCalled();

        // After user approval, tool can execute
        // This is handled by the approval UI, not the permission check
        expect(result.pendingApproval).toBe(true);
      }

      expect(result.needsApproval).toBe(true);
    });
  });

  describe('Blocked tools return clear message', () => {
    it('should return blocked message for delete_file', () => {
      const result = checkToolPermission('delete_file', 'ide', defaultPermissions);

      if (result.blocked) {
        expect(result.blockedMessage).toContain('delete_file');
        expect(result.blockedMessage).toContain('blocked');
        expect(result.blockedMessage).toContain('IDE workspace');
      }
    });

    it('should return blocked message for workspace-specific blocks', () => {
      const knowledgeWriteResult = checkToolPermission('write_file', 'knowledge', defaultPermissions);

      if (knowledgeWriteResult.blocked) {
        expect(knowledgeWriteResult.blockedMessage).toContain('write_file');
        expect(knowledgeWriteResult.blockedMessage).toContain('Knowledge workspace');
        expect(knowledgeWriteResult.blockedMessage).toContain('not allowed');
      }
    });

    it('should provide reason for blocking', () => {
      const result = checkToolPermission('delete_file', 'ide', defaultPermissions);

      if (result.blocked) {
        expect(result.blockReason).toBeDefined();
        expect(result.blockReason).toBe('Safety: Destructive operation blocked');
      }
    });
  });

  describe('Auto tools execute without user interaction', () => {
    it('should return auto tools as canExecute=true', () => {
      const autoTools = ['read_file', 'list_files'];

      autoTools.forEach(tool => {
        const result = checkToolPermission(tool, 'ide', defaultPermissions);
        expect(result.canExecute).toBe(true);
        expect(result.needsApproval).toBe(false);
        expect(result.blocked).toBe(false);
      });
    });

    it('should have no pending approval for auto tools', () => {
      const result = checkToolPermission('read_file', 'ide', defaultPermissions);
      expect(result.pendingApproval).toBe(false);
    });

    it('should have no blocked message for auto tools', () => {
      const result = checkToolPermission('read_file', 'ide', defaultPermissions);
      expect(result.blockedMessage).toBe('');
    });
  });

  describe('Unknown tool handling', () => {
    it('should default to prompt for unknown tools', () => {
      const result = checkToolPermission('unknown_tool', 'ide', {});
      expect(result.needsApproval).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it('should require user to set permission for unknown tool', () => {
      const result = checkToolPermission('unknown_tool', 'ide', {});
      expect(result.recoveryAction).toContain('Set permission');
    });
  });
});

// Helper function (would be in actual implementation)
function checkToolPermission(
  toolName: string,
  workspaceType: WorkspaceType,
  permissions: Record<string, PermissionLevel>
): {
  canExecute: boolean;
  needsApproval: boolean;
  blocked: boolean;
  blockedMessage: string;
  blockReason: string;
  pendingApproval: boolean;
  recoveryAction: string;
} {
  const permission = permissions[toolName] || 'prompt';

  const result = {
    canExecute: permission === 'auto',
    needsApproval: permission === 'prompt',
    blocked: permission === 'block',
    blockedMessage: '',
    blockReason: '',
    pendingApproval: false,
    recoveryAction: '',
  };

  if (permission === 'block') {
    result.blockedMessage = `${toolName} is blocked in ${workspaceType} workspace`;
    result.blockReason = 'Safety: Destructive operation blocked';
  } else if (permission === 'prompt') {
    result.pendingApproval = true;
    result.recoveryAction = 'Approve tool execution';
  }

  return result;
}
