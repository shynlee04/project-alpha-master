# Roadmap: Project Alpha

## Overview

Transform Project Alpha from a contaminated codebase (1,734 violations across workspace terminology and import paths) into a production-ready AI-powered development IDE. The journey starts with safety preparation and foundation cleanup, then builds Platform Operators (FileTree, Chat-Cascade), integrates AI tool execution, adds Feature Modules (Monaco, Notes), implements RAG, and finishes with Terminal/Preview and polish.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)
- Phases -1 and 0: Preparation and cleanup before feature work

- [ ] **Phase -1: Preparation** — Establish safety nets before destructive refactoring
- [ ] **Phase 0: Foundation Cleanup** — Eliminate 1,734 violations and consolidate types
- [ ] **Phase 1: Platform Operators** — FileTree + Chat-Cascade + Layout recovery
- [ ] **Phase 2: AI Integration** — Tool execution pipeline + multi-provider gateway
- [ ] **Phase 3: Feature Modules** — Monaco editor + Notes with AI features
- [ ] **Phase 4: RAG System** — Orama integration + file/thread indexing
- [ ] **Phase 5: Terminal, Preview & Polish** — WebContainer + error handling + UX

## Phase Details

### Phase -1: Preparation
**Goal**: Establish safety nets before destructive refactoring
**Depends on**: Nothing (first phase)
**Requirements**: PREP-01, PREP-02
**Success Criteria** (what must be TRUE):
  1. Backup branch exists on remote and can be checked out
  2. Database can be exported to JSON and restored
  3. Migration rollback procedure is documented and tested
**Plans**: TBD

Plans:
- [ ] P-1-01: Create backup strategy and test restore

### Phase 0: Foundation Cleanup
**Goal**: Eliminate all workspace/lib violations and consolidate to single type system
**Depends on**: Phase -1
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04, CLEAN-05
**Success Criteria** (what must be TRUE):
  1. `grep workspaceBindings` returns 0 matches
  2. `grep workspaceId` returns 0 matches
  3. `grep "from.*@/lib"` returns 0 matches
  4. All types import from `@/domain/schemas/` only
  5. `pnpm lint` passes with regression-prevention rules active
**Plans**: TBD

Plans:
- [ ] 00-01: Delete workspace type definitions and entities directory
- [ ] 00-02: Consolidate schemas to @/domain/schemas/
- [ ] 00-03: Migrate @/lib/ imports to canonical paths
- [ ] 00-04: Add ESLint rules and verify clean build

### Phase 1: Platform Operators
**Goal**: Implement FileTree and Chat-Cascade as always-running infrastructure operators
**Depends on**: Phase 0
**Requirements**: PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05, PLAT-06, PLAT-07, PLAT-08, PLAT-09, PLAT-10
**Success Criteria** (what must be TRUE):
  1. User can create a new project and see it in FileTree
  2. User can create/edit/delete files within a project
  3. Files sync to file system on desktop (FSA available)
  4. User can switch between projects without page refresh
  5. User can create a chat thread and send a message
  6. Layout panels don't overlap or disappear
**Plans**: 6 plans

Plans:
- [x] 01-01: Operator architecture, FileService, DomainEventBus (Wave 1)
- [x] 01-02: FileTree operator with full project/file CRUD and ProjectSelector (Wave 2)
- [x] 01-03: FSA sync (desktop) and IndexedDB fallback (mobile) (Wave 3)
- [x] 01-04: Chat-Cascade operator with ThreadService (Wave 2)
- [x] 01-05: Layout system fixes (panel resize, activity bar toggle) (Wave 1)
- [ ] 01-06: Gap closure — wire ChatPanel, Create Project, PanelResizer (Wave 1) [GAP CLOSURE]

### Phase 2: AI Integration
**Goal**: Implement tool execution pipeline with approval workflow and multi-provider support
**Depends on**: Phase 1
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, AI-06, AI-07
**Success Criteria** (what must be TRUE):
  1. Tool registry contains 6+ core tools (read_file, write_file, etc.)
  2. write_file tool prompts for approval before execution
  3. Tool results include side effects (files created/modified)
  4. AI chat works with Gemini provider
  5. AI chat works with OpenRouter provider
  6. Streaming responses render progressively
**Plans**: TBD

Plans:
- [ ] 02-01: Implement TOOL_REGISTRY with core tools
- [ ] 02-02: Implement tool execution pipeline with approval workflow
- [ ] 02-03: Implement AI Gateway with Gemini/OpenRouter adapters
- [ ] 02-04: Implement BYOK vault and streaming responses

### Phase 3: Feature Modules
**Goal**: Implement optional feature modules that plug into platform operators
**Depends on**: Phase 2
**Requirements**: MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, MOD-06
**Success Criteria** (what must be TRUE):
  1. Module system detects platform capabilities and loads appropriate modules
  2. Monaco opens files from FileTree and saves via FileService
  3. Notes module creates/edits rich text notes
  4. Notes AI completion suggests text continuations
  5. Notes AI summarization condenses selected text
**Plans**: TBD

Plans:
- [ ] 03-01: Implement module registry and platform detection
- [ ] 03-02: Implement Monaco module (desktop only)
- [ ] 03-03: Implement Notes module with BlockNote
- [ ] 03-04: Add Notes AI features (completion, summarization)

### Phase 4: RAG System
**Goal**: Implement Orama-based RAG with file and thread indexing
**Depends on**: Phase 3
**Requirements**: RAG-01, RAG-02, RAG-03, RAG-04, RAG-05
**Success Criteria** (what must be TRUE):
  1. Per-project Orama index is created and persists
  2. User can index a file and search its content via RAG
  3. User can index a thread and retrieve past conversations
  4. search_rag tool returns relevant results in chat
  5. AI responses include RAG context when enabled on thread
**Plans**: TBD

Plans:
- [ ] 04-01: Implement Orama integration and per-project indexes
- [ ] 04-02: Implement file and thread indexing pipeline
- [ ] 04-03: Integrate search_rag tool with Chat-Cascade

### Phase 5: Terminal, Preview & Polish
**Goal**: Add WebContainer modules and harden the application
**Depends on**: Phase 4
**Requirements**: TERM-01, TERM-02, TERM-03, TERM-04, TERM-05, TERM-06
**Success Criteria** (what must be TRUE):
  1. Terminal module runs commands via WebContainer (desktop)
  2. Preview module shows dev server output
  3. Module crashes don't take down the entire app
  4. Test coverage >80% on new code
  5. All async operations have loading states
  6. Keyboard navigation works throughout
**Plans**: TBD

Plans:
- [ ] 05-01: Implement Terminal module with WebContainer
- [ ] 05-02: Implement Preview module
- [ ] 05-03: Add error boundaries and graceful degradation
- [ ] 05-04: Increase test coverage and add E2E tests
- [ ] 05-05: UX polish (loading states, keyboard nav, accessibility)

## Progress

**Execution Order:**
Phases execute in numeric order: -1 → 0 → 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| -1. Preparation | 0/1 | Not started | - |
| 0. Foundation Cleanup | 0/4 | Not started | - |
| 1. Platform Operators | 0/5 | Not started | - |
| 2. AI Integration | 0/4 | Not started | - |
| 3. Feature Modules | 0/4 | Not started | - |
| 4. RAG System | 0/3 | Not started | - |
| 5. Terminal, Preview & Polish | 0/5 | Not started | - |

---
*Roadmap created: 2026-02-01*
*Based on: SOURCE-OF-TRUTH.md, research/SUMMARY.md, KILL-PLAN.md*
*Detailed tasks preserved in: ROADMAP-2026-01-31.md (reference)*
