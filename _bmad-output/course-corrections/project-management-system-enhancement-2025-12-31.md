---
date: 2025-12-31
time: 11:20:00+07:00
phase: correct-course-analysis
team: Team-A
agent_mode: bmad-core-bmad-master
triggered_by: user-requirements-enhanced-project-management-system
status: DRAFT
---

# Course Correction Proposal: Enhanced Project Management System

## Executive Summary

This document outlines a comprehensive course correction for the Enhanced Project Management System, addressing synchronization infrastructure restoration and enhancement. The system requires bidirectional data flow between the central hub/workspace and user-local file systems, encompassing file management, terminal operations, and editor integration with auto-save capabilities.

**Classification:** Major Sprint Change (Scope: Medium)
**Priority:** P0 - Critical Infrastructure Restoration
**Impacted Areas:** Backend Sync Services, Frontend UI Components, State Management
**Estimated Effort:** 3-4 weeks

---

## 1. Current State Analysis

### 1.1 Existing Sync Infrastructure

The project currently has the following sync infrastructure in place:

| Component | Location | Status | Coverage |
|-----------|----------|--------|----------|
| LocalFSAdapter | `src/lib/filesystem/local-fs-adapter.ts` | ✅ Operational | File operations, FSA API |
| SyncManager | `src/lib/filesystem/sync-manager.ts` | ✅ Operational | File sync orchestration |
| FSA Permissions | `src/lib/filesystem/permission-lifecycle.ts` | ✅ Operational | Permission persistence |
| Dexie Schema v9 | `src/lib/state/dexie-db.ts` | ✅ Operational | Metadata caching |
| FileMetadataCache | `src/lib/filesystem/file-metadata-cache.ts` | ✅ Operational | Incremental sync |

### 1.2 Existing Frontend Components

| Component | Location | Status |
|-----------|----------|--------|
| File Tree | `src/components/ide/file-tree/` | ⚠️ Partial - requires sync integration |
| Sync Status Indicators | `src/lib/state/file-sync-status-store.ts` | ✅ Store exists, UI pending |
| Terminal | `src/components/ide/terminal/` | ✅ Basic - needs sync events |
| Editor | `src/components/ide/editor/` | ✅ Basic - auto-save pending |
| Navigation | `src/components/layout/` | ✅ Exists - enhancements needed |

### 1.3 Known Gaps from Previous Audits

Based on the P1.10 State Management Audit and Ralph Loop findings:

1. **State Duplication**: `IDELayout.tsx` duplicates IDE state (deferred P0 issue)
2. **Sync Event Propagation**: Terminal-initiated changes don't trigger sync events
3. **Editor Auto-Save**: Incremental sync not integrated with Monaco
4. **Space Management**: Rename/remove operations need proper sync propagation
5. **Project Initialization**: No standardized workflow for new project setup

---

## 2. Requirements Analysis

### 2.1 Core Functional Requirements

#### 2.1.1 Hub-to-Local Synchronization

**Requirement:** Robust bidirectional synchronization between central hub and user's local drive.

**Current State:**
- Local FS is source of truth (verified)
- SyncManager handles direction: Local → WebContainer
- Missing: WebContainer → Local propagation

**Gap Analysis:**
| Direction | Status | Missing |
|-----------|--------|---------|
| Local → WebContainer | ✅ Complete | - |
| WebContainer → Local | ❌ Missing | Reverse sync mechanism |
| Conflict Resolution | ❌ Missing | Merge strategy implementation |
| Real-time Status | ⚠️ Partial | UI integration incomplete |

**Proposed Solution:**
```typescript
// New: Reverse Sync Service
interface ReverseSyncService {
  watchWebContainer(): Promise<void>;
  handleFileChange(event: FileSystemChangeEvent): Promise<SyncResult>;
  resolveConflict(local: FileState, remote: FileState): Promise<ConflictResolution>;
}
```

#### 2.1.2 New Project Initialization Workflow

**Requirement:** Standardized project creation with folder selection, permission configuration, and sync initialization.

**Current State:** No dedicated project initialization service
**Missing Components:**
- Folder picker integration
- Permission request workflow
- Sync session initialization
- Confirmation UI

**Proposed Solution:**
```typescript
// New: Project Initialization Service
interface ProjectInitializationService {
  selectTargetFolder(): Promise<DirectoryHandle>;
  configurePermissions(handle: DirectoryHandle): Promise<PermissionConfig>;
  initializeSyncSession(config: SyncConfig): Promise<SyncSession>;
  confirmSetup(session: SyncSession): Promise<void>;
}
```

#### 2.1.3 Space Management Operations

**Requirement:** Rename and remove space operations with proper local folder propagation.

**Current State:** No dedicated space management service
**Missing Components:**
- Rename propagation to local folder
- Safe delete with confirmation
- Sync state cleanup on remove
- Local reference management

**Proposed Solution:**
```typescript
// New: Space Management Service
interface SpaceManagementService {
  renameSpace(spaceId: string, newName: string): Promise<void>;
  removeSpace(spaceId: string, confirmDelete: boolean): Promise<void>;
  cleanupSyncState(spaceId: string): Promise<void>;
}
```

### 2.2 Infrastructure Integration Requirements

#### 2.2.1 File System Layer

**Requirement:** Standard directory operations with sync state awareness.

**Current State:** LocalFSAdapter exists but lacks sync event emission
**Missing:**
- Event emission on file operations
- Conflict detection before write
- Batch operation atomicity

#### 2.2.2 Terminal Integration

**Requirement:** Terminal operations interface with sync layer for change propagation.

**Current State:** TerminalAdapter exists but sync events not wired
**Missing:**
- Sync event emission on file manipulation
- Working directory sync state tracking
- Command result sync triggering

#### 2.2.3 Editor Integration with Auto-Save

**Requirement:** Intelligent auto-save with incremental sync updates.

**Current State:** Monaco editor integration exists
**Missing:**
- Auto-save trigger configuration
- Incremental sync on content change
- Cursor/scroll state persistence
- Concurrent editing conflict handling

### 2.3 Frontend Component Requirements

#### 2.3.1 File Tree Component

**Requirement:** Visualize synchronized file hierarchy with real-time updates.

**Current State:** File tree components exist
**Enhancements Needed:**
- Real-time sync status badges
- Pending sync indicator
- Conflict visual markers
- Expansion state persistence

#### 2.3.2 Sync Status Indicators

**Requirement:** Visual indicators for sync state across UI contexts.

**Current State:** FileSyncStatusStore exists
**Enhancements Needed:**
- Status indicator component
- Animation for sync in progress
- Error state display
- Connection unavailable state

#### 2.3.3 Component Properties Interface

**Requirement:** Properties panel for file system objects.

**Current State:** Not implemented
**Required Features:**
- Metadata display (sync status, last modified)
- Available actions based on permissions
- Quick sync operations

#### 2.3.4 Navigation Framework

**Requirement:** Intuitive access to synchronization functions.

**Current State:** Navigation components exist
**Enhancements Needed:**
- Sync status in navigation bar
- Project selection quick access
- Space management quick actions
- Settings integration

---

## 3. Gap Analysis Summary

### 3.1 Backend Infrastructure Gaps

| Gap | Severity | Priority | Estimated Effort |
|-----|----------|----------|------------------|
| Reverse Sync (WC → Local) | Critical | P0 | 2-3 days |
| Conflict Resolution | High | P0 | 1-2 days |
| Project Initialization | High | P0 | 1-2 days |
| Space Management | Medium | P1 | 1-2 days |
| Terminal Sync Events | Medium | P1 | 1 day |
| Editor Auto-Save | Medium | P1 | 2 days |

### 3.2 Frontend Component Gaps

| Gap | Severity | Priority | Estimated Effort |
|-----|----------|----------|------------------|
| Sync Status UI | High | P0 | 1-2 days |
| File Tree Sync Integration | High | P0 | 2-3 days |
| Properties Panel | Medium | P1 | 1-2 days |
| Navigation Enhancements | Low | P2 | 1 day |
| Error State UI | Medium | P1 | 1 day |

### 3.3 State Management Gaps

| Gap | Severity | Priority | Estimated Effort |
|-----|----------|----------|------------------|
| IDELayout State Duplication | Critical | P0 | 1 day |
| Sync Event Bus | High | P0 | 1-2 days |
| Session State Persistence | Medium | P1 | 1 day |

---

## 4. Proposed Epic Structure

### 4.1 New Epic: EPIC-38 - Project Management System Restoration

**Classification:** Core Infrastructure Enhancement
**Priority:** P0
**Estimated Duration:** 3-4 weeks
**Dependencies:** Epic 24 (completed), Epic 3 (completed)

#### 4.1.1 Stories Overview

| Story ID | Name | Effort | Priority | Team |
|----------|------|--------|----------|------|
| 38-1 | Reverse Sync Infrastructure | 3 days | P0 | Team B |
| 38-2 | Project Initialization Workflow | 2 days | P0 | Team A |
| 38-3 | Space Management Service | 2 days | P1 | Team B |
| 38-4 | Terminal Sync Integration | 1 day | P1 | Team B |
| 38-5 | Editor Auto-Save Integration | 2 days | P1 | Team A |
| 38-6 | Sync Status UI Components | 2 days | P0 | Team A |
| 38-7 | File Tree Sync Integration | 3 days | P0 | Team A |
| 38-8 | Properties Panel Component | 2 days | P1 | Team A |
| 38-9 | Navigation Sync Enhancements | 1 day | P2 | Team A |
| 38-10 | State Management Cleanup | 1 day | P0 | Team A |
| 38-11 | Sync Event Bus Implementation | 2 days | P0 | Team B |
| 38-12 | Integration Testing | 3 days | P1 | Both |

#### 4.1.2 Story Details

**Story 38-1: Reverse Sync Infrastructure**
```
AC1: WebContainer file watcher implemented
AC2: File change events propagate to SyncManager
AC3: Conflict detection before local write
AC4: Automatic merge for non-conflicting changes
AC5: User notification for manual merge required
AC6: Tests coverage ≥90%
```

**Story 38-2: Project Initialization Workflow**
```
AC1: Directory picker integration (showDirectoryPicker)
AC2: Permission request workflow (read/write)
AC3: Sync session initialization
AC4: Confirmation UI with status
AC5: Cancel/cleanup on failure
AC6: Tests coverage ≥90%
```

**Story 38-3: Space Management Service**
```
AC1: Rename operation propagates to local folder
AC2: Remove operation with confirmation dialog
AC3: Sync state cleanup on space removal
AC4: Local reference invalidation
AC5: Tests coverage ≥90%
```

**Story 38-4: Terminal Sync Integration**
```
AC1: File operation events emitted from terminal
AC2: SyncManager receives terminal events
AC3: Working directory sync state tracking
AC4: Tests coverage ≥90%
```

**Story 38-5: Editor Auto-Save Integration**
```
AC1: Auto-save trigger on content change (debounced)
AC2: Incremental sync on auto-save
AC3: Cursor/scroll state persistence
AC4: Conflict detection before auto-save
AC5: Tests coverage ≥90%
```

**Story 38-6: Sync Status UI Components**
```
AC1: SyncStatusIndicator component (8-bit styled)
AC2: Sync progress animation
AC3: Error state display
AC4: Connection unavailable state
AC5: Tests coverage ≥90%
```

**Story 38-7: File Tree Sync Integration**
```
AC1: Sync status badges on tree nodes
AC2: Pending sync indicator (spinner)
AC3: Conflict visual markers (red highlight)
AC4: Expansion state persistence
AC5: Tests coverage ≥90%
```

**Story 38-8: Properties Panel Component**
```
AC1: File metadata display (sync status, modified)
AC2: Available actions based on permissions
AC3: Quick sync operations (refresh, force sync)
AC4: Tests coverage ≥90%
```

**Story 38-9: Navigation Sync Enhancements**
```
AC1: Sync status in navigation bar
AC2: Project selection quick access
AC3: Space management in nav menu
AC4: Tests coverage ≥90%
```

**Story 38-10: State Management Cleanup**
```
AC1: IDELayout uses useIDEStore for state
AC2: Remove duplicate useState usage
AC3: State hydration on page load
AC4: Tests coverage ≥90%
```

**Story 38-11: Sync Event Bus Implementation**
```
AC1: EventBus singleton for sync events
AC2: Event types: sync-start, sync-progress, sync-complete, conflict, error
AC3: Subscribers receive events in order
AC4: Tests coverage ≥90%
```

**Story 38-12: Integration Testing**
```
AC1: End-to-end sync flow tests
AC2: Conflict resolution tests
AC3: Project initialization tests
AC4: Space management tests
AC5: Overall test coverage ≥85%
```

---

## 5. Implementation Strategy

### 5.1 Phase 1: Foundation (Days 1-5)

**Focus:** Backend infrastructure restoration

| Day | Focus | Stories |
|-----|-------|---------|
| 1 | Event Bus | 38-11 |
| 2 | Reverse Sync | 38-1 |
| 3 | Project Init | 38-2 |
| 4 | Space Management | 38-3 |
| 5 | Terminal Integration | 38-4 |

### 5.2 Phase 2: Editor Integration (Days 6-7)

**Focus:** Editor and state management

| Day | Focus | Stories |
|-----|-------|---------|
| 6 | Auto-Save | 38-5 |
| 7 | State Cleanup | 38-10 |

### 5.3 Phase 3: Frontend Components (Days 8-12)

**Focus:** UI component development

| Day | Focus | Stories |
|-----|-------|---------|
| 8 | Sync Status UI | 38-6 |
| 9 | File Tree Integration | 38-7 |
| 10 | Properties Panel | 38-8 |
| 11 | Navigation | 38-9 |
| 12 | Buffer/Contingency | - |

### 5.4 Phase 4: Integration & Testing (Days 13-15)

**Focus:** Testing and validation

| Day | Focus | Activities |
|-----|-------|------------|
| 13 | Integration | Cross-component testing |
| 14 | E2E Testing | Full workflow tests |
| 15 | Certification | Ralph Loop validation |

---

## 6. Architecture Impact

### 6.1 Updated Sync Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REVISED SYNC ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS       │
│        ↑                                    ↑                    ↑           │
│        │                                    │                    │           │
│        ↓                                    ↓                    │           │
│   [Reverse Sync]                      [Event Bus]              │           │
│        ↑                                    │                    │           │
│        │                                    ↓                    │           │
│   WebContainer ───────────────────→ Terminal/Editor           │           │
│   File Watcher                      (Auto-save, Commands)      │           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 New Component Dependencies

| New Component | Depends On | Depended By |
|---------------|------------|-------------|
| ReverseSyncService | SyncManager, EventBus | FileTree, SyncStatusUI |
| ProjectInitService | LocalFSAdapter | HubHomePage |
| SpaceManager | SyncManager, ProjectStore | FileTree, Navigation |
| TerminalSync | TerminalAdapter, EventBus | SyncManager |
| EditorSync | MonacoEditor, EventBus | SyncManager |
| SyncEventBus | - | All sync components |
| SyncStatusUI | SyncEventBus, DesignTokens | - |
| FileTreeSync | SyncEventBus, DesignTokens | - |
| PropertiesPanel | FileMetadata, SyncStatus | - |
| NavigationSync | SyncEventBus | - |

---

## 7. Risk Assessment

### 7.1 High Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebContainer file watching unstable | Medium | High | Implement polling fallback, test extensively |
| Conflict resolution edge cases | High | Medium | Comprehensive test suite, user manual merge option |
| Performance degradation with reverse sync | Medium | Medium | Debounced sync, incremental only |

### 7.2 Mitigation Strategies

1. **WebContainer Stability**: Implement both watcher API and polling fallback
2. **Conflict Handling**: Clear UI for manual merge, automated for simple cases
3. **Performance**: Debounced sync operations, chunked file transfers

---

## 8. Success Criteria

### 8.1 Functional Criteria

- [ ] Bidirectional sync working for all file operations
- [ ] Project initialization workflow completes without errors
- [ ] Space rename/remove operations propagate correctly
- [ ] Terminal file operations trigger sync events
- [ ] Editor auto-save integrates with sync layer
- [ ] Sync status visible in all relevant UI contexts

### 8.2 Performance Criteria

- [ ] Sync operations complete within 500ms for files <1MB
- [ ] Auto-save triggers within 2 seconds of user inactivity
- [ ] File tree updates within 100ms of sync events
- [ ] No UI blocking during sync operations

### 8.3 Quality Criteria

- [ ] Test coverage ≥90% for sync infrastructure
- [ ] Test coverage ≥85% for frontend components
- [ ] Ralph Loop validation passes
- [ ] No critical/high issues from security audit

---

## 9. Next Steps

### Immediate Actions (Day 0)

1. **Approve this proposal** via correct-course workflow
2. **Update workflow status** with new Epic 38
3. **Create story files** for each story in Epic 38
4. **Assign teams** for parallel development

### Handoff Sequence

1. **@bmad-bmm-architect** → Technical specification for Epic 38
2. **@bmad-bmm-pm** → Sprint planning for Epic 38
3. **@bmad-bmm-dev** → Implementation (Team A: UI, Team B: Backend)
4. **@bmad-bmm-tea** → Test strategy and validation
5. **@code-reviewer** → Code review gates

---

## 10. References

### Existing Documentation

- `AGENTS.md` - Project development patterns
- `bmm-workflow-status.yaml` - Current workflow state
- `sprint-status.yaml` - Sprint tracking
- `epics.md` - Epic definitions
- `architecture.md` - System architecture

### Related Epics

- **Epic 3** (DONE): Local-First File Magic - Foundation for current sync
- **Epic 24** (DONE): Performance & UX - Dexie v9 schema, incremental sync

### Technical References

- [WebContainer API Documentation](https://developer.stackblitz.com/platform/api/webcontainer-api)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [TanStack Store](https://tanstack.com/store)
- [Dexie.js](https://dexie.org)

---

## 11. Approval Status

| Role | Name | Status | Date |
|------|------|--------|------|
| BMAD Master | @bmad-core-bmad-master | DRAFT | 2025-12-31 |
| Architect | @bmad-bmm-architect | PENDING | - |
| Product Manager | @bmad-bmm-pm | PENDING | - |
| User Approval | - | PENDING | - |

---

*Document Version: 1.0*
*Created: 2025-12-31T11:20:00+07:00*
*Last Updated: 2025-12-31T11:20:00+07:00*
