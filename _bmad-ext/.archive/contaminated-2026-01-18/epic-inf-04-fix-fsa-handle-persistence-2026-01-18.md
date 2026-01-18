---
# EPIC-INF-04: Fix FSA Handle Persistence
# ════════════════════════════════════════════════════════════════

epic_id: "EPIC-INF-04"
title: "Fix FSA Handle Persistence - Restore Handles on Page Reload"
status: "in_progress"
priority: "P0"
started_at: "2026-01-22T08:00:00+07:00"

# ════════════════════════════════════════════════════════════════
# PROBLEM STATEMENT
# ════════════════════════════════════════════════════════════════

problem: |
  ## Root Cause Analysis
  
  Despite PS-04 implementing `HandlePersistenceService` with Chrome 122+ and 129+ support,
  projects still fail to persist on page reload. The handle is never restored because:
  
  1. **Route loader doesn't restore handle**: `ide.$projectId.tsx` loader gets project from Dexie
     but never calls `handlePersistenceService.restoreHandle(projectId)`
  
  2. **restoreAccess() uses null state**: The `restoreAccess` function in `use-file-ops-slice.ts`
     (line 265-297) uses `directoryHandle` from React state, which is null on page reload
  
  3. **No initialization flow**: The handle persistence service exists but is disconnected from
     the route/component lifecycle
  
  ## User Impact
  
  - Users must re-select their project folder every time they reload the page
  - No silent restore happens even though the handle metadata is stored in IndexedDB
  - The "Restore Access" button in PermissionOverlay doesn't work because directoryHandle is null

# ════════════════════════════════════════════════════════════════
# SOLUTION APPROACH
# ════════════════════════════════════════════════════════════════

solution: |
  ## Phase 1: Restore Handle in Route Component (Immediate Fix)
  
  Modify `ide.$projectId.tsx` to:
  1. Add `useEffect` that calls `handlePersistenceService.restoreHandle(projectId)` on mount
  2. Store the restored handle in a ref (for sync manager)
  3. Update `directoryHandle` state so UI components can use it
  
  ## Phase 2: Initialize Storage Adapter with Restored Handle
  
  Modify `use-file-loader-slice.ts` to:
  1. Accept an optional `initialHandle` parameter
  2. If handle is restored, initialize the LocalFSAdapter with it immediately
  3. Skip the "prompt" permission state if handle is already restored
  
  ## Phase 3: Update Permission Overlay Logic
  
  Modify `PermissionOverlay` and `restoreAccess` to:
  1. Use `handlePersistenceService.restoreHandle()` instead of relying on state
  2. Handle Chrome 129+ structuredClone case (true silent restore)
  3. Update FSAHandleRecord permission status correctly

# ════════════════════════════════════════════════════════════════
# STORIES (Execution Order)
# ════════════════════════════════════════════════════════════════

stories:
  - id: "INF-04-01"
    title: "Add handle restoration in ide.$projectId.tsx useEffect"
    status: "pending"
    effort: "2h"
    priority: "P0"
    description: |
      Add useEffect that restores FSA handle on component mount using handlePersistenceService.
      
      Files to modify:
      - src/routes/ide.$projectId.tsx
      
      Acceptance criteria:
      - [ ] useEffect calls restoreHandle(projectId) on mount
      - [ ] Restored handle stored in ref for sync manager
      - [ ] No TypeScript errors
      - [ ] Dev server runs successfully
    depends_on: []

  - id: "INF-04-02"
    title: "Initialize LocalFSAdapter with restored handle"
    status: "pending"
    effort: "2h"
    priority: "P0"
    description: |
      Modify use-file-loader-slice to accept and use restored handle.
      
      Files to modify:
      - src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts
      
      Acceptance criteria:
      - [ ] Loader slice accepts initialHandle parameter
      - [ ] LocalFSAdapter initialized with restored handle if provided
      - [ ] No prompts if handle was silently restored
      - [ ] No TypeScript errors
    depends_on: ["INF-04-01"]

  - id: "INF-04-03"
    title: "Update restoreAccess to use handlePersistenceService"
    status: "pending"
    effort: "2h"
    priority: "P0"
    description: |
      Fix restoreAccess function to use handlePersistenceService instead of null state.
      
      Files to modify:
      - src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts
      
      Acceptance criteria:
      - [ ] restoreAccess calls handlePersistenceService.restoreHandle()
      - [ ] Handles Chrome 129+ structuredClone case
      - [ ] Updates FSAHandleRecord permission status
      - [ ] No TypeScript errors
    depends_on: ["INF-04-01"]

  - id: "INF-04-04"
    title: "Test end-to-end handle persistence flow"
    status: "pending"
    effort: "2h"
    priority: "P0"
    description: |
      Verify the complete flow works: open project → reload → handle restored → sync works.
      
      Testing approach:
      - Manual browser testing
      - Check console logs for handle restoration
      - Verify file tree loads without user prompt
      
      Acceptance criteria:
      - [ ] Handle restored on page reload without prompt (Chrome 129+)
      - [ ] Permission prompt shown only when needed (older Chrome)
      - [ ] File tree loads correctly after restoration
      - [ ] No errors in console
    depends_on: ["INF-04-02", "INF-04-03"]

# ════════════════════════════════════════════════════════════════
# TECHNICAL DETAILS
# ════════════════════════════════════════════════════════════════

architecture:
  affected_files:
    - "src/routes/ide.$projectId.tsx"
    - "src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts"
    - "src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts"
    - "src/infrastructure/filesystem/handle-persistence.ts"
    
  new_files: []
  
  deleted_files: []

dependencies:
  - "handle-persistence.ts"  # Already exists, needs to be integrated
  - "fsa-handle-helpers.ts"  # Already exists, helper functions

risks:
  - "Risk: React strict mode may cause double restoration"
    mitigation: "Use ref to track if handle already restored"
  - "Risk: Chrome version detection may be wrong"
    mitigation: "Add fallback to user prompt if silent restore fails"
  - "Risk: Race condition with sync manager initialization"
    mitigation: "Initialize LocalFSAdapter in useEffect after handle restored"

# ════════════════════════════════════════════════════════════════
# VERIFICATION CHECKLIST
# ════════════════════════════════════════════════════════════════

verification:
  - TypeScript: "pnpm tsc --noEmit"
  - Build: "pnpm build"
  - Tests: "pnpm vitest run"
  - Manual:
    - Open FSA project in IDE
    - Reload page
    - Verify handle is restored without prompt (Chrome 129+)
    - Verify file tree loads correctly
