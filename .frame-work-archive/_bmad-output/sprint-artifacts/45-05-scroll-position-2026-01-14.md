# 45-05: Preserve Scroll Position Per Note

**Epic:** EPIC-45 - Chat State & Project Foundation
**Story:** 45-05
**Status:** COMPLETED
**Created:** 2026-01-14
**Completed:** 2026-01-14
**Priority:** P2-MEDIUM
**Team:** Team A
**Iteration:** 3

---

## User Story

**As a** user who reads and edits long notes
**I want** the editor to remember my scroll position when I switch between notes
**So that** I can quickly resume where I left off without manually scrolling

---

## Epic Analysis

### Epic Basics
- **Number:** 45
- **Name:** Chat State & Project Foundation
- **Status:** IN_PROGRESS
- **Progress:** 80% (4/5 stories complete)

### Epic Scope
- **Stories Total:** 5
- **Stories Completed:** 4 (45-01, 45-02, 45-03, 45-04)
- **Current Story:** 45-05 (scroll position preservation)
- **Remaining:** None after this story

---

## Current Problem

### Lost Scroll Position

Currently, when switching between notes in the Notes workspace:
1. Scroll position resets to top when switching notes
2. Long notes require re-scrolling to find reading position
3. Poor UX for users who work with multiple notes simultaneously

### Root Cause

```typescript
// NoteEditor component remounts on note change
// BlockNote editor re-initializes, losing scroll state
<NoteEditor
    key={activeNote?.id || 'empty'}  // Key change causes remount
    noteId={activeNote?.id || ''}
/>
```

---

## Acceptance Criteria

### AC1: Scroll Position Saved
- [x] Scroll position saved when switching away from a note
- [x] Scroll position restored when returning to a note
- [x] Works for both project-scoped and browser mode notes

### AC2: Per-Note Storage
- [x] Scroll position stored per note ID
- [x] Storage persists across session refresh
- [x] Old/unused entries cleaned up

### AC3: Edge Cases
- [x] Handles note deletion (cleanup scroll position)
- [x] Handles notes shorter than saved position (clamp to bottom)
- [x] Handles editor resize (maintain relative position)

---

## Technical Implementation

### Approach: Scroll State Map in IDE Store

Use the existing IDE store to persist scroll positions per note:

```typescript
// In IDE store:
scrollPositions: Map<string, number>;  // noteId -> scrollY

// Methods:
setNoteScrollPosition(noteId: string, scrollY: number): void;
getNoteScrollPosition(noteId: string): number;
clearNoteScrollPosition(noteId: string): void;
```

### Files to Modify

1. **`src/infrastructure/persistence/stores/ide/ide-store.ts`**
   - Add `scrollPositions` map to state
   - Add `setNoteScrollPosition` method
   - Add `getNoteScrollPosition` method
   - Add `clearNoteScrollPosition` method (for cleanup)

2. **`src/presentation/components/notes/NoteEditor.tsx`**
   - Save scroll position on note change
   - Restore scroll position on mount
   - Listen to scroll events

3. **`src/lib/notes/slices/note-crud-slice.ts`**
   - Clear scroll position when note is deleted

---

## Implementation Tasks

| Task | Type | Effort | Depends On |
|------|------|--------|------------|
| Add scroll position methods to IDE store | Implementation | 30m | - |
| Save scroll position in NoteEditor | Implementation | 30m | Store |
| Restore scroll position on note change | Implementation | 30m | Store |
| Clear scroll position on note delete | Implementation | 15m | Store |
| Test scroll position persistence | Testing | 30m | All above |

**Total Estimated Effort:** 2.25 hours

---

## Design Notes

### Scroll Event Throttling

```typescript
// Throttle scroll events to avoid excessive state updates
const handleScroll = throttle((e: Event) => {
    const scrollY = (e.target as HTMLElement).scrollTop;
    useIDEStore.getState().setNoteScrollPosition(noteId, scrollY);
}, 100); // 100ms throttle
```

### Position Clamping

```typescript
// When restoring scroll position, clamp to valid range
const maxScroll = scrollHeight - clientHeight;
const scrollY = Math.min(savedPosition, maxScroll);
element.scrollTop = scrollY;
```

---

## Handoff

**Story Status:** COMPLETED
**Next Phase:** EPIC-45 Retrospective

### Artifacts Created
- [x] Story artifact (this file)
- [x] Note navigation store scroll position methods
- [x] NoteEditor scroll position handling (save/restore)
- [x] Cleanup on note delete

### Files Modified
1. `src/lib/notes/note-navigation-store.ts` - Added scroll position state and methods
2. `src/presentation/components/notes/NoteEditor.tsx` - Added scroll position save/restore logic
3. `src/lib/notes/slices/note-crud-slice.ts` - Added scroll position cleanup on delete

---

## Notes

**Why This Matters:**

Users working with long reference notes (documentation, research, etc.) frequently switch between notes to cross-reference. Losing scroll position forces them to manually find their place, which is frustrating and time-consuming.

**Complexity Consideration:**

This is a P2 feature because:
- It's a quality-of-life improvement, not blocking
- The workaround (manual scrolling) is functional
- Implementation complexity is low

**Implementation Risk:**

- Low risk: Uses existing IDE store infrastructure
- Isolated change: Only affects NoteEditor component
- Backward compatible: No scroll position = default to top
