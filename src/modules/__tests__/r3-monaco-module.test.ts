/**
 * @fileoverview R-3-02: Monaco Module Tests
 * @description Tests for Monaco module porting to new module system.
 * 
 * **TDD**: RED phase - Tests first, then implementation.
 * **NO-WORKSPACE COMPLIANT**: Validates no workspaceId references.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('R-3-02: Monaco Module', () => {
  
  describe('Module Definition', () => {
    it('should export default module definition', async () => {
      const module = await import('../monaco');
      expect(module.default).toBeDefined();
    });
    
    it('should have id "monaco"', async () => {
      const module = await import('../monaco');
      expect(module.default.id).toBe('monaco');
    });
    
    it('should implement IFeatureModule interface', async () => {
      const module = await import('../monaco');
      const m = module.default;
      
      // Required fields
      expect(m.id).toBeDefined();
      expect(m.name).toBeDefined();
      expect(m.icon).toBeDefined();
      expect(m.description).toBeDefined();
      expect(m.component).toBeDefined();
      expect(typeof m.requiresProject).toBe('boolean');
      expect(typeof m.supportsOffline).toBe('boolean');
    });
    
    it('should have lifecycle hooks', async () => {
      const module = await import('../monaco');
      expect(typeof module.default.onMount).toBe('function');
      expect(typeof module.default.onUnmount).toBe('function');
    });
    
    it('should have name "Code Editor"', async () => {
      const module = await import('../monaco');
      expect(module.default.name).toBe('Code Editor');
    });
    
    it('should require project', async () => {
      const module = await import('../monaco');
      expect(module.default.requiresProject).toBe(true);
    });
    
    it('should support offline', async () => {
      const module = await import('../monaco');
      expect(module.default.supportsOffline).toBe(true);
    });
  });
  
  describe('NO-WORKSPACE Governance', () => {
    const moduleDir = path.resolve(__dirname, '../monaco');
    
    it('should NOT have workspaceId in index.ts', () => {
      const content = fs.readFileSync(path.join(moduleDir, 'index.ts'), 'utf-8');
      expect(content).not.toMatch(/workspaceId/i);
      expect(content).not.toMatch(/workspaceBindings/i);
    });
    
    it('should NOT have workspaceId in MonacoModule.tsx', () => {
      const content = fs.readFileSync(path.join(moduleDir, 'MonacoModule.tsx'), 'utf-8');
      expect(content).not.toMatch(/workspaceId/i);
      expect(content).not.toMatch(/workspaceBindings/i);
    });
    
    it('should use projectId in component props', () => {
      const content = fs.readFileSync(path.join(moduleDir, 'MonacoModule.tsx'), 'utf-8');
      expect(content).toMatch(/projectId/);
    });
    
    it('should NOT have @/lib/ imports in new files', () => {
      const files = ['index.ts', 'MonacoModule.tsx'];
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(moduleDir, file), 'utf-8');
        expect(content).not.toMatch(/@\/lib\//);
      }
    });
  });
  
  describe('Module Loader Integration', () => {
    beforeEach(async () => {
      const { moduleLoader } = await import('../loader');
      moduleLoader.reset(); // Clear any cached modules
    });
    
    it('should be loadable via moduleLoader', async () => {
      const { moduleLoader } = await import('../loader');
      
      const module = await moduleLoader.loadModule('monaco');
      expect(module.id).toBe('monaco');
      expect(module.name).toBe('Code Editor');
    });
    
    it('should mark as loaded after loading', async () => {
      const { moduleLoader } = await import('../loader');
      
      expect(moduleLoader.isLoaded('monaco')).toBe(false);
      await moduleLoader.loadModule('monaco');
      expect(moduleLoader.isLoaded('monaco')).toBe(true);
    });
    
    it('should have component defined', async () => {
      const { moduleLoader } = await import('../loader');
      
      const module = await moduleLoader.loadModule('monaco');
      expect(module.component).toBeDefined();
      expect(typeof module.component).toBe('function');
    });
  });
  
  describe('Strangler Fig Pattern', () => {
    it('should import MonacoMain from existing plugin', async () => {
      const content = fs.readFileSync(
        path.resolve(__dirname, '../monaco/MonacoModule.tsx'),
        'utf-8'
      );
      expect(content).toMatch(/@\/plugins\/monaco\/MonacoMain/);
    });
    
    it('should not exceed 150 lines per new file', () => {
      const moduleDir = path.resolve(__dirname, '../monaco');
      const files = ['index.ts', 'MonacoModule.tsx'];
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(moduleDir, file), 'utf-8');
        const lineCount = content.split('\n').length;
        expect(lineCount).toBeLessThanOrEqual(150);
      }
    });
  });
});
