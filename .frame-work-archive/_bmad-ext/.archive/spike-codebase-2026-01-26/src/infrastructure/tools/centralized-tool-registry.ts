/**
 * @fileoverview Centralized Tool Registry Implementation
 * @module infrastructure/tools/centralized-tool-registry
 *
 * Singleton registry for managing tool definitions with filtering.
 *
 * @epic 40 - Agent Chat Self-Switching Orchestrator
 * @story 40-01 - Create Centralized Tool Registry
 */

import type {
  IToolRegistry,
  RegisteredTool,
  ToolFilterConfig,
  ToolMetadata,
} from '@/domain/tools';
import type {
  AgentMode,
  ToolCategory,
} from '@/domain/tools';
import { createToolMetadata, createRegisteredTool } from '@/domain/tools';

/**
 * Centralized Tool Registry (Singleton)
 *
 * Manages all tool definitions with filtering by mode, workspace, and permissions.
 */
class CentralizedToolRegistry implements IToolRegistry {
  private static instance: CentralizedToolRegistry | null = null;
  private tools: Map<string, RegisteredTool> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CentralizedToolRegistry {
    if (!CentralizedToolRegistry.instance) {
      CentralizedToolRegistry.instance = new CentralizedToolRegistry();
    }
    return CentralizedToolRegistry.instance;
  }

  /**
   * Reset singleton (primarily for testing)
   */
  static resetInstance(): void {
    CentralizedToolRegistry.instance = null;
  }

  register(tool: RegisteredTool): void {
    if (this.tools.has(tool.metadata.id)) {
      throw new Error(`Tool with id "${tool.metadata.id}" is already registered`);
    }
    this.tools.set(tool.metadata.id, tool);
  }

  registerAll(tools: RegisteredTool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  unregister(id: string): boolean {
    return this.tools.delete(id);
  }

  get(id: string): RegisteredTool | undefined {
    return this.tools.get(id);
  }

  has(id: string): boolean {
    return this.tools.has(id);
  }

  getAll(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  getFilteredTools(config: ToolFilterConfig = {}): RegisteredTool[] {
    return this.getAll().filter((tool) => this.matchesFilter(tool, config));
  }

  getServerExposedTools(config?: Omit<ToolFilterConfig, 'serverExposedOnly'>): RegisteredTool[] {
    const baseFilter: ToolFilterConfig = { ...config, serverExposedOnly: true };
    return this.getFilteredTools(baseFilter);
  }

  count(): number {
    return this.tools.size;
  }

  clear(): void {
    this.tools.clear();
  }

  getByCategory(category: ToolCategory): RegisteredTool[] {
    return this.getAll().filter((tool) => tool.metadata.category === category);
  }

  getByMode(mode: AgentMode): RegisteredTool[] {
    return this.getAll().filter((tool) =>
      tool.metadata.allowedModes.includes(mode)
    );
  }

  getToolIds(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Check if a tool matches the given filter criteria
   * All filters use AND logic (all must pass)
   */
  private matchesFilter(tool: RegisteredTool, config: ToolFilterConfig): boolean {
    const { metadata } = tool;

    // Filter by mode
    if (config.mode && !metadata.allowedModes.includes(config.mode)) {
      return false;
    }

    // Filter by workspace type
    if (
      config.workspaceType &&
      !metadata.allowedWorkspaces.includes(config.workspaceType)
    ) {
      return false;
    }

    // Filter by category
    if (config.category && metadata.category !== config.category) {
      return false;
    }

    // Filter by server exposure
    if (config.serverExposedOnly && !metadata.serverExposed) {
      return false;
    }

    // Filter by execution side
    if (
      config.executionSide &&
      metadata.executionSide !== 'both' &&
      metadata.executionSide !== config.executionSide
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Singleton instance
 */
export const toolRegistry = CentralizedToolRegistry.getInstance();

/**
 * Factory exports for convenience
 */
export { CentralizedToolRegistry };
export { createToolMetadata, createRegisteredTool };
export type { IToolRegistry, RegisteredTool, ToolMetadata, ToolFilterConfig };
