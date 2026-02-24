/**
 * @fileoverview Terminal FS Adapter - Bridges terminal commands to StorageGateway
 * @module infrastructure/filesystem/terminal-fs-adapter
 *
 * **CC-IDE-04**: Terminal File System Access
 *
 * Per ADR-033 Decision D2:
 * - Desktop with FSA → FSAGateway for terminal file operations
 * - Mobile/Tablet → IDBGateway for terminal file operations
 * - Terminal commands mapped to StorageGateway methods
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-04
 * @author TEAM_B
 * @created 2026-01-18
 */

import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import { FileSystemError } from './fs-errors';

// ============================================================================
// Types
// ============================================================================

/**
 * Command execution result
 */
export interface CommandResult {
  /** Exit code (0 = success) */
  exitCode: number;
  /** Output to display in terminal */
  stdout: string;
  /** Error output */
  stderr: string;
}

/**
 * Working directory context for terminal
 */
export interface WorkingDirectoryContext {
  /** Current working directory (relative to project root) */
  cwd: string;
  /** History of directory changes */
  history: string[];
}

/**
 * Terminal FS Adapter options
 */
export interface TerminalFSAdapterOptions {
  /** Storage gateway for file operations */
  gateway: StorageGateway;
  /** Initial working directory (default: "/") */
  initialCwd?: string;
}

// ============================================================================
// Terminal FS Adapter Implementation
// ============================================================================

/**
 * Terminal FS Adapter - Bridges terminal commands to StorageGateway
 *
 * @remarks
 * Provides a virtual file system interface for terminal commands by mapping
 * them to StorageGateway methods. Supports common Unix-like commands:
 *
 * - ls → gateway.list()
 * - cat → gateway.read()
 * - grep → read + filter
 * - nano/vim → gateway.write()
 * - git → gateway operations
 *
 * Maintains working directory context for relative path resolution.
 *
 * @example
 * ```ts
 * const gateway = createIdeFileGateway({ projectId, fsaHandle });
 * const adapter = createTerminalFSAdapter({ gateway });
 *
 * // Execute command
 * const result = await adapter.execute('ls -la');
 * console.log(result.stdout); // "drwxr-xr-x  2 user group  4096 ..."
 *
 * // Change directory
 * await adapter.execute('cd src');
 *
 * // Read file
 * await adapter.execute('cat index.ts');
 * ```
 */
export class TerminalFSAdapter {
  private gateway: StorageGateway;
  private cwd: string;
  private cwdHistory: string[];

  constructor(options: TerminalFSAdapterOptions) {
    this.gateway = options.gateway;
    this.cwd = options.initialCwd || '/';
    this.cwdHistory = [];
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Execute a terminal command
   *
   * @param command - Command string to execute
   * @returns Command execution result
   */
  async execute(command: string): Promise<CommandResult> {
    try {
      // Trim and split command
      const trimmedCommand = command.trim();
      if (!trimmedCommand) {
        return {
          exitCode: 0,
          stdout: '',
          stderr: '',
        };
      }

      // Parse command and arguments
      const parts = trimmedCommand.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      console.log(`[TerminalFSAdapter] Executing: ${cmd}`, args);

      // Dispatch to command handler
      switch (cmd) {
        case 'ls':
          return await this.handleLs(args);
        case 'cat':
          return await this.handleCat(args);
        case 'grep':
          return await this.handleGrep(args);
        case 'nano':
        case 'vim':
          return await this.handleEditor(cmd, args);
        case 'cd':
          return await this.handleCd(args);
        case 'pwd':
          return await this.handlePwd();
        case 'git':
          return await this.handleGit(args);
        case 'echo':
          return await this.handleEcho(args);
        case 'mkdir':
          return await this.handleMkdir(args);
        case 'touch':
          return await this.handleTouch(args);
        case 'rm':
          return await this.handleRm(args);
        default:
          return {
            exitCode: 127,
            stdout: '',
            stderr: `command not found: ${cmd}`,
          };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[TerminalFSAdapter] Command failed:', err);

      return {
        exitCode: 1,
        stdout: '',
        stderr: err.message,
      };
    }
  }

  /**
   * Get current working directory
   *
   * @returns Current working directory path
   */
  getCwd(): string {
    return this.cwd;
  }

  /**
   * Set working directory
   *
   * @param path - New working directory
   */
  setCwd(path: string): void {
    this.cwdHistory.push(this.cwd);
    this.cwd = path; // Direct assignment - no resolvePath call
  }

  /**
   * Get working directory history
   *
   * @returns Array of previous working directories
   */
  getCwdHistory(): string[] {
    return [...this.cwdHistory];
  }

  // ============================================================================
  // Private Command Handlers
  // ============================================================================

  /**
   * Handle ls command
   */
  private async handleLs(args: string[]): Promise<CommandResult> {
    // Parse options (simplified: -a for all, -l for long format)
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');

    // Get target path (last arg if not an option)
    const pathArg = args.find(arg => !arg.startsWith('-'));
    const targetPath = this.resolvePath(pathArg || '.');

    try {
      // List files from gateway
      const entries = await this.gateway.list(targetPath);

      // Filter .git if not showing all files
      const filteredEntries = showAll
        ? entries
        : entries.filter(entry => {
            const name = entry.path.split('/').pop() || '';
            return !name.startsWith('.');
          });

      // Format output
      if (longFormat) {
        const output = filteredEntries
          .map(entry => this.formatLongEntry(entry))
          .join('\n');
        return {
          exitCode: 0,
          stdout: output,
          stderr: '',
        };
      } else {
        const output = filteredEntries
          .map(entry => {
            const name = entry.path.split('/').pop() || '';
            const isDir = entry.kind === 'directory';
            return isDir ? `${name}/` : name;
          })
          .join('  ');
        return {
          exitCode: 0,
          stdout: output,
          stderr: '',
        };
      }
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `ls: cannot access '${targetPath}': ${error.message}`,
        };
      }
      throw error;
    }
  }

  /**
   * Handle cat command
   */
  private async handleCat(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: 'cat: missing file operand',
      };
    }

    const filePath = this.resolvePath(args[0]);

    try {
      const data = await this.gateway.read(filePath);
      const content = new TextDecoder().decode(data);

      return {
        exitCode: 0,
        stdout: content,
        stderr: '',
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `cat: ${filePath}: ${error.message}`,
        };
      }
      throw error;
    }
  }

  /**
   * Handle grep command
   */
  private async handleGrep(args: string[]): Promise<CommandResult> {
    // Parse arguments (simplified: pattern [file])
    if (args.length < 1) {
      return {
        exitCode: 2,
        stdout: '',
        stderr: 'grep: missing pattern',
      };
    }

    const pattern = args[0];
    const filePath = args[1] ? this.resolvePath(args[1]) : this.cwd;

    try {
      // Read file content
      const data = await this.gateway.read(filePath);
      const content = new TextDecoder().decode(data);
      const lines = content.split('\n');

      // Filter lines matching pattern
      const matchingLines = lines.filter(line => line.includes(pattern));

      // Format output with line numbers
      const output = matchingLines
        .map(line => {
          const lineNumber = lines.indexOf(line) + 1;
          return `${filePath}:${lineNumber}:${line}`;
        })
        .join('\n');

      return {
        exitCode: 0,
        stdout: output,
        stderr: '',
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 2,
          stdout: '',
          stderr: `grep: ${filePath}: ${error.message}`,
        };
      }
      throw error;
    }
  }

  /**
   * Handle nano/vim command (simplified - just writes content)
   */
  private async handleEditor(cmd: string, args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: `${cmd}: missing file operand`,
      };
    }

    const filePath = this.resolvePath(args[0]);

    // For this implementation, we'll just show a message
    // Real implementation would open an editor overlay
    return {
      exitCode: 0,
      stdout: `${cmd}: ${filePath} - editor not yet implemented in browser terminal`,
      stderr: '',
    };
  }

  /**
   * Handle cd command
   */
  private async handleCd(args: string[]): Promise<CommandResult> {
    const targetPath = args[0] || '/';

    try {
      const resolvedPath = this.resolvePath(targetPath);

      // Check if path exists and is a directory
      const exists = await this.gateway.exists(resolvedPath);
      if (!exists) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `cd: no such file or directory: ${targetPath}`,
        };
      }

      // Get entry to verify it's a directory
      const entries = await this.gateway.list(resolvedPath);
      if (entries.length === 0 && resolvedPath !== '.') {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `cd: not a directory: ${targetPath}`,
        };
      }

       // Change directory - directly set without resolving (avoid circular dependency)
      this.cwd = resolvedPath;
      
      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `cd: ${targetPath}: ${error.message}`,
        };
      }
      throw error;
    }
  }

  /**
   * Handle pwd command
   */
  private async handlePwd(): Promise<CommandResult> {
    return {
      exitCode: 0,
      stdout: this.cwd,
      stderr: '',
    };
  }

  /**
   * Handle git commands (simplified)
   */
  private async handleGit(args: string[]): Promise<CommandResult> {
    const subCommand = args[0];

    switch (subCommand) {
      case 'status':
        return await this.handleGitStatus();
      case 'add':
        return await this.handleGitAdd(args.slice(1));
      case 'commit':
        return await this.handleGitCommit(args.slice(1));
      case 'log':
        return await this.handleGitLog();
      default:
        return {
          exitCode: 1,
          stdout: '',
          stderr: `git: '${subCommand}' is not a git command`,
        };
    }
  }

  /**
   * Handle git status
   */
  private async handleGitStatus(): Promise<CommandResult> {
    try {
      // List files in current directory (simplified git status)
      const entries = await this.gateway.list(this.cwd);

      const output = [
        'On branch main',
        'Changes not staged for commit:',
        ...entries
          .filter(entry => !entry.path.includes('.git'))
          .map(entry => {
            const status = entry.kind === 'directory' ? '??' : ' M';
            const name = entry.path.split('/').pop() || '';
            return `\t${status} ${name}`;
          }),
        '',
        'no changes added to commit',
      ].join('\n');

      return {
        exitCode: 0,
        stdout: output,
        stderr: '',
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 128,
          stdout: '',
          stderr: `fatal: ${error.message}`,
        };
      }
      throw error;
    }
  }

  /**
   * Handle git add
   */
  private async handleGitAdd(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: 'git: nothing specified, nothing added.',
      };
    }

    // For simplified implementation, just show what would be added
    const files = args.map(arg => this.resolvePath(arg));
    const output = files.map(f => `\t'${f}'`).join('\n');

    return {
      exitCode: 0,
      stdout: `Adding files:\n${output}`,
      stderr: '',
    };
  }

  /**
   * Handle git commit
   */
  private async handleGitCommit(args: string[]): Promise<CommandResult> {
    // For simplified implementation, just show message
    const messageIndex = args.indexOf('-m');
    const message = messageIndex !== -1 && args[messageIndex + 1]
      ? args[messageIndex + 1]
      : 'Update files';

    return {
      exitCode: 0,
      stdout: `[main ${new Date().toISOString()}] ${message}\n 1 file changed, 1 insertion(+)`,
      stderr: '',
    };
  }

  /**
   * Handle git log
   */
  private async handleGitLog(): Promise<CommandResult> {
    const output = [
      'commit 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
      `Author: Developer <dev@example.com>`,
      `Date: ${new Date().toISOString()}`,
      '',
      '    Update files',
    ].join('\n');

    return {
      exitCode: 0,
      stdout: output,
      stderr: '',
    };
  }

  /**
   * Handle echo command
   */
  private async handleEcho(args: string[]): Promise<CommandResult> {
    const text = args.join(' ');
    return {
      exitCode: 0,
      stdout: text,
      stderr: '',
    };
  }

  /**
   * Handle mkdir command
   */
  private async handleMkdir(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: 'mkdir: missing operand',
      };
    }

    const dirPath = this.resolvePath(args[0]);

    try {
      // Check if createDirectory method exists on gateway
      if (this.gateway.createDirectory) {
        await this.gateway.createDirectory(dirPath);
      } else {
        // Fallback: try to write to a .placeholder file
        return {
          exitCode: 1,
          stdout: '',
          stderr: 'mkdir: not implemented in this gateway',
        };
      }

      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `mkdir: ${dirPath}: ${error.message}`,
        };
      }
      throw error;
    }
  }

  /**
   * Handle touch command
   */
  private async handleTouch(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: 'touch: missing file operand',
      };
    }

    const filePath = this.resolvePath(args[0]);

    try {
      await this.gateway.write(filePath, new TextEncoder().encode(''));

      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `touch: ${filePath}: ${error.message}`,
        };
      }
      throw error;
    }
  }

  /**
   * Handle rm command
   */
  private async handleRm(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: 'rm: missing operand',
      };
    }

    const filePath = this.resolvePath(args[0]);

    try {
      await this.gateway.delete(filePath);

      return {
        exitCode: 0,
        stdout: '',
        stderr: '',
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        return {
          exitCode: 1,
          stdout: '',
          stderr: `rm: ${filePath}: ${error.message}`,
        };
      }
      throw error;
    }
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /**
   * Resolve path relative to current working directory
   */
  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      // Absolute path
      return path;
    }

    if (path === '.') {
      return this.cwd;
    }

    if (path === '..') {
      // Parent directory
      const parts = this.cwd.split('/').filter(p => p);
      parts.pop();
      return parts.length > 0 ? parts.join('/') : '/';
    }

    // Relative path
    if (this.cwd === '/') {
      return '/' + path;
    }
    return this.cwd.endsWith('/')
      ? this.cwd + path
      : this.cwd + '/' + path;
  }

  /**
   * Format file entry for long listing
   */
  private formatLongEntry(entry: { path: string; kind: 'file' | 'directory'; size: number }): string {
    const name = entry.path.split('/').pop() || '';
    const isDir = entry.kind === 'directory';
    const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
    const size = entry.size.toString().padStart(8, ' ');
    const date = new Date().toISOString().split('T')[0];

    return `${perms}  1 user group ${size} ${date} ${name}${isDir ? '/' : ''}`;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create terminal FS adapter
 *
 * @param options - Configuration options
 * @returns TerminalFSAdapter instance
 *
 * @example
 * ```ts
 * const gateway = createIdeFileGateway({ projectId, fsaHandle });
 * const adapter = createTerminalFSAdapter({ gateway });
 *
 * await adapter.execute('ls -la');
 * await adapter.execute('cd src');
 * await adapter.execute('cat index.ts');
 * ```
 */
export function createTerminalFSAdapter(options: TerminalFSAdapterOptions): TerminalFSAdapter {
  return new TerminalFSAdapter(options);
}
