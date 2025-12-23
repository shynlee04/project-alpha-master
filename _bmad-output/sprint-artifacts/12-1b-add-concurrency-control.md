# Story 12-1B: Add Concurrency Control to FileToolsFacade

**Epic:** 12 - AI Tool Interface Layer  
**Priority:** P1  
**Status:** drafted  
**Points:** 3  
**Created:** 2025-12-23T18:54:00+07:00

---

## User Story

**As an** AI agent executing file operations  
**I want** file-level locking during write operations  
**So that** concurrent edits by users and agents don't corrupt files

---

## Background

Research findings (2025-12-23) identified concurrent edits as a critical edge case:

| Scenario | Risk | Without Lock |
|----------|------|--------------|
| User + Agent write same file | **High** | Data corruption |
| Multiple agents write same file | **High** | Race condition |
| Agent reads while syncing | **Medium** | Stale data |

This story adds mutex-style locking to `FileToolsFacade` write operations.

---

## Acceptance Criteria

### AC-12-1B-1: Lock Acquisition Before Write

**Given** an agent tool is about to write a file  
**When** `writeFile()`, `createFile()`, or `deleteFile()` is called  
**Then** a file-level lock is acquired before the operation  
**And** the lock is released after the operation completes

### AC-12-1B-2: Lock Timeout

**Given** a lock is held for > 30 seconds  
**When** another agent tries to acquire the lock  
**Then** the operation fails with `FileLockTimeoutError`  
**And** an error event is emitted via EventBus

### AC-12-1B-3: Lock Info in Events

**Given** a write operation emits an event  
**When** `file:modified`, `file:created`, or `file:deleted` is emitted  
**Then** the event includes `lockAcquired: number` timestamp  
**And** the event includes `lockReleased: number` timestamp

### AC-12-1B-4: Graceful Lock Release

**Given** an exception occurs during a write operation  
**When** the operation fails  
**Then** the lock is still released (try/finally pattern)  
**And** the error is re-thrown

---

## Tasks

- [ ] **T1:** Create `FileLock` class in `src/lib/agent/facades/file-lock.ts`
  - Map<string, Promise> for per-file locks
  - `acquire(path, timeout)` method
  - `release(path)` method
  - Lock timeout with 30s default

- [ ] **T2:** Integrate `FileLock` into `FileToolsFacade`
  - Inject FileLock instance via constructor
  - Wrap writeFile, createFile, deleteFile with lock
  - Use try/finally for guaranteed release

- [ ] **T3:** Extend event payloads with lock timestamps
  - Add `lockAcquired` and `lockReleased` to event types
  - Update event emissions in FileToolsFacade

- [ ] **T4:** Create `FileLockTimeoutError` class
  - Extend Error with path and timeout info
  - Export from file-lock.ts

- [ ] **T5:** Write unit tests for FileLock
  - Test concurrent lock attempts
  - Test timeout behavior
  - Test release on error

- [ ] **T6:** Write integration tests for locked operations
  - Verify events include lock timestamps
  - Verify lock released on failure

---

## Research Requirements

- [ ] Research mutex patterns in JavaScript (async-mutex, p-limit)
- [ ] Research Map-based lock patterns for file paths

---

## Dev Notes

### Architecture Pattern

```typescript
// file-lock.ts
export class FileLock {
  private locks = new Map<string, Promise<void>>();
  private lockResolvers = new Map<string, () => void>();

  async acquire(path: string, timeout = 30000): Promise<void> {
    const existing = this.locks.get(path);
    if (existing) {
      await Promise.race([
        existing,
        this.timeout(timeout, path)
      ]);
    }
    // Create new lock
    let resolver: () => void;
    this.locks.set(path, new Promise(r => resolver = r));
    this.lockResolvers.set(path, resolver!);
  }

  release(path: string): void {
    const resolver = this.lockResolvers.get(path);
    if (resolver) {
      resolver();
      this.locks.delete(path);
      this.lockResolvers.delete(path);
    }
  }
}
```

### Event Payload Extension

```typescript
// file event with lock info
{
  path: 'src/app.tsx',
  source: 'agent',
  content: '...',
  lockAcquired: 1703332800000,
  lockReleased: 1703332800050
}
```

### FileToolsFacade Changes

```typescript
async writeFile(path: string, content: string): Promise<void> {
  validatePath(path);
  const lockAcquired = Date.now();
  await this.fileLock.acquire(path);
  try {
    await this.syncManager.writeFile(path, content);
    const lockReleased = Date.now();
    this.eventBus.emit('file:modified', { 
      path, source: 'agent', content, lockAcquired, lockReleased 
    });
  } finally {
    this.fileLock.release(path);
  }
}
```

---

## References

- [master-implementation-plan.md](epic-25-12-28-master-implementation-plan.md) - Story 12-1B definition
- [file-tools-impl.ts](../../src/lib/agent/facades/file-tools-impl.ts) - Current implementation
- [file-tools.ts](../../src/lib/agent/facades/file-tools.ts) - Interface definition

---

## Dev Agent Record

*(To be filled during implementation)*

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-23T18:54 | drafted | Story created by SM Agent |
