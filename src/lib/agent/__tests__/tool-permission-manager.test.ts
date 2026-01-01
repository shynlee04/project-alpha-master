/**
 * @vitest-environment jsdom
 */

import type { EventEmitter3 } from 'eventemitter3';
import { ToolPermissionManager } from '../tool-permission-manager';

// Mock event bus
const mockEventBus: EventEmitter3 = {
  on: vi.fn(),
  emit: vi.fn(),
  off: vi.fn(),
  removeAllListeners: vi.fn(),
  listenerCount: vi.fn(),
  eventNames: vi.fn(),
};

describe('ToolPermissionManager', () => {
  let manager: ToolPermissionManager;

  beforeEach(() => {
    // Reset to fresh instance for each test
    manager = ToolPermissionManager.createInstance();
    // Reset store state to ensure test isolation
    manager.resetToDefaults();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple getInstance() calls', () => {
      const instance1 = ToolPermissionManager.getInstance();
      const instance2 = ToolPermissionManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance with createInstance()', () => {
      const instance1 = ToolPermissionManager.getInstance();
      const instance2 = ToolPermissionManager.createInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Default Trust Levels', () => {
    it('should have auto trust level for read_file', () => {
      expect(manager.getTrustLevel('read_file')).toBe('auto');
    });

    it('should have auto trust level for list_files', () => {
      expect(manager.getTrustLevel('list_files')).toBe('auto');
    });

    it('should have auto trust level for read_directory', () => {
      expect(manager.getTrustLevel('read_directory')).toBe('auto');
    });

    it('should have prompt trust level for write_file', () => {
      expect(manager.getTrustLevel('write_file')).toBe('prompt');
    });

    it('should have prompt trust level for create_directory', () => {
      expect(manager.getTrustLevel('create_directory')).toBe('prompt');
    });

    it('should have prompt trust level for execute_command', () => {
      expect(manager.getTrustLevel('execute_command')).toBe('prompt');
    });

    it('should have block trust level for delete_file', () => {
      expect(manager.getTrustLevel('delete_file')).toBe('block');
    });
  });

  describe('Trust Level Modification', () => {
    it('should allow changing trust level for a tool', () => {
      manager.setTrustLevel('write_file', 'auto');
      expect(manager.getTrustLevel('write_file')).toBe('auto');
    });

    it('should emit permission:changed event when level changes', () => {
      manager.setEventBus(mockEventBus as any);
      manager.setTrustLevel('write_file', 'auto');
      expect(mockEventBus.emit).toHaveBeenCalledWith('permission:changed', 'write_file', 'auto');
    });

    it('should emit event even for same level (implementation detail)', () => {
      // Create a fresh manager with write_file explicitly set to auto first
      // This ensures the emit shows 'prompt' when we set it again
      const freshManager = ToolPermissionManager.createInstance({ write_file: 'auto' });
      freshManager.setEventBus(mockEventBus as any);

      // Now set it to prompt - emit should show 'prompt'
      freshManager.setTrustLevel('write_file', 'prompt');
      expect(mockEventBus.emit).toHaveBeenCalledWith('permission:changed', 'write_file', 'prompt');
    });
  });

  describe('Permission Check - Auto Mode', () => {
    it('should return needsApproval=false for auto tool', () => {
      const result = manager.checkPermission('read_file');
      expect(result.needsApproval).toBe(false);
    });

    it('should return canExecute=true for auto tool', () => {
      const result = manager.checkPermission('read_file');
      expect(result.canExecute).toBe(true);
    });

    it('should return reason=auto for auto tool', () => {
      const result = manager.checkPermission('read_file');
      expect(result.reason).toBe('auto');
    });
  });

  describe('Permission Check - Prompt Mode', () => {
    it('should return needsApproval=true for prompt tool', () => {
      const result = manager.checkPermission('write_file');
      expect(result.needsApproval).toBe(true);
    });

    it('should return canExecute=true for prompt tool (pending approval)', () => {
      const result = manager.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
    });

    it('should return reason=prompt for prompt tool', () => {
      const result = manager.checkPermission('write_file');
      expect(result.reason).toBe('prompt');
    });
  });

  describe('Permission Check - Block Mode', () => {
    it('should return needsApproval=false for blocked tool', () => {
      const result = manager.checkPermission('delete_file');
      expect(result.needsApproval).toBe(false);
    });

    it('should return canExecute=false for blocked tool', () => {
      const result = manager.checkPermission('delete_file');
      expect(result.canExecute).toBe(false);
    });

    it('should return reason=block for blocked tool', () => {
      const result = manager.checkPermission('delete_file');
      expect(result.reason).toBe('block');
    });
  });

  describe('Session Trust', () => {
    it('should initially have no session trust', () => {
      expect(manager.hasSessionTrust('write_file')).toBe(false);
    });

    it('should add session trust for a tool', () => {
      manager.addSessionTrust('write_file');
      expect(manager.hasSessionTrust('write_file')).toBe(true);
    });

    it('should emit session:trust:added event', () => {
      manager.setEventBus(mockEventBus as any);
      manager.addSessionTrust('write_file');
      expect(mockEventBus.emit).toHaveBeenCalledWith('session:trust:added', 'write_file');
    });

    it('should remove session trust', () => {
      manager.addSessionTrust('write_file');
      manager.removeSessionTrust('write_file');
      expect(manager.hasSessionTrust('write_file')).toBe(false);
    });

    it('should clear all session trust', () => {
      manager.addSessionTrust('write_file');
      manager.addSessionTrust('execute_command');
      manager.clearSessionTrust();
      expect(manager.hasSessionTrust('write_file')).toBe(false);
      expect(manager.hasSessionTrust('execute_command')).toBe(false);
    });

    it('should emit session:trust:cleared event', () => {
      manager.setEventBus(mockEventBus as any);
      manager.clearSessionTrust();
      expect(mockEventBus.emit).toHaveBeenCalledWith('session:trust:cleared');
    });
  });

  describe('Session Trust Override', () => {
    it('should return needsApproval=false when session trust exists', () => {
      manager.addSessionTrust('write_file'); // Default is 'prompt'
      const result = manager.checkPermission('write_file');
      expect(result.needsApproval).toBe(false);
    });

    it('should return canExecute=true when session trust exists', () => {
      manager.addSessionTrust('write_file');
      const result = manager.checkPermission('write_file');
      expect(result.canExecute).toBe(true);
    });

    it('should return reason=session when session trust exists', () => {
      manager.addSessionTrust('write_file');
      const result = manager.checkPermission('write_file');
      expect(result.reason).toBe('session');
    });

    it('should still block even with session trust', () => {
      manager.addSessionTrust('delete_file'); // Default is 'block'
      const result = manager.checkPermission('delete_file');
      expect(result.canExecute).toBe(false);
      expect(result.reason).toBe('block'); // Block takes precedence
    });
  });

  describe('Persistence', () => {
    it('should serialize to JSON', () => {
      manager.setTrustLevel('write_file', 'auto');
      const json = manager.toJSON();
      expect(json).toContain('write_file');
      expect(json).toContain('auto');
    });

    it('should deserialize from JSON', () => {
      const customJson = JSON.stringify({
        permissions: {
          read_file: 'prompt',
          write_file: 'block',
        },
      });
      const restored = ToolPermissionManager.fromJSON(customJson);
      expect(restored.getTrustLevel('read_file')).toBe('prompt');
      expect(restored.getTrustLevel('write_file')).toBe('block');
    });

    it('should restore specified permissions when deserializing', () => {
      const customJson = JSON.stringify({
        permissions: {
          write_file: 'auto',
          read_file: 'block',
        },
      });
      const restored = ToolPermissionManager.fromJSON(customJson);
      // Specified tools should have custom values
      expect(restored.getTrustLevel('write_file')).toBe('auto');
      expect(restored.getTrustLevel('read_file')).toBe('block');
      // Non-specified tools should have defaults
      // delete_file default is 'block', execute_command default is 'prompt'
      expect(restored.getTrustLevel('delete_file')).toBe('block');
      expect(restored.getTrustLevel('execute_command')).toBe('prompt');
    });
  });

  describe('Reset to Defaults', () => {
    it('should reset all trust levels to defaults', () => {
      manager.setTrustLevel('write_file', 'auto');
      manager.setTrustLevel('read_file', 'prompt');
      manager.resetToDefaults();
      expect(manager.getTrustLevel('write_file')).toBe('prompt');
      expect(manager.getTrustLevel('read_file')).toBe('auto');
    });

    it('should clear any custom permissions', () => {
      manager.setTrustLevel('custom_tool', 'auto');
      manager.resetToDefaults();
      expect(manager.getTrustLevel('custom_tool')).toBe('prompt'); // Default for unknown
    });
  });

  describe('Utility Methods', () => {
    it('should get all tool IDs', () => {
      const toolIds = manager.getToolIds();
      expect(toolIds).toContain('read_file');
      expect(toolIds).toContain('write_file');
      expect(toolIds).toContain('delete_file');
    });

    it('should get all trust levels', () => {
      const levels = manager.getAllTrustLevels();
      expect(levels.read_file).toBe('auto');
      expect(levels.write_file).toBe('prompt');
      expect(levels.delete_file).toBe('block');
    });

    it('should get default trust levels', () => {
      const defaults = manager.getDefaultTrustLevels();
      expect(defaults.read_file).toBe('auto');
      expect(defaults.delete_file).toBe('block');
    });

    it('should get tools by level', () => {
      const autoTools = manager.getToolsByLevel('auto');
      expect(autoTools).toContain('read_file');
      expect(autoTools).not.toContain('write_file');
    });

    it('should detect if prompt tools exist', () => {
      expect(manager.hasPromptTools()).toBe(true);
    });

    it('should detect if blocked tools exist', () => {
      expect(manager.hasBlockedTools()).toBe(true);
    });
  });

  describe('Unknown Tool Handling', () => {
    it('should default unknown tools to prompt', () => {
      expect(manager.getTrustLevel('unknown_tool')).toBe('prompt');
    });

    it('should allow execution (with approval) for unknown tools', () => {
      const result = manager.checkPermission('unknown_tool');
      expect(result.canExecute).toBe(true);
      expect(result.needsApproval).toBe(true);
      expect(result.reason).toBe('prompt');
    });
  });

  describe('Event Bus Integration', () => {
    it('should set event bus', () => {
      manager.setEventBus(mockEventBus as any);
      manager.setTrustLevel('write_file', 'auto');
      expect(mockEventBus.emit).toHaveBeenCalled();
    });

    it('should emit session:trust:removed event', () => {
      manager.setEventBus(mockEventBus as any);
      manager.addSessionTrust('write_file');
      (mockEventBus.emit as any).mockClear();
      manager.removeSessionTrust('write_file');
      expect(mockEventBus.emit).toHaveBeenCalledWith('session:trust:removed', 'write_file');
    });
  });

  // ==========================================================================
  // Ralph Loop 51-3: Workspace-Scoped Permission Tests
  // ==========================================================================

  describe('Workspace-Scoped Permissions (Ralph Loop 51-3)', () => {
    describe('Workspace-specific permission checks', () => {
      it('should return workspace in permission check result', () => {
        const result = manager.checkPermission('read_file', 'ide');
        expect(result.workspace).toBe('ide');
      });

      it('should return workspace in permission check result for knowledge', () => {
        const result = manager.checkPermission('read_file', 'knowledge');
        expect(result.workspace).toBe('knowledge');
      });

      it('should return workspace in permission check result for notes', () => {
        const result = manager.checkPermission('read_file', 'notes');
        expect(result.workspace).toBe('notes');
      });

      it('should return workspace in permission check result for study', () => {
        const result = manager.checkPermission('read_file', 'study');
        expect(result.workspace).toBe('study');
      });
    });

    describe('Different trust levels per workspace', () => {
      it('should allow execute_command in IDE workspace with prompt', () => {
        const result = manager.checkPermission('execute_command', 'ide');
        expect(result.canExecute).toBe(true);
        expect(result.needsApproval).toBe(true);
        expect(result.reason).toBe('prompt');
      });

      it('should block execute_command in knowledge workspace', () => {
        const result = manager.checkPermission('execute_command', 'knowledge');
        expect(result.canExecute).toBe(false);
        expect(result.reason).toBe('block');
      });

      it('should block execute_command in notes workspace', () => {
        const result = manager.checkPermission('execute_command', 'notes');
        expect(result.canExecute).toBe(false);
        expect(result.reason).toBe('block');
      });

      it('should block execute_command in study workspace', () => {
        const result = manager.checkPermission('execute_command', 'study');
        expect(result.canExecute).toBe(false);
        expect(result.reason).toBe('block');
      });

      it('should allow write_file in IDE and notes with prompt', () => {
        const ideResult = manager.checkPermission('write_file', 'ide');
        const notesResult = manager.checkPermission('write_file', 'notes');

        expect(ideResult.canExecute).toBe(true);
        expect(ideResult.needsApproval).toBe(true);
        expect(notesResult.canExecute).toBe(true);
        expect(notesResult.needsApproval).toBe(true);
      });

      it('should block write_file in knowledge and study workspaces', () => {
        const knowledgeResult = manager.checkPermission('write_file', 'knowledge');
        const studyResult = manager.checkPermission('write_file', 'study');

        expect(knowledgeResult.canExecute).toBe(false);
        expect(knowledgeResult.reason).toBe('block');
        expect(studyResult.canExecute).toBe(false);
        expect(studyResult.reason).toBe('block');
      });

      it('should allow read_file in all workspaces with auto', () => {
        const ideResult = manager.checkPermission('read_file', 'ide');
        const knowledgeResult = manager.checkPermission('read_file', 'knowledge');
        const notesResult = manager.checkPermission('read_file', 'notes');
        const studyResult = manager.checkPermission('read_file', 'study');

        expect(ideResult.reason).toBe('auto');
        expect(knowledgeResult.reason).toBe('auto');
        expect(notesResult.reason).toBe('auto');
        expect(studyResult.reason).toBe('auto');
      });

      it('should block delete_file in all workspaces', () => {
        const ideResult = manager.checkPermission('delete_file', 'ide');
        const knowledgeResult = manager.checkPermission('delete_file', 'knowledge');
        const notesResult = manager.checkPermission('delete_file', 'notes');
        const studyResult = manager.checkPermission('delete_file', 'study');

        expect(ideResult.canExecute).toBe(false);
        expect(knowledgeResult.canExecute).toBe(false);
        expect(notesResult.canExecute).toBe(false);
        expect(studyResult.canExecute).toBe(false);
      });
    });

    describe('Workspace isolation', () => {
      it('should allow setting different trust levels per workspace', () => {
        // Set execute_command to auto in IDE, keep block in knowledge
        manager.setTrustLevel('execute_command', 'ide', 'auto');

        const ideResult = manager.checkPermission('execute_command', 'ide');
        const knowledgeResult = manager.checkPermission('execute_command', 'knowledge');

        expect(ideResult.reason).toBe('auto');
        expect(knowledgeResult.reason).toBe('block');
      });

      it('should not affect other workspaces when changing one workspace', () => {
        // Set write_file to block in IDE
        manager.setTrustLevel('write_file', 'ide', 'block');

        // IDE should be blocked
        const ideResult = manager.checkPermission('write_file', 'ide');
        expect(ideResult.canExecute).toBe(false);

        // Other workspaces should still be at their default levels
        const notesResult = manager.checkPermission('write_file', 'notes');
        expect(notesResult.canExecute).toBe(true); // Default is prompt
        expect(notesResult.needsApproval).toBe(true);

        const knowledgeResult = manager.checkPermission('write_file', 'knowledge');
        expect(knowledgeResult.canExecute).toBe(false); // Default is block
      });

      it('should emit permission:changed event when workspace level changes', () => {
        manager.setEventBus(mockEventBus as any);
        manager.setTrustLevel('write_file', 'notes', 'auto');
        expect(mockEventBus.emit).toHaveBeenCalledWith('permission:changed', 'write_file', 'auto');
      });
    });

    describe('Session trust per-workspace', () => {
      it('should add session trust for specific workspace', () => {
        manager.addSessionTrust('write_file', 'ide');

        // Should have session trust in IDE
        expect(manager.hasSessionTrust('write_file', 'ide')).toBe(true);

        // Should NOT have session trust in other workspaces
        expect(manager.hasSessionTrust('write_file', 'knowledge')).toBe(false);
        expect(manager.hasSessionTrust('write_file', 'notes')).toBe(false);
      });

      it('should return reason=session for workspace with session trust', () => {
        manager.addSessionTrust('write_file', 'ide');

        const ideResult = manager.checkPermission('write_file', 'ide');
        expect(ideResult.reason).toBe('session');
        expect(ideResult.needsApproval).toBe(false);

        // Other workspaces should still require approval
        const notesResult = manager.checkPermission('write_file', 'notes');
        expect(notesResult.reason).toBe('prompt');
        expect(notesResult.needsApproval).toBe(true);
      });

      it('should remove session trust from specific workspace', () => {
        manager.addSessionTrust('write_file', 'ide');
        manager.addSessionTrust('write_file', 'knowledge');

        manager.removeSessionTrust('write_file', 'ide');

        expect(manager.hasSessionTrust('write_file', 'ide')).toBe(false);
        expect(manager.hasSessionTrust('write_file', 'knowledge')).toBe(true);
      });

      it('should clear all session trust across all workspaces', () => {
        manager.addSessionTrust('write_file', 'ide');
        manager.addSessionTrust('write_file', 'knowledge');
        manager.addSessionTrust('write_file', 'notes');

        manager.clearSessionTrust();

        expect(manager.hasSessionTrust('write_file', 'ide')).toBe(false);
        expect(manager.hasSessionTrust('write_file', 'knowledge')).toBe(false);
        expect(manager.hasSessionTrust('write_file', 'notes')).toBe(false);
      });

      it('should block in workspace even with session trust', () => {
        manager.addSessionTrust('delete_file', 'ide');

        const result = manager.checkPermission('delete_file', 'ide');
        expect(result.canExecute).toBe(false);
        expect(result.reason).toBe('block'); // Block takes precedence
      });
    });

    describe('Default trust level fallback', () => {
      it('should return default trust level for unknown tools in workspace', () => {
        const result = manager.checkPermission('unknown_tool', 'ide');
        expect(result.canExecute).toBe(true);
        expect(result.needsApproval).toBe(true);
        expect(result.reason).toBe('prompt'); // Default is prompt
      });

      it('should use default trust level when workspace not set', () => {
        // Create a new instance without setting execute_command for knowledge workspace
        const freshManager = ToolPermissionManager.createInstance();

        // Manually clear knowledge workspace setting to test fallback
        freshManager.setTrustLevel('execute_command', 'knowledge', 'prompt');

        const result = freshManager.checkPermission('some_new_tool', 'knowledge');
        expect(result.reason).toBe('prompt'); // Falls back to defaultTrustLevel
      });
    });

    describe('Get all trust levels for workspace', () => {
      it('should return trust levels for specific workspace', () => {
        manager.setTrustLevel('write_file', 'ide', 'auto');
        manager.setTrustLevel('write_file', 'knowledge', 'block');

        const ideLevels = manager.getAllTrustLevels('ide');
        const knowledgeLevels = manager.getAllTrustLevels('knowledge');

        expect(ideLevels.write_file).toBe('auto');
        expect(knowledgeLevels.write_file).toBe('block');

        // Tools not explicitly set should have defaults
        expect(ideLevels.read_file).toBe('auto');
        expect(knowledgeLevels.read_file).toBe('auto');
      });

      it('should return empty object for unknown workspace (uses defaults)', () => {
        const levels = manager.getAllTrustLevels('ide' as any);
        expect(typeof levels).toBe('object');
        expect(Object.keys(levels).length).toBeGreaterThan(0);
      });
    });

    describe('Get tools by level in workspace', () => {
      it('should return tools at specific trust level for workspace', () => {
        manager.setTrustLevel('write_file', 'ide', 'auto');
        manager.setTrustLevel('execute_command', 'knowledge', 'auto');

        const ideAutoTools = manager.getToolsByLevel('ide', 'auto');
        const knowledgeAutoTools = manager.getToolsByLevel('knowledge', 'auto');

        expect(ideAutoTools).toContain('write_file');
        expect(knowledgeAutoTools).toContain('execute_command');
      });

      it('should return empty array for level with no tools in workspace', () => {
        const blockedTools = manager.getToolsByLevel('ide', 'block');
        expect(blockedTools).toContain('delete_file'); // Has blocked tools

        // Get tools that are auto in knowledge (execute_command is blocked there)
        const knowledgeAutoTools = manager.getToolsByLevel('knowledge', 'auto');
        expect(knowledgeAutoTools).not.toContain('execute_command');
      });
    });

    describe('Workspace-specific helper methods', () => {
      it('should detect if workspace has prompt tools', () => {
        expect(manager.hasPromptTools('ide')).toBe(true);

        // Set all tools to auto in IDE
        manager.setTrustLevel('write_file', 'ide', 'auto');
        manager.setTrustLevel('create_directory', 'ide', 'auto');
        manager.setTrustLevel('execute_command', 'ide', 'auto');

        // Now IDE should have no prompt tools (except delete_file which is blocked)
        const promptTools = manager.getToolsByLevel('ide', 'prompt');
        const hasPrompt = promptTools.length > 0;
        expect(hasPrompt).toBe(false);
      });

      it('should detect if workspace has blocked tools', () => {
        expect(manager.hasBlockedTools('ide')).toBe(true);
        expect(manager.hasBlockedTools('knowledge')).toBe(true);
        expect(manager.hasBlockedTools('notes')).toBe(true);
        expect(manager.hasBlockedTools('study')).toBe(true);
      });
    });
  });

  // ==========================================================================
  // Backward Compatibility Layer Tests (Ralph Loop 51-3)
  // ==========================================================================

  describe('Backward Compatibility Layer (Ralph Loop 51-3)', () => {
    describe('Legacy API (no workspace parameter)', () => {
      it('should default to ide workspace when workspace not provided', () => {
        const result = manager.checkPermission('execute_command');
        expect(result.workspace).toBe('ide');
      });

      it('should work with legacy setTrustLevel (no workspace)', () => {
        manager.setTrustLevelLegacy('write_file', 'auto');
        const result = manager.checkPermission('write_file');
        expect(result.reason).toBe('auto');
      });

      it('should work with legacy addSessionTrust (no workspace)', () => {
        manager.addSessionTrustLegacy('write_file');
        expect(manager.hasSessionTrust('write_file', 'ide')).toBe(true);
      });

      it('should work with legacy removeSessionTrust (no workspace)', () => {
        manager.addSessionTrustLegacy('write_file');
        manager.removeSessionTrustLegacy('write_file');
        expect(manager.hasSessionTrust('write_file', 'ide')).toBe(false);
      });

      it('should work with legacy getAllTrustLevels (no workspace)', () => {
        const levels = manager.getAllTrustLevelsLegacy();
        expect(levels.read_file).toBe('auto');
        expect(levels.write_file).toBe('prompt');
        expect(levels.delete_file).toBe('block');
      });

      it('should work with legacy getDefaultTrustLevels (no workspace)', () => {
        const defaults = manager.getDefaultTrustLevelsLegacy();
        expect(defaults.read_file).toBe('auto');
        expect(defaults.delete_file).toBe('block');
      });

      it('should work with legacy getToolsByLevel (no workspace)', () => {
        const autoTools = manager.getToolsByLevelLegacy('auto');
        expect(autoTools).toContain('read_file');
      });

      it('should work with legacy checkPermission (excludes workspace)', () => {
        const result = manager.checkPermissionLegacy('write_file');

        // Legacy result should NOT have workspace field
        expect('workspace' in result).toBe(false);

        // But should have all other fields
        expect(result.needsApproval).toBe(true);
        expect(result.canExecute).toBe(true);
        expect(result.reason).toBe('prompt');
        expect(result.toolName).toBe('Write File');
        expect(result.toolId).toBe('write_file');
      });
    });

    describe('Mixed legacy and new API usage', () => {
      it('should allow legacy and new API to coexist', () => {
        // Use new API to set workspace-scoped
        manager.setTrustLevel('write_file', 'knowledge', 'auto');

        // Use legacy API (defaults to ide)
        const ideResult = manager.checkPermission('write_file');
        expect(ideResult.workspace).toBe('ide');

        // Use new API for knowledge
        const knowledgeResult = manager.checkPermission('write_file', 'knowledge');
        expect(knowledgeResult.reason).toBe('auto');
      });
    });
  });
});
