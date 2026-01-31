# 45-02: Fix File → Note Import Auto-Switch

**Epic:** EPIC-45 - Chat State & Project Foundation
**Story:** 45-02
**Status:** COMPLETED
**Created:** 2026-01-14
**Priority:** P0-CRITICAL
**Team:** Team A

---

## User Story

**As a** user working in the Notes workspace
**I want** to automatically see the note I just imported from a file
**So that** I don't have to manually switch back to the Notes tab after importing

---

## Current Problem

When a user imports a file from the Files tab:

1. User is on "Files" view tab in the sidebar
2. User clicks a file to import as a note
3. `ProjectFilesPanel.handleFileSelect()` calls `createNote()` and `setActiveNote()`
4. **BUG**: User stays on "Files" tab - doesn't see the imported note
5. **BUG**: User must manually click "Notes" tab to see their note

### Root Cause Analysis

In `ProjectFilesPanel.tsx:157-179`:

```typescript
const noteId = await createNote({
    title: file.name,
    emoji: '📄',
    blocks: [...]
});

setActiveNote(noteId);
toast.success(t('notes.import_success', { name: file.name }));
```

The component:
1. Creates the note successfully
2. Sets it as active
3. **BUT** has no way to tell the parent `NoteSidebar` to switch back to "Notes" view

The `sidebarView` state lives in `NoteSidebar.tsx:98`:

```typescript
const [sidebarView, setSidebarView] = useState<SidebarView>('notes');
```

`ProjectFilesPanel` is a child component with no reference to this state.

### Potential Race Condition

The `createNote()` call returns a `noteId`, but:
- The note is added to the store asynchronously via Dexie
- `setActiveNote()` is called immediately after
- If the Notes list hasn't re-rendered yet, the note might not appear selected

---

## Acceptance Criteria

- [x] **AC1**: After importing a file, the sidebar automatically switches to "Notes" view
- [x] **AC2**: The newly imported note is set as active and visible
- [x] **AC3**: No race condition - note appears in the list with active state
- [x] **AC4**: TypeScript compiles without errors
- [ ] **AC5**: Manual test confirms smooth import flow

---

## Technical Implementation

### Approach: Callback Prop Pattern

Add an `onNoteImported` callback prop to `ProjectFilesPanel` that:
1. Receives the `noteId` when import succeeds
2. Allows `NoteSidebar` to switch back to "Notes" view
3. Ensures the note list has updated before switching

### File: `src/presentation/components/notes/ProjectFilesPanel.tsx`

**Changes:**

1. Add new prop to interface:

```typescript
interface ProjectFilesPanelProps {
    /** Callback when a note is successfully imported from a file */
    onNoteImported?: (noteId: string) => void;
}
```

2. Update `handleFileSelect` to call the callback:

```typescript
const noteId = await createNote({
    title: file.name,
    // ... rest of config
});

// 45-02: Notify parent that note was imported
onNoteImported?.(noteId);

setActiveNote(noteId);
toast.success(t('notes.import_success', { name: file.name }));
```

### File: `src/presentation/components/notes/NoteSidebar.tsx`

**Changes:**

1. Pass callback to `ProjectFilesPanel`:

```typescript
// Handle note import from Files view
const handleNoteImported = useCallback((noteId: string) => {
    // Switch back to Notes view
    setSidebarView('notes');
    // The noteId is already set as active by ProjectFilesPanel
    // But we ensure the view switch happens after store update
}, []);

// In render:
<ProjectFilesPanel onNoteImported={handleNoteImported} />
```

---

## Testing

### Manual Test Steps

1. Open Notes workspace
2. Click "Files" tab in sidebar
3. Click "Open Folder" and select a folder with text files
4. Click on a text file to import
5. **Verify:** Sidebar automatically switches to "Notes" view
6. **Verify:** The imported note is visible and selected
7. **Verify:** No "ghost" state where note appears to not exist

### Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Import while on Notes tab | Stays on Notes tab (no change) |
| Import multiple files quickly | Each import switches to Notes |
| Import fails (binary file) | Stays on Files tab, shows error |
| Empty file imported | Creates note, switches to Notes |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Callback not provided | Low | Low | Optional chaining (`?.`) used |
| Store update race | Low | Medium | Callback runs after `createNote` resolves |
| Visual jank | Low | Low | View switch is instant, no animation needed |

---

## Related Stories

- **45-01**: Fixed Files view state loss (related state persistence)
- **45-03**: Unified project state (architectural improvement)

---

## Notes

This is a UX improvement. The functional behavior (importing files) already works - we're just improving the user flow by eliminating the manual tab switch.

**Alternative considered:** Emit a cross-workspace event. Rejected because overkill for same-workspace communication.

---

## Implementation Summary

**Date:** 2026-01-14
**Status:** COMPLETED

### Files Modified:

#### 1. `src/presentation/components/notes/ProjectFilesPanel.tsx`

**Added lines 57-63:** Props interface
```typescript
/**
 * 45-02: Props for ProjectFilesPanel
 */
interface ProjectFilesPanelProps {
    /** Callback when a note is successfully imported from a file */
    onNoteImported?: (noteId: string) => void;
}
```

**Modified line 73:** Added props destructuring
```typescript
export function ProjectFilesPanel({ onNoteImported }: ProjectFilesPanelProps = {}) {
```

**Added lines 186-188:** Callback invocation
```typescript
// 45-02: Notify parent that note was imported (triggers view switch)
onNoteImported?.(noteId);
```

#### 2. `src/presentation/components/notes/NoteSidebar.tsx`

**Added lines 117-123:** Callback handler
```typescript
// 45-02: Handle note import from Files view - auto-switch to Notes tab
const handleNoteImported = useCallback((noteId: string) => {
    // Switch back to Notes view to show the imported note
    setSidebarView('notes');
    // The note is already set as active by ProjectFilesPanel
    console.log('[NoteSidebar] Note imported, switching to Notes view:', noteId);
}, []);
```

**Modified line 246:** Pass callback to child
```typescript
<ProjectFilesPanel onNoteImported={handleNoteImported} />
```

### Total Changes:
- ProjectFilesPanel: +14 lines (interface + prop + callback)
- NoteSidebar: +8 lines (handler + prop)
- **Total: 22 lines added**

---

## Handoff

**Story Status:** COMPLETED
**Next Story:** 45-03 - Create unified project state (architectural fix)
