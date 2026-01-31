# Correct-Course: Gap Analysis & Boundary Definition
**Date**: 2026-01-16
**Last Updated**: 2026-01-16T19:30:00+07:00
**Status**: PLANNING - ITERATION 3 (Gap Analysis)
**Document Type**: Companion to `correct-course-architectural-remediation-2026-01-16.md`

---

## description

This document traces the **original problem statement** against our planning document to identify:
1. What we've addressed ✅
2. What needs deeper exploration ⚠️
3. What has unclear boundaries ❌
4. What we haven't touched yet 🔴

---

## Original Problem Statement Trace

### Category 1: Routing & Entry (User-Facing)

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Unclear routing, errors, toast | ARC-A01, ARC-A02, ARC-A04 | ⚠️ Toast/error handling not detailed |
| Desktop vs. other devices detection | ARC-A01 (`getPlatformContract()`) | ✅ Covered |
| Unregulated entry to 2 user types | ARC-A01, ARC-A02 (route guards) | ✅ Covered |
| Props passing from Hub cards | Not explicitly covered | ❌ **GAP** |
| Redirect after project selection | Not explicitly covered | ❌ **GAP** |

**Gaps Identified**:
- Hub card → Workspace transition: What props are passed? How does projectId flow?
- Toast/error states: Who owns error display? Where is the error boundary?
- Wizard flow: Project creation → What workspace does it open?

---

### Category 2: DexieDB vs. FileSystem in Project Management

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Project persistence across workspaces | ARC-B01 (StorageGateway), ARC-C01 | ✅ Conceptually covered |
| Desktop users get FSA, others get IDB | Decided in planning doc | ✅ Covered |
| Should non-desktop get multiple IDB projects? | Not decided | ⚠️ **NEEDS DECISION** |
| Should desktop access workspace without creating project? | Not decided | ⚠️ **NEEDS DECISION** |
| Double interface for desktop if also IDB? | Decided: No choice, auto-detect | ✅ Covered |
| Where else is DexieDB used? | Partially documented | ⚠️ Needs inventory |

**Deep Investigation Needed**:

#### DexieDB Usage Inventory (from grep)

| Table | Used For | projectId? | workspaceId? | Cross-Workspace? |
|-------|----------|------------|--------------|------------------|
| `projects` | Project metadata | ✅ Primary key | ❌ | N/A (project level) |
| `notes` | Note content | ✅ | ✅ | Per workspace |
| `conversations` | Chat history | ✅ | ✅ | Per workspace |
| `threads` | Chat threads | ✅ | ✅ | Per workspace |
| `ideState` | Editor state | ✅ | ✅ | IDE only |
| `fileMetadata` | File info | ✅ | ✅ | Per workspace |
| `fsaHandles` | FSA handles | ✅ | ✅ | Per workspace |
| `sources` | Knowledge sources | ✅ | ✅ | Per workspace |
| `collections` | Source collections | ✅ | ✅ | Per workspace |
| `oramaIndexes` | RAG vectors | ✅ | ✅ | Per workspace |
| `flashcards` | Study cards | ✅ | ✅ | Study only |
| `quizzes` | Quizzes | ✅ | ✅ | Study only |
| `sessionSnapshots` | Recovery | ✅ | ✅ | Per workspace |
| `taskContexts` | Agent context | ✅ | ✅ | Per workspace |
| `providerCredentials` | API keys | ❌ | ❌ | **Global** |
| `savedBlocks` | Block templates | ❌ | ❌ | **Global** |

**Key Finding**: Most tables use BOTH `projectId` AND `workspaceId`. This is the source of confusion.

---

### Category 3: States, Stores, Persistence (Architecture)

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| 59+ store files scattered | ARC-C01, ARC-C05, ARC-E02-E04 | ✅ Consolidation planned |
| STUB implementations | ARC-C03 (saveProject fix) | ⚠️ Only one STUB called out |
| Circular dependencies | Not explicitly addressed | ❌ **GAP** |
| Adapter/hook/handler confusion | Not explicitly addressed | ❌ **GAP** |
| Race conditions in reactive hotload | Not explicitly addressed | ❌ **GAP** |
| Infinite loop crashes | Not explicitly addressed | ❌ **GAP** |

**Store File Inventory (from find)**:

| Location | Count | description | Canonical? |
|----------|-------|---------|------------|
| `src/lib/workspace/project-store/` | 7 files | Project CRUD | ❌ STUB |
| `src/lib/workspace/file-sync-status-store/` | 6 files | Sync status | ❌ DUPLICATE |
| `src/lib/filesystem/file-snapshot-store/` | 6 files | File cache | ⚠️ Maybe keep |
| `src/lib/filesystem/sync-manager/` | 7 files | Sync logic | ⚠️ Complex |
| `src/lib/notes/` | 6 stores | Note state | ⚠️ Workspace-specific |
| `src/lib/snippets/snippet-store/` | 5 files | Snippets | ⚠️ |
| `src/infrastructure/persistence/stores/` | 50+ files | **CANONICAL** | ✅ |

**Total**: ~100+ store-related files. Our plan only explicitly addresses 5-10.

---

### Category 4: Entity Naming (project vs workspace)

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| `project` vs `workspace` confusion | ARC-D01, ARC-D02, ARC-D03 | ✅ Covered |
| ID collision between types | ARC-D01 (template literal type) | ✅ Covered |
| Wizard naming (user input vs. ID) | Not addressed | ❌ **GAP** |
| `workspaceId || projectId` fallback bugs | ARC-D02 | ✅ Covered |

**Clarification Needed**:

| Term | Definition | ID Format |
|------|------------|-----------|
| **Project** | A folder/collection of files | `proj_${uuid}` or `notes:browser-mode` |
| **Workspace** | A mode of interaction (IDE, Notes, Knowledge, Study) | `ide` \| `notes` \| `knowledge` \| `study` |
| **ProjectId** | Unique identifier for a project | Template literal: `${prefix}_${uuid}` |
| **WorkspaceId** | Enum for workspace type | String union: `'ide' \| 'notes' \| 'knowledge' \| 'study'` |

**Problem in Dexie**: Tables use BOTH `projectId` AND `workspaceId` as composite keys:
```
fileMetadata: '[projectId+workspaceId+path]'
```
This means the same project has DIFFERENT data per workspace. Is this intentional?

---

### Category 5: Features Mapping

#### 5.1 BYOK Vault

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Key persistence | EPIC-CC-02 (COMPLETED) | ✅ Done |
| Conditional use per provider | Not in current plan | ⚠️ Out of scope |
| Endpoint routing | Not in current plan | ⚠️ Out of scope |

**Status**: BYOK vault is done. Provider endpoint routing is a separate feature.

---

#### 5.2 Project Space Boundaries

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Clear boundaries routing-naming-ID-flow | ARC-A01, ARC-D01 | ⚠️ Partial |
| FSA only desktop, cross-workspace | ARC-B01, ARC-B02 | ✅ Covered |
| Browser DB by default if not desktop | Decided | ✅ Covered |
| Dirty architecture - states unsynced | ARC-C04 (persist-first) | ⚠️ Pattern defined, not implemented |
| Messy routing and redirecting | ARC-A02, ARC-A04 | ⚠️ Route guards only |

**What's Missing**:
- State synchronization protocol
- Fallback behavior when persistence fails
- Recovery mechanism for orphaned projects

---

#### 5.3 CRUD Permissions (Human + AI Agent)

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Human CRUD permissions | Not explicitly addressed | ❌ **GAP** |
| AI Agent CRUD permissions | AgentCapabilities interface (proposed) | ⚠️ Interface only, not enforced |
| Concurrent CRUD | Not addressed | ❌ **GAP** |
| Permissions check before tool execution | Not in stories | ❌ **GAP** |

**Critical Gap**: We define capabilities but don't enforce them in tool execution.

---

#### 5.4 Data Flow & State Persistence (Original Section 2)

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Ambiguous boundary FS vs. Browser DB | ARC-B01 (StorageGateway) | ✅ Conceptual |
| Seamless abstraction layer | StorageGateway interface | ⚠️ Interface only |
| Desktop: Load project folder via FS | ARC-B02 (FSAGateway) | ✅ |
| Desktop: `default_note` in browser space | Not addressed | ❌ **GAP** |
| State must be reactive and persistent | ARC-C04 (persist-first pattern) | ⚠️ Pattern only |
| Mobile: Prevent architectural confusion | Decided (IDB only) | ✅ |

**What's Missing**:
- How does `default_note` work for FSA desktop users?
- What triggers autosave? Debounce timing?
- What happens on conflict (external edit + local edit)?

---

#### 5.5 Agents vs. LLMs

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Orchestrator layer + workspace-specific | Not in current plan | 🔴 **NOT ADDRESSED** |
| System instruction prompts (two layers) | Not in current plan | 🔴 **NOT ADDRESSED** |
| Mode switching per workspace | Not in current plan | 🔴 **NOT ADDRESSED** |
| Tool focus groups per mode | Not in current plan | 🔴 **NOT ADDRESSED** |
| Multi-step agentic execution | Not in current plan | 🔴 **NOT ADDRESSED** |

**Status**: This is a FEATURE epic, not an ARCHITECTURE epic. Should be separate.

---

#### 5.6 Tools & CRUD Execution

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Tools connected to various parts | Not in current plan | 🔴 **NOT ADDRESSED** |
| Tool CRUD with permissions | AgentCapabilities (proposed) | ⚠️ Interface only |
| Agentic multi-step using tools | Not in current plan | 🔴 **NOT ADDRESSED** |
| Tool error handling for one-shot agent | Not in current plan | 🔴 **NOT ADDRESSED** |

**Status**: Tool execution layer is a FEATURE epic. But needs architecture foundation.

---

#### 5.7 RAG Infrastructure

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Browser vector DB | Mentioned (Orama) | ⚠️ Not detailed |
| Local embedding and chunking | Not in current plan | 🔴 **NOT ADDRESSED** |
| Different types of resources | Not in current plan | 🔴 **NOT ADDRESSED** |
| Gemini/Gema3 integration | Not in current plan | 🔴 **NOT ADDRESSED** |

**Status**: RAG is a FEATURE epic. But needs architecture foundation (storage, indexing).

---

#### 5.8 Multimodality (Input/Output)

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Output to different features | Not in current plan | 🔴 **NOT ADDRESSED** |
| Input from features (commands) | Not in current plan | 🔴 **NOT ADDRESSED** |
| Input from AI agents | Not in current plan | 🔴 **NOT ADDRESSED** |

**Status**: Multimodality is a FEATURE epic. Not architecture.

---

#### 5.9 Chat Cascade & Thread Management

| Original Issue | Current Plan Coverage | Gap? |
|----------------|----------------------|------|
| Gate to agents | Not in current plan | 🔴 **NOT ADDRESSED** |
| Cross-workspace threads | Dexie tables exist | ⚠️ Data structure exists |
| Thread RAG | Not in current plan | 🔴 **NOT ADDRESSED** |

**Status**: Chat is working (EPIC-40 complete). But architectural foundation unclear.

---

## Summary: Gap Categories

### ✅ Covered (Can Proceed)

| Area | Stories |
|------|---------|
| Platform detection | ARC-A01 |
| Route guards | ARC-A02, ARC-A04 |
| FSA handle persistence | ARC-B02 + research |
| File watching | ARC-B05 + research |
| Storage type auto-select | Decided |
| Project store consolidation | ARC-C01, ARC-C02, ARC-C03 |
| Entity naming (project vs workspace) | ARC-D01, ARC-D02, ARC-D03 |
| File tree cleanup | ARC-E01-E04 |
| BYOK vault | EPIC-CC-02 (DONE) |

---

### ⚠️ Partially Covered (Needs Deepening)

| Area | What's Missing |
|------|----------------|
| Toast/error handling | Who owns error display? Error boundary strategy? |
| Store inventory | Only 5-10 of 100+ files explicitly planned |
| Circular dependencies | Not addressed at all |
| Race conditions | Pattern defined but not mapped to specific code |
| `default_note` for FSA users | How does browser-mode work for desktop? |
| Autosave triggers | What debounce timing? What triggers save? |
| Conflict resolution | External edit + local edit = ??? |
| AI Agent capabilities | Interface defined but not enforced |

---

### ❌ Gaps (Need New Stories)

| Area | New Story Needed |
|------|------------------|
| Hub → Workspace props passing | ARC-A05: Define Hub card click data contract |
| Wizard → Workspace redirect | ARC-A06: Post-creation redirect logic |
| Multiple IDB projects for mobile | **NEEDS DECISION** |
| Desktop access without project | **NEEDS DECISION** |
| STUB implementations (all of them) | ARC-C06: Audit all STUBs |
| Circular dependency breaking | ARC-C07: Dependency graph analysis |
| Race condition fixes | ARC-C08: Identify and fix race conditions |
| Human CRUD permissions | ARC-C09: Permission model for human actions |
| Concurrent CRUD handling | ARC-C10: Optimistic locking / last-write-wins |

---

### 🔴 Not Addressed (Out of Scope - Feature Epics)

| Area | Recommended Epic |
|------|------------------|
| Agent orchestrator layer | EPIC-AGENT-ORCH |
| System instruction prompts | EPIC-AGENT-PROMPTS |
| Mode switching per workspace | EPIC-AGENT-MODES |
| Tool focus groups | EPIC-AGENT-TOOLS |
| Multi-step agentic execution | EPIC-AGENT-AGENTIC |
| RAG infrastructure | EPIC-RAG |
| Multimodality | EPIC-MULTIMODAL |
| Chat thread RAG | EPIC-CHAT-RAG |

**These should NOT block architectural remediation. They depend on it.**

---

## Open Decisions Required

### Decision 1: Multiple IDB Projects for Mobile

**Question**: Should mobile users be able to create multiple projects in IndexedDB?

| Option A: Single Default | Option B: Multiple Projects |
|--------------------------|----------------------------|
| Simpler state | Matches desktop model |
| `notes:browser-mode` only | `proj_${uuid}` per project |
| No project selection UI | Need project selection UI |
| **Recommended for MVP** | **Phase 2** |

### Decision 2: Desktop Access Without Project

**Question**: Can desktop users access Notes workspace without selecting/creating a project?

| Option A: Project Required | Option B: Default Browser Mode |
|---------------------------|-------------------------------|
| Consistent with FSA model | Faster onboarding |
| Must create/select project | `notes:browser-mode` fallback |
| **Recommended** | Adds complexity |

### Decision 3: Notes Storage for FSA Desktop

**Question**: Where do Notes content live for FSA desktop users?

| Option A: In FSA Folder | Option B: In Dexie |
|------------------------|-------------------|
| `/project/notes/*.md` | Dexie `notes` table |
| External editor can open | Same as mobile |
| Must sync on file change | Simpler architecture |
| **Recommended for consistency** | **Recommended for simplicity** |

**Recommendation**: Option B (Dexie) for Notes content, FSA only for IDE code files. This gives parity with mobile and avoids sync complexity.

### Decision 4: Composite Key (projectId + workspaceId)

**Question**: Should Dexie tables use composite keys `[projectId+workspaceId]` or just `projectId`?

| Current: Composite | Alternative: projectId Only |
|-------------------|---------------------------|
| Data scoped per workspace | Data shared across workspaces |
| Same project = different notes per workspace | Same project = same notes everywhere |
| More isolation | More sharing |
| **Current behavior** | Simpler but changes semantics |

**Recommendation**: Keep composite keys. The current design is intentional - same project can have different state in different workspaces.

---

## Next Steps

1. **User to decide** on the 4 open decisions above
2. **Add new stories** for gaps identified (ARC-A05 through ARC-C10)
3. **Defer feature epics** (Agent, RAG, Multimodal) until architecture is stable
4. **Create dependency graph** for store consolidation (100+ files)
5. **Identify all STUB implementations** beyond `saveProject()`

---

## Document Links

- Main Plan: `correct-course-architectural-remediation-2026-01-16.md`
- This Analysis: `correct-course-gap-analysis-2026-01-16.md`
- AGENTS.md: File tree governance rules
- CLAUDE.md: Architectural boundaries

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-16T19:30:00+07:00
**Status**: PLANNING - GAP ANALYSIS COMPLETE
