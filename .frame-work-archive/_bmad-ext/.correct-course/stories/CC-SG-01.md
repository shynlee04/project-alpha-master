# Story: CC-SG-01

**Title**: Replace 6 Direct db.notes.* Calls with StorageGateway
**Epic**: CC-EPIC-STORAGE-GATEWAY
**Points**: 8
**Priority**: P0
**Status**: ready-for-development
**Team**: TEAM_A

---

## Acceptance Criteria

1. [ ] **Gateway Abstraction Complete**
   - All 6 direct `db.notes.*` calls replaced with `storageGateway.write()/read()`
   - Files modified: note-crud-slice.ts, note-metadata-slice.ts, note-indexing-slice.ts

2. [ ] **TypeScript Clean**
   - `pnpm tsc --noEmit` passes with 0 errors
   - No type regressions in dependent files

3. [ ] **Tests Passing**
   - `pnpm vitest run` passes
   - Note store tests pass (note-store.test.ts)

4. [ ] **Desktop Routing**
   - Desktop platform uses FSAGateway
   - Notes saved to FSA folder: `/project/notes/*.md`

5. [ ] **Mobile Routing**
   - Mobile platform uses IDBGateway
   - Notes saved to IndexedDB via gateway

---

## Agentic & UX Context (REQUIRED)

### The User Journey

**Answer these 6 questions to define the user flow:**

1. **User starts at**: Notes workspace (notes.$projectId.lazy.tsx)
   - User opens Notes workspace in browser
   - Platform detection runs (desktop vs mobile)

2. **User performs**: Creates/edits a note
   - User clicks "New Note" or edits existing note
   - User types content in BlockNote editor

3. **System shows**: Spinner on save button
   - Auto-save indicator appears
   - Content queued for persistence

4. **Result appears**: Note saved indicator
   - Toast notification: "Note saved"
   - File appears in FSA folder (desktop) or IDB (mobile)

5. **User then**: Continues editing or closes
   - Can add more content
   - Can switch to other workspace

6. **If it fails**: Error toast with retry
   - Toast: "Failed to save note. Retry?"
   - Retry button re-triggers save

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Create NoteGateway facade
  - [ ] 1.1 Create `src/lib/notes/gateways/note-gateway.ts`
  - [ ] 1.2 Implement `saveNote(note: Note): Promise<void>`
  - [ ] 1.3 Implement `loadNote(id: string): Promise<Note>`
  - [ ] 1.4 Implement `deleteNote(id: string): Promise<void>`

- [ ] **Task 2**: Update note-crud-slice.ts
  - [ ] 2.1 Remove `db.notes.add()` call at line 167
  - [ ] 2.2 Remove `db.notes.update()` call at line 229
  - [ ] 2.3 Remove `db.notes.delete()` call at line 294
  - [ ] 2.4 Replace with noteGateway calls

- [ ] **Task 3**: Update note-metadata-slice.ts
  - [ ] 3.1 Remove `db.notes.update()` calls at lines 46, 88
  - [ ] 3.2 Replace with noteGateway.updateMetadata()

- [ ] **Task 4**: Update note-indexing-slice.ts
  - [ ] 4.1 Remove `db.notes.update()` call at line 61
  - [ ] 4.2 Replace with noteGateway.updateIndex()

### Testing Tasks

- [ ] **Unit Tests**: NoteGateway facade tests
- [ ] **Integration Tests**: StorageGateway routing tests
- [ ] **E2E Tests**: Desktop note creation flow
- [ ] **Mobile E2E**: Mobile note creation flow

---

## Dependencies

### Blocking Stories
- None (this is the first story in Epic)

### Technical Dependencies
- StorageGatewayFactory: Must correctly route by platform
- FSAGateway: Must exist and work
- IDBGateway: Must exist and work

---

## Dev Notes

### Architecture Requirements
- Follow Clean Architecture: Domain → Infrastructure → Presentation
- Use StorageGateway interface for abstraction
- No direct Dexie calls in presentation layer

### Previous Learnings
- Consolidated context (consolidated-context-2026-01-18.md) confirms 6 violations
- Paper 2 was rejected - do not use its findings

### Technical Specifications
```typescript
// StorageGateway interface (canonical)
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
}

// PlatformContract (canonical)
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
}
```

---

## Dev Agent Record

### Implementation Plan
{Filled during implementation}

### Debug Log
{Filled during implementation}

### Completion Notes
{Filled when story is done}

---

## File List

### Files to Create
| File | Purpose | Est. Lines |
|------|---------|------------|
| `src/lib/notes/gateways/note-gateway.ts` | Gateway facade | 100 |

### Files to Modify
| File | Changes | Lines |
|------|---------|-------|
| `src/lib/notes/slices/note-crud-slice.ts` | Replace 3 calls | 167, 229, 294 |
| `src/lib/notes/slices/note-metadata-slice.ts` | Replace 2 calls | 46, 88 |
| `src/lib/notes/slices/note-indexing-slice.ts` | Replace 1 call | 61 |

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-01-18 | ext-master | Created from template |
| | | |

---

## Status

**Current Status**: pending

---

## Validation Checklist (Story-Cycle Steps)

### Step 1a: User Journey Simulation (The Movie Script Test)
- [ ] 30-second demo script generated
- [ ] Journey map created
- [ ] Cohesion score >= 3
- [ ] No critical anti-patterns detected

### Step 2: Validate
- [ ] Prerequisites verified
- [ ] Dependencies complete
- [ ] Sprint capacity confirmed

### Step 3a: Agent Tool Spec (The Brain Check)
- [ ] N/A - No AI tool in this story

### Step 3: Implement
- [ ] All acceptance criteria implemented
- [ ] Code follows standards
- [ ] Tests written

### Step 4: Test
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] No regressions

### Step 5: Review
- [ ] Code review approved
- [ ] Quality checks passed

### Step 6: Done
- [ ] All tasks complete
- [ ] sprint-status.yaml updated

### Step 6a: Reality Check (The Demo)
- [ ] End-to-end flow works
- [ ] Desktop: Note saves to FSA folder
- [ ] Mobile: Note saves to IndexedDB
- [ ] No visual breaks

---

## Quality Gates Summary

| Gate | Status | Notes |
|------|--------|-------|
| Story Start Gate | pending | Step 2 |
| Product Reality Gate | pending | Step 1a |
| Agent Brain Gate | N/A | No AI tool |
| Test Gate | pending | Step 4 |
| Done Gate | pending | Step 6 |
| Visual Reality Gate | pending | Step 6a |
