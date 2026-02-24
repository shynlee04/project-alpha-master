# Story: CC-SG-02

**Title**: Clear Platform Routing - Verify Desktop→FSAGateway, Mobile→IDBGateway
**Epic**: CC-EPIC-STORAGE-GATEWAY
**Points**: 5
**Priority**: P0
**Status**: ready-for-development
**Team**: TEAM_A

---

## Acceptance Criteria

1. **Desktop Platform Routing**
   - Desktop platform uses FSAGateway for note storage
   - Notes saved to FSA folder: `/project/notes/*.md`
   - PlatformContract.deviceType returns "desktop"
   - PlatformContract.storageType returns "fsa"

2. **Mobile Platform Routing**
   - Mobile platform uses IDBGateway for note storage
   - Notes saved to IndexedDB via gateway
   - PlatformContract.deviceType returns "mobile"
   - PlatformContract.storageType returns "indexeddb"

3. **StorageGatewayFactory Routing**
   - StorageGatewayFactory correctly instantiates gateway by platform
   - Desktop requests return FSAGateway instance
   - Mobile requests return IDBGateway instance

4. **TypeScript Clean**
   - `pnpm tsc --noEmit` passes with 0 errors
   - No type regressions in dependent files

5. **Tests Passing**
   - `pnpm vitest run` passes
   - Platform routing tests pass

---

## Agentic and UX Context (REQUIRED)

### The User Journey

**Answer these 6 questions to define the user flow:**

1. **User starts at**: Notes workspace (notes.$projectId.lazy.tsx)
   - Platform detection runs on app initialization
   - PlatformContract populated with device capabilities

2. **User performs**: Creates/edits a note
   - User clicks "New Note" or edits existing note
   - User types content in BlockNote editor

3. **System shows**: Storage indicator
   - On desktop: "Saving to /project/notes/" indicator
   - On mobile: "Saving to local storage" indicator
   - Platform-specific storage path displayed

4. **Result appears**: Note saved
   - Desktop: File appears in FSA folder
   - Mobile: Record appears in IndexedDB
   - User sees platform-appropriate success message

5. **User then**: Continues editing or closes
   - Can add more content
   - Can switch to other workspace

6. **If it fails**: Error toast with retry
   - Platform-appropriate error message
   - Retry button re-triggers save

---

## Tasks and Subtasks

### Verification Tasks

- [ ] **Task 1**: Verify PlatformContract
  - [ ] 1.1 Check platform-contract.ts exists and exports correctly
  - [ ] 1.2 Verify deviceType detection logic
  - [ ] 1.3 Verify storageType determination

- [ ] **Task 2**: Verify StorageGatewayFactory
  - [ ] 2.1 Check factory creates correct gateway by platform
  - [ ] 2.2 Verify FSAGateway returned for desktop
  - [ ] 2.3 Verify IDBGateway returned for mobile

- [ ] **Task 3**: Verify Gateway Implementations
  - [ ] 3.1 Check FSAGateway read/write/delete methods
  - [ ] 3.2 Check IDBGateway read/write/delete methods
  - [ ] 3.3 Verify both implement StorageGateway interface

### Testing Tasks

- [ ] **Unit Tests**: PlatformContract tests
- [ ] **Unit Tests**: StorageGatewayFactory routing tests
- [ ] **Integration Tests**: Cross-platform note operations
- [ ] **E2E Tests**: Desktop note creation flow
- [ ] **Mobile E2E**: Mobile note creation flow

---

## Dependencies

### Blocking Stories
- None (this story can run in parallel with CC-SG-01)

### Technical Dependencies
- StorageGatewayFactory: Must correctly route by platform
- FSAGateway: Must exist and work
- IDBGateway: Must exist and work
- PlatformContract: Must correctly detect device type

---

## Dev Notes

### Architecture Requirements
- Follow Clean Architecture: Domain → Infrastructure → Presentation
- PlatformContract is the source of truth for device capabilities
- No hard-coded platform checks in components

### Previous Learnings
- Consolidated context (consolidated-context-2026-01-18.md) confirms platform rules
- Desktop = FSA primary, DexieDB = cache only
- Mobile = DexieDB (no FSA support)

### Technical Specifications
```typescript
// PlatformContract (canonical)
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}

// StorageGatewayFactory (canonical)
class StorageGatewayFactory {
  static create(platform: PlatformContract): StorageGateway {
    if (platform.canAccessFSA) {
      return new FSAGateway();
    }
    return new IDBGateway();
  }
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

### Files to Verify (No Modification)
| File | Purpose | Status |
|------|---------|--------|
| `src/infrastructure/filesystem/platform-contract.ts` | Platform detection | verify |
| `src/infrastructure/filesystem/storage-gateway-factory.ts` | Gateway factory | verify |
| `src/infrastructure/filesystem/fsa-gateway.ts` | FSA implementation | verify |
| `src/infrastructure/filesystem/idb-gateway.ts` | IDB implementation | verify |

### Files to Create (If Missing)
| File | Purpose | Est. Lines |
|------|---------|------------|
| `tests/platform-routing.test.ts` | Platform routing tests | 100 |

### Files to Modify
| File | Changes | Lines |
|------|---------|-------|
| None expected | Verification only | - |

---

## Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-01-18 | ext-master | Created from consolidated context |
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
