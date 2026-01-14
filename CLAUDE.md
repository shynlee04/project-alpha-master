# CLAUDE.md - AI Agent Instructions

> **Version:** 2.1.0 | **Updated:** 2026-01-17T08:00+07:00

---
**FOLLOWING ALL BMAD RULES AND GOVERNANVE** 

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
- `AGENTS.md`
- `CLAUDE.md` (this file)
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

---

## Context Loading Priority

**Order of reading (most important first):**

1. **This file** (CLAUDE.md) - Essential patterns (NON-NEGOTIABLE RULES above)
2. **AGENTS.md** - Project state & navigation
3. **bmm-workflow-status.yaml** - Current workflow
4. **sprint-status.yaml** - Active sprint details
5. **Story context** - Task-specific (e.g., `FS-05-context.xml`)
6. **Relevant standards** - From `agent-os/standards/` (see below)

### Mandatory Standards (Read Before Coding)

| Standard | Path | When Required |
|----------|------|---------------|
| API | `agent-os/standards/backend/api.md` | Any server function |
| Models | `agent-os/standards/backend/models.md` | New/modified entities |
| Queries | `agent-os/standards/backend/queries.md` | Dexie operations |
| Components | `agent-os/standards/frontend/components.md` | New/modified React |
| CSS | `agent-os/standards/frontend/css.md` | Any styling |
| Coding Style | `agent-os/standards/global/coding-style.md` | All code |
| Testing | `agent-os/standards/testing/test-writing.md` | Tests |

---

## 📅 Recent Updates (Rolling 7 days)

| Date | Update |
|------|--------|
| 2026-01-17 | **ADR-033 APPROVED** - PlatformContract, StorageGateway, FSA folder structure added |
| 2026-01-17 | Version 2.1.0 - EPIC-CC-ARC Sprint Planning complete, Week 1 execution starting |
| 2026-01-16 | Fixed useWorkspaceAccess hook, browser-mode.ts persistence |
| 2026-01-11 | NON-NEGOTIABLE BMAD RULES added (10 rules from master-orchestrator.md) |
| 2026-01-09 | Governance Overhaul: 6-cycle context poison reduction |

---

## 🚫 Critical Anti-Patterns

### Never Do These

```typescript
// ❌ WRONG: Multiple separate selectors
const items = useStore((s) => s.items);
const addItem = useStore((s) => s.addItem);

// ❌ WRONG: Deprecated path
import { something } from '@/lib/state/store';

// ❌ WRONG: Non-8-bit styling
<div className="rounded-lg backdrop-blur opacity-80">

// ❌ WRONG: Direct Dexie in components
const db = new Dexie('MyDB');

// ❌ WRONG: Untyped async handlers
const handleClick = async () => { ... }
```

### Always Do These

```typescript
// ✅ RIGHT: useShallow for multiple selectors
const { items, addItem } = useStore(
  useShallow((state) => ({
    items: state.items,
    addItem: state.addItem,
  }))
);

// ✅ RIGHT: Clean Architecture import
import { useProjectStore } from '@/infrastructure/persistence/stores/project-store';

// ✅ RIGHT: 8-bit styling
<div className="rounded-none shadow-[4px_4px_0_0]">

// ✅ RIGHT: Use store facades
import { db } from '@/infrastructure/persistence/dexie-db';

// ✅ RIGHT: Typed handlers with try-catch
const handleClick = async (): Promise<void> => {
  try { ... } catch (e) { ... }
}
```

---

## ⏱️ REALISTIC TIMING (Actual Data - NOT Estimates)

| Work Unit | Real Average | Example |
|-----------|--------------|---------|
| **Story (simple)** | 1-2 hours | FS-05: 1.5h, MOBILE stories: 1-2h |
| **Story (complex)** | 2-4 hours | 40-01 Tool Registry: ~3h |
| **Epic (6-8 stories)** | 4-8 hours | EPIC-40: 12 stories in one day |
| **Epic (mini 3-4)** | 2-4 hours | EPIC-39: 4 stories in one day |

### Velocity Reality
- **Stories/day**: 4-8 (varies by complexity)
- **Epics/day**: 1-3 (depends on size)
- **Exceptional**: 2-3 epics possible in flow state

### Time-Boxing (Realistic)
| Level | Duration | On Timeout |
|-------|----------|------------|
| Step | 15 min | Escalate to story |
| Story | 4 hours max | Split or continue |
| Deep Investigation | 30 min | Split story |
| Epic | 8 hours | Adjust scope |

---

## ✅ Import Pattern Reference

```typescript
// Framework imports
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';

// Third-party
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';

// Infrastructure (always @/)
import { useNoteStore } from '@/infrastructure/persistence/stores/note-store';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { Note } from '@/domain/types/note';

// Presentation
import { Button } from '@/presentation/components/ui/button';
import { useAI } from '@/presentation/hooks/use-ai';

// Relative (same module only)
import { formatDate } from './utils';
```

---

## 🗂️ File System Architecture (Current Focus)

**Epic:** EPIC-FS (File System Foundation)
**Progress:** 28.6%
**Current Story:** FS-05 (FileLockService)

### Key Files

| File | description |
|------|---------|
| `src/infrastructure/persistence/file-adapters/` | FSA/IDB adapters |
| `src/infrastructure/persistence/stores/note-store.ts` | Notes state |
| `src/infrastructure/sync/file-sync-service.ts` | Sync orchestration |
| `src/domain/services/file-lock-service.ts` | Lock management |
| `src/routes/notes.lazy.tsx` | Notes route |

### Storage Types

```typescript
type StorageType = 'fsa' | 'indexeddb';

// FSA = File System Access API (native folders)
// IndexedDB = Browser storage (always available)
```

---

## 🏗️ Architecture Layers

```
src/
├── routes/              # TanStack Router routes
├── presentation/        # React components, hooks
│   ├── components/     
│   └── hooks/          
├── domain/              # Business logic
│   ├── services/       
│   └── types/          
└── infrastructure/      # External interfaces
    ├── persistence/     # Stores, Dexie, adapters
    ├── sync/           
    └── events/         
```

---

## 🔒 ARCHITECTURAL BOUNDARIES (Non-Negotiable)

> **Source**: ADR-033 - Correct-Course Architectural Remediation
> **Updated**: 2026-01-17
> **Status**: APPROVED - All decisions final

### 🏛️ ADR-033 Key Decisions (NEVER DEVIATE)

| Decision | Rule | Enforcement |
|----------|------|-------------|
| **D1: Platform Detection** | Auto-detect ONCE at app start. Desktop=FSA, Mobile=IndexedDB | Never check device type at call sites |
| **D2: Storage Immutable** | Storage type set at project creation, never changes | Never decide FSA vs IndexedDB per operation |
| **D3: IDE Desktop Only** | IDE workspace blocked on mobile/tablet | Always redirect mobile to Notes |
| **D4: Notes on FSA** | Desktop notes save as `.md` files in `/project/notes/` | Same tech as IDE, bidirectional sync |
| **D5: Persist First** | Write to DexieDB FIRST, then update Zustand | Never update Zustand without DB success |
| **D6: Single Database** | Only `ViaGentDatabase` for all tables | Never create new Dexie databases |
| **D7: Path-Based IDs** | File IDs are relative paths from project root | Never use UUIDs for file identity |
| **D8: Metadata Folder** | `.viagent/` at project root for metadata | Never scatter metadata files |

### PlatformContract Interface (Canonical)

```typescript
// ALWAYS use this interface - defined in ARC-A01
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;        // Desktop only
  canWatchFiles: boolean;       // Desktop with FSA
  canRunTerminal: boolean;      // Desktop with WebContainer
  canDoAgenticCoding: boolean;  // Desktop with FSA + Terminal
  canAccessIDE: boolean;        // Desktop only
}

// ✅ CORRECT: Call once, use everywhere
const platform = getPlatformContract();
if (!platform.canAccessIDE) {
  redirect({ to: '/notes/$projectId', params });
}

// ❌ WRONG: Check device type at call site
if (navigator.userAgent.match(/mobile/i)) { ... }  // NEVER
if (window.innerWidth < 768) { ... }  // NEVER for routing
```

### StorageGateway Pattern (Mandatory for Phase B)

```typescript
// ALWAYS use StorageGateway - defined in ARC-B01
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
}

// ✅ CORRECT: Get gateway from factory
const gateway = StorageGatewayFactory.create(project.storageType);
await gateway.write('notes/welcome.md', content);

// ❌ WRONG: Decide storage type at call site
if (project.storageType === 'fsa') {
  await fsaAdapter.write(...);
} else {
  await idbAdapter.write(...);
}
```

### FSA Project Folder Structure (Standard)

```
/MyProject/                          ← FSA Project Root
├── .viagent/                        ← ViaGent metadata (hidden)
│   ├── project.json                 ← Project config (ID, name, bindings)
│   ├── notes-index.json             ← Note metadata (titles, order, favorites)
│   ├── file-tree-snapshot.json      ← Cached file tree for fast load
│   └── rag-index/                   ← Local RAG vectors (optional)
│
├── notes/                           ← Notes workspace content
│   ├── welcome.md                   ← Markdown files
│   └── assets/                      ← Embedded assets
│       └── image-abc123.png
│
├── src/                             ← Code (IDE workspace)
└── docs/                            ← Viewable in Notes OR IDE
```

### 6-Domain Architecture Contract

| Domain | Rule | Violation = Block |
|--------|------|-------------------|
| **D1: Identity & Routing** | Platform contract determined ONCE at app start | Never check device type at call sites |
| **D2: Storage Contract** | Storage type set at project creation, immutable | Never decide FSA vs IndexedDB per operation |
| **D3: State & Persistence** | Persist FIRST, then update Zustand | Never update Zustand without DexieDB |
| **D4: Entity Naming** | `projectId` = storage, `workspaceType` = UI enum | Never use `workspaceId` as entity ID |
| **D5: Database** | Single ViaGentDatabase for all tables | Never create new Dexie databases |
| **D6: File Tree** | ONE canonical location per concern | Never duplicate stores/adapters |

### Canonical File Locations (ONLY USE THESE)

```
✅ CANONICAL (Use these):
src/infrastructure/persistence/stores/project/    → Project Store
src/infrastructure/persistence/stores/note/       → Note Store
src/infrastructure/persistence/dexie-db.ts        → Single Dexie DB
src/infrastructure/filesystem/                    → All FS adapters
src/domain/services/                              → Business logic
src/domain/types/                                 → Domain types

❌ DEPRECATED (Never import from):
src/lib/workspace/project-store/                  → ARCHIVED
src/lib/filesystem/local-fs-adapter.ts            → ARCHIVED
src/lib/workspace/file-sync-status-store/         → ARCHIVED
src/lib/state/                                    → ARCHIVED
src/stores/                                       → NEVER EXISTED
```

### Storage Contract Pattern

```typescript
// ✅ CORRECT: Storage determined once at project creation
const project = await createProject({
  name: "My Project",
  storageType: getPlatformContract().storageType  // Set once, never changes
});

// ❌ WRONG: Storage decided at call site
if (isMobile) {
  await idbAdapter.write(...);
} else {
  await fsaAdapter.write(...);
}
```

### Persist-First Pattern (Mandatory)

```typescript
// ✅ CORRECT: Persist first, then Zustand
async createNote(input: CreateNoteInput): Promise<Note> {
  const note = generateNote(input);
  
  // Step 1: Persist to DexieDB FIRST (fail-fast)
  await db.notes.put(note);
  
  // Step 2: Update Zustand ONLY after persistence succeeds
  set((state) => ({ notes: [...state.notes, note] }));
  
  return note;
}

// ❌ WRONG: Zustand first (data loss risk)
async createNote(input: CreateNoteInput): Promise<Note> {
  const note = generateNote(input);
  set((state) => ({ notes: [...state.notes, note] }));  // Lost if DB fails!
  await db.notes.put(note);
  return note;
}
```

### Route Guard Pattern (All Workspace Routes)

```typescript
// ✅ CORRECT: Every workspace route has beforeLoad guard
export const Route = createFileRoute('/ide/$projectId')({
  beforeLoad: async ({ params }) => {
    const platform = getPlatformContract();
    
    // Platform check
    if (!platform.canAccessIDE) {
      throw redirect({ to: '/notes/$projectId', params });
    }
    
    // Project validation
    const project = await db.projects.get(params.projectId);
    if (!project) {
      throw redirect({ to: '/hub', search: { error: 'not-found' } });
    }
    
    return { project, platform };
  }
});
```

### Entity Naming Rules

| Term | Meaning | Type | Example |
|------|---------|------|---------|
| `projectId` | Storage container identity | `string` (UUID) | `"proj_abc123"` |
| `workspaceType` | UI context | `'ide' \| 'notes' \| 'knowledge' \| 'study'` | `"notes"` |
| `workspaceBindings` | Which workspaces can access project | `WorkspaceBindings` | `{ ide: true, notes: true }` |

```typescript
// ❌ NEVER: These patterns cause bugs
const id = workspaceId || projectId;  // Confusing fallback
const workspace = projects.find(p => p.workspaceId === id);  // Wrong field

// ✅ ALWAYS: Clear intent
const project = projects.find(p => p.id === projectId);
const canAccessIDE = project.workspaceBindings.ide;
```

---

## 🎨 8-bit Design Tokens

```css
/* Sharp corners only */
--radius-none: 0;
--radius-sm: 2px;

/* Pixel shadows */
--shadow-pixel: 4px 4px 0 0 var(--shadow-color);

/* Solid colors - no transparency */
--bg-solid: hsl(var(--background));
```

---

## 📋 Before Completing Any Story

```bash
# 1. TypeScript check
pnpm tsc --noEmit

# 2. Unit tests
pnpm vitest run

# 3. Lint check
pnpm lint

# 4. (If Epic complete) E2E
pnpm test:e2e
```

---

## 🔗 Full Reference

| Resource | Location |
|----------|----------|
| Complete project state | `AGENTS.md` |
| Architecture decisions | `_bmad-output/planning-artifacts/architecture.md` |
| UX system | `_bmad-output/planning-artifacts/ux-specification.md` |
| All standards | `agent-os/standards/` |
| Governance gates | `_bmad/modules/governance/checklists/` |
| Historical archives | `_bmad-output/.archive/` |

---

## 🚀 Session Quick Start

```
1. Read NON-NEGOTIABLE BMAD RULES above (CLAUDE.md) - DO NOT SKIP
2. Read AGENTS.md (project state)
3. Check bmm-workflow-status.yaml (current epic/story)
4. Load story context if assigned
5. Begin work
```

---


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