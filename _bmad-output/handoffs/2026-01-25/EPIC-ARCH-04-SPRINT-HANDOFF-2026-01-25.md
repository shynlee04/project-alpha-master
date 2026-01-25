# EPIC-ARCH-04 Sprint Handoff

> **Handoff ID**: `hnd_20260125_200000_epic_arch_04_v2`
> **Created**: 2026-01-25T20:00:00+07:00
> **Updated**: 2026-01-25T21:30:00+07:00
> **Source Agent**: architect-ext
> **Target Agents**: sprint-manager, dev-ext
> **Priority**: P0 (CRITICAL BLOCKER - App Non-Functional)
> **Status**: READY_FOR_SPRINT_PLANNING
> **Version**: 2.0 (Comprehensive)

---

## Document Governance

### Parent Documents (MUST READ BEFORE STARTING)

| Document | Path | Purpose |
|----------|------|---------|
| **EPIC-ARCH-04** (Primary) | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md` | Comprehensive epic with all 6 stories |
| **ADR-034** | `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md` | Project-centric architecture decisions |
| **ADR-034-AMENDMENT-001** | `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md` | Platform-first plugin selection |
| **new-fundamental-truths.md** | `/new-fundamental-truths.md` | Strategic vision and principles |
| **AGENTS.md** | `/AGENTS.md` | Governance rules and standards |

### Child Documents (Created from This Handoff)

| Document | Path | Purpose |
|----------|------|---------|
| **Story Files** | `_bmad-output/sprint-artifacts/stories/ARCH-04-*` | Individual story specifications (to be created by sprint-manager) |
| **Completion Report** | `_bmad-output/sprint-artifacts/completion/EPIC-ARCH-04-completion.md` | Post-validation evidence (to be created) |

### Supersedes

| Document | Reason |
|----------|--------|
| `HOOKS-FIX-01` | Absorbed into ARCH-04-01 |
| `HOOKS-FIX-02` | Absorbed into ARCH-04-01 |

---

## Situation Assessment

### What Has Already Been Done

| Story | Status | What Happened |
|-------|--------|---------------|
| **HOOKS-FIX-01** | ✅ COMPLETE | Migrated 4 files from OLD to NEW context imports |
| **HOOKS-FIX-02** | ✅ COMPLETE | Fixed hooks violation (useFileTreeStore in async function line 250) |
| **TypeScript** | ✅ CLEAN | 0 errors (115 errors → 0 fixed in EPIC-TS-DEBT) |

### Why App Still Fails

After hooks fixes, a **deeper architectural gap** was discovered:

```
Error: "No directory access granted. Call requestAccess() first."
```

**Root Cause**: The NEW `ProjectContextProvider` (created in ARCH-02-03) was built **without FSA handle lifecycle integration**:

| Feature | OLD Context Had | NEW Context Has | Impact |
|---------|-----------------|-----------------|--------|
| FSA Handle State | `fsaHandle`, `setFsaHandle` | ❌ MISSING | Can't store handle |
| Handle Restoration | `restoreHandleAsync()` | ❌ MISSING | Can't restore on page load |
| Handle Persistence | `handlePersistenceService` | ❌ MISSING | Can't persist for future visits |
| Permission Overlay | Shows UI to grant permission | ❌ MISSING | Can't get user permission |
| Initial Handle Prop | `initialHandle` from wizard | ❌ MISSING | Can't receive handle from wizard |

### Failure Flow Diagram

```
Wizard picks folder → fsaHandle obtained ✅
    ↓
Navigate to /$projectId → fsaHandle NOT passed ❌
    ↓
ProjectContextProvider mounts → no initialHandle ❌
    ↓
storageAdapterFactory.createAdapter({ handle: undefined }) ❌
    ↓
FSAStorageAdapter.ensureAccess() → throws "No directory access"
```

---

## Strategic Solution: EPIC-ARCH-04

### This is NOT a Bug Fix

EPIC-ARCH-04 **completes the migration** that EPIC-ARCH-01/02/03 started. Those epics created the NEW architecture (ProjectContext, FeaturePlugins, PluginLayout) but left FSA handle integration incomplete.

### Stories (Ordered by Dependency)

| # | Story | Title | Priority | Effort | Dependencies | Blocking |
|---|-------|-------|----------|--------|--------------|----------|
| 1 | **ARCH-04-01** | Integrate FSA Handle Lifecycle into ProjectContextProvider | P0 | 3-4h | None | ALL |
| 2 | **ARCH-04-02** | Pass FSA Handle from Wizard to Route | P0 | 1-2h | 01 | 05 |
| 3 | **ARCH-04-03** | Integrate PermissionOverlay for NEW Architecture | P0 | 1-2h | 01 | 05 |
| 4 | **ARCH-04-05** | End-to-End Flow Validation | P0 | 1-2h | 01,02,03 | 04,06 |
| 5 | **ARCH-04-04** | Archive Legacy Files and Update Imports | P1 | 2-3h | 05 | None |
| 6 | **ARCH-04-06** | Clean Up Deprecated Options in Wizard | P2 | 1h | 05 | None |

### Critical Path

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: CRITICAL PATH (App Functional)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ARCH-04-01 ──────────────────────────────────────────┐     │
│  (FSA Handle Lifecycle)                               │     │
│         │                                             │     │
│         ├──────────────> ARCH-04-02                   │     │
│         │                (Handle from Wizard)         │     │
│         │                       │                     │     │
│         └──────────────> ARCH-04-03                   │     │
│                          (Permission Overlay)         │     │
│                                 │                     │     │
│                                 ↓                     │     │
│                          ARCH-04-05 ←────────────────┘     │
│                          (E2E Validation)                   │
│                                 │                           │
│                      ══════════════════════                 │
│                      ║ APP WORKS HERE ║                     │
│                      ══════════════════════                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Phase 2: CLEANUP                                           │
├─────────────────────────────────────────────────────────────┤
│         ARCH-04-04 ──────────> ARCH-04-06                   │
│         (Archive Legacy)       (Wizard Cleanup)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9-Step Story Execution Workflow

For each story, follow this workflow:

### Step 1: Load Context
```bash
# Read the story from epic
Read: _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md

# Read key service files
Read: src/infrastructure/context/project-context.tsx
Read: src/infrastructure/filesystem/handle-persistence.ts
Read: src/infrastructure/filesystem/StorageAdapterFactory.ts
```

### Step 2: Verify Prerequisites
```yaml
# For ARCH-04-01 (no dependencies)
prerequisites: []

# For ARCH-04-02, 04-03
prerequisites:
  - ARCH-04-01 must be COMPLETE and VERIFIED

# For ARCH-04-05
prerequisites:
  - ARCH-04-01 must be COMPLETE and VERIFIED
  - ARCH-04-02 must be COMPLETE and VERIFIED
  - ARCH-04-03 must be COMPLETE and VERIFIED
```

### Step 3: Implement Changes
- Follow the implementation steps in the epic
- Use the code examples provided
- Add console.log statements for debugging

### Step 4: TypeScript Verification
```bash
pnpm tsc --noEmit
# Expected: 0 errors
# If errors: Fix before proceeding
```

### Step 5: Unit Test (if applicable)
```bash
pnpm vitest run --reporter=verbose
# Verify no regression in existing tests
```

### Step 6: Manual Browser Test
```bash
pnpm dev
# Open http://localhost:3002
# Follow test scenarios from story
```

### Step 7: Update Story Status
```yaml
# In story file
status: "COMPLETE"
verified: true
completed_at: "2026-01-25T22:00:00+07:00"
```

### Step 8: Commit Changes
```bash
git add -A
git commit -m "feat(ARCH-04-XX): [description]"
```

### Step 9: Report Completion
- Update sprint-status-2026-01-25.yaml
- Update workflow-status-2026-01-25.yaml
- If all Phase 1 stories complete, proceed to ARCH-04-05 validation

---

## ARCH-04-01: Immediate Action (Gate Story)

**This is the gate** - nothing else matters until this is done.

### Files to Modify

| File | Lines (approx) | Changes |
|------|----------------|---------|
| `src/infrastructure/context/project-context.tsx` | ~100 new | Add FSA handle state, restoration, persistence |

### Implementation Steps

#### Step 1: Add Imports (~line 37)

```typescript
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import type { HandleRestoreResult } from '@/infrastructure/filesystem/handle-types';
```

#### Step 2: Modify Props Interface (~line 147)

```typescript
interface Props {
  projectId: string;
  children: ReactNode;
  initialHandle?: FileSystemDirectoryHandle | null; // NEW: Handle from wizard
}
```

#### Step 3: Add State (~line 166)

```typescript
const [fsaHandle, setFsaHandle] = useState<FileSystemDirectoryHandle | null>(null);
const [showPermissionOverlay, setShowPermissionOverlay] = useState(false);
```

#### Step 4: Add FSA Handle Restoration in initializeProject() (~line 200)

```typescript
// Check for initialHandle from wizard
if (initialHandle) {
  console.log('[ProjectContext] Using initialHandle from props');
  setFsaHandle(initialHandle);
  // Persist for future visits
  await handlePersistenceService.persistHandle(projectId, initialHandle, 'ide');
} else if (loadedProject.storageType === 'fsa') {
  // Try to restore from persistence
  console.log('[ProjectContext] Attempting FSA handle restoration');
  const restoreResult: HandleRestoreResult = await handlePersistenceService.restoreHandle(projectId);
  
  if (restoreResult.success && restoreResult.handle) {
    console.log('[ProjectContext] FSA handle restored successfully');
    setFsaHandle(restoreResult.handle);
  } else if (restoreResult.requiresUserInteraction) {
    console.log('[ProjectContext] FSA handle requires user interaction');
    setShowPermissionOverlay(true);
    setLoading(false);
    return; // Wait for user to grant permission
  } else {
    console.error('[ProjectContext] FSA handle restoration failed:', restoreResult.error);
    setError(`Failed to restore file access: ${restoreResult.error}`);
    setLoading(false);
    return;
  }
}
```

#### Step 5: Pass Handle to StorageAdapterFactory (~line 207)

```typescript
const storageAdapter: StorageAdapter = storageAdapterFactory.createAdapter({
  projectId,
  storageType: loadedProject.storageType,
  handle: fsaHandle, // ← ADD THIS
});
```

#### Step 6: Add Permission Overlay Render (~line 328)

```typescript
if (showPermissionOverlay) {
  return (
    <PermissionOverlay
      projectId={projectId}
      projectName={project?.name || 'Unknown'}
      onPermissionGranted={async (handle: FileSystemDirectoryHandle) => {
        console.log('[ProjectContext] Permission granted, persisting handle');
        setFsaHandle(handle);
        await handlePersistenceService.persistHandle(projectId, handle, 'ide');
        setShowPermissionOverlay(false);
        // Re-run initialization with new handle
        setLoading(true);
      }}
      onCancel={() => navigate({ to: '/' })}
    />
  );
}
```

#### Step 7: Import PermissionOverlay

```typescript
import { PermissionOverlay } from '@/presentation/components/layout/PermissionOverlay';
```

### Acceptance Criteria

| AC ID | Criterion | Verification |
|-------|-----------|--------------|
| AC-01-1 | ProjectContextProvider accepts `initialHandle` prop | Code inspection |
| AC-01-2 | Provider calls `handlePersistenceService.restoreHandle()` for FSA projects | Console log |
| AC-01-3 | If restoration succeeds, handle is used for adapter | No error |
| AC-01-4 | If restoration requires interaction, shows overlay | Browser test |
| AC-01-5 | If restoration fails, shows error message | Browser test |
| AC-01-6 | Handle is passed to `storageAdapterFactory.createAdapter()` | Code inspection |
| AC-01-7 | TypeScript compiles with 0 errors | `pnpm tsc --noEmit` |

### Verification Commands

```bash
# TypeScript check
pnpm tsc --noEmit

# Dev server
pnpm dev

# Console should show:
# [ProjectContext] Attempting FSA handle restoration
# [ProjectContext] FSA handle requires user interaction
# OR
# [ProjectContext] FSA handle restored successfully
```

---

## Key Service Files Reference

### HandlePersistenceService

**Location**: `src/infrastructure/filesystem/handle-persistence.ts`

```typescript
interface HandleRestoreResult {
  success: boolean;
  handle: FileSystemDirectoryHandle | null;
  error?: string;
  requiresUserInteraction: boolean;
  restoredFromMetadata?: StorageHandleMetadata;
}

// Methods to use:
persistHandle(projectId: string, handle: FileSystemDirectoryHandle, workspaceId?: 'ide'): Promise<void>;
restoreHandle(projectId: string): Promise<HandleRestoreResult>;
deleteHandle(projectId: string): Promise<void>;
```

### StorageAdapterFactory

**Location**: `src/infrastructure/filesystem/StorageAdapterFactory.ts`

```typescript
interface StorageOptions {
  projectId: string;
  storageType?: StorageType;
  handle?: FileSystemDirectoryHandle | null;  // ← THIS IS WHAT'S MISSING
  handleGetter?: FsaHandleGetter;
  directoryPath?: string;
}

// Usage:
storageAdapterFactory.createAdapter(options: StorageOptions): StorageAdapter;
```

### PermissionOverlay

**Location**: `src/presentation/components/layout/PermissionOverlay.tsx`

Verify it accepts:
- `projectId: string`
- `projectName: string`
- `onPermissionGranted: (handle: FileSystemDirectoryHandle) => void`
- `onCancel: () => void`

---

## Tool Constraints for dev-ext

```yaml
# ARCH-04-01
write: false        # No new files needed
edit: true          # Modify project-context.tsx
bash: true          # Run tsc, dev
task: false         # No delegation

# ARCH-04-02
write: false
edit: true          # Modify wizard + route
bash: true
task: false

# ARCH-04-03
write: false
edit: true          # May need overlay adjustments
bash: true
task: false

# ARCH-04-05
write: true         # Write test report
edit: false         # No code changes
bash: true          # Run tests
task: false
```

---

## Success Metrics

### Phase 1 Complete When:

| Metric | Target | Verification |
|--------|--------|--------------|
| TypeScript errors | 0 | `pnpm tsc --noEmit` |
| Project creation | Works | Manual browser test |
| Project loading | Works | Manual browser test |
| FSA handle persisted | Yes | Check IndexedDB |
| FSA handle restored | Yes | Console log |
| Silent restore (Chrome 122+) | Works | Page reload test |
| Permission overlay | Works | Clear storage test |
| Console errors | None | Browser DevTools |

### App Functional Checklist

- [ ] Create FSA project → No errors
- [ ] Navigate to project → File tree loads
- [ ] Reload page → No permission overlay (silent restore)
- [ ] Clear storage, reload → Permission overlay appears
- [ ] Grant permission → Project loads
- [ ] Create IndexedDB project → Works

---

## Rollback Plan

If ARCH-04-01 fails critically:

1. Restore OLD ProjectContext from `_bmad-ext/.archive/ProjectContext-2026-01-25.tsx`
2. Revert NEW context changes via git
3. Add OLD provider to routes temporarily
4. Investigate specific failure point
5. Document issue for next attempt

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PermissionOverlay props mismatch | Medium | Medium | Verify props first, create adapter if needed |
| Navigation state serialization | Low | High | Test handle serialization in Chrome 129+ |
| Race conditions in async restoration | Low | Medium | Use proper async/await sequencing |
| IndexedDB projects affected | Low | Low | Separate code path, FSA-specific logic |

---

## Time Estimates

| Story | Optimistic | Expected | Pessimistic |
|-------|------------|----------|-------------|
| ARCH-04-01 | 2h | 3h | 4h |
| ARCH-04-02 | 1h | 1.5h | 2h |
| ARCH-04-03 | 1h | 1.5h | 2h |
| ARCH-04-05 | 1h | 1.5h | 2h |
| **Phase 1 Total** | **5h** | **7.5h** | **10h** |
| ARCH-04-04 | 2h | 2.5h | 3h |
| ARCH-04-06 | 0.5h | 1h | 1.5h |
| **Full Epic** | **7.5h** | **11h** | **14.5h** |

---

## Handoff Signature

```yaml
artifact_id: "hnd_20260125_200000_epic_arch_04_v2"
artifact_type: "handoff"
version: "2.0"
source_agent: "architect-ext"
target_agents: ["sprint-manager", "dev-ext"]
status: "READY_FOR_SPRINT_PLANNING"
priority: "P0"
blocking: true

epic_file: "_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md"
estimated_hours: 8-12
critical_story: "ARCH-04-01"
stories_count: 6

parent_documents:
  - "ADR-034-project-centric-architecture-2026-01-20.md"
  - "ADR-034-AMENDMENT-001-platform-first-2026-01-21.md"
  - "new-fundamental-truths.md"

supersedes:
  - "HOOKS-FIX-01"
  - "HOOKS-FIX-02"

created_at: "2026-01-25T20:00:00+07:00"
updated_at: "2026-01-25T21:30:00+07:00"
```

---

## Message to Sprint-Manager

**This is NOT another patch. This is the completion of the ADR-034 migration.**

EPIC-ARCH-01 through EPIC-ARCH-03 built the NEW architecture (ProjectContext, FeaturePlugins, PluginLayout) but **left FSA handle integration incomplete**. The NEW context doesn't know how to get, store, or restore FSA handles.

**ARCH-04-01 is the minimum viable fix.** Once FSA handle lifecycle is integrated into ProjectContextProvider, the app will work.

### Execution Order

1. **ARCH-04-01** (GATE - start immediately)
2. **ARCH-04-02** and **ARCH-04-03** (can run in parallel after 01)
3. **ARCH-04-05** (validation - requires 01, 02, 03)
4. **ARCH-04-04** and **ARCH-04-06** (cleanup - after 05)

### Start Command

```
Assign dev-ext to ARCH-04-01 now.
Context: _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
Handoff: _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md
```
