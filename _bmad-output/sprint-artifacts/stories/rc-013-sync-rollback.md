# Story: RC-013 - Sync Rollback

**Story ID:** rc-013-sync-rollback
**Sprint:** 27B
**Priority:** HIGH (HIGH-010)
**Status:** ready-for-dev
**Estimated Points:** 8
**Owner:** Team B

## Issue Description

The `SyncManager` does not implement rollback on partial sync failures. When a multi-file operation fails midway:
- Already-synced files remain on WebContainer
- Local and remote states become inconsistent
- No mechanism to recover to consistent state

## Root Cause

Epic 3 implemented basic dual-write sync but did not include rollback logic. The Ralph Loop validation identified this as a data integrity risk.

## Acceptance Criteria

1. [ ] SyncManager tracks operations in transaction log
2. [ ] On partial failure:
   - Identify which files were synced before failure
   - Roll back all successfully synced files
   - Log rollback actions for audit
3. [ ] Rollback is automatic (no manual intervention required)
4. [ ] Rollback can be disabled for specific operations (opt-out)
5. [ ] Event bus emits `sync-start`, `sync-progress`, `sync-rollback`, `sync-complete`
6. [ ] Tests cover: partial failure detection, rollback execution, logging (20+ tests)

## Technical Approach

```typescript
interface SyncOperation {
  id: string;
  type: 'write' | 'delete' | 'batch';
  files: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'rolled-back' | 'failed';
  startedAt: number;
  completedAt?: number;
  error?: string;
}

class SyncManager {
  private operationLog: SyncOperation[] = [];
  private readonly maxLogEntries = 100;

  async writeFile(path: string, content: string): Promise<void> {
    const operationId = generateId();
    this.emit('sync-start', { operationId, type: 'write', path });

    try {
      // Local write first
      await this.adapter.writeFile(path, content);

      // WebContainer write second
      await this.webcontainerFs.writeFile(path, content);

      this.emit('sync-complete', { operationId, path });
    } catch (error) {
      // Log and re-throw for single file operations
      this.emit('sync-failed', { operationId, path, error });
      throw error;
    }
  }

  async writeMultiple(files: { path: string; content: string }[]): Promise<void> {
    const operationId = generateId();
    const syncedFiles: string[] = [];

    this.emit('sync-start', { operationId, type: 'batch', count: files.length });

    try {
      for (const file of files) {
        await this.adapter.writeFile(file.path, file.content);
        syncedFiles.push(file.path);
        this.emit('sync-progress', {
          operationId,
          completed: syncedFiles.length,
          total: files.length
        });

        await this.webcontainerFs.writeFile(file.path, file.content);
      }

      this.emit('sync-complete', { operationId, synced: syncedFiles.length });
    } catch (error) {
      // Rollback: remove all synced files
      this.emit('sync-rollback', { operationId, filesToRevert: syncedFiles });

      for (const path of syncedFiles) {
        try {
          await this.webcontainerFs.rm(path, { recursive: true });
        } catch (rollbackError) {
          this.emit('sync-rollback-failed', { operationId, path, rollbackError });
        }
      }

      throw new SyncError(
        'Batch operation failed, changes rolled back',
        'BATCH_ROLLBACK',
        operationId,
        error
      );
    }
  }
}
```

## Dependencies

- `src/lib/filesystem/sync-manager.ts` - Main sync implementation
- `src/lib/filesystem/webcontainer/manager.ts` - WebContainer access
- RC-007 (rollback for file tools) - Related rollback logic

## Files to Modify

- `src/lib/filesystem/sync-manager.ts` - Add transaction log and rollback
- `src/lib/filesystem/__tests__/sync-manager.test.ts` - Add rollback tests

## Files to Create

- `src/lib/filesystem/sync-transaction-log.ts` - Transaction log utilities

## Test Strategy

1. **Single File Tests**: Basic write still works
2. **Batch Failure Tests**: Partial batch triggers rollback
3. **Rollback Tests**: Files removed after rollback
4. **Event Tests**: Correct events emitted in sequence
5. **Logging Tests**: Operations logged correctly

## Definition of Done

- [ ] All AC satisfied
- [ ] 20+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with file tools
- [ ] sprint-status.yaml updated

## Notes

Rollback should be best-effort - if WebContainer is unavailable, log the failure and surface to user.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
