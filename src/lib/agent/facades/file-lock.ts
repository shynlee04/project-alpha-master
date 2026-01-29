/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/lib/agent/facades/file-lock.ts
 * 
 * This module is disabled during Phase 1A. File lock functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

console.log('[Phase 2] File lock facade disabled during Phase 1A');

export interface FileLock {
  filePath: string;
  lockedBy: string;
  lockedAt: number;
  acquire(path: string, timeout?: number): Promise<boolean>;
  release(path: string): boolean;
}

export class FileLockManager {
  acquireLock(_filePath: string, _agentId: string): boolean {
    console.log('[Phase 2] File lock acquire disabled during Phase 1A');
    return false;
  }

  releaseLock(_filePath: string, _agentId: string): boolean {
    console.log('[Phase 2] File lock release disabled during Phase 1A');
    return false;
  }

  isLocked(_filePath: string): boolean {
    return false;
  }

  getLock(_filePath: string): FileLock | null {
    return null;
  }
}

export const fileLockManager = new FileLockManager();

// Export a default fileLock instance for compatibility
// This matches the interface expected by unified-file-crud.ts
export const fileLock: FileLock = {
  filePath: '',
  lockedBy: '',
  lockedAt: 0,
  acquire: async (_path: string, _timeout?: number): Promise<boolean> => {
    console.log('[Phase 2] File lock acquire disabled during Phase 1A');
    return true; // Return true to not block operations
  },
  release: (_path: string): boolean => {
    console.log('[Phase 2] File lock release disabled during Phase 1A');
    return true;
  },
};

export function useFileLock() {
  console.log('[Phase 2] useFileLock disabled during Phase 1A');
  return {
    acquireLock: () => false,
    releaseLock: () => false,
    isLocked: () => false,
  };
}