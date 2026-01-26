import { describe, it, expect } from 'vitest';
import type {
  WorkspaceConfig,
  WorkspaceState,
  WorkspaceConfigCreateParams,
  WorkspaceStateCreateParams,
  WorkspaceConfigUpdateParams,
  WorkspaceStateUpdateParams,
} from '../Workspace';

describe('Workspace Domain Entities', () => {
  describe('WorkspaceConfig', () => {
    it('should define a valid WorkspaceConfig structure', () => {
      const config: WorkspaceConfig = {
        type: 'ide',
        isEnabled: true,
        label: 'Code Editor',
        settings: { theme: 'dark' },
        created: new Date(),
        updated: new Date(),
      };

      expect(config.type).toBe('ide');
      expect(config.isEnabled).toBe(true);
      expect(config.settings.theme).toBe('dark');
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: WorkspaceConfigCreateParams = {
        type: 'knowledge',
        isEnabled: false,
        settings: {},
      };

      expect(params.type).toBe('knowledge');
      // @ts-expect-error - created should not be in CreateParams
      expect(params.created).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: WorkspaceConfigUpdateParams = {
        type: 'ide',
        isEnabled: false,
      };

      expect(update.type).toBe('ide');
      expect(update.isEnabled).toBe(false);
    });
  });

  describe('WorkspaceState', () => {
    it('should define a valid WorkspaceState structure', () => {
      const state: WorkspaceState = {
        type: 'notes',
        activeFile: 'note-1.md',
        openFiles: ['note-1.md', 'note-2.md'],
        panels: { sidebar: true },
        metadata: { scrollPos: 100 },
        updated: new Date(),
      };

      expect(state.type).toBe('notes');
      expect(state.activeFile).toBe('note-1.md');
      expect(state.panels.sidebar).toBe(true);
    });

    it('should support CreateParams without auto-generated fields', () => {
      const params: WorkspaceStateCreateParams = {
        type: 'study',
        openFiles: [],
        panels: {},
        metadata: {},
      };

      expect(params.type).toBe('study');
      // @ts-expect-error - updated should not be in CreateParams
      expect(params.updated).toBeUndefined();
    });

    it('should support UpdateParams with partial fields', () => {
      const update: WorkspaceStateUpdateParams = {
        type: 'notes',
        activeFile: null,
      };

      expect(update.type).toBe('notes');
      expect(update.activeFile).toBeNull();
    });
  });
});
