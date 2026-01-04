---
date: 2026-01-04
time: 08:45:00+07:00
phase: Phase 4 - Implementation (Mid-Sprint Course Correction)
team: Team A (Orchestrator)
agent_mode: bmad-core-bmad-master + bmad-bmm-architect
version: 1.0
status: PROPOSED
adr_id: ADR-024
title: State Management Consolidation - Clean Architecture Pattern
decision_date: 2026-01-04
supersedes: null
---

# ADR-024: State Management Consolidation - Clean Architecture Pattern

## Tracking Section

### Document Status
- **Status:** PROPOSED
- **Version:** 1.0
- **Last Updated:** 2026-01-04T08:45:00+07:00

### Phase Control
- **Current Phase:** Phase 4 - Implementation (Mid-Sprint Course Correction)
- **Triggered By:** ARC-DUP epic validation revealing duplicate state locations
- **Next Phase:** Implementation stories upon approval

### Agent/Mode Handoff Sequence
1. **Created by:** bmad-core-bmad-master (2026-01-04)
2. **Research by:** Context7 MCP + Exa MCP (Zustand best practices, Clean Architecture React)
3. **Next Handoff:** bmad-bmm-dev (upon Sprint Change Proposal approval)

### Change Log
- 2026-01-04: Initial ADR creation based on ARC-DUP validation findings

### References
- **Research Sources:**
  - Zustand Official Docs: https://zustand.docs.pmnd.rs/
  - Zustand GitHub: https://github.com/pmndrs/zustand
  - Clean Architecture (Uncle Bob): Domain separation patterns
  - React TypeScript Large-Scale Architecture: 2024-2025 best practices
- **Preceding Conversation:** "Validate ARC-DUP Agent Work" (75a1cf99-d82a-430c-9bdc-7214c8c77fc7)
- **Related Documents:**
  - `_bmad-output/project-planning-artifacts/architecture.md` (Section 4.2.1)
  - `src/lib/codetree-2026-01-04.md` (current lib/ structure)
  - `src/infrastructure/persistence/codetree-2026-01-04.md` (current infra structure)

---

## Decision Summary

**Title:** State Management Consolidation - Clean Architecture Pattern

**Decision:** Adopt **Option A (Clean Architecture with Centralized State)** as the standard architecture pattern for state management in Project Alpha.

**Classification:** MAJOR - Architectural refactor affecting ~50 files across two primary directories

---

## 1. Context and Problem Statement

### 1.1 Current State Analysis

The Via-Gent platform has evolved organically, resulting in **fragmented state management** across two primary locations:

#### Location 1: `src/lib/state/` (367 files - mostly files, tests, helpers)

```
src/lib/state/
├── dexie-db-helpers/        # 15 helper files (Dexie operations)
├── knowledge/               # 6 slice files + tests
│   ├── slices/              # Knowledge store slices
│   └── knowledge-store.ts   # DUPLICATE of infrastructure version
├── migrations/              # 2 migration files
├── dexie-db.ts              # DUPLICATE of infrastructure version
├── dexie-storage.ts         # Core Zustand-Dexie adapter
├── ide-store.ts             # IDE workspace store
├── quiz-store.ts            # Quiz session store
├── tool-permission-store.ts # Tool permissions
└── workspace-store.ts       # Workspace store
```

#### Location 2: `src/infrastructure/persistence/` (128 files - organized stores)

```
src/infrastructure/persistence/
├── stores/                  # 115 files - well-organized domain stores
│   ├── agents/              # Agent stores (9 files)
│   ├── conversation/        # Conversation stores (29 files)
│   ├── filesystem/          # FS snapshot stores (7 files)
│   ├── ide/                 # IDE stores (9 files)
│   ├── knowledge/           # Knowledge stores (8 files)
│   ├── project/             # Project stores (8 files)
│   ├── providers/           # Provider stores (11 files)
│   ├── rag/                 # RAG stores (9 files)
│   └── workspace/           # Workspace stores (3 files)
├── dexie-db.ts              # CANONICAL Dexie database
├── dexie-db-*.ts            # Type definitions (5 files)
├── dexie-db-migrations.ts   # Schema migrations
└── state-orchestrator.ts    # Cross-store coordination
```

### 1.2 Critical Problems Identified

| Problem ID | Issue | Impact | Files Affected |
|------------|-------|--------|----------------|
| **DUP-01** | Duplicate `dexie-db.ts` | Two database instances possible, data corruption risk | 2 files |
| **DUP-02** | Duplicate `knowledge-store.ts` | Different implementations, inconsistent behavior | 2 directories |
| **DUP-03** | Scattered dexie helpers | `lib/state/dexie-db-helpers/` vs infrastructure | 15 helper files |
| **ARCH-01** | lib/ contains stateful stores | Violates Clean Architecture (lib = pure utilities) | 5 store files |
| **ARCH-02** | No clear ownership | Developers unsure which location is canonical | All state files |
| **ARCH-03** | Import path inconsistency | `@/lib/state/` vs `@/infrastructure/persistence/stores/` | 200+ import statements |

### 1.3 Root Cause

The duplications emerged from:
1. **Initial Development:** `lib/state/` was created first as a quick solution
2. **Architecture Remediation (Epic 13):** `infrastructure/persistence/` was created following Clean Architecture
3. **Incomplete Migration:** Original files in `lib/state/` were not removed after migration
4. **Brownfield Accumulation:** New stores added to both locations without clear guidelines

---

## 2. Decision Drivers

### 2.1 Zustand Official Recommendations

From Zustand documentation and community best practices:

> **"Your application's global state should be located in a single Zustand store"**
> — Zustand Docs: Best Practices

> **"For complex apps, split the store into slices using the slice pattern... but keep them in one logical location"**
> — Zustand GitHub: Scaling Patterns

### 2.2 Via-Gent Workspace Architecture

The four Via-Gent workspaces (IDE, Notes, Knowledge, Study) **share state**:

| Store | IDE | Notes | Knowledge | Study |
|-------|-----|-------|-----------|-------|
| Agents Store | ✅ | ✅ | ✅ | ✅ |
| Conversation Store | ✅ | ✅ | ✅ | ✅ |
| Project Store | ✅ | ✅ | ✅ | ✅ |
| RAG Store | - | ✅ | ✅ | - |
| Knowledge Store | - | ✅ | ✅ | ✅ |

**Implication:** Workspaces are **views of shared state**, not isolated domains. This strongly favors centralized state (Option A) over domain-isolated state (Option B).

### 2.3 Clean Architecture Principles

| Layer | Contains | Does NOT Contain |
|-------|----------|------------------|
| `core/` | Entities, value objects | State management |
| `domain/` | Use cases, business logic | Persistence logic |
| `infrastructure/` | **All persistence (Zustand, Dexie)** | Business logic |
| `presentation/` | React components | Direct state mutations |
| `lib/` | **Pure utilities ONLY** | Stateful stores |

### 2.4 Performance Considerations

| Pattern | Subscriptions | Render Efficiency | Cross-Store Access |
|---------|---------------|-------------------|-------------------|
| **Single Store (Slices)** | 1 per slice | ⭐⭐⭐⭐⭐ Optimal | Direct (same store) |
| **Multiple Stores** | N stores | ⭐⭐⭐ Multiple subscriptions | Import + indirect |

---

## 3. Considered Options

### Option A: Clean Architecture (Centralized State) - **SELECTED**

```
src/
├── core/                    # Entities, pure business logic
├── domain/                  # Use cases, value objects
├── infrastructure/
│   └── persistence/
│       ├── stores/          # ALL Zustand stores (single source of truth)
│       │   ├── agents/
│       │   ├── conversation/
│       │   ├── filesystem/
│       │   ├── ide/
│       │   ├── knowledge/   # MERGED from lib/state/knowledge
│       │   ├── notes/       # NEW - moved from lib/notes
│       │   ├── rag/
│       │   ├── study/       # NEW - quiz-store moved here
│       │   ├── project/
│       │   └── workspace/
│       ├── dexie-db-helpers/ # MOVED from lib/state
│       ├── dexie-*.ts       # Database schema
│       └── state-orchestrator.ts
├── lib/                     # Pure utilities ONLY (NO STATE)
│   ├── agent/               # Agent logic only, no store
│   ├── rag/                 # RAG pipeline, no store
│   ├── knowledge/           # Knowledge logic, no store
│   └── filesystem/          # FS operations, no store
└── presentation/            # React components
```

**Pros:**
- ✅ Single source of truth for all state (Zustand-recommended)
- ✅ Clear layer boundaries - `lib/` is pure, `infrastructure/` has state
- ✅ Easier to reason about data flow
- ✅ Aligns with existing `infrastructure/persistence/stores/` pattern
- ✅ Performance optimal (single subscription point per slice)

**Cons:**
- ❌ Major refactoring - need to move ~50 files
- ❌ Domain logic separated from domain state - context switches
- ❌ Longer import paths for domain-specific state

### Option B: Domain-Driven Design (Co-located State) - **REJECTED**

```
src/
├── domains/                 # Domain modules
│   ├── knowledge/
│   │   ├── store/           # Knowledge store slices
│   │   ├── services/        # Knowledge services
│   │   └── index.ts
│   ├── notes/
│   │   ├── store/
│   │   └── services/
│   └── ...
├── infrastructure/
│   └── persistence/
│       └── stores/          # Cross-cutting stores ONLY
│           ├── agents/      # Used by all domains
│           └── conversation/ # Used by all domains
└── lib/                     # Shared utilities
```

**Pros:**
- ✅ High cohesion - domain logic + state together
- ✅ Easy onboarding - find everything in one place
- ✅ Micro-frontend ready

**Cons:**
- ❌ Multiple stores - harder to share state between domains
- ❌ **NOT Zustand-recommended** - docs prefer single store
- ❌ Cross-domain communication overhead
- ❌ Via-Gent workspaces share state (not isolated) - creates artificial boundaries

---

## 4. Decision Outcome

### 4.1 Selected Option: **Option A - Clean Architecture (Centralized State)**

**Rationale:**

1. **Zustand Best Practices:** Official documentation recommends single store with slices
2. **Via-Gent Architecture:** Workspaces share state (agents, conversations, projects) - centralized is natural fit
3. **Existing Infrastructure:** `infrastructure/persistence/stores/` already follows this pattern
4. **Performance:** Single subscription point per slice vs multiple store subscriptions
5. **Clarity:** `lib/` becomes pure utilities, easier to maintain

### 4.2 Consequences

#### Positive
- **Eliminated duplication:** Single canonical location for all state
- **Clear boundaries:** `lib/` = pure utilities, `infrastructure/` = state + persistence
- **Easier onboarding:** New developers know exactly where state lives
- **TypeScript benefits:** Better type inference with centralized store
- **Performance:** Optimal subscription patterns

#### Negative
- **Migration effort:** ~50 files need to move
- **Import updates:** 200+ import statements require updating
- **Temporary facades:** Need backwards-compatible re-exports during migration
- **Testing changes:** Some tests may need path updates

### 4.3 Migration Strategy

**Principle:** **Zero Breaking Changes** - Use facade pattern for backwards compatibility

#### Phase 1: Consolidate Dexie Layer (2-3 hours)
```bash
# Current duplicates:
# - src/lib/state/dexie-db.ts (REMOVE)
# - src/lib/state/dexie-db-helpers/ (MOVE)

# Target:
# - src/infrastructure/persistence/dexie-db.ts (CANONICAL)
# - src/infrastructure/persistence/dexie-db-helpers/ (MOVED)

# Facade for backwards compatibility:
# src/lib/state/dexie-db.ts → re-export from infrastructure
```

#### Phase 2: Consolidate Knowledge Store (3-4 hours)
```bash
# Current duplicates:
# - src/lib/state/knowledge/ (6 slices + tests)
# - src/infrastructure/persistence/stores/knowledge/ (8 files)

# Action: Merge both into infrastructure, create lib/state/knowledge/index.ts facade
```

#### Phase 3: Move Remaining lib/state Stores (2-3 hours)
```bash
# Stores to move:
# - ide-store.ts → merge with /stores/ide/
# - quiz-store.ts → create /stores/study/
# - tool-permission-store.ts → create /stores/permissions/
# - workspace-store.ts → merge with /stores/workspace/
```

#### Phase 4: Purify lib/ Directory (4-6 hours)
After completing Phases 1-3:
- Remove all stateful code from `lib/`
- Ensure `lib/` only contains pure utilities
- Update all import paths to use `@/infrastructure/persistence/stores/`

---

## 5. Target Architecture

### 5.1 Final Directory Structure

```
src/
├── core/                              # Pure domain entities
│   ├── entities/                      # Entity definitions
│   └── value-objects/                 # Value objects
│
├── domain/                            # Business logic (no state)
│   ├── agent/                         # Agent domain logic
│   ├── knowledge/                     # Knowledge domain logic
│   └── rag/                           # RAG domain logic
│
├── infrastructure/
│   ├── persistence/                   # ALL state management
│   │   ├── stores/                    # Zustand stores (sliced)
│   │   │   ├── agents/                # 9 files
│   │   │   ├── conversation/          # 29 files
│   │   │   ├── filesystem/            # 7 files
│   │   │   ├── ide/                   # 9 files (merged)
│   │   │   ├── knowledge/             # 14 files (merged)
│   │   │   ├── notes/                 # NEW
│   │   │   ├── project/               # 8 files
│   │   │   ├── providers/             # 11 files
│   │   │   ├── rag/                   # 9 files
│   │   │   ├── study/                 # NEW (quiz-store)
│   │   │   ├── workspace/             # 5 files (merged)
│   │   │   └── index.ts               # Central exports
│   │   ├── dexie-db-helpers/          # MOVED from lib/state
│   │   ├── dexie-db.ts                # CANONICAL database
│   │   ├── dexie-db-*.ts              # Type definitions
│   │   ├── dexie-storage.ts           # MOVED from lib/state
│   │   └── state-orchestrator.ts      # Cross-store coordination
│   └── events/                        # Event bus
│
├── lib/                               # PURE UTILITIES ONLY
│   ├── agent/                         # Agent utilities (no store)
│   │   ├── tools/                     # Tool definitions
│   │   ├── memory/                    # Memory utilities
│   │   └── providers/                 # Provider adapters
│   ├── knowledge/                     # Knowledge utilities (no store)
│   ├── rag/                           # RAG utilities (no store)
│   ├── filesystem/                    # FS utilities (no store)
│   ├── editor/                        # Editor utilities
│   ├── utils/                         # Common utilities
│   └── state/                         # FACADES ONLY (re-exports)
│       └── index.ts                   # Re-export from infrastructure
│
└── presentation/                      # React components
    ├── components/
    ├── pages/
    └── hooks/
```

### 5.2 Import Path Standards

**Canonical Imports (Use These):**
```typescript
// Stores
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useKnowledgeStore } from '@/infrastructure/persistence/stores/knowledge';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag';

// Database
import { getDb } from '@/infrastructure/persistence/dexie-db';
import { dbHelpers } from '@/infrastructure/persistence/dexie-db-helpers';

// Pure utilities
import { composeLayers } from '@/lib/agent';
import { chunkDocument } from '@/lib/rag';
```

**Legacy Imports (Deprecated - Use Facades):**
```typescript
// These will be facades that re-export from infrastructure
import { useIDEStore } from '@/lib/state/ide-store';  // DEPRECATED
// ↑ Facade: exports from @/infrastructure/persistence/stores/ide

import { getDb } from '@/lib/state/dexie-db';  // DEPRECATED
// ↑ Facade: exports from @/infrastructure/persistence/dexie-db
```

### 5.3 Zustand Store Pattern (Consolidated)

```typescript
// src/infrastructure/persistence/stores/index.ts
// Central export for all stores

export { useAgentsStore, useAgentSelectionStore } from './agents';
export { useConversationStore } from './conversation';
export { useFileSnapshotStore } from './filesystem';
export { useIDEStore } from './ide';
export { useKnowledgeStore } from './knowledge';
export { useProjectStore } from './project';
export { useProviderModelsStore } from './providers';
export { useRAGStore } from './rag';
export { useWorkspaceContext } from './workspace';
export { useStudyStore } from './study';
export { useToolPermissionStore } from './permissions';

// Type exports
export type { AgentConfig, AgentMode } from './agents/types';
export type { ConversationThread, Message } from './conversation/types';
export type { IDEState } from './ide/ide-types';
// ... etc
```

---

## 6. Implementation Validation

### 6.1 Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| **Zero Duplicates** | No duplicate store files across lib/ and infrastructure/ | 0 duplicates |
| **All Tests Pass** | TypeScript compile + existing tests | 100% pass |
| **No Breaking Changes** | All current imports work (via facades) | 0 breaks |
| **Performance Neutral** | No regression in state update latency | ≤ current |
| **Clear Ownership** | Every store has unambiguous canonical location | 100% |

### 6.2 Validation Commands

```bash
# TypeScript validation
pnpm exec tsc --noEmit

# Find any remaining duplicates
rg "from '@/lib/state" src/ --files-with-matches | wc -l
# Should be 0 after migration complete, or only facades

# Test suite
pnpm test

# Bundle size check (ensure no regression)
pnpm build && ls -la .output/client/
```

---

## 7. Links and References

### 7.1 Related ADRs
- **ADR-015:** Zustand + Dexie Unified Store Pattern (precursor)
- **ADR-018:** 5-Layer Agent System Architecture

### 7.2 Research References
- **Zustand Docs - Best Practices:** https://zustand.docs.pmnd.rs/guides/best-practices
- **Zustand GitHub - Scaling:** https://github.com/pmndrs/zustand/blob/main/docs/guides/scaling.md
- **Clean Architecture (Uncle Bob):** Domain separation principles
- **React TypeScript Architecture 2024:** Layer separation patterns

### 7.3 Implementation Artifacts
- **Sprint Change Proposal:** `_bmad-output/project-planning-artifacts/sprint-change-proposal-state-consolidation-2026-01-04.md`
- **Epic Definition:** To be created in epics document
- **Story Backlog:** To be created per sprint planning workflow

---

## 8. Decision Record

| Attribute | Value |
|-----------|-------|
| **ADR ID** | ADR-024 |
| **Title** | State Management Consolidation - Clean Architecture Pattern |
| **Status** | PROPOSED |
| **Context** | Duplicate state locations causing confusion and maintenance burden |
| **Decision** | Option A - Clean Architecture with Centralized State |
| **Consequences** | ~50 files to move, 200+ imports to update, facades for compatibility |
| **Alternative Rejected** | Option B - DDD with co-located state (not Zustand-recommended) |
| **Decision Date** | 2026-01-04 |
| **Deciders** | Admin (User), BMAD Master (Orchestrator) |
| **Reviewed By** | Pending Sprint Change Proposal approval |

---

## Appendix A: File Inventory for Migration

### A.1 Files to Move from lib/state/ to infrastructure/persistence/

| Current Location | Target Location | Action |
|------------------|-----------------|--------|
| `lib/state/dexie-db.ts` | `infrastructure/persistence/` | DELETE (duplicate) |
| `lib/state/dexie-storage.ts` | `infrastructure/persistence/` | MOVE |
| `lib/state/dexie-db-helpers/` | `infrastructure/persistence/dexie-db-helpers/` | MOVE |
| `lib/state/knowledge/` | `infrastructure/persistence/stores/knowledge/` | MERGE |
| `lib/state/ide-store.ts` | `infrastructure/persistence/stores/ide/` | MERGE |
| `lib/state/quiz-store.ts` | `infrastructure/persistence/stores/study/` | MOVE + RENAME |
| `lib/state/tool-permission-store.ts` | `infrastructure/persistence/stores/permissions/` | MOVE |
| `lib/state/workspace-store.ts` | `infrastructure/persistence/stores/workspace/` | MERGE |

### A.2 Facades to Create in lib/state/

```typescript
// src/lib/state/index.ts - Re-export facade for backwards compatibility
export { getDb, getDatabaseVersion } from '@/infrastructure/persistence/dexie-db';
export { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
export { useIDEStore } from '@/infrastructure/persistence/stores/ide';
export { useKnowledgeStore } from '@/infrastructure/persistence/stores/knowledge';
// ... etc

// Console warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] Importing from @/lib/state is deprecated. ' +
    'Use @/infrastructure/persistence/stores instead.'
  );
}
```

---

**Document End**

*Generated by BMAD Master v2.0 - Autonomous Orchestrator*
*Workflow: correct-course (Step 3: Draft Specific Change Proposals)*
*Timestamp: 2026-01-04T08:45:00+07:00*
