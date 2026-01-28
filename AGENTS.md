# AGENTS.md - Project Alpha Governance
**USING REAL TIME AND DATE TO STAMP - AND STOP MEASURING LIKE IT SHOULD A DAY 2 AI AGENT TEAMS CAN DEVELOP 2 EPIC**
> **Version:** 2.14.0 | **Updated:** 2026-01-29T12:30:00+07:00 | **Health:** 65% (PHASE 1A REMEDIATION ACTIVE)

---

## 🚨 CURRENT STATUS: PHASE 1A REMEDIATION

**Date**: 2026-01-29
**Phase**: 1A - Foundation & Non-AI Core
**Priority**: P0 - Fix broken layout, stabilize core plugins

### What Just Happened
1. **309 Phase 2+ files archived** to `_phase2-archive/`
2. **Context isolation** via `.aiexclude`
3. **Governance documents created** in `_bmad-output/governance/`

### Archived (Phase 2+)
| Directory | Status | Restore |
|-----------|--------|---------|
| `src/presentation/components/agent/` | ARCHIVED | `_phase2-archive/` |
| `src/lib/agent/` | ARCHIVED | `_phase2-archive/` |
| `src/domain/tools/` | ARCHIVED | `_phase2-archive/` |
| `src/infrastructure/persistence/stores/agents/` | ARCHIVED | `_phase2-archive/` |
| `src/infrastructure/persistence/stores/providers/` | ARCHIVED | `_phase2-archive/` |
| `src/infrastructure/persistence/stores/conversation/` | ARCHIVED | `_phase2-archive/` |

### Phase 1A Focus (NOW)
| Priority | Task | Status |
|----------|------|--------|
| P0 | Fix broken layout (screen shaking, empty space) | IN PROGRESS |
| P0 | Stabilize FileTree plugin | PENDING |
| P0 | Stabilize Monaco editor | PENDING |
| P0 | Stabilize Terminal/Preview | PENDING |
| P1 | Archive safe legacy files (21K lines) | PENDING |
| P1 | Migrate lib/filesystem imports | PENDING |

### Key Governance Documents
| Document | Location |
|----------|----------|
| Phase 1A Foundation | `_bmad-output/governance/PHASE-1A-FOUNDATION-2026-01-29.md` |
| Phase 1A Registry | `_bmad-output/governance/PHASE-1A-REGISTRY-2026-01-29.md` |
| Deep Scan Results | `_bmad-output/governance/phase-1a-deep-scan-2026-01-29.yaml` |
| Phase 2 Staging Plan | `_bmad-output/governance/PHASE2-STAGING-PLAN-2026-01-29.md` |
| Phase 2 Archive Manifest | `_phase2-archive/MANIFEST.md` |

---

---
# **THE EXTREME AND ABSOLUTE CONSTITUTIONS WHEN IT COMES TO CREATE/CONSUME ANY DOCUMENTS AND/OR ARTIFACTS**

- all of the `dot md` files must all come with both in naming and the frontmatter the exact DATE abd TIME stamps (epic-level and story-level artifacts and documents must have time-stamps) -> DO NOT MAKE UP THESE VALUES , YOU MUST RUN ACTUAL DATE AND TIME COMMANDS

- do not consume (without real investigation of code) any below-epic levels that are more than 2-hour stale (validate them and if they are true , refresh with new stamps) 

- the same goes for any that lacks validation, nor broken, untrackable ID, no references to any status files, nor the higher-up controlled documents

- the reasons for the above is because this project is totally build by AI agents >> therefore a story completion can take only 20-30 mminutes. 

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

### Team A+B: ✅ COMPLETE - EPIC-UXUI-03-PLUGIN-LAYOUT

**Status**: 100% COMPLETE (17/17 stories) - Completed 2026-01-28

| Story | Title | Status | Team | Effort |
|-------|-------|--------|------|--------|
| UXUI-03-01 | Add GlobalSidebar to Project Routes | ✅ COMPLETE | B | 1h |
| UXUI-03-02 | Add 'main' to PanelPosition Type | ✅ COMPLETE | B | 1h |
| UXUI-03-03 | Create Activity Bar TOP Component | ✅ COMPLETE | A | 4-6h |
| UXUI-03-04 | Implement Main Content Plugin Switching | ✅ COMPLETE | A | 3-4h |
| UXUI-03-05 | Create Floating Plugin Docker | ✅ COMPLETE | A | 6-8h |
| UXUI-03-06 | Add L/M/R Placement Badges | ✅ COMPLETE | A | 2h |
| UXUI-03-07 | Persist Plugin Placements | ✅ COMPLETE | A | 2h |
| + 10 more | (See sprint-status-2026-01-28.yaml) | ✅ COMPLETE | A+B | - |

**Files Implemented**:
- `src/presentation/components/layout/MainContentRenderer.tsx`
- `src/presentation/components/layout/FloatingPluginDocker.tsx`
- `src/presentation/hooks/usePluginPlacement.ts`

---

### Team B: P1 PARALLEL - EPIC-CONSOLIDATION

**Status**: READY_FOR_EXECUTION

| Story | Title | Status | Effort |
|-------|-------|--------|--------|
| CONS-01 | Remove remaining window.location.href | READY | 1h |
| CONS-02 | Consolidate project creation deprecation | READY | 1.5h |
| CONS-03 | Complete MonacoPlugin integration | READY | 2-3h |

---

### Team B: P1 PARALLEL - EPIC-UXUI-01 (Design System Foundation)

**Status**: READY_FOR_EXECUTION

| Story | Title | Status | Effort |
|-------|-------|--------|--------|
| UXUI-01-01 | Implement Color Design Tokens | READY | 2-3h |
| UXUI-01-02 | Implement Typography Tokens | READY | 1-2h |
| UXUI-01-03 | Implement Spacing & Border Tokens | READY | 1-2h |
| UXUI-01-04 | Implement Animation Tokens | READY | 2-3h |
| UXUI-01-05 | Style Button Components | READY | 2-3h |
| UXUI-01-06 | Style Input Components | READY | 2-3h |
| UXUI-01-07 | Style Dialog/Modal Components | READY | 2-3h |
| UXUI-01-08 | Style Remaining UI Primitives | READY | 3-4h |

**Safe Zones (Team B Can Modify)**:
- `src/styles.css`
- `src/styles/*.css`
- `src/presentation/components/ui/`

**Validation**: Must pass `ux-specification/VALIDATION-CHECKLIST.md`

---

## 🏛️ AUTHORITY HIERARCHY

### Authority Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  ADR-039 (Primary Architecture Authority)             │
│  Status: APPROVED                                     │
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
| **ADR-039** | - | APPROVED | Tier 1 (Primary) | All architecture decisions |
| **new-fundamental-truths.md** | v2.0.0 | Active | Tier 1 (Foundation) | All strategic decisions |
| **architecture.md** | v3.0.0 | 100% Aligned | Tier 2 (Implementation) | Technical architecture |
| **prd.md** | v2.0.0 | 100% Aligned | Tier 2 (Product) | Product requirements |
| **epics.md** | v3.0.0 | 100% Aligned | Tier 2 (Planning) | Epic/story definitions |
| **ux-specification/** | v3.0.0 | 100% Aligned | Tier 2 (UX) | UX requirements (15 sharded sections) |
| **AGENTS.md** | v2.12.0 | Active | Tier 2 (Governance) | Agent coordination |

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
| **Current Phase** | UX Specification Alignment (Phase 1B) |
| **P0 Blocker** | None - ready for execution |
| **Active Epic** | EPIC-CONSOLIDATION or EPIC-UXUI-01 |
| **Secondary Epic** | None |
| **Sprint File** | `sprint-status-2026-01-28.yaml` |
| **Workflow File** | `bmm-workflow-status.yaml` |
| **ADR** | ADR-039 (APPROVED) |
| **TypeScript Errors** | 0 ✅ |
| **App Status** | ⚠️ FUNCTIONAL BUT INCOMPLETE |
| **UX Spec Version** | 3.0.0 (2026-01-27) |
| **UX Spec Sections** | 15 (including Light Theme + Animations) |
| **Completed EPIC** | EPIC-UXUI-03 (100%) |

### Active EPICs (2026-01-28)

| Epic | Status | Team | Priority |
|------|--------|------|----------|
| EPIC-UXUI-03-PLUGIN-LAYOUT | ✅ 100% COMPLETE | A+B | P0 |
| EPIC-CONSOLIDATION | READY | B | P1 |
| EPIC-UXUI-01 | READY | B | P1 |

---

## 📍 Navigation Index

| What You Need | Where To Find It |
|---------------|------------------|
| **Primary Architecture Authority** | `ADR-039` (APPROVED) |
| **Architecture Specification** | `_bmad-output/planning-artifacts/architecture.md` |
| **Fundamental Truths** | `new-fundamental-truths.md` |
| **Product Roadmap** | `_bmad-output/planning-artifacts/prd.md` |
| **Epics & Stories** | `_bmad-output/planning-artifacts/epics.md` |
| **UX Specification** | `_bmad-output/planning-artifacts/ux-specification/` (sharded - see index.md) |
| **Workflow Status** | `bmm-workflow-status.yaml` |
| **Sprint Status** | `_bmad-output/sprint-artifacts/sprint-status-2026-01-28.yaml` |
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

**Extended Specifications**:
- **Light Theming**: See `ux-specification/14-light-theming.md`
- **Micro Animations**: See `ux-specification/15-micro-animations.md`
- **Validation Checklist**: See `ux-specification/VALIDATION-CHECKLIST.md`

---

## 🏗️ Layout Governance Rules (2026-01-29)

### Single Source of Truth

| Component | Purpose | Location |
|-----------|---------|----------|
| **WorkspaceLayout** | Canonical layout for project routes | `src/presentation/layouts/WorkspaceLayout.tsx` |
| **ProjectAwareLayout** | Route-aware layout switcher | `src/presentation/components/layout/ProjectAwareLayout.tsx` |
| **PluginLayoutStore** | Single store for all layout state | `src/presentation/layouts/PluginLayoutStore.ts` |

**Rules**:
- All project routes (`/$projectId`) MUST use `WorkspaceLayout`
- No intermediate layout wrappers allowed (no `MainLayout` wrappers)
- Global routes (`/`, `/settings`, `/agents`, etc.) render through `ProjectAwareLayout`
- Facade exports exist for backward compatibility - use them

### Z-Index Scale (design-tokens.css)

| Token | Value | Use For |
|-------|-------|---------|
| `--z-base` | 0 | Default content (no z-index) |
| `--z-dropdown` | 10 | Dropdowns, hover states |
| `--z-sticky` | 20 | Sticky headers, navigation |
| `--z-sidebar` | 30 | Fixed sidebars, panels |
| `--z-panel` | 40 | Fixed panels, status overlays |
| `--z-modal` | 50 | Modals, dialogs, important overlays |
| `--z-toast` | 60 | Toast notifications |
| `--z-popover` | 70 | Priority popovers, dropdown menus |
| `--z-overlay` | 80 | Full-screen overlays, command palettes |
| `--z-alert` | 90 | Critical alerts |
| `--z-debug` | 100 | Highest level (debug overlays, devtools) |

**Usage**:
```css
/* CSS */
z-index: var(--z-modal);

/* Inline style */
style={{ zIndex: 'var(--z-modal)' }}

/* Tailwind arbitrary value */
className="[&]:z-[var(--z-modal)]"
```

### Overflow Strategy

```
✅ CORRECT:
  html, body, #root     → overflow: hidden
  WorkspaceLayout       → overflow: hidden
  Content areas ONLY    → overflow-y: auto

❌ FORBIDDEN:
  Nested scrollable containers
  overflow: scroll on parent and child
  Multiple scroll contexts in same panel
```

**Rule**: Only leaf content areas (main content, plugin panels) should scroll. Never nest scrollable containers.

### Layout Store Pattern

```typescript
// ✅ CORRECT: Use usePluginLayoutStore with useShallow
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { useShallow } from 'zustand/react/shallow';

const { activePlugins, layoutMode } = usePluginLayoutStore(
  useShallow((s) => ({
    activePlugins: s.activePlugins,
    layoutMode: s.layoutMode,
  }))
);

// ❌ FORBIDDEN: Multiple selector calls
const activePlugins = usePluginLayoutStore((s) => s.activePlugins);
const layoutMode = usePluginLayoutStore((s) => s.layoutMode);
```

### Route Layout Matrix

| Route Pattern | Layout Component | Sidebar | Notes |
|--------------|------------------|---------|-------|
| `/$projectId` | `WorkspaceLayout` | GlobalSidebar (48px) | Full 6-column grid |
| `/` | `ProjectAwareLayout` | MainSidebar | Hub home page |
| `/settings` | `ProjectAwareLayout` | MainSidebar | Settings page |
| `/agents` | `ProjectAwareLayout` | MainSidebar | Agent management |
| `/projects` | `ProjectAwareLayout` | MainSidebar | Projects list |
| `/debug` | None | None | Standalone debug UI |

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
- **Animation 8-bit style** - Use `steps(N, end)` timing, no smooth easing, respect prefers-reduced-motion
- **Theme support** - Dark-first, light theme uses warm whites (Stone palette), no pure white
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

## ⚡ AI Agent Development Guidelines (2026-01-28)

### Performance-First Tooling (MUST USE)

```bash
# Fast type checking (10x faster - prevents timeouts)
pnpm typecheck:fast        # Uses tsgo native compiler
pnpm typecheck:watch       # Watch mode

# Fast testing (multi-core parallel)
pnpm test:fast             # Thread pool execution
pnpm test:ci               # CI-optimized

# Type safety automation (prevents cross-dependency nightmares)
pnpm types:generate        # Auto-generate types from schemas
pnpm types:validate        # Validate contract consistency
pnpm types:fix             # Auto-fix common type issues
pnpm contracts:check       # Full validation pipeline

# Dependency analysis
pnpm deps:circular         # Check for circular dependencies
pnpm deps:visualize        # Generate dependency graph
```

### Type Safety Automation (CRITICAL)

**Always run before implementing:**
```bash
pnpm contracts:check       # Validates type contracts
pnpm types:generate        # Generates fresh types
```

**Generated types location:**
```typescript
import type { Project, User } from '@/generated'  // Auto-generated
```

### Key Files for AI Agents

| File | Purpose |
|------|---------|
| `PERFORMANCE-OPTIMIZATION-GUIDE.md` | Fast builds, testing, type checking |
| `TYPE-SAFETY-AUTOMATION.md` | Automated type generation & validation |
| `tsconfig.tsgo.json` | Native compiler config (10x faster) |
| `vitest.config.ts` | Parallel test execution |

### Contract-First Development Pattern

```typescript
// 1. Define Zod schema (single source of truth)
const ProjectSchema = z.object({ id: z.string(), name: z.string() })

// 2. Type auto-generated - use it
import type { Project } from '@/generated'

// 3. Route loader with explicit return type
loader: async ({ params }): Promise<{ project: Project }> => {
  return { project: await fetchProject(params.projectId) }
}
```

### Common Pitfalls to Avoid

1. **Never use implicit any** - Run `pnpm types:fix --apply`
2. **Always use useShallow** - For Zustand store selectors
3. **Route loaders need explicit return types** - Validated automatically
4. **Check circular deps before merge** - `pnpm deps:circular`

---

**End of AGENTS.md - Total Lines: ~550**
