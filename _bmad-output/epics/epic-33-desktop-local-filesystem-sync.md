---
epic_id: 33
title: "Desktop Local Filesystem Synchronization"
status: PROPOSED
created: "2026-01-01T01:43:05+07:00"
priority: P0
effort_hours: 40
trigger: "NRM Course Correction Sprint Change Proposal"
document: "_bmad-output/project-planning-artifacts/sprint-change-proposal-nrm-course-correction-2026-01-01.md"
---

# Epic 33: 📁 Desktop Local Filesystem Synchronization

## Overview

**User Outcome:** Desktop users can synchronize local folders with knowledge synthesis workspaces, accessing and modifying content from any interface.

**Social Media Appeal:** ⭐⭐⭐⭐⭐ — "Your local files, everywhere" — folder sync demo, bidirectional updates

**Priority:** P0 (Critical for Knowledge Synthesis Station mission)

**Estimated Effort:** 40 hours (5 working days)

---

## Problem Statement

Currently, the platform has several isolated file synchronization mechanisms:
- IDE workspace uses `IDEFileSyncService` for WebContainer sync
- Notes workspace has `NoteFileSyncService` but it's not connected to FSA
- Knowledge workspace uses in-memory `KnowledgeFileSyncService`
- Project metadata stored in IndexedDB but not reactive across workspaces

Desktop users who manage documents on their local drives cannot:
1. Sync local folders into knowledge synthesis workspaces
2. Access synchronized content from different interfaces (Notes, Knowledge, IDE)
3. Have CRUD operations on local files accessible from multiple interface contexts

---

## Requirements Coverage

| FR ID | Requirement | Coverage |
|-------|-------------|----------|
| FR-STATE-05 | Desktop Synchronization | **NEW** |
| FR-STATE-06 | Tab-Based Access | **NEW** |
| FR-STATE-03 | Dual-Write Sync (Extended) | **ENHANCED** |

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WorkspaceContext                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │   useProjectStore │◄──►│ useActiveProject │◄──►│ ProjectContext│ │
│  └────────┬─────────┘    └──────────────────┘    └───────────────┘ │
│           │                                                         │
│           ▼                                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  UnifiedFileSyncFactory                        │  │
│  │  - getService(workspace: 'ide'|'notes'|'knowledge')           │  │
│  │  - mountProject(projectId: string)                             │  │
│  │  - getSyncStatus(): AggregatedSyncStatus                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│           │                                                         │
│     ┌─────┴─────────────────────────────────────────────┐          │
│     ▼                    ▼                    ▼          │          │
│ ┌─────────────┐  ┌───────────────┐  ┌─────────────────┐│          │
│ │IDEFileSyncService│  │NotesFileSyncService│  │KnowledgeFileSyncService│          │
│ └──────┬──────┘  └───────┬───────┘  └────────┬────────┘│          │
│        │                 │                    │         │          │
│        ▼                 ▼                    ▼         │          │
│ ┌──────────────────────────────────────────────────────┤          │
│ │              LocalFSAdapter (Shared FSA Handle)       │          │
│ └──────────────────────────────────────────────────────┘          │
│                          │                                          │
│                          ▼                                          │
│              ┌─────────────────────────┐                            │
│              │   Local Filesystem (FSA)│                            │
│              └─────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User selects local folder** → FSA `showDirectoryPicker()` → Handle stored in ProjectStore
2. **Project mounted** → `UnifiedFileSyncFactory.mountProject(projectId)` → Shared FSA adapter created
3. **Workspace requests service** → Factory returns workspace-appropriate wrapper
4. **File changed locally** → File watcher detects → Event emitted to cross-workspace bus
5. **File changed in workspace** → Service writes to FSA → Event emitted → Other workspaces refresh

---

## Stories

### Story 33-1: Local Folder Configuration UI

**As a** desktop user,
**I want** to configure a local folder as my sync target,
**So that** my local files are accessible from all workspaces.

**Acceptance Criteria:**

**Given** a user on the Hub or Settings page  
**When** they click "Configure Sync Folder"  
**Then** a `showDirectoryPicker()` dialog appears  
**And** the selected folder is stored with the current project  
**And** the folder path is displayed in the UI

**Given** a user with a sync folder configured  
**When** they open any workspace  
**Then** the project selector shows the sync status  
**And** they can access files from the local folder

**Priority:** P0  
**Effort:** 6 hours

**Implementation Files:**
- `src/presentation/components/settings/LocalSyncConfigDialog.tsx`
- `src/lib/workspace/sync-config-store.ts`

---

### Story 33-2: Bidirectional Sync Engine

**As a** developer,
**I want** a sync engine that handles bidirectional file changes,
**So that** local and workspace files stay in sync.

**Acceptance Criteria:**

**Given** a local file is modified  
**When** the file watcher detects the change  
**Then** the corresponding workspace is updated within 5s  
**And** a sync event is emitted

**Given** a workspace file is modified  
**When** the file is saved  
**Then** the local file is updated within 5s  
**And** a sync event is emitted

**Given** both local and workspace are modified simultaneously  
**When** a conflict is detected  
**Then** the sync pauses  
**And** a conflict event is emitted for UI handling

**Priority:** P0  
**Effort:** 10 hours

**Implementation Files:**
- `src/lib/filesync/bidirectional-sync-engine.ts`
- `src/lib/filesync/change-detector.ts`
- `src/lib/filesync/conflict-resolver.ts`

---

### Story 33-3: Notes ↔ Local Markdown Sync

**As a** notes user,
**I want** my notes to sync with local Markdown files,
**So that** I can edit notes in my preferred editor and see changes in the app.

**Acceptance Criteria:**

**Given** a note is saved in the Notes workspace  
**When** sync is enabled  
**Then** a Markdown file is written to the sync folder  
**And** the file includes frontmatter with note metadata

**Given** a Markdown file is modified locally  
**When** the file watcher detects the change  
**Then** the corresponding note is updated in the app  
**And** the note editor shows the new content

**Given** a new Markdown file is added to the sync folder  
**When** the file watcher detects the new file  
**Then** a new note is created in the Notes workspace

**Priority:** P0  
**Effort:** 8 hours

**Implementation Files:**
- `src/lib/notes/note-local-sync.ts`
- `src/lib/notes/note-file-watcher.ts`
- Update `src/lib/notes/note-file-sync.ts`

---

### Story 33-4: Knowledge ↔ Local Documents Sync

**As a** knowledge user,
**I want** my imported documents to sync with a local folder,
**So that** I can manage my knowledge base files locally.

**Acceptance Criteria:**

**Given** a document is imported to Knowledge workspace  
**When** sync is enabled  
**Then** the source file is copied to the sync folder  
**And** the document metadata is preserved

**Given** a document file is modified locally  
**When** the file watcher detects the change  
**Then** the document is re-indexed for RAG  
**And** embeddings are regenerated

**Given** a new document file is added to the sync folder  
**When** the file watcher detects the new file  
**Then** the document is imported to Knowledge workspace  
**And** RAG processing is triggered

**Priority:** P1  
**Effort:** 8 hours

**Implementation Files:**
- `src/lib/knowledge/knowledge-local-sync.ts`
- `src/lib/knowledge/document-file-watcher.ts`
- Update `src/lib/filesync/knowledge-file-sync-service.ts`

---

### Story 33-5: Conflict Resolution UI

**As a** user,
**I want** to resolve sync conflicts when they occur,
**So that** I don't lose my work.

**Acceptance Criteria:**

**Given** a sync conflict is detected  
**When** the conflict resolver emits an event  
**Then** a conflict dialog appears  
**And** both versions are displayed with diffs

**Given** a user views a conflict dialog  
**When** they choose "Keep Local"  
**Then** the workspace file is overwritten with local content  
**And** sync resumes

**Given** a user views a conflict dialog  
**When** they choose "Keep Workspace"  
**Then** the local file is overwritten with workspace content  
**And** sync resumes

**Given** a user views a conflict dialog  
**When** they choose "Keep Both"  
**Then** a backup file is created with timestamp  
**And** the chosen version is kept  
**And** sync resumes

**Priority:** P1  
**Effort:** 4 hours

**Implementation Files:**
- `src/presentation/components/sync/ConflictDialog.tsx`
- `src/lib/filesync/conflict-resolver.ts` (update)

---

### Story 33-6: Sync Status Dashboard

**As a** user,
**I want** to see the sync status of my files,
**So that** I know when syncing is complete or if there are issues.

**Acceptance Criteria:**

**Given** sync is in progress  
**When** the user views the status bar  
**Then** a sync indicator shows progress  
**And** the number of files processed is displayed

**Given** sync completes successfully  
**When** the user views the status bar  
**Then** a success indicator is shown  
**And** the last sync time is displayed

**Given** sync fails with errors  
**When** the user views the status bar  
**Then** an error indicator is shown  
**And** clicking it opens a detailed error log

**Given** a user wants detailed sync information  
**When** they open the Sync Dashboard  
**Then** they see a list of recent sync operations  
**And** they can filter by workspace or status

**Priority:** P2  
**Effort:** 4 hours

**Implementation Files:**
- `src/presentation/components/sync/SyncStatusDashboard.tsx`
- `src/lib/filesync/sync-status-store.ts`
- Update `src/presentation/components/ide/StatusBar.tsx`

---

## Dependencies

### Internal Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| CW-01 (Abstract File Sync Service) | ✅ DONE | `FileSyncService` interface exists |
| NR-06 (Notes FileSync Binding) | ✅ DONE | `NoteFileSyncService` exists |
| Story 3-3 (Dual-Write Sync) | ✅ DONE | IDE sync works |

### External Dependencies

| Dependency | Required Version | Notes |
|------------|-----------------|-------|
| File System Access API | Chrome 86+ | Core requirement |
| File System Observer API | Chrome 129+ | Optional, fallback to polling |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Browser compatibility | Medium | High | Feature detection + graceful degradation |
| File watcher performance | Low | Medium | Debounced events + batch processing |
| Conflict loops | Low | High | Transaction locks + version vectors |
| Large file handling | Medium | Medium | Streaming + chunked processing |

---

## Success Metrics

- [ ] Sync latency <5s for single file operations
- [ ] Conflict detection accuracy >99%
- [ ] User can sync Notes workspace with local folder
- [ ] User can sync Knowledge workspace with local folder
- [ ] Sync status visible in status bar
- [ ] All existing tests pass

---

## Out of Scope

- Cloud synchronization (future epic)
- Real-time collaboration (future epic)
- Version history (future epic)
- Partial sync (e.g., folder filtering within project)

---

**Epic Owner:** TBD  
**Created:** 2026-01-01T01:43:05+07:00  
**Last Updated:** 2026-01-01T01:43:05+07:00
