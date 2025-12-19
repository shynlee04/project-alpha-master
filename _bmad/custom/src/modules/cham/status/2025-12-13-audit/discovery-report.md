# CHAM Discovery Report - Via-Gent Project Alpha Spike

**Date:** 2025-12-13  
**Audit ID:** CHAM-2025-12-13-ADVANCED  
**Target:** `spikes/project-alpha/`  
**Phase:** Discovery (1/5)

---

## Codebase Cartography

### Structure Summary

| Metric | Value |
|--------|-------|
| Total Files | 62 |
| Total Directories | 23 |
| Source Files | 49 |
| Test Files | 8 |
| Test Coverage | 16% by file |

### Directory Tree (Max Depth 2)

```
src/
├── components/
│   ├── ide/            # IDE components (FileTree, MonacoEditor, Preview, Terminal)
│   ├── layout/         # IDELayout.tsx
│   └── ui/             # Toast system
├── hooks/              # useProcessManager
├── lib/
│   ├── editor/         # Monaco language utilities
│   ├── filesystem/     # LocalFSAdapter, SyncManager, PermissionLifecycle
│   ├── persistence/    # IndexedDB (db.ts)
│   ├── webcontainer/   # Manager, ProcessManager, TerminalAdapter
│   └── workspace/      # ProjectStore, WorkspaceContext
└── routes/
    ├── demo/           # Demo routes (7 files)
    ├── workspace/      # IDE workspace route
    ├── __root.tsx
    └── index.tsx       # Dashboard
```

---

## Pattern Analysis

### ✅ Architectural Patterns Detected

| Pattern | Location | Status |
|---------|----------|--------|
| Layered Architecture | `lib/` → `components/` | ✅ Correct |
| Context + Provider | WorkspaceContext | ✅ Implemented |
| Route Loader | `$projectId.tsx` | ✅ Implemented |
| Singleton Manager | WebContainerManager | ✅ Implemented |
| Adapter Pattern | LocalFSAdapter, TerminalAdapter | ✅ Implemented |
| Event-based Sync | SyncManager | ⚠️ Callbacks only |

### ⚠️ Issues Detected

| Issue | Severity | Files | Action Required |
|-------|----------|-------|-----------------|
| Oversized Files | HIGH | 6 files >300 LOC | Epic 11 refactor |
| Low Test Coverage | MEDIUM | 16% file coverage | Add tests |
| No Event Bus | MEDIUM | SyncManager | Epic 10 |
| No AI Integration | LOW | - | Epic 6 (planned) |

---

## Oversized Files Report

| File | Lines | Max Allowed | Refactor Epic |
|------|-------|-------------|---------------|
| `local-fs-adapter.ts` | 840 | 250 | Epic 11-1, 11-2 |
| `FileTree.tsx` | 566 | 250 | Epic 11-7 |
| `sync-manager.ts` | 531 | 250 | Epic 11-3, 11-4 |
| `IDELayout.tsx` | 434 | 250 | Epic 11-5 |
| `WorkspaceContext.tsx` | 389 | 250 | Epic 10-3 |
| `project-store.ts` | 359 | 250 | Keep (boundary) |
| `process-manager.ts` | 337 | 250 | Epic 12-2 |

---

## Dependency Analysis

### Core Dependencies (Verified)

| Package | Version | Status |
|---------|---------|--------|
| @tanstack/react-start | 1.132.0 | ✅ Current |
| @tanstack/ai | 0.0.3 | ✅ Installed (not used) |
| @webcontainer/api | 1.6.1 | ✅ Integrated |
| @xterm/xterm | 5.5.0 | ✅ Integrated |
| idb | 8.0.3 | ✅ Integrated |
| isomorphic-git | 1.36.0 | ⏳ Epic 7 |
| zod | 4.1.13 | ✅ Integrated |

### Unused Dependencies

| Package | Notes |
|---------|-------|
| @tanstack/ai | Awaiting Epic 6 |
| isomorphic-git | Awaiting Epic 7 |

---

## Integration Health

### ✅ Working Integrations

1. **WorkspaceContext ↔ IDELayout** - Route loader → Provider → Layout
2. **FileTree ↔ LocalFSAdapter** - Directory picker, file listing
3. **SyncManager ↔ WebContainer** - Bi-directional sync
4. **MonacoEditor ↔ SyncManager** - Save to both FS systems

### ⚠️ Pending Integrations

1. **Dashboard ↔ ProjectStore** - Story 4-0-1 backlog
2. **AI Agent ↔ IDE** - Epic 6 backlog
3. **Git ↔ LocalFS** - Epic 7 backlog

---

## Security Scan

| Check | Status | Notes |
|-------|--------|-------|
| No API Keys in Code | ✅ Pass | BYOK pattern |
| No Console Statements | ✅ Pass | Clean |
| No TODO/FIXME | ✅ Pass | Clean |
| FSA Permissions | ✅ Pass | Scoped per session |

---

## Recommendations

### P0 - Current Sprint

1. Complete Story 4-0-1 (Dashboard Recent Projects)
2. Continue Epic 5 persistence implementation

### P1 - Next Sprint

1. **Epic 10**: Event bus architecture for observability
2. **Epic 11**: Code splitting for oversized files
3. **Epic 12**: AI agent tool facades

### P2 - Future

1. **Epic 6**: TanStack AI integration
2. **Epic 7**: Git integration via isomorphic-git
3. **Epic 4.5**: Project Fugu enhancements
