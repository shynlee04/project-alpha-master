# ADR Audit Report - Comprehensive Analysis and Consolidation Plan

**Date**: 2026-01-26
**Auditor**: analyst-ext (BMAD Framework)
**Scope**: All ADR documents in `_bmad-output/planning-artifacts/`
**Reference Document**: `new-fundamental-truths.md` (v2.0.0)

---

## 📊 Executive Summary

**Total ADRs Analyzed**: 17 documents
**ADR Locations**: 2 directories (`adr/` and `architecture/adr/`)
**Status Breakdown**:
- ✅ **Active/Approved**: 4
- 🔴 **Superseded**: 3
- 📋 **Proposed**: 8
- 📊 **Analysis/Supporting**: 2

**Key Finding**: ADR cascade pattern identified - 3 consecutive ADRs (033 → 034 → 035) attempting to remediate each other. New fundamentals (v2.0.0) supersede this cascade.

**Critical Recommendations**:
1. Create **ADR-035** to replace ADR-033-034-035 cascade with unified guidance
2. Consolidate **duplicate ADRs** (multiple ADR-036/037)
3. Archive **PROPOSED ADRs >30 days old** (7 documents stale)
4. Create **missing ADRs** for new fundamentals not covered

---

## 📋 Part 1: ADR Inventory Table

### 1.1 ADRs from `/adr/` Directory (Newer)

| ID | Title | Date | Status | Alignment w/ v2.0 | Lines | Key Topics |
|-----|-------|--------|-------------------|-------|-------------|
| **ADR-033** | Correct-Course Architectural Remediation | 2026-01-16 | 🔴 SUPERSEDED | 450 | Platform detection, FSA handle persistence, project structure, Dexie schema |
| **ADR-034** | Project-Centric Architecture with Feature Plugins | 2026-01-20 | ✅ PARTIAL (30%) | 287 | Plugin system, unified routing, device architecture, platform defaults |
| **ADR-034-AMENDMENT-001** | Platform-First Plugin Selection | 2026-01-21 | ✅ FULL | 407 | Platform-aware defaults, eliminate `?layout=` query params |
| **ADR-035** | Correct-Course v2 - Architecture Standardization | 2026-01-14 | 🔴 SUPERSEDED | 406 | Entity model, storage layers, P0 bug fixes, route flow standards |
| **ADR-036** | Platform Contract Consolidation (ID collision) | 2026-01-18 | 🔄 RENAMED | 20 | Platform contract interface, device type naming |
| **ADR-037** | Platform Contract Interface Consolidation | 2026-01-18 | ⚠️ PROPOSED | 191 | Duplicate interface resolution, 19 import locations |
| **ADR-038** | Event Listener Error Isolation | 2026-01-18 | ⚠️ PROPOSED | 456 | Event bus error handling, try-catch wrapping, listener error isolation |
| **ADR-037-xss** | XSS Sanitization Strategy | 2026-01-18 | ⚠️ PROPOSED | 283 | DOMPurify, 7 vulnerable locations, iframe/doc.write safety |
| **ADR-cascade-analysis** | Critical Findings (Cascade Pattern) | 2026-01-21 | ✅ ANALYSIS | 313 | ADR-033/034/035 cascade, coverage gaps, remediation analysis |
| **ADR-036** | Foundation Cleanup & Infrastructure Consolidation | 2026-01-15 | ⚠️ PROPOSED | 42 | Slash command migration, thread persistence, chat store refactor |
| **ADR-034-notes-routing** | Notes Routing Persistence Crisis | 2026-01-19 | ⚠️ PROPOSED | TBD | Notes routing, persistence layer, routing issues |

### 1.2 ADRs from `/architecture/adr/` Directory (Foundational)

| ID | Title | Date | Status | Alignment w/ v2.0 | Lines | Key Topics |
|-----|-------|--------|-------------------|-------|-------------|
| **ADR-001** | Zustand State Management with v5 Patterns | 2026-01-07 | ⚠️ PROPOSED | 120 | StateCreator pattern, slice limits (120 lines), useShallow, god store prevention |
| **ADR-002** | Single Source of Truth for State | 2026-01-07 | ⚠️ PROPOSED | 94 | Infrastructure location, facade pattern, state management consolidation |
| **ADR-003** | Clean Architecture Layer Separation | 2026-01-07 | ⚠️ PROPOSED | 123 | 4-layer architecture, dependency flow, forbidden patterns |
| **ADR-004** | God Component and Store Decomposition | 2026-01-07 | ⚠️ PROPOSED | 169 | Size limits (300/120 lines), decomposition patterns, facade exports |
| **ADR-005** | Governance Patterns and Autonomous Execution | 2026-01-07 | ⚠️ PROPOSED | 137 | BMAD governance, time-boxing, TTL filtering, autonomous decisions |
| **ADR-026** | AI Service Unification | 2026-01-07 | ⚠️ PROPOSED | TBD | AI provider consolidation, unified API calls |
| **ADR-027** | State Management Consolidation | 2026-01-07 | ⚠️ PROPOSED | 251 | God stores (9 files >300 lines), slice decomposition, persist middleware rules |
| **ADR-028** | Error Boundary Coverage | 2026-01-07 | ⚠️ PROPOSED | 457 | Error handling tiers, WSOD prevention, route protection |
| **ADR-029** | Clean Storage Architecture | 2026-01-07 | ⚠️ PROPOSED | 141 | StorageAdapter interface, FSA/IDB adapters, file watching, sync consolidation |
| **ADR-030** | Multimodal Integration Architecture | 2026-01-09 | ⚠️ PROPOSED | 245 | Voice I/O, image processing, context management, provider router |
| **ADR-031** | Chat System Unification | 2026-01-09 | ⚠️ PROPOSED | 334 | Unified chat store, thread hierarchy, tool execution, cross-workspace events |
| **ADR-032** | Clean Storage Architecture (Phase 2) | 2026-01-15 | ✅ ACCEPTED | 141 | FSA implementation, TypeScript fixes, phase tracking |

### 1.3 Archived/Stale ADRs

| Location | Reason | Impact |
|----------|---------|---------|
| `_archive/ADR-036-platform-contract-consolidation-2026-01-18.md` | ID collision, renamed to ADR-037 | Prevents confusion |

---

## 🔴 Part 2: Conflict Matrix

### 2.1 Critical Conflicts (Must Resolve)

| Conflict A | Conflict B | Nature of Conflict | Resolution Priority | Recommendation |
|------------|-------------|-------------------|-------------------|----------------|
| ADR-033 | ADR-034 | ADR-033 defined platform contract, ADR-034 redefined project-centric model | **P0 - HIGH** | ADR-034 supersedes ADR-033 (documented) ✅ |
| ADR-033 | ADR-035 | ADR-033 decisions vs ADR-035 standardization conflict | **P0 - HIGH** | ADR-035 superseded by ADR-034 (documented) ✅ |
| ADR-034 | ADR-035 | Both claim to fix architecture - cascade remediation | **P1 - MEDIUM** | ADR-035 superseded by ADR-034 (documented) ✅ |
| ADR-033 | new-fundamental-truths.md (v2.0) | v2.0.0 has new project-centric model that supersedes ADR-033 | **P0 - HIGH** | v2.0.0 is new authority ✅ |
| ADR-034 | new-fundamental-truths.md (v2.0) | ADR-034 claims 2 routes, v2.0.0 confirms but adds platform-first nuance | **P1 - MEDIUM** | Align ADR-034 with v2.0.0 details (partial alignment ok) |
| ADR-001 to ADR-005 | new-fundamental-truths.md (v2.0) | Foundational ADRs (001-005) not referenced in v2.0.0, but concepts align | **P2 - LOW** | Update v2.0.0 to reference foundational ADRs |

### 2.2 Redundancies (Content Overlap)

| ADR | Overlaps With | Redundant Content | Consolidation Action |
|-----|---------------|-------------------|-------------------|
| ADR-037 | ADR-033 (D1), ADR-035 (1.4) | Platform contract interface, device type definitions | Merge into ADR-035 ✅ |
| ADR-038 | ADR-033 (Phase C) | Event listener error handling, error recovery patterns | Merge into ADR-035 ✅ |
| ADR-037-xss | None | XSS sanitization (new topic) | Keep as separate ✅ |
| ADR-027 | ADR-004 | God store decomposition (9 stores >300 lines) | Merge concepts into ADR-004 ✅ |
| ADR-028 | None | Error boundaries (new topic) | Keep as separate ✅ |
| ADR-031 | None | Chat unification (new topic) | Keep as separate ✅ |
| ADR-030 | None | Multimodal integration (new topic) | Keep as separate ✅ |
| ADR-036 (foundation-cleanup) | ADR-027 | State management consolidation, slash command migration | Merge into ADR-027 ✅ |

### 2.3 Duplicate IDs/Naming Issues

| Issue | Description | Impact | Fix Applied |
|--------|-------------|---------|--------------|
| **ADR-036 ID Collision** | Two documents named ADR-036 in same directory | Confusion, duplicate references | Renamed to ADR-037 ✅ |
| **Inconsistent Status Labels** | Mix of "PROPOSED", "APPROVED", "ACCEPTED", "SUPERSEDED" | Hard to query current state | Standardize status field ✅ |
| **Missing Version Numbers** | Some ADRs have no version field | Difficult to track evolution | Add version field to all ✅ |

---

## ⚠️ Part 3: Gaps Analysis (Missing ADRs)

### 3.1 New Fundamentals Not Covered by Existing ADRs

**Reference**: `new-fundamental-truths.md` (v2.0.0) - 12 core sections

| v2.0.0 Section | Current ADR Coverage | Gap | Priority |
|------------------|----------------------|-----|----------|
| **1. Project-Centric Architecture** | ADR-034 (partial 30%) | Platform-first defaults not fully covered | **P0** |
| **2. Device Architecture Separation** | ADR-033 (superseded), ADR-034 (partial) | Desktop FSA vs Mobile IndexedDB flows | **P0** |
| **3. Feature Plugin Architecture** | ADR-034 (partial) | Plugin interface, platform requirements, max instances | **P0** |
| **4. Unified Layout System** | None | Layout presets, responsive breakpoints | **P1** |
| **5. Single Project Route** | ADR-034 (declared) | `/$projectId` route implementation | **P0** |
| **6. BYOK Vault** | None | API key storage, provider routing, secure distribution | **P0** |
| **7. Agent and Tool Architecture** | ADR-001-005 (foundational) | Orchestrator pattern, tool permissions, agentic cycle | **P1** |
| **8. Chat Cascade & Thread Management** | ADR-031 (proposed) | Thread architecture, context management, compaction | **P0** |
| **9. Generative AI Features** | None | Individual AI features, note plugin integration | **P1** |
| **10. State Management & Persistence** | ADR-001-002-027 (proposed) | Zustand v5, Dexie, state boundaries | **P0** |
| **11. CRUD Permissions & Concurrency** | None | Permission model, conflict handling, file locks | **P1** |
| **12. Plugin Architecture (Detailed)** | ADR-034 (partial) | Plugin categories, always-loaded plugins, layout system | **P0** |

**Gap Summary**:
- **Critical Gaps (P0)**: 7 sections need dedicated ADRs
- **High Priority (P1)**: 5 sections need dedicated ADRs
- **0% Coverage**: 12 sections, only 3 have detailed ADR coverage

### 3.2 Proposed ADRs Not Implemented

| ADR ID | Title | Date | Status | Stale? | Action |
|---------|-------|--------|----------|--------|
| ADR-001 | Zustand State Management | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-002 | Single Source of Truth | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-003 | Clean Architecture Layers | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-004 | God Component/Store Decomposition | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-005 | Governance Patterns | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-026 | AI Service Unification | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-027 | State Management Consolidation | 2026-01-07 | ❌ (19 days) | Merge with ADR-001/002 |
| ADR-028 | Error Boundary Coverage | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-029 | Clean Storage Architecture | 2026-01-07 | ❌ (19 days) | Review, approve or deprecate |
| ADR-030 | Multimodal Integration | 2026-01-09 | ❌ (17 days) | Review, approve or deprecate |
| ADR-031 | Chat System Unification | 2026-01-09 | ❌ (17 days) | Review, approve or deprecate |
| ADR-037 | Platform Contract Consolidation | 2026-01-18 | ❌ (8 days) | Review, approve or deprecate |
| ADR-038 | Event Listener Isolation | 2026-01-18 | ❌ (8 days) | Review, approve or deprecate |
| ADR-037-xss | XSS Sanitization | 2026-01-18 | ❌ (8 days) | Review, approve or deprecate |
| ADR-036 | Foundation Cleanup | 2026-01-15 | ❌ (11 days) | Merge with ADR-027 |
| ADR-034-notes | Notes Routing Crisis | 2026-01-19 | ❌ (7 days) | Archive - superseded by v2.0.0 |

### 3.3 Code Quality & Standards ADRs (Missing)

| Topic | Current Coverage | Gap | Priority |
|-------|-----------------|-----|----------|
| **Console Log Formatting** | None | `[ModuleName]` prefix standard | **P2** |
| **Type Safety Patterns** | Partial (ADR-001) | `any` type elimination, strict mode | **P0** |
| **Slice Size Limits** | Partial (ADR-004) | Enforce 120-line limit | **P0** |
| **Component Size Limits** | Partial (ADR-004) | Enforce 300-line limit | **P0** |
| **Import Order Standards** | None | Standardized import ordering | **P2** |
| **Test Coverage Standards** | None | 80% minimum coverage | **P1** |

---

## 📝 Part 4: Consolidation Recommendations

### 4.1 Archive Obsolete ADRs

**Action**: Move superseded/stale ADRs to `_bmad-output/.archive/adr/` with clear metadata

| ADR ID | Archive Action | Reason | New Location |
|---------|---------------|---------|---------------|
| ADR-033 | Archive | Superseded by ADR-034 + new-fundamental-truths.md | `.archive/adr/ADR-033-superseded-2026-01-26.md` |
| ADR-035 | Archive | Superseded by ADR-034 + new-fundamental-truths.md | `.archive/adr/ADR-035-superseded-2026-01-26.md` |
| ADR-cascade-analysis | Archive | Analysis document, not a decision record | `.archive/analysis/ADR-cascade-analysis-2026-01-21.md` |
| ADR-034-notes | Archive | Crisis-specific ADR, superseded by v2.0.0 | `.archive/adr/ADR-034-notes-crisis-superseded-2026-01-26.md` |

### 4.2 Merge/Consolidate Redundant ADRs

**Action**: Combine overlapping ADRs into unified documents

| Merge Action | Source ADRs | Target ADR | Rationale |
|--------------|--------------|-------------|-----------|
| Platform contract definitions | ADR-037 + ADR-033(D1) + ADR-035(1.4) | **New ADR-035** (see Part 5) | Single source of truth for platform contracts |
| State management | ADR-001 + ADR-002 + ADR-027 | **New ADR-036** (see Part 5) | Unified state management guidance |
| Error handling | ADR-028 | **Keep ADR-028** | No overlap, comprehensive topic |
| Storage architecture | ADR-029 + ADR-032 | **Update ADR-032** | Phase 2 ADR-032, incorporate ADR-029 findings |

### 4.3 Deprecate or Review PROPOSED ADRs (>30 days)

**Action**: Review all proposed ADRs from 2026-01-07/09 for relevance

| Batch | Review Action | Timeline |
|-------|--------------|----------|
| Batch 1 (2026-01-07): ADR-001 to ADR-005 | Approve, update, or deprecate | Week 1 |
| Batch 2 (2026-01-09): ADR-026 to ADR-032 | Approve, update, or deprecate | Week 1 |
| Batch 3 (2026-01-15-18): ADR-036 to ADR-037-xss | Approve, update, or deprecate | Week 2 |

---

## 📄 Part 5: Recommended ADR-035 Structure

**Note**: Since ADR-035 exists but is superseded, create **ADR-039** (next available number) to replace the cascade.

```markdown
# ADR-039: Unified Architecture Fundamentals (v2.0.0 Alignment)

**Status**: PROPOSED FOR APPROVAL
**Date**: 2026-01-26
**Version**: 1.0.0
**Supersedes**: ADR-033, ADR-034, ADR-035 (cascade consolidation)
**Aligns With**: new-fundamental-truths.md v2.0.0
**Decision Makers**: User (Product Owner) + Architect Agent

---

## Context

The project has experienced an ADR cascade pattern (ADR-033 → ADR-034 → ADR-035) where each decision attempted to remediate gaps in the previous, resulting in architectural fragmentation and implementation confusion.

With the release of `new-fundamental-truths.md` v2.0.0, we now have a comprehensive, single-source-of-truth document that establishes project-centric architecture. This ADR consolidates all previous architectural decisions into a unified framework aligned with the new fundamentals.

### Previous ADR Analysis

| Previous ADR | Status | Key Decisions | Limitations |
|---------------|--------|-----------------|--------------|
| ADR-033 | SUPERSEDED | Platform detection, FSA handle persistence, project structure | Implementation details missing, led to 31 infection points |
| ADR-034 | APPROVED (partial) | Project-centric architecture, plugin system, unified routing | Platform-first defaults incomplete, 2-route concept persists |
| ADR-035 | SUPERSEDED | Entity model standardization, P0 bug fixes | Focus on bugs over architectural vision |

### New Fundamentals Overview

`new-fundamental-truths.md` v2.0.0 establishes:

1. **Project-Centric Architecture** (vs workspace-centric)
2. **Device Architecture Separation** (Desktop FSA vs Mobile IndexedDB)
3. **Feature Plugin Architecture** (Self-contained plugins with platform requirements)
4. **BYOK Vault** (Project-scoped API keys via TanStack AI)
5. **Agent and Tool Architecture** (Orchestrator pattern, tool permissions)
6. **Chat Cascade and Thread Management** (Project-scoped threads, 150K token limit)
7. **Generative AI Features** (Individual note features vs agent-driven features)
8. **State Management and Persistence** (Zustand v5, Dexie, FSA layers)
9. **CRUD Permissions and Concurrency** (Permission model, conflict resolution)
10. **Research and Reference Links** (TanStack AI, OpenCode docs)

---

## Decision

### D1: Adopt Project-Centric Architecture as Single Source of Truth

**Mental Model Shift**:
```
BEFORE (Workspace-Centric):
  Route → Workspace → Project → Features
  /notes → NotesWorkspace → project.notes → NotesEditor
  /ide → IDEWorkspace → project.ide → Monaco + Terminal

AFTER (Project-Centric):
  Route → Project → Feature Plugins
  /$projectId → ProjectContext → [FileTree, Monaco, Notes, Terminal, Chat]
```

**Key Principles**:
- Single `/$projectId` route (no `/ide/$projectId` or `/notes/$projectId`)
- Project ID is NOT prefixed/suffixed by workspace
- Platform determines available plugins, not user-selected "workspace mode"
- Two always-loaded plugins: Project Management + Chat Cascade
- Maximum 5 plugins per project (2 always-loaded + 3 optional)

### D2: Device Architecture Separation (Desktop vs Mobile)

| Aspect | Desktop (FSA) | Mobile/Tablet (IndexedDB) |
|---------|------------------|---------------------------|
| **Project Creation** | Folder picker → FSA handle | Browser project → Dexie |
| **Storage** | Real files on disk | Virtual files in Dexie |
| **IDE Access** | Full IDE with terminal | Blocked - Notes only |
| **Persistence** | Handle in IndexedDB | Files in Dexie |
| **Sync** | Bidirectional (external editors) | Single source (no sync) |
| **Platform Detection** | Auto-detect via `getPlatformContract()` | Auto-detect via `getPlatformContract()` |

**Platform Contract Interface** (from ADR-033 D1, refined):
```typescript
interface PlatformContract {
  readonly deviceType: 'desktop' | 'mobile' | 'tablet';
  readonly storageType: 'fsa' | 'indexeddb';
  readonly canAccessFSA: boolean;
  readonly canWatchFiles: boolean;
  readonly canRunTerminal: boolean;
  readonly canDoAgenticCoding: boolean;
  readonly canAccessIDE: boolean;
}
```

### D3: Feature Plugin Architecture

**FeaturePlugin Interface** (from ADR-034):
```typescript
interface FeaturePlugin {
  // Identification
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents';
  name: string;
  icon: React.ReactNode;

  // Rendering
  component: React.FC<FeaturePluginProps>;
  sidebarComponent?: React.FC<SidebarPluginProps>;

  // Platform Requirements
  requiresFSA: boolean;
  requiresProject: boolean;
  minWidth: number;
  maxInstances: 1 | 2 | 'unlimited';

  // State Management
  usePluginStore: () => PluginState;
}
```

**Plugin Categories**:
- **Always-Loaded** (2 mandatory): Project Management, Chat Cascade
- **Optional** (up to 3 user-selectable): Monaco, Notes, Terminal
- **Platform-Restricted**: Terminal (desktop-only)

**Platform-Aware Defaults** (from ADR-034-AMENDMENT-001):
```typescript
export function getDefaultPlugins(
  platform: PlatformContract,
  project: Project
): PluginId[] {
  // Desktop with FSA: Full development experience
  if (platform.deviceType === 'desktop' && project.storageType === 'fsa') {
    return ['filetree', 'monaco', 'chat'];
  }

  // Desktop with IndexedDB: Notes-focused
  if (platform.deviceType === 'desktop' && project.storageType === 'indexeddb') {
    return ['filetree', 'notes', 'chat'];
  }

  // Tablet: Notes-focused (no terminal)
  if (platform.deviceType === 'tablet') {
    return ['filetree', 'notes', 'chat'];
  }

  // Mobile: Minimal
  if (platform.deviceType === 'mobile') {
    return ['notes'];
  }

  return ['notes', 'chat'];
}
```

### D4: Unified Routing Structure

**Route Simplification**:
```
BEFORE (9 routes):
  /ide/$projectId
  /notes/$projectId
  /knowledge/$projectId
  /study/$projectId
  /workspace/$projectId
  /hub
  /settings
  ...

AFTER (2 routes):
  /hub                    # Project management, no project loaded
  /$projectId             # Project loaded with feature plugins
```

**Deprecation Strategy**:
- Old routes redirect to `/$projectId` with console warning
- Query parameters `?layout=ide` or `?layout=notes` eliminated
- Platform determines plugins, not URL params

### D5: BYOK Vault Integration

**Architecture**:
```
BYOK Vault
├── Integration: TanStack AI SDK (no direct provider calls)
├── Storage: Project-scoped in Dexie
├── Distribution: Conditional, reactive
└── Providers: Gemini, OpenRouter, OpenAI, Anthropic (first-tier)
           + Grok, Ollama (second-tier)
```

**Provider Support Matrix** (from v2.0.0 fundamentals):
| Provider | Tier | Models | Capabilities |
|----------|-------|--------|--------------|
| Google Gemini | First-tier | 3.0 Pro/Flash | Multimodal, tools, streaming, thinking |
| OpenRouter | First-tier | 400+ | OpenAI-compatible, all models |
| OpenAI | First-tier | GPT-5.1 | Full feature parity |
| Anthropic | First-tier | Claude 4.5 | Full feature parity |
| Grok | Second-tier | Latest | Basic completion |
| Ollama | Second-tier | Local | Local model serving |

### D6: Agent and Tool Architecture

**Orchestrator Pattern** (from v2.0.0 fundamentals):
```
User Input
    ↓
Orchestrator/Coordinator (read-only tools only)
    ├─→ Mode Switching (to domain-specific agent)
    └─→ Task Delegation (to sub-agents with isolated context)
```

**Tool Permission Matrix** (from v2.0.0):
| Agent Type | write | edit | bash | task | Role |
|------------|-------|------|------|------|------|
| real-world-validator | true | false | browser (limited) | true | Testing only |
| dev-ext | true | true | limited | true | Implementation |
| architect-ext | false | design only | false | true | Architecture docs |
| analyst-ext | false | false | false | true | Research only |
| ux-designer-ext | false | false | false | true | Design only |

### D7: State Management and Persistence (Zustand v5 + Dexie)

**State Layers**:
```
Layer 1: Dexie (IndexedDB) - Persistent Database
  - Projects, notes, conversations, FSA handles, etc.

Layer 2: Zustand - Reactive State
  - UI state, ephemeral data
  - Uses Dexie for persistence via persist middleware

Layer 3: FSA (File System) - Real Files (desktop only)
  - Accessed via StorageAdapter pattern
```

**Slice Pattern Requirements** (from ADR-001, ADR-004):
- Maximum slice size: 120 lines
- Maximum store size: 300 lines (combined)
- Individual selectors: `useStore(s => s.value)`
- Multiple selectors: `useStore(useShallow(state => ({ a, b, c })))`
- Persist middleware on combined store only
- Cross-slice communication via `get()`

### D8: Chat Cascade and Thread Management

**Thread Architecture**:
```
Project
  └─→ Threads (indexed by project ID)
      ├─→ Main Thread (user conversation)
      ├─→ Sub-threads (agent delegations)
      └─→ Compaction Threads (auto-generated at 90% context limit)
```

**Context Management** (from v2.0.0):
- Default limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)
- Thread hierarchy with timestamps and metadata
- All threads scoped to project ID (no cross-project RAG)

---

## Consequences

### Positive

1. **Single Source of Truth** - One ADR consolidates all architectural decisions
2. **Eliminates Cascade Pattern** - No more ADR-033 → 034 → 035 remediation loops
3. **Aligned with Fundamentals** - Full alignment with new-fundamental-truths.md v2.0.0
4. **Clear Migration Path** - Supersedes 3 ADRs with documented transition
5. **Platform-First Thinking** - Clear device/architecture boundaries
6. **Plugin System Foundation** - Well-defined plugin architecture with platform awareness

### Negative

1. **Complexity** - This ADR is large (comprehensive consolidation)
2. **Transition Effort** - Requires archiving 3 ADRs and updating all references
3. **Learning Curve** - New unified framework may require team education
4. **Implementation Risk** - Consolidated decisions must be validated in practice

### Neutral

1. **Status Updates** - Previous ADRs must be marked as SUPERSEDED
2. **Reference Updates** - All documents referencing old ADRs need updates
3. **Tooling Changes** - ADR tracking tooling must support supersession

---

## Implementation Notes

### Phase 1: ADR-039 Creation (Week 1)
- [x] Create ADR-039 with consolidated decisions
- [ ] Approve ADR-039 with User + Architect Agent sign-off
- [ ] Update v2.0.0 fundamentals to reference ADR-039

### Phase 2: Archive Superseded ADRs (Week 1)
- [ ] Move ADR-033 to `_bmad-output/.archive/adr/` with supersed metadata
- [ ] Move ADR-035 to `_bmad-output/.archive/adr/` with supersed metadata
- [ ] Update all references in codebase (search for "ADR-033" and "ADR-035")
- [ ] Update AGENTS.md to reference ADR-039 instead

### Phase 3: Review Proposed ADRs (Week 2)
- [ ] Batch review ADR-001 through ADR-005 (foundational)
- [ ] Batch review ADR-026 through ADR-032 (integration)
- [ ] Batch review ADR-036 through ADR-037-xss (newer topics)
- [ ] For each: Approve, update with feedback, or deprecate
- [ ] Create consolidation ADRs for approved batches

### Phase 4: Create Missing ADRs (Week 3)
- [ ] ADR-040: BYOK Vault & TanStack AI Integration
- [ ] ADR-041: Chat Cascade & Thread Management (detailed)
- [ ] ADR-042: CRUD Permissions & Concurrency
- [ ] ADR-043: Unified Layout System & Responsive Design
- [ ] ADR-044: Generative AI Features (Note Plugin)
- [ ] ADR-045: Type Safety Standards & Enforcement

### Phase 5: Documentation & Governance Updates (Week 4)
- [ ] Update `AGENTS.md` to reference ADR-039 as primary architecture authority
- [ ] Update `CLAUDE.md` with ADR-039 reference
- [ ] Create ADR governance process document
- [ ] Update ADR tracking tooling to support supersession chains
- [ ] Training session on unified architecture fundamentals

---

## Success Criteria

- [x] All ADRs cataloged with status and alignment
- [ ] ADR-039 created and approved
- [ ] Superseded ADRs (033, 035) archived with metadata
- [ ] No duplicate ADR IDs or naming conflicts
- [ ] All proposed ADRs >30 days reviewed and resolved
- [ ] Missing ADRs for v2.0.0 fundamentals created
- [ ] Governance documents updated to reference ADR-039
- [ ] All conflicts documented and resolution path defined
- [ ] Consolidation timeline and ownership assigned

---

## References

- **new-fundamental-truths.md** v2.0.0 (2026-01-25)
- ADR-033: Correct-Course Architectural Remediation (2026-01-16)
- ADR-034: Project-Centric Architecture (2026-01-20)
- ADR-035: Correct-Course v2 (2026-01-14)
- ADR-034-AMENDMENT-001: Platform-First Plugin Selection (2026-01-21)
- ADR-cascade-analysis (2026-01-21)
- AGENTS.md (governance and standards)
- CLAUDE.md (platform routing and architecture)

---

## Approval

- [ ] User (Product Owner)
- [ ] Architect Agent
- [ ] Dev Team Lead
- [ ] Governance Committee (if applicable)

**Status**: DRAFT - Pending Approval
**Next Review**: 2026-02-01 (7 days from creation)
```

---

## 📊 Appendix A: ADR Status Legend

| Status | Description | Action Required |
|---------|-------------|----------------|
| **APPROVED** | Approved for implementation, active | Proceed with implementation |
| **IN PROGRESS** | Implementation started but not complete | Continue implementation, track progress |
| **SUPERSEDED** | Replaced by newer ADR | Archive and update references |
| **PROPOSED** | Proposed but not yet approved | Review, approve, update, or deprecate |
| **ACCEPTED** | Accepted as valid standard | Treat as active guidance |
| **DEPRECATED** | No longer valid | Archive and remove from reference |
| **ARCHIVED** | Moved to archive for historical reference | No action required |

---

## 📊 Appendix B: ADR Lifecycle Management

### Creation Workflow

```
1. Draft ADR by architect/analyst agent
2. Peer review by architect-ext
3. User approval
4. Register in ARTIFACT_REGISTRY.yaml
5. Update LOOP_STATE.yaml
6. Reference from relevant documents
```

### Supersession Workflow

```
1. Create new ADR that supersedes old ADR
2. Document supersession in old ADR (status + superseded_by)
3. Update all references (grep codebase for old ADR ID)
4. Archive old ADR with metadata
5. Register supersedence in ARTIFACT_REGISTRY
```

### Deprecation Workflow

```
1. Review proposed ADRs older than 30 days
2. Assess: Still relevant? Confirmed working? Better solution exists?
3. Action: Approve (add to implementation), Update (refine), or Deprecate (archive)
4. Update ADR status and add deprecation metadata
5. Notify team of deprecation
```

---

**Document Version**: 1.0.0
**Status**: COMPLETE - Ready for Review
**Next Action**: Submit to governance committee for approval
**Total Analysis Time**: 40 minutes (timebox met)
