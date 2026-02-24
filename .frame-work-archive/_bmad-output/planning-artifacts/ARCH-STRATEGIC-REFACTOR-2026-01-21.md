---
plan_id: "ARCH-STRATEGIC-REFACTOR-2026-01-21"
created: "2026-01-21T00:30:00+07:00"
priority: "STRATEGIC"
type: "HIGH-LEVEL ARCHITECTURE PLAN"
scope:
  - "New unified architecture"
  - "Project = Core (storage + database)"
  - "IDE/Notes = Feature components"
  - "2 main features: Agent Chat + File Tree"
  - "Codebase reduction: 1666 → 800 files"
status: "PROPOSAL"
author: "architect-ext"
---

# Strategic Architecture Refactor Plan

## Vision Statement

> **Project = Storage + User Database (Core)**
> **IDE/Notes = Feature Components that load on top**
> **2 Main Features: Agent Chat (cascade/thread) + File Tree**

---

## Current State Analysis

### Metrics

| Metric | Current | Target | Reduction |
|--------|---------|--------|-----------|
| **Source Files** | 1,666 | ~800 | **52%** |
| **Directories** | 319 | ~150 | **53%** |
| **TypeScript Errors** | ~90 | 0 | 100% |
| **Infection Points** | 42 | 0 | 100% |
| **God Components (>300 lines)** | 10+ | 0 | 100% |

### Deep-Scan Findings Summary (2026-01-21)

| Domain | Points | Status | Key Issues |
|--------|--------|--------|------------|
| **FSA Handle** | 10 | Mixed | 3 handle managers, null storage, prompts user |
| **State Management** | 12 | 8 resolved | STATE-002 still persists wrong projectId |
| **Routing** | 13 | Not verified | Double fetches, useEffect in loaders |
| **Platform Contract** | 6 | Not verified | Temp projects, mobile gaps |
| **Hooks Error** | 1 | P0 | React hooks violation in NotesWorkspaceDefault |

---

## New Architecture: "Project-Centric" Model

### Core Principle

```
┌─────────────────────────────────────────────────────────────┐
│                     PROJECT (Core)                          │
│  ┌─────────────────┐  ┌──────────────────────────────────┐ │
│  │ Storage Gateway │  │ User Database (Dexie)            │ │
│  │ - FSA (desktop) │  │ - Projects, Notes, Agents, etc.  │ │
│  │ - IDB (mobile)  │  │ - Single source of truth         │ │
│  └─────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FEATURE COMPONENTS                        │
│  ┌───────────────────────┐  ┌───────────────────────────┐  │
│  │  🌳 FILE TREE         │  │  💬 AGENT CHAT           │  │
│  │  (unified component)  │  │  (cascade/thread view)    │  │
│  │  - Works on any       │  │  - Works on any storage   │  │
│  │    storage type       │  │  - Project-scoped threads │  │
│  └───────────────────────┘  └───────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WORKSPACE VIEWS (thin wrappers)                    │   │
│  │  - IDE View: FileTree + Monaco + Terminal           │   │
│  │  - Notes View: FileTree (notes/) + BlockNote        │   │
│  │  - Knowledge View: FileTree (docs/) + RAG Panel     │   │
│  │  - Study View: Flashcards + Quiz                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Insight

**Current architecture**: 4 separate "workspaces" with duplicated logic
**New architecture**: 1 project core + pluggable feature components

---

## Target Directory Structure (800 files)

```
src/
├── core/                           # 50 files (NEW - consolidated)
│   ├── project/                    # Project entity + operations
│   │   ├── project-entity.ts       # Domain entity
│   │   ├── project-store.ts        # Single Zustand store
│   │   └── project-gateway.ts      # CRUD via Dexie
│   ├── storage/                    # Unified storage layer
│   │   ├── storage-gateway.ts      # Interface
│   │   ├── fsa-gateway.ts          # Desktop implementation
│   │   └── idb-gateway.ts          # Mobile implementation
│   ├── platform/                   # Platform detection
│   │   └── platform-contract.ts    # Single source of truth
│   └── database/                   # Dexie setup
│       ├── dexie-db.ts             # Database definition
│       └── dexie-types.ts          # Type definitions
│
├── features/                       # 200 files (consolidated from 800+)
│   ├── file-tree/                  # 🌳 MAIN FEATURE #1
│   │   ├── FileTree.tsx            # Unified component
│   │   ├── useFileTree.ts          # Single hook
│   │   ├── file-tree-store.ts      # State management
│   │   └── file-tree-types.ts      # Types
│   │
│   ├── agent-chat/                 # 💬 MAIN FEATURE #2
│   │   ├── AgentChat.tsx           # Cascade/thread UI
│   │   ├── useAgentChat.ts         # Single hook
│   │   ├── chat-store.ts           # State management
│   │   ├── thread-manager.ts       # Thread logic
│   │   └── message-types.ts        # Types
│   │
│   ├── editor/                     # Monaco + BlockNote
│   │   ├── CodeEditor.tsx          # Monaco wrapper
│   │   ├── NoteEditor.tsx          # BlockNote wrapper
│   │   └── editor-types.ts
│   │
│   └── terminal/                   # Terminal feature
│       ├── Terminal.tsx
│       └── terminal-store.ts
│
├── views/                          # 100 files (thin wrappers)
│   ├── ide/                        # IDE View
│   │   ├── IDEView.tsx             # Composes: FileTree + CodeEditor + Terminal
│   │   └── ide-layout.tsx
│   ├── notes/                      # Notes View
│   │   ├── NotesView.tsx           # Composes: FileTree (notes/) + NoteEditor
│   │   └── notes-layout.tsx
│   ├── knowledge/                  # Knowledge View
│   │   └── KnowledgeView.tsx
│   ├── study/                      # Study View
│   │   └── StudyView.tsx
│   └── hub/                        # Hub/Home
│       └── HubView.tsx
│
├── routes/                         # 20 files (simplified)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── $projectId.tsx              # Project context route
│   ├── $projectId.ide.tsx          # → renders IDEView
│   ├── $projectId.notes.tsx        # → renders NotesView
│   ├── $projectId.knowledge.tsx    # → renders KnowledgeView
│   └── $projectId.study.tsx        # → renders StudyView
│
├── shared/                         # 100 files (UI primitives)
│   ├── ui/                         # shadcn/ui components
│   ├── hooks/                      # Shared hooks
│   └── utils/                      # Utilities
│
└── lib/                            # 30 files (legacy, being deprecated)
    └── (minimal - mostly facades)
```

---

## Migration Strategy (4 Phases)

### Phase 1: Core Consolidation (Week 1)

**Goal**: Create single `core/` module with project + storage

| Task | Current Files | Target | Reduction |
|------|--------------|--------|-----------|
| Project entity | 15+ scattered | 1 file | -14 |
| Storage gateway | 6 duplicates | 3 files | -3 |
| Platform contract | 4 scattered | 1 file | -3 |
| Dexie setup | 8 scattered | 2 files | -6 |

**Deliverables**:
- `src/core/project/` - Consolidated project management
- `src/core/storage/` - StorageGateway interface + 2 implementations
- `src/core/platform/` - Single getPlatformContract()
- `src/core/database/` - Dexie with all tables

### Phase 2: Feature Extraction (Week 2)

**Goal**: Extract FileTree and AgentChat as standalone features

| Feature | Current Files | Target | Reduction |
|---------|--------------|--------|-----------|
| FileTree | 25+ (IDE + Notes) | 5 files | -20 |
| AgentChat | 40+ scattered | 8 files | -32 |
| Editor | 20+ (Monaco + BlockNote) | 5 files | -15 |
| Terminal | 15+ | 3 files | -12 |

**Deliverables**:
- `src/features/file-tree/` - Works with any StorageGateway
- `src/features/agent-chat/` - Works with any project
- `src/features/editor/` - CodeEditor + NoteEditor
- `src/features/terminal/` - Terminal component

### Phase 3: View Simplification (Week 3)

**Goal**: Create thin view wrappers that compose features

| View | Current Files | Target | Reduction |
|------|--------------|--------|-----------|
| IDE | 50+ | 5 files | -45 |
| Notes | 40+ | 5 files | -35 |
| Knowledge | 30+ | 3 files | -27 |
| Study | 25+ | 3 files | -22 |
| Hub | 20+ | 3 files | -17 |

**Deliverables**:
- `src/views/ide/IDEView.tsx` - Composes FileTree + CodeEditor + Terminal
- `src/views/notes/NotesView.tsx` - Composes FileTree + NoteEditor
- (etc.)

### Phase 4: Route Consolidation (Week 4)

**Goal**: Simplify routing to project-centric model

| Change | Current | Target |
|--------|---------|--------|
| Route structure | `/ide/$projectId`, `/notes/$projectId` | `/$projectId/ide`, `/$projectId/notes` |
| Route files | 30+ | 10 files |
| Loaders | Per-workspace | Single project loader |

**Deliverables**:
- `src/routes/$projectId.tsx` - Project context provider
- `src/routes/$projectId.*.tsx` - Thin workspace routes

---

## Key Decisions

### Decision 1: Project-First Routing

**Current**: `/ide/$projectId`, `/notes/$projectId`
**New**: `/$projectId/ide`, `/$projectId/notes`

**Rationale**: Project is the container, workspace is the view mode

### Decision 2: Unified FileTree

**Current**: Separate FileTree for IDE, Notes, Knowledge
**New**: One FileTree component, different root paths

```typescript
// IDE: Full project tree
<FileTree rootPath="/" gateway={storageGateway} />

// Notes: Notes folder only
<FileTree rootPath="/notes" gateway={storageGateway} />

// Knowledge: Docs folder only
<FileTree rootPath="/docs" gateway={storageGateway} />
```

### Decision 3: Agent Chat as Cross-Cutting Feature

**Current**: Separate chat panels per workspace
**New**: One AgentChat with project-scoped threads

```typescript
// Works in any workspace
<AgentChat 
  projectId={projectId} 
  workspaceContext={currentWorkspace} 
/>
```

### Decision 4: Storage Gateway as Single Abstraction

**Current**: FSAGateway, IDBGateway, LocalFSAdapter, fsa-storage-adapter, ...
**New**: One StorageGateway interface, 2 implementations

```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  watch(callback: FileChangeCallback): () => void;
}
```

---

## Files to Delete (Phase 1 Quick Wins)

### Immediate Deletions (No Dependencies)

| Directory/File | Files | Reason |
|---------------|-------|--------|
| `src/spike/` | ~50 | Separate spike project |
| `src/lib/workspace/` | ~80 | Migrated to infrastructure |
| `src/lib/filesystem/` | ~40 | Migrated to infrastructure |
| `src/lib/events/` | ~20 | Migrated to infrastructure |
| `src/lib/sync/` | ~30 | Migrated to infrastructure |
| `src/lib/state/` | ~30 | Migrated to infrastructure |
| `*.bak` files | ~30 | Backup files |
| **Total** | **~280** | |

### Consolidation Deletions (After Migration)

| Current | Merge Into | Files Removed |
|---------|------------|---------------|
| 6 storage adapters | 2 gateways | -4 |
| 15 store files | 5 consolidated | -10 |
| 25 FileTree files | 5 feature files | -20 |
| 40 chat files | 8 feature files | -32 |
| **Total** | | **~66** |

---

## Infection Resolution in New Architecture

| Infection | Current Issue | Resolution |
|-----------|--------------|------------|
| **FSA Handle** | 3 managers | 1 HandlePersistenceService in core/storage |
| **State Management** | projectId in localStorage | Project from URL only, state per-project in Dexie |
| **Routing** | Double fetches | Single project loader, views are just renders |
| **Platform Contract** | Scattered checks | Single getPlatformContract() in core/platform |
| **Hooks Error** | Conditional hooks | Clean view components, no conditional hooks |

---

## Success Criteria

| Metric | Current | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|---------|
| Files | 1,666 | 1,400 | 1,100 | 900 | 800 |
| Directories | 319 | 280 | 220 | 180 | 150 |
| TS Errors | 90 | 50 | 20 | 5 | 0 |
| God Components | 10+ | 8 | 4 | 1 | 0 |
| Infection Points | 42 | 30 | 15 | 5 | 0 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes | Facade pattern for backward compatibility |
| Lost functionality | Feature flags for gradual rollout |
| Team velocity | Phase 1 is independent, can parallelize |
| Testing gaps | Add integration tests before migration |

---

## Next Steps

1. **IMMEDIATE**: Apply Notes import loop fix (blocking users)
2. **This Week**: Phase 1 - Create `core/` module
3. **Next Week**: Phase 2 - Extract FileTree + AgentChat features
4. **Week 3**: Phase 3 - Simplify views
5. **Week 4**: Phase 4 - Route consolidation

---

## Approval Request

This strategic plan requires:
- [ ] Human approval for architecture direction
- [ ] Team assignment for 4 phases
- [ ] Timeline confirmation (4 weeks)
- [ ] Feature flag strategy for gradual rollout

---

*Created: 2026-01-21T00:30:00+07:00*
*Author: architect-ext*
*Status: Awaiting human approval*
