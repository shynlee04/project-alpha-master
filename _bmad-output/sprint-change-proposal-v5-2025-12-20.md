# Sprint Change Proposal v5: Critical Bug Fixes & Stability

> **Date:** 2025-12-20  
> **Status:** DRAFT - Pending Approval  
> **Trigger:** User-reported bugs blocking 14-step validation sequence  
> **Author:** BMAD Correct-Course Workflow

---

## Executive Summary

This Sprint Change Proposal addresses **6 critical bug categories** identified during end-to-end testing that block progression through the 14-step validation sequence. The primary blocker is **BUG-01: Terminal Root Mismatch**, which prevents basic npm/pnpm commands from working.

### Bug Severity Matrix

| ID | Bug | Severity | Impact | Blocks Validation Steps |
|----|-----|----------|--------|-------------------------|
| BUG-01 | Terminal CWD Mismatch | 🔴 CRITICAL | npm commands fail | 4, 5, 8 |
| BUG-02 | Auto-Sync Not Triggering | 🟠 HIGH | Manual sync required | 3 |
| BUG-03 | Sync Status Opacity | 🟡 MEDIUM | User confusion | - |
| BUG-04 | Permission Persistence | 🟡 MEDIUM | Frequent re-auth | 2 |
| BUG-05 | File Tree State Reset | 🟡 MEDIUM | Lost navigation context | - |
| BUG-06 | No Reverse Sync (By Design) | 🟢 LOW | User education needed | - |

### Recommendation

**Create Epic 13: Critical Bug Fixes** as highest priority, pausing Epic 11 (Code Splitting) until stability is achieved.

---

## Change Analysis

### Current State

| Epic | Status | Notes |
|------|--------|-------|
| Epic 1-5 | ✅ Complete | Foundation established |
| Epic 10 | ✅ Complete | Event Bus architecture |
| Epic 11 | 🔄 In Progress | Stories 11-1 to 11-4 completed |
| Epic 12 | ⏳ Backlog | AI Tool Facades |
| Epic 6 | ⏳ Backlog | AI Agent Integration |

### Impact Assessment

- **Epic 11:** Can continue in parallel as code splitting doesn't address these bugs
- **Epic 6/12:** Blocked until BUG-01 fixed (AI agents need working terminal)
- **Validation Sequence:** Steps 4-5-8 blocked until terminal works

---

## Detailed Bug Analysis

### BUG-01: Terminal Root vs Project Root Mismatch 🔴

**Symptom:**
```bash
# User runs from project with package.json at root
$ pnpm create @tanstack/start@latest
# Stuck at "Initializing git repository..."

$ npm install  
# Error: Cannot find package.json
```

**Root Cause:**
WebContainer `jsh` shell spawns at `/` (container root), not at the mounted project directory.

**Research-Validated Fix:**
```typescript
// src/lib/webcontainer/terminal-adapter.ts

// Before:
await this.webContainer.spawn('jsh');

// After:
await this.webContainer.spawn('jsh', { 
  cwd: projectPath  // Use SpawnOptions.cwd (v1.2.0+)
});
```

**Source:** Context7/Deepwiki research confirmed `SpawnOptions.cwd` added in WebContainer API v1.2.0.

**Files to Modify:**
- `src/lib/webcontainer/terminal-adapter.ts` - Add `projectPath` param to `startShell()`
- `src/components/ide/XTerminal.tsx` - Pass project path from context
- `src/lib/workspace/WorkspaceContext.tsx` - Ensure project path available

---

### BUG-02: Auto-Sync Not Triggering on First Load 🟠

**Symptom:**
After entering a project, files don't automatically sync to WebContainer. User must manually click "Sync Now".

**Root Cause Hypothesis:**
Timing issue in `useInitialSync.tsx` - sync may fire before WebContainer is fully booted, or condition check fails.

**Proposed Fix:**
```typescript
// src/lib/workspace/hooks/useInitialSync.ts

useEffect(() => {
  if (!projectId || !handle) return;
  if (!webContainerReady) return; // Add guard for container readiness
  
  const syncOnMount = async () => {
    await syncManager.syncToWebContainer();
    eventBus.emit('sync:completed', { projectId, filesChanged: -1 });
  };
  
  syncOnMount();
}, [projectId, handle, webContainerReady]); // Add dependency
```

**Files to Modify:**
- `src/lib/workspace/hooks/useInitialSync.ts` - Add WebContainer ready check
- `src/lib/webcontainer/manager.ts` - Expose `isReady` state

---

### BUG-03: Sync Status Transparency 🟡

**Symptom:**
Users can't tell:
- How many files remain to sync
- Whether sync is complete
- If large projects (node_modules, caches) are safe to work on mid-sync

**Proposed Fix:**
1. Add progress events: `sync:progress { current, total, currentFile }`
2. Add UI indicator showing "Syncing X of Y files"
3. Add warning banner during sync: "Editing during sync may cause conflicts"

**Files to Modify:**
- `src/lib/filesystem/sync-manager.ts` - Emit progress events
- `src/components/ide/SyncStatusIndicator.tsx` - Show progress
- `src/lib/events/workspace-events.ts` - Add progress event type

---

### BUG-04: Permission Persistence Issues 🟡

**Symptom:**
Users must frequently re-authorize project access, even on same browser/port.

**Root Cause:**
- FSA handles stored in IndexedDB but permission state not persisted
- Chrome 122+ supports persistent permissions but not utilized

**Proposed Fix:**
```typescript
// src/lib/filesystem/permission-lifecycle.ts

async function restorePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const status = await handle.queryPermission({ mode: 'readwrite' });
  
  if (status === 'granted') {
    return true; // Persistent permission still valid
  }
  
  if (status === 'prompt') {
    // Need user gesture - show "Restore Access" button
    return false;
  }
  
  return false; // Denied
}
```

**Files to Modify:**
- `src/lib/filesystem/permission-lifecycle.ts` - Add persistent permission check
- `src/components/ide/FileTree/index.tsx` - Add "Restore Access" button
- `src/lib/workspace/project-store.ts` - Track permission state

---

### BUG-05: File Tree State Reset 🟡

**Symptom:**
- After creating a new file, expanded folders collapse
- After saving a file, tree state resets
- Users lose navigation context

**Root Cause:**
`FileTree.tsx` likely rebuilds state from scratch on any file operation instead of preserving expanded paths.

**Proposed Fix:**
```typescript
// src/components/ide/FileTree/index.tsx

interface FileTreeState {
  expandedPaths: Set<string>;
  selectedPath: string | null;
}

// Preserve state across operations
const [treeState, setTreeState] = useState<FileTreeState>({
  expandedPaths: new Set(),
  selectedPath: null,
});

// On file operations, preserve expanded paths
const handleFileCreated = (newPath: string) => {
  const parentPath = getParentPath(newPath);
  setTreeState(prev => ({
    ...prev,
    expandedPaths: new Set([...prev.expandedPaths, parentPath]),
    selectedPath: newPath,
  }));
};
```

**Files to Modify:**
- `src/components/ide/FileTree/index.tsx` - Preserve expansion state
- `src/components/ide/FileTree/TreeNode.tsx` - Use persisted state

---

### BUG-06: No Reverse Sync (By Design) 🟢

**Symptom:**
Changes made inside WebContainer (e.g., `npm install` creating `node_modules`) don't sync back to local drive.

**Status:** This is **by design**. Local FS is source of truth.

**Action:** Update AGENTS.md and add user-facing documentation explaining:
1. `node_modules` regenerates in WebContainer sandbox
2. Local FS is authoritative
3. Git and npm caches won't sync back

**Files to Modify:**
- `AGENTS.md` - Already updated in previous session
- Add tooltip in UI when sync completes

---

## Proposed Epic 13: Critical Bug Fixes

### Epic Overview

**Epic 13: Terminal & Sync Stability**

**Goal:** Fix critical bugs blocking the 14-step validation sequence, ensuring terminal commands work correctly and sync is reliable.

**Priority:** 🔴 P0 - Highest

### Stories

#### Story 13-1: Fix Terminal Working Directory

As a **user**,  
I want **the terminal to start in my project directory**,  
So that **npm/pnpm commands can find package.json**.

**Acceptance Criteria:**
- [ ] Terminal spawns with CWD set to mounted project path
- [ ] `ls` in terminal shows project files, not WebContainer root
- [ ] `npm install` executes successfully
- [ ] `pnpm create @tanstack/start@latest` completes without hanging

**Implementation:**
```typescript
// terminal-adapter.ts
async startShell(projectPath?: string): Promise<void> {
  this.shellProcess = await this.webContainer.spawn('jsh', {
    cwd: projectPath || '/',
    terminal: { cols: this.cols, rows: this.rows }
  });
}
```

**Story Points:** 2

---

#### Story 13-2: Fix Auto-Sync on Project Load

As a **user**,  
I want **files to automatically sync when I open a project**,  
So that **I don't have to manually click "Sync Now"**.

**Acceptance Criteria:**
- [ ] Opening a project triggers automatic sync
- [ ] Sync waits for WebContainer to be ready
- [ ] UI shows syncing indicator during auto-sync
- [ ] Files are available in terminal after sync completes

**Story Points:** 3

---

#### Story 13-3: Add Sync Progress Indicator

As a **user**,  
I want **to see sync progress with file count**,  
So that **I know when it's safe to work**.

**Acceptance Criteria:**
- [ ] SyncStatusIndicator shows "Syncing X of Y files"
- [ ] Current file being synced is visible
- [ ] Warning shown if user tries to edit during sync
- [ ] Progress updates in real-time

**Story Points:** 2

---

#### Story 13-4: Preserve File Tree State

As a **user**,  
I want **the file tree to maintain my expanded folders**,  
So that **I don't lose context after file operations**.

**Acceptance Criteria:**
- [ ] Creating a file preserves expanded state
- [ ] Saving a file preserves expanded state
- [ ] New files are auto-selected
- [ ] Parent folder of new file auto-expands

**Story Points:** 2

---

#### Story 13-5: Improve Permission Restoration

As a **user**,  
I want **my project access to persist between sessions**,  
So that **I don't have to re-authorize frequently**.

**Acceptance Criteria:**
- [ ] Persistent permissions used if available (Chrome 122+)
- [ ] "Restore Access" button for prompt state
- [ ] Permission state tracked in project metadata
- [ ] Fallback for non-supporting browsers

**Story Points:** 3

---

### Implementation Order

```
Day 1: Story 13-1 (Terminal CWD) - Unblocks validation steps 4-5-8
Day 1: Story 13-2 (Auto-Sync) - Fixes step 3
Day 2: Story 13-3 (Progress) - UX improvement
Day 2: Story 13-4 (Tree State) - UX improvement  
Day 3: Story 13-5 (Permissions) - Reliability improvement
```

---

## Governance Document Updates

### epics.md Changes

**Add Epic 13 to Epic List (line ~179):**
```markdown
13. **Epic 13: Terminal & Sync Stability** - Critical bug fixes for terminal CWD, auto-sync, and UX *(NEW - Course Correction v5)*
```

**Update Epic Status Summary table:**
```markdown
| Epic 13 | ⏳ Ready | 0/5 | - | **P0** | Terminal/Sync Bugs (v5) |
```

### architecture.md Changes

Add to "Known Issues" section:
```markdown
### Terminal Integration
- Terminal uses `SpawnOptions.cwd` to set working directory (WebContainer API v1.2.0+)
- Shell must be spawned AFTER project mount completes
- Project path must be passed through context to terminal component
```

### AGENTS.md Changes (Already Applied)

Lines 134-136 already contain:
```markdown
8. **Terminal Working Directory**: Pass `projectPath` to `startShell()`
9. **No Reverse Sync**: WebContainer changes don't sync back (by design)
10. **Sync Exclusions**: `.git`, `node_modules` excluded
```

---

## Validation Checklist

After Epic 13 completion, verify:

- [ ] Step 3: Files sync automatically on project open
- [ ] Step 4: `npm install` executes successfully
- [ ] Step 5: `npm run dev` starts dev server
- [ ] Step 8: Hot reload works after file edit
- [ ] File tree state persists across operations
- [ ] Permissions persist across browser sessions (Chrome 122+)

---

## Approval Request

**Questions for Product Owner:**

1. **Priority:** Agree to prioritize Epic 13 over Epic 11 continuation?
2. **Scope:** Include all 5 stories or focus on BUG-01 only as MVP?
3. **Testing:** Manual validation sufficient or need automated tests?

**Recommendation:** Approve full Epic 13 scope. BUG-01 alone unblocks terminal, but other bugs significantly impact user experience and will cause repeated support issues.

---

*Generated by BMAD Correct-Course Workflow - 2025-12-20*
