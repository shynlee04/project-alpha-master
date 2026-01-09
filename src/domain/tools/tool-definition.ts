/**
 * @fileoverview Tool Registry Domain Types
 * @module domain/tools/tool-definition
 *
 * Centralized tool registry domain types following Clean Architecture.
 * Pure types and interfaces - no infrastructure dependencies.
 *
 * @epic 40 - Agent Chat Self-Switching Orchestrator
 * @story 40-01 - Create Centralized Tool Registry
 */

import type { ToolDefinition } from '@tanstack/ai';
import type { WorkspaceType } from '../value-objects/workspace-type';
import type { ToolTrustLevel, ToolCategory } from '../../infrastructure/persistence/stores/permissions/types';

// Re-export WorkspaceType for convenience
export type { WorkspaceType };
// Re-export permission types for tool registry
export type { ToolTrustLevel, ToolCategory };

/**
 * Agent execution modes
 * Determines which tools are available based on agent context
 */
export type AgentMode = 'coding' | 'knowledge' | 'orchestrator';

/**
 * Tool execution context
 * Server-side (runs on server) or client-side (runs in browser)
 */
export type ToolExecutionSide = 'server' | 'client' | 'both';

/**
 * Metadata associated with a registered tool
 */
export interface ToolMetadata {
  /** Tool identifier (matches TanStack tool name) */
  id: string;
  /** Tool category for grouping */
  category: ToolCategory;
  /** Agent modes where this tool is available */
  allowedModes: AgentMode[];
  /** Workspace types where this tool is available */
  allowedWorkspaces: WorkspaceType[];
  /** Default trust level for this tool */
  defaultTrustLevel: ToolTrustLevel;
  /** Whether tool should be exposed to server-side LLM */
  serverExposed: boolean;
  /** Execution side preference */
  executionSide: ToolExecutionSide;
  /** Risk level for approval flow */
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Filter configuration for querying tools
 */
export interface ToolFilterConfig {
  /** Filter by agent mode */
  mode?: AgentMode;
  /** Filter by workspace type */
  workspaceType?: WorkspaceType;
  /** Filter by category */
  category?: ToolCategory;
  /** Filter by server exposure flag */
  serverExposedOnly?: boolean;
  /** Filter by execution side */
  executionSide?: ToolExecutionSide;
}

/**
 * Registered tool with metadata
 */
export interface RegisteredTool {
  /** TanStack tool definition (any to support arbitrary tool schemas) */
  definition: ToolDefinition<any, any, any>;
  /** Tool metadata */
  metadata: ToolMetadata;
}

/**
 * Tool Registry Interface
 * Domain interface for centralized tool registry
 */
export interface IToolRegistry {
  /**
   * Register a tool with metadata
   * @throws Error if tool ID already exists
   */
  register(tool: RegisteredTool): void;

  /**
   * Register multiple tools at once
   */
  registerAll(tools: RegisteredTool[]): void;

  /**
   * Unregister a tool by ID
   * @returns true if tool was removed, false if not found
   */
  unregister(id: string): boolean;

  /**
   * Get a tool by ID
   */
  get(id: string): RegisteredTool | undefined;

  /**
   * Check if a tool is registered
   */
  has(id: string): boolean;

  /**
   * Get all registered tools
   */
  getAll(): RegisteredTool[];

  /**
   * Get tools filtered by criteria
   * All filters use AND logic (all must pass)
   */
  getFilteredTools(config: ToolFilterConfig): RegisteredTool[];

  /**
   * Get tools that should be exposed to server-side LLM
   */
  getServerExposedTools(config?: Omit<ToolFilterConfig, 'serverExposedOnly'>): RegisteredTool[];

  /**
   * Get count of registered tools
   */
  count(): number;

  /**
   * Clear all registered tools
   */
  clear(): void;

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): RegisteredTool[];

  /**
   * Get tools by mode
   */
  getByMode(mode: AgentMode): RegisteredTool[];

  /**
   * Get all tool IDs
   */
  getToolIds(): string[];
}

/**
 * Create tool metadata helper
 */
export function createToolMetadata(
  id: string,
  category: ToolCategory,
  allowedModes: AgentMode[],
  allowedWorkspaces: WorkspaceType[],
  options?: Partial<ToolMetadata>
): ToolMetadata {
  return {
    id,
    category,
    allowedModes,
    allowedWorkspaces,
    defaultTrustLevel: 'prompt',
    serverExposed: true,
    executionSide: 'both',
    riskLevel: 'medium',
    ...options,
  };
}

/**
 * Create registered tool helper
 */
export function createRegisteredTool(
  definition: ToolDefinition<any, any, any>,
  metadata: ToolMetadata
): RegisteredTool {
  return { definition, metadata };
}
