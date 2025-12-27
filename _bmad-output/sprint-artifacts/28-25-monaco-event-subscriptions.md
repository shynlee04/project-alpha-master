# Story 28-25: Monaco Event Subscriptions

## Story Header

- **Epic:** 28 - UX Brand Identity & Design System
- **Story ID:** 28-25
- **Title:** Monaco Event Subscriptions
- **Points:** 3
- **Priority:** P1
- **Platform:** Platform A
- **Created:** 2025-12-24T05:05:00+07:00
- **Status:** drafted

## User Story

**As a** user editing files in the Monaco Editor,  
**I want** the editor to automatically refresh when an AI agent modifies the currently open file,  
**So that** I can see agent-made changes in real-time without manually reloading.

## Acceptance Criteria

### AC-28-25-1: Subscribe to Agent File Events
**Given** a file is open in the Monaco Editor  
**When** an AI agent emits a `file:modified` event with `source === 'agent'`  
**And** the modified file matches the currently active file path  
**Then** the Monaco Editor model updates to show the new content

### AC-28-25-2: Ignore Non-Agent Events
**Given** a file is open in the Monaco Editor  
**When** a `file:modified` event is emitted with `source !== 'agent'`  
**Then** the editor does NOT refresh (to avoid loops from user edits)

### AC-28-25-3: Debounce Rapid Events
**Given** rapid file:modified events occur  
**When** multiple events arrive within 300ms  
**Then** only the last event triggers a refresh (debounced)

### AC-28-25-4: Cleanup on Unmount
**Given** the Monaco Editor component is mounted  
**When** the component unmounts  
**Then** all event subscriptions are properly cleaned up with no memory leaks

### AC-28-25-5: Handle Undefined EventBus
**Given** the eventBus may be undefined during initial render  
**When** hook is called with undefined eventBus  
**Then** hook returns gracefully with no errors

## Tasks

### Research Tasks
- [x] T0: Review existing `useFileTreeEventSubscriptions` pattern
- [x] T1: Review EventBus event types in `workspace-events.ts`

### Implementation Tasks
- [ ] T2: Create `useMonacoEventSubscriptions.ts` hook
  - Subscribe to `file:modified` event
  - Filter by `source === 'agent'`
  - Filter by activeFilePath match
  - Debounce with 300ms delay
  - Cleanup subscriptions on unmount
- [ ] T3: Create unit tests for hook
  - Test subscribe on mount
  - Test unsubscribe on unmount
  - Test agent source filter
  - Test activeFilePath filter
  - Test debounce behavior
  - Test undefined eventBus handling
- [ ] T4: Integrate hook into MonacoEditor component (optional)
  - Call hook with eventBus and activeFilePath
  - Update model content on external change

### Governance Tasks
- [ ] T5: Update sprint-status.yaml
- [ ] T6: Update bmm-workflow-status.yaml

## Dev Notes

### Pattern Reference

Follow the pattern from `useFileTreeEventSubscriptions.ts`:

```typescript
export function useMonacoEventSubscriptions(
    eventBus: WorkspaceEventEmitter | undefined,
    activeFilePath: string | null,
    onExternalChange: (path: string, content: string) => void
): void {
    // Debounce ref
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        if (!eventBus) return;
        
        const handleFileModified = (payload: FileEventPayload) => {
            // Only agent-sourced events
            if (payload.source !== 'agent') return;
            // Only if matches active file
            if (payload.path !== activeFilePath) return;
            // Debounce
            // ...
        };
        
        eventBus.on('file:modified', handleFileModified);
        return () => eventBus.off('file:modified', handleFileModified);
    }, [eventBus, activeFilePath]);
}
```

### File Locations

- Hook: `src/components/ide/MonacoEditor/hooks/useMonacoEventSubscriptions.ts`
- Test: `src/components/ide/MonacoEditor/hooks/__tests__/useMonacoEventSubscriptions.test.ts`
- Reference: `src/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts`

## Research Requirements

- [x] TanStack AI tool patterns (Context7 - already researched)
- [x] EventEmitter3 subscription patterns (Deepwiki)
- [x] Existing event hooks in codebase (`useEventBusEffects.ts`, `useFileTreeEventSubscriptions.ts`)

## References

- [useFileTreeEventSubscriptions.ts](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/src/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts)
- [workspace-events.ts](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/src/lib/events/workspace-events.ts)
- [MonacoEditor.tsx](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/src/components/ide/MonacoEditor/MonacoEditor.tsx)
- [Implementation Plan](file:///C:/Users/Admin/.gemini/antigravity/brain/cbdb321a-3694-44eb-b257-5c3a0affd8df/implementation_plan.md)

## Dev Agent Record

**Agent:** Platform A (Antigravity - Gemini 2.5 Pro)  
**Session:** 2025-12-24T05:05:00+07:00

### Task Progress
- [x] T0: Review existing `useFileTreeEventSubscriptions` pattern
- [x] T1: Review EventBus event types in `workspace-events.ts`
- [x] T2: Create `useMonacoEventSubscriptions.ts` hook
- [x] T3: Create unit tests for hook (10 tests)
- [ ] T4: Integrate hook into MonacoEditor component (optional - deferred)
- [x] T5: Update sprint-status.yaml
- [x] T6: Update bmm-workflow-status.yaml

### Research Executed
- Context7: TanStack AI tool patterns reviewed
- Codebase: `useFileTreeEventSubscriptions.ts` pattern followed
- Codebase: `workspace-events.ts` event types reviewed

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| `src/components/ide/MonacoEditor/hooks/useMonacoEventSubscriptions.ts` | Created | 115 |
| `src/components/ide/MonacoEditor/hooks/__tests__/useMonacoEventSubscriptions.test.ts` | Created | 195 |

### Tests Created
- `useMonacoEventSubscriptions.test.ts`: 10 tests
  - Subscription lifecycle: 3 tests
  - Agent source filtering: 3 tests
  - ActiveFilePath filtering: 2 tests
  - Debouncing: 1 test
  - Content handling: 1 test

### Decisions Made
- Followed exact pattern from `useFileTreeEventSubscriptions` for consistency
- Used refs for callback stability to avoid stale closures
- Content filtering added (undefined content = no trigger)

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-24T05:05:00 | drafted | SM (Platform A) | Story created per story-dev-cycle |
| 2025-12-24T05:08:00 | ready-for-dev | SM (Platform A) | Context XML created |
| 2025-12-24T05:09:00 | in-progress | Dev (Platform A) | Implementation started |
| 2025-12-24T05:10:00 | review | Dev (Platform A) | 10/10 tests passing |
