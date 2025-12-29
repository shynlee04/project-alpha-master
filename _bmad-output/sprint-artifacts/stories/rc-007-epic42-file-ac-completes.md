# Story: RC-007 - Epic 4 Story 2 File AC Completes

**Story ID:** rc-007-epic42-file-ac-completes
**Sprint:** 27B
**Priority:** HIGH (HIGH-003)
**Status:** ready-for-dev
**Estimated Points:** 3
**Owner:** Team B

## Issue Description

Epic 4 Story 2 (file tool execution) has incomplete acceptance criteria that were deferred during initial implementation. Specifically:
- Missing file glob/multi-file operations
- Incomplete error recovery for partial failures
- Missing batch operation support

## Root Cause

Epic 4 Story 2 was implemented as a minimum viable facade but several advanced file operations were deferred. The Ralph Loop validation identified gaps in AC coverage.

## Acceptance Criteria

1. [ ] FileTools facade supports glob patterns (e.g., `**/*.ts`, `src/**/*`)
2. [ ] Multi-file read/write operations execute atomically (all succeed or all fail)
3. [ ] Partial failure recovery: on failure, already-written files are rolled back
4. [ ] Batch operation interface: `readMultiple(paths)`, `writeMultiple(files)`
5. [ ] Progress tracking for batch operations (callback with progress percentage)
6. [ ] Cancellation support via AbortSignal for long-running batch operations
7. [ ] Tests cover: glob patterns, batch operations, rollback, cancellation (15+ tests)

## Technical Approach

```typescript
interface FileOperation {
  path: string;
  content?: string;
}

interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  currentPath?: string;
}

class FileToolsFacade {
  async readMultiple(paths: string[], signal?: AbortSignal): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    for (const path of paths) {
      if (signal?.aborted) throw new CancellationError();
      const content = await this.readFile(path);
      results.set(path, content);
    }
    return results;
  }

  async writeMultiple(
    files: FileOperation[],
    onProgress?: (progress: BatchProgress) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const written: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        if (signal?.aborted) throw new CancellationError();
        await this.writeFile(files[i].path, files[i].content!);
        written.push(files[i].path);
        onProgress?.({ total: files.length, completed: i + 1, failed: 0, currentPath: files[i].path });
      }
    } catch (error) {
      // Rollback: delete all files written so far
      await this.rollback(written);
      throw error;
    }
  }

  private async rollback(paths: string[]): Promise<void> {
    for (const path of paths) {
      await this.deleteFile(path).catch(() => {}); // Best effort
    }
  }
}
```

## Dependencies

- `src/lib/agent/facades/file-tools.ts` - Existing facade
- `src/lib/filesystem/local-fs-adapter.ts` - Underlying adapter
- RC-013 (sync rollback) - Related rollback logic

## Files to Modify

- `src/lib/agent/facades/file-tools.ts` - Add glob, batch, progress support
- `src/lib/agent/facades/__tests__/file-tools.test.ts` - Add comprehensive tests

## Files to Create

- None

## Test Strategy

1. **Glob Tests**: Various glob patterns match expected files
2. **Batch Tests**: Multiple reads/writes complete atomically
3. **Rollback Tests**: Partial failures trigger cleanup
4. **Progress Tests**: Callback receives correct progress updates
5. **Cancellation Tests**: Long operations cancel correctly

## Definition of Done

- [ ] All AC satisfied
- [ ] 15+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with agent chat
- [ ] sprint-status.yaml updated

## Notes

This story completes the deferred AC from Epic 4 Story 2.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
