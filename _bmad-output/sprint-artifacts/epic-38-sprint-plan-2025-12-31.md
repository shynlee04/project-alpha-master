---
date: 2025-12-31
time: 11:45:00+07:00
phase: sprint-planning-complete
team: Team-A | Team-B
agent_mode: bmad-bmm-pm
---

# Sprint Plan: EPIC-38 Project Management System Restoration

## Executive Summary

| Property | Value |
|----------|-------|
| **Epic** | EPIC-38 - Project Management System Restoration |
| **Classification** | Core Infrastructure Enhancement |
| **Priority** | P0 |
| **Duration** | 3-4 weeks |
| **Start Date** | 2025-12-31 |
| **Target End Date** | 2026-01-21 |
| **Total Stories** | 12 (38-1 through 38-12) |
| **Team Assignment** | Team A (UI/Foundation), Team B (Backend/Agent) |

## Sprint Overview

### Week 1: Foundation (Dec 31 - Jan 6)
**Focus:** Core infrastructure - SyncEventBus and Reverse Sync

| Day | Team A | Team B |
|-----|--------|--------|
| Dec 31 | 38-10: State Management Cleanup | 38-11: Sync Event Bus |
| Jan 1 | 38-10: State Management Cleanup | 38-11: Sync Event Bus |
| Jan 2 | 38-6: Sync Status UI Components | 38-1: Reverse Sync Infrastructure |
| Jan 3 | 38-6: Sync Status UI Components | 38-1: Reverse Sync Infrastructure |
| Jan 4 | Weekend | Weekend |
| Jan 5 | Weekend | Weekend |
| Jan 6 | 38-7: File Tree Sync Integration | 38-1: Reverse Sync Infrastructure |

### Week 2: Integration (Jan 7 - Jan 13)
**Focus:** UI integration and initialization

| Day | Team A | Team B |
|-----|--------|--------|
| Jan 7 | 38-7: File Tree Sync Integration | 38-1: Reverse Sync (complete if needed) |
| Jan 8 | 38-2: Project Initialization Workflow | 38-3: Space Management Service |
| Jan 9 | 38-2: Project Initialization Workflow | 38-3: Space Management Service |
| Jan 10 | 38-5: Editor Auto-Save Integration | 38-4: Terminal Sync Integration |
| Jan 11 | Weekend | Weekend |
| Jan 12 | Weekend | Weekend |
| Jan 13 | 38-8: Properties Panel Component | 38-4: Terminal Sync Integration |

### Week 3: Features (Jan 14 - Jan 20)
**Focus:** Feature completion and minor enhancements

| Day | Team A | Team B |
|-----|--------|--------|
| Jan 14 | 38-8: Properties Panel Component | 38-4: Terminal Sync (complete if needed) |
| Jan 15 | 38-9: Navigation Sync Enhancements | Buffer / Tech debt |
| Jan 16 | 38-9: Navigation Sync Enhancements | Buffer / Tech debt |
| Jan 17 | Buffer / Code Review | Buffer / Tech debt |
| Jan 18 | Weekend | Weekend |
| Jan 19 | Weekend | Weekend |
| Jan 20 | Weekend | Weekend |

### Week 4: Testing (Jan 21+)
**Focus:** Integration testing and bug fixes

| Day | Team A | Team B |
|-----|--------|--------|
| Jan 21 | 38-12: Integration Testing (Both) | 38-12: Integration Testing (Both) |
| Jan 22 | 38-12: Integration Testing | 38-12: Integration Testing |
| Jan 23 | 38-12: Integration Testing | 38-12: Integration Testing |
| Jan 24 | Epic Retrospective | Epic Retrospective |

## Story Details

### P0 Stories (Critical Path)

#### Story 38-10: State Management Cleanup
**Priority:** P0 | **Effort:** 1 day | **Team:** Team A

**User Story:**
> As a developer, I want consistent state management across the IDE so that duplicate state issues are eliminated.

**Acceptance Criteria:**
- [ ] IDELayout.tsx uses useIDEStore instead of local useState
- [ ] No duplicate state definitions for IDE state
- [ ] All IDE state flows through single source of truth
- [ ] TypeScript compilation succeeds
- [ ] Tests pass

**Dependencies:** None
**Risk:** Low - Well-documented issue with clear fix

---

#### Story 38-11: Sync Event Bus Implementation
**Priority:** P0 | **Effort:** 2 days | **Team:** Team B

**User Story:**
> As the sync system, I need an event bus for decoupled communication so that sync events can be published and subscribed to without tight coupling.

**Acceptance Criteria:**
- [ ] SyncEventBus class implemented
- [ ] Event types defined for all sync operations
- [ ] Pub/sub pattern working correctly
- [ ] Event history for debugging
- [ ] Unit tests ≥90% coverage

**Dependencies:** None
**Risk:** Medium - Foundation component, bugs propagate

---

#### Story 38-1: Reverse Sync Infrastructure
**Priority:** P0 | **Effort:** 3 days | **Team:** Team B

**User Story:**
> As a user, I want changes made in the WebContainer (e.g., via terminal) to sync back to my local filesystem so that my files are always consistent.

**Acceptance Criteria:**
- [ ] File watcher monitors WebContainer file changes
- [ ] Change detection via checksums
- [ ] Conflict resolution with deterministic rules
- [ ] Changes propagate to local FS
- [ ] Performance < 500ms for files < 1MB

**Dependencies:** 38-11 (SyncEventBus)
**Risk:** High - Core new functionality

---

#### Story 38-6: Sync Status UI Components
**Priority:** P0 | **Effort:** 2 days | **Team:** Team A

**User Story:**
> As a user, I want to see the current sync status so that I know when files are being synced and if there are any conflicts.

**Acceptance Criteria:**
- [ ] SyncStatusIndicator component
- [ ] SyncConflictDialog component
- [ ] Real-time status updates via event bus
- [ ] i18n support (EN + VI)
- [ ] Design tokens used for styling

**Dependencies:** 38-11 (SyncEventBus)
**Risk:** Medium - UI integration with state

---

#### Story 38-7: File Tree Sync Integration
**Priority:** P0 | **Effort:** 3 days | **Team:** Team A

**User Story:**
> As a user, I want the file tree to reflect real-time sync changes so that I can see when files are created, modified, or deleted.

**Acceptance Criteria:**
- [ ] File tree subscribes to sync events
- [ ] Visual indicators for sync status
- [ ] Auto-refresh on sync changes
- [ ] Performance < 100ms after sync event
- [ ] Handles deleted files gracefully

**Dependencies:** 38-6 (Sync Status UI)
**Risk:** High - UI reactivity to backend events

---

### P1 Stories (Important)

#### Story 38-2: Project Initialization Workflow
**Priority:** P0 | **Effort:** 2 days | **Team:** Team A

**User Story:**
> As a user, I want a smooth project initialization flow so that I can quickly set up and start working on my projects.

**Acceptance Criteria:**
- [ ] ProjectInitDialog component
- [ ] Directory picker integration
- [ ] Permission request flow
- [ ] Error handling for permission denial
- [ ] i18n support

**Dependencies:** None
**Risk:** Medium - User-facing critical flow

---

#### Story 38-3: Space Management Service
**Priority:** P1 | **Effort:** 2 days | **Team:** Team B

**User Story:**
> As a user, I want the system to manage disk space so that I don't run out of space and get clear warnings when I'm low.

**Acceptance Criteria:**
- [ ] SpaceManager class implemented
- [ ] Quota enforcement
- [ ] Warning thresholds
- [ ] Warning notifications via event bus
- [ ] Unit tests

**Dependencies:** None
**Risk:** Medium - Infrastructure component

---

#### Story 38-4: Terminal Sync Integration
**Priority:** P1 | **Effort:** 1 day | **Team:** Team B

**User Story:**
> As a user, I want terminal operations that modify files to automatically sync back to my local filesystem so that my file system stays in sync.

**Acceptance Criteria:**
- [ ] Terminal exit triggers sync
- [ ] File modifications detected
- [ ] Sync called after terminal exit
- [ ] Error handling for failed syncs

**Dependencies:** 38-1 (Reverse Sync)
**Risk:** Medium - Terminal integration

---

#### Story 38-5: Editor Auto-Save Integration
**Priority:** P1 | **Effort:** 2 days | **Team:** Team A

**User Story:**
> As a user, I want my editor changes to auto-save so that I don't lose work and changes sync to local FS.

**Acceptance Criteria:**
- [ ] Monaco Editor auto-save hook
- [ ] Configurable delay
- [ ] Local FS writes
- [ ] Sync trigger after save
- [ ] Performance < 2s trigger

**Dependencies:** None
**Risk:** Medium - Editor integration

---

#### Story 38-8: Properties Panel Component
**Priority:** P1 | **Effort:** 2 days | **Team:** Team A

**User Story:**
> As a user, I want to see file properties in a panel so that I can understand file metadata and sync status.

**Acceptance Criteria:**
- [ ] PropertiesPanel component
- [ ] File metadata display
- [ ] Sync status display
- [ ] Sync history
- [ ] i18n support

**Dependencies:** None
**Risk:** Low - Display component

---

#### Story 38-12: Integration Testing
**Priority:** P1 | **Effort:** 3 days | **Team:** Both

**User Story:**
> As the QA team, I want comprehensive integration tests so that the bidirectional sync system works correctly end-to-end.

**Acceptance Criteria:**
- [ ] Bidirectional sync E2E tests
- [ ] Conflict resolution tests
- [ ] Performance tests
- [ ] All tests pass
- [ ] Test coverage ≥85%

**Dependencies:** All other stories
**Risk:** Medium - Testing requires all features

---

### P2 Stories (Nice to Have)

#### Story 38-9: Navigation Sync Enhancements
**Priority:** P2 | **Effort:** 1 day | **Team:** Team A

**User Story:**
> As a user, I want navigation state to sync with file changes so that my editor tabs and navigation stay consistent.

**Acceptance Criteria:**
- [ ] Tab selection syncs with file changes
- [ ] Navigation history preserved
- [ ] No navigation state loss on refresh

**Dependencies:** None
**Risk:** Low - Enhancement

---

## Team Assignments Summary

### Team A (UI/Foundation)
| Story | Name | Effort | Week |
|-------|------|--------|-------|
| 38-10 | State Management Cleanup | 1 day | Week 1 |
| 38-6 | Sync Status UI Components | 2 days | Week 1-2 |
| 38-7 | File Tree Sync Integration | 3 days | Week 1-2 |
| 38-2 | Project Initialization Workflow | 2 days | Week 2 |
| 38-5 | Editor Auto-Save Integration | 2 days | Week 2 |
| 38-8 | Properties Panel Component | 2 days | Week 2-3 |
| 38-9 | Navigation Sync Enhancements | 1 day | Week 3 |
| 38-12 | Integration Testing | 3 days | Week 4 |
| **Total** | | **16 days** | |

### Team B (Backend/Agent)
| Story | Name | Effort | Week |
|-------|------|--------|-------|
| 38-11 | Sync Event Bus Implementation | 2 days | Week 1 |
| 38-1 | Reverse Sync Infrastructure | 3 days | Week 1-2 |
| 38-3 | Space Management Service | 2 days | Week 2 |
| 38-4 | Terminal Sync Integration | 1 day | Week 2-3 |
| 38-12 | Integration Testing | 3 days | Week 4 |
| **Total** | | **11 days** | |

## Integration Checkpoints

### Checkpoint 1: Foundation Complete (End of Week 1)
- [ ] 38-10: State Management Cleanup complete
- [ ] 38-11: Sync Event Bus complete
- [ ] 38-1: Reverse Sync Infrastructure in progress

### Checkpoint 2: Core Features Complete (End of Week 2)
- [ ] 38-1: Reverse Sync Infrastructure complete
- [ ] 38-6: Sync Status UI complete
- [ ] 38-7: File Tree Sync Integration in progress
- [ ] 38-2: Project Initialization complete
- [ ] 38-5: Editor Auto-Save in progress

### Checkpoint 3: Feature Complete (End of Week 3)
- [ ] 38-7: File Tree Sync Integration complete
- [ ] 38-5: Editor Auto-Save complete
- [ ] 38-3: Space Management complete
- [ ] 38-4: Terminal Sync complete
- [ ] 38-8: Properties Panel complete
- [ ] 38-9: Navigation Sync complete

### Checkpoint 4: Release Ready (End of Week 4)
- [ ] 38-12: Integration Testing complete
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Code review complete
- [ ] Epic retrospective complete

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Reverse sync performance issues | High | Medium | Performance targets, incremental sync |
| Event bus bugs propagate | High | Low | Thorough unit tests, integration tests |
| Conflict resolution edge cases | Medium | Medium | Deterministic rules, user fallback |
| WebContainer file watching unstable | Medium | Low | Polling fallback implementation |
| State cleanup breaking existing code | High | Low | Careful refactoring, tests pass |

## Dependencies Graph

```
38-11 (Event Bus)
    │
    ├──► 38-1 (Reverse Sync)
    │         │
    │         └──► 38-4 (Terminal Sync)
    │
    ├──► 38-6 (Sync Status UI)
    │         │
    │         └──► 38-7 (File Tree Sync)
    │
    └──► 38-3 (Space Management)

38-10 (State Cleanup) ────────► Independent

38-2 (Project Init) ────────► Independent

38-5 (Editor Auto-Save) ────► Independent

38-8 (Properties Panel) ────► Independent

38-9 (Nav Sync) ───────────► Independent

All Stories ────────────────► 38-12 (Integration Testing)
```

## Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| File sync (<1MB) | < 500ms | Performance.now() |
| Auto-save trigger | < 2s after inactivity | Timer measurement |
| File tree update | < 100ms after sync event | Event to render |
| Event bus publish | < 10ms | Synchronous publish |
| Conflict detection | < 50ms | Checksum comparison |

## Quality Gates

### Gate 1: Week 1 End
- [ ] All P0 foundation stories in progress
- [ ] SyncEventBus tests ≥90%
- [ ] No critical bugs

### Gate 2: Week 2 End
- [ ] Reverse sync functional
- [ ] UI components rendering correctly
- [ ] Performance targets met

### Gate 3: Week 3 End
- [ ] All stories code complete
- [ ] Integration tests written
- [ ] Code review complete

### Gate 4: Week 4 End
- [ ] All tests passing
- [ ] No critical/high bugs
- [ ] Retrospective complete

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Story completion | 12/12 (100%) | sprint-status.yaml |
| Test coverage | ≥85% | Vitest coverage report |
| Performance targets | All met | Performance tests |
| Bug count | < 5 low severity | Bug tracker |
| On-time delivery | Yes/no | Schedule adherence |

## Next Steps

1. **Immediate (Day 1):** 
   - Create story files for 38-10, 38-11 (foundation stories)
   - Team A starts 38-10, Team B starts 38-11

2. **Week 1 End:**
   - Verify Checkpoint 1 completion
   - Adjust schedule if needed

3. **Week 2 Start:**
   - Begin 38-1 (depends on 38-11)
   - Begin 38-6 (depends on 38-11)

4. **Continuous:**
   - Daily sync between teams
   - Integration testing throughout
   - Performance monitoring

## Artifacts Created

| Artifact | Location |
|----------|----------|
| Sprint Plan | `_bmad-output/sprint-artifacts/epic-38-sprint-plan-2025-12-31.md` |
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` |
| Tech Spec | `_bmad-output/tech-specs/epic-38-tech-spec-2025-12-31.md` |

---

*Generated: 2025-12-31T11:45:00+07:00*
*Document ID: epic-38-sprint-plan-2025-12-31*
*Agent: @bmad-bmm-pm*
