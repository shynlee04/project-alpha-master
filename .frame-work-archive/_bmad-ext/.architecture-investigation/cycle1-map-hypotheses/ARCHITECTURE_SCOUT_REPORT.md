# Architecture Scout Report: Bounded Context Mapping

**Generated**: 2026-01-18 | **Cycle**: 1 of N

## Executive Summary

The codebase exhibits significant architectural fragmentation with **8 bounded contexts**, **8 god-modules**, and **8 major duplication zones**. The most critical issue is the existence of **four separate sync implementations** causing maintenance nightmares.

---

## Bounded Contexts Identified

| Context | Entities | Primary Store | Status |
|---------|----------|---------------|--------|
| **notes** | Note, Block, Prompt | `infrastructure/persistence/stores/notes/` | ⚠️ Fragmented |
| **knowledge** | Source, Collection, RAGIndex | `infrastructure/persistence/stores/knowledge/` | ⚠️ Fragmented |
| **study** | Quiz, Flashcard, StudySession | `infrastructure/persistence/stores/study/` | ⚠️ Fragmented |
| **IDE** | File, EditorTab, TerminalSession | `infrastructure/persistence/stores/ide/` | ⚠️ Fragmented |
| **chat** | Conversation, Message, Thread | `infrastructure/persistence/stores/chat/` | ✅ Mostly Unified |
| **workspace** | Project, Workspace, Binding | `infrastructure/persistence/stores/workspace/` | ⚠️ Fragmented |
| **providers** | Provider, Model, Credentials | `infrastructure/persistence/stores/providers/` | ⚠️ Fragmented |
| **hub** | DashboardMetrics, Activity | `infrastructure/persistence/stores/hub-store.ts` | ✅ Unified |

---

## Critical Duplication Zones

### 🔴 CRITICAL: Sync Layer (4 Implementations!)

```
lib/sync/                    ← Legacy sync (event bus, reverse sync)
lib/filesync/                ← Legacy file sync services
lib/filesystem/sync-manager/ ← Legacy sync manager (500+ lines god module)
infrastructure/sync/         ← New sync implementation
```

**Impact**: Developers must maintain 4 separate sync codebases with overlapping functionality.

### 🔴 CRITICAL: File Sync Services (8 Files!)

```
lib/filesync/:
  - notes-file-sync-service.ts
  - ide-file-sync-service.ts
  - study-file-sync-service.ts
  - knowledge-file-sync-service.ts

infrastructure/sync/workspace-services/:
  - notes-file-sync-service.ts
  - ide-file-sync-service.ts
  - study-file-sync-service.ts
  - knowledge-file-sync-service.ts
```

**Impact**: Exact duplicates exist in both locations.

### 🟡 Entity Definitions (3 Duplicates)

```
core/entities/ vs domain/entities/:
  - Project.ts (duplicate)
  - Workspace.ts (duplicate)
  - Agent.ts (duplicate)
```

### 🟡 Provider Logic (3 Locations)

```
lib/agent/providers/          ← model-registry.ts, provider-adapter.ts
domain/services/              ← universal-provider-registry.ts, universal-adapter-factory.ts
application/services/         ← ProviderService.ts, AgentService.ts
```

---

## God-Modules Identified

| File | Lines | Issue |
|------|-------|-------|
| `lib/filesystem/sync-manager/sync-manager.ts` | ~500 | Handles planning, execution, rollback |
| `infrastructure/persistence/state-orchestrator.ts` | ~400 | Multiple store initializations |
| `infrastructure/persistence/stores/workspace-store-facade.ts` | ~300 | God facade |
| `infrastructure/tools/centralized-tool-registry.ts` | ~350 | Registry with too many concerns |
| `lib/agent/tool-permission-manager.ts` | ~300 | Multiple permission types |

---

## Cross-Context Coupling Matrix

```
           notes  knowledge  study  IDE  chat  workspace  providers  hub
notes         -       M        M     M     S        S          -        -
knowledge     M       -        S     -     -        S          -        -
study         -       S        -     -     -        -          -        -
IDE           M       -        -     -     S        S          -        -
chat          S       -        -     S     -        S          S        -
workspace     S       S        -     S     S        -          -        S
providers     -       -        -     -     S        -          -        -
hub           -       -        -     -     -        S          -        -

S = Strong coupling | M = Medium coupling
```

---

## Source of Truth Analysis

| Entity | Primary Store | Secondary Stores | Status |
|--------|---------------|------------------|--------|
| Project | `workspace-store.ts` | `lib/workspace/project-store.ts` | Fragmented |
| Workspace | `workspace-store.ts` | `lib/workspace/` | Fragmented |
| Note | `notes/note-store.ts` | `lib/notes/note-store.ts` | Fragmented |
| Source | `knowledge-store.ts` | `lib/knowledge/` | Fragmented |
| Conversation | `conversation-store.ts` | `lib/chat/` | Mostly Unified |
| Provider | `providers/` | `lib/agent/providers/` | Fragmented |

---

## Recommendations (Priority Order)

### Phase 1: Sync Consolidation (Highest Priority)
1. Audit `infrastructure/sync/` for completeness
2. Migrate all consumers from `lib/sync/`, `lib/filesync/`, `lib/filesystem/sync-manager/`
3. Delete legacy sync directories

### Phase 2: Entity Consolidation
1. Move `core/entities/` to `domain/entities/`
2. Delete duplicate entity files
3. Update all imports

### Phase 3: Store Consolidation
1. Migrate `lib/notes/` → `infrastructure/persistence/stores/notes/`
2. Migrate `lib/knowledge/` → `infrastructure/persistence/stores/knowledge/`
3. Migrate `lib/study/` → `infrastructure/persistence/stores/study/`
4. Migrate `lib/workspace/` → `infrastructure/persistence/stores/workspace/`

### Phase 4: Provider Logic Consolidation
1. Consolidate `lib/agent/providers/` → `domain/services/`
2. Keep only `application/services/` for business logic
3. Delete legacy provider code

### Phase 5: God-Module Refactoring
1. Split `sync-manager.ts` → `sync-planner.ts`, `sync-executor.ts`, `sync-rollback.ts`
2. Split `state-orchestrator.ts` → `hydration-manager.ts`, `initialization-manager.ts`
3. Split `workspace-store-facade.ts` → dedicated facades per concern

---

## Files Modified

| File | Action |
|------|--------|
| `_bmad-ext/.architecture-investigation/cycle1-map-hypotheses/bounded-contexts-map.json` | Created |
| `_bmad-ext/.architecture-investigation/cycle1-map-hypotheses/ARCHITECTURE_SCOUT_REPORT.md` | Created |

---

## Next Steps

**Cycle 2**: Deep-dive into each bounded context to:
- Map all state flows
- Identify circular dependencies
- Document API contracts between contexts
- Create refactoring sequence with dependencies