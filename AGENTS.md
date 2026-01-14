# AGENTS.md - Project Alpha Governance

> **Version:** 2.2.0 | **Updated:** 2026-01-17T08:00+07:00 | **Health:** 75%

---
#*FOLLOWING ALL BMAD RULES AND GOVERNANVE** 

There are alot and detail of each but these certain things are the most annoying shit that all agents must obey:

- UX and UI following 8bit design, no transparent background **NO HARD CODED** CSS, beware of multi-pane, complex, stacked, layered, advanced ui ->> must responsive and must support portrait phone screen as desktop screen

- Language strings NOT hardcoded - both translated to English and Vietnamese

- Code tree, files modification, creation. removal (track, check and validate for overlapping, conflict) - start splitting code if about reaching thresold of 400 lines (500 and more are not accepted) - absolutely no God class

- Keep structure and architecture aligned, refactored and orgnanized

-  Never pass gatekeeping without evidence of success and validation

- Debug intelligently, especially errors of types, schema and logic -- export to files (txt, log, md whatever) -> reason deeply, fix progressively -> once all completed then run tool check (do not wast resource)

- There are two teams A and B - coordinate to the correct team assigned keep status updated

- ALWAYS DRY-CHECK, DRY-DOUBLE-CHECK FOR SYNTEAX ERRORS BEFORE DECIDING TO RUN TOOLS OR TESTS. 

- No more than 2 background tasks at a time, kill them before use new

- MCP tools and servers are absolutely important to check and use often

## 🔴 NON-NEGOTIABLE BMAD RULES (Must Obey At All Times)

## DO NOT RUN TYPESCRIPT check MANY TIMES --> IT IS BEST THAT YOU SAVE IT INTO TXT FILE -> ONLY ONCE ALL ERRORS ARE HANDLED CHECK WILL BE RUN AGAIN

> **Source**: `_bmad-ext/orchestrator/master-orchestrator.md` | **Applies**: All platforms, workflows, iterations

### 1. ANCHOR VERIFICATION (Anti-Hallucination)
**BEFORE any autonomous work**, verify human intent freshness:
```
IF (NOW() - anchor.human_intent_timestamp) > staleness_threshold:
  → PROMPT USER: Continue/New/Reset/View
  → DO NOT proceed until confirmed
```
- Stale anchor = **STOP** all work immediately
- See: `_bmad-ext/state/LOOP_STATE.yaml`

### 2. ROUTING (Sprint-Planning Wrapper)
**ALL stories must route through Sprint-Planning Wrapper first**:
```
bmm-workflow-status.yaml → Sprint-Planning Wrapper → Enhanced Agent
                        ├── Cohesion Check
                        ├── Dependency Map
                        └── Reality Validation
```
- Cohesion failure = Story cannot start
- Dependency conflict = Block until resolved
- Reality failure = Feature is "ghost" or "zombie"

### 3. PRODUCT REALITY GATES (Enforced Via Story-Cycle)
| Gate | Step | Validates | Blocks If |
|------|------|-----------|-----------|
| **UX Gate** | 01a | User Journey | `island_feature`, `split_brain`, `ghost_result`, `dead_end` |
| **Brain Gate** | 03a | Agent Tool Spec | `orphan_tool`, `permission_gap`, `vague_trigger` |
| **Visual Gate** | 06a | Reality Check | `visual_break`, `missing_state`, `zombie_feature` |

### 4. HANDOFF PROTOCOL (Every Agent Transition)
**ALL agent-to-agent handoffs MUST have**:
- Unique UUID (`handoff_id`)
- Parent/child link (`parent_id`)
- Context summary
- Acceptance criteria
- Escalation path
See: `_bmad-ext/schemas/handoff-artifact.schema.yaml`

### 5. LOOP STATE (Always Current)
**AFTER any state change**, update `_bmad-ext/state/LOOP_STATE.yaml`:
```
- session.id
- current.story_id, epic_id, agent, workflow
- delegations (active/completed/failed)
- errors.count, errors.last_error
- anchor.human_intent_timestamp
```

### 6. GOVERNANCE UPDATES (Auto-Maintained)
**AFTER every 3 stories completed**, auto-update:
- `AGENTS.md` (this file)
- `CLAUDE.md`
- `bmm-workflow-status.yaml`
- Sprint status files

### 7. CONTINUATION DECISION (Check Before Next)
```
CONTINUE IF:
  ✅ More stories pending
  ✅ No critical errors (errors.count == 0)
  ✅ Anchor fresh (< staleness_threshold)
  ✅ No user interrupt

STOP IF:
  ❌ All stories complete
  ❌ Critical error
  ❌ Anchor stale (await confirmation)
  ❌ User interrupt
```

### 8. PLATFORM ROUTING
| Task Type | Platform | Priority |
|-----------|----------|----------|
| Code Generation | Claude Code | 92% |
| Documentation | OpenCode | 89% |
| Real-World Testing | Both | 95% |
| Sprint Execution | Both | 91% |
| Architecture | Claude Code | 94% |

### 9. DELEGATION FLOW
```
master-orchestrator → Sprint-Planning Wrapper → Enhanced Agent
                       (Cohesion/Dependency/     (dev-ext, architect-ext,
                        Reality checks)           analyst-ext, etc.)
                            ↓                           ↓
                     [SUCCESS/PARTIAL/FAILED] → Callback to orchestrator
                            ↓
                     Update LOOP_STATE + Governance
                            ↓
                     Continue or Stop decision
```

### 10. ESSENTIAL FILES (Read These First)
| File | description | When |
|------|---------|------|
| `_bmad-ext/orchestrator/master-orchestrator.md` | Central brain | Every session |
| `_bmad-ext/orchestrator/routing-rules.yaml` | Agent routing | Before delegating |
| `_bmad-ext/orchestrator/delegation-protocol.md` | Handoff format | Every handoff |
| `_bmad-ext/orchestrator/escalation-protocol.md` | Failure handling | On failure |
| `_bmad-ext/state/LOOP_STATE.yaml` | Session state | Start + updates |
| `_bmad-ext/state/ARTIFACT_REGISTRY.yaml` | Artifact tracking | After creation |
| `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md` | **Master ADR for architecture** | Before any refactoring |
| `_bmad-output/sprint-artifacts/epic-cc-arc-sprint-2026-01-17.yaml` | Current sprint status | Check story assignments |

---

## 🏛️ ADR-033: ARCHITECTURAL DECISIONS (PERMANENT - NEVER DEVIATE)

> **Source**: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
> **Status**: APPROVED - All decisions final
> **Updated**: 2026-01-17

### Platform & Storage Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Storage Type Selection** | Auto-detect, NO user choice | Desktop=FSA, Mobile=IndexedDB. Simplifies UX |
| **Desktop Storage** | FSA (File System Access API) | Required for agentic coding |
| **Mobile/Tablet Storage** | IndexedDB (Dexie) | FSA not supported on mobile |
| **IDE Access** | Desktop only | FSA required for file CRUD |
| **Mobile IDE Behavior** | Block and redirect to Notes | Clear UX boundary |

### FSA & Handle Persistence

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Handle Storage** | Store `FileSystemDirectoryHandle` in IndexedDB | Chrome DevRel recommended |
| **Permission Persistence** | Use Chrome 122+ "Allow on every visit" | Research confirmed |
| **File Watching** | FileSystemObserver (129+), polling fallback | Native when available |
| **Fast Load Strategy** | Snapshot in Dexie, diff in background | No waiting on rescan |

### Notes Storage for FSA Desktop

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Notes Location** | FSA folder (`/project/notes/*.md`) | Same tech as IDE, reactive |
| **Sync Direction** | Bidirectional (BlockNote ↔ Markdown) | External editor support |
| **Conflict Resolution** | Merge dialog if local dirty + external change | User decides |
| **Autosave Debounce** | 500ms | Balance responsiveness and I/O |

### Project Structure

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Metadata Folder** | `.viagent/` at project root | Hidden, consistent |
| **Notes Folder** | `/notes/` (configurable) | Separate from code |
| **Assets Folder** | `/notes/assets/` | Embedded media |
| **File IDs** | Path-based (relative from root) | FSA uses paths, debuggable |

### Mobile Project Model

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Project Count** | Single default (`notes:browser-mode`) | Simpler for MVP |
| **Desktop Without Project** | Must create/select project first | Consistent with FSA model |

### Database Keys

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Composite Keys** | Keep `[projectId+workspaceId]` | Intentional isolation per workspace |

### Nested Folder Rules

| Scenario | Behavior |
|----------|----------|
| **Same path** | Block - cannot create duplicate |
| **Child of existing** | Warn - allow if user confirms |
| **Parent of existing** | Warn - allow if user confirms |
| **Sibling** | Allow - no overlap |

### File Discovery Limits

| Setting | Default |
|---------|---------|
| **Max Depth** | 20 |
| **Warn At Depth** | 15 |
| **Max Files** | 50,000 |
| **Max Total Size** | 500MB |

### Default Exclusions

```
node_modules, .git, .next, .nuxt, dist, build, out,
.cache, coverage, __pycache__, .venv, venv, .idea
```

### FSA Project Folder Structure (Canonical)

```
/MyProject/                          ← FSA Project Root
├── .viagent/                        ← ViaGent metadata folder
│   ├── project.json                 ← Project config (ID, name, bindings)
│   ├── notes-index.json             ← Note metadata (titles, order, favorites)
│   ├── file-tree-snapshot.json      ← Cached file tree for fast load
│   └── rag-index/                   ← Local RAG vectors (optional)
│       ├── chunks.json
│       └── embeddings.bin
│
├── notes/                           ← Notes workspace content
│   ├── welcome.md                   ← Markdown file
│   └── assets/                      ← Embedded assets
│       └── image-abc123.png
│
├── src/                             ← Code (IDE workspace)
│   └── index.ts
│
└── docs/                            ← Viewable in Notes OR IDE
    └── api.md
```

### PlatformContract Interface (Use This Everywhere)

```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}

// Usage: Call ONCE, use everywhere
const platform = getPlatformContract();
```

### StorageGateway Interface (Use This for All I/O)

```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
}

// Usage: Get from factory based on project.storageType
const gateway = StorageGatewayFactory.create(project.storageType);
```

---

## 🗂️ FILE TREE GOVERNANCE (Strict Enforcement)

> **Source**: `_bmad-output/planning-artifacts/correct-course-architectural-remediation-2026-01-16.md`
> **Updated**: 2026-01-16
> **Enforcement**: MANDATORY - All file changes must follow these rules

### Canonical Directory Structure

```
src/
├── routes/                          # TanStack Router ONLY
│   ├── __root.tsx                   # Root layout
│   ├── index.tsx                    # Hub entry
│   ├── notes.lazy.tsx               # Notes workspace route
│   ├── notes.$projectId.lazy.tsx    # Notes with project
│   ├── ide.$projectId.tsx           # IDE workspace route
│   ├── knowledge.$projectId.tsx     # Knowledge workspace route
│   └── study.$projectId.tsx         # Study workspace route
│
├── presentation/                    # React UI ONLY
│   ├── components/                  # UI components
│   │   ├── ui/                      # Design system primitives
│   │   ├── common/                  # Shared components
│   │   ├── notes/                   # Notes-specific
│   │   ├── ide/                     # IDE-specific
│   │   ├── knowledge/               # Knowledge-specific
│   │   └── study/                   # Study-specific
│   └── hooks/                       # React hooks (UI concerns only)
│
├── domain/                          # Business Logic ONLY
│   ├── entities/                    # Domain entities (Project, Agent, etc.)
│   ├── services/                    # Domain services
│   ├── types/                       # Domain types
│   └── interfaces/                  # Repository interfaces
│
├── infrastructure/                  # External Interfaces ONLY
│   ├── persistence/                 # Data persistence
│   │   ├── dexie-db.ts              # Single DexieDB (ViaGentDatabase)
│   │   └── stores/                  # Zustand stores (canonical location)
│   │       ├── project/             # Project store
│   │       ├── note/                # Note store
│   │       ├── agents/              # Agent stores
│   │       └── workspace/           # Workspace stores
│   ├── filesystem/                  # File system adapters
│   │   ├── fsa-storage-adapter.ts   # FSA adapter (desktop)
│   │   ├── platform-detection.ts    # Platform contract
│   │   └── StorageAdapterFactory.ts # Storage factory
│   ├── sync/                        # Sync services
│   └── events/                      # Event bus
│
└── lib/                             # LEGACY - Migrate to above
    ├── utils.ts                     # Keep (utility functions)
    └── [everything else]            # DEPRECATED - Do not add new files
```

### File Change Rules

| Action | Rule | Gatekeeping |
|--------|------|-------------|
| **CREATE** | Only in canonical directories | Block if in `src/lib/` (except utils) |
| **MODIFY** | Check canonical location first | If duplicate exists, modify canonical only |
| **DELETE** | Archive to `_bmad-ext/.archive/` first | Never delete without archive |
| **MOVE** | Create facade re-export at old path | Maintain backward compatibility |

### Deprecated Directories (Do NOT Add Files)

```
❌ DEPRECATED - NEVER ADD NEW FILES:
src/lib/workspace/                   # Migrate to infrastructure/persistence/stores/
src/lib/filesystem/                  # Migrate to infrastructure/filesystem/
src/lib/state/                       # Migrate to infrastructure/persistence/stores/
src/lib/sync/                        # Migrate to infrastructure/sync/
src/lib/storage/                     # Migrate to infrastructure/persistence/
src/stores/                          # NEVER EXISTED - Do not create
```

### Files Pending Archive (Do Not Modify)

```
⚠️ PENDING ARCHIVE - DO NOT MODIFY:
src/lib/workspace/project-store/project-crud-slice.ts    # STUB - use infrastructure version
src/lib/workspace/fsa-persistence.ts.bak*                # Dead code
src/lib/workspace/file-sync-status-store/                # Duplicate
src/lib/filesystem/local-fs-adapter.ts                   # Duplicate
```

### File Change Tracking Template

When modifying files, document in story artifact:

```yaml
file_changes:
  created:
    - path: "src/infrastructure/filesystem/platform-detection.ts"
      reason: "ARC-A01: Platform contract implementation"
      lines: 120
  modified:
    - path: "src/routes/ide.$projectId.tsx"
      reason: "ARC-A02: Add route guard"
      lines_changed: 25
  archived:
    - path: "src/lib/workspace/project-store/"
      archive_path: "_bmad-ext/.archive/project-store-2026-01-16/"
      reason: "ARC-E02: Consolidated to infrastructure"
  deleted:
    - path: "src/lib/workspace/fsa-persistence.ts.bak"
      reason: "ARC-E01: Dead code cleanup"
```

---

## ⏱️ REALISTIC TIMING GOVERNANCE (Based on Actual Data)

> **Source**: `bmm-workflow-status.yaml` timing analysis | **Applies**: Epic/Story planning

### Actual Timing Data (NOT Estimates)

| Work Unit | Real Average | Historical Data |
|-----------|--------------|-----------------|
| **Story (simple)** | 1-2 hours | FS-05: 1.5h, MOBILE stories: 1-2h each |
| **Story (complex)** | 2-4 hours | 40-01 Tool Registry: ~3h with full cycle |
| **Epic (6-8 stories)** | 4-8 hours | EPIC-40: 12 stories in one day |
| **Epic (mini 3-4 stories)** | 2-4 hours | EPIC-39: 4 stories in one day |
| **Sprint Planning Wrapper** | 5-15 min | Cohesion + Dependency + Reality checks |
| **Agent Handoff** | < 5 min | UUID + callback processing |

### Planning Guidelines (Reality-Based)

```
✅ REALISTIC STORY ESTIMATES:
   - Simple fix/refactor: 1 hour
   - Feature implementation: 2-3 hours
   - Complex feature: 3-4 hours
   
✅ REALISTIC EPIC ESTIMATES:
   - Mini epic (3-4 stories): 4-6 hours
   - Standard epic (6-8 stories): 8-12 hours
   - Large epic (10+ stories): 16-24 hours (split recommended)

❌ AVOID EXCESSIVE ESTIMATES:
   - Don't estimate "1 day per story" - too slow
   - Don't estimate "1 week per epic" - demotivating
   - Trust autonomous agent velocity (2-3 stories/day is normal)
```

### Time-Boxing (Corrected from Excessive Values)

| Level | Duration | Monitoring | On Timeout |
|-------|----------|------------|------------|
| **Step** | 15 min | Every 5 min | Escalate to story |
| **Story** | 4 hours max | Every 15 min | Split story or continue |
| **Deep Investigation** | 30 min | Every 10 min | Split story, defer remainder |
| **Epic** | 8 hours | Every 30 min | Assess progress, adjust scope |

### Why Old Estimates Were Wrong

| Old Value | Problem | Real Behavior |
|-----------|---------|---------------|
| Story: 30 min | Too short - causes anxiety, ignored | 1-4 hours normal |
| Epic: 4 hours | Realistic for some, but not minimum | 2-3 epics/day is normal |
| Step: 5 min | Too short for meaningful work | 15 min minimum |

### Velocity Tracking

```
NORMAL VELOCITY (Autonomous Mode):
- Stories per day: 4-8 (varies by complexity)
- Epics per day: 1-3 (depends on size)
- Sprint velocity: 12-20 stories/week

EXCEPTIONAL DAYS:
- When flow state: 2-3 epics possible
- When blocked: 0-1 stories
- Average over time: ~5 stories/day
```

---

## ⚡ Quick Reference (Always Read First)

| Key | Value |
|-----|-------|
| **Current Phase** | EPIC-CC-ARC Week 1 |
| **Active Epic** | EPIC-CC-ARC (Architectural Remediation) |
| **Team A Story** | ARC-A01: Create getPlatformContract() |
| **Team B Story** | ARC-B01: Create StorageGateway (blocked by A01) |
| **Sprint File** | `epic-cc-arc-sprint-2026-01-17.yaml` |
| **ADR** | ADR-033 (APPROVED) |
| **TypeScript Errors** | 0 ✅ |
| **Completed Stories** | ARC-A03, ARC-B04 |

---

## 📍 Navigation Index

| What You Need | Where To Find It |
|---------------|------------------|
| Workflow Status | `bmm-workflow-status.yaml` |
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` |
| Story Index | `_bmad-output/sprint-artifacts/stories/STORY-INDEX.md` |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` |
| UX Specification | `_bmad-output/planning-artifacts/ux-specification.md` |
| PRD | `_bmad-output/planning-artifacts/prd.md` |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` |
| Standards | `agent-os/standards/` |
| Governance Gates | `_bmad/modules/governance/checklists/` |

---

## 🚫 Non-Negotiable Rules

### 1. Never Skip Build Validation

```bash
pnpm tsc --noEmit && pnpm vitest run
```

Run BEFORE claiming any story complete.

### 2. Clean Architecture Paths

```
✅ CORRECT:
  src/infrastructure/persistence/stores/    → Zustand stores
  src/infrastructure/persistence/dexie/     → Dexie DB
  src/infrastructure/sync/                  → File sync logic
  src/domain/services/                      → Domain services
  src/domain/types/                         → Domain types
  src/presentation/components/              → React components
  src/presentation/hooks/                   → Custom hooks
  src/routes/                               → TanStack Router routes

❌ DEPRECATED (Never use):
  src/lib/state/
  src/stores/
  src/lib/filesystem/sync-manager
```

### 3. Import Order

```typescript
// 1. React/Framework
import React from 'react';
import { useParams } from '@tanstack/react-router';

// 2. Third-party
import { useShallow } from 'zustand/react/shallow';

// 3. Infrastructure (with @/)
import { useProjectStore } from '@/infrastructure/persistence/stores/project-store';

// 4. Domain
import type { Project } from '@/domain/types/project';

// 5. Presentation
import { Button } from '@/presentation/components/ui/button';

// 6. Relative
import { localHelper } from './utils';
```

### 4. Zustand Store Pattern

```typescript
// ✅ ALWAYS use useShallow for multiple selectors
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

### 5. 8-bit Design System

```css
/* ✅ REQUIRED */
border-radius: 0;           /* Sharp corners */
border-radius: 2px;         /* Minimal rounding only */
box-shadow: 4px 4px 0 0;    /* Pixel shadows */

/* ❌ FORBIDDEN */
border-radius: 0.5rem;      /* Too rounded */
border-radius: 9999px;      /* Pill shape */
backdrop-filter: blur();    /* Glassmorphism */
opacity: 0.8;               /* Avoid - use solid */
```

### 6. Epic Ordering

Epic numbers are **MONOTONIC**:
- Epic N cannot start until Epic N-1 is 80%+
- Story IDs are sequential within epic
- Never skip story numbers

### 7. Development Standards (Mandatory)

**Before writing any code, consult these standards:**

| Standard | Location | When to Use |
|----------|----------|-------------|
| **API Patterns** | `agent-os/standards/backend/api.md` | Server functions, validation |
| **Migrations** | `agent-os/standards/backend/migrations.md` | Dexie schema changes |
| **Domain Models** | `agent-os/standards/backend/models.md` | Entity definitions |
| **Query Patterns** | `agent-os/standards/backend/queries.md` | Dexie CRUD operations |
| **Components** | `agent-os/standards/frontend/components.md` | React component structure |
| **CSS/8-bit** | `agent-os/standards/frontend/css.md` | Styling rules |
| **Coding Style** | `agent-os/standards/global/coding-style.md` | Import order, naming |
| **Validation** | `agent-os/standards/global/validation.md` | Zod schemas |
| **Testing** | `agent-os/standards/testing/test-writing.md` | Vitest/Playwright |

**Non-compliance = Story Rejection.**

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
| AI | Google Gemini (via @tanstack/ai-gemini) |

### Workspaces

| Route | Description |
|-------|-------------|
| `/notes` | Markdown/BlockNote editor |
| `/ide` | WebContainer-based IDE |
| `/study` | Flashcards/Quizzes |
| `/knowledge` | Knowledge base |
| `/marketing` | Landing page builder |
| `/settings` | API keys, Vault, Config |

### Active Epics

| ID | Name | Progress | Priority |
|----|------|----------|----------|
| EPIC-FS | File System Foundation | 28.6% | P0 |
| EPIC-39 | 8-bit Design Compliance | 0% | P1 |
| EPIC-38 | Architecture Extension | BLOCKED | P2 |

---

## 📦 Module References

| Module | Location | description |
|--------|----------|---------|
| Governance | `_bmad/modules/governance/` | Gates, cycles, regulation |
| Integration Testing | `_bmad/modules/integration-testing/` | Playwright, API keys |
| Architecture Remediation | `_bmad/modules/architecture-remediation/` | ARC loop |

---

## 🔗 External References

For detailed documentation:

- **Full BMAD Framework**: `_bmad/FRAMEWORK.md`
- **ADR Decisions**: `_bmad-output/planning-artifacts/architecture/adr/`
- **Historical Content**: `_bmad-output/.archive/`
- **Standards (Full)**: `agent-os/standards/`

---

## 📋 Governance Gates

Before any workflow:

1. **Story Start**: Run `story-start-gate.yaml` checks
2. **Story Done**: Run `story-done-gate.yaml` checks
3. **Epic Done**: Run `epic-done-gate.yaml` (requires human `APPROVED: EPIC-XX`)
4. **Daily**: Run `sprint-rotation-gate.yaml`
5. **All**: Check `artifact-freshness-gate.yaml` TTL tiers

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

## 🚀 Quick Start for New Agent Session

1. Read this file (AGENTS.md)
2. Check `bmm-workflow-status.yaml` for current story
3. Load `sprint-status.yaml` for active work
4. Load story context: `stories/{story-id}-context.xml`
5. Begin work using dev-story workflow

## DEVELOPMENT GUIDELINES -  THE RESEARCH USING INTERNET-BASED TOOLS OF MCP SERVERS ARE **NON-NEGOTIABLE**  (when these agents, tools uses, ai, llms, multimodality, endpoints, or any dependencies packages are arraised in the keywords - even you are dev agent, to start the session of context collecting you must at least make 3 successful and relevant call to online-based or pull official and relevant documents and guides to ensure following the 2026 patterns)


## Dependencies Github repos and docs links:
Based on my research, here's a comprehensive list of official documentation and GitHub repository links for your stack dependencies:

## Core UI & Component Libraries

### @radix-ui (Dialog, Dropdown Menu, Label, Select, Separator, Slot, Switch, Tabs)
- **Docs**: [https://www.radix-ui.com/primitives](https://www.radix-ui.com/primitives)[1]
- **GitHub**: [https://github.com/radix-ui/primitives](https://github.com/radix-ui/primitives)[2]

### @monaco-editor/react
- **Docs**: [https://github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)[3]
- **GitHub**: [https://github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)[3]

### monaco-editor
- **Docs**: [https://microsoft.github.io/monaco-editor/](https://microsoft.github.io/monaco-editor/)[4]
- **GitHub**: [https://github.com/microsoft/monaco-editor](https://github.com/microsoft/monaco-editor)[5]

### lucide-react
- **Docs**: [https://lucide.dev](https://lucide.dev)[6]
- **GitHub**: [https://github.com/lucide-icons/lucide](https://github.com/lucide-icons/lucide)[7]

## Styling & Theming

### tailwindcss & @tailwindcss/vite
- **Docs**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)[8]
- **GitHub**: [https://github.com/tailwindlabs/tailwindcss.com](https://github.com/tailwindlabs/tailwindcss.com)[9]

### class-variance-authority
- **Docs**: [https://cva.style](https://cva.style)[10]
- **GitHub**: [https://github.com/joe-bell/cva](https://github.com/joe-bell/cva)[10]

### next-themes
- **Docs**: [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)[11]
- **GitHub**: [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)[11]

### clsx & tailwind-merge
- **clsx GitHub**: [https://github.com/lukeed/clsx](https://github.com/lukeed/clsx)
- **tailwind-merge GitHub**: [https://github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge)

## TanStack Ecosystem

### @tanstack/react-router, @tanstack/react-router-devtools, @tanstack/react-router-ssr-query, @tanstack/react-start, @tanstack/router-plugin
- **Docs**: [https://tanstack.com/router](https://tanstack.com/router)[12]
- **GitHub**: [https://github.com/TanStack/router](https://github.com/TanStack/router)[13]

### @tanstack/ai, @tanstack/ai-gemini, @tanstack/ai-react
- **Docs**: [https://tanstack.com/ai](https://tanstack.com/ai)[14]
- **GitHub**: [https://github.com/TanStack/ai](https://github.com/TanStack/ai)[15]

### @tanstack/store
- **Docs**: [https://tanstack.com](https://tanstack.com)[16]
- **GitHub**: [https://github.com/TanStack](https://github.com/TanStack)

### @tanstack/react-devtools
- **Docs**: [https://tanstack.com](https://tanstack.com)[16]
- **GitHub**: [https://github.com/TanStack](https://github.com/TanStack)

## Data & State Management

### zustand
- **Docs**: [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)[17]
- **GitHub**: [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)[18]

### dexie & dexie-react-hooks
- **Docs**: [https://dexie.org](https://dexie.org)[19]
- **GitHub**: [https://github.com/dexie/Dexie.js](https://github.com/dexie/Dexie.js)[20]

### idb
- **Docs**: [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)[21]
- **GitHub**: [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)[21]

### zod
- **Docs**: [https://zod.dev](https://zod.dev)[22]
- **GitHub**: [https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)[23]

## Development Tools & Utilities

### @webcontainer/api
- **Docs**: [https://developer.stackblitz.com/platform/api/webcontainer-api](https://developer.stackblitz.com/platform/api/webcontainer-api)[24]
- **GitHub**: [https://github.com/stackblitz/webcontainer-docs](https://github.com/stackblitz/webcontainer-docs)[25]

### @xterm/xterm & @xterm/addon-fit
- **Docs**: [http://xtermjs.org](http://xtermjs.org)[26]
- **GitHub**: [https://github.com/xtermjs/xterm.js](https://github.com/xtermjs/xterm.js)[27]

### isomorphic-git
- **Docs**: [https://isomorphic-git.org](https://isomorphic-git.org)[28]
- **GitHub**: [https://github.com/isomorphic-git/isomorphic-git](https://github.com/isomorphic-git/isomorphic-git)[29]

## Internationalization

### i18next, i18next-browser-languagedetector, react-i18next
- **Docs**: [https://www.i18next.com](https://www.i18next.com)[30]
- **GitHub**: [https://github.com/i18next/i18next](https://github.com/i18next/i18next)[31]

## UI Utilities

### react-resizable-panels
- **Docs**: [https://react-resizable-panels.vercel.app](https://react-resizable-panels.vercel.app)[32]
- **GitHub**: [https://github.com/bvaughn/react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)[33]

### sonner
- **Docs**: [https://sonner.emilkowal.ski](https://sonner.emilkowal.ski)
- **GitHub**: [https://github.com/emilkowalski/sonner](https://github.com/emilkowalski/sonner)

### eventemitter3
- **Docs**: [http://nodejs.org/api/events.html](http://nodejs.org/api/events.html)[34]
- **GitHub**: [https://github.com/primus/eventemitter3](https://github.com/primus/eventemitter3)[34]

## Observability

### @sentry/react
- **Docs**: [https://docs.sentry.io/platforms/javascript/guides/react/](https://docs.sentry.io/platforms/javascript/guides/react/)[35]
- **GitHub**: [https://github.com/getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript)[36]

## React Core

### react & react-dom
- **Docs**: [https://react.dev](https://react.dev)
- **GitHub**: [https://github.com/facebook/react](https://github.com/facebook/react)

### vite-tsconfig-paths
- **GitHub**: [https://github.com/aleclarson/vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths)

- Use innate search tools, grep, etc. for codebase exploration
- Use Context7 MCP tools for official documentation (2 sequential steps per turn based on scoring)
- Use Deepwiki for semantic questions about specific tech stacks (TanStack Router, WebContainer, xterm.js, etc.)
- Use Tavily and Exa MCP tools for semantic repo search
- Use Repomix MCP tools for granular codebase analysis
- Create controlled documents/artifacts with IDs, variables, naming, date stamps for context preservation
- Prioritize iteration, insertion, updates on single-source of truth
- When generating new files, isolate with new

---

## TanStack MCP Server (Official)

**Critical Tool for TanStack Ecosystem Research** - Agents MUST use this for all TanStack documentation queries.

### Configuration

| Property | Value |
|----------|-------|
| **Server URL** | `https://tanstack.com/api/mcp` |
| **API Key** | `ts_bdd5ade6ba81622c4855582aaf830e44d337d22680decf9301b3cb95f950d92b` |
| **Transport** | Streamable HTTP |
| **Auth** | OAuth (browser-based) |

### Available Tools

#### Documentation Tools

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `list_libraries` | List all TanStack libraries with versions and metadata | No |
| `get_doc` | Fetch specific documentation page by library and path | No |
| `search_docs` | Full-text search across all TanStack documentation | No |

#### NPM Stats Tools

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `get_npm_stats` | Get aggregated download stats for TanStack or a library | No |
| `list_npm_comparisons` | List preset package comparisons | No |
| `compare_npm_packages` | Compare download stats for multiple packages | No |
| `get_npm_package_downloads` | Get detailed historical downloads for a package | No |

### Supported Libraries

- **@tanstack/react-router**, `@tanstack/react-router-devtools`, `@tanstack/react-router-ssr-query`
- **@tanstack/react-start**, `@tanstack/router-plugin`
- **@tanstack/ai**, `@tanstack/ai-gemini**, `@tanstack/ai-react`
- **@tanstack/store**, `@tanstack/react-devtools`
- And all other TanStack packages

### Usage Examples

```typescript
// Search for router documentation
await search_docs({ query: "route params navigation" });

// Get specific library info
await list_libraries();

// Get npm stats comparison
await compare_npm_packages({
  packages: ["@tanstack/react-router", "@tanstack/query"]
});
```

### Integration Notes

- AI assistants can access **current documentation** for all TanStack libraries
- **Version-specific docs** available for exact versions in use
- **Full-text search** across all TanStack documentation
- Fetches directly from TanStack GitHub repositories for most current content