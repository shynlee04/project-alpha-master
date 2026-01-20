---
story_id: ARCH-01-05-remediation
title: Create ProjectHandleService (Atomic)
points: 5
priority: P0
status: pending
team: A
dependencies:
  - ARCH-01-06-remediation
time_box: 2 hours
created_at: 2026-01-21T17:30:00+07:00
epic_id: EPIC-ARCH-01
epic_name: Foundation Cleanup
architecture_ref: ADR-034
parent_story: ARCH-01-05
---

# Story: ARCH-01-05-Remediation - Create ProjectHandleService (Atomic)

## Description

As a developer, I want a ProjectHandleService class that manages both `projects` AND `fsaHandles` tables with atomic Dexie transactions, So that project creation, updates, and deletions are always consistent and never have partial updates.

## Context

**Original Story Claim (ARCH-01-05):**
- "Created pointer-sync-service.ts with atomic operations"
- "Implemented lock management for concurrent access"
- "Created atomicCreate, atomicUpdate, atomicDelete, atomicRestore functions"
- "Added transaction logging for debugging"
- "Service ready for integration with project-crud-slice"

**Architect Validation Findings (FAIL):**
- No `ProjectHandleService` class found anywhere in codebase
- `pointer-sync-service.ts` exists (418 lines) but doesn't match requirements
- Story requires: ProjectHandleService class that manages BOTH `projects` AND `fsaHandles` tables with atomic Dexie transactions
- Current implementation:
  - HandlePersistenceService exists for fsaHandles only
  - Dexie helper functions exist (storeFSAHandle, getFSAHandle, etc.)
  - No unified atomic wrapper combining projects+fsaHandles

**What Exists (but doesn't match requirements):**
1. **pointer-sync-service.ts**:
   - Syncs Zustand store with Dexie
   - Has atomic operations (atomicCreate, atomicUpdate, atomicDelete, atomicRestore)
   - BUT: Manages Zustand ↔ Dexie sync, NOT projects ↔ fsaHandles atomic transactions

2. **handle-persistence.ts**:
   - HandlePersistenceService class
   - Manages fsaHandles table only
   - NOT combined with projects table

3. **Dexie helpers** (fsa-handle-helpers.ts):
   - storeFSAHandle, getFSAHandle, updateFSAHandleStatus, deleteFSAHandle
   - Individual functions, NOT atomic with projects table

**What's Missing:**
- ProjectHandleService class that wraps BOTH `projects` AND `fsaHandles` tables in atomic transactions
- Methods: createWithHandle, deleteWithHandle, restoreHandle (all atomic)

## Acceptance Criteria

- [ ] ProjectHandleService class created at `src/infrastructure/persistence/services/project-handle-service.ts`
- [ ] `createWithHandle(project, handle)` method uses Dexie transaction for projects + fsaHandles
- [ ] `deleteWithHandle(projectId)` method uses Dexie transaction for projects + fsaHandles
- [ ] `restoreHandle(projectId)` method uses Dexie transaction for projects + fsaHandles
- [ ] Service integrated with project-crud-slice to replace direct Dexie operations
- [ ] No direct fsaHandles table writes outside this service
- [ ] TypeScript: 0 new errors
- [ ] Build succeeds

## Tasks

### Phase 1: Analyze Requirements (30 min)
- [ ] Read pointer-sync-service.ts to understand current implementation
- [ ] Read handle-persistence.ts to understand fsaHandles operations
- [ ] Read fsa-handle-helpers.ts to see Dexie helper functions
- [ ] Define interface for ProjectHandleService
- [ ] Plan Dexie transaction structure

### Phase 2: Create ProjectHandleService (45 min)
- [ ] Create file: `src/infrastructure/persistence/services/project-handle-service.ts`
- [ ] Create ProjectHandleService class with 3 methods:
  - `createWithHandle(project: ProjectRecord, handle: FileSystemDirectoryHandle): Promise<ProjectId>`
  - `deleteWithHandle(projectId: string): Promise<void>`
  - `restoreHandle(projectId: string): Promise<FileSystemDirectoryHandle | null>`
- [ ] Implement atomic transactions using `db.transaction(['projects', 'fsaHandles'], 'readwrite')`
- [ ] Ensure rollback on partial failure (if projects insert fails, don't insert fsaHandles)

### Phase 3: Integrate with project-crud-slice (30 min)
- [ ] Find project-crud-slice file
- [ ] Replace direct Dexie operations with ProjectHandleService calls
- [ ] Create createProjectWithHandle function using service
- [ ] Update deleteProject to use service
- [ ] Update restoreProject to use service (if exists)

### Phase 4: Remove Direct fsaHandles Writes (15 min)
- [ ] Search for direct fsaHandles writes (storeFSAHandle, getFSAHandle, etc.)
- [ ] Replace with ProjectHandleService methods where appropriate
- [ ] Add deprecation warnings to fsa-handle-helpers.ts if needed
- [ ] Document migration from direct writes to service

### Phase 5: Validation (0 min)
- [ ] Run TypeScript compiler (0 errors)
- [ ] Run build command (success)
- [ ] Test that create/update/delete work with service
- [ ] Verify atomic behavior (test failure in middle of transaction)

## Dependencies

- ARCH-01-06-remediation (TypeScript errors must be fixed first)

## Blocked By

- ARCH-01-06-remediation (pending)

## Handoff Artifacts

- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-01/ARCH-01-05-remediation-completion.md`

## Notes

- **Critical**: This service MUST use Dexie transactions
  - `db.transaction(['projects', 'fsaHandles'], 'readwrite')`
  - All operations on BOTH tables in single transaction
  - Automatic rollback if transaction fails

- **Integration Point**:
  - project-crud-slice should import ProjectHandleService
  - Replace: `await db.projects.put()` → `await projectHandleService.createWithHandle()`
  - Replace: `await db.projects.delete()` → `await projectHandleService.deleteWithHandle()`

- **Existing Code Preservation**:
  - Keep pointer-sync-service.ts (Zustand ↔ Dexie sync)
  - Keep HandlePersistenceService (handle persistence logic)
  - ProjectHandleService is NEW layer, not replacement

- **Service Location**:
  - `src/infrastructure/persistence/services/project-handle-service.ts`
  - Follow existing pattern: `src/infrastructure/persistence/services/`

- **Dexie Transaction Pattern**:
```typescript
async createWithHandle(project: ProjectRecord, handle: FileSystemDirectoryHandle): Promise<ProjectId> {
  return db.transaction(['projects', 'fsaHandles'], 'readwrite', async (tx) => {
    // 1. Insert into projects table
    const projectId = await tx.projects.put(project);
    // 2. Insert into fsaHandles table
    await tx.fsaHandles.put({
      projectId: project.id,
      handleData: isStructuredCloneSupported() ? structuredClone(handle) : null,
      directoryPath: handle.name,
      permissionStatus: 'granted',
      grantedAt: Date.now(),
      lastAccessedAt: Date.now(),
    });
    return projectId;
  });
}
```

## Required MCP Research

### Context7 Queries
- Query Dexie.js transaction documentation
- Search: "Dexie atomic transactions multiple tables"
- Research: "IndexedDB transaction rollback behavior"

### DeepWiki Queries
- Research: "Dexie.js transaction API reference"
- Query: "best practices for multi-table transactions"
- Search: "transactional consistency in IndexedDB"

### Architecture Patterns Reference
- ADR-033: Storage Strategy (Section 7.2)
- Clean Architecture: Transaction Pattern
- Domain-Driven Design: Aggregate Consistency

## Implementation Guidelines

1. **File Structure**:
   - Create: `src/infrastructure/persistence/services/project-handle-service.ts`
   - Export: `export class ProjectHandleService { ... }`
   - Import from: `@/infrastructure/persistence/dexie-db`

2. **Method Signatures**:
```typescript
export class ProjectHandleService {
  /**
   * Create project with FSA handle in single atomic transaction
   */
  async createWithHandle(
    project: ProjectRecord,
    handle: FileSystemDirectoryHandle,
    workspaceId: WorkspaceType
  ): Promise<ProjectId>;

  /**
   * Delete project and FSA handle in single atomic transaction
   */
  async deleteWithHandle(projectId: string): Promise<void>;

  /**
   * Restore FSA handle for project (atomic update to fsaHandles)
   */
  async restoreHandle(projectId: string): Promise<FileSystemDirectoryHandle | null>;
}
```

3. **Integration Pattern**:
```typescript
// In project-crud-slice.ts:
import { projectHandleService } from '@/infrastructure/persistence/services/project-handle-service';

export const createProject = async (project: Project, handle: FileSystemDirectoryHandle, workspaceType: WorkspaceType) => {
  const projectId = await projectHandleService.createWithHandle(
    convertProjectToRecord(project),
    handle,
    workspaceType
  );
  return convertRecordToProject(projectId);
};
```

4. **Transaction Safety**:
   - Wrap all operations in single transaction
   - Use `await` for transaction completion
   - Ensure rollback on partial failure
   - Add error handling with logging

## Validation Report

**Validated At:** 2026-01-21T17:30:00+07:00
**Result:** PENDING (Awaiting Remediation)

### Evidence of Failure

```bash
# From architect grep:
$ find src -name "*project-handle-service*" -o -name "*ProjectHandleService*"
# (no results)

$ grep -r "ProjectHandleService" --include="*.ts" src/
# (no results)

$ ls -la src/infrastructure/sync/pointer-sync-service.ts
# (file exists, 418 lines)

$ grep -r "class.*Handle.*Service" --include="*.ts" src/infrastructure/
# src/infrastructure/filesystem/handle-persistence.ts: export class HandlePersistenceService
# (exists, but manages fsaHandles only, not projects+fsaHandles together)
```

### Verdict: FAIL - ProjectHandleService class not created as required

## Success Metrics

When complete:
- ProjectHandleService class created at specified location
- All 3 methods implemented with atomic Dexie transactions
- Service integrated with project-crud-slice
- No direct fsaHandles table writes outside service
- TypeScript: 0 new errors
- Build succeeds
