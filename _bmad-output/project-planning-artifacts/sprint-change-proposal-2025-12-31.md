---
date: 2025-12-31
time: 16:45:00
phase: Implementation (Course Correction)
team: Team-A
agent_mode: bmad-core-bmad-master
workflow: correct-course
triggered_by: BMAD Master - Project Health Assessment
output_language: English
---

# 🔄 Sprint Change Proposal: Architectural Consolidation + Knowledge Synthesis Integration

**Proposal ID:** SCP-2025-12-31-1645  
**Status:** DRAFT - Awaiting User Approval  
**Scope Classification:** **MAJOR** - Requires PM/Architect involvement  
**Estimated Impact:** 5 Epics affected, 4 new phases created  

---

## Section 1: Issue Summary

### 1.1 Triggering Event

During the project health assessment initiated on 2025-12-31, a comprehensive validation of the codebase against the **Sweeping Validation Checklist** revealed significant governance misalignment:

| Metric | Claimed | Reality | Gap |
|--------|---------|---------|-----|
| Health Score | 100% | 5.9% | -94.1% |
| TypeScript Errors | 0 | 1,172 | +1,172 |
| Files >300 LOC | 0 | 37+ | +37 |
| Validated Stories | 100% | 61% | -39% |

### 1.2 Core Problem Statement

**The project is in a state of "documentation-reality divergence"** where:

1. **Documentation claims completion** while critical features remain unimplemented (Story 10.2 - Multimodal Vision)
2. **Architectural boundaries are violated** with god-class stores (provider-models-store.ts at 21.8KB)
3. **Brownfield assets are untapped** - existing file sync/FSA capabilities not leveraged for Knowledge workspace
4. **State management is fragmented** with no event bus for cross-store reactivity
5. **EPIC-32 (Knowledge Synthesis RAG)** is planned but lacks foundation from architectural consolidation

### 1.3 Evidence

**From Sweeping Validation (L1-L12 assessment):**
- Level 1 (State Integrity): ❌ FAILED - 1,172 TS errors
- Level 2 (Code Hygiene): ❌ FAILED - 37 files >300 lines
- Level 3-10: ⚠️ UNKNOWN - Not validated
- Level 11 (Documentation): ❌ FAILED - Governance mismatch
- Level 12 (Test Coverage): ⚠️ UNKNOWN - Not validated

**From Infrastructure Validation:**
- No quota handling across 79 files with DB operations
- Silent failures in 23 locations
- No LRU eviction for index cache

---

## Section 2: Impact Analysis

### 2.1 Epic Impact

| Epic | Current Status | Impact | Required Action |
|------|----------------|--------|-----------------|
| **Epic 6** (Knowledge Sources) | Claimed Complete | ⚠️ PARTIAL | 2 file size violations, video missing |
| **Epic 7** (RAG Pipeline) | Claimed Complete | ⚠️ PARTIAL | 6 file size violations, UI missing |
| **Epic 8** (Canvas) | Claimed Complete | ⚠️ PARTIAL | Store split needed (540 LOC) |
| **Epic 9** (Study Tools) | Claimed Complete | ⚠️ PARTIAL | 3 file size violations, export missing |
| **Epic 10** (Multimodal) | Claimed Complete | ❌ INCOMPLETE | Story 10.2 NOT IMPLEMENTED |
| **Epic 24** (Sync) | Claimed Complete | ⚠️ PARTIAL | sync-manager.ts SEVERE (667 LOC) |
| **Epic 26** (Notes) | Claimed Complete | ⚠️ PARTIAL | AI streaming placeholder, drag-drop missing |
| **Epic 32** (RAG Infra) | NOT STARTED | 🔜 READY | Depends on foundation fixes |

### 2.2 Story Impact - Current Stories Affected

| Story ID | Issue | Required Fix |
|----------|-------|--------------|
| 10.2 | NOT IMPLEMENTED | Implement multimodal vision or formally defer |
| 9.1 | Missing source citations | Add `[1]` citation format to flashcards |
| 9.2 | Missing export UI | Implement PDF/JSON export |
| 6.2 | Missing video support | Add YouTube embed + transcript extraction |

### 2.3 Artifact Conflicts

**PRD Impact:**
- Core MVP still achievable but feature gaps exist
- Knowledge Synthesis (EPIC-32) blocked by foundation issues

**Architecture Impact:**
- State management pattern violation (no event bus)
- Store organization doesn't match documented 5-layer architecture
- Missing credential vault for API key encryption

**UX Impact:**
- ChatPanel inconsistent across workspaces
- Missing UI components for audio/video features

### 2.4 Technical Impact

| Area | Current State | Required Change |
|------|---------------|-----------------|
| Store Architecture | 8 stores, unclear boundaries | Reorganize to core/agent/conversation/workspace |
| Event Bus | ❌ Missing | Create `store-events.ts` |
| Credential Vault | ❌ Missing | Implement AES-256-GCM encryption |
| God Classes | 37 files >300 LOC | Split all into <300 LOC |
| Cross-Workspace | Components duplicated | Unify ChatPanel, FileTree adapters |

---

## Section 3: Recommended Approach

### 3.1 Selected Path: **Hybrid (Direct Adjustment + MVP Review)**

**Rationale:**
1. **No rollback needed** - existing code is functional, just needs refinement
2. **MVP is still achievable** with scope prioritization
3. **EPIC-32 can proceed in parallel** with foundation fixes
4. **User's timeline** (showcase demo) requires rapid iteration

### 3.2 Phased Implementation Strategy

#### Phase 0: Immediate Fixes (TODAY - 2025-12-31)
**Goal:** Unblock showcase demo

| Task | Effort | Priority |
|------|--------|----------|
| ✅ Fix hybrid-retriever.ts build error | Done | P0 |
| Continue AC-03 ChatPanel | 4h | P0 |
| Verify provider config works | 1h | P0 |

#### Phase 1: Foundation Consolidation (Jan 1-3)
**Goal:** Establish architectural foundation for EPIC-32

| Story | Description | Effort | Output |
|-------|-------------|--------|--------|
| FC-01 | Split provider-models-store | 4h | `provider-store.ts` + `models-store.ts` |
| FC-02 | Create event bus module | 3h | `src/lib/events/store-events.ts` |
| FC-03 | Wire provider-to-agent reactivity | 3h | Key changes trigger model reload |
| FC-04 | Credential vault implementation | 4h | AES-256-GCM encrypted storage |
| FC-05 | Fix 10 highest-priority file size violations | 6h | <300 LOC each |

**Validation Gate:** Run `sweeping-validation.md` Level 1-2 checks

#### Phase 2: Cross-Workspace Integration (Jan 4-7)
**Goal:** Enable brownfield features across Knowledge workspace

| Story | Description | Effort | Output |
|-------|-------------|--------|--------|
| CW-01 | Abstract file sync service | 5h | Works for IDE + Knowledge |
| CW-02 | Project → Knowledge sync | 4h | Documents sync to RAG |
| CW-03 | Unified ChatPanel | 6h | Single component, workspace variants |
| CW-04 | Fix remaining file size violations | 8h | <300 LOC each |

**Validation Gate:** Run `sweeping-validation.md` Level 3-6 checks

#### Phase 3: EPIC-32 Execution (Jan 8-17)
**Goal:** Implement RAG Infrastructure from Implementation Playbook

| Story | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 32-1 | Orama WASM Integration | 3d | FC-01, FC-02 |
| 32-2 | Document Chunking Pipeline | 4d | 32-1 |
| 32-3 | Embedding Generation Service | 4d | 32-1, CW-02 |
| 32-4 | Hybrid Search Implementation | 3d | 32-2, 32-3 |
| 32-5 | Citation & Source Tracking | 3d | 32-4 |

**Reference:** `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md`

#### Phase 4: Code Hygiene Sprint (Jan 18-20)
**Goal:** Achieve 100% Sweeping Validation pass

| Activity | Description |
|----------|-------------|
| Split remaining god classes | All files <300 LOC |
| Remove dead code | Unused imports, zombie branches |
| Run full Sweeping Validation | L1-L12 must pass |
| 3-Device Rule Test | Desktop Chrome, Mobile Safari, Android Chrome |

---

## Section 4: Detailed Change Proposals

### 4.1 Story Changes

#### NEW: FC-01 - Split Provider-Models Store

```
Story: [FC-01] Split Provider-Models Store
Epic: Architectural Consolidation
Priority: P0

OLD:
- provider-models-store.ts (21.8KB, ~600 LOC)
- Contains: Provider CRUD + Model loading + API keys + Connection status

NEW:
- provider-store.ts (~150 LOC)
  - Provider CRUD operations
  - API key management (calls credential vault)
  - Emits 'provider:key-set' events
  
- models-store.ts (~200 LOC)
  - Model loading per provider
  - Model selection tracking
  - Subscribes to 'provider:key-set' events
  
- credential-store.ts (~100 LOC)
  - AES-256-GCM encryption
  - Key storage in IndexedDB

Rationale: God class violates 300-LOC limit and single responsibility principle
```

#### NEW: FC-02 - Event Bus Module

```
Story: [FC-02] Event Bus Module
Epic: Architectural Consolidation
Priority: P0

OLD:
- No cross-store event system
- Stores poll or directly import each other

NEW:
- src/lib/events/store-events.ts
- EventEmitter3 instance exported
- Typed event catalog with STORE_EVENTS constant
- All stores import and emit/subscribe

Rationale: Required for reactive data flow per Architecture document (Arch 5.5)
```

#### MODIFY: Story 32-1 - Orama WASM Integration

```
Story: [32-1] Orama WASM Integration
Section: Dependencies

OLD:
- Dependencies: None

NEW:
- Dependencies: FC-01 (Store split), FC-02 (Event bus), FC-04 (Credential vault)

Rationale: RAG infrastructure needs stable state foundation before implementation
```

### 4.2 PRD Modifications

No PRD modifications needed - core MVP unchanged.

### 4.3 Architecture Changes

```
Document: Architecture.md
Section: 4.2 - State Management

OLD:
- "Unified Zustand + Dexie Middleware pattern for state persistence"

NEW:
- "Unified Zustand + Dexie Middleware pattern for state persistence"
- "Cross-store reactivity via EventEmitter3 event bus"
- "Store hierarchy: core/ → agent/ → conversation/ → workspace/"
- "All files must be <300 lines of code"

Rationale: Add explicit event bus and file size requirements
```

### 4.4 UI/UX Changes

No UX spec changes - existing specs still apply.

---

## Section 5: Implementation Handoff

### 5.1 Change Scope Classification

**MAJOR** - Requires fundamental reorganization with PM/Architect involvement

### 5.2 Handoff Recipients

| Role | Responsibilities | Priority |
|------|------------------|----------|
| **@bmad-core-bmad-master** | Orchestrate phases, update workflow status | Ongoing |
| **@bmad-bmm-architect** | Review store architecture, approve splits | Phase 1 |
| **@bmad-bmm-dev** | Implement FC-01 through FC-05, then 32-1 through 32-5 | Phase 1-3 |
| **@bmad-bmm-tea** | Define test strategy, run Sweeping Validation | All phases |
| **@bmad-bmm-pm** | Update sprint backlog, track velocity | All phases |

### 5.3 Module Builder Integration

**Create New Module:** `architectural-consolidation-module`

Using `@bmad-bmb-agents-module-builder` → `@bmad-bmb-workflows-create-module`:

```yaml
module_name: architectural-consolidation
description: "Systematic module for architectural refactoring with embedded validation"
agents:
  - store-splitter: "Splits god-class stores into focused modules"
  - event-bus-wirer: "Connects stores via event bus pattern"
  - validation-runner: "Executes Sweeping Validation checklist"
workflows:
  - split-store: "Workflow to split a 300+ LOC store"
  - wire-events: "Workflow to add event emissions to store actions"
  - validate-level: "Workflow to run specific Sweeping Validation level"
```

### 5.4 Workflow Builder Integration

**Create New Workflows:** Using `@bmad-bmb-agents-workflow-builder` → `@bmad-bmb-workflows-create-workflow`:

#### Workflow 1: `split-store`
```yaml
name: split-store
description: "Split a god-class store into multiple focused stores"
input_patterns:
  - source_store: "Path to store file to split"
  - target_dir: "Directory for new stores"
steps:
  1. Analyze current store responsibilities
  2. Identify split boundaries (CRUD, events, state)
  3. Generate new store files
  4. Update barrel exports
  5. Run TypeScript check
  6. Run Sweeping Validation Level 2
validation: "embedded:sweeping-validation/level-2"
```

#### Workflow 2: `wire-events`
```yaml
name: wire-events
description: "Add event bus integration to store actions"
steps:
  1. Load store file
  2. Identify state-mutating actions
  3. Add event emissions for each action
  4. Add subscriptions for cross-store dependencies
  5. Run integration test
validation: "embedded:sweeping-validation/level-4"
```

### 5.5 Success Criteria

| Phase | Gate | Pass Criteria |
|-------|------|---------------|
| Phase 0 | Showcase Demo | Build passes, provider config works, chat works |
| Phase 1 | Foundation | FC-01 to FC-05 complete, Sweeping L1-L2 pass |
| Phase 2 | Integration | CW-01 to CW-04 complete, Sweeping L3-L6 pass |
| Phase 3 | EPIC-32 | All 5 stories complete, RAG search works |
| Phase 4 | Hygiene | All files <300 LOC, Sweeping L1-L12 pass, 3-Device Rule |

---

## Section 6: Embedded Validation Reference

### 6.1 Sweeping Validation Checklist Integration

The following validation checklist from `_bmad-output/validation/sweeping-validation.md` MUST be executed at each phase gate:

#### Phase 1 Gates (L1-L2)

**🔴 LEVEL 1: STATE INTEGRITY**
- [ ] No Dual-Source State Leaks
- [ ] Persist Middleware Naming Collision
- [ ] Selector Hydration Race Conditions
- [ ] State Flow Completeness

**🟠 LEVEL 2: CODE HYGIENE**
- [ ] No Unused Imports
- [ ] No Orphaned Event Listeners
- [ ] No Dead Code Branches
- [ ] No Duplicate Utilities

#### Phase 2 Gates (L3-L6)

**🟡 LEVEL 3: NAMING CONSISTENCY**
- [ ] Prop Naming Standardization
- [ ] Boolean Prop Unification
- [ ] Event Handler Convention
- [ ] API Response Shape Stability

**🟢 LEVEL 4: DEPENDENCY SANITY**
- [ ] No Circular Imports
- [ ] Barrel Export Compliance
- [ ] Component Decoupling
- [ ] Store Cross-Import Prevention

**🔵 LEVEL 5: INTEGRATION REALITY**
- [ ] FSA Handle Lifecycle
- [ ] WebContainer Boot Guards
- [ ] IndexedDB Quota Handling
- [ ] API Key Validation

**⚫ LEVEL 6: ARCHITECTURE COMPLIANCE**
- [ ] Layer Boundaries Enforced
- [ ] Tool Approval Integrity
- [ ] Agent Context Injection
- [ ] Streaming Buffer Compliance

#### Phase 4 Final Gate (L1-L12)

All 12 levels must pass + 3-Device Rule test.

---

## Section 7: EPIC-32 Alignment

### 7.1 Reference Documents

| Document | Path | Purpose |
|----------|------|---------|
| PM Handoff | `_bmad-output/handoffs/pm-epic-32-sprint-planning-2025-12-31.md` | Sprint planning brief |
| Implementation Playbook | `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md` | Technical specifications |
| RAG Pipeline Report | `_bmad-output/research-artifacts/rag-pipeline-optimization-report-2025-12-31.md` | Orama WASM details |

### 7.2 EPIC-32 Dependency Chain

```
Phase 1 Foundation → EPIC-32 Execution → Knowledge Synthesis Feature
         ↓                    ↓                     ↓
    FC-01 to FC-05       32-1 to 32-5          User Journey
         ↓                    ↓                     ↓
    Store splits         RAG Pipeline          AI generates
    Event bus            Hybrid Search         study materials
    Credential vault     Citation tracking     from user docs
```

### 7.3 Key Technical Decisions (from Playbook)

| Decision | Choice | Confidence |
|----------|--------|------------|
| Vector Store | Orama WASM | 92% |
| Embeddings | Transformers.js (all-MiniLM-L6-v2) | 88% |
| Search Strategy | Hybrid (RRF Fusion) | 90% |
| LLM Provider | Google Gemini 2.0/2.5 | 90% |

---

## Section 8: Approval Request

### 8.1 Summary

This Sprint Change Proposal addresses critical governance misalignment discovered during project health assessment. The recommended approach creates a systematic 4-phase path to:

1. ✅ Fix immediate build issues
2. 🔨 Establish solid architectural foundation
3. 🔗 Enable cross-workspace feature sharing
4. 🧠 Execute EPIC-32 (Knowledge Synthesis RAG)
5. 🧹 Achieve 100% Sweeping Validation pass

### 8.2 User Decision Required

**Do you approve this Sprint Change Proposal?**

| Option | Action |
|--------|--------|
| **[A] Approve** | Proceed with implementation, update workflow status |
| **[E] Edit** | Provide specific feedback for revision |
| **[D] Defer** | Postpone decision, continue with showcase focus only |

### 8.3 Next Steps on Approval

1. Update `bmm-workflow-status.yaml` with new phases
2. Create `architectural-consolidation-module` via module-builder
3. Create `split-store` and `wire-events` workflows via workflow-builder
4. Begin Phase 1 execution (FC-01: Split provider-models-store)
5. Schedule daily sweeping validation runs

---

**Proposal Generated:** 2025-12-31T16:45:00+07:00  
**Workflow:** `/bmad-bmm-workflows-correct-course`  
**BMAD Master** 🧙
