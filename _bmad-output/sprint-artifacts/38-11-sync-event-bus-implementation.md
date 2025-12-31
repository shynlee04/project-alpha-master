---
date: 2025-12-31
time: 11:41:00+07:00
epic: EPIC-38
story: 38-11
status: drafted
team: Team-B
agent_mode: bmad-bmm-sm
---

# Story 38-11: Sync Event Bus Implementation

## User Story

```
As a developer working on the IDE
I want a centralized sync event bus
So that file changes, terminal events, and navigation updates are propagated reliably across components without tight coupling
```

## Story Metadata

| Property | Value |
|----------|-------|
| **Epic** | EPIC-38 (Project Management System Restoration) |
| **Priority** | P0 |
| **Effort** | 2 days |
| **Team** | Team B (Backend/Agent) |
| **Dependencies** | None (prerequisite for 38-1, 38-6) |

## Acceptance Criteria

### AC-1: Event bus supports pub/sub pattern with typed events
**Given** the SyncEventBus is instantiated
**When** subscribers register for event types
**Then** events are delivered only to subscribers of that type

### AC-2: File system sync events are published
**Given** files are created, modified, or deleted via LocalFSAdapter
**When** these operations occur
**Then** appropriate events are published with event type and payload

### AC-3: Terminal execution events are published
**Given** terminal commands are executed via TerminalAdapter
**When** output is produced or errors occur
**Then** terminal events are published for UI consumption

### AC-4: Navigation state changes trigger events
**Given** navigation state changes in the IDE
**When** files are opened, panels are switched
**Then** navigation events are published for sync UI components

### AC-5: Subscribers can filter events by namespace/topic
**Given** the event bus supports namespace filtering
**When** subscribers register with namespaces
**Then** only events matching the namespace are delivered

### AC-6: Event bus handles errors gracefully
**Given** a subscriber throws an error during event handling
**When** an error occurs
**Then** the error is caught and logged without breaking the event bus

### AC-7: TypeScript types ensure compile-time safety
**Given** TypeScript project configuration
**When** event types and payloads are defined
**Then** compile-time checking prevents type mismatches

## Tasks

- [ ] Implement SyncEventBus class with EventEmitter3
- [ ] Define TypeScript interfaces for sync events
- [ ] Integrate with LocalFSAdapter for file events
- [ ] Integrate with TerminalAdapter for terminal events
- [ ] Integrate with NavigationStore for navigation events
- [ ] Add event filtering by namespace
- [ ] Write unit tests for event bus functionality
- [ ] Document API usage

## Dev Notes

### Architecture Pattern
The SyncEventBus will follow a centralized pub/sub pattern using EventEmitter3:

```typescript
// Event types as string literals for type safety
type SyncEventType = 
  | 'file:created'
  | 'file:modified'
  | 'file:deleted'
  | 'terminal:output'
  | 'terminal:error'
  | 'navigation:changed';

// Interface for event payloads
interface SyncEventPayload<T = unknown> {
  type: SyncEventType;
  timestamp: number;
  data: T;
  source: string;
}

// Event bus class
class SyncEventBus {
  private emitter = new EventEmitter3();
  
  emit<T>(type: SyncEventType, data: T): void {
    this.emitter.emit(type, { 
      type, 
      timestamp: Date.now(), 
      data, 
      source: 'sync-bus' 
    });
  }
  
  on<T>(type: SyncEventType, callback: (payload: SyncEventPayload<T>) => void): void {
    this.emitter.on(type, callback);
  }
  
  off(type: SyncEventType, callback: Function): void {
    this.emitter.off(type, callback);
  }
}
```

### Integration Points
1. **File Events:** Wire into `LocalFSAdapter` methods (writeFile, deleteFile, etc.)
2. **Terminal Events:** Wire into `TerminalAdapter` for output and error streams
3. **Navigation Events:** Wire into `useNavigationStore` state changes

## Research Requirements

- [ ] Context7: Query EventEmitter3 official documentation for API patterns
- [ ] Deepwiki: Check existing event patterns in `src/lib/events/`
- [ ] Codebase: Analyze current file/terminal/navigation integration points

## References

1. **Tech Spec:** `_bmad-output/tech-specs/epic-38-tech-spec-2025-12-31.md`
2. **Sprint Plan:** `_bmad-output/sprint-artifacts/epic-38-sprint-plan-2025-12-31.md`
3. **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md`
4. **Event Library:** eventemitter3 (already in tech stack)
5. **Existing Events:** `src/lib/events/` - current event system patterns

---

## Dev Agent Record

### Agent: 
**Session:** 

#### Task Progress:
- [ ] T1: 

#### Research Executed:
- 

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|

#### Tests Created:

#### Decisions Made:

---

## Code Review

**Reviewer:** 
**Date:** 

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:

#### Sign-off:

---

## Status History

| Date | Time | Status | Agent | Notes |
|------|------|--------|-------|-------|
| 2025-12-31 | 11:41:00+07:00 | drafted | bmad-bmm-sm | Story file created |
