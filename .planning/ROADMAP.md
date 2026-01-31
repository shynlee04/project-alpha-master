# Roadmap: Project Alpha Architecture Remediation

**Created:** 2026-01-31
**Target:** Foundation Reset (8-12 weeks)
**Health Score:** 29.5% → 85%+

---

## Overview

| Phase | Name | Goal | Requirements | Effort |
|-------|------|------|--------------|--------|
| 01 | State Architecture Contracts | Define the 4-layer state boundaries | STATE-01, STATE-05, SCHEMA-05, SCHEMA-06 | 1 week |
| 02 | Schema Definitions | Canonical schemas for all entities | SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04 | 1 week |
| 03 | Test Infrastructure | Fix broken tests, establish patterns | TEST-01 | 0.5 week |
| 04 | State Layer Enforcement | Enforce Zustand/Dexie boundaries | STATE-02, STATE-03, STATE-04 | 1 week |
| 05 | Import Path Governance | Kill @/lib/*, enforce canonical paths | IMPORT-01, IMPORT-02, IMPORT-03, IMPORT-04, IMPORT-05 | 1.5 weeks |
| 06 | God Store Splitting | Split stores >300 LOC into slices | SPLIT-01, SPLIT-03 (stores) | 1.5 weeks |
| 07 | God Component Splitting | Split components >400 LOC | SPLIT-02, SPLIT-03 (components) | 1.5 weeks |
| 08 | Plugin Coordination | Wire plugins together properly | PLUGIN-01, PLUGIN-02, PLUGIN-03, PLUGIN-04, PLUGIN-05, PLUGIN-06 | 1.5 weeks |
| 09 | Governance Automation | CI checks, lint rules, pre-commit | STATE-06, STATE-07, SPLIT-04, SPLIT-05 | 1 week |
| 10 | Test Coverage Expansion | Achieve 50%+ coverage | TEST-02, TEST-03, TEST-04, TEST-05 | 1.5 weeks |
| 11 | Schema Versioning & Docs | Dexie migrations, data flow diagrams | SCHEMA-07, SCHEMA-08 | 0.5 week |
| 12 | Agent Integration | Suggest mode, diff view, permissions | AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05 | 1 week |

**Total: 12 phases, ~12 weeks**

---

## Phase Details

### Phase 01: State Architecture Contracts

**Goal:** Define the 4-layer state architecture as enforceable contracts before touching any code.

**Why first:** Everything else (imports, stores, plugins) depends on knowing "where does this data live?"

**Requirements:**
- STATE-01: Define 4-layer state architecture contracts (UI → Session → Persisted → File)
- STATE-05: Document "where does this data live" for each entity type
- SCHEMA-05: Document data flow contracts (who writes, who reads, event triggers)
- SCHEMA-06: Establish single source of truth per entity (no duplication)

**Success Criteria:**
1. State Layer Contract document exists with explicit rules
2. Every entity type (Project, Thread, Note, File, Settings) has assigned layer
3. Data flow diagrams show read/write responsibilities
4. No ambiguity about Zustand vs Dexie vs FSA ownership

**Plans:** 2 plans
- [ ] 01-01-PLAN.md — State contracts and entity layer mapping
- [ ] 01-02-PLAN.md — Data flow contracts and sync patterns

---

### Phase 02: Schema Definitions

**Goal:** Define canonical TypeScript schemas for all core entities.

**Why second:** Schemas must exist before we can enforce state boundaries or split stores.

**Requirements:**
- SCHEMA-01: Define canonical schemas for Project entity
- SCHEMA-02: Define canonical schemas for Thread entity
- SCHEMA-03: Define canonical schemas for Note entity
- SCHEMA-04: Define canonical schemas for File entity

**Success Criteria:**
1. `src/domain/schemas/` contains canonical Zod schemas
2. All entities have single source of truth types
3. Legacy type aliases point to canonical schemas
4. No duplicate type definitions across codebase

**Plans:** 2 plans
- [ ] 02-01-PLAN.md — Project and File Zod schemas
- [ ] 02-02-PLAN.md — Thread/Chat and Note Zod schemas

---

### Phase 03: Test Infrastructure

**Goal:** Fix broken test setup so we can verify changes don't break things.

**Why third:** We need working tests before making large-scale refactors.

**Requirements:**
- TEST-01: Fix broken test setup (vi imports, Project type errors)

**Success Criteria:**
1. `pnpm test` runs without setup errors
2. Vitest `vi` imports resolve correctly
3. Project entity tests pass
4. Test patterns documented

**Plans:** TBD

---

### Phase 04: State Layer Enforcement

**Goal:** Enforce the state boundaries defined in Phase 01.

**Why fourth:** Contracts exist, schemas exist, tests work. Now enforce the rules.

**Requirements:**
- STATE-02: Eliminate Zustand persist middleware for Dexie-owned data
- STATE-03: Enforce `useShallow()` on all Zustand selectors
- STATE-04: Enforce `useLiveQuery()` for all Dexie data access

**Success Criteria:**
1. Zero Zustand stores using persist for Dexie-owned data
2. All Zustand selectors use `useShallow()`
3. All Dexie queries use `useLiveQuery()` or equivalent
4. Lint rules warn on violations

**Plans:** TBD

---

### Phase 05: Import Path Governance

**Goal:** Kill `@/lib/*` imports, establish and enforce canonical paths.

**Why fifth:** State boundaries are enforced. Now enforce file organization.

**Requirements:**
- IMPORT-01: Define canonical import paths per architectural layer
- IMPORT-02: Migrate all `@/lib/*` imports to proper canonical locations (674 files)
- IMPORT-03: Add ESLint rule to block `@/lib/*` imports
- IMPORT-04: Create auto-fix script for bulk import migrations
- IMPORT-05: Add pre-commit hook for import path enforcement

**Success Criteria:**
1. Zero `@/lib/*` imports in codebase
2. ESLint blocks new `@/lib/*` imports
3. Pre-commit hook prevents violations
4. `pnpm governance:imports` returns 0 violations

**Plans:** TBD

---

### Phase 06: God Store Splitting

**Goal:** Split Zustand stores >300 LOC into focused slices (≤120 LOC each).

**Why sixth:** Import paths are clean. Now split the stores that violate state contracts.

**Requirements:**
- SPLIT-01: Split Zustand stores >300 LOC into focused slices
- SPLIT-03: Maintain 100% backward compatibility (facade exports)

**Target stores (from CONCERNS.md):**
- `PluginLayoutStore.ts` (692 lines) → 6 slices
- `slash-command-store.ts` (541 lines) → 5 slices
- `file-tree-store.ts` (536 lines) → 5 slices
- `saved-blocks-store.ts` (514 lines) → 5 slices
- `plugin-coordination-store.ts` (471 lines) → 4 slices

**Success Criteria:**
1. No store exceeds 300 LOC
2. Each slice ≤120 LOC, single responsibility
3. Facade exports maintain backward compatibility
4. All existing imports still work

**Plans:** TBD

---

### Phase 07: God Component Splitting

**Goal:** Split React components >400 LOC into composable units.

**Why seventh:** Stores are split. Now split components that consume them.

**Requirements:**
- SPLIT-02: Split React components >400 LOC into composable units
- SPLIT-03: Maintain 100% backward compatibility

**Target components (from CONCERNS.md):**
- `AISlashCommand.tsx` (1674 lines) → 8+ components
- `NoteEditor.tsx` (1353 lines) → 6+ components
- `MonacoEditor.tsx` (773 lines) → 4 components
- `resizable.tsx` (763 lines) → 3 components

**Success Criteria:**
1. No component exceeds 400 LOC
2. Extracted hooks in `src/presentation/hooks/`
3. Sub-components properly composed
4. No visual/behavioral regressions

**Plans:** TBD

---

### Phase 08: Plugin Coordination

**Goal:** Wire plugins together with proper coordination layer.

**Why eighth:** Stores and components are clean. Now fix plugin wiring.

**Requirements:**
- PLUGIN-01: Implement SharedActiveDocument state
- PLUGIN-02: Implement live sync between Monaco ↔ Notes
- PLUGIN-03: Wire Terminal → Preview dev server detection
- PLUGIN-04: Implement device capability fallbacks
- PLUGIN-05: Create plugin capability registry
- PLUGIN-06: Add plugin dependency declarations

**Success Criteria:**
1. FileTree selection opens in both Monaco AND Notes
2. Edits in Monaco appear in Notes in real-time
3. `npm run dev` in Terminal → Preview shows URL
4. Mobile/tablet shows graceful fallbacks
5. Plugins declare capabilities and dependencies

**Plans:** TBD

---

### Phase 09: Governance Automation

**Goal:** Automate enforcement of all architectural rules.

**Why ninth:** Rules exist, code is clean. Now prevent regression.

**Requirements:**
- STATE-06: Create ESLint rules for state layer violations
- STATE-07: Add runtime boundary violation warnings in dev mode
- SPLIT-04: Establish max LOC governance script
- SPLIT-05: Add CI check to prevent new god files

**Success Criteria:**
1. ESLint rules for Zustand/Dexie patterns
2. Dev mode console warnings on violations
3. `pnpm governance` in CI pipeline
4. PR blocked if new god files introduced

**Plans:** TBD

---

### Phase 10: Test Coverage Expansion

**Goal:** Achieve 50%+ test coverage for core modules.

**Why tenth:** Codebase is clean. Now ensure it stays clean with tests.

**Requirements:**
- TEST-02: Add unit tests for state stores
- TEST-03: Add unit tests for sync engine
- TEST-04: Achieve 50%+ test coverage
- TEST-05: Add E2E tests for plugin coordination

**Success Criteria:**
1. All god stores have >80% coverage
2. Sync engine (FSA ↔ Dexie) fully tested
3. Overall coverage >50%
4. Plugin coordination E2E tests pass

**Plans:** TBD

---

### Phase 11: Schema Versioning & Documentation

**Goal:** Enable safe Dexie migrations and document data flows.

**Why eleventh:** Schemas are stable. Now version them properly.

**Requirements:**
- SCHEMA-07: Implement Dexie schema versioning for safe migrations
- SCHEMA-08: Create data flow visualization diagram

**Success Criteria:**
1. Dexie migrations are versioned and reversible
2. Data flow diagram in architecture docs
3. Migration guide for schema changes
4. Zero data loss on version upgrades

**Plans:** TBD

---

### Phase 12: Agent Integration

**Goal:** Enable AI agent suggest mode with human approval.

**Why last:** Clean architecture is prerequisite for agent tooling.

**Requirements:**
- AGENT-01: Implement agent suggest mode (propose changes in diff view)
- AGENT-02: Create diff view component for agent suggestions
- AGENT-03: Implement human approval flow (accept/reject/edit)
- AGENT-04: Add tool permission system (allow/ask/deny)
- AGENT-05: Create agent action audit trail

**Success Criteria:**
1. Agent can propose file changes
2. Diff view shows proposed changes
3. Human can accept/reject/edit
4. Tool permissions are configurable
5. All agent actions logged

**Plans:** TBD

---

## Dependency Graph

```
Phase 01 (Contracts)
    ↓
Phase 02 (Schemas) ───→ Phase 03 (Tests)
    ↓                       ↓
Phase 04 (Enforcement) ←────┘
    ↓
Phase 05 (Imports)
    ↓
Phase 06 (Stores) ───→ Phase 07 (Components)
                            ↓
                       Phase 08 (Plugins)
                            ↓
                       Phase 09 (Governance)
                            ↓
                       Phase 10 (Tests)
                            ↓
                       Phase 11 (Versioning)
                            ↓
                       Phase 12 (Agents)
```

---

## Milestones

| Milestone | Phases | Health Score | Calendar |
|-----------|--------|--------------|----------|
| **M1: Contracts Defined** | 01-02 | 35% | Week 2 |
| **M2: Boundaries Enforced** | 03-05 | 55% | Week 5 |
| **M3: God Files Eliminated** | 06-07 | 70% | Week 8 |
| **M4: Plugins Wired** | 08-09 | 80% | Week 10 |
| **M5: Foundation Complete** | 10-12 | 85%+ | Week 12 |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Import migration breaks functionality | Medium | High | Run full test suite after each batch |
| Store splitting introduces bugs | Medium | High | Facade exports, incremental rollout |
| Plugin coordination has hidden dependencies | High | Medium | Map all event flows before changes |
| Test coverage slows velocity | Low | Medium | Focus on critical paths only |
| Agent integration scope creep | Medium | Low | Strict suggest-only mode |

---

*Roadmap created: 2026-01-31*
*Last updated: 2026-01-31*
