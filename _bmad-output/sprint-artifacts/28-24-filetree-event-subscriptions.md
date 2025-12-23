# Story 28-24: FileTree Event Subscriptions for Agent Actions

**Epic**: 28 - UX Brand Identity & Design System  
**Story ID**: 28-24  
**Status**: drafted  
**Priority**: P1  
**Story Points**: 3

---

## User Story

**As a** user of the Via-Gent IDE  
**I want the** FileTree to automatically refresh when an AI agent creates, modifies, or deletes files  
**So that** I can see real-time updates to my project structure without manual refresh

---

## Context

The EventBus infrastructure (Epic 10) already emits `file:created`, `file:modified`, `file:deleted`, and `directory:*` events with `source: 'agent'` when AI agents perform file operations via the FileToolsFacade (Epic 12). However, the FileTree component does not currently subscribe to these events for automatic refresh.

### Existing Infrastructure

```typescript
// Already exists in workspace-events.ts
interface WorkspaceEvents {
  'file:created': [{ path: string; source: 'local' | 'editor' | 'agent'; ... }]
  'file:modified': [{ path: string; source: 'local' | 'editor' | 'agent'; ... }]
  'file:deleted': [{ path: string; source: 'local' | 'editor' | 'agent'; ... }]
  'directory:created': [{ path: string }]
  'directory:deleted': [{ path: string }]
}
```

### FileTree Component Structure

```
src/components/ide/FileTree/
├── FileTree.tsx              # Main component with refreshKey prop
├── FileTreeItem.tsx          # Individual tree item
├── hooks/useFileTreeState.ts # State management
├── hooks/useFileTreeActions.ts # Actions (expand, select, etc.)
└── types.ts                  # TreeNode types
```

---

## Acceptance Criteria

### AC-28-24-1: Subscribe to Agent File Events
**Given** the FileTree component is mounted  
**When** an AI agent creates a file via FileToolsFacade  
**Then** the FileTree refreshes to show the new file

### AC-28-24-2: Handle File Deletion Events
**Given** the FileTree shows an existing file  
**When** an AI agent deletes the file via FileToolsFacade  
**Then** the FileTree removes the file from display

### AC-28-24-3: Handle Directory Events
**Given** the FileTree is mounted  
**When** an AI agent creates or deletes a directory  
**Then** the FileTree updates the directory structure

### AC-28-24-4: Debounce Rapid Updates
**Given** multiple file events in quick succession  
**When** the AI agent creates multiple files rapidly  
**Then** refreshes are debounced (300ms) to prevent UI thrashing

### AC-28-24-5: Event Cleanup on Unmount
**Given** the FileTree subscribes to EventBus events  
**When** the component unmounts  
**Then** all event subscriptions are cleaned up

### AC-28-24-6: Unit Tests
**Given** the story implementation  
**When** running tests  
**Then** at least 5 tests pass covering event subscriptions

---

## Tasks

### T1: Create useFileTreeEventSubscriptions Hook
- [ ] Create `src/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts`
- [ ] Subscribe to `file:created`, `file:modified`, `file:deleted` events
- [ ] Subscribe to `directory:created`, `directory:deleted` events
- [ ] Filter for `source === 'agent'` events (or optionally all sources)
- [ ] Implement debounced refresh trigger (300ms)
- [ ] Clean up subscriptions on unmount

### T2: Integrate Hook into FileTree
- [ ] Import and use `useFileTreeEventSubscriptions` in FileTree.tsx
- [ ] Connect to existing `refreshKey` mechanism or add new refresh trigger
- [ ] Pass eventBus from WorkspaceContext

### T3: Create Unit Tests
- [ ] Test subscription on mount
- [ ] Test unsubscription on unmount
- [ ] Test refresh triggered on file:created (source: agent)
- [ ] Test refresh triggered on file:deleted (source: agent)
- [ ] Test debounce behavior with multiple rapid events
- [ ] Test cleanup of subscriptions

### T4: Update Governance Files
- [ ] Update sprint-status.yaml
- [ ] Update bmm-workflow-status.yaml

---

## Dev Notes

### EventBus Access Pattern

The EventBus is available via WorkspaceContext:

```typescript
import { useWorkspaceContext } from '@/lib/workspace';

// In FileTree component
const { eventBus } = useWorkspaceContext();
```

### Debounce Implementation

```typescript
import { useCallback, useEffect, useRef } from 'react';
import { debounce } from '@/lib/utils';

function useFileTreeEventSubscriptions(eventBus: WorkspaceEventEmitter) {
    const refreshRef = useRef<() => void>();
    
    // Debounced refresh
    const debouncedRefresh = useMemo(
        () => debounce(() => refreshRef.current?.(), 300),
        []
    );
    
    useEffect(() => {
        const handleFileEvent = (payload: { source: string }) => {
            if (payload.source === 'agent') {
                debouncedRefresh();
            }
        };
        
        eventBus.on('file:created', handleFileEvent);
        eventBus.on('file:deleted', handleFileEvent);
        eventBus.on('file:modified', handleFileEvent);
        
        return () => {
            eventBus.off('file:created', handleFileEvent);
            eventBus.off('file:deleted', handleFileEvent);
            eventBus.off('file:modified', handleFileEvent);
            debouncedRefresh.cancel?.();
        };
    }, [eventBus, debouncedRefresh]);
    
    return { setRefreshCallback: (fn: () => void) => { refreshRef.current = fn; } };
}
```

---

## References

- **Epic 10**: Event Bus Architecture (completed)
- **Epic 12**: FileToolsFacade with event emission (completed)
- **Story 25-5**: Approval Flow (events trigger from agent operations)
- **WorkspaceEvents**: `src/lib/events/workspace-events.ts`
- **useEventBusEffects**: `src/lib/workspace/hooks/useEventBusEffects.ts` (reference pattern)

---

## Dev Agent Record

**Agent:** TBD  
**Session:** TBD

### Task Progress:
<!-- Updated during implementation -->

### Files Changed:
<!-- Updated during implementation -->

### Tests Created:
<!-- Updated during implementation -->

### Decisions Made:
- TBD

---

## Status History

| Timestamp | Status | Actor | Notes |
|-----------|--------|-------|-------|
| 2025-12-24T04:20 | drafted | SM | Story created for critical path |
