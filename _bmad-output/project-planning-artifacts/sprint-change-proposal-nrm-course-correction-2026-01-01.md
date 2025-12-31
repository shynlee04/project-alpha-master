---
title: "Sprint Change Proposal - NRM Course Correction"
document_type: "sprint-change-proposal"
version: "1.0.0"
created: "2026-01-01T01:43:05+07:00"
author: "BMAD Master Orchestrator"
status: "PENDING_APPROVAL"
scope: "MAJOR"
phase: "Course Correction"
team: "A"
agent_mode: "@bmad-core-bmad-master"
---

# Sprint Change Proposal: Notes Remediation Module Course Correction

## Executive Summary

This Sprint Change Proposal addresses critical integration gaps identified after completing the Notes Remediation Module (NRM) Phases 0-2. While the NRM successfully delivered AI service wiring, editor reactivity fixes, and cross-workspace event infrastructure, the broader brownfield implementation reveals significant **architectural disconnections** that prevent the platform from achieving its stated mission as a **Knowledge Synthesis Station**.

### Change Scope Classification: **MAJOR**

This proposal requires:
- Fundamental replan of project management integration
- New epic definition for local filesystem synchronization
- UX/UI evaluation and component rewiring
- RAG feature integration across workspaces

---

## Section 1: Issue Summary

### 1.1 Problem Statement

The Notes Remediation Module successfully implemented:
- ✅ AI service wiring with real LLM integration
- ✅ Editor hot-reload reactivity
- ✅ Agent selector integration
- ✅ Text selection AI transform menu
- ✅ Slash command AI actions
- ✅ FileSync binding (Notes → Files)
- ✅ Cross-workspace event emission
- ✅ Markdown import/export UI

**However**, the broader platform suffers from **incomplete integration** across core components:

| Component | Current State | Gap Severity |
|-----------|---------------|--------------|
| **Project Management** | Isolated from workspace context | 🔴 Critical |
| **FileTree** | Only works in IDE, not cross-workspace | 🔴 Critical |
| **Monaco Editor** | Not connected to Notes workspace | 🟡 High |
| **WebContainer** | Isolated from knowledge synthesis | 🟡 High |
| **Terminal** | No integration with AI agent tools | 🟡 High |
| **RAG Features** | Properties/chunking not configurable | 🟠 Medium |

### 1.2 Context Discovery

The issue was discovered during the NRM completion review when analyzing:
- Cross-workspace file synchronization requirements
- Project space organization and accessibility
- AI agent integration with file operations
- Local filesystem synchronization needs for desktop users

### 1.3 Evidence

#### Evidence 1: ProjectStore Isolation
```typescript
// src/lib/workspace/project-store.ts (Lines 37-55)
export interface ProjectMetadata {
    id: string;
    name: string;
    folderPath: string;
    fsaHandle: FileSystemDirectoryHandle;
    lastOpened: Date;
    autoSync?: boolean;
    layoutState?: LayoutConfig;
    exclusionPatterns?: string[];
    lastKnownPermissionState?: FsaPermissionState;
}
```

The `ProjectMetadata` is stored in IndexedDB but **NOT connected** to:
- Notes workspace (`useNoteStore`)
- Knowledge workspace (Vault/RAG)
- Tab-based interfaces
- Cross-workspace synchronization events

#### Evidence 2: FileSyncService Per-Workspace Isolated

```
src/lib/filesync/
├── file-sync-service.ts          # Abstract interface
├── ide-file-sync-service.ts      # IDE-only implementation
├── knowledge-file-sync-service.ts # Knowledge-only (in-memory!)
└── project-knowledge-sync.ts     # Project→Knowledge sync (unused)
```

Each workspace has its own isolated sync service with **NO shared project state**.

#### Evidence 3: Notes FileSync Not Wired to Real FSA

```typescript
// src/lib/notes/note-file-sync.ts (Line 91)
constructor(fileSyncService: FileSyncService, options?: NoteFileSyncOptions) {
    this.fileSyncService = fileSyncService;
    this.options = { ...DEFAULT_OPTIONS, ...options };
}
```

The `NoteFileSyncService` requires a `FileSyncService` instance but:
- There's no factory that provides an FSA-backed service to Notes
- The dialogs create a service but don't connect to real FSA handles
- Desktop users cannot sync notes to local directories

---

## Section 2: Impact Analysis

### 2.1 Epic Impact

| Epic | Impact | Description |
|------|--------|-------------|
| **Epic 3** (Local-First File Magic) | 🔴 High | Dual-write sync doesn't extend to Notes/Knowledge |
| **Epic 5** (Resilience) | 🟡 Medium | Sync conflict UI only in IDE workspace |
| **Epic 32** (RAG Infrastructure) | 🔴 High | Cannot configure RAG properties per-document |
| **Epic 27** (State Management) | 🟡 Medium | ProjectStore not reactive across workspaces |
| **NRM Phase 2** | 🟠 Low | FileSync binding exists but not FSA-connected |

### 2.2 Story Impact

**Current Stories Requiring Changes:**
- Story 3-3 (Dual-Write Sync) → Extend to all workspaces
- Story 3-7 (Project Metadata Persistence) → Add cross-workspace events
- Story 32-2 (Document Chunking Pipeline) → Add UI configuration

**New Stories Required:**
- Desktop Local Filesystem Synchronization (NEW EPIC)
- Project Space to Workspace Binding (NEW)
- RAG Property Configuration UI (NEW)
- Monaco Editor in Notes Workspace (NEW)

### 2.3 Artifact Conflicts

| Document | Conflict | Resolution |
|----------|----------|------------|
| `architecture.md` | Doesn't define cross-workspace sync contract | Update Section 4.2 |
| `epics.md` | Missing Local Sync Epic | Add Epic 33 |
| `ux-design.md` | No desktop sync UX patterns | Add Section 8 |
| `prd.md` | FR-STATE-03 scope limited to IDE | Extend to all workspaces |

### 2.4 Technical Impact

#### Code Changes Required:

1. **ProjectStore Enhancement** (`src/lib/workspace/project-store.ts`)
   - Add event emission for project changes
   - Create `useProjectStore` Zustand reactive wrapper
   - Connect to workspace context

2. **Unified FileSyncService Factory** (`src/lib/filesync/unified-sync-factory.ts`)
   - Create factory that provides FSA-backed service to any workspace
   - Share project handle across workspaces
   - Implement sync status aggregation

3. **Notes FSA Integration** (`src/lib/notes/`)
   - Wire `NoteFileSyncService` to real FSA handle
   - Add UI for selecting sync directory
   - Emit sync events to cross-workspace bus

4. **RAG Configuration UI** (`src/presentation/components/knowledge/`)
   - Document property configuration panel
   - Chunking strategy selector
   - Embedding generation controls

---

## Section 3: Gap Analysis

### 3.1 Integration Failures

#### Gap 1: Project Management Disconnection

**Current State:**
- `project-store.ts` provides CRUD for IndexedDB storage
- FSA handles stored but only used in IDE workspace
- No reactive updates when project selected/changed

**Required State:**
- Projects accessible from all workspace routes
- Selection triggers cross-workspace context update
- FSA handle shared for file operations

**Integration Path:**
```
ProjectStore → useProjectStore (Zustand) → WorkspaceContext → All Routes
                                        ↓
                              FileSyncServiceFactory
                                        ↓
                     ┌──────────────────┼──────────────────┐
                     ↓                  ↓                  ↓
            IDEFileSyncService   NotesFileSyncService   KnowledgeFileSyncService
```

#### Gap 2: FileTree Cross-Workspace Absence

**Current State:**
- `FileTree.tsx` only renders in IDE workspace
- Uses IDE-specific `useFileSyncStatusStore`
- No reuse in Notes or Knowledge workspaces

**Required State:**
- FileTree component reusable across workspaces
- Synchronized view of project files
- Workspace-specific action handlers

#### Gap 3: Editor Integration Deficiency

**Current State:**
- Monaco editor only in IDE workspace
- Notes uses BlockNote editor exclusively
- No option to edit notes as raw Markdown in Monaco

**Required State:**
- Desktop users can toggle between BlockNote and Monaco
- Both editors load from shared content source
- State consistency across editor switches

#### Gap 4: AI Agent File Operations

**Current State:**
- Agent tools execute in WebContainer context
- Generated files saved to memory filesystem
- No automatic save to local FSA

**Required State:**
- AI-generated code saved to local filesystem
- Notes created by agents saved to Notes workspace
- Study content generated to knowledge store

#### Gap 5: RAG Configuration UI

**Current State:**
- RAG pipeline processes documents automatically
- No user control over chunking strategy
- Embeddings generated with defaults

**Required State:**
- Per-document property configuration
- Chunking strategy selector (sentence, paragraph, semantic)
- Batch/individual embedding controls

### 3.2 Superficial Implementations

| Component | Superficiality | Required Depth |
|-----------|----------------|----------------|
| `KnowledgeFileSyncService` | In-memory storage only | Needs IndexedDB/FSA backing |
| `project-knowledge-sync.ts` | Not imported anywhere | Wire to Knowledge workspace |
| `note-event-emitter.ts` | Created but not consumed | Add listeners in Knowledge/IDE |
| `markdown-converter.ts` | BlockNote → MD only | Add MD → BlockNote reverse |

---

## Section 4: Recommended Approach

### 4.1 Selected Path: Direct Adjustment + New Epic

After evaluating options:
- ❌ **Rollback** - NRM work is valuable and correct
- ✅ **Direct Adjustment** - Extend existing components
- ✅ **New Epic** - Desktop synchronization is new scope

### 4.2 Implementation Strategy

**Phase 1: Foundation Wiring (2 days)**
- Create `useProjectStore` Zustand wrapper
- Implement `UnifiedFileSyncFactory`
- Wire NoteFileSyncService to FSA

**Phase 2: Cross-Workspace Integration (3 days)**
- Connect FileTree to Notes/Knowledge
- Add project selection context
- Implement sync status aggregation

**Phase 3: Desktop Sync Epic (5 days)**
- Local folder sync configuration
- Bidirectional sync (local ↔ workspaces)
- Conflict resolution UI

**Phase 4: RAG Configuration (3 days)**
- Document property panel
- Chunking configuration
- Embedding controls

### 4.3 Effort Estimate

| Phase | Stories | Effort | Risk |
|-------|---------|--------|------|
| Foundation Wiring | 3 | 16h | Low |
| Cross-Workspace Integration | 4 | 24h | Medium |
| Desktop Sync Epic | 6 | 40h | High |
| RAG Configuration | 3 | 24h | Medium |
| **Total** | **16** | **104h** | Medium-High |

### 4.4 Timeline Impact

**Original Target:** 2026-01-18 (Epic-based completion)
**Revised Target:** 2026-01-25 (7 days extension)

---

## Section 5: Detailed Change Proposals

### 5.1 Architecture Changes

#### Change A1: Add Cross-Workspace Project Context

**Document:** `architecture.md` Section 4.2

**OLD:**
```markdown
State boundary: Components → Zustand → Dexie (never skip layers)
```

**NEW:**
```markdown
State boundary: Components → Zustand → Dexie (never skip layers)

Cross-Workspace State Contract:
- ProjectContext: Provider wrapping all workspace routes
- useActiveProject(): Returns current project with FSA handle
- useFileSyncService(): Returns workspace-appropriate sync service
```

**Rationale:** Required for unified project access across workspaces.

---

#### Change A2: Define Desktop Sync Requirements

**Document:** `prd.md` Section FR-STATE

**OLD:**
```markdown
FR-STATE-03: Dual-Write Sync — System shall write file changes to both WebContainer and Local File System (via FSA) in parallel.
```

**NEW:**
```markdown
FR-STATE-03: Dual-Write Sync — System shall write file changes to both WebContainer and Local File System (via FSA) in parallel.

FR-STATE-05: Desktop Synchronization — System shall allow users to:
  - Configure local folders as sync targets
  - Sync Notes workspace to local Markdown files
  - Sync Knowledge documents to local directories
  - Access synchronized content from any workspace
  
FR-STATE-06: Tab-Based Access — System shall provide file access from:
  - IDE workspace (editor + terminal)
  - Notes workspace (Markdown files)
  - Knowledge workspace (RAG documents)
  - Any connected interface (tabs, modals)
```

**Rationale:** Extends sync scope beyond IDE.

---

### 5.2 New Epic Proposal

#### Epic 33: Desktop Local Filesystem Synchronization

**User Outcome:** Desktop users can synchronize local folders with knowledge synthesis workspaces, accessing and modifying content from any interface.

**Stories:**

| Story | Name | Priority | Effort |
|-------|------|----------|--------|
| 33-1 | Local Folder Configuration UI | P0 | 6h |
| 33-2 | Bidirectional Sync Engine | P0 | 10h |
| 33-3 | Notes ↔ Local MD Sync | P0 | 8h |
| 33-4 | Knowledge ↔ Local Docs Sync | P1 | 8h |
| 33-5 | Conflict Resolution UI | P1 | 4h |
| 33-6 | Sync Status Dashboard | P2 | 4h |

**Acceptance Criteria:**
- User can select local folder via FSA dialog
- Changes in local folder reflected in workspaces within 5s
- Changes in workspaces reflected in local files within 5s
- Conflict detection triggers resolution dialog

---

### 5.3 Story Changes

#### Story Mod-1: Extend Story 3-3 (Dual-Write Sync)

**Document:** `epics.md` Story 3-3

**OLD:**
```markdown
Given a user edits a file in Monaco editor  
When they save (Ctrl+S or auto-save)  
Then the file is written to both WebContainer AND local FSA handle
```

**NEW:**
```markdown
Given a user edits a file in Monaco editor  
When they save (Ctrl+S or auto-save)  
Then the file is written to both WebContainer AND local FSA handle

Given a user edits a note in Notes workspace  
When the note is saved  
Then if sync enabled, the markdown file is written to local FSA handle  
And the change event is emitted to cross-workspace bus

Given a user imports a document to Knowledge workspace  
When the document is processed  
Then if sync enabled, the source file is copied to local FSA handle  
And RAG indexing occurs
```

**Rationale:** Unified sync across all workspaces.

---

### 5.4 UX/UI Changes

#### Change U1: Add Project Selection to Workspace Routes

**Component:** `Header.tsx` and workspace layouts

**Current:**
- No project selector in Notes/Knowledge workspaces
- Context only available in IDE workspace

**Proposed:**
- Add `<ProjectSelector />` component to all workspace headers
- Show current project name with switch dropdown
- Connect to `useActiveProject()` hook

---

#### Change U2: Add Local Sync Configuration Panel

**Component:** New `LocalSyncConfigDialog.tsx`

**Features:**
- Select local folder via FSA picker
- Configure sync direction (unidirectional/bidirectional)
- Set exclusion patterns
- View sync status and history

---

## Section 6: Implementation Handoff

### 6.1 Scope Classification: **MAJOR**

This change requires:
- ✅ PM involvement for new epic definition
- ✅ Architect involvement for cross-workspace contracts
- ✅ Development backlog reorganization
- ✅ UX design for new components

### 6.2 Handoff Recipients

| Role | Responsibility | Deliverable |
|------|----------------|-------------|
| **PM** | Approve Epic 33, update roadmap | Updated `epics.md` |
| **Architect** | Define sync contracts | Updated `architecture.md` |
| **UX Designer** | Design sync configuration UI | Wireframes |
| **Dev Lead** | Sprint planning for new stories | Updated `sprint-status.yaml` |

### 6.3 Success Criteria

- [ ] Epic 33 added to `epics.md` with full story breakdown
- [ ] Architecture document updated with cross-workspace contracts
- [ ] `useProjectStore` and `UnifiedFileSyncFactory` implemented
- [ ] Notes workspace can sync to local folder
- [ ] RAG configuration UI functional
- [ ] All existing tests pass
- [ ] Cross-workspace sync latency <5s

---

## Section 7: Next Actions

### Immediate (This Sprint)
1. **Approve** this Sprint Change Proposal
2. **Create** Epic 33 in `epics.md`
3. **Update** `bmm-workflow-status.yaml` with new scope

### Phase 1 (Days 1-2)
4. **Implement** `useProjectStore` Zustand wrapper
5. **Create** `UnifiedFileSyncFactory`
6. **Wire** NoteFileSyncService to FSA

### Phase 2 (Days 3-5)
7. **Add** Project selector to workspace headers
8. **Connect** FileTree to Notes/Knowledge
9. **Implement** sync status aggregation

### Phase 3 (Days 6-10)
10. **Implement** Epic 33 stories
11. **Add** RAG configuration UI
12. **Validate** cross-workspace integration

---

## Approval

**Proposal Status:** ⏳ AWAITING APPROVAL

**Required Approvers:**
- [ ] Product Owner
- [ ] Solution Architect  
- [ ] Development Lead

**Approval Date:** _______________________

**Notes:** _______________________

---

**Document ID:** SCP-NRM-CC-2026-01-01
**Version:** 1.0
**Last Updated:** 2026-01-01T01:43:05+07:00
