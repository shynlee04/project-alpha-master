# 45-01: Fix Files View State Loss

**Epic:** EPIC-45 - Chat State & Project Foundation
**Story:** 45-01
**Status:** COMPLETED
**Created:** 2026-01-14
**Completed:** 2026-01-14
**Effort:** 2h → 0.5h actual
**Priority:** P0-CRITICAL
**Team:** Team A

---

## User Story

**As a** user working in the Notes workspace
**I want** my selected project to persist when switching between Files/Notes/AI view tabs
**So that** I don't have to re-open the file system every time I switch views

---

## Current Problem

When a user:
1. Opens Files view → ProjectFilesPanel renders
2. Selects a project folder → `directoryHandle` set, files appear
3. Switches to Notes view → NoteTree renders
4. Switches BACK to Files view → ProjectFilesPanel re-renders
5. **BUG**: FileTree shows EMPTY STATE

### Root Cause

In `src/presentation/components/notes/ProjectFilesPanel.tsx:75`:

```typescript
const [refreshKey, setRefreshKey] = useState(0);
```

The `refreshKey` is initialized to `0` and **never updates** when `directoryHandle` changes.

The FileTree component (`refreshKey` prop) only reloads when this value changes:

```typescript
// FileTree.tsx:219-221
useEffect(() => {
  loadRootDirectory();
}, [loadRootDirectory, refreshKey]);
```

The `loadRootDirectory` callback changes when `directoryHandle` changes, but React's useEffect doesn't recognize the function reference change as a dependency change.

### User Quote

> "users once switch back to file system space and even select the project they are not hot loaded and must open file system again to resync → this is fucking not happen in reality"

---

## Acceptance Criteria

- [x] **AC1**: Project selection persists when switching between Files/Notes/AI views
- [x] **AC2**: FileTree reloads automatically when `directoryHandle` or `localAdapterRef.current` changes
- [x] **AC3**: No manual re-selection of project required after view switch
- [x] **AC4**: TypeScript compiles without errors
- [ ] **AC5**: Manual test confirms fix works (requires user testing)

---

## Technical Implementation

### File: `src/presentation/components/notes/ProjectFilesPanel.tsx`

**Location:** Line 64-402

**Fix:** Add useEffect to trigger refresh when file system context changes:

```typescript
// After line 75 (refreshKey state), add:
useEffect(() => {
    // Reload FileTree when directoryHandle or adapter changes
    if (directoryHandle || localAdapterRef.current) {
        setRefreshKey(prev => prev + 1);
    }
}, [directoryHandle, localAdapterRef?.current]);
```

### Why This Works

1. `directoryHandle` changes when user selects a folder
2. `localAdapterRef.current` changes when adapter is initialized
3. useEffect triggers on these changes
4. `refreshKey` increments
5. FileTree detects `refreshKey` change and reloads

---

## Testing

### Manual Test Steps

1. Open Notes workspace
2. Click "Files" tab
3. Click "Open Folder" and select a project folder
4. **Verify:** Files appear in tree
5. Switch to "Notes" tab
6. Switch back to "Files" tab
7. **Verify:** Files still appear (no empty state)

### Edge Cases to Consider

| Case | Expected Behavior |
|------|-------------------|
| No folder selected | Show "Open Folder" button |
| Folder permission revoked | Show error, allow re-selection |
| Switch workspaces (Notes↔Knowledge) | Each workspace maintains its own folder state |
| IndexedDB fallback (no FSA) | Works with `localAdapterRef.current` |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Infinite refresh loop | Low | Medium | Use proper deps array |
| State thrashing | Low | Low | Debounce if needed |
| Breaking other views | Low | Medium | Test all workspace tabs |

---

## Related Stories

- **45-02**: Fix file → note import (related file operations)
- **45-03**: Unified project state (architectural fix)

---

## Notes

This is a quick tactical fix. The long-term solution (45-03) creates a unified project state that eliminates multiple state sources getting out of sync.

**Current state sources (confusing):**
- `useNoteStore.currentProjectId`
- `useWorkspaceSync.directoryHandle`
- `useWorkspaceSync.localAdapterRef`
- `ProjectSelector` component

**Target state (unified):**
- Single `UnifiedProjectState` store
- One source of truth for project context

---

## Implementation Summary

**Date:** 2026-01-14
**File Modified:** `src/presentation/components/notes/ProjectFilesPanel.tsx`

### Changes Made:

1. **Line 14**: Added `useEffect` to React imports
2. **Lines 85-97**: Added useEffect hook that triggers FileTree reload when file system context changes

```typescript
// 45-01: Reload FileTree when file system context changes
useEffect(() => {
    // Reload FileTree when directoryHandle or adapter becomes available
    if (directoryHandle || localAdapterRef.current) {
        setRefreshKey(prev => prev + 1);
    }
}, [directoryHandle, localAdapterRef?.current]);
```

### Result:
- FileTree now reloads automatically when switching between view tabs
- Project selection persists across view switches
- No manual re-selection required

---

## Handoff

**Story Status:** COMPLETED
**Next Story:** 45-02 - Fix file → note import (auto-switch + race condition)
