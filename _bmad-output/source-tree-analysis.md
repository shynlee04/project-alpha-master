# Project Alpha - Source Tree Analysis

> **Generated:** 2025-12-20 | **Scan Level:** Exhaustive

## Directory Structure

```
project-alpha/
├── src/                           # Main source code
│   ├── components/                # React components
│   │   ├── Header.tsx             # App header with navigation
│   │   ├── ide/                   # IDE-specific components
│   │   │   ├── AgentChatPanel.tsx # AI chat interface
│   │   │   ├── FileTree/          # File explorer component
│   │   │   ├── MonacoEditor/      # Code editor wrapper
│   │   │   ├── PreviewPanel/      # iframe preview
│   │   │   ├── SyncStatusIndicator.tsx # Sync status UI
│   │   │   └── XTerminal.tsx      # Terminal component
│   │   ├── layout/                # Layout components
│   │   │   ├── IDELayout.tsx      # Main IDE layout shell
│   │   │   ├── TerminalPanel.tsx  # Terminal tab panel
│   │   │   ├── SidePanel.tsx      # File tree sidebar
│   │   │   └── EditorPanel.tsx    # Editor area
│   │   └── ui/                    # Shared UI components
│   │       └── (buttons, inputs, etc.)
│   │
│   ├── lib/                       # Core libraries
│   │   ├── editor/                # Editor utilities
│   │   ├── events/                # Event bus system
│   │   │   ├── index.ts           # Export and type definitions
│   │   │   └── workspace-events.ts # Typed workspace events
│   │   ├── filesystem/            # File System Access layer (20 files)
│   │   │   ├── index.ts           # Public API exports
│   │   │   ├── local-fs-adapter.ts # FSA adapter implementation
│   │   │   ├── sync-manager.ts    # Bidirectional sync engine
│   │   │   ├── sync-executor.ts   # Sync execution logic
│   │   │   ├── sync-planner.ts    # Sync planning/diffing
│   │   │   ├── sync-operations.ts # File operations
│   │   │   ├── sync-types.ts      # Type definitions
│   │   │   ├── sync-utils.ts      # Utility functions
│   │   │   ├── path-guard.ts      # Path validation
│   │   │   ├── path-utils.ts      # Path manipulation
│   │   │   ├── directory-walker.ts # Directory traversal
│   │   │   ├── exclusion-config.ts # Exclusion patterns
│   │   │   ├── permission-lifecycle.ts # FSA permission handling
│   │   │   ├── fs-types.ts        # FS type definitions
│   │   │   ├── fs-errors.ts       # Custom error classes
│   │   │   ├── file-ops.ts        # File operations
│   │   │   ├── dir-ops.ts         # Directory operations
│   │   │   ├── handle-utils.ts    # Handle utilities
│   │   │   └── __tests__/         # Unit tests
│   │   ├── persistence/           # IndexedDB layer
│   │   │   ├── index.ts           # DB initialization
│   │   │   └── schema.ts          # DB schema
│   │   ├── webcontainer/          # WebContainer integration (5 files)
│   │   │   ├── index.ts           # Public API exports
│   │   │   ├── manager.ts         # Singleton container manager
│   │   │   ├── terminal-adapter.ts # xterm ↔ jsh binding
│   │   │   ├── process-manager.ts # Process lifecycle
│   │   │   └── types.ts           # Type definitions
│   │   └── workspace/             # Workspace state (11 files)
│   │       ├── index.ts           # Public API exports
│   │       ├── WorkspaceContext.tsx # React context provider
│   │       ├── workspace-types.ts # Type definitions
│   │       ├── project-store.ts   # Project metadata store
│   │       ├── ide-state-store.ts # IDE UI state store
│   │       ├── conversation-store.ts # Chat history store
│   │       ├── file-sync-status-store.ts # Per-file sync status
│   │       └── hooks/             # Context hooks
│   │           ├── useWorkspaceState.ts
│   │           ├── useSyncOperations.ts
│   │           ├── useEventBusEffects.ts
│   │           ├── useInitialSync.ts
│   │           └── useWorkspaceActions.ts
│   │
│   ├── routes/                    # TanStack Router pages
│   │   ├── __root.tsx             # Root layout
│   │   ├── index.tsx              # Dashboard/home page
│   │   ├── test-fs-adapter.tsx    # FS adapter test page
│   │   ├── demo/                  # Demo routes
│   │   └── workspace/             # IDE workspace routes
│   │       └── $projectId.tsx     # Dynamic project workspace
│   │
│   ├── hooks/                     # Global React hooks
│   ├── data/                      # Static data/fixtures
│   ├── router.tsx                 # Router configuration
│   ├── routeTree.gen.ts           # Auto-generated route tree
│   └── styles.css                 # Global styles
│
├── docs/                          # Documentation
│   └── legacy-unfiltered/         # Pre-BMAD governance docs
│       ├── architecture.md        # Architecture decisions
│       ├── epics.md               # Epic breakdown
│       ├── prd-*.md               # Product requirements
│       ├── ux-design-specification.md
│       ├── bmm-workflow-status.yaml
│       ├── agent-instructions/    # AI agent guides
│       └── sprint-artifacts/      # Story implementations
│
├── _bmad/                         # BMAD framework
│   ├── core/                      # Core BMAD config
│   └── bmm/                       # BMM module workflows
│
├── public/                        # Static assets
├── node_modules/                  # Dependencies
├── package.json                   # Project manifest
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite + TanStack config
├── vitest.config.ts               # Test config
└── AGENTS.md                      # AI agent instructions
```

---

## Critical Directories

### `src/lib/filesystem/` - File System Layer

**Purpose:** Handles all local filesystem operations via File System Access API.

| File | LOC | Purpose |
|------|-----|---------|
| `sync-manager.ts` | ~450 | Main sync orchestration |
| `local-fs-adapter.ts` | ~250 | FSA adapter |
| `sync-executor.ts` | ~200 | Execute sync plans |
| `permission-lifecycle.ts` | ~150 | Permission handling |

**Key Patterns:**
- Local FS is source of truth
- Dual-write strategy (local → container)
- Exclusion patterns for `.git`, `node_modules`

### `src/lib/webcontainer/` - Container Layer

**Purpose:** Manages WebContainer lifecycle and terminal integration.

| File | LOC | Purpose |
|------|-----|---------|
| `manager.ts` | ~250 | Singleton container |
| `terminal-adapter.ts` | ~280 | xterm ↔ jsh binding |
| `process-manager.ts` | ~300 | Process tracking |

**Key Patterns:**
- One container per page (singleton)
- COOP/COEP headers required
- jsh shell for terminal

### `src/lib/workspace/` - State Layer

**Purpose:** Centralizes IDE state management.

| File | LOC | Purpose |
|------|-----|---------|
| `project-store.ts` | ~350 | Project metadata |
| `WorkspaceContext.tsx` | ~100 | React context |
| `ide-state-store.ts` | ~100 | UI state |

**Key Patterns:**
- TanStack Store for state
- React Context for propagation
- IndexedDB for persistence

---

## Entry Points

| File | URL | Purpose |
|------|-----|---------|
| `routes/index.tsx` | `/` | Dashboard with project list |
| `routes/workspace/$projectId.tsx` | `/workspace/:id` | IDE workspace |
| `routes/test-fs-adapter.tsx` | `/test-fs-adapter` | FS testing |

---

## Integration Points

### File Operations Flow

```
User Edit → Monaco → SyncManager → LocalFSAdapter → WebContainer
                                 ↓
                          IndexedDB (metadata)
```

### Terminal Flow

```
XTerminal → TerminalAdapter → jsh (WebContainer) → ProcessManager
```

---

*Generated by BMAD Document Project Workflow v1.2.0*
