/**
 * @fileoverview R-3-05 Preview Module Tests
 * @description TDD tests for Preview module implementation.
 *
 * **NO-WORKSPACE COMPLIANT**: Verifies no workspaceId usage.
 *
 * @module modules/__tests__/r3-preview-module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { moduleLoader } from '../loader';

describe('R-3-05: Preview Module', () => {
  beforeEach(() => {
    moduleLoader.reset();
  });

  describe('Module Definition', () => {
    it('should export default module definition', async () => {
      const module = await import('../preview');
      expect(module.default).toBeDefined();
    });

    it('should have id "preview"', async () => {
      const module = await import('../preview');
      expect(module.default.id).toBe('preview');
    });

    it('should implement IFeatureModule interface', async () => {
      const module = await import('../preview');
      const m = module.default;
      expect(m.id).toBeDefined();
      expect(m.name).toBeDefined();
      expect(m.icon).toBeDefined();
      expect(m.description).toBeDefined();
      expect(m.component).toBeDefined();
      expect(typeof m.requiresProject).toBe('boolean');
      expect(typeof m.supportsOffline).toBe('boolean');
    });

    it('should require a project', async () => {
      const module = await import('../preview');
      expect(module.default.requiresProject).toBe(true);
    });

    it('should NOT support offline (needs dev server)', async () => {
      const module = await import('../preview');
      expect(module.default.supportsOffline).toBe(false);
    });
  });

  describe('NO-WORKSPACE Governance', () => {
    it('should NOT have workspaceId in index.ts', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/modules/preview/index.ts', 'utf-8');
      expect(content).not.toMatch(/workspaceId/);
    });

    it('should NOT have workspaceId in PreviewModule.tsx', async () => {
      const fs = await import('fs').then((m) => m.promises);
      const content = await fs.readFile('src/modules/preview/PreviewModule.tsx', 'utf-8');
      expect(content).not.toMatch(/workspaceId/);
    });
  });

  describe('Module Loader Integration', () => {
    it('should be loadable via moduleLoader', async () => {
      const module = await moduleLoader.loadModule('preview');
      expect(module.id).toBe('preview');
    });

    it('should be cached after first load', async () => {
      await moduleLoader.loadModule('preview');
      expect(moduleLoader.isLoaded('preview')).toBe(true);
    });

    it('should return from cache on second load', async () => {
      const first = await moduleLoader.loadModule('preview');
      const second = await moduleLoader.loadModule('preview');
      expect(first).toBe(second);
    });
  });
});
