---
name: Sprint Change Proposal - ARC Module Gaps
description: Corrective action plan for addressing ARC Module gaps identified during validation
version: 1.0.0
author: @bmad-bmm-pm
created: 2025-12-31T22:15:00+07:00
phase: Correct Course - Sprint Planning
status: Pending Approval
governance_level: Project Planning
---

# Sprint Change Proposal: ARC Module Gap Remediation

**Document ID:** `SCP-ARC-GAPS-2025-12-31`  
**Created:** 2025-12-31T22:15:00+07:00  
**Author:** @bmad-bmm-pm (Product Manager)  
**Status:** Pending Approval  

---

## Executive Summary

### ARC Module Validation Results

The ARC (Architecture Refactoring & Consolidation) Module has completed validation with a **CONDITIONAL PASS score of 87/100**. While core functionality is operational, comprehensive analysis against original requirements reveals critical gaps requiring immediate attention.

| Dimension | Score | Status |
|-----------|-------|--------|
| LLM Provider Configuration | 92% | ✅ COMPLETE |
| Agent Configuration System | 85% | ⚠️ PARTIAL |
| Event-Driven Reactivity | 88% | ⚠️ PARTIAL |
| Clean Architecture | 90% | ✅ COMPLETE |
| Brownfield Integration | 82% | ⚠️ PARTIAL |
| Cross-Workspace Services | 80% | ⚠️ PARTIAL |
| Code Hygiene | 95% | ✅ COMPLETE |
| **OVERALL** | **87%** | **CONDITIONAL PASS** |

### Critical Gaps Requiring Action

| Priority | Gap | Impact | Estimated Effort |
|----------|-----|--------|------------------|
| **P0** | Missing `workspacePermissions` and `workspaceBindings` fields | Breaks per-workspace tool access control | 2-3 days |
| **P1** | Context summarization not implemented | Limits conversation context for long chats | 3-4 days |
| **P1** | AgentConfigDialog.tsx refactoring (1089 LOC) | Technical debt, maintainability issues | 5-7 days |
| **P2** | Workspace UI variants | Future requirement for Knowledge Synthesis | Sprint 3-4 |
| **P2** | BlockNote integration | Future requirement for rich text editing | Sprint 3-4 |
| **P2** | Bidirectional sync | Future requirement for cross-workspace sync | Sprint 3-4 |

---

## Section 1: Impact Analysis on Current Epics

### 1.1 Affected Governance Documents

This proposal references and may impact the following controlled documents:

| Document | Purpose | Impact Level |
|----------|---------|--------------|
| [`architecture.md`](../architecture.md) | System architecture decisions | May require ADR updates |
| [`prd.md`](../prd.md) | Product requirements definition | No changes needed |
| [`epics.md`](../../epics.md) | Epic breakdown and dependencies | New stories to add |
| [`ux-design-specification.md`](../ux-design-specification.md) | UX/UI design requirements | May require updates for P2 |

### 1.2 Impact on Active Epics

#### Epic 24: Performance & UX Optimization

**Current Status:** IN_PROGRESS  
**Impact:** HIGH

The P0 gaps directly affect the agent configuration architecture:
- **Story 24-1:** File metadata cache - Not affected
- **Story 24-2:** FSA handle persistence - Not affected
- **Story 24-3:** Conversation auto-restore - Not affected
- **Story 24-4:** Tool context preservation - **AFFECTED** (depends on workspacePermissions)
- **Story 24-5:** Session snapshots - Not affected

**Recommendation:** Proceed with Stories 24-1, 24-2, 24-5. Pause 24-3, 24-4 until P0 gaps resolved.

#### Epic 26: The Brain - Intelligent Knowledge Base

**Current Status:** IN_PROGRESS  
**Impact:** MEDIUM

The workspace bindings gap affects Knowledge workspace integration:
- Agent tools need `workspacePermissions` to enable/disable IDE-only tools in Knowledge workspace
- Cross-workspace services require proper workspace binding configuration

**Recommendation:** Continue Epic 26 development but coordinate with P0 implementation.

#### Epic 29: About Me Redesign

**Current Status:** IN_PROGRESS  
**Impact:** LOW

This epic is independent of ARC Module gaps.

### 1.3 Impact on Upcoming Epics (EPIC-32 through EPIC-37)

| Epic | Name | P0 Impact | P1 Impact |
|------|------|-----------|-----------|
| EPIC-32 | RAG Infrastructure | None | Medium (context summarization) |
| EPIC-33 | Agent Integration | High (workspace bindings) | High |
| EPIC-34 | Image Understanding | None | None |
| EPIC-35 | Document Processing | None | None |
| EPIC-36 | Adaptive Learning | None | Medium |
| EPIC-37 | Study Artifact Generation | None | None |

**Recommendation:** Prioritize EPIC-32 and EPIC-33 for sprint planning after P0 gaps resolved.

---

## Section 2: Proposed New Stories for P0/P1 Gaps

### 2.1 P0 Stories (Immediate - Sprint Planning Required)

#### Story ARC-P0-1: Add workspacePermissions to AgentToolBinding

**Story ID:** `ARC-P0-1`  
**Priority:** P0  
**Estimated Effort:** 1 day  
**Owner:** @bmad-bmm-dev  

**User Story:**
As an Agent Developer, I want to define which workspaces (IDE, Knowledge, Study, Notes) each tool is available in, so that agents can have different capabilities in different contexts.

**Acceptance Criteria:**
- [ ] `AgentToolBinding.workspacePermissions` interface added to `agents-store.ts`
- [ ] Structure includes `ide`, `knowledge`, `study`, `notes` boolean fields
- [ ] Default values set to `true` for all workspaces (backward compatible)
- [ ] TypeScript compilation passes
- [ ] Unit tests added for permission checking logic

**Technical Implementation:**
```typescript
export interface AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    notes: boolean;
  };
  configuration?: Record<string, unknown>;
}
```

**Files Affected:**
- `src/stores/agents-store.ts`
- `src/lib/agent/types/index.ts`

---

#### Story ARC-P0-2: Add workspaceBindings to Agent Type

**Story ID:** `ARC-P0-2`  
**Priority:** P0  
**Estimated Effort:** 1-2 days  
**Owner:** @bmad-bmm-dev  

**User Story:**
As a Workspace Manager, I want to configure which workspaces an agent is available in, so that different agents can be specialized for different contexts (e.g., coding agent for IDE, research agent for Knowledge).

**Acceptance Criteria:**
- [ ] `workspaceBindings` field added to `Agent` interface
- [ ] `WorkspaceBinding` interface defined with `workspaceType`, `isAvailable`, `uiVariant`, `isDefault`
- [ ] UI component updates to respect workspace bindings
- [ ] AgentSelector filters agents by current workspace
- [ ] TypeScript compilation passes

**Technical Implementation:**
```typescript
export interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}

export interface Agent {
  id: string;
  name: string;
  // ... existing fields
  tools: AgentToolBinding[];
  workspaceBindings: WorkspaceBinding[];  // NEW
}
```

**Files Affected:**
- `src/stores/agents-store.ts`
- `src/presentation/components/agent/AgentSelector.tsx`
- `src/lib/agent/types/index.ts`

---

#### Story ARC-P0-3: Implement Workspace-Aware Tool Permission Check

**Story ID:** `ARC-P0-3`  
**Priority:** P0  
**Estimated Effort:** 1 day  
**Owner:** @bmad-bmm-dev  

**User Story:**
As an Agent User, I want tools to be automatically enabled/disabled based on the current workspace, so that I don't see IDE-specific tools when working in the Knowledge workspace.

**Acceptance Criteria:**
- [ ] `useWorkspaceToolPermissions` hook implemented
- [ ] Hook filters available tools based on current workspace
- [ ] Tool approval UI respects workspace permissions
- [ ] Integration test verifies tool visibility per workspace
- [ ] Documentation updated for workspace-specific behavior

**Files Affected:**
- `src/lib/agent/hooks/useWorkspaceToolPermissions.ts` (new)
- `src/presentation/components/chat/ApprovalOverlay.tsx`
- `src/lib/agent/tools/index.ts`

---

### 2.2 P1 Stories (Sprint 2)

#### Story ARC-P1-1: Context Summarization for Long Conversations

**Story ID:** `ARC-P1-1`  
**Priority:** P1  
**Estimated Effort:** 3-4 days  
**Owner:** @bmad-bmm-dev  

**User Story:**
As an AI Agent User, I want the system to summarize long conversation contexts automatically, so that the AI can maintain coherent responses even when conversations exceed the model's context window.

**Acceptance Criteria:**
- [ ] `useContextSummarizer` hook implemented
- [ ] Configurable context window threshold (default: 80% of model limit)
- [ ] Summary generation uses same LLM provider as agent
- [ ] Preserves tool execution history in summary
- [ ] User can toggle summarization on/off
- [ ] Performance test: summarization < 2 seconds for 50 messages

**Technical Implementation:**
- Hook location: `src/lib/agent/hooks/useContextSummarizer.ts`
- Uses existing LLM provider infrastructure
- Integrates with `conversation-store.ts` for message retrieval

---

#### Story ARC-P1-2: AgentConfigDialog.tsx Refactoring

**Story ID:** `ARC-P1-2`  
**Priority:** P1  
**Estimated Effort:** 5-7 days  
**Owner:** @bmad-bmm-dev  

**User Story:**
As a Maintainer, I want AgentConfigDialog.tsx split into smaller, focused components, so that the codebase remains maintainable and new developers can understand the agent configuration system.

**Acceptance Criteria:**
- [ ] Component refactored into 7 sub-components (<300 LOC each):
  - `BasicConfigPanel` - Name, description, system prompt
  - `AdvancedConfigPanel` - Temperature, max tokens, topP
  - `CredentialsPanel` - API key management
  - `ModelSelector` - Provider/model selection with workspace filtering
  - `ToolPermissionsPanel` - Tool binding with workspace permissions
  - `WorkspaceBindingsPanel` - Workspace availability configuration
  - `AgentConfigDialog` (orchestrator) - Main dialog, state management, validation
- [ ] All existing functionality preserved
- [ ] Unit tests for each sub-component
- [ ] Build passes with no TypeScript errors
- [ ] Documentation: `AGENT_CONFIG_DIALOG_REFACTORING.md` updated

**Current State:**
- `AgentConfigDialog.tsx`: 1089 LOC
- Types extracted to `agent-config-dialog-types.ts` (50 LOC) ✅
- Utils extracted to `agent-config-dialog-utils.ts` (40 LOC) ✅

**Files to Create:**
- `src/presentation/components/agent/BasicConfigPanel.tsx`
- `src/presentation/components/agent/AdvancedConfigPanel.tsx`
- `src/presentation/components/agent/CredentialsPanel.tsx`
- `src/presentation/components/agent/ModelSelector.tsx`
- `src/presentation/components/agent/ToolPermissionsPanel.tsx`
- `src/presentation/components/agent/WorkspaceBindingsPanel.tsx`

**Reference:** [`AGENT_CONFIG_DIALOG_REFACTORING.md`](../../../../src/presentation/components/agent/AGENT_CONFIG_DIALOG_REFACTORING.md)

---

### 2.3 P2 Stories (Sprint 3-4 - Future Planning)

| Story ID | Name | Estimated Effort | Dependency |
|----------|------|------------------|------------|
| ARC-P2-1 | Workspace UI Variants | 3-4 days | ARC-P0-2 |
| ARC-P2-2 | BlockNote Integration | 5-7 days | None |
| ARC-P2-3 | Bidirectional Sync | 4-5 days | ARC-P0-3 |
| ARC-P2-4 | Cross-Workspace Event Wiring | 2-3 days | ARC-P0-1, ARC-P0-2 |

**Note:** These stories will be planned in subsequent sprints after P0/P1 completion.

---

## Section 3: Updated Sprint Timeline

### 3.1 Current Sprint Status (as of 2025-12-31)

| Sprint | Focus | Status | Stories |
|--------|-------|--------|---------|
| Sprint 0 | Infrastructure & Pre-Work | COMPLETE | - |
| Sprint 1-5 | Core Stabilization | IN_PROGRESS | Epic 22, 23, 24 (partial) |
| Sprint 6-10 | Knowledge Synthesis | PLANNING | EPIC-32, EPIC-33 |

### 3.2 Proposed Sprint Modifications

#### Sprint 1 Revised (Jan 1-7, 2026)

**Original Focus:** Production Hardening (Epic 22)  
**Revised Focus:** P0 Gap Remediation + Production Hardening

| Story | Original Owner | Revised Owner | Notes |
|-------|---------------|---------------|-------|
| 22-1: Error Boundary Audit | Team A | Team A | Proceed |
| 22-2: Loading States | Team A | Team A | Proceed |
| 22-3: Mobile Polish | Team A | Team A | Proceed |
| **ARC-P0-1** | New | Team B | ADDED |
| **ARC-P0-2** | New | Team B | ADDED |
| **ARC-P0-3** | New | Team B | ADDED |

**Capacity Impact:** Team B capacity reduced by ~3 days for Epic 22 stories.

#### Sprint 2 (Jan 8-14, 2026)

**Original Focus:** Performance Optimization (Epic 24)  
**Revised Focus:** P1 Gap Remediation + Performance

| Story | Estimated Effort | Notes |
|-------|------------------|-------|
| 24-1: File Metadata Cache | 2 days | Proceed |
| 24-2: FSA Handle Persistence | 2 days | Proceed |
| **ARC-P1-1** | 3-4 days | Context Summarization |
| **ARC-P1-2** | 5-7 days | AgentConfigDialog Refactor |

**Note:** Stories 24-3, 24-4 (conversation restore) PAUSED pending P0 completion.

#### Sprint 3-4 (Jan 15-28, 2026)

**Original Focus:** Knowledge Synthesis MVP (EPIC-32, EPIC-33)  
**Revised Focus:** Same, with P2 stories added

| Epic | Stories | P2 Dependencies |
|------|---------|-----------------|
| EPIC-32 | 32-1 through 32-5 | None |
| EPIC-33 | 33-1 through 33-4 | ARC-P0-2 (workspace bindings) |
| ARC-P2-1 | Workspace UI Variants | Deferred to Sprint 4 |
| ARC-P2-2 | BlockNote Integration | Deferred to Sprint 4 |

### 3.3 Gantt Chart Summary

```
Timeline: Jan 2026
          Week 1          Week 2          Week 3          Week 4
          Jan 1-7         Jan 8-14        Jan 15-21       Jan 22-28
─────────────────────────────────────────────────────────────────────
P0 Gaps   [ARC-P0-1/2/3]
            ████████████
            
P1 Gaps                     [ARC-P1-1/2]
                              ████████████████
                              
Epic 22    [22-1/2/3]
             ████████
             
Epic 24    [24-1/2]        [24-5]
             ████           ████
             
EPIC-32                    [Planning]      [32-1/2/3/4/5]
                                           ████████████████
                                           
EPIC-33                    [Planning]      [33-1/2]        [33-3/4]
                                           █████████       █████████

Legend: █ = Active work period
```

---

## Section 4: Resource Allocation Recommendations

### 4.1 Team Capacity Analysis

| Team | Current Sprint 1 | Revised Sprint 1 | Delta |
|------|------------------|------------------|-------|
| **Team A** (UI/Foundation) | 100% | 100% | No change |
| **Team B** (Backend/Agent) | 100% | 75% | -25% (P0 gaps) |

### 4.2 Recommended Reallocation

**Option A: Extend Sprint 1 by 2 days**
- Sprint 1 ends Jan 9 instead of Jan 7
- Maintains scope without reducing Epic 22 coverage
- **Pros:** Full Epic 22 completion, team morale
- **Cons:** Timeline slip, delays EPIC-32

**Option B: Shift Epic 22 stories to Sprint 2**
- Sprint 1: Focus on P0 gaps (Team B)
- Sprint 2: Epic 22 + Epic 24 + P1 gaps
- **Pros:** P0 gaps addressed immediately
- **Cons:** Epic 22 delayed, Sprint 2 overloaded

**Option C: Hybrid Approach (RECOMMENDED)**
- Sprint 1: ARC-P0-1, ARC-P0-2 (3 days) + Epic 22 Stories 22-1, 22-2 (2 days)
- Sprint 2 (extended by 1 day): ARC-P0-3 + P1 gaps + remaining Epic 22
- **Pros:** Balances immediate needs with stability
- **Cons:** Requires careful coordination

**Recommendation:** **Option C** with Sprint 2 extended to Jan 15 (9 days).

### 4.3 Dependency Mapping

```
ARC-P0-1 (workspacePermissions)
    │
    ├──► ARC-P0-2 (workspaceBindings)
    │        │
    │        └──► ARC-P0-3 (tool permission check)
    │                 │
    │                 └──► ARC-P2-3 (bidirectional sync)
    │
    └──► Epic 33-2 (agent-workspace integration)
             │
             └──► Epic 33-3 (cross-workspace context)

ARC-P1-1 (context summarization)
    │
    └──► EPIC-32-4 (hybrid search optimization)

ARC-P1-2 (AgentConfigDialog refactor)
    │
    └──► ARC-P2-1 (workspace UI variants)
```

---

## Section 5: Risk Assessment and Mitigations

### 5.1 Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| P0 gaps block EPIC-33 | Medium | High | Prioritize P0-2 before EPIC-33 planning |
| Sprint 2 overload | High | Medium | Extend Sprint 2 by 1 day, defer non-critical stories |
| AgentConfigDialog refactor scope creep | Medium | Medium | Strict LOC limits, defer UI polish to separate task |
| Context summarization performance | Low | Medium | Benchmark before implementation, configurable thresholds |
| 3-Device Rule testing blocked | High | Low | Document for manual QA, proceed with responsive design |

### 5.2 Rollback Plan

If P0 gap implementation causes regressions:
1. **Immediate:** Revert to pre-P0 state (workspace permissions optional)
2. **Short-term:** Feature flag `workspacePermissions` as opt-in
3. **Long-term:** Complete implementation in Sprint 3

---

## Section 6: Governance Updates Required

### 6.1 Documents to Update

| Document | Update Required | Owner |
|----------|-----------------|-------|
| [`epics.md`](../../epics.md) | Add stories ARC-P0-1 through ARC-P1-2 | @bmad-bmm-pm |
| [`architecture.md`](../architecture.md) | Add ADR for workspace binding architecture | @bmad-bmm-architect |
| `sprint-status.yaml` | Update sprint plan with new stories | @bmad-bmm-pm |
| `bmm-workflow-status.yaml` | Add course correction notes | @bmad-core-bmad-master |

### 6.2 Approval Required

| Role | Approval Required | Date |
|------|-------------------|------|
| @bmad-bmm-architect | Technical feasibility | TBD |
| @bmad-bmm-dev | Implementation capacity | TBD |
| @bmad-core-bmad-master | Final approval | TBD |

---

## Section 7: Success Metrics

### 7.1 Completion Criteria

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Agent workspace permissions | 100% implemented | 0% | P0 gaps |
| AgentConfigDialog LOC | <300 LOC per component | 1089 LOC | Refactor needed |
| Context window management | Auto-summarization | Manual | P1 gap |
| Cross-workspace sync | <100ms latency | N/A | P2 gap |
| Code hygiene score | >95% files <300 LOC | 92% | 3% improvement |

### 7.2 Validation Gates

**Sprint 1 Completion Gate:**
- [ ] ARC-P0-1, ARC-P0-2, ARC-P0-3 completed
- [ ] TypeScript compilation passes (0 errors)
- [ ] Unit test coverage >80% for new code
- [ ] Integration test: tool permissions work per workspace

**Sprint 2 Completion Gate:**
- [ ] ARC-P1-1, ARC-P1-2 completed
- [ ] AgentConfigDialog refactored (7 components <300 LOC)
- [ ] Context summarization functional
- [ ] Build validation passes

---

## Section 8: References and Context Artifacts

### 8.1 Primary Source Documents

| Document | Path |
|----------|------|
| ARC Module Gap Analysis | `_bmad-output/arc-module-gap-analysis-2025-12-31.md` |
| ARC Module LOOP STATE | `_bmad-output/bmb-creations/arc-module/LOOP_STATE.yaml` |
| ARC Module Definition | `_bmad-output/bmb-creations/arc-module/module-definition.md` |
| AgentConfigDialog Refactoring Plan | `src/presentation/components/agent/AGENT_CONFIG_DIALOG_REFACTORING.md` |

### 8.2 Governance Documents

| Document | Path |
|----------|------|
| Architecture | `_bmad-output/project-planning-artifacts/architecture.md` |
| PRD | `_bmad-output/project-planning-artifacts/prd.md` |
| Epic Breakdown | `_bmad-output/epics.md` |
| UX Design Specification | `_bmad-output/project-planning-artifacts/ux-design-specification.md` |

### 8.3 Technical References

| Component | Path |
|-----------|------|
| Agents Store | `src/stores/agents-store.ts` |
| Event Bus | `src/lib/events/store-events.ts` |
| Agent Types | `src/lib/agent/types/index.ts` |

---

## Section 9: Approval and Sign-off

### 9.1 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-31T22:15:00+07:00 | @bmad-bmm-pm | Initial proposal |

### 9.2 Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | @bmad-bmm-pm | Drafted | 2025-12-31 |
| Architect | @bmad-bmm-architect | Pending | TBD |
| Development Lead | @bmad-bmm-dev | Pending | TBD |
| Project Owner | @bmad-core-bmad-master | Pending | TBD |

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-12-31T22:15:00+07:00  
**Next Review:** Upon approval for implementation

---

## Appendix A: Story Templates

### A.1 Story ARC-P0-1 Template

```markdown
# Story: ARC-P0-1 - Add workspacePermissions to AgentToolBinding

## User Story
As an Agent Developer, I want to define which workspaces each tool is available in.

## Acceptance Criteria
- [ ] Interface defined in agents-store.ts
- [ ] Four boolean fields: ide, knowledge, study, notes
- [ ] Default values: all true
- [ ] TypeScript compilation passes
- [ ] Unit tests for permission checking

## Technical Notes
- Location: src/stores/agents-store.ts
- Related: AgentToolBinding interface
- Dependencies: None
```

### A.2 Story ARC-P0-2 Template

```markdown
# Story: ARC-P0-2 - Add workspaceBindings to Agent Type

## User Story
As a Workspace Manager, I want to configure agent availability per workspace.

## Acceptance Criteria
- [ ] workspaceBindings field added to Agent interface
- [ ] WorkspaceBinding interface defined
- [ ] AgentSelector filters by workspace
- [ ] TypeScript compilation passes

## Technical Notes
- Location: src/stores/agents-store.ts
- Dependencies: ARC-P0-1
```

### A.3 Story ARC-P1-2 Template

```markdown
# Story: ARC-P1-2 - AgentConfigDialog.tsx Refactoring

## User Story
As a Maintainer, I want AgentConfigDialog split into focused components.

## Acceptance Criteria
- [ ] 7 sub-components created, each <300 LOC
- [ ] All existing functionality preserved
- [ ] Unit tests for each component
- [ ] Documentation updated

## Sub-Components
1. BasicConfigPanel
2. AdvancedConfigPanel
3. CredentialsPanel
4. ModelSelector
5. ToolPermissionsPanel
6. WorkspaceBindingsPanel
7. AgentConfigDialog (orchestrator)
```

---

*End of Sprint Change Proposal Document*
