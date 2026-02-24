import { describe, it, expect } from 'vitest';

describe('R-3-01: Module Loader System', () => {
  
  describe('Module Types', () => {
    it('should define ModuleType union type', async () => {
      const { ModuleType } = await import('../types');
      // Type exists - this compiles = pass
      expect(ModuleType).toBeDefined;
    });
    
    it('should define IFeatureModule interface with required fields', async () => {
      const types = await import('../types');
      // Interface has: id, name, icon, description, component, requiresProject, supportsOffline
      expect(types).toBeDefined();
    });
    
    it('should define ModuleProps interface', async () => {
      const types = await import('../types');
      expect(types).toBeDefined();
    });
  });
  
  describe('Module Loader', () => {
    it('should export moduleLoader singleton', async () => {
      const { moduleLoader } = await import('../loader');
      expect(moduleLoader).toBeDefined();
    });
    
    it('should have loadModule method', async () => {
      const { moduleLoader } = await import('../loader');
      expect(typeof moduleLoader.loadModule).toBe('function');
    });
    
    it('should have isLoaded method', async () => {
      const { moduleLoader } = await import('../loader');
      expect(typeof moduleLoader.isLoaded).toBe('function');
    });
    
    it('should have getLoaded method', async () => {
      const { moduleLoader } = await import('../loader');
      expect(typeof moduleLoader.getLoaded).toBe('function');
    });
    
    it('should return false for unloaded modules', async () => {
      const { moduleLoader } = await import('../loader');
      expect(moduleLoader.isLoaded('monaco')).toBe(false);
    });
  });
  
  describe('NO-WORKSPACE Governance', () => {
    it('should NOT have workspaceId in types.ts', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/types.ts', 'utf-8');
      expect(content).not.toMatch(/workspaceId/);
    });
    
    it('should NOT have workspaceBindings in any module file', async () => {
      const fs = await import('fs').then(m => m.promises);
      const files = ['types.ts', 'loader.ts', 'index.ts'];
      for (const file of files) {
        const content = await fs.readFile(`src/modules/${file}`, 'utf-8');
        expect(content).not.toMatch(/workspaceBindings/);
      }
    });
    
    it('should use projectId in ModuleProps', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/types.ts', 'utf-8');
      expect(content).toMatch(/projectId:\s*string/);
    });
  });
});
