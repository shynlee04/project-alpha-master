/**
 * @fileoverview Agent Facades Public API
 * @module lib/agent/facades
 * 
 * Public exports for AI agent facades.
 * 
 * @epic 12 - Agent Tool Interface Layer
 */

// File Tools
export type { AgentFileTools, FileEntry, FileReadResult } from './file-tools';
export { validatePath, PathValidationError } from './file-tools';
export { FileToolsFacade, createFileToolsFacade } from './file-tools-impl';

// Terminal Tools (Story 12-2 - TBD)
// export type { AgentTerminalTools } from './terminal-tools';
// export { TerminalToolsFacade, createTerminalToolsFacade } from './terminal-tools-impl';

// Sync Tools (Story 12-3 - TBD)
// export type { AgentSyncTools } from './sync-tools';
// export { SyncToolsFacade, createSyncToolsFacade } from './sync-tools-impl';

// Git Tools (Story 12-4 - TBD)
// export type { AgentGitTools } from './git-tools';
// export { GitToolsFacade } from './git-tools-impl';
