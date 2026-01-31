# Epic CC-DESKTOP-FSA: Desktop FSA Migration

**Epic ID**: CC-DESKTOP-FSA
**Created**: 2026-01-18
**Status**: FUTURE (Blocked by CC-STORAGE-GATEWAY)
**Priority**: P0
**Team**: TEAM_B
**Duration**: 22 hours (6 stories)

---

## 1. Epic Overview

### Goal

Migrate desktop note storage from DexieDB to File System Access (FSA) API to achieve true file-based storage for desktop users.

```
✅ Desktop = FSA for all workspaces (IDE, Notes, Knowledge, Study)
✅ DexieDB = reactive cache only, NOT primary storage
✅ Desktop users should NOT point to browserDB for file storage
✅ Agent tools can access notes via terminal/file system
```

### Problem Statement

```
CURRENT STATE (BROKEN):
┌─────────────────────────────────────────────────────────────┐
│ Desktop User Journey                                         │
│   1. Creates note in Notes workspace                         │
│   2. Note stored DIRECTLY in DexieDB (bypasses gateway)      │
│   3. File NOT saved to FSA folder                            │
│   4. Agent tools cannot access note                          │
│   5. User confused: "Where are my files?"                    │
└─────────────────────────────────────────────────────────────┘

TARGET STATE (CORRECT):
┌─────────────────────────────────────────────────────────────┐
│ Desktop User Journey                                         │
│   1. Creates note in Notes workspace                         │
│   2. Note saved to FSA folder via FSAGateway                 │
│   3. DexieDB updated for reactive cache only                 │
│   4. Agent tools can access note via terminal                │
│   5. User sees: "Saved to /project/notes/"                   │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| CC-STORAGE-GATEWAY | Blocks | ACTIVE | Gateway abstraction must be fixed first |
| StorageGateway implementations | Prerequisite | EXISTS | FSAGateway, IDBGateway already exist |
| PlatformContract | Prerequisite | EXISTS | Device detection working |

### Exit Criteria

- [ ] All 6 stories complete
- [ ] Desktop notes stored in `/project/notes/*.md` (FSA)
- [ ] DexieDB only contains cache data (no direct file storage)
- [ ] Agent tools can read/write notes via file system
- [ ] Storage mode indicator visible in UI
- [ ] Rollback procedure documented and tested
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm vitest run` passes

---

## 2. Architecture

### Storage Architecture (After This Epic)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE GATEWAY ABSTRACTION                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              StorageGateway Interface                    │    │
│  │         read(), write(), list(), watch()                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│          ┌────────────────┴────────────────┐                    │
│          ▼                                  ▼                    │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │  FSAGateway     │              │  IDBGateway     │           │
│  │  (Desktop)      │              │  (Mobile)       │           │
│  └─────────────────┘              └─────────────────┘           │
│                                                                  │
│  TOTALLY DIFFERENT MECHANISMS - BOTH IMPLEMENT SAME INTERFACE   │
└─────────────────────────────────────────────────────────────────┘
```

### Platform Rules (Final)

| Platform | Primary Storage | Cache | Route Guard | Notes |
|----------|-----------------|-------|-------------|-------|
| **Desktop** | FSA | DexieDB | N/A | Files in `/project/notes/*.md` |
| **Mobile** | DexieDB | N/A | IDE blocked | No FSA support |
| **Tablet** | DexieDB | N/A | IDE blocked | Touch interface |

### DexieDB Role Definition (After This Epic)

| Usage | Desktop | Mobile | Notes |
|-------|---------|--------|-------|
| **File Storage** | ❌ NEVER | ✅ PRIMARY | Mobile has no choice |
| **Reactive Cache** | ✅ YES | ❌ NO | UI state, not files |
| **Project Metadata** | ✅ YES | ✅ YES | Project config, bindings |
| **User Preferences** | ✅ YES | ✅ YES | Settings, API keys |

---

## 3. Direct Dexie Violations (Must Be Fixed)

These are the files with direct `db.notes.*` calls that must be refactored:

```
CRITICAL VIOLATIONS (Bypass StorageGateway):
src/lib/notes/slices/note-crud-slice.ts:167    → db.notes.add()
src/lib/notes/slices/note-crud-slice.ts:229    → db.notes.update()
src/lib/notes/slices/note-crud-slice.ts:294    → db.notes.delete()
src/lib/notes/slices/note-metadata-slice.ts:46 → db.notes.update()
src/lib/notes/slices/note-metadata-slice.ts:88 → db.notes.update()
src/lib/notes/slices/note-indexing-slice.ts:61 → db.notes.update()

Total: 6 violations blocking FSA migration
```

---

## 4. Stories

### CC-DF-01: Note File Format Migration

**Story ID**: CC-DF-01
**Title**: Note File Format Migration
**Priority**: P0
**Effort**: 4 hours
**Team**: TEAM_B
**Status**: pending

#### Description

Design and implement the file format for storing notes in FSA. Notes should be stored as Markdown files with frontmatter for metadata.

#### Acceptance Criteria

- [ ] Note file format defined (Markdown + YAML frontmatter)
- [ ] File naming convention established (e.g., `note-id.md`)
- [ ] Frontmatter structure defined (title, created, modified, tags)
- [ ] Note formatter created at `src/lib/notes/format/note-formatter.ts`
- [ ] Note exporter created at `src/lib/notes/export/note-exporter.ts`
- [ ] Existing DexieDB notes can be exported to FSA format
- [ ] Tests verify format compatibility

#### Tasks

- [ ] Define note file format specification
- [ ] Create note-formatter.ts with `formatNoteForStorage()` and `parseNoteFromStorage()`
- [ ] Create note-exporter.ts with `exportNotesToFSA()`
- [ ] Implement frontmatter parsing/serialization
- [ ] Write unit tests for formatter
- [ ] Write integration test for export

#### Dependencies

- None (Epic foundation story)

#### Handoff Artifacts

- `src/lib/notes/format/note-formatter.ts`
- `src/lib/notes/export/note-exporter.ts`
- `src/lib/notes/__tests__/note-format.test.ts`

---

### CC-DF-02: DexieDB → FSA Sync Layer

**Story ID**: CC-DF-02
**Title**: DexieDB → FSA Sync Layer
**Priority**: P0
**Effort**: 6 hours
**Team**: TEAM_B
**Status**: pending

#### Description

Create a sync layer that maintains bidirectional consistency between DexieDB cache and FSA files. This ensures UI reactivity while storing files on disk.

#### Acceptance Criteria

- [ ] Sync layer created at `src/lib/notes/sync/note-sync-layer.ts`
- [ ] File watcher created at `src/lib/notes/sync/file-watcher.ts` (using FileSystemObserver or polling)
- [ ] Cache sync created at `src/lib/notes/sync/cache-sync.ts`
- [ ] Write to FSA updates DexieDB cache
- [ ] External file changes sync to DexieDB cache
- [ ] Conflict resolution for concurrent edits
- [ ] Tests verify sync consistency

#### Tasks

- [ ] Create note-sync-layer.ts with `NoteSyncLayer` class
- [ ] Implement file watcher with native (129+) and polling fallback
- [ ] Create cache-sync.ts with `CacheSync` class
- [ ] Implement bidirectional sync logic
- [ ] Add conflict detection and resolution
- [ ] Write unit tests for sync layer
- [ ] Write integration test for file watching

#### Dependencies

- CC-DF-01 (needs file format)

#### Handoff Artifacts

- `src/lib/notes/sync/note-sync-layer.ts`
- `src/lib/notes/sync/file-watcher.ts`
- `src/lib/notes/sync/cache-sync.ts`
- `src/lib/notes/__tests__/sync-layer.test.ts`

---

### CC-DF-03: Agent Tool Integration

**Story ID**: CC-DF-03
**Title**: Agent Tool Integration
**Priority**: P0
**Effort**: 4 hours
**Team**: TEAM_B
**Status**: pending

#### Description

Integrate agent tools with the FSA-based note storage so AI agents can read, write, and manage notes via terminal/file operations.

#### Acceptance Criteria

- [ ] Note commands added to agent tools at `src/lib/agent/tools/note-commands.ts`
- [ ] File commands updated at `src/lib/agent/tools/file-commands.ts`
- [ ] Agent can list notes in FSA folder
- [ ] Agent can read note content from FSA
- [ ] Agent can create/update notes in FSA
- [ ] Agent can delete notes from FSA
- [ ] Tools work with StorageGateway abstraction

#### Tasks

- [ ] Create note-commands.ts with agent tool functions
- [ ] Implement `listNotes()` using gateway.list()
- [ ] Implement `readNote()` using gateway.read()
- [ ] Implement `writeNote()` using gateway.write()
- [ ] Implement `deleteNote()` using gateway.delete()
- [ ] Update file-commands.ts to include note operations
- [ ] Write tests for agent tools

#### Dependencies

- CC-DF-02 (needs sync layer)
- StorageGateway abstraction (from Epic 1)

#### Handoff Artifacts

- `src/lib/agent/tools/note-commands.ts`
- Updated `src/lib/agent/tools/file-commands.ts`
- `src/lib/agent/__tests__/note-commands.test.ts`

---

### CC-DF-04: User Experience Updates

**Story ID**: CC-DF-04
**Title**: User Experience Updates
**Priority**: P1
**Effort**: 3 hours
**Team**: TEAM_B
**Status**: pending

#### Description

Update the user interface to reflect the new FSA-based storage, including storage mode indicators and user feedback.

#### Acceptance Criteria

- [ ] Storage indicator component created at `src/presentation/components/notes/StorageIndicator.tsx`
- [ ] Hook created at `src/presentation/hooks/useStorageMode.ts`
- [ ] Note header updated at `src/presentation/components/notes/NoteHeader.tsx`
- [ ] User sees "FSA" indicator on desktop
- [ ] User sees "BrowserDB" indicator on mobile
- [ ] Storage location displayed in settings
- [ ] Accessibility verified (WCAG 2.1)

#### Tasks

- [ ] Create StorageIndicator.tsx with 8-bit design
- [ ] Implement useStorageMode.ts hook
- [ ] Update NoteHeader.tsx to show storage indicator
- [ ] Add storage info to settings page
- [ ] Ensure 8-bit design compliance
- [ ] Test on mobile (should show BrowserDB)
- [ ] Test on desktop (should show FSA)

#### Dependencies

- None (UI work can proceed in parallel)

#### Handoff Artifacts

- `src/presentation/components/notes/StorageIndicator.tsx`
- `src/presentation/hooks/useStorageMode.ts`
- Updated `src/presentation/components/notes/NoteHeader.tsx`

---

### CC-DF-05: Migration Verification Tests

**Story ID**: CC-DF-05
**Title**: Migration Verification Tests
**Priority**: P1
**Effort**: 3 hours
**Team**: TEAM_B
**Status**: pending

#### Description

Create comprehensive tests to verify the FSA migration works correctly, including end-to-end tests for user workflows.

#### Acceptance Criteria

- [ ] FSA migration test created at `src/lib/notes/__tests__/fsa-migration.test.ts`
- [ ] End-to-end test for note creation workflow
- [ ] End-to-end test for note editing workflow
- [ ] End-to-end test for note deletion workflow
- [ ] Test verifies notes exist in FSA folder
- [ ] Test verifies DexieDB contains only cache
- [ ] Test verifies agent tools can access notes

#### Tasks

- [ ] Create fsa-migration.test.ts
- [ ] Write E2E test for create/read/update/delete
- [ ] Write test for storage mode detection
- [ ] Write test for gateway routing
- [ ] Write test for file watching integration
- [ ] All tests passing with `pnpm vitest run`

#### Dependencies

- CC-DF-01 (needs file format)
- CC-DF-02 (needs sync layer)

#### Handoff Artifacts

- `src/lib/notes/__tests__/fsa-migration.test.ts`
- Test results report

---

### CC-DF-06: Rollback Procedure

**Story ID**: CC-DF-06
**Title**: Rollback Procedure
**Priority**: P2
**Effort**: 2 hours
**Team**: TEAM_B
**Status**: pending

#### Description

Document and implement rollback procedure in case FSA migration needs to be reverted.

#### Acceptance Criteria

- [ ] Rollback procedure document created at `_bmad-output/planning-artifacts/migration/rollback-procedure.md`
- [ ] Rollback script implemented (if applicable)
- [ ] FSA notes can be imported back to DexieDB
- [ ] Rollback tested in staging environment
- [ ] Rollback time documented (< 15 minutes)

#### Tasks

- [ ] Create rollback-procedure.md document
- [ ] Document step-by-step rollback process
- [ ] Create rollback script (optional)
- [ ] Test rollback in staging
- [ ] Document rollback time estimate
- [ ] Add rollback entry to migration guide

#### Dependencies

- All previous stories complete

#### Handoff Artifacts

- `_bmad-output/planning-artifacts/migration/rollback-procedure.md`
- Rollback script (if created)

---

## 5. File Structure

### Files to CREATE

| File | Lines | Category |
|------|-------|----------|
| `src/lib/notes/gateways/note-gateway.ts` | 100 | Gateway |
| `src/lib/notes/export/note-exporter.ts` | 80 | Export |
| `src/lib/notes/format/note-formatter.ts` | 80 | Format |
| `src/lib/notes/sync/note-sync-layer.ts` | 150 | Sync |
| `src/lib/notes/sync/file-watcher.ts` | 100 | Sync |
| `src/lib/notes/sync/cache-sync.ts` | 80 | Sync |
| `src/lib/agent/tools/note-commands.ts` | 120 | Agent |
| `src/presentation/components/notes/StorageIndicator.tsx` | 60 | UI |
| `src/presentation/hooks/useStorageMode.ts` | 40 | Hook |
| `src/lib/notes/__tests__/fsa-migration.test.ts` | 150 | Test |
| `_bmad-output/planning-artifacts/migration/rollback-procedure.md` | 100 | Doc |

**Total Create**: 11 files, ~1060 lines

### Files to MODIFY

| File | Changes | Category |
|------|---------|----------|
| `src/lib/notes/slices/note-crud-slice.ts` | Remove direct db calls (167, 229, 294) | Slice |
| `src/lib/notes/slices/note-metadata-slice.ts` | Remove direct db calls (46, 88) | Slice |
| `src/lib/notes/slices/note-indexing-slice.ts` | Remove direct db calls (61) | Slice |
| `src/lib/agent/tools/file-commands.ts` | Add note commands | Agent |
| `src/presentation/components/notes/NoteHeader.tsx` | Add storage indicator | UI |

**Total Modify**: 5 files

---

## 6. Recovery Path

### Before (Broken)

```
- Desktop notes stored DIRECTLY in DexieDB
- No file on disk
- Agent tools cannot access notes
- User confused about file location
```

### After Epic 1 (Gateway Fixed)

```
- StorageGateway abstraction working
- Platform routing verified
- 6 direct db calls replaced
- Ready for FSA migration
```

### After Epic 2 (This Epic - Cleaned State)

```
- Desktop notes in /project/notes/*.md (FSA)
- DexieDB only contains cache data
- Agent tools can access notes
- All AI capabilities fluid and usable
- User sees storage indicator
```

---

## 7. Risks

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| Data loss during migration | Low | Critical | Backup before migration, test rollback | Architect |
| Sync conflicts | Medium | High | Implement conflict resolution, user dialog | Architect |
| Performance regression | Medium | Medium | Profile before/after, optimize file I/O | Developer |
| Mobile regression | Low | High | Test mobile thoroughly, CI checks | QA |
| External file edits | Low | Medium | File watcher with merge dialog | Architect |

---

## 8. Testing Strategy

### Unit Tests

- Note formatter/parser tests
- Sync layer tests
- Agent tool tests
- Hook tests

### Integration Tests

- FSA migration test
- File watching integration
- Gateway routing test
- Platform detection test

### E2E Tests

- Note creation workflow
- Note editing workflow
- Note deletion workflow
- Agent tool access workflow

### Manual Testing

- Storage indicator visibility
- Mobile vs Desktop behavior
- Rollback procedure
- Edge cases (large files, concurrent edits)

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Notes in FSA | 100% | File count in /project/notes/ |
| Direct db calls | 0 | Code grep for db.notes.* |
| Agent tool access | 100% | Tool execution success rate |
| TypeScript errors | 0 | pnpm tsc --noEmit |
| Test coverage | >80% | vitest coverage report |
| Migration time | < 30 min | Time to migrate existing notes |
| Rollback time | < 15 min | Time to rollback |

---

## 10. References

### Architecture Documents

- `src/infrastructure/filesystem/platform-contract.ts`
- `src/infrastructure/filesystem/storage-gateway-factory.ts`
- `src/infrastructure/filesystem/fsa-gateway.ts`
- `src/infrastructure/filesystem/idb-gateway.ts`

### Previous Epic

- `_bmad-ext/.correct-course/epics/CC-STORAGE-GATEWAY-2026-01-18.md`

### Consolidated Context

- `_bmad-ext/.correct-course/consolidated-context-2026-01-18.md`

### Standards

- `agent-os/standards/frontend/components.md`
- `agent-os/standards/frontend/css.md`
- `agent-os/standards/backend/models.md`

---

## 11. Story Execution Order

```
Phase 1 (Day 1):
├── CC-DF-01: Note File Format Migration (4h)
└── CC-DF-02: DexieDB → FSA Sync Layer (6h)

Phase 2 (Day 2):
├── CC-DF-03: Agent Tool Integration (4h)
└── CC-DF-04: User Experience Updates (3h)

Phase 3 (Day 2-3):
├── CC-DF-05: Migration Verification Tests (3h)
└── CC-DF-06: Rollback Procedure (2h)
```

---

## 12. Notes

- **Important**: All code must follow 8-bit design system (no rounded corners, no glassmorphism)
- **Important**: All strings must be internationalized (English + Vietnamese)
- **Important**: Use StorageGateway abstraction - NEVER call DexieDB directly for file storage
- **Note**: This epic can only start after CC-STORAGE-GATEWAY is 100% complete
- **Note**: Team B should review consolidated context before starting

---

**Document Version**: 1.0.0
**Created**: 2026-01-18
**Status**: FUTURE - Ready for execution after Epic 1
**Owner**: TEAM_B
