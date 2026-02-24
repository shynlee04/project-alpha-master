/**
 * @fileoverview Module Panel Component
 * @description Renders the active module with Suspense fallback.
 */

import { Suspense, lazy, type ComponentType } from 'react';
import type { ModuleType, ModuleProps } from './types';

/**
 * Lazy-loaded module components
 */
const modules: Record<ModuleType, React.LazyExoticComponent<ComponentType<ModuleProps>>> = {
  monaco: lazy(() => 
    import('./monaco')
      .then(m => ({ default: m.default.component }))
      .catch(() => ({ default: ModulePlaceholder }))
  ),
  notes: lazy(() => 
    import('./notes')
      .then(m => ({ default: m.default.component }))
      .catch(() => ({ default: ModulePlaceholder }))
  ),
  terminal: lazy(() => 
    import('./terminal')
      .then(m => ({ default: m.default.component }))
      .catch(() => ({ default: ModulePlaceholder }))
  ),
  preview: lazy(() => 
    import('./preview')
      .then(m => ({ default: m.default.component }))
      .catch(() => ({ default: ModulePlaceholder }))
  ),
};

/**
 * Placeholder for modules that don't exist yet
 */
function ModulePlaceholder({ className }: ModuleProps) {
  return (
    <div className={`flex items-center justify-center h-full ${className || ''}`}>
      <div className="text-muted-foreground">Module not available</div>
    </div>
  );
}

/**
 * Module Panel Props
 */
interface ModulePanelProps {
  projectId: string;
  activeModule: ModuleType;
  className?: string;
}

/**
 * Loading fallback component
 */
function ModuleLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-muted-foreground">Loading module...</div>
    </div>
  );
}

/**
 * Module Panel - Renders the active module with lazy loading
 */
export function ModulePanel({ projectId, activeModule, className }: ModulePanelProps) {
  const ModuleComponent = modules[activeModule];
  
  if (!ModuleComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Unknown module: {activeModule}</div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={<ModuleLoading />}>
      <ModuleComponent projectId={projectId} className={className} />
    </Suspense>
  );
}
