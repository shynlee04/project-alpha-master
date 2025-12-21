# Epic 13: Terminal & Sync Stability

**Goal:** Fix critical bugs blocking the 14-step validation sequence, ensuring terminal commands work correctly and sync is reliable.

**Priority:** 🔴 P0 - Highest  
**Status:** Ready for Implementation  
**Added By:** Course Correction v5 (2025-12-20)  
**Reference:** [Sprint Change Proposal v5](../_bmad-output/sprint-change-proposal-v5-2025-12-20.md)

**Bug Severity Matrix:**

| ID | Bug | Severity | Blocks Validation |
|----|-----|----------|-------------------|
| BUG-01 | Terminal CWD Mismatch | 🔴 CRITICAL | Steps 4, 5, 8 |
| BUG-02 | Auto-Sync Not Triggering | 🟠 HIGH | Step 3 |
| BUG-03 | Sync Status Opacity | 🟡 MEDIUM | - |
| BUG-04 | Permission Persistence | 🟡 MEDIUM | Step 2 |
| BUG-05 | File Tree State Reset | 🟡 MEDIUM | - |

---

### Story 13-1: Fix Terminal Working Directory

As a **user**,  
I want **the terminal to start in my project directory**,  
So that **npm/pnpm commands can find package.json**.

**Priority:** P0  
**Story Points:** 2

**Acceptance Criteria:**

- **AC-13-1-1:** Terminal spawns with CWD set to mounted project path using `SpawnOptions.cwd`
- **AC-13-1-2:** Running `ls` in terminal shows project files, not WebContainer root
- **AC-13-1-3:** `npm install` executes successfully from project root
- **AC-13-1-4:** `pnpm create @tanstack/start@latest` completes without hanging

**Implementation Tasks:**
- [ ] T1: Modify `terminal-adapter.ts` to accept `projectPath` parameter in `startShell()`
- [ ] T2: Update `XTerminal.tsx` to pass project path from WorkspaceContext
- [ ] T3: Ensure shell spawns AFTER project mount completes
- [ ] T4: Add integration test for terminal CWD verification

**Files to Modify:**
- `src/lib/webcontainer/terminal-adapter.ts`
- `src/components/ide/XTerminal.tsx`
- `src/lib/workspace/WorkspaceContext.tsx`

---

### Story 13-2: Fix Auto-Sync on Project Load

As a **user**,  
I want **files to automatically sync when I open a project**,  
So that **I don't have to manually click "Sync Now"**.

**Priority:** P0  
**Story Points:** 3

**Acceptance Criteria:**

- **AC-13-2-1:** Opening a project triggers automatic sync to WebContainer
- **AC-13-2-2:** Sync waits for WebContainer to be fully ready before starting
- **AC-13-2-3:** UI shows syncing indicator during auto-sync
- **AC-13-2-4:** Files are available in terminal after sync completes

**Implementation Tasks:**
- [ ] T1: Add `webContainerReady` dependency to `useInitialSync` hook
- [ ] T2: Expose `isReady` state from WebContainer manager
- [ ] T3: Add guard to prevent sync before container boot
- [ ] T4: Emit `sync:completed` event after initial sync

**Files to Modify:**
- `src/lib/workspace/hooks/useInitialSync.ts`
- `src/lib/webcontainer/manager.ts`

---

### Story 13-3: Add Sync Progress Indicator

As a **user**,  
I want **to see sync progress with file count**,  
So that **I know when it's safe to work**.

**Priority:** P1  
**Story Points:** 2

**Acceptance Criteria:**

- **AC-13-3-1:** SyncStatusIndicator shows "Syncing X of Y files" during sync
- **AC-13-3-2:** Current file being synced is visible in tooltip or expanded view
- **AC-13-3-3:** Warning shown if user tries to edit during active sync
- **AC-13-3-4:** Progress updates in real-time via event bus

**Implementation Tasks:**
- [ ] T1: Add `sync:progress` event type with `{ current, total, currentFile }` payload
- [ ] T2: Emit progress events from SyncManager during file iteration
- [ ] T3: Update SyncStatusIndicator to consume progress events
- [ ] T4: Add "Edit during sync" warning dialog

**Files to Modify:**
- `src/lib/filesystem/sync-manager.ts`
- `src/components/ide/SyncStatusIndicator.tsx`
- `src/lib/events/workspace-events.ts`

---

### Story 13-4: Preserve File Tree State

As a **user**,  
I want **the file tree to maintain my expanded folders**,  
So that **I don't lose context after file operations**.

**Priority:** P1  
**Story Points:** 2

**Acceptance Criteria:**

- **AC-13-4-1:** Creating a file preserves expanded folder state
- **AC-13-4-2:** Saving a file preserves expanded folder state
- **AC-13-4-3:** New files are auto-selected in tree
- **AC-13-4-4:** Parent folder of new file auto-expands

**Implementation Tasks:**
- [ ] T1: Add `expandedPaths: Set<string>` to FileTree state
- [ ] T2: Persist expanded paths to WorkspaceContext
- [ ] T3: Update `handleFileCreated` to preserve and expand parent path
- [ ] T4: Update `handleFileDeleted` to clean up removed paths

**Files to Modify:**
- `src/components/ide/FileTree/index.tsx`
- `src/components/ide/FileTree/TreeNode.tsx`

---

### Story 13-5: Improve Permission Restoration

As a **user**,  
I want **my project access to persist between sessions**,  
So that **I don't have to re-authorize frequently**.

**Priority:** P1  
**Story Points:** 3

**Acceptance Criteria:**

- **AC-13-5-1:** Persistent permissions used if available (Chrome 122+)
- **AC-13-5-2:** "Restore Access" button shown for handles with `prompt` state
- **AC-13-5-3:** Permission state tracked in project metadata
- **AC-13-5-4:** Graceful fallback for non-supporting browsers

**Implementation Tasks:**
- [ ] T1: Add `queryPermission()` check on project load
- [ ] T2: Show "Restore Access" UI for `prompt` state
- [ ] T3: Track permission state in ProjectStore metadata
- [ ] T4: Add feature detection for persistent permissions API

**Files to Modify:**
- `src/lib/filesystem/permission-lifecycle.ts`
- `src/components/ide/FileTree/index.tsx`
- `src/lib/workspace/project-store.ts`

---

### Story 13-6: Fix Preview in New Tab

As a **user**,  
I want **the preview to work when opened in a new browser tab**,  
So that **I can view my application in a full-size window**.

**Priority:** P1  
**Story Points:** 2  
**Added:** 2025-12-20 (Course Correction - Manual Testing)

**Acceptance Criteria:**

- **AC-13-6-1:** "Open in new tab" button opens preview URL correctly
- **AC-13-6-2:** WebContainer connection established in external tab
- **AC-13-6-3:** No "Cannot GET /webcontainer/connect" error
- **AC-13-6-4:** COOP/COEP headers working across tabs
- **AC-13-6-5:** SharedArrayBuffer isolation maintained

**Implementation Tasks:**
- [ ] T1: Research WebContainer external tab connection requirements
- [ ] T2: Create route handler for `/webcontainer/connect/:token`
- [ ] T3: Verify COOP/COEP header propagation to new tabs
- [ ] T4: Test preview opens correctly in separate tab

**Files to Modify:**
- `src/routes/webcontainer.connect.$token.tsx` (NEW)
- `vite.config.ts` (verify headers)
- `src/components/ide/PreviewPanel/index.tsx` (update link)

---

### Implementation Order

```
Day 1: Story 13-1 (Terminal CWD) - Unblocks validation steps 4-5-8 ✅ DONE
Day 1: Story 13-2 (Auto-Sync) - Fixes step 3
Day 2: Story 13-3 (Progress) - UX improvement
Day 2: Story 13-4 (Tree State) - UX improvement  
Day 3: Story 13-5 (Permissions) - Reliability improvement
Day 3: Story 13-6 (Preview Tab) - UX improvement
```

---
