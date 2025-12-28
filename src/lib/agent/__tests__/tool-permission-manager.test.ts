/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
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
      manager.setEventBus(mockEventBus as any);
      manager.setTrustLevel('write_file', 'prompt'); // Already prompt by default
      // Implementation always emits event - this is intentional
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
});
