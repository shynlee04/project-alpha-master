# Project Alpha — Architecture Remediation

## What This Is

Architecture remediation for Project Alpha, a brownfield React 19/TypeScript application with a plugin-based architecture. The codebase has accumulated technical debt (29.5% health score) from fragmented state management, unclear data flow boundaries, and ad-hoc wiring between plugins. This project establishes clear architectural contracts before resuming feature development.

## Core Value

**Clear state boundaries** — every piece of data has ONE canonical home and ONE flow path. When this is true, plugins can coordinate, agents can reason about the codebase, and new features don't break existing ones.

## Requirements

### Validated

These capabilities exist and work (inferred from codebase mapping):

- ✓ Project-centric routing (`/$projectId`) — existing
- ✓ Plugin system with 6 plugins (FileTree, Monaco, Notes, Terminal, Preview, Chat) — existing
- ✓ Dual storage strategy (FSA for desktop, Dexie for non-desktop) — existing
- ✓ TanStack Router + TanStack Query integration — existing
- ✓ Zustand v5 state management (fragmented but functional) — existing
- ✓ Dexie.js IndexedDB persistence — existing
- ✓ 8-bit design system with sharp corners — existing
- ✓ i18n support (EN/VI) — existing

### Active

Architecture remediation targets:

- [ ] **STATE-01**: Define 4-layer state architecture (UI → Session → Persisted → File)
- [ ] **STATE-02**: Eliminate Zustand persist middleware for Dexie-owned data
- [ ] **STATE-03**: Enforce `useShallow()` for all Zustand selectors
- [ ] **STATE-04**: Enforce `useLiveQuery()` for all Dexie data access
- [ ] **IMPORT-01**: Migrate all `@/lib/*` imports to canonical paths
- [ ] **IMPORT-02**: Establish import path governance (lint rules)
- [ ] **SPLIT-01**: Split god stores (>300 LOC) into focused slices
- [ ] **SPLIT-02**: Split god components (>400 LOC) into composable units
- [ ] **PLUGIN-01**: Define plugin capability interface
- [ ] **PLUGIN-02**: Implement shared ActiveDocument state
- [ ] **PLUGIN-03**: Implement live sync between editors (Monaco ↔ Notes)
- [ ] **PLUGIN-04**: Wire Terminal → Preview dev server detection
- [ ] **SCHEMA-01**: Define canonical data schemas (Project, Thread, Note, File)
- [ ] **SCHEMA-02**: Document data flow contracts (who writes, who reads)
- [ ] **TEST-01**: Establish test infrastructure for critical paths
- [ ] **AGENT-01**: Implement agent suggest mode (propose changes, human approves)

### Out of Scope

- **Full Agent CRUD** — Agents directly creating/editing/deleting files. Deferred to v2. Too complex for foundation phase.
- **New features** — All feature development paused until architecture stabilized.
- **Mobile optimization** — Non-desktop experience is functional but not prioritized.
- **RAG/Embedding features** — Dependent on clean state architecture, comes after.
- **Multi-project support** — Single project focus for v1.
- **Cloud sync** — Local-first only for now.

## Context

### Current Health Metrics

| Metric | Current | Target |
|--------|---------|--------|
| `@/lib/` import violations | 674 | 0 |
| God files (>300 LOC) | 30 | <10 |
| Fragmented Zustand stores | 40+ | Consolidated |
| Test coverage | ~9% | >50% |
| Health Score | 29.5% | >85% |

### Root Causes of Pain

1. **State boundary confusion** — Zustand, Dexie, and FSA all store "data" without clear contracts. Components read from multiple sources, causing race conditions and stale data.

2. **Import path anarchy** — `@/lib/*` became a dumping ground. AI agents create files in wrong locations. No enforceable structure.

3. **God stores** — Single stores managing 10+ concerns. Changes cascade unpredictably.

4. **Plugin isolation** — Plugins work independently but fail on coordination. EPIC-0.6 added infrastructure but contracts unclear.

5. **Refuktor loop** — Quick patches create types/stores to make things work, which creates more confusion, which requires more patches.

### Key Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **State Contracts** | `.planning/architecture/STATE-CONTRACTS.md` | 4-layer state architecture rules |
| **Entity Layers** | `.planning/architecture/ENTITY-LAYERS.md` | Entity-to-layer mapping |
| Codebase Architecture | `.planning/codebase/ARCHITECTURE.md` | Current layered architecture |
| Codebase Concerns | `.planning/codebase/CONCERNS.md` | Health metrics and issues |
| Fundamental Truths | `new-fundamental-truths.md` | Architectural principles (needs enforcement) |
| Plugin Coordination Epic | `_bmad-output/planning-artifacts/epics/EPIC-0.6-*` | Previous coordination attempt |

## Constraints

- **Tech stack**: React 19, TypeScript, TanStack (Router, Query, AI SDK), Zustand v5, Dexie.js. No framework changes.
- **Timeline**: 8-12 weeks for Foundation Reset. No feature work during this period.
- **Solo developer**: User is product owner. Claude is builder. No team ceremonies.
- **Brownfield**: Must migrate incrementally. Cannot rewrite from scratch.
- **Platform support**: Desktop (FSA) is primary. Non-desktop (IndexedDB) must not break.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Agent editing = v2 (Suggest mode) | Full CRUD requires versioning, locking, audit trail. Too complex for foundation. | — Pending |
| Plugin file open = simultaneous | User expects Monaco AND Notes to show same file when clicked. | — Pending |
| Editor sync = live | Real-time sync between editors, not warnings. | — Pending |
| State boundaries = 4-layer | UI (Zustand no persist) → Session (Zustand + hydration) → Persisted (Dexie) → File (FSA/OPFS) | — Pending |
| Import paths = canonical only | Kill `@/lib/*`, enforce domain-driven paths via lint | — Pending |

## Plugin Coordination Contracts

### File Selection Flow

```
User clicks file in FileTree
    ↓
FileTree calls coordination.setActiveDocument(path)
    ↓
Monaco subscribes → opens file in editor
Notes subscribes → opens file if .md/.mdx
    ↓
Both show same content, live synced
```

### Live Sync Protocol

```
Editor A types character
    ↓
Editor A updates coordination.activeDocument.content
    ↓
Editor B receives update via subscription
    ↓
Editor B applies diff (preserving cursor)
```

### Dev Server Detection Flow

```
Terminal runs `npm run dev`
    ↓
Terminal output parsed for localhost URL
    ↓
coordination.queueDeferredUrl(url)
    ↓
Preview subscribes → shows iframe OR "waiting for dev server"
```

## State Layer Architecture

| Layer | Technology | Purpose | Examples |
|-------|------------|---------|----------|
| **L1: UI State** | Zustand (NO persist) | Transient UI state | Panel open/closed, hover, focus |
| **L2: Session State** | Zustand + Dexie hydration | Tab/window context | Active project ID, open tabs, layout |
| **L3: Persisted State** | Dexie.js (source of truth) | Long-term storage | Projects, threads, settings |
| **L4: File State** | FSA / SQLite+OPFS | Actual file content | Source code, markdown notes |

### Boundary Rules (NON-NEGOTIABLE)

1. **Never use Zustand persist for Dexie-owned data**
2. **Always use `useShallow()` for Zustand selectors**
3. **Always use `useLiveQuery()` for Dexie data**
4. **File operations MUST go through sync engine**

---
*Last updated: 2026-01-31 after initialization*
