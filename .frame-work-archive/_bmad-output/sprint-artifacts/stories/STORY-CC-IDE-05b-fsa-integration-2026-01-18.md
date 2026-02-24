# Story: CC-IDE-05b
# WebContainer FSA Integration (Follow-up to CC-IDE-05)

**Title**: WebContainer FSA Integration (Follow-up)
**Epic**: CC-IDE-FSA
**Points**: 4
**Status**: partial-completion
**Team**: TEAM_B

---

## Context

CC-IDE-05 created `src/infrastructure/webcontainer/fsa-adapter.ts` (511 lines) with core functionality, but the adapter is not integrated into the IDE workflow.

**Why Follow-up Story Needed:**
- Story file expected `WebContainerPanel.tsx` (doesn't exist - WebContainer integrated in IDELayoutMain.tsx)
- fsa-adapter exists but never initialized/used
- HMR callbacks exist but not connected to Monaco
- No integration tests

---

## Acceptance Criteria

1. [ ] **fsa-adapter initialized in IDE layout**
   - Adapter created when WebContainer boots
   - Mounted at `/project` path in WebContainer
   - Sync starts automatically after boot

2. [ ] **FSA files synced to WebContainer**
   - FileTree changes reflected in WebContainer
   - External FSA changes reflected in WebContainer
   - Conflict resolution triggered on concurrent edits

3. [x] **Monaco HMR integration**
   - HMR events from WebContainer trigger Monaco updates
   - Editor content updates without full page reload
   - State preserved during HMR

4. [ ] **Integration tests**
   - Test mount/unmount operations
   - Test bidirectional sync
   - Test conflict detection
   - Test HMR callback

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Initialize fsa-adapter in IDE layout
  - [ ] Subtask 1.1: Import `WebContainerFSAAdapter` in IDELayoutMain.tsx
  - [ ] Subtask 1.2: Initialize adapter after WebContainer boots
  - [ ] Subtask 1.3: Call `mountToContainer()` after boot

- [ ] **Task 2**: Connect to FileTree
  - [ ] Subtask 2.1: Use FileTree events to trigger FSA sync
  - [ ] Subtask 2.2: WebContainer changes trigger FileTree refresh

- [ ] **Task 3**: Monaco HMR integration
  - [ ] Subtask 3.1: Subscribe to HMR events from fsa-adapter
  - [ ] Subtask 3.2: Update Monaco editor on HMR
  - [ ] Subtask 3.3: Preserve editor state during updates

- [ ] **Task 4**: Create integration tests
  - [ ] Subtask 4.1: Test adapter initialization
  - [ ] Subtask 4.2: Test mount operations
  - [ ] Subtask 4.3: Test sync operations
  - [ ] Subtask 4.4: Test HMR callbacks

---

## Dependencies
- CC-IDE-05: WebContainer File Binding (partial - adapter exists but not integrated)
- CC-IDE-03: Monaco Editor File Operations
- CC-IDE-04: Terminal File System Access

---

## File List
- Modified: src/presentation/components/layout/IDELayoutMain.tsx (initialize adapter)
- Modified: src/presentation/components/ide/MonacoEditor.tsx (HMR integration)
- Created: src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts (integration tests)

---

## Integration Points

### IDELayoutMain.tsx
```typescript
import { WebContainerFSAAdapter } from '@/infrastructure/webcontainer/fsa-adapter';

// After WebContainer boots
const fsaAdapterRef = useRef<WebContainerFSAAdapter | null>(null);

useEffect(() => {
  if (isWebContainerBooted && !fsaAdapterRef.current) {
    const gateway = createIdeFileGateway(projectId);
    const adapter = new WebContainerFSAAdapter(gateway);
    fsaAdapterRef.current = adapter;

    // Mount to WebContainer
    adapter.mountToContainer('/project');

    // Start bidirectional sync
    adapter.startBidirectionalSync();

    return () => {
      adapter.stopSync();
    };
  }
}, [isWebContainerBooted, projectId]);
```

### MonacoEditor.tsx
```typescript
useEffect(() => {
  if (fsaAdapterRef.current && activeFilePath) {
    const unsubscribe = fsaAdapterRef.current.onHMREvent((event) => {
      if (event.path === activeFilePath) {
        // Update editor without full reload
        updateEditorContent(event.content);
      }
    });
    return unsubscribe;
  }
}, [fsaAdapterRef.current, activeFilePath]);
```

---

## Status
ready-for-dev

---

**Created**: 2026-01-18T18:45:00+07:00
**Timebox**: 2 hours (follow-up to CC-IDE-05 4h timebox)
