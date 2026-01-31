# FS-06: Unified CRUD Interface for Users + Agents

**Epic:** EPIC-FS (File System & Workspace Architecture)
**Priority:** P0
**Effort:** 8h estimated
**Status:** IN_PROGRESS
**Team:** Team B (OpenCode)
**Created:** 2026-01-12T01:00:00+07:00

---

## Story Summary

Create a unified file CRUD service that provides consistent file operations for both:
1. **User operations** - From React components (UI-driven)
2. **Agent operations** - From AI tools (programmatic)

The current architecture has fragmented CRUD patterns:
- `FileToolsFacade` - Agent operations with locking
- `LocalFSAdapter` - Direct file operations
- `SyncManager` - Write operations with sync
- `note-crud-operations.ts` - Notes-specific CRUD

This story unifies these into a single `IFileCrudService` interface.

---

## Acceptance Criteria

### AC-1: Interface Definition
- [ ] Define `IFileCrudService` interface with unified CRUD methods
- [ ] Methods: `create`, `read`, `update`, `delete`, `list`, `move`, `copy`
- [ ] All methods return consistent `CrudResult<T>` type with success/error

### AC-2: Workspace-Aware Implementation
- [ ] Create `UnifiedFileCrudService` class implementing `IFileCrudService`
- [ ] Service is workspace-aware (IDE, Notes, Knowledge, Study)
- [ ] Routes operations to correct adapters based on workspace

### AC-3: Source Tracking
- [ ] Track operation source: `user` or `agent`
- [ ] Emit events with correct source attribution
- [ ] Enable filtering/auditing by source

### AC-4: Locking Integration
- [ ] Use existing `FileLock` for write operations
- [ ] Agent operations acquire locks before write
- [ ] User operations can optionally use locks

### AC-5: Tests
- [ ] Unit tests for UnifiedFileCrudService
- [ ] Test both user and agent code paths
- [ ] Test error handling and rollback

---

## Technical Design

### File Structure

```
src/domain/services/file-crud/
├── file-crud-service.ts        # IFileCrudService interface
├── unified-file-crud.ts        # Implementation
├── file-crud-types.ts          # Types and result schemas
├── index.ts                    # Barrel exports
└── __tests__/
    └── unified-file-crud.test.ts
```

### Interface Design

```typescript
interface IFileCrudService {
  // Create
  create(path: string, content: string, options?: CreateOptions): Promise<CrudResult<FileMetadata>>;
  
  // Read
  read(path: string, options?: ReadOptions): Promise<CrudResult<string>>;
  
  // Update
  update(path: string, content: string, options?: UpdateOptions): Promise<CrudResult<FileMetadata>>;
  
  // Delete
  delete(path: string, options?: DeleteOptions): Promise<CrudResult<void>>;
  
  // List
  list(path: string, options?: ListOptions): Promise<CrudResult<FileEntry[]>>;
  
  // Move/Copy
  move(from: string, to: string, options?: MoveOptions): Promise<CrudResult<FileMetadata>>;
  copy(from: string, to: string, options?: CopyOptions): Promise<CrudResult<FileMetadata>>;
}

interface CrudOptions {
  source: 'user' | 'agent';
  useLock?: boolean;
  workspaceType?: WorkspaceType;
}

interface CrudResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### Integration Points

1. **FileToolsFacade** - Delegate agent operations
2. **LocalFSAdapter** - Direct file operations (read-only)
3. **SyncManager** - Write operations with sync
4. **FileLock** - Concurrent access control
5. **WorkspaceEventEmitter** - Event emission

---

## Dependencies

- FS-05: FileLockService (COMPLETED)
- LocalFSAdapter exists
- SyncManager exists
- FileToolsFacade exists

---

## Tasks

- [ ] 1. Create `file-crud-types.ts` with interfaces and result types (1h)
- [ ] 2. Create `file-crud-service.ts` with `IFileCrudService` interface (1h)
- [ ] 3. Create `unified-file-crud.ts` implementation (3h)
- [ ] 4. Add source tracking and event emission (1h)
- [ ] 5. Create unit tests (1.5h)
- [ ] 6. Create barrel exports and documentation (0.5h)

---

## Related Files

### Existing CRUD Patterns (Reference)
- `src/lib/agent/facades/file-tools-impl.ts` - Agent file operations
- `src/lib/agent/facades/file-lock.ts` - FileLock implementation
- `src/infrastructure/sync/workspace-services/notes/note-crud-operations.ts` - Notes CRUD
- `src/lib/agent/tools/unified/types.ts` - Unified tool types

### Target Location
- `src/domain/services/file-crud/` - New unified CRUD service

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing agent operations | Wrap existing FileToolsFacade, don't replace |
| Lock contention | Use existing FileLock timeout handling |
| Workspace routing complexity | Leverage existing workspace-type patterns |

---

## Notes

- Team A is working on EPIC-STORE (store cleanup) - no conflict
- This story builds on FS-05 (FileLockService) which is already complete
- Follows Clean Architecture: domain service delegates to infrastructure
