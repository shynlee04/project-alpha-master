/**
 * @fileoverview Tool Registry Domain Types
 * @module domain/tools/tool-definition
 *
 * Centralized tool registry domain types following Clean Architecture.
 * Pure types and interfaces - no infrastructure dependencies.
 *
 * ANNOTATION: 2026-01-11 - Initial copy from exploration - _test-spike/_notes/codebase-exploration-2026-01-11.md
 * Original: src/domain/tools/tool-definition.ts
 */

import type { ToolDefinition } from '@tanstack/ai';
import type { WorkspaceType } from '../value-objects/workspace-type';
import type { ToolTrustLevel, ToolCategory, ToolRiskLevel } from './tool-permissions';

// Re-export WorkspaceType for convenience
export type { WorkspaceType };
// Re-export permission types for tool registry
export type { ToolTrustLevel, ToolCategory, ToolRiskLevel } from './tool-permissions';

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
  riskLevel: ToolRiskLevel;
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
   * @returns RegisteredTool or undefined if not found
   */
  get(id: string): RegisteredTool | undefined;

  /**
   * Get all registered tools
   * @returns Array of all registered tools
   */
  getAll(): RegisteredTool[];

  /**
   * Get tools matching filter configuration
   * @param config - Filter configuration
   * @returns Array of matching tools
   */
  getFilteredTools(config: ToolFilterConfig): RegisteredTool[];

  /**
   * Get tools exposed to server-side LLM
   * @param config - Optional additional filter
   * @returns Array of server-exposed tools
   */
  getServerExposedTools(config?: Omit<ToolFilterConfig, 'serverExposedOnly'>): RegisteredTool[];
}

/**
 * Create tool metadata helper
 */
export function createToolMetadata(props: Partial<ToolMetadata> & { id: string; category: ToolCategory }): ToolMetadata {
  return {
    id: props.id,
    category: props.category,
    allowedModes: props.allowedModes ?? ['coding', 'knowledge', 'orchestrator'],
    allowedWorkspaces: props.allowedWorkspaces ?? ['ide', 'knowledge', 'study', 'notes'],
    defaultTrustLevel: props.defaultTrustLevel ?? 'prompt',
    serverExposed: props.serverExposed ?? false,
    executionSide: props.executionSide ?? 'both',
    riskLevel: props.riskLevel ?? 'medium',
    ...props,
  };
}

/**
 * Create registered tool helper
 */
export function createRegisteredTool(
  definition: ToolDefinition<any, any, any>,
  metadata: ToolMetadata
): RegisteredTool {
  return {
    definition,
    metadata,
  };
}
