# Revised Roadmap: Project Alpha Architecture Remediation

**Created:** 2026-01-31
**Based on:** Research conducted 2026-01-31
**Target:** 90%+ Health Score (was 29.5%)
**Duration:** 6-8 weeks (was 12 weeks)

---

## Why This Roadmap is Different

The original 12-phase roadmap treated symptoms. This 6-phase roadmap attacks root causes.

| Original Approach | Revised Approach |
|-------------------|------------------|
| Schema definitions first | Conceptual clarity first |
| Many small phases | Fewer deep phases |
| Parallel concerns | Sequential dependencies |
| Patch and fix | Understand then fix |

---

## Phase Overview

| Phase | Name | Goal | Duration | Dependencies |
|-------|------|------|----------|--------------|
| **01** | Conceptual Clarity | Everyone agrees what the model IS | 1 week | None |
| **02** | Schema Consolidation | Single source of truth per entity | 1 week | 01 |
| **03** | State Layer Enforcement | Clear Zustand/Dexie boundaries | 1 week | 02 |
| **04** | Plugin Coordination | Event bus + shared state working | 1.5 weeks | 03 |
| **05** | Structure & Governance | Clean imports, no god files, lint rules | 2 weeks | 04 |
| **06** | Verification & Coverage | Tests passing, 50%+ coverage | 1.5 weeks | 05 |

**Total: 8 weeks to 90%+ health**

---

## Phase 01: Conceptual Clarity

**Goal:** Establish canonical understanding of the domain model. No code changes until everyone (including AI agents) knows what the entities ARE.

**Duration:** 1 week

### Success Criteria

1. ✅ DOMAIN-MODEL.md reviewed and approved
2. ✅ NO-WORKSPACE-MANDATE.md updated with enforcement plan
3. ✅ Entity relationship diagram created
4. ✅ All AI agents can answer: "What owns what?"

### Deliverables

| Artifact | Status | Location |
|----------|--------|----------|
| Domain Model | ✅ DONE | `.planning/research/DOMAIN-MODEL-2026-01-31.md` |
| Plugin Contracts | ✅ DONE | `.planning/research/PLUGIN-CONTRACTS-2026-01-31.md` |
| Architecture | ✅ DONE | `.planning/research/ARCHITECTURE-2026-01-31.md` |
| Entity Diagram | ⬜ TODO | `.planning/architecture/ENTITY-DIAGRAM.md` |
| Updated NO-WORKSPACE | ⬜ TODO | `.planning/architecture/NO-WORKSPACE-MANDATE.md` |

### Plans

- [ ] 01-01-PLAN: Review and finalize domain model
- [ ] 01-02-PLAN: Create entity relationship diagram
- [ ] 01-03-PLAN: Update NO-WORKSPACE with enforcement steps

### What Makes This Different

The original Phase 01 defined "state contracts" but didn't address WHY the confusion existed. This phase ensures conceptual clarity BEFORE touching schemas.

---

## Phase 02: Schema Consolidation

**Goal:** Single source of truth for every entity type. Zero duplicate definitions.

**Duration:** 1 week

### Success Criteria

1. ✅ `@/domain/schemas/` is THE source for all entity types
2. ✅ `@/domain/entities/` re-exports from schemas (backward compat)
3. ✅ Zero duplicate FileMetadata definitions (was 6)
4. ✅ Zero workspaceBindings references (was 361)
5. ✅ All 9+ infrastructure files import from schemas

### Deliverables

| Artifact | Status | Location |
|----------|--------|----------|
| Project schema | ✅ EXISTS | `src/domain/schemas/project.schema.ts` |
| File schema | ✅ EXISTS | `src/domain/schemas/file.schema.ts` |
| Thread schema | ✅ EXISTS | `src/domain/schemas/thread.schema.ts` |
| Note schema | ✅ EXISTS | `src/domain/schemas/note.schema.ts` |
| Entity re-exports | ⬜ TODO | `src/domain/entities/*.ts` |
| Import migration | ⬜ TODO | All 9+ files |

### Plans

- [ ] 02-01-PLAN: Update entities to re-export from schemas
- [ ] 02-02-PLAN: Kill duplicate FileMetadata definitions (6 files)
- [ ] 02-03-PLAN: Eliminate workspaceBindings references (361)
- [ ] 02-04-PLAN: Update infrastructure imports (9+ files)

### What Makes This Different

The original Phase 02 created correct schemas but left the old entities in place. This phase ensures migration is COMPLETE before proceeding.

---

## Phase 03: State Layer Enforcement

**Goal:** Zustand for UI/session, Dexie for persistence. No mixing.

**Duration:** 1 week

### Success Criteria

1. ✅ Zero Zustand persist on entity data
2. ✅ All Zustand selectors use `useShallow()`
3. ✅ All Dexie queries use `useLiveQuery()`
4. ✅ State layer assignments documented per entity
5. ✅ Session hydration from Dexie working

### Deliverables

| Artifact | Status | Location |
|----------|--------|----------|
| State layer assignments | ⬜ TODO | `.planning/architecture/STATE-LAYERS.md` |
| Zustand audit | ⬜ TODO | All stores checked for persist |
| useShallow migration | ⬜ TODO | All 2660 store references |
| useLiveQuery migration | ⬜ TODO | All Dexie access |

### Plans

- [ ] 03-01-PLAN: Audit all Zustand stores for persist misuse
- [ ] 03-02-PLAN: Migrate to useShallow pattern
- [ ] 03-03-PLAN: Ensure all Dexie access uses useLiveQuery
- [ ] 03-04-PLAN: Implement session hydration pattern

### What Makes This Different

Can only proceed after schemas are consolidated. Original roadmap attempted this before schema consolidation was complete.

---

## Phase 04: Plugin Coordination

**Goal:** Plugins communicate via events and shared state. No direct coupling.

**Duration:** 1.5 weeks

### Success Criteria

1. ✅ Single event bus for all plugin communication
2. ✅ Shared coordination store for ActiveDocument
3. ✅ Write lock protocol implemented
4. ✅ Monaco ↔ Notes live sync working
5. ✅ Terminal → Preview dev server detection working
6. ✅ Platform capability detection working

### Deliverables

| Artifact | Status | Location |
|----------|--------|----------|
| Event bus types | ⬜ TODO | `src/infrastructure/events/plugin-events.ts` |
| Coordination store | ⬜ TODO | `src/infrastructure/coordination/` |
| Write lock service | ⬜ TODO | `src/domain/services/write-lock.ts` |
| Capability detector | ⬜ TODO | `src/infrastructure/platform/` |

### Plans

- [ ] 04-01-PLAN: Implement typed event bus
- [ ] 04-02-PLAN: Create coordination store with ActiveDocument
- [ ] 04-03-PLAN: Implement write lock protocol
- [ ] 04-04-PLAN: Wire Monaco ↔ Notes live sync
- [ ] 04-05-PLAN: Wire Terminal → Preview detection
- [ ] 04-06-PLAN: Implement platform capability detection

### What Makes This Different

Original Phase 08 (Plugin Coordination) was placed after import migration and store splitting. But coordination is FOUNDATIONAL - it enables safe refactoring of stores and components.

---

## Phase 05: Structure & Governance

**Goal:** Clean imports, no god files, automated enforcement.

**Duration:** 2 weeks

### Success Criteria

1. ✅ Zero `@/lib/` imports (was 674)
2. ✅ Zero god stores >300 LOC (was 5)
3. ✅ Zero god components >400 LOC (was 10+)
4. ✅ ESLint rules blocking violations
5. ✅ `pnpm governance` returns 0 violations

### Deliverables

| Artifact | Status | Location |
|----------|--------|----------|
| Import migration | ⬜ TODO | 674 files |
| PluginLayoutStore split | ⬜ TODO | 692 → 6 slices |
| slash-command-store split | ⬜ TODO | 541 → 5 slices |
| file-tree-store split | ⬜ TODO | 536 → 5 slices |
| Component splits | ⬜ TODO | AISlashCommand, NoteEditor, etc. |
| ESLint rules | ⬜ TODO | `.eslintrc` |

### Plans

- [ ] 05-01-PLAN: Map @/lib/ imports by category
- [ ] 05-02-PLAN: Migrate infrastructure imports
- [ ] 05-03-PLAN: Migrate domain imports
- [ ] 05-04-PLAN: Split god stores (facade pattern)
- [ ] 05-05-PLAN: Split god components
- [ ] 05-06-PLAN: Add ESLint enforcement rules

### What Makes This Different

Now that coordination layer exists, store splitting can be done safely with event-based communication between slices.

---

## Phase 06: Verification & Coverage

**Goal:** Tests passing, coverage at 50%+, all checks green.

**Duration:** 1.5 weeks

### Success Criteria

1. ✅ `pnpm test` passes (currently broken)
2. ✅ Test coverage >50% (was ~9%)
3. ✅ E2E tests for critical paths passing
4. ✅ CI pipeline blocks new violations
5. ✅ Health score >90% (was 29.5%)

### Deliverables

| Artifact | Status | Location |
|----------|--------|----------|
| Test setup fixed | ⬜ TODO | `src/test/setup.ts` |
| Store tests | ⬜ TODO | Per store |
| Service tests | ⬜ TODO | Per service |
| E2E tests | ⬜ TODO | `e2e/*.spec.ts` |
| CI config | ⬜ TODO | `.github/workflows/` |

### Plans

- [ ] 06-01-PLAN: Fix test setup (vi imports)
- [ ] 06-02-PLAN: Add unit tests for domain services
- [ ] 06-03-PLAN: Add integration tests for stores
- [ ] 06-04-PLAN: Add E2E tests for plugin coordination
- [ ] 06-05-PLAN: Configure CI for governance checks

---

## Dependency Graph

```
Phase 01 (Conceptual Clarity)
    │
    ▼
Phase 02 (Schema Consolidation)
    │
    ▼
Phase 03 (State Layer Enforcement)
    │
    ▼
Phase 04 (Plugin Coordination)
    │
    ▼
Phase 05 (Structure & Governance)
    │
    ▼
Phase 06 (Verification & Coverage)
    │
    ▼
✅ 90%+ Health Score
```

**Critical:** Each phase depends on the previous. Do not skip ahead.

---

## Milestones

| Milestone | Phases | Health Score | Week |
|-----------|--------|--------------|------|
| **M1: Clarity** | 01 | 30% | 1 |
| **M2: Schemas** | 02 | 40% | 2 |
| **M3: State** | 03 | 50% | 3 |
| **M4: Coordination** | 04 | 65% | 4.5 |
| **M5: Structure** | 05 | 80% | 6.5 |
| **M6: Verified** | 06 | 90%+ | 8 |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Schema migration breaks runtime | Medium | High | Keep backward-compat aliases |
| Store splitting breaks features | Medium | High | Facade exports, incremental |
| Plugin coordination has hidden deps | High | Medium | Event trace logging |
| Test coverage slows velocity | Low | Low | Focus on critical paths |
| AI agents create files wrong | Medium | Medium | Updated AGENTS.md with rules |

---

## What's Different from Original Roadmap

| Original Phase | Status | New Location |
|----------------|--------|--------------|
| 01 State Contracts | Merged | Phase 01 (Conceptual Clarity) |
| 02 Schema Definitions | Merged | Phase 02 (Schema Consolidation) |
| 03 Test Infrastructure | Moved | Phase 06 (Verification) |
| 04 State Enforcement | Kept | Phase 03 |
| 05 Import Governance | Merged | Phase 05 |
| 06 God Store Splitting | Merged | Phase 05 |
| 07 God Component Splitting | Merged | Phase 05 |
| 08 Plugin Coordination | Moved Up | Phase 04 |
| 09 Governance Automation | Merged | Phase 05 + 06 |
| 10 Test Coverage | Moved | Phase 06 |
| 11 Schema Versioning | Deferred | Post-foundation |
| 12 Agent Integration | Deferred | Post-foundation |

**Key changes:**
- Plugin coordination moved UP (it enables safe refactoring)
- Tests moved to END (don't test unstable code)
- Schema versioning & agent integration deferred (not foundation)

---

## Next Steps

1. **Review this roadmap** - Ensure alignment with vision
2. **Archive old roadmap** - Move to `.planning/archive/`
3. **Begin Phase 01** - Finalize domain model, create diagrams
4. **Update AGENTS.md** - Include new canonical paths

---

*Roadmap created: 2026-01-31*
*Based on research: `.planning/research/`*
