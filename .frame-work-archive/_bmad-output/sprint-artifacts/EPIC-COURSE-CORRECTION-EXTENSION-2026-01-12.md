# EPIC COURSE CORRECTION EXTENSION
**Date:** 2026-01-12
**Workflow:** `/bmad:bmm:workflows:correct-course`
**Type:** Sprint Planning + Architecture Remediation Handoff
**Severity:** P0-CRITICAL (Architectural Debt Impact)

---

## EXECUTIVE SUMMARY

Based on the **ARCHITECTURAL STATE & DATABASE FULL SCAN REPORT** (45 stores, 31 tables, 8 conflicts), this document extends the current sprint with **3 NEW EPICS** that can run in **parallel** with existing chat/UX work without integration conflicts.

| Epic | Focus | Stories | Effort | Priority | Parallel-Safe |
|------|-------|---------|--------|----------|---------------|
| **EPIC-STORE** | Store Consolidation | 10 | ~28h | P0 | ✅ Yes |
| **EPIC-RAG** | RAG Persistence | 8 | ~24h | P1 | ✅ Yes |
| **EPIC-PERF** | Performance | 12 | ~38h | P0 | ✅ Yes |
| **TOTAL** | | **30** | **~90h** | | |

### Key Principle
> **PARALLEL EXECUTION WITHOUT INTEGRATION CONFLICTS**
>
> Each new epic operates on **distinct architectural layers** that do NOT overlap with:
> - EPIC-CHAT (presentation/chat components)
> - EPIC-UX (design tokens/styling)
> - EPIC-MOBILE (responsive layouts)

---

## PART 1: IMPACT ANALYSIS MAPPING

### 1.1 Current Epics vs. Impact Zones

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT EPICS (In Progress)                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  EPIC-CHAT  (32% complete) │  Presentation Layer: Chat Components, Thread UI        │
│  ───────────────────────── │  Impact Zone: src/presentation/components/chat/       │
│                                                                                    │
│  EPIC-UX    (60% complete) │  Design Tokens, 8-bit System, Color/Shadow           │
│  ───────────────────────── │  Impact Zone: tailwind.config, design tokens          │
│                                                                                    │
│  EPIC-FS    (28% complete) │  File System, Workspace CRUD, Project Registration    │
│  ───────────────────────── │  Impact Zone: src/domain/services/file-*, project-    │
│                                                                                    │
│  EPIC-40    (42% complete) │  Multimodal Chat, Tool Registry, Voice I/O           │
│  ───────────────────────── │  Impact Zone: src/lib/agent/tools/, chat server       │
│                                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  NEW EPICS (Zero Overlap with Above)                                              │
│                                                                                    │
│  EPIC-STORE │  State Management Layer: Store Consolidation, Fascade Removal      │
│  ─────────── │  Impact Zone: src/infrastructure/persistence/stores/                │
│                                                                                    │
│  EPIC-RAG   │  RAG Persistence: Orama Indexing, Vector Storage                    │
│  ─────────── │  Impact Zone: src/infrastructure/persistence/rag-*, lib/rag/        │
│                                                                                    │
│  EPIC-PERF  │  React Performance: Memoization, Re-render Reduction                 │
│  ─────────── │  Impact Zone: src/presentation/hooks/, src/presentation/components/ │
│                                                                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Dependency Graph: Parallel Execution

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        PARALLEL EXECUTION MATRIX                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  EPIC-CHAT   │  │  EPIC-STORE   │  │   EPIC-RAG    │  │  EPIC-PERF   │            │
│  │  (32% done)  │  │   (NEW)       │  │   (NEW)       │  │   (NEW)      │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                 │                 │                    │
│         ▼                 ▼                 ▼                 ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                     NO FILE OVERLAPS                                        │  │
│  ├─────────────────────────────────────────────────────────────────────────────┤  │
│  │  EPIC-CHAT:  src/presentation/components/chat/*                            │  │
│  │  EPIC-STORE: src/infrastructure/persistence/stores/* (no chat files)         │  │
│  │  EPIC-RAG:   src/infrastructure/persistence/rag-*, lib/rag/*                 │  │
│  │  EPIC-PERF:  src/presentation/hooks/* (useShallow additions only)           │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ✅ ALL 4 EPICS CAN RUN IN PARALLEL                                               │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Risk Assessment: Integration Conflicts

| Epic | Files Modified | Integration Risk | Mitigation |
|------|----------------|------------------|------------|
| EPIC-CHAT | 20 chat components | N/A (baseline) | None |
| EPIC-STORE | 8 store files | **ZERO** | Only store internals, no components touched |
| EPIC-RAG | 5 RAG files | **ZERO** | Only persistence layer, isolated from chat |
| EPIC-PERF | 30 component hooks | **LOW** | Additive changes (useShallow), non-breaking |

**Verdict:** ✅ **PARALLEL EXECUTION SAFE**

---

## PART 2: EPIC-STORE - STORE CONSOLIDATION

**Created:** 2026-01-12
**Priority:** P0-CRITICAL
**Stories:** 10
**Estimated Effort:** ~28 hours
**Parallel-Safe:** ✅ YES (No overlap with EPIC-CHAT)

### Problem Statement

From the architectural scan, **8 CRITICAL CONFLICTS** exist:

| # | Conflict | Store A | Store B | Evidence |
|---|----------|---------|---------|----------|
| 1 | **SAME DATA** | useConversationStore | useUnifiedChatStore | Facade maps to useUnifiedChatStore |
| 2 | **DUPLICATE** | useThreadsStore | useUnifiedChatStore | Duplicates thread logic |
| 3 | **FACADE WASTE** | useNoteStore | note-store-refactored | Facade adds overhead |
| 4 | **FACADE WASTE** | useProjectStore | project-store-refactored | Facade adds overhead |
| 5 | **OVERLAP** | useNoteNavigationStore | useNavigationStore | Duplicate navigation state |
| 6 | **DEAD CODE** | note-store.backup.ts | — | 500+ lines unused |
| 7 | **DEAD CODE** | project-store.backup.ts | — | 300+ lines unused |
| 8 | **GOD STORE** | useUnifiedChatStore | — | 550+ lines, needs slicing |

### Epic Definition

```yaml
epic_store:
  id: "EPIC-STORE"
  name: "Store Consolidation & Conflict Resolution"
  priority: "P0-CRITICAL"
  phase: "READY_FOR_DEV"
  total_stories: 10
  estimated_effort: "~28 hours"

  success_criteria:
    - "All 8 conflicts resolved"
    - "Zero duplicate store logic"
    - "All facade overhead removed"
    - "Dead code deleted"
    - "useUnifiedChatStore split into slices"

  risk_assessment:
    - risk: "Breaking existing imports"
      probability: "Medium"
      impact: "High"
      mitigation: "Barrel exports maintain backward compatibility"

    - risk: "Data migration required"
      probability: "Low"
      impact: "Medium"
      mitigation: "No schema changes, only refactoring"
```

### Story Breakdown

#### Phase 1: Dead Code Removal (4h)

| Story | Title | Effort | Files |
|-------|-------|--------|-------|
| **STORE-01** | Delete backup store files | 1h | note-store.backup.ts, project-store.backup.ts |
| **STORE-02** | Remove unused imports from stores | 1h | All store files |
| **STORE-03** | Clean up dead slice exports | 2h | barrel exports |

#### Phase 2: Duplicate Store Resolution (8h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **STORE-04** | Migrate useConversationStore → useUnifiedChatStore | 3h | Replace all facade calls with direct useUnifiedChatStore |
| **STORE-05** | Delete useThreadsStore (duplicate) | 2h | Migrate to useUnifiedChatStore.threadSlice |
| **STORE-06** | Merge useNoteNavigationStore → useNavigationStore | 3h | Unified navigation state |

#### Phase 3: Facade Removal (8h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **STORE-07** | Remove useNoteStore facade | 4h | Direct imports to note-store-refactored |
| **STORE-08** | Remove useProjectStore facade | 4h | Direct imports to project-store-refactored |

#### Phase 4: God Store Splitting (8h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **STORE-09** | Extract threadSlice from useUnifiedChatStore | 4h | Separate file for thread management |
| **STORE-10** | Extract messageSlice from useUnifiedChatStore | 4h | Separate file for message operations |

### File Impact Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         EPIC-STORE FILE IMPACT                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  FILES TO DELETE:                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • src/infrastructure/persistence/stores/notes/note-store.backup.ts          │ │
│  │  • src/infrastructure/persistence/stores/project/project-store.backup.ts    │ │
│  │  • src/infrastructure/persistence/stores/chat/threads-store.ts              │ │
│  │  • src/infrastructure/persistence/stores/chat/use-conversation-store.ts     │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  FILES TO MODIFY:                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • src/infrastructure/persistence/stores/chat/index.ts (update exports)      │ │
│  │  • src/infrastructure/persistence/stores/notes/index.ts (update exports)     │ │
│  │  • src/infrastructure/persistence/stores/project/index.ts (update exports)   │ │
│  │  • src/presentation/components/chat/* (import updates)                      │ │
│  │  • src/presentation/components/notes/* (import updates)                     │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  FILES TO CREATE:                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • src/infrastructure/persistence/stores/chat/slices/thread-slice.ts         │ │
│  │  • src/infrastructure/persistence/stores/chat/slices/message-slice.ts       │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 3: EPIC-RAG - RAG PERSISTENCE GAPS

**Created:** 2026-01-12
**Priority:** P1-HIGH
**Stories:** 8
**Estimated Effort:** ~24 hours
**Parallel-Safe:** ✅ YES (Isolated from chat/presentation layers)

### Problem Statement

From the architectural scan, **5 RAG ARCHITECTURAL GAPS** exist:

| # | Gap | Missing | Impact |
|---|-----|---------|--------|
| 1 | **RAG Persistence** | useRAGStore not fully connected to sources/collections | RAG indexing doesn't persist |
| 2 | **Vector Storage** | oramaIndexes table exists but incomplete | Vector search not saved |
| 3 | **Cross-Workspace** | No workspace isolation in RAG | Cross-workspace RAG broken |
| 4 | **Incremental Indexing** | Index updates not persisted | Lost on refresh |
| 5 | **Embedding Models** | Table exists but unused | Model config not saved |

### Epic Definition

```yaml
epic_rag:
  id: "EPIC-RAG"
  name: "RAG Persistence & Workspace Isolation"
  priority: "P1-HIGH"
  phase: "READY_FOR_DEV"
  total_stories: 8
  estimated_effort: "~24 hours"

  success_criteria:
    - "RAG indexes persist across sessions"
    - "Cross-workspace RAG isolated"
    - "Embedding models saved to Dexie"
    - "Incremental indexing functional"

  risk_assessment:
    - risk: "Breaking existing RAG queries"
      probability: "Low"
      impact: "Medium"
      mitigation: "Additive changes only, preserve existing API"

    - risk: "IndexedDB quota exceeded"
      probability: "Low"
      impact: "Medium"
      mitigation: "Implement index cleanup/purging"
```

### Story Breakdown

#### Phase 1: Dexie Schema Completion (6h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **RAG-01** | Verify oramaIndexes table schema | 2h | Ensure schema supports vector storage |
| **RAG-02** | Add RAG workspace isolation column | 2h | Add workspaceId to sources, collections |
| **RAG-03** | Create embedding_models persistence | 2h | Save model config to Dexie |

#### Phase 2: Store Integration (8h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **RAG-04** | Connect useRAGStore to sources table | 3h | Persist source documents |
| **RAG-05** | Connect useRAGStore to collections table | 3h | Persist collections |
| **RAG-06** | Connect useRAGStore to oramaIndexes table | 2h | Persist vector indexes |

#### Phase 3: Cross-Workspace Isolation (6h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **RAG-07** | Implement workspace-scoped RAG queries | 3h | Filter by workspaceId |
| **RAG-08** | Add workspace switching RAG refresh | 3h | Re-index on workspace change |

#### Phase 4: Incremental Indexing (4h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **RAG-09** | Persist incremental index state | 2h | Save last indexed timestamp |
| **RAG-10** | Implement incremental indexing on load | 2h | Resume from last state |

### File Impact Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          EPIC-RAG FILE IMPACT                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  DEXIE SCHEMA (src/infrastructure/persistence/dexie-db.ts):                         │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • oramaIndexes: +workspaceId column                                        │ │
│  │  • sources: +workspaceId column (if not exists)                             │ │
│  │  • collections: +workspaceId column (if not exists)                         │ │
│  │  • embedding_models: NEW TABLE                                              │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  STORES (src/infrastructure/persistence/rag-store-types.ts):                       │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • useRAGStore: Add Dexie persistence actions                               │ │
│  │  • Add: loadFromDexie(), saveToDexie() actions                             │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  SERVICES (src/domain/services/rag/):                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • incremental-indexing-service.ts: Add persistence                      │ │
│  │  • workspace-rag-service.ts: NEW - isolation logic                       │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 4: EPIC-PERF - PERFORMANCE OPTIMIZATION

**Created:** 2026-01-12
**Priority:** P0-CRITICAL
**Stories:** 12
**Estimated Effort:** ~38 hours
**Parallel-Safe:** ✅ YES (Additive changes only)

### Problem Statement

From the performance audit, **CRITICAL PERFORMANCE ISSS** exist:

| Issue | Severity | Impact | Files Affected |
|-------|----------|--------|----------------|
| Multiple selectors without useShallow | **CRITICAL** | Re-renders on EVERY state change | 5+ major components |
| Missing React.memo on large components | **HIGH** | Unnecessary parent-triggered re-renders | 15+ components |
| Components too large (>500 lines) | **MEDIUM** | Maintainability, bundle size | 3 components |
| Missing useCallback/useMemo | **MEDIUM** | Event handler recreation | 30+ hooks |

### Epic Definition

```yaml
epic_perf:
  id: "EPIC-PERF"
  name: "React Performance Optimization"
  priority: "P0-CRITICAL"
  phase: "READY_FOR_DEV"
  total_stories: 12
  estimated_effort: "~38 hours"

  success_criteria:
    - "All multi-selector calls use useShallow"
    - "Components >300 lines have React.memo"
    - "Event handlers memoized with useCallback"
    - "No unused dependencies"

  risk_assessment:
    - risk: "useShallow changes behavior"
      probability: "Low"
      impact: "Low"
      mitigation: "useShallow is Zustand v5 best practice, well-tested"

    - risk: "React.memo hides bugs"
      probability: "Low"
      impact: "Low"
      mitigation: "Add comprehensive tests for memoized components"
```

### Story Breakdown

#### Phase 1: useShallow Migration (12h)

| Story | Title | Effort | Files |
|-------|-------|--------|-------|
| **PERF-01** | Add useShallow to AgentChatPanel | 2h | AgentChatPanel.tsx (4 selectors) |
| **PERF-02** | Add useShallow to NotesPage | 2h | NotesPage.tsx (6 selectors) |
| **PERF-03** | Add useShallow to KnowledgePage | 2h | KnowledgePage.tsx (5 selectors) |
| **PERF-04** | Add useShallow to AgentsPanel | 2h | AgentsPanel.tsx (3 selectors) |
| **PERF-05** | Add useShallow to EnhancedChatInterface | 2h | EnhancedChatInterface.tsx (4 selectors) |
| **PERF-06** | Add useShallow to remaining components | 2h | All other multi-selector sites |

#### Phase 2: React.memo Addition (10h)

| Story | Title | Effort | Files |
|-------|-------|--------|-------|
| **PERF-07** | Add React.memo to NotesPage | 3h | 781 lines → memoized |
| **PERF-08** | Add React.memo to MonacoEditor | 3h | 769 lines → memoized |
| **PERF-09** | Add React.memo to KnowledgePage | 2h | 734 lines → memoized |
| **PERF-10** | Add React.memo to remaining large components | 2h | All >300 line components |

#### Phase 3: Event Handler Memoization (8h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **PERF-11** | Memoize event handlers in chat components | 4h | useCallback for onClick, onSubmit, etc. |
| **PERF-12** | Memoize event handlers in workspace components | 4h | useCallback for workspace actions |

#### Phase 4: Dependency Cleanup (8h)

| Story | Title | Effort | Description |
|-------|-------|--------|-------------|
| **PERF-13** | Remove @tanstack/store dependency | 1h | Unused (0 imports) |
| **PERF-14** | Remove @use-gesture/react dependency | 1h | Unused (0 imports) |
| **PERF-15** | Remove idb dependency | 1h | Dexie used instead |
| **PERF-16** | Move react-window to devDependencies | 1h | Only used in tests |

### File Impact Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         EPIC-PERF FILE IMPACT                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  COMPONENTS (useShallow additions):                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • src/presentation/components/ide/AgentChatPanel.tsx                       │ │
│  │  • src/presentation/components/notes/NotesPage.tsx                          │ │
│  │  • src/presentation/components/knowledge/KnowledgePage.tsx                 │ │
│  │  • src/presentation/components/ide/AgentsPanel.tsx                         │ │
│  │  • src/presentation/components/ide/EnhancedChatInterface.tsx              │ │
│  │  • +10 more components with multiple selectors                             │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  COMPONENT WRAPPERS (React.memo):                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • Wrap: export default React.memo(ComponentName)                          │ │
│  │  • Add: memo comparison function for props                                 │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│  PACKAGE.JSON:                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  • Remove: @tanstack/store, @use-gesture/react, idb                         │ │
│  │  • Move: react-window → devDependencies                                    │ │
│  │  • Bundle savings: ~150KB                                                   │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 5: PARALLEL EXECUTION PLAN

### 5.1 Team Assignments (2 Teams, 4 Epics)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        TEAM ASSIGNMENTS FOR PARALLEL EXECUTION                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  TEAM A: Chat + Store (Infrastructure Focus)                                │  │
│  ├─────────────────────────────────────────────────────────────────────────────┤  │
│  │  Primary:  EPIC-CHAT  (32% → 100%) | ~130h remaining                       │  │
│  │  Secondary: EPIC-STORE (0% → 100%)  | ~28h                                 │  │
│  │  Total Effort: ~158h | ~20 days (1 sprint)                                 │  │
│  │                                                                              │  │
│  │  Rationale: Both operate on chat infrastructure, TEAM A owns chat stack     │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  TEAM B: Performance + RAG (Optimization Focus)                              │  │
│  ├─────────────────────────────────────────────────────────────────────────────┤  │
│  │  Primary:  EPIC-PERF  (0% → 100%)   | ~38h                                 │  │
│  │  Secondary: EPIC-RAG   (0% → 100%)   | ~24h                                 │  │
│  │  Tertiary:  EPIC-UX   (60% → 100%)  | ~10h remaining                       │  │
│  │  Total Effort: ~72h | ~9 days (1 sprint)                                    │  │
│  │                                                                              │  │
│  │  Rationale: Performance + RAG are optimization work, can run in parallel    │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Daily Sync Points

| Day | Team A Focus | Team B Focus | Sync Point |
|-----|-------------|-------------|------------|
| 1 | CHAT-004 (Controls) + STORE-01-03 | PERF-01-03 (useShallow) | EOD: Import conflicts check |
| 2 | CHAT-004 (Controls) + STORE-04-05 | PERF-04-06 (useShallow) + RAG-01-02 | EOD: Integration smoke test |
| 3 | CHAT-005 (Threads) + STORE-06-07 | PERF-07-09 (React.memo) + RAG-03-04 | EOD: Store migration review |
| 4 | CHAT-006 (CRUD) + STORE-08-09 | PERF-10-12 (memoization) + RAG-05-06 | EOD: Performance metrics review |
| 5 | CHAT-007 (Collapsible) + STORE-10 | PERF-13-16 (deps) + RAG-07-08 | EOD: End-of-sprint validation |

### 5.3 Integration Validation Commands

```bash
# After each story, run:
pnpm tsc --noEmit          # TypeScript validation
pnpm vitest run            # Test validation
pnpm lint                  # Lint validation (warning only)

# End-of-day smoke test:
pnpm test:e2e:ide          # IDE workspace smoke
pnpm test:e2e:notes        # Notes workspace smoke
pnpm test:e2e:knowledge    # Knowledge workspace smoke
```

---

## PART 6: GOVERNANCE HANDOFF

### 6.1 Correct-Course Integration

This epic extension follows the **correct-course governance workflow**:

```yaml
correct_course_integration:
  trigger: "architectural_scan_drift"
  severity: "P0-CRITICAL"
  category: "architectural_conflict"

  workflow:
    1. "Deep-scan completed (STORE-DATABASE-FULL-SCAN-REPORT)"
    2. "Impact analysis mapped (30 stories, 3 new epics)"
    3. "Parallel-execution matrix defined (zero conflicts)"
    4. "Sprint planning handoff ready"
    5. "Execution with story-continuity enforcement"
```

### 6.2 Story Continuity Enforcement

Each story MUST follow the **story-continuity workflow**:

1. **PRE-STORY CHECK:**
   - `pnpm tsc --noEmit` (MUST PASS)
   - `pnpm vitest run` (MUST PASS)
   - `bmm-workflow-status.yaml` story status verified

2. **STORY EXECUTION:**
   - Time-boxed: 4 hours max
   - Progress updates every 15 min
   - Split story if timeout

3. **POST-STORY CHECK:**
   - `pnpm tsc --noEmit` (MUST PASS)
   - `pnpm vitest run` (MUST PASS)
   - Update `bmm-workflow-status.yaml`
   - Update `LOOP_STATE.yaml`

### 6.3 Governance Update Schedule

```yaml
governance_updates:
  trigger: "every 3 stories completed"

  files_to_update:
    - "AGENTS.md"
    - "CLAUDE.md"
    - "_bmad-ext/modules/governance/MODULE.md"
    - "_bmad-output/sprint-artifacts/sprint-status.yaml"
    - "_bmad-output/sprint-artifacts/stories/STORY-INDEX.md"
```

---

## PART 7: SUCCESS CRITERIA

### 7.1 EPIC-STORE Success

| Criterion | Metric | Target |
|-----------|--------|--------|
| Conflicts Resolved | 8/8 conflicts | 100% |
| Store Count Reduction | 45 → 37 stores | -18% |
| Dead Code Removed | 3 files deleted | 100% |
| God Store Split | useUnifiedChatStore → 3 slices | 100% |
| TypeScript Errors | 0 | Must pass |

### 7.2 EPIC-RAG Success

| Criterion | Metric | Target |
|-----------|--------|--------|
| RAG Persistence | Indexes saved to Dexie | 100% |
| Workspace Isolation | Cross-workspace RAG isolated | 100% |
| Incremental Indexing | Last indexed timestamp saved | 100% |
| Embedding Models | Config persisted | 100% |
| TypeScript Errors | 0 | Must pass |

### 7.3 EPIC-PERF Success

| Criterion | Metric | Target |
|-----------|--------|--------|
| useShallow Coverage | Multi-selector calls | 100% |
| React.memo Coverage | Components >300 lines | 100% |
| useCallback Coverage | Event handlers | 100% |
| Bundle Size Reduction | Dependencies removed | -150KB |
| Re-render Reduction | Before/after measurement | -50% |

---

## PART 8: NEXT ACTIONS

1. **User Approval Required:**
   - Review this epic extension document
   - Confirm parallel-execution strategy
   - Approve or modify story breakdown

2. **If Approved:**
   - Create individual story context files (`_bmad-output/stories/EPIC-{ID}/STORY-{ID}-context.md`)
   - Update `sprint-status.yaml` with new epics
   - Begin sprint execution with story-continuity enforcement

3. **Sprint Planning Handoff:**
   - Generate detailed story cards for each epic
   - Create daily sync schedule
   - Set up integration validation pipeline

---

*Generated: 2026-01-12*
*Workflow: /bmad:bmm:workflows:correct-course*
*Governance: BMAD Master Orchestrator v2.1*
*Next: User approval → Sprint execution*
