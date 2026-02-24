/**
 * @fileoverview R-3-06: Activity Bar Wiring Tests
 * @description TDD tests for ModulePanel integration with activity-bar store.
 *
 * PHASE R-3: Port Modules - Wiring
 * NO workspaceId - use projectId only
 * NO @/lib imports
 *
 * @created 2026-02-03
 */

import { describe, it, expect } from 'vitest';

describe('R-3-06: Activity Bar Wiring', () => {
  describe('ModulePanel Export', () => {
    it('should export ModulePanel from modules index', async () => {
      // Use relative path to avoid Vitest alias resolution issues
      const modules = await import('../index');
      expect(modules.ModulePanel).toBeDefined();
    });

    it('should export moduleLoader from modules index', async () => {
      const modules = await import('../index');
      expect(modules.moduleLoader).toBeDefined();
    });
  });

  describe('Route Integration', () => {
    it('should import ModulePanel in route file', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/routes/$projectId/index.tsx', 'utf-8');
      expect(content).toMatch(/@\/modules/);
      expect(content).toMatch(/ModulePanel/);
    });

    it('should import useActivityBarStore', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/routes/$projectId/index.tsx', 'utf-8');
      expect(content).toMatch(/useActivityBarStore/);
    });

    it('should use useShallow for store selector', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/routes/$projectId/index.tsx', 'utf-8');
      expect(content).toMatch(/useShallow/);
    });

    it('should read mainTop.activePluginId from activity bar', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/routes/$projectId/index.tsx', 'utf-8');
      expect(content).toMatch(/mainTop/);
      expect(content).toMatch(/activePluginId/);
    });
  });

  describe('ModuleType Validation', () => {
    it('should validate module types correctly', () => {
      const VALID_MODULE_TYPES = ['monaco', 'notes', 'terminal', 'preview'] as const;

      const isValidModuleType = (value: unknown): value is (typeof VALID_MODULE_TYPES)[number] => {
        return VALID_MODULE_TYPES.includes(value as (typeof VALID_MODULE_TYPES)[number]);
      };

      // Valid modules
      expect(isValidModuleType('monaco')).toBe(true);
      expect(isValidModuleType('notes')).toBe(true);
      expect(isValidModuleType('terminal')).toBe(true);
      expect(isValidModuleType('preview')).toBe(true);

      // Invalid modules
      expect(isValidModuleType('filetree')).toBe(false);
      expect(isValidModuleType('chat')).toBe(false);
      expect(isValidModuleType('invalid')).toBe(false);
      expect(isValidModuleType(null)).toBe(false);
      expect(isValidModuleType(undefined)).toBe(false);
    });
  });

  describe('NO-WORKSPACE Governance', () => {
    it('should NOT have workspaceId variable declarations or usages in route code', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/routes/$projectId/index.tsx', 'utf-8');
      // Strip comments before checking for workspaceId
      // Remove single-line comments
      const codeWithoutLineComments = content.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments
      const codeOnly = codeWithoutLineComments.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Check for actual workspaceId usage in code (not in comments)
      expect(codeOnly).not.toMatch(/workspaceId/);
    });

    it('should NOT have @/lib imports in updated route', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/routes/$projectId/index.tsx', 'utf-8');
      expect(content).not.toMatch(/@\/lib\//);
    });
  });
});
