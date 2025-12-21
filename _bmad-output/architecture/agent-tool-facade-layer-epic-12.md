# Agent Tool Facade Layer (Epic 12)

**Status:** Proposed in Course Correction v3  
**Research Sources:** Roo Code patterns (local library), TanStack AI tool patterns (Context7)

### Design Rationale

AI agents need a stable, facade-based interface to interact with IDE subsystems. Direct access to SyncManager, LocalFSAdapter, etc. creates tight coupling. Facades provide:
- Stable contracts that don't change when implementations evolve
- Simplified interfaces for common agent operations
- Security constraints (e.g., path validation, rate limiting)
- Observable side effects via event bus

### Facade Contracts

```typescript
// src/lib/agent-tools/facades/file-tools.ts
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

export interface AgentFileTools {
  /**
   * Read file content. Returns null if file doesn't exist.
   * Emits: file:read (not in standard events, but can be added)
   */
  readFile(path: string): Promise<string | null>;
  
  /**
   * Write content to file. Creates file if doesn't exist.
   * Emits: file:created or file:modified
   */
  writeFile(path: string, content: string): Promise<void>;
  
  /**
   * List directory contents. Returns FileEntry array.
   */
  listDirectory(path: string, recursive?: boolean): Promise<FileEntry[]>;
  
  /**
   * Create new file with optional content.
   * Emits: file:created
   */
  createFile(path: string, content?: string): Promise<void>;
  
  /**
   * Delete file or directory.
   * Emits: file:deleted or directory:deleted
   */
  delete(path: string): Promise<void>;
  
  /**
   * Search for pattern in files. Uses grep-like semantics.
   */
  searchFiles(pattern: string, glob?: string): Promise<SearchResult[]>;
}

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface SearchResult {
  path: string;
  line: number;
  content: string;
  match: string;
}
```

```typescript
// src/lib/agent-tools/facades/terminal-tools.ts
export interface AgentTerminalTools {
  /**
   * Run command in WebContainer shell.
   * Returns stdout and exit code.
   * Emits: process:started, process:output, process:exited
   */
  runCommand(command: string, args?: string[]): Promise<CommandResult>;
  
  /**
   * Stream command output via callback.
   * Returns abort function.
   */
  streamCommand(
    command: string,
    args: string[],
    onOutput: (data: string) => void
  ): Promise<{ abort: () => void; exitCode: Promise<number> }>;
  
  /**
   * Kill running process by PID.
   */
  killProcess(pid: string): Promise<void>;
  
  /**
   * List active processes.
   */
  listProcesses(): Promise<ProcessInfo[]>;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface ProcessInfo {
  pid: string;
  command: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
}
```

```typescript
// src/lib/agent-tools/facades/sync-tools.ts
export interface AgentSyncTools {
  /**
   * Get current sync status.
   */
  getSyncStatus(): SyncStatus;
  
  /**
   * Trigger manual sync in specified direction.
   */
  triggerSync(direction?: 'to-wc' | 'to-local'): Promise<void>;
  
  /**
   * Toggle auto-sync on/off.
   */
  setAutoSync(enabled: boolean): void;
  
  /**
   * Get sync configuration (exclusion patterns, etc.).
   */
  getSyncConfig(): SyncConfig;
  
  /**
   * Update sync configuration.
   */
  updateSyncConfig(config: Partial<SyncConfig>): void;
}

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'error' | 'paused';
  lastSyncTime: Date | null;
  pendingChanges: number;
  currentFile?: string;
  progress?: { current: number; total: number };
  error?: string;
}

export interface SyncConfig {
  autoSync: boolean;
  debounceMs: number;
  excludePatterns: string[];
}
```

### TanStack AI Tool Integration (Epic 12-5)

```typescript
// src/lib/agent-tools/tool-definitions.ts
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { AgentFileTools, AgentTerminalTools } from './facades';

export function createAgentTools(
  fileTools: AgentFileTools,
  terminalTools: AgentTerminalTools
) {
  return {
    read_file: toolDefinition({
      description: 'Read the content of a file at the specified path',
      parameters: z.object({
        path: z.string().describe('Relative path to the file'),
      }),
    }).client(async ({ input }) => {
      const content = await fileTools.readFile(input.path);
      if (content === null) {
        return { error: `File not found: ${input.path}` };
      }
      return { content };
    }),
    
    write_file: toolDefinition({
      description: 'Write content to a file, creating it if necessary',
      parameters: z.object({
        path: z.string().describe('Relative path to the file'),
        content: z.string().describe('Content to write'),
      }),
    }).client(async ({ input }) => {
      await fileTools.writeFile(input.path, input.content);
      return { success: true, path: input.path };
    }),
    
    run_command: toolDefinition({
      description: 'Execute a shell command in the WebContainer',
      parameters: z.object({
        command: z.string().describe('Command to execute'),
        args: z.array(z.string()).optional().describe('Command arguments'),
      }),
    }).client(async ({ input }) => {
      const result = await terminalTools.runCommand(
        input.command,
        input.args
      );
      return result;
    }),
    
    list_files: toolDefinition({
      description: 'List files and directories at the specified path',
      parameters: z.object({
        path: z.string().describe('Directory path to list'),
        recursive: z.boolean().optional().describe('Include subdirectories'),
      }),
    }).client(async ({ input }) => {
      const entries = await fileTools.listDirectory(input.path, input.recursive);
      return { entries };
    }),
  };
}
```

---
