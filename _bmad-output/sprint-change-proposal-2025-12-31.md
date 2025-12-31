---
date: 2025-12-31
time: 09:25:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
handoff_to: bmad-bmm-architect, bmad-bmm-dev
approval_status: PENDING
change_scope: MAJOR
workflow: correct-course
---

# Sprint Change Proposal
## Architectural Consolidation & Knowledge Synthesis Showcase

**Version:** 1.0  
**Date:** 2025-12-31  
**Author:** BMad Master (Orchestrator)  
**Status:** Awaiting Approval  
**Change Scope:** MAJOR (Fundamental Architecture Restructuring)

---

## Section 1: Issue Summary

### 1.1 Problem Statement

The Project Alpha codebase has accumulated **significant architectural fragmentation** across multiple layers:

1. **State Management Spaghetti:** 45+ files in `src/lib/state/` + 8 files in `src/stores/` with overlapping responsibilities, unclear boundaries, and inconsistent persistence patterns
2. **Component Orphanage:** Results from EPICs 6, 7, 8, 9, 10, 26 have introduced components that are not wired into the system
3. **LLM Provider Configuration:** Not centralized, not reactive, not persistent across workspaces
4. **Agent Configuration Vault:** Needs heavy refactoring for centralization and tool binding
5. **Chat/Thread Management:** Inconsistent across workspaces, lacking single-source-of-truth
6. **Brownfield Integration Gaps:** FileTree, Monaco, WebContainer, Terminal not integrated into Knowledge Synthesis workspace
7. **Code Hygiene Violations:** 300+ line components, "god classes", 3+ functions per module

### 1.2 Triggering Context

- **Discovery:** End of Phase 2 stabilization (Ralph Loop iteration 178)
- **Evidence:** User-reported fragmentation impacting development velocity
- **Deadline:** Knowledge Synthesis Space showcase required by **January 1, 2025** (~22 hours)

### 1.3 Core Problem Categories

| Category | Severity | Impact Area |
|----------|----------|-------------|
| **Data Flow Fragmentation** | CRITICAL | Cross-workspace state, persistence |
| **Component Wiring Gaps** | HIGH | Orphaned UI components from multiple EPICs |
| **LLM/Agent Config Chaos** | HIGH | Provider management, model selection, agent binding |
| **Chat Flow Inconsistency** | MEDIUM | Thread management, context management |
| **Code Hygiene Debt** | MEDIUM | Maintainability, testability |

---

## Section 2: Impact Analysis

### 2.1 Epic Impact Assessment

| Epic | Current Status | Impact Level | Action Required |
|------|----------------|--------------|-----------------|
| **Epic 2: AI Chat** | DONE | HIGH | Refactor stores for reactivity |
| **Epic 6: File Management** | DONE | MEDIUM | Wire to Knowledge workspace |
| **Epic 7: Terminal Integration** | DONE | LOW | Wire to Knowledge workspace |
| **Epic 8: Git Integration** | DONE | LOW | No immediate action |
| **Epic 9: Agent Tools** | DONE | HIGH | Refactor tool permission wiring |
| **Epic 10: Deep Think** | DONE (Story 10-1 only) | HIGH | Complete deferred stories |
| **Epic 21: Brownfield Discovery** | DONE | MEDIUM | Update documentation |
| **Epic 22: Production Hardening** | IN_PROGRESS | LOW | Continue as planned |
| **Epic 23: UX Modernization** | IN_PROGRESS | HIGH | Integrate with this proposal |
| **Epic 24: Settings & Config** | DONE | HIGH | Extend for provider management |
| **Epic 26: Notes Enhancement** | DONE | MEDIUM | Complete Story 26-5 (deferred) |
| **Epic 29: RAG Infrastructure** | DONE | HIGH | Wire to Knowledge workspace |
| **Epic 31: Intelligent Agent** | DONE | HIGH | Wire preferences to all agents |

### 2.2 Artifact Impact Assessment

#### Architecture Document Impact

| Section | Current State | Required Changes |
|---------|---------------|------------------|
| **4.2 Data Architecture** | Describes Zustand+Dexie pattern | ADD: Layer boundaries, cross-workspace communication |
| **4.3 Security** | Credential Vault complete | ADD: Provider configuration security notes |
| **4.4 Agent System** | 5-Layer system described | ADD: Knowledge synthesis context injection |
| **Cross-Cutting Concerns** | Incomplete | ADD: State flow diagrams, store relationships |

#### PRD Impact

| Section | Change Type | Description |
|---------|-------------|-------------|
| **FR-STATE** | EXTEND | Add cross-workspace reactivity requirements |
| **FR-AGENT** | EXTEND | Add provider/model hot-switching requirements |
| **FR-UI** | EXTEND | Add workspace switcher for Knowledge Synthesis |

#### UX Design Impact

| Component | Change Type | Description |
|-----------|-------------|-------------|
| **Agent Selector** | UNIFY | Single component pattern across workspaces |
| **Provider Configuration** | CONSOLIDATE | Centralize in settings with workspace reactivity |
| **Chat Panel** | STANDARDIZE | Same component across IDE/Knowledge/Notes |
| **Navigation** | ADD | Knowledge Synthesis workspace switcher |

---

## Section 3: Recommended Approach

### 3.1 Selected Strategy: AGGRESSIVE PROGRESSIVE

**Option Selected:** Hybrid - Showcase-First + Systematic Refactoring

| Phase | Timeline | Focus | Deliverables |
|-------|----------|-------|--------------|
| **Phase 0: Showcase Critical** | Today (Dec 31) | Knowledge Synthesis UI ready | LLM Provider reactivity, Agent selector wiring |
| **Phase 1: Foundation** | Jan 1-3 | Core consolidation | Store reorganization, API contracts |
| **Phase 2: Full Scope** | Jan 4-10 | Complete refactoring | Full layer architecture, testing |

### 3.2 Justification

- **No Trade-offs:** Complete architectural consolidation happens, just sequenced
- **Showcase Deadline Met:** Knowledge Synthesis Space functional by tomorrow
- **Risk Mitigation:** Incremental changes prevent regression
- **Quality Maintained:** Each phase has validation gates

---

## Section 4: Detailed Change Proposals

### 4.1 Phase 0: Showcase Critical (TODAY - Priority 1)

#### Proposal 4.1.1: LLM Provider Reactivity

**File:** `src/stores/provider-models-store.ts`  
**Section:** State definition and persistence

**OLD:**
```typescript
// Current: Provider state scattered, not reactive across workspaces
export const useProviderModelsStore = create<ProviderModelsState>()(
  persist(
    (set, get) => ({
      providers: {},
      selectedProviderId: 'openai',
      selectedModelId: null,
      // ... actions
    }),
    {
      name: 'provider-models-storage',
      // localStorage persistence only
    }
  )
)
```

**NEW:**
```typescript
// Target: Unified reactive store with Dexie persistence + event emission
import { createDexieStorage } from '@/lib/state/dexie-storage';
import EventEmitter from 'eventemitter3';

export const providerEvents = new EventEmitter();

export const useProviderModelsStore = create<ProviderModelsState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        providers: {
          openrouter: { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', isHardcoded: true },
          anthropic: { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', isHardcoded: true },
          google: { id: 'google', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', isHardcoded: true },
          openai: { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', isHardcoded: true },
        },
        selectedProviderId: 'openai',
        selectedModelId: null,
        customProviders: [],
        
        // CRITICAL: Event emission for cross-workspace reactivity
        setApiKey: async (providerId, apiKey) => {
          set((state) => ({
            providers: {
              ...state.providers,
              [providerId]: { ...state.providers[providerId], hasApiKey: true }
            }
          }));
          // Persist encrypted
          await credentialVault.storeCredentials(providerId, apiKey);
          // EMIT: Trigger model loading across all workspaces
          providerEvents.emit('provider:key-set', { providerId });
        },
        
        // NEW: Add custom OpenAI-compatible provider
        addCustomProvider: (name, baseUrl, headers = {}) => {
          const id = `custom-${Date.now()}`;
          set((state) => ({
            customProviders: [...state.customProviders, { id, name, baseUrl, headers, isHardcoded: false }]
          }));
          return id;
        },
      }),
      {
        name: 'provider-models-storage',
        storage: createDexieStorage('providerModels'),
        partialize: (state) => ({
          selectedProviderId: state.selectedProviderId,
          selectedModelId: state.selectedModelId,
          customProviders: state.customProviders,
        }),
      }
    )
  )
);
```

**Rationale:** Enables API key to trigger model loading across ALL workspaces immediately.

---

#### Proposal 4.1.2: Agent Selector Unification

**Files Affected:**
- `src/components/agent/AgentSelector.tsx` (existing)
- `src/components/knowledge/KnowledgePage.tsx` (wire in)
- `src/components/study/StudyPage.tsx` (wire in)
- `src/components/notes/NotePage.tsx` (wire in)

**OLD:**
```tsx
// KnowledgePage.tsx - No agent selector, uses hardcoded defaults
export function KnowledgePage() {
  // ... no agent selection UI
}
```

**NEW:**
```tsx
// KnowledgePage.tsx - Unified agent selector with workspace variant
import { AgentSelector } from '@/components/agent/AgentSelector';

export function KnowledgePage() {
  return (
    <div className="knowledge-page">
      {/* Agent selector in workspace header */}
      <header className="flex items-center gap-4 p-4 border-b">
        <AgentSelector variant="compact" workspaceType="knowledge" />
        {/* ... other header content */}
      </header>
      {/* ... page content */}
    </div>
  );
}
```

**Rationale:** Single agent selector component with `variant` prop for different UI styles, `workspaceType` for conditional tool access.

---

#### Proposal 4.1.3: Chat Panel Standardization

**File:** `src/components/chat/ChatPanel.tsx`  
**Section:** Workspace-agnostic chat component

**Change:** Extract workspace-agnostic ChatPanel that can be embedded in any workspace

**NEW Export:**
```typescript
// src/components/chat/index.ts
export { ChatPanel } from './ChatPanel';
export { ChatPanelCompact } from './ChatPanelCompact';  // NEW: For knowledge/study
export { useChatContext } from './ChatContext';          // NEW: Shared context hook
```

---

### 4.2 Phase 1: Foundation (Jan 1-3)

#### Proposal 4.2.1: Store Reorganization

**Current Structure (Fragmented):**
```
src/stores/           <- 8 stores (cross-workspace)
src/lib/state/        <- 45+ files (mixed responsibility)
```

**Target Structure (Layered):**
```
src/stores/                              <- Global stores only
├── core/
│   ├── provider-store.ts               <- LLM providers (unified)
│   ├── agent-store.ts                  <- Agent configuration
│   └── config-store.ts                 <- App configuration
├── workspace/
│   ├── ide-store.ts                    <- IDE workspace state
│   ├── knowledge-store.ts              <- Knowledge workspace state
│   ├── study-store.ts                  <- Study workspace state
│   └── notes-store.ts                  <- Notes workspace state
├── feature/
│   ├── chat-store.ts                   <- Chat/conversation (cross-workspace)
│   ├── file-store.ts                   <- File operations (cross-workspace)
│   └── rag-store.ts                    <- RAG operations
└── index.ts                            <- Barrel exports
```

#### Proposal 4.2.2: Data Flow Contracts

**Pattern:** Unidirectional data flow with event bus for cross-store communication

```typescript
// src/lib/events/store-events.ts
export const storeEvents = new EventEmitter();

// Event types
export const EVENTS = {
  PROVIDER_KEY_SET: 'provider:key-set',
  PROVIDER_MODELS_LOADED: 'provider:models-loaded',
  AGENT_SELECTED: 'agent:selected',
  AGENT_UPDATED: 'agent:updated',
  CONVERSATION_CREATED: 'conversation:created',
  FILE_SYNCED: 'file:synced',
} as const;

// Cross-store coordination
storeEvents.on(EVENTS.PROVIDER_KEY_SET, async ({ providerId }) => {
  // Trigger model loading in provider store
  useProviderModelsStore.getState().loadModelsForProvider(providerId);
});
```

---

### 4.3 Phase 2: Full Scope (Jan 4-10)

#### Proposal 4.3.1: Clean Architecture Implementation

**Target:** Maximum 120 lines per component, no god classes

**Refactoring Strategy:**
1. Identify files > 300 lines
2. Extract concerns into separate modules
3. Use composition patterns
4. Apply interface segregation

**Priority Files for Refactoring:**
| File | Current Lines | Target | Strategy |
|------|---------------|--------|----------|
| `dexie-db.ts` | ~700 | <200 | Split by table |
| `rag-store.ts` | ~800 | <200 | Extract services |
| `conversation-store.ts` | ~600 | <200 | Extract hooks |
| `knowledge-store.ts` | ~550 | <200 | Extract services |
| `canvas-store.ts` | ~400 | <200 | Extract actions |

#### Proposal 4.3.2: API Contract Enforcement

**Pattern:** Zod schemas at layer boundaries

```typescript
// src/lib/contracts/provider-contracts.ts
import { z } from 'zod';

export const ProviderConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string().url(),
  isHardcoded: z.boolean(),
  hasApiKey: z.boolean().optional(),
  models: z.array(ModelSchema).optional(),
});

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  contextWindow: z.number(),
  inputModalities: z.array(z.enum(['text', 'image', 'audio'])),
  outputModalities: z.array(z.enum(['text', 'image', 'audio'])),
});
```

---

## Section 5: Implementation Handoff

### 5.1 Change Scope Classification

**Classification: MAJOR**

- Fundamental architecture restructuring required
- Multiple Epic impacts
- Cross-cutting concerns across all layers

### 5.2 Handoff Recipients

| Role | Responsibility | Phase |
|------|----------------|-------|
| **@bmad-bmm-architect** | Validate architecture changes, update ADRs | Phase 0-1 |
| **@bmad-bmm-dev** | Implement Phase 0 showcase features | Phase 0 (TODAY) |
| **@bmad-bmm-sm** | Update sprint-status.yaml, track progress | All Phases |
| **@bmad-bmm-ux-designer** | Review UI component unification | Phase 1-2 |

### 5.3 Success Criteria

**Phase 0 (Today - Showcase):**
- [ ] LLM Provider configuration reactive across workspaces
- [ ] Agent selector visible in Knowledge Synthesis workspace
- [ ] Chat panel functional in Knowledge Synthesis workspace
- [ ] Provider → Model → Agent flow working end-to-end

**Phase 1 (Jan 1-3):**
- [ ] Store structure reorganized per proposal
- [ ] Event bus implemented for cross-store communication
- [ ] Data flow contracts documented

**Phase 2 (Jan 4-10):**
- [ ] All files under 300 lines (code hygiene)
- [ ] API contracts enforced at boundaries
- [ ] Full test coverage for refactored stores
- [ ] Documentation updated (AGENTS.md, architecture.md)

---

## Section 6: BMAD Workflow Deliverable

### 6.1 Proposed Workflow: `architectural-consolidation`

After approval, a reusable BMAD workflow will be created:

**Workflow Name:** `_bmad/bmm/workflows/4-implementation/architectural-consolidation/workflow.yaml`

**Purpose:** Systematic refactoring workflow for:
1. Layer boundary enforcement
2. Store consolidation
3. Component wiring audit
4. Code hygiene validation

**Agents Involved:**
- `@bmad-bmm-architect` - Architecture review
- `@bmad-bmm-dev` - Implementation
- `@bmad-bmm-tea` - Testing validation
- `@code-reviewer` - Quality gates

---

## Section 7: Approval Request

**BMad Master requests explicit approval for this Sprint Change Proposal.**

### Options:
- **[APPROVE]** - Proceed with Phase 0 immediately, followed by Phases 1-2
- **[APPROVE-PHASE-0-ONLY]** - Proceed with showcase priority only, defer remaining phases
- **[REVISE]** - Provide feedback for proposal modifications
- **[REJECT]** - Cancel change proposal

---

---

## Section 8: Integrated Validation Framework

### 8.1 Story Development Cycle Integration

Each implementation task in this proposal will follow the **`/story-dev-cycle`** workflow with the following gates:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SM Agent                          Dev Agent                                │
│  ─────────                         ─────────                                │
│  create-story ──► validate ──► create-context ──► validate                  │
│                                         │                                   │
│                                         ▼                                   │
│                                    dev-story ──► code-review ──► done       │
│                                         │              │                    │
│                                         └──── loop ────┘                    │
│                                                                             │
│  [VALIDATION] ──► sweeping-validation ──► 12-level-gates ──► CERTIFIED     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Sweeping Validation Checkpoints (Post Each Phase)

**Critical checkpoints from `sweeping-validation.md` to be applied after EACH phase:**

#### Phase 0 Checkpoints (Showcase Critical)

| Level | Checkpoint | Validation Method |
|-------|------------|-------------------|
| **L1: State Integrity** | LLM Provider reactivity → no dual-source state | `Change setting → ALL UI updates` |
| **L1: State Integrity** | Agent selection → persists across navigation | `Select agent → Navigate → Return → Same agent` |
| **L2: Code Hygiene** | No unused imports in new files | `pnpm build → 0 errors` |
| **L3: Naming Consistency** | `providerId`, `agentId` everywhere | `grep -rE "(providerId\|providerUUID)" src/` |
| **L5: Integration Reality** | Provider API key → models load | `Set key → Models appear in selector` |
| **L6: Architecture Compliance** | No direct `db.` access in components | `grep -r "await db\." src/components/` |

#### Phase 1 Checkpoints (Foundation)

| Level | Checkpoint | Validation Method |
|-------|------------|-------------------|
| **L4: Dependency Sanity** | No circular imports in stores | `pnpm madge --circular src/stores/` |
| **L6: Architecture Compliance** | Event bus pattern enforced | All cross-store communication via events |
| **L9: Performance** | Store hydration < 100ms | `Performance.mark()` measurement |

#### Phase 2 Checkpoints (Full Scope)

| Level | Checkpoint | Validation Method |
|-------|------------|-------------------|
| **L2: Code Hygiene** | All files < 300 lines | Automated script check |
| **L3: Naming Consistency** | Event handler convention | `handle{Event}` internal, `on{Event}` props |
| **L12: Test Coverage** | > 80% coverage on refactored stores | `pnpm test --coverage` |

### 8.3 12-Level Framework Integration

**Gate progression for this architectural change:**

| Gate | Levels | Phase | Validation Artifacts |
|------|--------|-------|---------------------|
| **Gate 1: Foundation** | 1-5 | Phase 0 Complete | Functional + Architectural compliance |
| **Gate 2: Development** | 6-8 | Phase 1 Complete | Test coverage + Documentation |
| **Gate 3: Deployment** | 9-11 | Phase 2 Complete | Demo ready + UAT criteria |
| **Gate 4: BMAD** | 12 | All Phases | Full BMAD compliance |

**Gate Status Tracking:**

```yaml
validation_gates:
  level_1_functional_completeness:
    status: "PENDING"
    target_phase: "Phase 0"
    checkpoints:
      - "Provider reactivity works"
      - "Agent selector in all workspaces"
      - "Chat panel unified"
    
  level_2_architectural_compliance:
    status: "PENDING"
    target_phase: "Phase 0"
    checkpoints:
      - "Store layer boundaries enforced"
      - "Event bus pattern implemented"
      - "No direct db access in components"
    
  level_3_implementation_patterns:
    status: "PENDING"
    target_phase: "Phase 1"
    checkpoints:
      - "Zustand store patterns consistent"
      - "API contracts defined with Zod"
      - "Error handling patterns established"
    
  level_6_test_coverage:
    status: "PENDING"
    target_phase: "Phase 2"
    checkpoints:
      - "> 80% coverage on stores"
      - "Integration tests for cross-store flow"
      - "E2E for provider → model → agent flow"
    
  level_12_bmad_compliance:
    status: "PENDING"
    target_phase: "All Phases"
    checkpoints:
      - "Guardrails enforced"
      - "Checklists completed"
      - "Handoff artifacts created"
```

### 8.4 Anti-Drift Protocol

**To prevent gaps and drift, each phase includes:**

1. **Pre-Implementation Research (MCP Tools)**
   ```xml
   <research_requirements>
     <tool>Context7</tool>
     <query>Zustand persist middleware cross-tab sync</query>
     <purpose>Validate store reactivity pattern</purpose>
   </research_requirements>
   ```

2. **Context XML Generation**
   - Every story gets a `{story}-context.xml` with:
     - Current code state
     - Research findings
     - Architecture patterns to follow
     - Dependencies

3. **Post-Implementation Validation**
   - Sweeping validation checkpoints
   - 12-level gate progression
   - Ralph Loop iteration

4. **Handoff Artifact**
   ```markdown
   ## 📋 PHASE COMPLETE: {phase_name}
   
   **Artifacts Updated:**
   - ✅ {file_paths}
   
   **Validation Status:**
   - Sweeping: {level_count}/12 passed
   - 12-Level Gate: {gate_name}
   - Ralph Loop: Iteration {N}
   
   **Next Phase:**
   - Agent: {next_agent}
   - Workflow: {next_workflow}
   ```

### 8.5 Decay Detection Integration

From `sweeping-validation.md`, monitor architectural decay:

| Story Count | Rot Level | Action Required |
|-------------|-----------|-----------------|
| 0-5 | Green | Continue development |
| 6-10 | Yellow | Run full audit |
| 11-15 | Orange | STOP → Fix state split |
| 16-20 | Red | STOP → Fix circular imports |
| 21+ | Critical | STOP → Refactor required |

**This Proposal Scope:** ~15-20 files touched across 3 phases  
**Expected Rot Level:** Yellow to Orange  
**Mitigation:** Built-in validation gates after each phase

### 8.6 Brutal 3-Device Rule

**Phase 0 Showcase MUST pass on:**

1. **Desktop Chrome (macOS)** - Full functionality
   - Provider config → Models load
   - Agent selector visible in Knowledge workspace
   - Chat works with streaming

2. **Mobile Safari (iOS 16+)** - Demo mode
   - Knowledge page loads (no WebContainer)
   - Agent selector visible
   - Chat functional

3. **Android Chrome** - Demo mode
   - Same as Mobile Safari
   - Touch targets ≥ 44×44px

**If ANY device fails → Phase 0 is NOT done.**

---

## Section 9: Workflow Creation Deliverable

### 9.1 Proposed Workflow: `architectural-consolidation`

**File:** `_bmad/bmm/workflows/4-implementation/architectural-consolidation/workflow.yaml`

```yaml
name: architectural-consolidation
description: >
  Systematic refactoring workflow for layer boundary enforcement, 
  store consolidation, component wiring audit, and code hygiene validation.
  Integrates story-dev-cycle, sweeping-validation, and 12-level framework.

version: 1.0
author: bmad-core-bmad-master
created: 2025-12-31

inputs:
  - name: sprint_change_proposal
    pattern: "_bmad-output/sprint-change-proposal-*.md"
    required: true
  - name: epics
    pattern: "_bmad-output/epics.md"
    required: true
  - name: architecture
    pattern: "_bmad-output/project-planning-artifacts/architecture.md"
    required: true

outputs:
  - name: validation_report
    path: "_bmad-output/validation/architectural-consolidation-{date}.md"
  - name: updated_stores
    path: "src/stores/**/*.ts"
  - name: updated_components
    path: "src/components/**/*.tsx"

agents:
  orchestrator: "@bmad-core-bmad-master"
  architect: "@bmad-bmm-architect"
  developer: "@bmad-bmm-dev"
  reviewer: "@code-reviewer"
  tester: "@bmad-bmm-tea"

phases:
  phase_0:
    name: "Showcase Critical"
    stories:
      - "Provider Store Reactivity"
      - "Agent Selector Unification"
      - "Chat Panel Standardization"
    validation:
      - sweeping_levels: [1, 2, 3, 5, 6]
      - 12_level_gate: 1
    device_test: true
    
  phase_1:
    name: "Foundation"
    stories:
      - "Store Reorganization"
      - "Event Bus Implementation"
      - "Data Flow Contracts"
    validation:
      - sweeping_levels: [1, 2, 3, 4, 5, 6, 7]
      - 12_level_gate: 2
    device_test: false
    
  phase_2:
    name: "Full Scope"
    stories:
      - "Code Hygiene Sweep"
      - "API Contract Enforcement"
      - "Test Coverage Completion"
    validation:
      - sweeping_levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      - 12_level_gate: 4
    device_test: true

workflow_loop:
  entry: "phase_0.stories[0]"
  cycle: "story-dev-cycle"
  validation: "sweeping-validation + 12-level-gates"
  exit_condition: "all phases complete AND all gates passed"
```

### 9.2 Integration with Existing Workflows

This workflow integrates with:

| Existing Workflow | Integration Point | Purpose |
|-------------------|-------------------|---------|
| `/story-dev-cycle` | Each story execution | Research, context, dev, review |
| `/code-review` | Post-implementation | Quality gates |
| `sweeping-validation.md` | Post-phase validation | 12-level checks |
| `12-level-framework` | Gate progression | Enterprise quality gates |

---

**Document Generated:** 2025-12-31T09:25:00+07:00  
**Workflow:** `_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml`  
**BMad Master Orchestration Session**  
**Validation Integration:** sweeping-validation.md, 12-level-framework-integration-2025-12-29.md, /story-dev-cycle
