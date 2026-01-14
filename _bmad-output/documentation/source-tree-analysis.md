# Source Tree Analysis

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Annotated Directory Tree

```
project-alpha-master/
├── .claude/                    # Claude Code configuration
│   ├── AGENT-STATE.yaml        # Session state tracking
│   ├── rules/                  # Governance rules
│   ├── skills/                 # Claude Skills
│   └── ...
├── _bmad/                     # BMAD framework modules
│   ├── modules/                # Core modules (governance, architecture, sprint, testing)
│   └── bmm/                    # BMM implementation agents/workflows
├── _bmad-output/              # Generated artifacts (quality reports, documentation)
│   ├── documentation/          # This documentation
│   └── quality/                # Quality reports
├── agent-os/                  # Agent OS patterns
├── src/                       # Main source code
│   ├── application/            # Application layer (services)
│   │   └── services/          # Orchestration services
│   ├── components/             # Legacy components (being migrated)
│   ├── core/                   # Core entities
│   │   └── entities/          # Business entities
│   ├── domain/                 # Domain layer (business logic)
│   │   ├── entities/          # Domain entities
│   │   ├── services/          # Domain services (pure functions)
│   │   ├── use-cases/         # Application use cases
│   │   └── value-objects/     # Value objects
│   ├── infrastructure/         # Infrastructure layer
│   │   ├── events/            # Cross-workspace event bus
│   │   ├── persistence/       # Zustand stores + Dexie IndexedDB
│   │   │   ├── stores/        # Zustand stores (canonical location)
│   │   │   ├── dexie-db.ts    # IndexedDB schema
│   │   │   └── dexie-storage.ts
│   │   └── sync/             # File synchronization
│   ├── lib/                    # Legacy utilities (being consolidated)
│   │   ├── agent/            # AI agent infrastructure
│   │   ├── ide/              # IDE-specific utilities
│   │   ├── knowledge/        # Knowledge/RAG utilities
│   │   ├── notes/            # Notes utilities
│   │   ├── state/            # Legacy state ( migrating to infrastructure)
│   │   └── ...
│   ├── presentation/          # Presentation layer (UI components)
│   │   └── components/       # React components (468 files)
│   │       ├── ide/           # IDE workspace components
│   │       ├── knowledge/      # Knowledge workspace components
│   │       ├── notes/          # Notes workspace components
│   │       ├── study/          # Study workspace components
│   │       ├── agent/          # Agent configuration UI
│   │       ├── chat/           # Chat interface
│   │       └── ui/             # Reusable UI components
│   ├── routes/                 # TanStack Router file-based routes
│   │   ├── api/              # API endpoints (chat, flashcards, quizzes)
│   │   ├── workspace/        # Workspace-specific routes
│   │   └── index.tsx         # Root route
│   ├── shared/                # Shared code
│   ├── styles/                # Global styles
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── tests/                     # Playwright E2E tests
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

---

## Critical Directories Explained

### `/src/presentation/components` (468 files)

**description:** UI layer - React components for all workspaces

**Key Subdirectories:**
- `ide/` - Monaco editor, terminal, file tree, agent panel
- `knowledge/` - RAG UI, document import, canvas, indexing progress
- `notes/` - Note editor, AI transform menu, project selector
- `study/` - Flashcard viewer, quiz UI, progress tracking
- `agent/` - Agent configuration dialog, workspace permissions
- `chat/` - Chat interface, tool approval, streaming display
- `ui/` - Reusable components (Button, Dialog, Input, etc.)

### `/src/infrastructure/persistence/stores`

**description:** Zustand state management with Dexie IndexedDB persistence

**Key Stores by Domain:**
- `agents/` - Agent CRUD, workspace bindings, selection, events
- `conversation/` - Chat messages, threads, context window
- `project/` - Projects CRUD, workspace bindings, permissions
- `providers/` - LLM providers, models, API keys (encrypted)
- `workspace/` - Workspace context, switching, file system
- `ide/` - Editor state, terminal, explorer, layout
- `rag/` - RAG indexing, chunks, embeddings, search
- `knowledge/` - Collections, sources, synthesis
- `permissions/` - Tool trust levels, permissions
- `quiz/` - Flashcards, quizzes, questions

**Note:** Each store follows slice pattern with slices ≤120 lines

### `/src/domain`

**description:** Business logic - no framework dependencies

**Key Files:**
- `entities/agent.ts` - Agent entity with workspace bindings
- `services/agent-workspace-utils.ts` - Pure functions for workspace filtering
- `value-objects/workspace-type.ts` - Workspace type enum
- `value-objects/tool-permission.ts` - Tool permission value object

### `/src/lib`

**description:** Legacy utilities - being consolidated into infrastructure

**Status:** Migration in progress
- `state/` → Migrating to `infrastructure/persistence/stores/`
- Other lib folders remain for utilities

### `/src/routes`

**description:** TanStack Router file-based routing

**API Endpoints:**
- `api/chat.ts` - Chat completion endpoint
- `api/flashcards/generate.ts` - Flashcard generation
- `api/quizzes/generate.ts` - Quiz generation

**Workspace Routes:**
- `workspace/ide/` - IDE workspace
- `workspace/knowledge/` - Knowledge workspace
- `workspace/notes/` - Notes workspace
- `workspace/study/` - Study workspace

---

## Entry Points

### Application Entry
- `src/routes/index.tsx` - Root route component

### Route Entry Points
- `/` - Hub/workspace selector
- `/workspace/ide` - IDE workspace
- `/workspace/knowledge` - Knowledge workspace
- `/workspace/notes` - Notes workspace
- `/workspace/study` - Study workspace

### API Entry Points
- `/api/chat` - POST for chat completions
- `/api/flashcards/generate` - POST for flashcard generation
- `/api/quizzes/generate` - POST for quiz generation

---

## File Organization Patterns

### Store Organization (Canonical)

```
infrastructure/persistence/stores/
├── {domain}/
│   ├── {domain}-store.ts          # Combined store (≤300 lines)
│   ├── slices/                     # Focused slices (≤120 lines each)
│   │   ├── {domain}-{feature}-slice.ts
│   │   └── index.ts
│   ├── types.ts                    # Domain types
│   └── index.ts                    # Public exports
```

### Component Organization

```
presentation/components/
├── {workspace}/                    # Workspace-specific components
│   ├── {Workspace}Page.tsx        # Workspace entry (≤300 lines)
│   ├── {Feature}Panel.tsx
│   └── ...
└── ui/                            # Shared UI components
    ├── button.tsx
    ├── dialog.tsx
    └── ...
```

---

## Legacy vs Canonical Locations

### Migrated (Use Canonical Path)

| Legacy Path | Canonical Path | Status |
|-------------|----------------|--------|
| `src/lib/state/dexie-db.ts` | `src/infrastructure/persistence/dexie-db.ts` | ✅ Facade |
| `src/lib/state/dexie-storage.ts` | `src/infrastructure/persistence/dexie-storage.ts` | ✅ Facade |
| `src/lib/state/knowledge/*` | `src/infrastructure/persistence/stores/knowledge/` | ✅ Merged |
| `src/lib/state/ide-store.ts` | `src/infrastructure/persistence/stores/ide/` | ✅ Merged |

### To Migrate

| Legacy Path | Target Path | Priority |
|-------------|-------------|----------|
| `src/lib/workspace/*` | `src/infrastructure/persistence/stores/workspace/` | P1 |
| `src/lib/filesystem/*` | `src/infrastructure/persistence/stores/filesystem/` | P1 |
| `src/lib/notes/*` | `src/infrastructure/persistence/stores/notes/` | P1 |

---

## Configuration Files

| File | description |
|------|---------|
| `vite.config.ts` | Vite build configuration, COOP/COEP headers for WebContainer |
| `tsconfig.json` | TypeScript compiler options |
| `tsconfig.check.json` | TypeScript check config (excludes tests, ~3x faster) |
| `tailwind.config.js` | Tailwind CSS configuration |
| `i18next-scanner.config.cjs` | Translation extraction config |
| `vitest.config.ts` | Unit test configuration |
| `playwright.config.ts` | E2E test configuration |

---

## Build Output

```
dist/                          # Production build output
├── client/                    # Client-side bundle
└── server/                    # Server-side bundle
    ├── index.js              # Server entry point
    └── ...
```

---

## Excluded from Scan

```
node_modules/                  # Dependencies
dist/                         # Build output
.git/                         # Version control
.bmad/                        # BMAD framework (not app code)
.claude/                      # Claude Code config
.opencode/                    # Open Code config
.repomix-output*             # Repomix artifacts
```

---

## File Statistics

| Category | Count |
|----------|-------|
| Source directories | 90+ |
| Presentation components | 468 |
| Zustand stores | 50+ |
| API endpoints | 3 |
| Test files | 100+ |
| TypeScript files | 1363 |
| Lines of code (production) | ~172,582 |
