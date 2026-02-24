/**
 * @fileoverview Tool Permission Types
 * @module domain/tools/tool-permissions
 *
 * Domain-level permission types for tool registry.
 * These types are the source of truth for tool permissions.
 *
 * ANNOTATION: 2026-01-11 - Initial copy from exploration - _test-spike/_notes/codebase-exploration-2026-01-11.md
 * Original: src/domain/tools/tool-permissions.ts
 */

/**
 * Trust level for a tool - determines when user approval is required
 *
 * - auto: Tool executes without prompting
 * - prompt: User must approve each execution
 * - block: Tool is blocked from execution
 */
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

/**
 * Tool category for grouping related tools
 * Used for category-level approval (ARCH-01.4)
 *
 * - files: File system operations (read, write, list)
 * - terminal: Terminal/command execution
 * - knowledge: Knowledge base operations (search, retrieve)
 * - vision: Image/video processing
 * - search: Search operations
 * - web: Web scraping and URL processing
 * - notes: Note CRUD operations (create, read, update, delete, list)
 * - unified: Cross-workspace file operations (read, write, delete, list)
 * - composite: Multi-step agentic workflows (research, storyboard, analyze, plan)
 * - provider: LLM provider operations (EPIC-PRV - list, test, execute)
 */
export type ToolCategory =
  | 'files'
  | 'terminal'
  | 'knowledge'
  | 'vision'
  | 'search'
  | 'web'
  | 'notes'
  | 'unified'
  | 'composite'
  | 'provider';

/**
 * Risk level for approval flow
 *
 * - low: Minimal impact, auto-approve by default
 * - medium: Moderate impact, prompt by default
 * - high: Significant impact, block or strong prompt by default
 */
export type ToolRiskLevel = 'low' | 'medium' | 'high';
