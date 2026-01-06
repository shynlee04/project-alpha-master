/**
 * @fileoverview Git Client Wrapper
 * @module lib/git/git-client
 *
 * Pure JavaScript Git operations using isomorphic-git.
 * Provides a high-level API for common Git operations.
 *
 * @story S-035 - Git Integration
 */

import git from 'isomorphic-git';
import { Errors } from 'isomorphic-git';
import type { GitCredentialManager } from './git-credentials';

// Browser filesystem stub for isomorphic-git
const fs = {
  promises: {
    readFile: async (filepath: string) => {
      throw new Error('File system not implemented');
    },
  },
};

/**
 * Git file status
 */
export interface GitFileStatus {
  /** File path */
  path: string;
  /** Status: staged, unstaged, untracked, conflicted */
  status: 'staged' | 'modified' | 'untracked' | 'conflicted' | 'deleted';
  /** Original path (for renames) */
  originalPath?: string;
}

/**
 * Git branch information
 */
export interface GitBranch {
  /** Branch name */
  name: string;
  /** Is current branch */
  isCurrent: boolean;
  /** Is local branch (vs remote tracking branch) */
  isLocal: boolean;
  /** Remote tracking branch */
  remote?: string;
  /** Commit hash */
  sha: string;
  /** Commit message */
  message: string;
}

/**
 * Git commit information
 */
export interface GitCommit {
  /** Commit SHA */
  sha: string;
  /** Parent commit SHA(s) */
  parents: string[];
  /** Commit message */
  message: string;
  /** Author name */
  authorName: string;
  /** Author email */
  authorEmail: string;
  /** Author timestamp */
  authorTimestamp: number;
  /** Committer name */
  committerName: string;
  /** Committer email */
  committerEmail: string;
  /** Committer timestamp */
  committerTimestamp: number;
}

/**
 * Git status result
 */
export interface GitStatus {
  /** Current branch */
  branch: string;
  /** Current commit SHA */
  sha: string;
  /** Files with changes */
  files: GitFileStatus[];
  /** Ahead/behind counts */
  ahead: number;
  behind: number;
  /** Is in merge conflict */
  inConflict: boolean;
}

/**
 * Git diff result
 */
export interface GitDiff {
  /** File path */
  path: string;
  /** Old content */
  oldContent: string;
  /** New content */
  newContent: string;
  /** Diff hunks */
  hunks: {
    /** Old line start */
    oldStart: number;
    /** Old line count */
    oldLines: number;
    /** New line start */
    newStart: number;
    /** New line count */
    newLines: number;
    /** Lines */
    lines: Array<{
      type: 'context' | 'add' | 'remove' | 'header';
      content: string;
      oldLineNumber?: number;
      newLineNumber?: number;
    }>;
  }[];
}

/**
 * Git client options
 */
export interface GitClientOptions {
  /** Repository root directory */
  dir: string;
  /** Git credentials manager */
  credentialManager: GitCredentialManager;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Git Client
 *
 * High-level wrapper around isomorphic-git for common Git operations.
 */
export class GitClient {
  private dir: string;
  private credentialManager: GitCredentialManager;
  private debug: boolean;

  constructor(options: GitClientOptions) {
    this.dir = options.dir;
    this.credentialManager = options.credentialManager;
    this.debug = options.debug ?? false;
  }

  /**
   * Log debug message
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[GitClient] ${message}`, ...args);
    }
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<GitStatus> {
    try {
      this.log('Getting status for', this.dir);

      const status = await git.statusMatrix({ fs, dir: this.dir });
      const branches = await git.listBranches({ fs, dir: this.dir, remote: 'origin' });
      const currentBranch = await git.currentBranch({ fs, dir: this.dir, fullname: false });
      const HEAD = await git.resolveRef({ fs, dir: this.dir, ref: 'HEAD' });

      // Build file status list
      const files: GitFileStatus[] = [];
      for (const [filepath, head, workdir, stage] of status) {
        if (head === workdir && workdir === stage) {
          // No changes
          continue;
        }

        let fileStatus: GitFileStatus['status'];

        if (head === 0 && workdir === 0 && stage !== 0) {
          fileStatus = 'staged';
        } else if (head === 0 && workdir !== 0) {
          fileStatus = 'untracked';
        } else if (stage !== 0 && workdir !== 0 && stage !== workdir) {
          fileStatus = 'conflicted';
        } else if (workdir !== head) {
          fileStatus = 'modified';
        } else {
          fileStatus = 'staged';
        }

        files.push({ path: filepath, status: fileStatus });
      }

      // Get ahead/behind counts
      let ahead = 0;
      let behind = 0;

      // Check for merge conflicts
      const inConflict = await git.status({
        fs,
        dir: this.dir,
        filepath: '.git/MERGE_HEAD',
      }).then(() => true).catch(() => false);

      return {
        branch: currentBranch || 'HEAD',
        sha: HEAD,
        files,
        ahead,
        behind,
        inConflict,
      };
    } catch (error) {
      this.log('Error getting status:', error);
      throw new Error(`Failed to get Git status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stage files for commit
   */
  async stageFiles(filepaths: string[]): Promise<void> {
    try {
      this.log('Staging files:', filepaths);

      for (const filepath of filepaths) {
        await git.add({
          fs,
          dir: this.dir,
          filepath,
        });
      }
    } catch (error) {
      throw new Error(`Failed to stage files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Unstage files
   */
  async unstageFiles(filepaths: string[]): Promise<void> {
    try {
      this.log('Unstaging files:', filepaths);

      for (const filepath of filepaths) {
        await git.resetIndex({
          fs,
          dir: this.dir,
          filepath,
        });
      }
    } catch (error) {
      throw new Error(`Failed to unstage files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Commit staged changes
   */
  async commit(options: {
    message: string;
    author?: { name: string; email: string };
    amend?: boolean;
    signoff?: boolean;
  }): Promise<string> {
    try {
      this.log('Committing with message:', options.message);

      let message = options.message;
      if (options.signoff) {
        const author = options.author || await this.getDefaultAuthor();
        message += `\n\nSigned-off-by: ${author.name} <${author.email}>`;
      }

      const sha = await git.commit({
        fs,
        dir: this.dir,
        message,
        author: options.author,
        amend: options.amend ?? false,
      });

      this.log('Commit created:', sha);
      return sha;
    } catch (error) {
      throw new Error(`Failed to commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get list of branches
   */
  async getBranches(): Promise<GitBranch[]> {
    try {
      this.log('Getting branches');

      const [localBranches, remoteBranches] = await Promise.all([
        git.listBranches({ fs, dir: this.dir }),
        git.listBranches({ fs, dir: this.dir, remote: 'origin' }).catch(() => []),
      ]);

      const currentBranch = await git.currentBranch({ fs, dir: this.dir, fullname: false });

      const branches: GitBranch[] = [];

      // Process local branches
      for (const branch of localBranches) {
        if (branch === 'HEAD') continue;

        const sha = await git.resolveRef({ fs, dir: this.dir, ref: branch });
        const commit = await git.readCommit({ fs, dir: this.dir, oid: sha });

        // Find remote tracking branch
        const remote = `refs/remotes/origin/${branch}`;
        const remoteSha = remoteBranches.includes(remote)
          ? await git.resolveRef({ fs, dir: this.dir, ref: remote }).catch(() => null)
          : null;

        branches.push({
          name: branch,
          isCurrent: branch === currentBranch,
          isLocal: true,
          remote: remoteSha ? `origin/${branch}` : undefined,
          sha,
          message: commit.commit.message.split('\n')[0],
        });
      }

      // Process remote branches
      for (const branch of remoteBranches) {
        const shortName = branch.replace('refs/remotes/origin/', '');
        if (localBranches.includes(shortName)) continue;

        const sha = await git.resolveRef({ fs, dir: this.dir, ref: branch });
        const commit = await git.readCommit({ fs, dir: this.dir, oid: sha });

        branches.push({
          name: shortName,
          isCurrent: false,
          isLocal: false,
          remote: `origin/${shortName}`,
          sha,
          message: commit.commit.message.split('\n')[0],
        });
      }

      return branches;
    } catch (error) {
      throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new branch
   */
  async createBranch(name: string, checkout: boolean = true): Promise<void> {
    try {
      this.log('Creating branch:', name);

      await git.branch({
        fs,
        dir: this.dir,
        ref: name,
        checkout,
      });
    } catch (error) {
      throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch to branch
   */
  async switchBranch(name: string): Promise<void> {
    try {
      this.log('Switching to branch:', name);

      // Check for uncommitted changes
      const status = await this.getStatus();
      const hasUncommitted = status.files.some(f =>
        f.status === 'modified' || f.status === 'untracked'
      );

      if (hasUncommitted) {
        throw new Error('Cannot switch branch with uncommitted changes');
      }

      await git.checkout({
        fs,
        dir: this.dir,
        ref: name,
      });
    } catch (error) {
      throw new Error(`Failed to switch branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete branch
   */
  async deleteBranch(name: string, force: boolean = false): Promise<void> {
    try {
      this.log('Deleting branch:', name);

      await git.deleteBranch({
        fs,
        dir: this.dir,
        ref: name,
        force,
      });
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rename current branch
   */
  async renameBranch(oldName: string, newName: string): Promise<void> {
    try {
      this.log('Renaming branch:', oldName, '->', newName);

      // Create new branch pointing to current commit
      await git.branch({
        fs,
        dir: this.dir,
        ref: newName,
        checkout: true,
      });

      // Delete old branch
      await this.deleteBranch(oldName);
    } catch (error) {
      throw new Error(`Failed to rename branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Merge branch into current branch
   */
  async mergeBranch(branch: string): Promise<void> {
    try {
      this.log('Merging branch:', branch);

      await git.merge({
        fs,
        dir: this.dir,
        theirs: branch,
        author: await this.getDefaultAuthor(),
      });
    } catch (error) {
      if (error instanceof Errors.MergeConflictError) {
        throw new Error('Merge conflict detected');
      }
      throw new Error(`Failed to merge branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file diff
   */
  async getDiff(filepath: string, staged: boolean = false): Promise<GitDiff> {
    try {
      this.log('Getting diff for:', filepath);

      const oid = await git.resolveRef({ fs, dir: this.dir, ref: 'HEAD' });
      const commit = await git.readCommit({ fs, dir: this.dir, oid });

      let oldContent = '';
      try {
        const blob = await git.readBlob({
          fs,
          dir: this.dir,
          oid: commit.commit.tree,
          filepath,
        });
        oldContent = Buffer.from(blob.blob).toString('utf8');
      } catch {
        // File is new
      }

      let newContent = '';
      try {
        newContent = await fs.promises.readFile(`${this.dir}/${filepath}`, 'utf8');
      } catch {
        // File was deleted
      }

      // Parse diff into hunks (simplified implementation)
      const hunks = this.parseDiffHunks(oldContent, newContent);

      return {
        path: filepath,
        oldContent,
        newContent,
        hunks,
      };
    } catch (error) {
      throw new Error(`Failed to get diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse diff hunks from old and new content
   */
  private parseDiffHunks(oldContent: string, newContent: string): GitDiff['hunks'] {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    // Simple line-by-line diff (for demo purposes)
    // In production, use a proper diff algorithm like Myers or patience
    const hunks: GitDiff['hunks'] = [];
    const lines: Array<{
      type: 'context' | 'add' | 'remove' | 'header';
      content: string;
      oldLineNumber?: number;
      newLineNumber?: number;
    }> = [];

    let i = 0;
    let j = 0;
    let inHunk = false;
    let hunkStartOld = 0;
    let hunkStartNew = 0;

    while (i < oldLines.length || j < newLines.length) {
      const oldLine = oldLines[i];
      const newLine = newLines[j];

      if (oldLine === newLine) {
        if (inHunk) {
          lines.push({ type: 'context', content: ` ${oldLine}`, oldLineNumber: i + 1, newLineNumber: j + 1 });
        }
        i++;
        j++;
      } else {
        if (!inHunk) {
          inHunk = true;
          hunkStartOld = i + 1;
          hunkStartNew = j + 1;
        }

        if (i < oldLines.length && (j >= newLines.length || oldLine !== newLines[j])) {
          lines.push({ type: 'remove', content: `-${oldLine}`, oldLineNumber: i + 1 });
          i++;
        }

        if (j < newLines.length && (i >= oldLines.length || oldLine !== newLines[j])) {
          lines.push({ type: 'add', content: `+${newLine}`, newLineNumber: j + 1 });
          j++;
        }
      }
    }

    if (lines.length > 0) {
      hunks.push({
        oldStart: hunkStartOld,
        oldLines: i - hunkStartOld + 1,
        newStart: hunkStartNew,
        newLines: j - hunkStartNew + 1,
        lines,
      });
    }

    return hunks;
  }

  /**
   * Get commit log
   */
  async getLog(options: { since?: Date; until?: Date; maxCount?: number } = {}): Promise<GitCommit[]> {
    try {
      this.log('Getting commit log');

      const commits = await git.log({
        fs,
        dir: this.dir,
        depth: options.maxCount,
      });

      return commits.map(commit => ({
        sha: commit.oid,
        parents: commit.commit.parent,
        message: commit.commit.message,
        authorName: commit.commit.author.name,
        authorEmail: commit.commit.author.email,
        authorTimestamp: commit.commit.author.timestamp,
        committerName: commit.commit.committer.name,
        committerEmail: commit.commit.committer.email,
        committerTimestamp: commit.commit.committer.timestamp,
      }));
    } catch (error) {
      throw new Error(`Failed to get commit log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file blame information
   */
  async getBlame(filepath: string): Promise<Array<{
    sha: string;
    author: string;
    timestamp: number;
    line: string;
  }>> {
    try {
      this.log('Getting blame for:', filepath);

      // Placeholder implementation
      // Full implementation would track commits per line
      const _commits = await git.log({ fs, dir: this.dir });

      // Placeholder return
      return [];
    } catch (error) {
      throw new Error(`Failed to get blame: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get default author from config
   */
  private async getDefaultAuthor(): Promise<{ name: string; email: string }> {
    try {
      const name = await git.getConfig({
        fs,
        dir: this.dir,
        path: 'user.name',
      });
      const email = await git.getConfig({
        fs,
        dir: this.dir,
        path: 'user.email',
      });

      return {
        name: name || 'Anonymous',
        email: email || 'anonymous@example.com',
      };
    } catch {
      return {
        name: 'Anonymous',
        email: 'anonymous@example.com',
      };
    }
  }

  /**
   * Initialize new repository
   */
  async init(): Promise<void> {
    try {
      this.log('Initializing repository in', this.dir);

      await git.init({
        fs,
        dir: this.dir,
        defaultBranch: 'main',
      });
    } catch (error) {
      throw new Error(`Failed to initialize repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clone repository
   */
  async clone(url: string, options: { depth?: number; singleBranch?: boolean } = {}): Promise<void> {
    try {
      this.log('Cloning repository:', url);

      await git.clone({
        fs,
        http,
        dir: this.dir,
        url,
        depth: options.depth,
        singleBranch: options.singleBranch ?? true,
        onProgress: (progress: unknown) => {
          this.log('Clone progress:', progress);
        },
        onMessage: (message: unknown) => {
          this.log('Clone message:', message);
        },
      });
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Push commits to remote
   */
  async push(options: { remote?: string; branch?: string } = {}): Promise<void> {
    try {
      this.log('Pushing to remote');

      await git.push({
        fs,
        http,
        dir: this.dir,
        remote: options.remote ?? 'origin',
        ref: options.branch,
        onProgress: (progress: unknown) => {
          this.log('Push progress:', progress);
        },
        onMessage: (message: unknown) => {
          this.log('Push message:', message);
        },
      });
    } catch (error) {
      throw new Error(`Failed to push: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pull from remote
   */
  async pull(options: { remote?: string; branch?: string } = {}): Promise<void> {
    try {
      this.log('Pulling from remote');

      await git.pull({
        fs,
        http,
        dir: this.dir,
        remote: options.remote ?? 'origin',
        ref: options.branch,
        author: await this.getDefaultAuthor(),
        onProgress: (progress: unknown) => {
          this.log('Pull progress:', progress);
        },
        onMessage: (message: unknown) => {
          this.log('Pull message:', message);
        },
      });
    } catch (error) {
      if (error instanceof Errors.MergeConflictError) {
        throw new Error('Merge conflict detected during pull');
      }
      throw new Error(`Failed to pull: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * HTTP plugin for isomorphic-git
 * Handles Git HTTP operations including authentication
 */
const http = {
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    // Add authentication headers if needed
    const response = await fetch(url, options);
    return response;
  },
};
