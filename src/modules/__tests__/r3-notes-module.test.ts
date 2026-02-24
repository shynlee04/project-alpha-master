/**
 * @fileoverview R-3-03 Notes Module Tests
 * @description TDD tests for Notes module wrapper.
 * 
 * Tests:
 * - Module definition structure
 * - IFeatureModule interface compliance
 * - NO-WORKSPACE governance
 * - Strangler Fig pattern compliance
 * - Module loader integration
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('R-3-03: Notes Module', () => {
  // Pre-load module once with extended timeout (store rehydration is slow)
  let notesModule: typeof import('../notes');
  
  beforeAll(async () => {
    notesModule = await import('../notes');
  }, 60000);
  
  describe('Module Definition', () => {
    it('should export default module definition', () => {
      expect(notesModule.default).toBeDefined();
    });
    
    it('should have id "notes"', () => {
      expect(notesModule.default.id).toBe('notes');
    });
    
    it('should implement IFeatureModule interface', () => {
      const m = notesModule.default;
      expect(m.id).toBeDefined();
      expect(m.name).toBeDefined();
      expect(m.icon).toBeDefined();
      expect(m.description).toBeDefined();
      expect(m.component).toBeDefined();
      expect(typeof m.requiresProject).toBe('boolean');
      expect(typeof m.supportsOffline).toBe('boolean');
    });
    
    it('should support offline', () => {
      expect(notesModule.default.supportsOffline).toBe(true);
    });
    
    it('should require project', () => {
      expect(notesModule.default.requiresProject).toBe(true);
    });
    
    it('should have onProjectChange hook for note switching', () => {
      expect(typeof notesModule.default.onProjectChange).toBe('function');
    });
    
    it('should have onMount hook', () => {
      expect(typeof notesModule.default.onMount).toBe('function');
    });
    
    it('should have onUnmount hook', () => {
      expect(typeof notesModule.default.onUnmount).toBe('function');
    });
  });
  
  describe('NO-WORKSPACE Governance', () => {
    it('should NOT have workspaceId in index.ts', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/index.ts', 'utf-8');
      expect(content).not.toMatch(/workspaceId/);
    });
    
    it('should NOT have workspaceId in NotesModule.tsx', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/NotesModule.tsx', 'utf-8');
      expect(content).not.toMatch(/workspaceId/);
    });
    
    it('should NOT have WorkspaceBindings in any file', async () => {
      const fs = await import('fs').then(m => m.promises);
      const indexContent = await fs.readFile('src/modules/notes/index.ts', 'utf-8');
      const moduleContent = await fs.readFile('src/modules/notes/NotesModule.tsx', 'utf-8');
      expect(indexContent).not.toMatch(/WorkspaceBindings/);
      expect(moduleContent).not.toMatch(/WorkspaceBindings/);
    });
  });
  
  describe('Module Loader Integration', () => {
    it('should be loadable via moduleLoader', async () => {
      const { moduleLoader } = await import('../loader');
      moduleLoader.reset();
      
      const module = await moduleLoader.loadModule('notes');
      expect(module.id).toBe('notes');
    });
    
    it('should cache after loading', async () => {
      const { moduleLoader } = await import('../loader');
      moduleLoader.reset();
      
      // Load first time
      await moduleLoader.loadModule('notes');
      expect(moduleLoader.isLoaded('notes')).toBe(true);
      
      // Load second time should return cached
      const module = await moduleLoader.loadModule('notes');
      expect(module.id).toBe('notes');
    });
  });
  
  describe('Strangler Fig Pattern', () => {
    it('should import from @/plugins/notes NOT @/lib/notes', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/NotesModule.tsx', 'utf-8');
      expect(content).toMatch(/@\/plugins\/notes/);
      // Check there's no actual import statement from @/lib/notes
      // The regex matches import statements, not comments
      expect(content).not.toMatch(/import.*from\s+['"]@\/lib\/notes/);
    });
    
    it('should use notesPlugin.MainComponent', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/NotesModule.tsx', 'utf-8');
      expect(content).toMatch(/notesPlugin\.MainComponent/);
    });
    
    it('should have data-module attribute', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/NotesModule.tsx', 'utf-8');
      expect(content).toMatch(/data-module="notes"/);
    });
    
    it('should have data-project attribute', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/NotesModule.tsx', 'utf-8');
      expect(content).toMatch(/data-project=\{projectId\}/);
    });
  });
  
  describe('File Size Governance', () => {
    it('index.ts should be under 60 lines', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/index.ts', 'utf-8');
      const lineCount = content.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(60);
    });
    
    it('NotesModule.tsx should be under 60 lines', async () => {
      const fs = await import('fs').then(m => m.promises);
      const content = await fs.readFile('src/modules/notes/NotesModule.tsx', 'utf-8');
      const lineCount = content.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(60);
    });
  });
});
