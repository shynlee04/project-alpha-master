/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/infrastructure/tools/centralized-tool-registry.ts
 * 
 * This module is disabled during Phase 1A. Centralized tool registry functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

console.log('[Phase 2] Centralized tool registry disabled during Phase 1A');

export interface ToolDefinition {
  name: string;
  description: string;
  execute: (...args: unknown[]) => Promise<unknown>;
}

export interface ToolRegistry {
  register(tool: ToolDefinition): void;
  unregister(name: string): void;
  get(name: string): ToolDefinition | undefined;
  list(): ToolDefinition[];
}

export class CentralizedToolRegistry implements ToolRegistry {
  private _tools = new Map<string, ToolDefinition>();

  register(_tool: ToolDefinition): void {
    console.log('[Phase 2] Tool registration disabled during Phase 1A');
  }

  unregister(_name: string): void {
    console.log('[Phase 2] Tool unregistration disabled during Phase 1A');
  }

  get(_name: string): ToolDefinition | undefined {
    console.log('[Phase 2] Tool retrieval disabled during Phase 1A');
    return undefined;
  }

  list(): ToolDefinition[] {
    console.log('[Phase 2] Tool listing disabled during Phase 1A');
    return [];
  }

  getServerExposedTools(): ToolDefinition[] {
    console.log('[Phase 2] getServerExposedTools disabled during Phase 1A');
    return [];
  }

  get count(): number {
    return this._tools.size;
  }
}

export const toolRegistry = new CentralizedToolRegistry();

export function useToolRegistry() {
  console.log('[Phase 2] useToolRegistry disabled during Phase 1A');
  return {
    register: () => {},
    unregister: () => {},
    get: () => undefined,
    list: () => [],
  };
}

export default toolRegistry;