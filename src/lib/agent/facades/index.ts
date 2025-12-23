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

// File Lock (Story 12-1B)
export { FileLock, FileLockTimeoutError, fileLock, createFileLock } from './file-lock';

// Terminal Tools (Story 12-2)
export type {
    AgentTerminalTools,
    CommandOptions,
    CommandResult,
    ShellSession,
} from './terminal-tools';
export { TerminalToolsError } from './terminal-tools';
export { TerminalToolsFacade, createTerminalToolsFacade } from './terminal-tools-impl';

// Sync Tools (Story 12-3 - TBD)
// export type { AgentSyncTools } from './sync-tools';
// export { SyncToolsFacade, createSyncToolsFacade } from './sync-tools-impl';

// Git Tools (Story 12-4 - TBD)
// export type { AgentGitTools } from './git-tools';
// export { GitToolsFacade } from './git-tools-impl';
