/**
 * @fileoverview Module Loader
 * @description Lazy loads and manages feature modules.
 * 
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 */

import type { IFeatureModule, ModuleType } from './types';

/**
 * Module import functions for lazy loading
 * 
 * Note: These imports will fail until the actual modules are created.
 * For now, we provide a fallback that returns a stub module.
 */
const moduleImports: Record<ModuleType, () => Promise<{ default: IFeatureModule }>> = {
  monaco: () => import('./monaco').catch(() => createStubModule('monaco')),
  notes: () => import('./notes').catch(() => createStubModule('notes')),
  terminal: () => import('./terminal').catch(() => createStubModule('terminal')),
  preview: () => import('./preview').catch(() => createStubModule('preview')),
};

/**
 * Creates a stub module for modules that don't exist yet
 */
function createStubModule(type: ModuleType): { default: IFeatureModule } {
  return {
    default: {
      id: type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} (Stub)`,
      icon: 'placeholder',
      description: `Stub for ${type} module`,
      component: () => null,
      requiresProject: true,
      supportsOffline: false,
    },
  };
}

/**
 * Module Loader - Singleton for lazy loading feature modules
 */
class ModuleLoader {
  private loadedModules = new Map<ModuleType, IFeatureModule>();
  private loadingPromises = new Map<ModuleType, Promise<IFeatureModule>>();
  
  /**
   * Load a module by type
   * Returns cached module if already loaded
   */
  async loadModule(type: ModuleType): Promise<IFeatureModule> {
    // Return cached if already loaded
    if (this.loadedModules.has(type)) {
      return this.loadedModules.get(type)!;
    }
    
    // Return existing promise if currently loading
    if (this.loadingPromises.has(type)) {
      return this.loadingPromises.get(type)!;
    }
    
    // Start loading
    const loadingPromise = moduleImports[type]().then(module => {
      this.loadedModules.set(type, module.default);
      this.loadingPromises.delete(type);
      return module.default;
    });
    
    this.loadingPromises.set(type, loadingPromise);
    return loadingPromise;
  }
  
  /**
   * Check if a module is loaded
   */
  isLoaded(type: ModuleType): boolean {
    return this.loadedModules.has(type);
  }
  
  /**
   * Get all currently loaded modules
   */
  getLoaded(): IFeatureModule[] {
    return Array.from(this.loadedModules.values());
  }
  
  /**
   * Get a specific loaded module (undefined if not loaded)
   */
  getModule(type: ModuleType): IFeatureModule | undefined {
    return this.loadedModules.get(type);
  }
  
  /**
   * Preload all modules
   */
  async preloadAll(): Promise<void> {
    await Promise.all(
      (Object.keys(moduleImports) as ModuleType[]).map(type => 
        this.loadModule(type)
      )
    );
  }
  
  /**
   * Reset loader state (for testing)
   */
  reset(): void {
    this.loadedModules.clear();
    this.loadingPromises.clear();
  }
}

/** Singleton module loader instance */
export const moduleLoader = new ModuleLoader();
