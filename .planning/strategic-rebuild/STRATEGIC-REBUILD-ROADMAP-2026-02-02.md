# Strategic Rebuild Roadmap

**Version:** 1.0.0
**Created:** 2026-02-02
**Authority:** This document SUPERSEDES the previous A-E ROADMAP for architectural remediation
**Approach:** Strangler Fig Pattern - build clean alongside old, port features incrementally

---

## Executive Decision Record

### The Problem

| Metric | Value | Impact |
|--------|-------|--------|
| Total codebase | 281,071 lines | Large investment |
| src/lib/ (contaminated) | 74,925 lines (27%) | BANNED path with 660 imports |
| workspaceId references | 556 | BANNED term, deep contamination |
| workspaceBindings references | 156 | BANNED term, cascades to 156+ files |
| WorkspaceType vs PluginType | 370 vs 104 | Migration 22% complete |
| Dexie contamination | 381 references | DATABASE level |
| TypeScript errors | 160+ | Schema conflicts |
| Platform Operators in plugins/ | 2 (FileTree, Chat) | Structural misalignment |

### Why Gradual Fix Failed

1. Phase 0-5 approach abandoned (3,900+ violations remained)
2. Phase A-E approach hitting same walls
3. Every phase requires its own "prerequisites"
4. AI agents confused by dual terminology
5. Estimated gradual migration: 3-6 months (may never complete)

### Why Strategic Rebuild

1. Truly valuable code is SMALL and PORTABLE (5,973 lines in plugins/)
2. Users' data preserved (Dexie schema compatibility)
3. Working features can be ported (BYOK, FSA, BlockNote)
4. Clean foundation enables future velocity
5. Estimated rebuild: 3-4 weeks to feature parity

### Decision

**APPROVED: Strategic Rebuild using Strangler Fig Pattern**

---

## Strangler Fig Strategy

```
                    CURRENT STATE                          TARGET STATE
                    ─────────────                          ────────────
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│ src/                                │      │ src/                                │
│ ├── lib/ (74,925 lines) ❌ BANNED  │      │ ├── platform/                       │
│ ├── plugins/ (5,973 lines) ✅ KEEP │  ──► │ │   ├── operators/ (FileTree, Chat) │
│ ├── infrastructure/ ✅ PARTIAL     │      │ │   └── core/                       │
│ ├── presentation/ ✅ PARTIAL       │      │ ├── modules/ (Monaco, Notes, etc.)  │
│ └── domain/ ✅ KEEP                │      │ ├── infrastructure/ (clean)         │
│                                     │      │ ├── presentation/ (clean)           │
│ workspaceId: 556 refs               │      │ └── domain/ (clean)                 │
│ workspaceBindings: 156 refs         │      │                                     │
│ @/lib imports: 660 refs             │      │ projectId ONLY: everywhere          │
│                                     │      │ @/lib: 0 imports                    │
│ Hydration races: 3                  │      │ Simple state: no hydration issues   │
│ Platform in plugins/: wrong         │      │ Platform in platform/: correct      │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
```

---

## Phase Overview

| Phase | Name | Duration | Goal | Validation Gate |
|-------|------|----------|------|-----------------|
| **R-0** | Foundation | 3-4 days | Clean architecture scaffold | TypeScript compiles, routes work |
| **R-1** | Platform Layer | 3-4 days | FileTree + Chat always load | Platform Operators render |
| **R-2** | Port Infrastructure | 2-3 days | BYOK, FSA, storage work | Data persists correctly |
| **R-3** | Port Modules | 4-5 days | Notes, Monaco, Terminal | Feature parity verified |
| **R-4** | Cutover | 2-3 days | Old code removed, tests pass | E2E tests pass |
| **R-5** | Resume Roadmap | Ongoing | Phase B+ on clean foundation | Roadmap continues |

**Total: ~3 weeks to clean architecture + feature parity**

---

## Phase R-0: Foundation

**Goal:** Create the clean architecture scaffold that matches SOURCE-OF-TRUTH.md

### Directory Structure to Create

```
src/
├── platform/                    # NEW - Platform layer (always running)
│   ├── operators/               # FileTree, Chat-Cascade
│   │   ├── filetree/
│   │   └── chat/
│   ├── core/                    # Platform services
│   │   ├── project-context.tsx
│   │   ├── platform-provider.tsx
│   │   └── storage-gateway.ts
│   └── types/                   # Platform types
│       ├── operator.types.ts
│       └── platform.types.ts
│
├── modules/                     # NEW - Feature modules (optional)
│   ├── monaco/
│   ├── notes/
│   ├── terminal/
│   └── preview/
│
├── infrastructure/              # KEEP - External interfaces
│   ├── ai/                      # Phase A BYOK (port as-is)
│   ├── persistence/             # Dexie (clean up stores)
│   └── filesystem/              # FSA adapter (port as-is)
│
├── presentation/                # KEEP - React components
│   ├── components/              # UI components
│   ├── layouts/                 # Clean layout system
│   └── hooks/                   # Clean hooks
│
├── domain/                      # KEEP - Business logic
│   ├── entities/                # Clean entities (no workspaceId)
│   ├── schemas/                 # Zod schemas
│   └── types/                   # Domain types
│
└── routes/                      # KEEP - TanStack Router
    ├── index.tsx
    ├── $projectId.tsx           # Clean project route
    └── hub/
```

### Tasks

| ID | Task | Depends On | Validation |
|----|------|------------|------------|
| R-0-01 | Create directory structure | None | Directories exist |
| R-0-02 | Create platform types (no workspaceId) | R-0-01 | TypeScript compiles |
| R-0-03 | Create PlatformProvider context | R-0-02 | Context provides values |
| R-0-04 | Create clean project route | R-0-03 | Route loads |
| R-0-05 | Create simple layout (no hydration) | R-0-04 | Layout renders |

### Validation Gate R-0

```yaml
gate_r0:
  automated:
    - pnpm typecheck:fast # New code has 0 errors
    - pnpm test:fast # No regressions
  manual:
    - Navigate to / → Hub renders
    - Navigate to /$projectId → Clean layout renders
  artifacts:
    - R-0-SUMMARY.md created
    - No new @/lib imports
```

---

## Phase R-1: Platform Layer

**Goal:** FileTree and Chat-Cascade ALWAYS load correctly (no hydration issues)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PROJECT ROUTE                               │
│                      (src/routes/$projectId.tsx)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ PlatformProvider (NO HYDRATION - always renders)            │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌───────────────┐  ┌─────────────────┐    │   │
│  │  │ FileTree    │  │ ModulePanel   │  │ Chat-Cascade    │    │   │
│  │  │ OPERATOR    │  │ (store-driven)│  │ OPERATOR        │    │   │
│  │  │             │  │               │  │                 │    │   │
│  │  │ HARDCODED   │  │ Notes/Monaco/ │  │ HARDCODED       │    │   │
│  │  │ always here │  │ Terminal      │  │ always here     │    │   │
│  │  └─────────────┘  └───────────────┘  └─────────────────┘    │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Platform Operators are HARDCODED in layout** - not store-driven
2. **Only Feature Modules use activity-bar store**
3. **No hydration dependency for Platform layer**
4. **Simple state: if project exists, platform renders**

### Tasks

| ID | Task | Depends On | Validation |
|----|------|------------|------------|
| R-1-01 | Port FileTree operator to src/platform/operators/ | R-0 | FileTree compiles |
| R-1-02 | Port Chat operator to src/platform/operators/ | R-0 | Chat compiles |
| R-1-03 | Create PlatformLayout component | R-1-01, R-1-02 | Layout renders both |
| R-1-04 | Wire operators to project route | R-1-03 | Operators always visible |
| R-1-05 | Remove operators from activity-bar store | R-1-04 | Store simplified |

### Validation Gate R-1

```yaml
gate_r1:
  automated:
    - pnpm typecheck:fast # 0 new errors
    - pnpm governance # passes
  manual:
    - Enter project → FileTree ALWAYS visible (left)
    - Enter project → Chat ALWAYS visible (right)
    - No "Loading..." states for Platform layer
    - Refresh browser → still works (no hydration issue)
  artifacts:
    - R-1-SUMMARY.md created
    - Operators in src/platform/operators/
```

---

## Phase R-2: Port Infrastructure

**Goal:** BYOK, FSA storage, and persistence work on clean architecture

### What to Port

| Component | Source | Target | Changes Needed |
|-----------|--------|--------|----------------|
| CredentialVault | src/infrastructure/ai/ | Same (already clean) | None |
| ModelLoader | src/infrastructure/ai/ | Same (already clean) | None |
| FSA Adapter | src/infrastructure/filesystem/ | Same | Remove workspaceId refs |
| Dexie Schema | src/infrastructure/persistence/ | Same | Compat layer for workspaceId |
| Project Store | src/infrastructure/persistence/stores/project/ | Same | Clean up types |

### Database Compatibility

```typescript
// Dexie schema stays compatible (users' data preserved)
// But NEW code uses projectId only

// Compatibility layer for reads:
function getProjectFiles(projectId: string): FileMetadata[] {
  // Reads both old (with workspaceId) and new (projectId only) records
  return db.files.where('projectId').equals(projectId).toArray();
}

// New writes use projectId only:
function saveFile(file: FileMetadata): void {
  // No workspaceId in new records
  db.files.put({ ...file, projectId: file.projectId });
}
```

### Tasks

| ID | Task | Depends On | Validation |
|----|------|------------|------------|
| R-2-01 | Create storage compatibility layer | R-1 | Old data readable |
| R-2-02 | Port Project store (clean types) | R-2-01 | Projects load |
| R-2-03 | Port file-tree-store (clean types) | R-2-02 | File tree populates |
| R-2-04 | Verify FSA sync works | R-2-03 | Files sync to disk |
| R-2-05 | Verify BYOK works | R-2-04 | API keys work |

### Validation Gate R-2

```yaml
gate_r2:
  automated:
    - pnpm typecheck:fast # 0 new errors
    - pnpm test:fast # storage tests pass
  manual:
    - Create project → persists in Dexie
    - Add API key → persists and loads models
    - FSA project → files sync to disk
    - Refresh → all data still there
  artifacts:
    - R-2-SUMMARY.md created
    - No new workspaceId in new code
```

---

## Phase R-3: Port Modules

**Goal:** Notes, Monaco, Terminal, Preview work as Feature Modules

### Module Architecture

```
src/modules/
├── monaco/
│   ├── MonacoModule.tsx       # Main component
│   ├── hooks/                 # Module-specific hooks
│   └── index.ts               # Module definition
│
├── notes/
│   ├── NotesModule.tsx        # Main component
│   ├── blocks/                # 22 BlockNote blocks
│   ├── ai/                    # AI features (stubbed)
│   └── index.ts               # Module definition
│
├── terminal/
│   └── ...
│
└── preview/
    └── ...
```

### Tasks

| ID | Task | Depends On | Validation |
|----|------|------------|------------|
| R-3-01 | Create module loader system | R-2 | Modules can register |
| R-3-02 | Port Monaco module | R-3-01 | Monaco opens files |
| R-3-03 | Port Notes module (all 22 blocks) | R-3-01 | Notes editor works |
| R-3-04 | Port Terminal module | R-3-01 | Terminal runs commands |
| R-3-05 | Port Preview module | R-3-04 | Preview shows dev server |
| R-3-06 | Wire module panel to activity-bar | R-3-05 | Modules toggle correctly |

### Validation Gate R-3

```yaml
gate_r3:
  automated:
    - pnpm typecheck:fast # 0 new errors
    - pnpm test:fast # all tests pass
    - pnpm governance # passes
  manual:
    - Monaco: open file, edit, save
    - Notes: create note, use AI blocks (stubbed OK)
    - Terminal: run npm command
    - Preview: see dev server output
    - Toggle modules via activity bar
  artifacts:
    - R-3-SUMMARY.md created
    - Feature parity checklist completed
```

---

## Phase R-4: Cutover

**Goal:** Remove old code, run full E2E tests, verify production readiness

### Cutover Steps

1. **Verify feature parity** - All working features still work
2. **Run E2E tests** - All journey tests pass
3. **Archive old code** - Move src/lib/ to _archived/
4. **Update imports** - Any remaining @/lib imports updated
5. **Final governance** - All checks pass

### Tasks

| ID | Task | Depends On | Validation |
|----|------|------------|------------|
| R-4-01 | Run full E2E test suite | R-3 | All tests pass |
| R-4-02 | Archive src/lib/ to _archived/ | R-4-01 | No imports break |
| R-4-03 | Update any remaining imports | R-4-02 | TypeScript clean |
| R-4-04 | Final governance check | R-4-03 | All checks pass |
| R-4-05 | Update documentation | R-4-04 | Docs reflect new structure |

### Validation Gate R-4

```yaml
gate_r4:
  automated:
    - pnpm typecheck:fast # 0 errors total
    - pnpm test:fast # all pass
    - pnpm test:e2e # all pass
    - pnpm governance # passes
  manual:
    - Deploy to preview environment
    - Manual smoke test all features
    - Performance check (no regression)
  artifacts:
    - R-4-SUMMARY.md created
    - _archived/ contains old code
    - @/lib imports: 0
```

---

## Phase R-5: Resume Roadmap

**Goal:** Continue Phase B (AI Gateway) on clean foundation

### Roadmap Continuation

With clean architecture, the original roadmap can proceed:

| Phase | Name | Status After R-4 |
|-------|------|------------------|
| A | BYOK Foundation | COMPLETE (ported) |
| B | AI Gateway | READY (clean foundation) |
| C | Notes AI | UNBLOCKED |
| D | Agentic Features | UNBLOCKED |
| E | RAG System | UNBLOCKED |

### Why This Works Now

1. **No terminology confusion** - projectId only, no workspaceId
2. **No hydration races** - Platform is hardcoded, not store-driven
3. **No @/lib imports** - All canonical paths
4. **Clean module boundaries** - Platform vs Modules clearly separated
5. **AI agents productive** - Clear mental model matches SOURCE-OF-TRUTH

---

## Governance Rules

### During Rebuild

1. **NO mixing old and new patterns** - Don't import from src/lib/ in new code
2. **NO adding workspaceId** - Use projectId only in all new code
3. **NO complex hydration** - Platform layer is simple, always renders
4. **NO skipping validation gates** - Each phase must pass before next

### Escalation Protocol

If during any phase you encounter:
- Schema needs changing → STOP, escalate to architect
- Feature can't be ported → STOP, document why, escalate
- Type errors cascade → STOP, don't patch, escalate

### Artifact Requirements

Each phase MUST produce:
- `R-{N}-PLAN.md` - Before execution
- `R-{N}-SUMMARY.md` - After completion
- Validation gate results documented
- Any gaps added to GAPS-TRACKER.yaml

---

## Success Criteria

### Phase R-4 Complete When:

- [ ] All working features from old architecture work in new
- [ ] TypeScript errors: 0 (not baseline, actually 0)
- [ ] @/lib imports: 0
- [ ] workspaceId in new code: 0
- [ ] E2E tests: all pass
- [ ] Governance: passes
- [ ] Users' data: preserved

### Overall Success:

- [ ] Architecture matches SOURCE-OF-TRUTH.md
- [ ] Platform Operators in src/platform/ (not plugins/)
- [ ] Feature Modules in src/modules/
- [ ] Simple state management (no hydration races)
- [ ] AI agents can work productively
- [ ] Future phases build on solid foundation

---

## Timeline

| Week | Phases | Key Deliverables |
|------|--------|------------------|
| 1 | R-0, R-1 | Clean architecture, Platform layer working |
| 2 | R-2, R-3 | Infrastructure ported, Modules working |
| 3 | R-4, R-5 | Cutover complete, Resume Phase B |

**Start Date:** TBD (awaiting user approval)
**Target Completion:** 3 weeks from start

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `.planning/SOURCE-OF-TRUTH.md` | Canonical architecture (MUST align) |
| `.planning/what-bring-us-here.md` | Why this decision was made |
| `.planning/governance/GAPS-TRACKER.yaml` | Gap tracking |
| `.planning/strategic-rebuild/phases/R-{N}-*.md` | Phase artifacts |

---

*Strategic Rebuild Roadmap v1.0.0*
*Decision Date: 2026-02-02*
*Approved by: [Awaiting user approval]*
