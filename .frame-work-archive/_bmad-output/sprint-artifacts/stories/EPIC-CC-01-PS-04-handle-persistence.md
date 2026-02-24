---
story_key: "EPIC-CC-01-PS-04-handle-persistence"
epic: "EPIC-CC-01"
story: "PS-04"
status: "drafted"
created_at: "2026-01-15T20:30:00+07:00"
version: "2.0"
points: 6
---

# PS-04: Handle Persistence Architecture

## User Story

**As a** user working with FSA (File System Access) projects
**I want** my projects to persist across browser sessions without needing to re-select folders every time
**So that** I can resume my work immediately without permission prompts on every visit

### Epic Context (NEW)
From **EPIC-CC-01: Project Space Foundation**
- **Epic Goal:** Establish clear boundaries for routing, naming IDs, flow, and redirection
- **This Story Supports:** Storage Strategy - Desktop FSA with proper persistence
- **Epic Progress:** 28% complete (3/10 stories done)
- **Related ADR:** ADR-032 (Clean Storage Architecture)

### User-Reported Issue
From **PROMPT.md** and user feedback:
- **Issue URI-01:** "One click to space ID or creation of file system ID is very inconsistent and not persistent"
- **Severity:** CRITICAL
- **Impact:** Projects don't persist, users must open folder every session

## Acceptance Criteria

### AC-1: Serializable Handle Metadata Storage

**Given** a project with FSA storage type
**When** the project is created and persisted to IndexedDB
**Then** only handle METADATA (not the handle) is stored
**And** no DataCloneError occurs during persist

**Implementation Hints:**
- Relevant Files:
  - `src/infrastructure/persistence/stores/project/project-types.ts:30-35`
  - `src/infrastructure/persistence/stores/project/project-crud-slice.ts:75-140`
  - `src/lib/filesystem/fsa-handle-manager.ts:108-135`
- Architecture Pattern: ADR-032 Clean Storage, Handle Metadata Pattern
- Related Stories: PS-02-A (Platform Detection)

**Edge Cases:**
- Handle with same name but different path → store both with unique handleId
- Permission revoked → graceful degradation, prompt user
- Browser doesn't support FSA → fall back to IndexedDB

### AC-2: Handle Restoration with User Interaction

**Given** a persisted FSA project
**When** the user clicks to open the project
**Then** the system attempts silent restoration first
**And** if silent restore fails, prompts user for folder access
**And** after successful restoration, syncs files

**Implementation Hints:**
- Relevant Files:
  - `src/lib/filesystem/fsa-handle-manager.ts:115-133`
  - `src/infrastructure/persistence/stores/project/project-crud-slice.ts:240-260`
  - `src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts:97-120`

**Edge Cases:**
- User selects different folder → verify or reject
- User denies permission → mark permission state as 'denied'
- Silent restore timeout (5s) → fallback to prompt

### AC-3: Project Entity Clean Architecture

**Given** the Project entity definition
**When** examining the interface
**Then** `fsaHandle` (FileSystemDirectoryHandle) should NOT be in the interface
**And** instead, `storageMetadata` with serializable fields should be used
**And** all layers respect Clean Architecture boundaries

**Implementation Hints:**
- Relevant Files:
  - `src/infrastructure/persistence/stores/project/project-types.ts:30-35` (NEEDS MODIFICATION)
  - `src/domain/entities/project.ts:40-50` (REFERENCE)
  - `src/lib/workspace/project-types.ts:30-45` (DEPRECATION CANDIDATE)

**Edge Cases:**
- Legacy projects with `fsaHandle` → migration or graceful handling
- Mixed storage types (FSA + IDB in same project) → unsupported

### AC-4: No DataCloneError During Persist

**Given** any project save operation
**When** the persist middleware attempts to serialize
**Then** no TypeError or DataCloneError occurs
**And** all projects can be saved and loaded successfully

**Implementation Hints:**
- Relevant Files:
  - `src/lib/workspace/project-store.ts` (if using persist)
  - `src/infrastructure/persistence/stores/index.ts` (store configuration)

**Edge Cases:**
- Extremely large handle metadata → truncate or defer
- Corrupted handle metadata → fallback to fresh selection

## Deep Analysis (NEW)

### Cross-Impact Mapping

| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------|
| IDE | ✅ YES | HIGH | `routes/ide.$projectId.tsx`, `useWorkspaceFileSystem.ts` |
| Notes | ✅ YES | MEDIUM | `routes/notes.$projectId.lazy.tsx` |
| Knowledge | ✅ YES | MEDIUM | `routes/knowledge.$projectId.lazy.tsx` |
| Study | ✅ YES | MEDIUM | `routes/study.$projectId.lazy.tsx` |
| Shared | ✅ YES | HIGH | `project-crud-slice.ts`, `fsa-handle-manager.ts` |

### Dependencies
- **Depends On**: `FSA-ADAPTER` (completed), `PS-02-A` (in progress)
- **Required By**: `PS-05` (VFS Tree), `PS-02-B` (Hot Reactive Sync)

### Architectural Impact
- **Layers Touched**: Infrastructure (store), Domain (types), Lib (managers)
- **Clean Architecture**: ⚠️ WARNINGS - existing fsaHandle violates layer boundary
- **Potential Conflicts**: Multiple project store implementations exist

### Dead Code & Overlap Detection (CRITICAL)

#### Files with Potential Overlap

| File | Status | Overlap With | Action |
|------|--------|--------------|--------|
| `src/lib/workspace/project-store.ts` | DUPLICATE | `infrastructure/persistence/stores/project/` | MERGE or DELETE |
| `src/lib/workspace/project-types.ts` | DUPLICATE | `infrastructure/persistence/stores/project/project-types.ts` | MERGE |
| `src/lib/workspace/project-store/` | DUPLICATE | `infrastructure/persistence/stores/project/` | DELETE |
| `src/domain/entities/project.ts` | PARTIAL | Infrastructure copies | KEEP, align types |
| `src/infrastructure/persistence/stores/project/project-types.ts` | ACTIVE | Domain types | KEEP, add metadata |
| `src/lib/filesystem/fsa-handle-manager.ts` | ACTIVE | `dexie-db.ts` helpers | KEEP, adapt |

#### Naming Inconsistencies Found

| Pattern | Examples | Issue |
|---------|----------|-------|
| **FileSystemDirectoryHandle** | `fsaHandle`, `directoryHandle`, `handle` | Inconsistent naming |
| **Project storage** | `fsaHandles` (Dexie), `storageMetadata` (proposed) | Mixed terminology |
| **Project ID** | `projectId`, `project_id`, `id` | snake_case vs camelCase |
| **Store locations** | `lib/workspace/`, `infrastructure/persistence/stores/` | Scattered |

#### Recommendations
1. **Consolidate project stores**: Keep only `infrastructure/persistence/stores/project/`
2. **Standardize naming**: Use `directoryHandle` for FSA, `storageMetadata` for persistence
3. **Migrate fsaHandleManager logic**: Move to `infrastructure/filesystem/handle-persistence.ts`
4. **Delete deprecated files**:
   - `src/lib/workspace/project-store.ts` (replaced)
   - `src/lib/workspace/project-store/` (replaced)
   - `src/lib/workspace/project-types.ts` (duplicate)

## Tasks

- [ ] T1: Create handle-types.ts with StorageHandleMetadata interface (implementation) - 1h
- [ ] T2: Create handle-persistence.ts service (implementation) - 2h
- [ ] T3: Update project-types.ts to replace fsaHandle with storageMetadata (refactor) - 1h
- [ ] T4: Update project-crud-slice.ts for new persistence pattern (implementation) - 1.5h
- [ ] T5: Test handle restore flow with FSA (testing) - 0.5h
- [ ] T6: Verify no DataCloneError in persist (validation) - 0.5h

## Research Requirements

### Required MCP Research
- [ ] **Context7**: File System Access API MDN documentation
  - Query: "FileSystemDirectoryHandle persist serialize IndexedDB"
  - Expected: Best practices for handle persistence
  
- [ ] **DeepWiki**: Browser handle storage patterns
  - Query: "How do other IDEs (VS Code Web, StackBlitz) handle FSA persistence?"
  - Expected: Production patterns for handle restoration

### External Resources
- [ ] MDN: [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [ ] Chrome Dev: [Keeping persistent storage](https://developer.chrome.com/docs/apps/file_system_access/)

## Architecture Patterns

### Patterns to Follow
- **Pattern**: Handle Metadata Storage
  - Source: ADR-032 Section 3.2
  - Rationale: FileSystemDirectoryHandle is not serializable, store metadata only
  - Example: `src/lib/filesystem/fsa-handle-manager.ts:108-133`

### Constraints
- Component size: ≤300 lines
- Store slice size: ≤120 lines
- Import order: React → 3rd party → @/ → Domain → Relative
- Styling: 8-bit design (0 or 2px border-radius)

## Dev Notes

### Integration Points
- **Touches**: `project-crud-slice.ts`, `project-types.ts`, `fsa-handle-manager.ts`
- **Breaks**: Legacy `fsaHandle` field in Project interface
- **Shared With**: `use-file-loader-slice.ts`, `use-file-ops-slice.ts`

### Technical Considerations
1. **DataCloneError Prevention**: Never store FileSystemDirectoryHandle directly
2. **Permission State Tracking**: Need to know if permission was previously granted
3. **Silent Restore**: Try to restore without prompt if possible
4. **Fallback Chain**: Silent restore → Prompt → IndexedDB fallback

### Files to CREATE

```
src/infrastructure/filesystem/
├── handle-types.ts              # StorageHandleMetadata, HandleRestoreResult
└── handle-persistence.ts        # serializeHandle, restoreHandle, verifyHandleMatch

src/infrastructure/persistence/stores/project/
└── project-handler-service.ts   # ProjectHandleService class
```

### Files to MODIFY

```
src/infrastructure/persistence/stores/project/
├── project-types.ts             # Replace fsaHandle with storageMetadata
├── project-crud-slice.ts        # Use new persistence pattern
├── project-permissions-slice.ts # Adapt to new handle access
└── index.ts                     # Export new services

src/lib/filesystem/
└── fsa-handle-manager.ts        # Mark as deprecated, delegate to new service
```

### Files to DELETE (After Migration)

```
src/lib/workspace/project-store.ts              # DUPLICATE - use infrastructure
src/lib/workspace/project-types.ts              # DUPLICATE - use infrastructure
src/lib/workspace/project-store/                # DUPLICATE - use infrastructure
src/routes/ide.$projectId.tsx.bak               # .bak file - delete
```

### Codebase Mess Report (from real scan)

**100+ files contain `fsaHandle` or `FileSystemDirectoryHandle`** - Major cleanup needed:

| Location Pattern | Count | Action |
|-----------------|-------|--------|
| `src/infrastructure/persistence/stores/project/` | 12 files | ADAPT to new pattern |
| `src/infrastructure/persistence/stores/workspace/` | 8 files | ADAPT to new pattern |
| `src/lib/workspace/` | 15 files | DELETE (duplicate) |
| `src/lib/filesystem/` | 10 files | MERGE/CONSOLIDATE |
| `src/infrastructure/sync/` | 8 files | VERIFY compatibility |

**⚠️ ALARM RAISED:** The codebase has MAJOR duplication:
- 2 project store implementations (`lib/workspace/` vs `infrastructure/persistence/stores/project/`)
- 3 workspace context providers (conflicting)
- 4 different sync services for IDE alone
- Inconsistent naming: `fsaHandle`, `directoryHandle`, `handle`, `fsaHandles`

## References

- **Epic**: `epics.md#EPIC-CC-01`
- **Architecture**: `architecture.md#2.1`
- **ADR-032**: `_bmad-output/planning-artifacts/architecture/adr-032-clean-storage-architecture.md`
- **Related Stories**:
  - `FSA-ADAPTER`: Foundation for FSA adapter (done)
  - `PS-02-A`: Platform Detection (in progress)
  - `PS-05`: VFS Tree (depends on this)

## Dev Agent Record
*Populated during development phase*

## Code Review
*Populated during review phase*

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-15 | SM | From epic backlog |
| drafted | 2026-01-15T20:30 | SM | Story file created v2.0 with cross-impact analysis |
| validated | - | - | Pending validation |
| context-ready | - | - | Pending context creation |
| ready-for-implementation | - | - | Pending pre-planning |
| implementation-complete | - | - | Pending dev |
| review-approved | - | - | Pending review |
| done | - | - | Pending completion |
