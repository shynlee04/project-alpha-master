# Remaining Issues - Hub Flow Debug (Post-Validation)

**Date**: 2026-01-22
**Status**: POST-VALIDATION - FOCUS ON ACTUAL ISSUES ONLY
**Previous Investigation**: 6 findings → 67% wrong
**Remaining Actual Issues**: 1 confirmed + 1 likely = 2 issues

---

## Summary

After quick-dev validation (30 min), we confirmed:

| Issue Type | Count | Notes |
|------------|-------|-------|
| **Confirmed Issues** | 1 | Router bypass - simple fix |
| **Likely Issues** | 1 | Hot load - needs investigation |
| **Refuted Issues** | 4 | Did not exist or wrong patterns |
| **Total Actual Issues** | **2** | 1 simple + 1 complex |

**Action Items**:
1. ✅ Fix router bypass (10 min)
2. 🔍 Deep trace hot load mechanism (1-2 hours)
3. 🔧 Fix hot load based on investigation (2-4 hours)

---

## Issue 1: Router Bypass (CONFIRMED) ✅

### Status
- **Finding Status**: ✅ CONFIRMED by validation
- **Priority**: P0 (Critical - affects UX)
- **Complexity**: Simple (5-10 min fix)
- **Estimated Fix Time**: 10 min

### Location
```
File: src/presentation/components/hub/ProjectPickerDialog.tsx
Line: 173
Function: handleProjectSelect (lines 164-175)
```

### Problem
```typescript
// Current implementation (WRONG):
window.location.href = `/ide/${project.id}`;
```

**Issues**:
1. Full page reload (not SPA navigation)
2. Loses all React state
3. TanStack Router designed for client-side routing
4. Bad UX (page flash, slow navigation)

**Code Comment**: "bypasses TanStack Router type issues"

### Evidence
```typescript
// src/presentation/components/hub/ProjectPickerDialog.tsx

const handleProjectSelect = useCallback((project: Project) => {
  console.log('Selected project:', project.name);
  const currentProjectId = useProjectStore.getState().currentProjectId;  // Event handler: OK
  
  if (currentProjectId === project.id) {
    console.log('Project already active, reloading...');
    window.location.href = `/ide/${project.id}`;  // ❌ FULL PAGE RELOAD
    return;
  }
  
  console.log('Navigating to IDE with project:', project.id);
  window.location.href = `/ide/${project.id}`;  // ❌ FULL PAGE RELOAD
}, []);
```

### Fix Required

```typescript
// CORRECT implementation:
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();

const handleProjectSelect = useCallback(async (project: Project) => {
  console.log('Selected project:', project.name);
  const currentProjectId = useProjectStore.getState().currentProjectId;
  
  if (currentProjectId === project.id) {
    console.log('Project already active, reloading...');
    // Stay on same page - TanStack Router handles this
    await navigate({ 
      to: '/ide/$projectId', 
      params: { projectId: project.id } 
    });
    return;
  }
  
  console.log('Navigating to IDE with project:', project.id);
  // SPA navigation - no full page reload
  await navigate({ 
    to: '/ide/$projectId', 
    params: { projectId: project.id } 
  });
}, [navigate]);
```

### Files to Modify
- `src/presentation/components/hub/ProjectPickerDialog.tsx` (1 file, ~15 lines changed)

### Testing Strategy
1. Open DevTools Network tab
2. Select a project from picker
3. Verify: NO full page reload (no "Document" request)
4. Verify: IDE loads with project context
5. Verify: State preserved (no console errors)

### Success Criteria
- [ ] Network tab shows no full page reload
- [ ] IDE loads successfully with project
- [ ] No console errors
- [ ] Fast navigation (no page flash)

---

## Issue 2: Hot Load Mechanism (LIKELY) ⚠️

### Status
- **Finding Status**: ⚠️ LIKELY CONFIRMED by validation
- **Priority**: P1 (High - affects UX, but complex)
- **Complexity**: Unknown (needs 1-2 hours investigation)
- **Estimated Investigation Time**: 1-2 hours
- **Estimated Fix Time**: 2-4 hours (depends on investigation)

### User's Original Complaint
> "Clicking project icon → UI collapses, no hot load (no Monaco, no file tree)"

### Current Evidence

```typescript
// src/presentation/components/ide/IDELayoutMain.tsx

// Line 66-79: Layout state
const layoutState = useIDELayoutState();
const {
    projectId,
    openFiles: openFilesDerived,
    fileTreeRefreshKey,
    // ...
} = layoutState;

// Line 143: File tree refreshes on AGENT EVENTS (NOT project change)
useFileTreeEventSubscriptions(
    eventBus, 
    () => setFileTreeRefreshKey(k => k + 1)
);

// Line 154: VFS auto-watch uses projectId
useVFSAutoWatch(projectId ?? null);

// Line 217: fileTreeRefreshKey passed to FileTree
<IDESidebarPanels
    selectedFilePath={selectedFilePath}
    onFileSelect={handleFileSelect}
    fileTreeRefreshKey={fileTreeRefreshKey}  // Refreshed by agent events only
/>
```

### What's Missing

**No explicit hot-load trigger on project change**:

```typescript
// ❌ MISSING:
useEffect(() => {
  if (projectId) {
    // Reload Monaco content
    // Refresh file tree
    // Reload VFS for new project
    console.log('Hot-loading project:', projectId);
    triggerHotLoad(projectId);
  }
}, [projectId]);
```

### Uncertainties (Need Investigation)

1. **Does `useVFSAutoWatch(projectId)` handle hot-load?**
   - Need to read implementation
   - Might trigger VFS reload automatically
   - Might not handle Monaco + file tree refresh

2. **How does Monaco load content?**
   - Need to find Monaco integration code
   - Check if Monaco watches project changes
   - Check if Monaco needs explicit reload signal

3. **How does file tree populate?**
   - Need to find file tree implementation
   - Check data source (VFS? Dexie? Direct FS?)
   - Check refresh mechanism

4. **What does "hot load" actually mean?**
   - User expectation: Switch projects → everything refreshes instantly
   - Current behavior: UI collapses (project changes), then nothing happens
   - Root cause: No trigger after projectId changes

### Investigation Plan

#### Phase 1: Trace VFS Auto-Watch (30 min)

**Goal**: Understand how `useVFSAutoWatch` works

**Files to Read**:
```bash
# Find useVFSAutoWatch implementation
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "useVFSAutoWatch"

# Read implementation
cat src/path/to/useVFSAutoWatch.ts

# Search for VFS project handling
grep -r "projectId" src/infrastructure/filesystem/
```

**Questions to Answer**:
1. What does `useVFSAAutoWatch(projectId)` do?
2. Does it trigger reload when projectId changes?
3. Does it notify file tree?
4. Does it notify Monaco?

**Expected Findings**:
- If it watches projectId changes → might already handle hot-load
- If it only watches file changes → missing hot-load trigger
- Implementation might be in `src/infrastructure/filesystem/vfs/`

---

#### Phase 2: Trace Monaco Integration (30 min)

**Goal**: Understand how Monaco loads content

**Files to Read**:
```bash
# Find Monaco components
find src -type f -name "*.tsx" | xargs grep -l "Monaco\|monaco"

# Find Monaco editor usage
grep -r "useMonaco\|@monaco-editor" src/

# Find Monaco state management
grep -r "monaco.*state\|editor.*content" src/
```

**Questions to Answer**:
1. How does Monaco load file content?
2. Does Monaco listen to project changes?
3. Does Monaco need explicit reload signal?
4. How is Monaco mounted/unmounted?

**Expected Findings**:
- Monaco might be in `src/presentation/components/ide/editor/`
- Monaco might use `useMonaco` hook
- Monaco might read from store or VFS

---

#### Phase 3: Trace File Tree Integration (30 min)

**Goal**: Understand how file tree populates and refreshes

**Files to Read**:
```bash
# Find file tree component
find src -type f -name "*.tsx" | xargs grep -l "FileTree\|file.*tree"

# Read file tree implementation
cat src/presentation/components/ide/file-tree/*.tsx

# Find file tree data source
grep -r "fileTree.*source\|file.*tree.*data" src/
```

**Questions to Answer**:
1. Where does file tree get data from? (VFS? Dexie? Direct FS?)
2. How does file tree refresh mechanism work?
3. Does file tree listen to project changes?
4. What triggers file tree refresh currently? (Agent events only?)

**Expected Findings**:
- File tree might be in `src/presentation/components/ide/sidebar/`
- File tree might use VFS or Dexie as data source
- File tree refreshes on `fileTreeRefreshKey` changes (triggered by agent events)

---

#### Phase 4: Test Runtime Behavior (30 min)

**Goal**: Observe actual behavior when switching projects

**Steps**:
1. Open DevTools Console
2. Open 2 different projects in IDE
3. Switch between projects
4. Add console.log in key places:
   ```typescript
   // In IDELayoutMain.tsx:
   useEffect(() => {
     console.log('[HOT-LOAD] projectId changed to:', projectId);
   }, [projectId]);
   
   // In useVFSAutoWatch:
   console.log('[VFS] Project ID changed:', newId);
   
   // In file tree:
   useEffect(() => {
     console.log('[FILE-TREE] Refresh triggered');
   }, [fileTreeRefreshKey]);
   ```

**Expected Observations**:
- projectId changes ✅
- VFS auto-watch responds ❓
- File tree refreshes ❓
- Monaco reloads ❓

**Document**:
- What triggers when projectId changes
- What's missing
- What needs to be added

---

### Root Cause Hypothesis

**Hypothesis**: Project change (projectId update) happens, but downstream components don't react

**Chain**:
1. User selects project → projectId changes in store ✅
2. IDELayoutMain receives new projectId ✅
3. useVFSAutoWatch receives new projectId ❓ (investigate)
4. File tree needs refresh trigger ❌ (missing)
5. Monaco needs content reload ❌ (missing)

**Fix Strategy** (depends on investigation):

**Option A**: Add explicit hot-load useEffect
```typescript
useEffect(() => {
  if (projectId) {
    console.log('[HOT-LOAD] Triggering hot load for project:', projectId);
    
    // Refresh file tree
    setFileTreeRefreshKey(k => k + 1);
    
    // Reload Monaco content
    // (need to find Monaco reload mechanism)
    
    // Reload VFS
    // (might be handled by useVFSAutoWatch)
  }
}, [projectId]);
```

**Option B**: Enhance useVFSAAutoWatch
- Make it trigger file tree refresh on projectId change
- Make it trigger Monaco reload on projectId change
- Centralize hot-load logic in VFS layer

**Option C**: Implement project change event bus
- Emit "project-changed" event when projectId changes
- File tree, Monaco, VFS subscribe to this event
- Decouple components

---

### Files to Investigate

```bash
# VFS auto-watch
src/infrastructure/filesystem/vfs/useVFSAutoWatch.ts

# Monaco integration
src/presentation/components/ide/editor/MonacoEditor.tsx
src/presentation/components/ide/editor/useMonaco.ts

# File tree
src/presentation/components/ide/sidebar/FileTree.tsx
src/presentation/components/ide/sidebar/useFileTree.ts

# IDE layout
src/presentation/components/ide/IDELayoutMain.tsx
src/presentation/components/ide/IDELayoutState.ts

# Project routing
src/routes/ide.$projectId.tsx
src/infrastructure/persistence/stores/project/useProjectStore.ts
```

---

### Estimated Timeline

| Phase | Duration | Output |
|-------|----------|--------|
| 1. Trace VFS Auto-Watch | 30 min | Understanding of VFS project handling |
| 2. Trace Monaco Integration | 30 min | Understanding of Monaco reload mechanism |
| 3. Trace File Tree Integration | 30 min | Understanding of file tree refresh |
| 4. Test Runtime Behavior | 30 min | Actual behavior documentation |
| **Total Investigation** | **2 hours** | Root cause identification |

| Phase | Duration | Output |
|-------|----------|--------|
| 5. Design Fix Strategy | 30 min | Choose Option A/B/C |
| 6. Implement Fix | 1-2 hours | Hot-load working |
| 7. Test End-to-End | 30 min | Switch projects → everything reloads |
| **Total Implementation** | **2-3 hours** | Fix complete |

**Grand Total**: 4-5 hours (investigation + implementation)

---

## Summary of Remaining Work

### Quick Wins (<1 hour)

1. **Fix Router Bypass** (10 min)
   - Single file change
   - Simple code replacement
   - Immediate UX improvement

### Deep Dive (4-5 hours)

2. **Investigate Hot Load** (2 hours)
   - Trace VFS, Monaco, file tree interactions
   - Understand current mechanisms
   - Identify root cause
   - Test runtime behavior

3. **Fix Hot Load** (2-3 hours)
   - Design strategy (explicit trigger vs enhance VFS vs event bus)
   - Implement fix
   - Test end-to-end

### Total Effort

- **Quick Wins**: 10 min
- **Deep Dive**: 4-5 hours
- **Total**: 4-5.5 hours

---

## Success Criteria

### Router Bypass Fix
- [ ] Network tab shows no full page reload
- [ ] IDE loads successfully with project
- [ ] No console errors
- [ ] Fast navigation (no page flash)

### Hot Load Fix
- [ ] Switch project → Monaco reloads with new file content
- [ ] Switch project → File tree refreshes with new files
- [ ] Switch project → No UI collapse/delay
- [ ] No console errors
- [ ] All workspaces function correctly (Notes, IDE, Knowledge)

---

## Next Actions

### Immediate (Now)
1. ✅ Fix router bypass (10 min)
2. ✅ Test router bypass fix

### After Router Bypass Fix
3. 🔍 Deep trace hot load mechanism (2 hours investigation)
4. 🔧 Design fix strategy (30 min)
5. 🔧 Implement hot load fix (2-3 hours)
6. ✅ Test end-to-end (30 min)

### Documentation
7. 📝 Document investigation findings
8. 📝 Document fix implementation
9. 📝 Archive failed investigation
10. 📝 Update lessons learned

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|-------|-------------|---------|------------|
| Hot load more complex than estimated | Medium | High | Break into smaller tasks |
| VFS auto-watch already handles hot-load | Low | Low | Investigation will confirm |
| Monaco needs framework-level change | Low | High | Investigate early to assess |
| Fix breaks existing functionality | Medium | Medium | Thorough testing after fix |

---

## Metadata

**Created**: 2026-01-22
**Author**: ext-master orchestrator
**Session ID**: ses_remaining_issues_20260122
**Related Documents**:
- `validation-results-analysis-hub-flow-debug-2026-01-22`
- `quick-dev-coordination-hub-flow-debug-2026-01-22`
- `hub-flow-debug-corrected-investigation-2026-01-22` (to be created)

**Tags**: remaining-issues, router-bypass, hot-load, investigation-plan

---

## Decision Required

**Do you want me to:**

1. **Fix router bypass NOW** (10 min) - Quick win
2. **Deep trace hot load NOW** (2 hours) - Investigation
3. **Both** (2-4 hours) - Full fix
4. **Wait for your decision** - You choose approach

---

**END OF DOCUMENTATION**
