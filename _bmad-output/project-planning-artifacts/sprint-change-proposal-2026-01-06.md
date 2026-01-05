# Sprint Change Proposal: User Journey Lifecycle Gaps

**Generated:** 2026-01-06T02:45:00+07:00  
**Triggered By:** Double-Check Analysis of User Journey Lifecycle  
**Scope Classification:** **MODERATE** (Backlog reorganization + PO/SM coordination)

---

## 1. Issue Summary

### Problem Statement
During a comprehensive "/double-check" analysis of the file synchronization system, critical gaps were discovered in the complete user journey lifecycle. The analysis covered:
- Hub → Project → Workspace entry flow
- IDE ↔ Notes bidirectional workspace switching
- Mount state with/without filesystem
- Hot-reload reactivity for changes
- File types handling
- Incremental vs full sync strategy
- Status indicators and visual feedback
- Mobile device support

### Evidence
1. **SyncStatusPanel.tsx (Lines 94-125)** uses MOCK DATA - no real sync events
2. **NoteFolderBridge.importDirectory()** always does FULL SCAN - no incremental sync
3. **showDirectoryPicker()** throws on mobile with no graceful fallback
4. **Notes→IDE not reactive** - edits don't reflect cross-workspace
5. **No save-to-filesystem** - Note edits lost when switching workspaces

### Discovery Context
- Discovered during E2E validation framework setup (V-001)
- Root cause analysis traced event flow and data persistence
- 9 distinct user journey angles analyzed

---

## 2. Impact Analysis

### Epic Impact
| Epic | Impact Level | Description |
|------|--------------|-------------|
| E-22 (Production Hardening) | HIGH | Mobile FSA and sync status are core reliability |
| E-23 (UX/UI Modernization) | MEDIUM | Status indicators and reactivity affect UX |
| E-51 (Platform Unification) | HIGH | Cross-workspace state is core unification |
| CRIT-002 (Notes Files) | CRITICAL | Existing story needs expansion |

### Story Impact
| Existing Story | Status | Required Changes |
|----------------|--------|------------------|
| S-007 (Note-Folder Bridge) | IN_PROGRESS | Add incremental sync, bidirectional save |
| S-008 (Wire Bridge to Init) | BACKLOG | Add reactivity layer for cross-workspace |
| NEW | - | SyncStatusPanel wiring to real events |
| NEW | - | Mobile FSA graceful degradation |
| NEW | - | Per-file sync indicators |

### Artifact Conflicts
- `SyncStatusPanel.tsx` - Currently has TODO placeholder
- `NoteFolderBridge` - Recently updated but missing incremental mode
- `unified-workspace-context.ts` - Has sync hooks but not wired to UI

### Technical Impact
- Event bus subscription pattern needs extension
- File watching API required for incremental sync
- Cross-workspace event propagation for reactivity

---

## 3. Recommended Approach

### Chosen Path: **Direct Adjustment**
Modify/add stories within existing plan without rollback or MVP scope change.

### Rationale
1. Architecture for event-driven sync exists (UnifiedWorkspaceContext)
2. Core infrastructure (event bus, workspace stores) is sound
3. Gaps are primarily at UI wiring and edge case handling
4. No fundamental design changes needed

### Effort Estimate
| Priority | Stories | Hours | Risk |
|----------|---------|-------|------|
| P0 | 4 | 20h | LOW |
| P1 | 4 | 17h | MEDIUM |
| P2 | 3 | 13h | LOW |
| **TOTAL** | **11** | **50h** | - |

### Timeline Impact
- Add Phase 0.5 before current Phase 2
- Estimated +3 days to overall sprint
- Parallelize with governance stories where possible

---

## 4. Detailed Change Proposals

### Phase 0.5: User Journey Critical Fixes (NEW)

#### Story UJ-001: Wire SyncStatusPanel to Real Events
**Priority:** P0  
**Hours:** 4h  
**Type:** IMPLEMENTATION

**OLD:** Mock data in useEffect  
**NEW:** Subscribe to crossWorkspaceEventBus 'SyncProgress', 'SyncComplete', 'SyncError' events

```typescript
// OLD (lines 94-125)
const mockSyncState: SyncQueueState = { ... mock ... }
setSyncState(mockSyncState);

// NEW
useEffect(() => {
  const handleSyncProgress = (e) => setSyncState(s => ({...s, operations: e.operations}));
  const unsub1 = crossWorkspaceEventBus.on('SyncProgress', handleSyncProgress);
  const unsub2 = crossWorkspaceEventBus.on('SyncComplete', handleComplete);
  return () => { unsub1(); unsub2(); };
}, []);
```

**Acceptance Criteria:**
- [ ] SyncStatusPanel shows real sync operations
- [ ] Progress bar updates during sync
- [ ] Completed/failed status accurate
- [ ] Retry button triggers real retry

---

#### Story UJ-002: Mobile FSA Graceful Degradation
**Priority:** P0  
**Hours:** 2h  
**Type:** IMPLEMENTATION

**OLD:** Direct call to window.showDirectoryPicker()  
**NEW:** Feature detection with fallback UI

```typescript
// OLD
const handle = await window.showDirectoryPicker({ mode: 'readwrite' });

// NEW
const isFSASupported = 'showDirectoryPicker' in window;
if (!isFSASupported) {
  toast.info("Folder mounting requires a desktop browser", {
    description: "Notes work without mounting - data saved locally"
  });
  return;
}
```

**Acceptance Criteria:**
- [ ] No error thrown on mobile
- [ ] Helpful message explains limitation
- [ ] Notes workspace usable without mount
- [ ] Tested on iOS Safari and Android Chrome

---

#### Story UJ-003: Notes Save to Filesystem (Bidirectional)
**Priority:** P0  
**Hours:** 8h  
**Type:** IMPLEMENTATION

**OLD:** One-way import only  
**NEW:** NoteFolderBridge.saveNoteToFile() method + auto-save hook

```typescript
// NEW export method
async saveNoteToFile(noteId: string, content: string): Promise<void> {
  const fileHandle = await this.getFileHandle(noteId);
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  emitEvent('NoteSavedToFS', { noteId, timestamp: Date.now() });
}
```

**Acceptance Criteria:**
- [ ] Note edits persist to .md file
- [ ] Auto-save debounced (2s delay)
- [ ] Dirty indicator shows unsaved changes
- [ ] Manual save button available

---

#### Story UJ-004: Cross-Workspace Reactivity
**Priority:** P0  
**Hours:** 6h  
**Type:** IMPLEMENTATION

**OLD:** No reactivity - manual refresh required  
**NEW:** Event subscription + store update on workspace switch

```typescript
// In NotesPage or global hook
useStoreEvent(STORE_EVENTS.FILE_SAVED, (payload) => {
  if (payload.workspaceId !== 'notes') {
    // File saved in IDE - refresh notes list
    refreshNotesFromFilesystem();
  }
});

useStoreEvent(STORE_EVENTS.NOTE_SAVED, (payload) => {
  // Note saved - emit for IDE to pick up
  emitStoreEvent(STORE_EVENTS.FILE_SAVED, { path: payload.filePath });
});
```

**Acceptance Criteria:**
- [ ] IDE file save reflects in Notes within 1s
- [ ] Note save reflects in IDE file tree within 1s
- [ ] No duplicate event loops
- [ ] Works with incremental sync

---

### Phase 0.5 P1 Stories

#### Story UJ-005: Incremental Sync with File Watching
**Priority:** P1  
**Hours:** 6h  

**Acceptance Criteria:**
- [ ] Only changed files synced on subsequent mounts
- [ ] File watcher detects external changes
- [ ] Performance: <100ms for 1 file change vs full scan

---

#### Story UJ-006: Per-File Sync Indicator in FileTree
**Priority:** P1  
**Hours:** 4h  

**Acceptance Criteria:**
- [ ] ✓ icon next to synced files
- [ ] ↻ icon next to syncing files
- [ ] ⚠ icon next to failed files
- [ ] Status updates in real-time

---

#### Story UJ-007: Multi-Format File Type Support
**Priority:** P1  
**Hours:** 4h  

**Acceptance Criteria:**
- [ ] .txt files import as plaintext notes
- [ ] Code files show in Monaco preview
- [ ] Images show as embeds
- [ ] Unsupported files show graceful message

---

#### Story UJ-008: Permission Restoration Flow
**Priority:** P1  
**Hours:** 3h  

**Acceptance Criteria:**
- [ ] Returning to project prompts for permission
- [ ] Clear UI explains why permission needed
- [ ] "Remember for session" option works
- [ ] Graceful handling of denied permission

---

### Phase 0.5 P2 Stories

#### Story UJ-009: File Count Progress During Sync
**Priority:** P2  
**Hours:** 2h  

#### Story UJ-010: Cancel/Pause Sync Button
**Priority:** P2  
**Hours:** 3h  

#### Story UJ-011: Conflict Resolution UI
**Priority:** P2  
**Hours:** 8h  

---

## 5. Implementation Handoff

### Change Scope: **MODERATE**

### Routing
| Recipient | Stories | Responsibility |
|-----------|---------|----------------|
| Dev Agent | UJ-001, UJ-003, UJ-004, UJ-005, UJ-006 | Implementation |
| UX Review | UJ-002, UJ-007, UJ-008 | Verify patterns match design system |
| SM Agent | ALL | Sprint status tracking |

### Updated Sprint Structure

```yaml
phases:
  phase_0_5:  # NEW
    name: "User Journey Critical Fixes"
    days: [0, 1]  # Before Phase 1
    stories: [UJ-001, UJ-002, UJ-003, UJ-004]
    hours: 20
    
  phase_1:  # Stories remain unchanged
    ...
    
  phase_2:  # Merge with UJ-005 through UJ-008
    ...
```

### Success Criteria
1. All P0 user journey gaps resolved
2. Mobile users can use Notes without error
3. Cross-workspace sync is reactive
4. SyncStatusPanel shows real data
5. Note edits persist to filesystem

---

## Approval

**Status:** AWAITING_USER_APPROVAL

To approve: Reply with "APPROVED" or "y"  
To modify: Specify changes needed  
To reject: Reply with "REJECT" with rationale
