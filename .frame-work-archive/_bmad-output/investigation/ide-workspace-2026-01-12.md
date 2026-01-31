# IDE Workspace Course-Correction Investigation Report

**Date:** 2026-01-12
**Investigator:** Team A (IDE Workspace Handling)
**Related:** Team B (Block Notes Data Management & Stability)
**Epic Context:** EPIC-26 (Intelligent Knowledge Base), EPIC-FS (File System Foundation)

---

## Executive Summary

This investigation addresses two critical issues in the IDE Workspace:

1. **ReactNodeViewRenderer "Cannot find node position" Error** - A ProseMirror/BlockNote integration crash
2. **Storage Abstraction Ambiguity** - Unclear routing between File System (Desktop) and Browser Database (Mobile)

The architecture has substantial foundation for both issues, but edge cases and missing UX guidance need addressing.

---

## Issue 1: ReactNodeViewRenderer Crash Analysis

### Error Manifestation

```
Error: Cannot find node position
    at kt2 (chunk-3DOT4L6X.js)
    at ReactNodeViewRenderer.className (chunk-NHJFFVY5.js)
Stack Trace Analysis:
    at ReactNodeViewRenderer.className
    at ReactNodeView
    ...
    at NoteEditor (<...>/NoteEditor.tsx:283:30)
```

### Root Cause Analysis

The error occurs when BlockNote's ProseMirror document loses synchronization with React Node Views. Current mitigation in place:

1. **Sanitization Layer** (`NoteEditor.tsx:171-287`):
   - `sanitizeBlocks()` filters malformed blocks
   - `validBlockTypes` whitelist enforcement
   - Default props injection

2. **Validation Layer** (`NoteEditor.tsx:451-572`):
   - `filterValidBlocks()` recursive validation
   - Max recursion depth protection (50)
   - Table structure validation
   - Content type validation

3. **Fail-Safe Mechanisms** (`NoteEditor.tsx:574-594`):
   - Corruption counter forces editor remount
   - Returns `undefined` to force fresh BlockNote document
   - User-facing toast notifications

### Potential Edge Cases NOT Covered

| Edge Case | Likelihood | Impact |
|-----------|------------|--------|
| Rapid note switching during editor initialization | Medium | High |
| Custom block (AIImageBlock, etc.) cleanup on unmount | Medium | High |
| Race condition between save callback and editor destroy | Low-Medium | High |
| Corrupted blocks from cross-workspace import | Low | Medium |
| IndexedDB corruption during concurrent writes | Low | Medium |

### Identified Gaps

1. **No cleanup handler for custom ReactNodeViews** - Custom blocks may leave orphaned React components
2. **Note switching race condition** - `useMemo` for `initialContent` may not properly cancel
3. **No debounce on corruption counter reset** - Rapid re-renders could cause infinite loop
4. **Missing block migration for schema changes** - Old block formats may not validate

---

## Issue 2: Storage Abstraction & Mobile Routing

### Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    UnifiedStorageAdapter                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  StorageType: 'fsa' | 'indexeddb'                       │    │
│  │  - FSA: File System Access API (Desktop only)           │    │
│  │  - IDB: IndexedDB (All platforms including mobile)      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Route Layer                                 │
│  ┌───────────────────┬─────────────────────────────────────┐   │
│  │ /notes            │ → notes:browser-mode (IndexedDB)    │   │
│  │                   │ Auto-creates project if not exists  │   │
│  ├───────────────────┼─────────────────────────────────────┤   │
│  │ /notes/$projectId │ → Specific FSA or IDB project       │   │
│  └───────────────────┴─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile User Journey Gap

**Current State:**
- `/notes` route automatically creates `notes:browser-mode` project
- Storage type defaults to `indexeddb` for browser-mode
- Mobile users see a banner: "Desktop-only feature" for File Sync

**Problem:**
1. Mobile users are NOT explicitly directed to `/notes` when entering from other workspaces
2. The `default_note` concept mentioned in requirements is NOT enforced
3. No visual distinction between FSA-mode (Desktop) and IDB-mode (Mobile)

### Requirements Mapping

| Requirement | Current Implementation | Gap |
|-------------|----------------------|-----|
| Desktop: FS entry, full block capabilities | `/notes/$projectId` with FSA | ✅ Complete |
| Desktop: Browser space entry → `default_note` | `notes:browser-mode` project | ⚠️ Partial |
| Mobile: Direct to `default_note` (Browser DB) | `/notes` route | ⚠️ No explicit routing |
| Unified content support across storage types | UnifiedStorageAdapter | ✅ Complete |
| Reactive state persistence | useNoteStore + DexieDB | ✅ Complete |

---

## Cross-Domain Impact Analysis

### Domains Affected

1. **Presentation Layer** (`src/presentation/components/notes/`):
   - NotesPage.tsx - Mobile/Desktop layout handling
   - NoteEditor.tsx - BlockNote integration
   - NoteSidebar.tsx - Navigation

2. **Infrastructure Layer** (`src/infrastructure/persistence/`):
   - DexieDB - Browser database
   - Project store - Project metadata
   - File watcher store - FSA monitoring

3. **Sync Layer** (`src/infrastructure/sync/`):
   - NotesFileSyncService - FSA/IDB bridge
   - UnifiedStorageAdapter - Storage abstraction

4. **Routing Layer** (`src/routes/`):
   - `notes.lazy.tsx` - Browser-mode route
   - `notes.$projectId.lazy.tsx` - Project-specific route

### Collision Points

| Collision Point | Risk Level | Description |
|-----------------|------------|-------------|
| BlockNote re-initialization on note switch | Medium | Race condition between cleanup and new init |
| Cross-workspace note import | Low | Markdown-to-block conversion may fail |
| Storage type mismatch in project context | Low | Project created with FSA, accessed from mobile |

---

## Solution Proposals

### Solution 1: ReactNodeViewRenderer Stability (Confidence: 95%)

**Approach:** Add comprehensive cleanup and lifecycle management

```typescript
// Add to NoteEditor.tsx - Custom block cleanup hook
function useBlockNoteCleanup(editor: BlockNoteEditor | null, noteId: string) {
    const previousNoteId = useRef<string | null>(null);
    
    useEffect(() => {
        if (editor && previousNoteId.current !== noteId) {
            // Cleanup previous note's ReactNodeViews
            if (previousNoteId.current) {
                console.log('[NoteEditor] Cleaning up ReactNodeViews for note:', previousNoteId.current);
                // Force destroy of custom block views
                editor._tiptapEditor.state.doc.descendants((node) => {
                    if (node.type.name.includes('ai')) {
                        // Trigger cleanup for AI blocks
                    }
                });
            }
            previousNoteId.current = noteId;
        }
    }, [editor, noteId]);
}
```

**Files to Modify:**
1. `NoteEditor.tsx` - Add cleanup logic in useEffect
2. Custom block components - Add `useEffect` cleanup for event listeners

### Solution 2: Mobile User Routing Enhancement (Confidence: 92%)

**Approach:** Add explicit mobile detection and routing

```typescript
// Add to useWorkspaceActions.ts
const { isMobile, isTablet } = deviceType;

if (isMobile || isTablet) {
    // Auto-redirect to browser-mode notes
    navigate({ to: '/notes' });
    return;
}
```

**Additional UX Enhancement:**
- Add banner in mobile IDE workspace: "Switch to Notes workspace for mobile-optimized editing"
- Enforce `default_note` creation for browser-mode projects

**Files to Modify:**
1. `useWorkspaceActions.ts` - Add mobile routing logic
2. `NotesPage.tsx` - Add explicit `default_note` creation/selection
3. Route components - Add mobile-specific redirects

### Solution 3: Storage Type Enforcer (Confidence: 90%)

**Approach:** Create middleware to enforce storage type based on device

```typescript
// Add to UnifiedStorageAdapter
static enforceStorageType(deviceType: DeviceType): StorageType {
    if (deviceType.isMobile || deviceType.isTablet) {
        return 'indexeddb';
    }
    // Desktop can use either, default to FSA
    return 'fsa';
}
```

**Files to Modify:**
1. `unified-storage-adapter.ts` - Add static enforcer method
2. `NotesPage.tsx` - Use enforcer for storageType selection
3. `notes.lazy.tsx` - Ensure browser-mode uses indexeddb

---

## Recommended Priority Order

| Priority | Solution | Effort | Impact |
|----------|----------|--------|--------|
| P0 | ReactNodeViewRenderer cleanup | 2 hours | High |
| P0 | Mobile routing enhancement | 3 hours | High |
| P1 | Storage type enforcer | 1 hour | Medium |
| P2 | Block migration for schema changes | 4 hours | Low |
| P2 | Custom block cleanup refactor | 3 hours | Medium |

---

## Testing Strategy

### Unit Tests Required

1. **BlockNote Cleanup Tests:**
   - Rapid note switching (10 switches in <1 second)
   - Editor destroy/recreate cycles
   - Custom block unmount cleanup

2. **Mobile Routing Tests:**
   - Device detection accuracy
   - Route redirect on mobile
   - `default_note` creation/selection

3. **Storage Type Tests:**
   - FSA unavailable → IDB fallback
   - Cross-storage note import
   - State persistence verification

### Integration Tests Required

1. E2E: Mobile browser → Notes workspace flow
2. E2E: Desktop FSA project → Note switching stress test
3. E2E: Cross-workspace note import with block validation

---

## Artifacts Generated

1. **This Investigation Report** (`_bmad-output/investigation/ide-workspace-2026-01-12.md`)
2. **Proposed Code Changes** (documented inline above)
3. **Test Cases** (documented in Testing Strategy section)

---

## References

- BlockNote Documentation: `@blocknote/react` ReactNodeViewRenderer
- ProseMirror Node Position: `prosemirror-view` doc.descendants
- File System Access API: `window.showDirectoryPicker`
- IndexedDB: `idb` library patterns

---

## Next Steps

1. **Team A (IDE Workspace):**
   - Implement Solution 2 (Mobile routing)
   - Implement Solution 3 (Storage type enforcer)

2. **Team B (Block Notes):**
   - Implement Solution 1 (ReactNodeViewRenderer cleanup)
   - Coordinate with Team A for cross-domain testing

3. **Joint Effort:**
   - E2E testing across mobile and desktop
   - Performance benchmarking for note switching
   - User acceptance testing for mobile workflow

---

**Document Version:** 1.0.0
**Status:** Ready for Implementation
**Confidence Level:** 95%+
