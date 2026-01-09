/**
 * @fileoverview Tool Permission Types
 * @module domain/tools/tool-permissions
 *
 * Domain-level permission types for tool registry.
 * These types are the source of truth for tool permissions.
 *
 * @epic 40 - Agent Chat Self-Switching Orchestrator
 * @story 40-01 - Create Centralized Tool Registry
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
 */
export type ToolCategory = 'files' | 'terminal' | 'knowledge' | 'vision' | 'search' | 'web' | 'notes';

/**
 * Risk level for approval flow
 *
 * - low: Minimal impact, auto-approve by default
 * - medium: Moderate impact, prompt by default
 * - high: Significant impact, block or strong prompt by default
 */
export type ToolRiskLevel = 'low' | 'medium' | 'high';
