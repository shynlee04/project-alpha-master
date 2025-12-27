# Team B Coordination Plan

**Date**: 2025-12-27  
**Team**: Team B (Complementary Workstream)  
**Status**: DRAFT - Pending sync with Team A

---

## Team Identity & Execution Rationale

**Team B** - Complementary workstream focused on:
1. **State Management Refactoring** - IDELayout.tsx Zustand migration
2. **Epic 29 Preparation** - Agentic Execution Loop specifications

**Execution Rationale**: **CONSECUTIVE** (not parallel) with Team A because:
- Team A's mobile work modifies layout components that will be refactored
- State management refactoring should happen after mobile layouts stabilize
- Epic 29 implementation requires MVP progress (currently at MVP-1/MVP-2)

---

## Current State Analysis

### Team A's Mobile Responsive Transformation

| Story | Component | Impact on Team B | Risk Level |
|-------|-----------|------------------|------------|
| MRT-1 | `MinViewportWarning.tsx` removal | Low - Component removal | 🟢 |
| MRT-2 | `MobileTabBar.tsx` | New component, no state impact | 🟢 |
| MRT-3 | `MobileIDELayout.tsx` | **MEDIUM** - Will use state patterns we define | 🟡 |
| MRT-4 | FileTree Adaptation | Low - Existing component | 🟢 |

### MVP Progress (Sequential Blockers)

```
MVP-1 (IN_PROGRESS) → MVP-2 (IN_PROGRESS) → MVP-3 (ready-for-e2e) → MVP-4 (BLOCKED) → ...
```

### Epic 29 Status

```
Status: BACKLOG
Stories: EPIC-29-1, EPIC-29-2, EPIC-29-3, EPIC-29-4
Priority: P0
Dependency: State refactoring (optional)
```

---

## Team B Work Plan

### Phase 1: Preparation (While Team A Works on MRT-1 → MRT-3)

**Timeline**: Concurrently with Team A's mobile layout work

#### Task B1: Document State Management Requirements

**Output**: `_bmad-output/team-b/state-management-requirements-2025-12-27.md`

**Contents**:
- Current IDELayout.tsx state duplication analysis
- Zustand store interface requirements
- Migration path from useState to useIDEStore
- Consistency requirements for MobileIDELayout.tsx

#### Task B2: Prepare Epic 29 Specifications

**Output**: `_bmad-output/team-b/epic-29-specifications-2025-12-27.md`

**Contents**:
- Agentic state tracking requirements
- Iteration UI component specs
- Intelligent termination logic
- Dependencies on MVP progress

---

### Phase 2: State Management Refactoring

**Timeline**: **AFTER** Team A completes MRT-3  
**Trigger**: Team A handoff document received at `_bmad-output/handoffs/team-a-mrt-3-complete.md`

#### Task B3: Refactor IDELayout.tsx State

**File**: `src/components/layout/IDELayout.tsx`

**Current State** (to replace):
```typescript
const [isChatVisible, setIsChatVisible] = useState(false)
const [terminalTab, setTerminalTab] = useState<'terminal' | 'output'>('terminal')
const [openFiles, setOpenFiles] = useState<string[]>([])
const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
```

**Target State** (using Zustand):
```typescript
const isChatVisible = useIDEStore(s => s.chatVisible)
const setChatVisible = useIDEStore(s => s.setChatVisible)
const terminalTab = useIDEStore(s => s.terminalTab)
const setTerminalTab = useIDEStore(s => s.setTerminalTab)
const openFiles = useIDEStore(s => s.openFiles)
const setOpenFiles = useIDEStore(s => s.setOpenFiles)
const activeFilePath = useIDEStore(s => s.activeFile)
const setActiveFilePath = useIDEStore(s => s.setActiveFile)
```

**Acceptance Criteria**:
- [ ] Remove local useState for IDE state
- [ ] Wire all state to useIDEStore
- [ ] Preserve existing functionality
- [ ] Tests pass: `pnpm test`
- [ ] Type check passes: `pnpm tsc --noEmit`

#### Task B4: Update MobileIDELayout.tsx

**File**: `src/components/layout/MobileIDELayout.tsx`

**Requirements**:
- Apply same Zustand patterns for consistency
- Share state with IDELayout.tsx via useIDEStore
- No duplicate state management

**Acceptance Criteria**:
- [ ] Uses useIDEStore for all state
- [ ] Consistent with IDELayout.tsx patterns
- [ ] Tests pass
- [ ] Type check passes

---

### Phase 3: Epic 29 Implementation

**Timeline**: **AFTER** MVP-1 is marked DONE  
**Trigger**: MVP-1 status → DONE in sprint-status-consolidated.yaml

#### Task B5: Create Epic 29 Stories

Following `.agent/workflows/story-dev-cycle.md`:

**Story Files**:
- `_bmad-output/sprint-artifacts/epic-29-1-agentic-state-tracking.md`
- `_bmad-output/sprint-artifacts/epic-29-2-iteration-ui-component.md`
- `_bmad-output/sprint-artifacts/epic-29-3-intelligent-termination.md`
- `_bmad-output/sprint-artifacts/epic-29-4-agentic-loop-e2e-validation.md`

#### Task B6: Execute Story Development Cycle

**Workflow**: Per story-dev-cycle.md
1. create-story → validate → create-context → validate
2. dev-story → code-review → done
3. Loop for all 4 stories

---

## Coordination Protocol

### Sync Points

| Sync | Trigger | Action |
|------|---------|--------|
| **Sync 1** | Team A completes MRT-1 | Team B reviews viewport block removal impact |
| **Sync 2** | Team A completes MRT-3 | Team B begins Phase 2 (state refactoring) |
| **Sync 3** | MVP-1 status → DONE | Team B begins Phase 3 (Epic 29) |

### Handoff Documents

Team B will create:

| Document | Trigger | Contents |
|----------|---------|----------|
| `_bmad-output/handoffs/team-b-phase-1-complete.md` | Phase 1 complete | State requirements, Epic 29 specs |
| `_bmad-output/handoffs/team-b-phase-2-complete.md` | Phase 2 complete | IDELayout refactoring complete |
| `_bmad-output/handoffs/team-b-phase-3-complete.md` | Phase 3 complete | Epic 29 implementation complete |

### Conflict Prevention

**Conflict Area**: MobileIDELayout.tsx state management

**Prevention Strategy**:
1. Team B waits for Team A's MRT-3 handoff before touching MobileIDELayout.tsx
2. Team B uses same Zustand patterns for both IDELayout.tsx and MobileIDELayout.tsx
3. All state flows through useIDEStore (single source of truth)

---

## Dependencies & Blockers

### For Team B Phase 1 (Preparation)

| Dependency | Source | Status |
|------------|--------|--------|
| None | - | Ready |

### For Team B Phase 2 (State Refactoring)

| Dependency | Source | Status |
|------------|--------|--------|
| Team A MRT-3 complete | Team A | Pending |
| MobileIDELayout.tsx stable | Team A | Pending |

### For Team B Phase 3 (Epic 29)

| Dependency | Source | Status |
|------------|--------|--------|
| MVP-1 DONE | MVP epic | Pending |
| Phase 2 complete | Team B | Pending |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Phase 1 artifacts | 2 documents | Created and reviewed |
| IDELayout.tsx refactor | 100% Zustand | All state migrated |
| MobileIDELayout.tsx consistency | 100% | Shares useIDEStore |
| Epic 29 stories | 4 stories | Created per workflow |
| Epic 29 completion | 4/4 DONE | All stories complete |
| No conflicts with Team A | 0 | Zero merge conflicts |

---

## Next Immediate Action

**Team B awaits Team A's MRT-3 completion** before beginning Phase 2.

**If you approve this plan**, I will proceed with:

1. ✅ Create Team B coordination document
2. 📋 Generate Phase 1 artifacts (state requirements + Epic 29 specs)

**Please confirm**: Should Team B proceed with Phase 1 (Preparation) now, or wait for further coordination with Team A?

---

*Generated by BMAD Master Orchestrator - Team B Coordination*
