---
epic: 24
story: 2
title: "FSA Handle Persistence & Instant Re-grant"
status: drafted
priority: high
team: A
created: 2025-12-29
updated: 2025-12-29
estimate_hours: 2-3

# User Story
As a user who returns to a project I previously opened,
I want the IDE to remember my file system access permissions,
So that I don't have to re-grant folder access every time I reload the page.

# Problem Statement
Currently, the `LocalFSAdapter` stores the `FileSystemDirectoryHandle` in memory only. When the browser page is reloaded or closed, the handle is lost, requiring users to re-grant folder access on every visit. This creates friction in the workflow and was flagged as related to CC-001.

# Acceptance Criteria

## AC-1: Handle Persistence Infrastructure
- [ ] **AC-1.1**: Dexie table `fsaHandles` exists with schema from Story 24-2 design
- [ ] **AC-1.2**: Helper functions `storeFSAHandle()`, `getFSAHandle()`, `deleteFSAHandle()` work correctly
- [ ] **AC-1.3**: Handle data includes: projectId, directoryPath, permissionStatus, timestamps

## AC-2: Handle Serialization
- [ ] **AC-2.1**: Serialize `FileSystemDirectoryHandle` to storable format using `FileSystemHandle.getWriter()` or similar
- [ ] **AC-2.2**: Store serialized handle in IndexedDB via `fsaHandles` table
- [ ] **AC-2.3**: Handle serialization preserves directory name and kind (directory)

## AC-3: Instant Re-grant Flow
- [ ] **AC-3.1**: On project load, check `fsaHandles` table for existing handle
- [ ] **AC-3.2**: If handle exists with `permissionStatus === 'granted'`, attempt silent re-grant
- [ ] **AC-3.3**: Re-grant succeeds within 500ms (no user interaction needed)
- [ ] **AC-3.4**: If silent re-grant fails, fall back to normal permission prompt

## AC-4: Permission Status Tracking
- [ ] **AC-4.1**: Track permission status: 'granted', 'prompt', 'denied', 'unknown'
- [ ] **AC-4.2**: Update status after each permission check
- [ ] **AC-4.3**: Delete handle record when permission is explicitly revoked
- [ ] **AC-4.4**: Update `lastAccessedAt` timestamp on successful access

## AC-5: Security & Privacy
- [ ] **AC-5.1**: Handle data is stored in IndexedDB only (not localStorage)
- [ ] **AC-5.2**: Users can view stored handles in Settings → Privacy
- [ ] **AC-5.3**: Users can clear all stored handles with one action
- [ ] **AC-5.4**: Clear handles on privacy-sensitive operations (e.g., "Clear All Data")

---

# Tasks

## Research & Planning
- [ ] T1: Review LocalFSAdapter directory handle management
- [ ] T2: Review fsaHandles helper functions in dexie-db.ts
- [ ] T3: Research FileSystemHandle serialization limitations (not directly serializable)
- [ ] T4: Design approach: store handle kind + path, re-create handle on restore

## Implementation
- [ ] T5: Create `fsa-handle-manager.ts` module with FSAHandleManager class
- [ ] T6: Implement `serializeHandle()` - extract kind and name from handle
- [ ] T7: Implement `deserializeHandle()` - recreate handle from stored data
- [ ] T8: Implement `requestSilentRegrant()` - attempt silent permission restore
- [ ] T9: Modify `LocalFSAdapter` to use handle manager for persistence
- [ ] T10: Add `restoreHandle()` method to LocalFSAdapter
- [ ] T11: Add handle management UI in Settings → Privacy
- [ ] T12: Add "Clear All Handles" button with confirmation

## Testing
- [ ] T13: Write unit tests for handle serialization/deserialization
- [ ] T14: Write integration test for handle persistence flow
- [ ] T15: Test silent re-grant success/failure scenarios
- [ ] T16: Test permission status tracking and updates
- [ ] T17: Test privacy controls (view/clear handles)

## Documentation
- [ ] T18: Update CLAUDE.md with FSA handle persistence documentation
- [ ] T19: Add user-facing docs for privacy controls

---

# Dev Notes

## Architecture Reference
- **Current State**: Handle stored in LocalFSAdapter.directoryHandle (memory only)
- **Goal**: Persist handle to IndexedDB, enable silent re-grant on return
- **Constraint**: FileSystemDirectoryHandle cannot be directly serialized

## Key Files
- `src/lib/filesystem/local-fs-adapter.ts` - Main adapter (to be modified)
- `src/lib/state/dexie-db.ts` - fsaHandles table and helpers (already exists)
- `src/components/ui/settings/` - Settings UI components (to be added/modified)

## Implementation Pattern
```typescript
// Pseudocode for handle persistence
class FSAHandleManager {
  async persistHandle(handle: FileSystemDirectoryHandle, projectId: string) {
    const data = {
      projectId,
      kind: handle.kind,  // 'directory'
      name: handle.name,  // directory name
      directoryPath: await getPath(handle),  // if available
      permissionStatus: 'granted',
      grantedAt: Date.now(),
      lastAccessedAt: Date.now(),
    };
    await storeFSAHandle(data);
  }

  async restoreHandle(projectId: string): FileSystemDirectoryHandle | null {
    const record = await getFSAHandle(projectId);
    if (!record || record.permissionStatus !== 'granted') {
      return null;
    }

    try {
      // Try to get existing handle (browser may persist it)
      const handle = await window.showDirectoryPicker({ id: record.projectId });
      return handle;
    } catch {
      // Silent re-grant failed, clear record
      await deleteFSAHandle(projectId);
      return null;
    }
  }
}
```

## Browser Limitations
1. FileSystemDirectoryHandle is not directly serializable
2. Cannot store actual handle data, only metadata (kind, name, path)
3. Silent re-grant relies on browser's handle persistence (if supported)
4. Some browsers don't persist handles across sessions

## Fallback Strategy
If silent re-grant isn't supported by the browser:
- Store directory path/name as hint for user
- Show "Restore Access" button instead of auto-restore
- Pre-populate the directory picker with the remembered path

## Privacy Considerations
- Users must be able to view which projects have stored handles
- Single "Clear All" action for privacy
- Clear on explicit user request or "Clear Browsing Data"

---

# Dev Agent Record

**Agent:**
**Session:**

#### Task Progress:
- [ ] T1:
- [ ] T2:
- [ ] T3:
- [ ] T4:
- [ ] T5:
- [ ] T6:
- [ ] T7:
- [ ] T8:
- [ ] T9:
- [ ] T10:
- [ ] T11:
- [ ] T12:
- [ ] T13:
- [ ] T14:
- [ ] T15:
- [ ] T16:
- [ ] T17:
- [ ] T18:
- [ ] T19:

#### Research Executed:

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

#### Tests Created:

#### Decisions Made:

---

# Code Review

**Reviewer:**
**Date:**

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] Privacy considerations addressed

#### Issues Found:

#### Sign-off:

---

# Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-29 | drafted | Story created |
