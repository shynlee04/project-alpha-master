# AGENTS.md - Project Alpha Governance
**USING REAL TIME AND DATE TO STAMP - AND STOP MEASURING LIKE IT SHOULD A DAY 2 AI AGENT TEAMS CAN DEVELOP 2 EPIC**
> **Version:** 2.8.0 | **Updated:** 2026-01-27 | **Health:** 45% (CC Remediation Required)

---

**DO NOT RUN FULL BUILD:** UNLESS  it is requested by the user, because the codebase is large and it is resource consuming

## 3-Step Validation Framework (NON-NEGOTIABLE)

**Priority**: HIGHER than automated tests/tools
**When to Use**: ALWAYS before implementation and after completion

### Step 1: High-Level EPIC Review (Pre-Story)
- Check integration to previous epics
- Register domains, components, files
- Analyze use cases
- Define success criteria

### Step 2: Component & Data Mapping Validation (Pre-Implementation)
- Schema validation (types, interfaces, API contracts)
- Data flow mapping (origin → transformations → destination)
- Component contracts (props, hooks, state, events)
- State management (stores, reactivity, persistence)

### Step 3: Integration Validation (During Code Review)
- User journey validation (step-by-step walkthrough)
- Component rendering validation (props, state, reactivity)
- State persistence validation (reload, sync, cleanup)
- Cross-dependency validation (imports, circular deps, events, side effects)

### Non-Negotiable Rules

1. **Schema Validation BEFORE code** - Never implement without verifying types/API contracts
2. **Data Flow Integrity BEFORE code** - Never implement with data loss risks (truncation, filtering)
3. **Component Contracts Documented BEFORE code** - Never implement with ambiguous props/hooks/state/events
4. **User Journey Validated BEFORE complete** - Never claim complete without E2E walkthrough
5. **Cross-Dependencies Checked BEFORE merge** - Never merge with breakage elsewhere

### Dry Reading Tools (MANDATORY Before Code)

```bash
# Read specifications
grep -r "Technical Problem Statement\|Root Cause\|Acceptance Criteria" _bmad-output/planning-artifacts/epics/

# Read contracts
grep -r "interface.*Props\|export function\|export type" src/domain/ src/presentation/ | head -30

# Trace data flow
grep -r "StorageGateway\|FileEntry\|Project" src/infrastructure/ src/domain/ | head -30
```

### How This Prevents Flaws Like EPIC-0.5-01

**What Happened**: Dev team truncated file paths to `parts[0]`, losing nested files

**Step 1 Would Prevent**: Requirement would clearly state "preserve ALL file paths, no truncation"

**Step 2 Would Prevent**: Data flow mapping would show "adapter returns full paths → gateway must preserve → component receives full paths"

**Step 3 Would Prevent**: User journey validation would fail at "expand folder → empty" step

---

## 🚨 CRITICAL: ALWAYS Set Tool Constraints When Delegating to Sub-Agents

**NEVER delegate without explicitly setting tool permissions!**

### Required Pattern for EVERY Delegation

```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: [true/false] - What it can create
- edit: [true/false] - Whether it can modify code files
- bash: [true/false] - Whether it can run commands
- task: true - Can delegate further if approved

**Role Boundaries**:
- [AGENT ROLE] - What it should do
- [WHAT NOT TO DO] - Clear list of forbidden actions

**Required Output**:
- Report location: [path]
- Success criteria: [list]
- Timebox: [duration]
```

### Tool Permission Matrix (MEMORIZE THIS)

| Agent Type | write | edit | bash | task | Notes |
|-----------|--------|-------|-------|-------|--------|
| **real-world-validator** | true | false | true (limited) | true | Tests ONLY, writes reports, NEVER modifies code |
| **dev-ext** | true | true | true (limited) | true | Implementation, but NEVER without context and review |
| **architect-ext** | false | true (design only) | false | true | Architecture docs, NOT code implementation |
| **analyst-ext** | false | false | false | true | Research and analysis ONLY |
| **tea-ext** | false | false | false | true | Test specifications, NOT implementation |

---

## 🚨 ACTIVE PARALLEL SPRINTS

### Team A: P0 BLOCKER - EPIC-ARCH-04-CC (FSA Handle Lifecycle)

**Status**: 95% (CC-04 E2E Pending)

| Story | Title | Status |
|-------|-------|--------|
| CC-01 | Add initialHandle Prop and FSA Restore Logic | IN_PROGRESS |
| CC-02 | Wire PermissionOverlay with Persist and Reinit | BLOCKED by CC-01 |
| CC-03 | Wire Route to Pass initialHandle | BLOCKED by CC-01 |
| CC-04 | End-to-End Validation with Evidence | BLOCKED by CC-01,02,03 |

**Files Owned (DO NOT TOUCH from other teams)**:
- `src/infrastructure/context/project-context.tsx`
- `src/routes/$projectId.tsx`
- `src/presentation/components/layout/PermissionOverlay.tsx`

---

### Team B: P1 PARALLEL - EPIC-CONSOLIDATION

**Status**: READY_FOR_EXECUTION

| Story | Title | Status | Effort |
|-------|-------|--------|--------|
| CONS-01 | Remove remaining window.location.href | READY | 1h |
| CONS-02 | Consolidate project creation deprecation | READY | 1.5h |
| CONS-03 | Complete MonacoPlugin integration | READY | 2-3h |

---

### Team A+B: P0 BLOCKER - EPIC-CC-AR02AR03 (Plugin System for Phase 1A)

**Status**: READY_FOR_EXECUTION (After CC-04 Complete)

| Story | Title | Status | Team | Effort |
|-------|-------|--------|------|--------|
| CC-AR-01 | Add All Missing i18n Translation Keys | READY | A | 2h |
| CC-AR-02 | Wire platform-defaults.ts to Route | READY | A | 2-3h |
| CC-AR-03 | Fix Store Hydration Race Condition | READY | B | 2-3h |
| CC-AR-04 | Replace Drag-Drop with Toggle-Based Layout | READY | A | 4-6h |
| CC-AR-05 | Replace Monaco POC with Real Monaco Editor | READY | B | 4-6h |
| CC-AR-06 | Implement Preview Plugin (WebContainer) | READY | B | 4-6h |
| CC-AR-07 | Archive Legacy/Duplicate Files | READY | A | 1h |
| CC-AR-08 | Split PluginLayout.tsx | READY | B | 2-3h |

**Remediates**: EPIC-ARCH-02 (70% true), EPIC-ARCH-03 (45% true)

---

## 🏛️ AUTHORITY HIERARCHY

### Authority Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  ADR-039 (Primary Architecture Authority)             │
│  Status: PENDING APPROVAL                            │
│  Purpose: Unified architecture decisions              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  architecture.md (v3.0.0)                          │
│  Status: 100% Aligned                               │
│  Purpose: Technical implementation specification        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Implementation Layer (prd.md, epics.md, ux-spec)    │
└─────────────────────────────────────────────────────────┘
```

### Document Authority Matrix

| Document | Version | Status | Authority Level | When to Use |
|----------|---------|--------|----------------|-------------|
| **ADR-039** | - | Pending Approval | Tier 1 (Primary) | All architecture decisions |
| **new-fundamental-truths.md** | v2.0.0 | Active | Tier 1 (Foundation) | All strategic decisions |
| **architecture.md** | v3.0.0 | 100% Aligned | Tier 2 (Implementation) | Technical architecture |
| **prd.md** | v2.0.0 | 100% Aligned | Tier 2 (Product) | Product requirements |
| **epics.md** | v3.0.0 | 100% Aligned | Tier 2 (Planning) | Epic/story definitions |
| **ux-specification.md** | v2.0.0 | 100% Aligned | Tier 2 (UX) | UX requirements |
| **AGENTS.md** | v2.8.0 | Active | Tier 2 (Governance) | Agent coordination |

---

## 🗂️ FILE TREE GOVERNANCE (Strict Enforcement)

### Canonical Directory Structure

```
src/
├── routes/                    # TanStack Router ONLY
├── presentation/              # React UI ONLY
│   ├── components/
│   │   ├── ui/               # Design system primitives
│   │   ├── common/           # Shared components
│   │   ├── notes/            # Notes-specific
│   │   └── ide/              # IDE-specific
│   └── hooks/                # React hooks
├── domain/                    # Business Logic ONLY
│   ├── entities/
│   ├── services/
│   ├── types/
│   └── interfaces/
└── infrastructure/            # External Interfaces ONLY
    ├── persistence/
    │   ├── dexie-db.ts
    │   └── stores/          # Zustand stores
    ├── filesystem/
    │   ├── fsa-storage-adapter.ts
    │   ├── platform-detection.ts
    │   └── StorageAdapterFactory.ts
    ├── sync/
    └── events/
```

### File Change Rules

| Action | Rule |
|--------|------|
| **CREATE** | Only in canonical directories |
| **MODIFY** | Check canonical location first |
| **DELETE** | Archive to `_bmad-ext/.archive/` first |
| **MOVE** | Create facade re-export at old path |

### Deprecated Directories (Do NOT Add Files)

```
❌ DEPRECATED:
src/lib/workspace/  → infrastructure/persistence/stores/
src/lib/filesystem/ → infrastructure/filesystem/
src/lib/state/      → infrastructure/persistence/stores/
src/lib/sync/       → infrastructure/sync/
src/stores/         → NEVER existed
```

---

## ⏱️ REALISTIC TIMING GOVERNANCE

### Actual Timing Data

| Work Unit | Real Average |
|-----------|--------------|
| **Story (simple)** | 1-2 hours |
| **Story (complex)** | 2-4 hours |
| **Epic (6-8 stories)** | 4-8 hours |
| **Epic (mini 3-4)** | 2-4 hours |
| **Sprint Planning** | 5-15 min |

### Time-Boxing

| Level | Duration | Monitoring | On Timeout |
|-------|----------|------------|------------|
| **Step** | 15 min | Every 5 min | Escalate to story |
| **Story** | 4 hours max | Every 15 min | Split story or continue |
| **Epic** | 8 hours | Every 30 min | Assess progress, adjust scope |

---

## ⚡ Quick Reference

| Key | Value |
|-----|-------|
| **Current Phase** | Plugin System Remediation (Phase 1A) |
| **P0 Blocker** | EPIC-CC-AR02AR03 (Plugin System Rework) |
| **Active Epic** | EPIC-CC-AR02AR03 (0%) |
| **Secondary Epic** | EPIC-ARCH-04-CC (95%) |
| **Sprint File** | `sprint-status-2026-01-26.yaml` |
| **Workflow File** | `workflow-status-2026-01-26.yaml` |
| **ADR** | ADR-039 (Pending Approval) |
| **TypeScript Errors** | 0 ✅ |
| **App Status** | ⚠️ FUNCTIONAL BUT INCOMPLETE |
| **UX Spec Version** | 3.0.0 (2026-01-27) |

### EPIC Corrected Status (2026-01-26)

| Epic | TRUE Status | Action |
|------|-------------|--------|
| EPIC-ARCH-01 | 60% | Team B CONS stories |
| EPIC-ARCH-02 | **70%** | EPIC-CC-AR02AR03 remediates |
| EPIC-ARCH-03 | **45%** | EPIC-CC-AR02AR03 remediates |
| EPIC-ARCH-04-CC | **95%** | CC-04 E2E pending |
| **EPIC-CC-AR02AR03** | 0% | **P0 BLOCKER for Phase 1A** |

---

## 📍 Navigation Index

| What You Need | Where To Find It |
|---------------|------------------|
| **Primary Architecture Authority** | `ADR-039` (Pending Approval) |
| **Architecture Specification** | `_bmad-output/planning-artifacts/architecture.md` |
| **Fundamental Truths** | `docs/new-fundamental-truths.md` |
| **Product Roadmap** | `_bmad-output/planning-artifacts/prd.md` |
| **Epics & Stories** | `_bmad-output/planning-artifacts/epics.md` |
| **UX Specification** | `_bmad-output/planning-artifacts/ux-specification/` (sharded - see index.md) |
| **Workflow Status** | `bmm-workflow-status.yaml` |
| **Sprint Status** | `_bmad-output/sprint-artifacts/sprint-status.yaml` |
| **Story Index** | `_bmad-output/sprint-artifacts/stories/STORY-INDEX.md` |
| **Standards** | `agent-os/standards/` |
| **Governance Gates** | `_bmad/modules/governance/checklists/` |
| **BMAD Framework** | `_bmad-ext/constitution/` |
| **LOOP_STATE** | `_bmad-ext/state/LOOP_STATE.yaml` |

---

## 🚫 Non-Negotiable Rules

### 1. Never Skip Build Validation

```bash
pnpm tsc --noEmit && pnpm vitest run
```

### 2. Clean Architecture Paths

```
✅ CORRECT:
  src/infrastructure/persistence/stores/  → Zustand stores
  src/infrastructure/persistence/dexie/   → Dexie DB
  src/infrastructure/sync/                → File sync logic
  src/domain/services/                    → Domain services
  src/domain/types/                       → Domain types
  src/presentation/components/             → React components
  src/presentation/hooks/                  → Custom hooks
  src/routes/                             → TanStack Router routes
```

### 3. Zustand Store Pattern

```typescript
// ✅ ALWAYS use useShallow
const { items, addItem } = useStore(
  useShallow((state) => ({
    items: state.items,
    addItem: state.addItem,
  }))
);

// ❌ NEVER
const items = useStore((s) => s.items);
const addItem = useStore((s) => s.addItem);
```

### 4. 8-bit Design System

```css
/* ✅ REQUIRED */
border-radius: 0;         /* Sharp corners */
border-radius: 2px;       /* Minimal rounding only */
box-shadow: 4px 4px 0 0;  /* Pixel shadows */

/* ❌ FORBIDDEN */
border-radius: 0.5rem;   /* Too rounded */
backdrop-filter: blur();  /* Glassmorphism */
opacity: 0.8;            /* Avoid - use solid */
```

---

## 🏗️ Architecture Overview

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript 5.9 |
| Routing | TanStack Router (@tanstack/react-router) |
| State | Zustand v5 + Dexie.js |
| Styling | Tailwind CSS + Radix UI |
| Build | Vite + TanStack Start |
| Testing | Vitest + Playwright |
| AI | Google Gemini (@tanstack/ai-gemini) |

### Workspaces

| Route | Description |
|-------|-------------|
| `/notes` | Markdown/BlockNote editor |
| `/ide` | WebContainer-based IDE |
| `/settings` | API keys, Vault, Config |

---

## 📊 Context Limits

| Limit | Value |
|-------|-------|
| Max active epics | 4 |
| Max stories per epic | 8 |
| Max active sprint files | 4 |
| YAML file limit in _bmad-output | 25 |
| workflow-status.yaml max lines | 200 |

---

## 🔒 Governance Rules

### Before Any Workflow

1. **Story Start**: Run `story-start-gate.yaml` checks
2. **Story Done**: Run `story-done-gate.yaml` checks
3. **Epic Done**: Run `epic-done-gate.yaml` (requires human `APPROVED: EPIC-XX`)
4. **Daily**: Run `sprint-rotation-gate.yaml`
5. **All**: Check `artifact-freshness-gate.yaml` TTL tiers

---

## 🚀 Quick Start for New Agent Session

1. Read this file (AGENTS.md)
2. Check `bmm-workflow-status.yaml` for current story
3. Load `sprint-status.yaml` for active work
4. Load story context: `stories/{story-id}-context.xml`
5. Begin work using dev-story workflow

---

## 🎯 Critical BMAD Rules

- **ALWAYS start with context** - Read, consume relevant docs, use MCP servers
- **Never create files without validation** - Both code and documents need gatekeeping
- **Never use stale documents** - No references, metadata, or yaml references = NEVER use
- **Never execute without plan** - Always set up TODO list
- **8-bit design** - No transparent backgrounds, NO hardcoded CSS, responsive for mobile
- **Language strings** - NOT hardcoded - English and Vietnamese
- **Code splitting** - Start splitting at 400 lines (500+ not accepted) - No god classes
- **Keep architecture aligned** - Refactored and organized
- **Never pass gatekeeping without evidence** - Validate success before claiming done
- **Debug intelligently** - Export errors to files, reason deeply, fix progressively, then run tools
- **Two teams A and B** - Coordinate to correct team, keep status updated
- **DRY-CHECK** - ALWAYS double-check for syntax errors before running tools or tests
- **MCP tools are critical** - Check and use them often for official docs

---

## 📦 Module References

| Module | Location | Purpose |
|--------|----------|---------|
| Governance | `_bmad/modules/governance/` | Gates, cycles, regulation |
| Integration Testing | `_bmad/modules/integration-testing/` | Playwright, API keys |
| Architecture Remediation | `_bmad/modules/architecture-remediation/` | ARC loop |

---

## 🔗 External References

- **Full BMAD Framework**: `_bmad/FRAMEWORK.md`
- **ADR Decisions**: `_bmad-output/planning-artifacts/adr/`
- **Historical Content**: `_bmad-output/.archive/`
- **Standards (Full)**: `agent-os/standards/`
- **BMAD Constitution**: `_bmad-ext/constitution/`
- **Analysis Reports**: `_bmad-output/analysis/`

---

**End of AGENTS.md - Total Lines: ~500**
