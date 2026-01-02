# Project Alpha (Via-gent v2.0) - Comprehensive Codebase Analysis

**Generated**: 2026-01-02
**Analysis Tool**: Repomix v1.11.0 with Tree-sitter compression
**Output File**: `repomix-codebase-analysis.xml` (1.9M lines, 68MB compressed)

---

## Executive Summary

Project Alpha is a **browser-based IDE with integrated AI agent capabilities** built on React 18, TanStack Router, and WebContainers. The codebase consists of **1,029 TypeScript/TSX files** with **~189K lines of production code** and is transitioning from a brownfield codebase to a **four-layer clean architecture**.

**Key Metrics**:
- Total Source Files: 1,029 (635 .ts + 394 .tsx)
- Test Files: 154
- Production Code: ~189,411 lines
- God Files (>300 lines): 19 files identified
- BMAD Framework: 9.6MB configuration
- Documentation Output: 248MB (1,187 artifacts)

---

## 1. File Type Distribution

```
TypeScript files (*.ts):     635 files
TSX components (*.tsx):      394 files
Test files:                  154 files
─────────────────────────────
Total Source Files:         1,029 files
```

**Breakdown by Category**:
- React Components: 366 (src/presentation/components/)
- State Management: 81 stores (infrastructure/persistence/stores/)
- Agent Infrastructure: 52 files (tools, providers, hooks)
- Routing: 21 route files
- RAG Infrastructure: 36 files

---

## 2. Component Architecture

### 2.1 Component Distribution by Workspace

| Workspace | Component Count | Location |
|-----------|----------------|----------|
| **Components (General)** | 325 | `src/presentation/components/` |
| **UI Components** | 77 | `src/presentation/components/ui/` |
| **IDE** | 41 | `src/presentation/components/ide/` |
| **Agent** | 50 | `src/presentation/components/agent/` |
| **Hub** | 28 | `src/presentation/components/hub/` |
| **About** | 22 | `src/presentation/components/about/` |
| **Chat** | 17 | `src/presentation/components/chat/` |
| **Knowledge** | 21 | `src/presentation/components/knowledge/` |
| **Layout** | 20 | `src/presentation/components/layout/` |
| **Canvas** | 9 | `src/presentation/components/canvas/` |
| **Notes** | 13 | `src/presentation/components/notes/` |
| **Study** | 11 | `src/presentation/components/study/` |
| **Common** | 6 | `src/presentation/components/common/` |
| **RAG** | 4 | `src/presentation/components/rag/` |
| **Dashboard** | 2 | `src/presentation/components/dashboard/` |
| **Audio** | 1 | `src/presentation/components/audio/` |
| **Workspace** | 1 | `src/presentation/components/workspace/` |

**Total**: 366 presentation components (modular architecture)

### 2.2 Component Architecture Evolution

**Phase 1 (OLD - Deprecated)**:
- Location: `src/components/`
- Status: 3 files remaining (95% migrated)
- Pattern: Flat structure, mixed concerns

**Phase 2 (NEW - Current)**:
- Location: `src/presentation/components/`
- Status: 366 files, organized by workspace
- Pattern: Feature-based, workspace-specific

**Component Size Standards** (Ralph Loop Cycle 17):
- Max 120 lines per component
- Max 3 functions per module
- Max 5 dependencies per component
- Max 3 nesting levels
- Max 5 parameters per function

---

## 3. State Management Architecture

### 3.1 Store Locations (81 Total Stores)

**Primary Location** (81 files - ACTIVE):
```
src/infrastructure/persistence/stores/
├── providers/ (9 files)
│   ├── provider-crud-slice.ts
│   ├── provider-models-slice.ts
│   ├── provider-utils-slice.ts
│   ├── migrate-api-keys-to-vault.ts
│   └── migration-backup.ts
├── agents/ (6+ files)
│   ├── agent-crud-slice.ts
│   ├── agent-workspace-bindings-slice.ts
│   ├── agent-validation-slice.ts
│   ├── agent-events-slice.ts
│   └── agent-utils-slice.ts
├── conversation/ (8+ files)
├── quiz/ (5+ files)
├── workspace/ (2+ files)
└── [other domains]
```

**Legacy Location** (5 files - DEPRECATED):
```
src/lib/state/
├── ide-store.ts
├── knowledge-store.ts
├── quiz-store.ts
├── tool-permission-store.ts
└── workspace-store.ts
```

**Deprecated Location** (0 files - EMPTY):
```
src/stores/ (migration complete)
```

### 3.2 Zustand v5 Best Practices (January 2026)

**Pattern: Individual Selectors** (prevents infinite loops):
```typescript
// ✅ CORRECT
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)

// ❌ ANTI-PATTERN (causes infinite loops in v5)
const { providers, removeProvider } = useProviderStore();
```

**Applied to 15 Components**:
- ProviderConfigDialog.tsx
- ProviderSettings.tsx
- useAgentFormState.ts
- AgentConfigDialog.tsx
- AgentWorkspaceBindingConfig.tsx
- ... (10 more)

### 3.3 Store Consolidation Progress

**Phase 1** (✅ COMPLETE): Infinite loop fixes (15 components)
**Phase 2** (⏳ READY): Store consolidation (9-12 hours)
**Phase 3** (⏳ PENDING): God store elimination (20-25 hours)
**Phase 4** (⏳ PENDING): Four-layer architecture alignment (8-12 hours)
**Phase 5** (⏳ PENDING): Validation & documentation (5 hours)

---

## 4. Routing Architecture (TanStack Router)

### 4.1 Route Structure (21 Routes)

**Root & Index**:
```
/__root.tsx (root layout with providers)
/index.tsx (home/hub)
```

**Workspace Routes**:
```
/ide (IDE workspace)
/ide/$projectId (IDE with specific project)
/knowledge (Knowledge workspace)
/knowledge.$projectId (Knowledge with project)
/notes (Notes workspace)
/notes.$projectId (Notes with project)
/study (Study workspace)
/study.$projectId (Study with project)
/workspace (workspace switcher)
/workspace/$projectId (workspace context)
```

**Feature Routes**:
```
/about (about page)
/agents (agent configuration)
/settings (settings page)
```

**API Routes**:
```
/api/chat (chat completion endpoint)
/api/flashcards/generate (flashcard generation)
/api/quizzes/generate (quiz generation)
```

**Test Routes**:
```
/test-fs-adapter (file system adapter testing)
/webcontainer.$ (WebContainer testing)
```

### 4.2 Lazy-Loaded Routes

The following routes use lazy loading for code splitting:
- `about.lazy.tsx`
- `knowledge.$projectId.lazy.tsx`
- `knowledge.lazy.tsx`
- `notes.$projectId.lazy.tsx`
- `notes.lazy.tsx`
- `study.$projectId.lazy.tsx`
- `study.lazy.tsx`

**Benefit**: Reduced initial bundle size for workspace-specific code

---

## 5. AI Agent Infrastructure

### 5.1 Agent Tools (31 Files)

**Location**: `src/lib/agent/tools/`

Core Tools:
- `read-file-tool.ts` - Read file contents
- `write-file-tool.ts` - Write/create files
- `list-files-tool.ts` - List directory contents
- `execute-command-tool.ts` - Execute terminal commands

**Approval System**:
- All file operations require approval (needsApproval: true)
- List files is safe (needsApproval: false)
- UI: `ApprovalOverlay.tsx` displays pending approvals

### 5.2 Provider Adapters (16 Files)

**Location**: `src/lib/agent/providers/`

Key Files:
- `provider-adapter.ts` - Base adapter interface
- `model-registry.ts` - Available AI models catalog
- `credential-vault.ts` - Secure API key storage (AES-256-GCM encryption)
- `types.ts` - Provider type definitions

**Supported Providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude Opus, Sonnet, Haiku)
- OpenRouter (multi-provider gateway)
- Google (Gemini via @tanstack/ai-gemini)

### 5.3 Agent Hooks (5 Files)

**Location**: `src/lib/agent/hooks/`

- `use-agent-chat-with-tools.ts` - Main chat hook with tool execution
- `use-prompt-enhancer.ts` - Prompt optimization
- `index.ts` - Barrel exports

**Integration**: Used by `AgentChatPanel.tsx` across all workspaces

---

## 6. Tool Permissions System

### 6.1 Architecture

**Facade Pattern** (Cycle 12 - ✅ COMPLETE):
```
src/lib/agent/tool-permission-manager.ts (584 lines)
├── Zustand store + Dexie persistence
├── Facade for backwards compatibility
└── Selective persistence (ephemeral vs. persistent)
```

**Key Features**:
- Trust levels: Always Approved, Always Denied, Ask Once, Session Trust
- Workspace-specific tool permissions
- Agent-specific workspace bindings
- localStorage persistence for user preferences

### 6.2 Related Stores

**Agent Workspace Bindings**:
- Location: `src/infrastructure/persistence/stores/agents/slices/`
- Files:
  - `agent-workspace-bindings-slice.ts`
  - `agent-selection-store.ts`

**Workspace Permission Manager**:
- Location: `src/lib/agent/workspace-permission-manager.ts`
- Purpose: Encapsulates workspace availability logic
- Size: 10KB (352 lines)

---

## 7. Four-Layer Architecture (In Progress)

### 7.1 Layer Distribution

| Layer | Files | Location | Purpose |
|-------|-------|----------|---------|
| **Layer 1: Core (Domain Entities)** | 5 | `src/core/` | Pure entities, business rules |
| **Layer 2: Domain (Services)** | 10 | `src/domain/` | Domain logic, use cases |
| **Layer 3: Application** | 2 | `src/application/` | DTOs, services, use-cases |
| **Layer 4: Infrastructure** | 85 | `src/infrastructure/` | Persistence, external APIs |

**Total**: 102 files in four-layer architecture (10% of codebase)

### 7.2 Migration Status

**Phase 0** (Ralph Loop Cycle 18 - CRITICAL):
- Foundation Stabilization (Week 1-2)
- TS-001: Fix TypeScript Errors (6-8 hours) - 1,172 → <100
- DB-001: Safe IndexedDB Operations (18-22 hours)
- UI-001: Extract AgentConfigDialog Hooks (16-20 hours)

**Phase 1** (Week 3-4): Store Refactoring
- Split god stores into slices
- Eliminate circular dependencies

**Phase 2** (Week 5-6): Infrastructure Hardening
- Fix P1 gaps
- Add error boundaries

**Phase 3** (Week 7-8): Architecture Transformation
- Complete four-layer migration
- Validation & documentation

---

## 8. Testing Coverage

### 8.1 Test Distribution

```
Component Tests: 41 files
├── Agent configuration: 8 tests
├── Chat components: 6 tests
├── IDE components: 12 tests
├── Layout: 5 tests
└── UI components: 10 tests

Lib Tests: 87 files
├── Filesystem: 25 tests
├── Agent tools: 15 tests
├── WebContainer: 8 tests
├── RAG: 12 tests
├── Workspace: 15 tests
└── Utils: 12 tests

Store Tests: 13 files
├── Provider stores: 5 tests
├── Agent stores: 4 tests
└── Migration tests: 4 tests

Total: 141 test files (92% coverage target)
```

### 8.2 Test Framework

**Tools**: Vitest + @testing-library/react + jsdom

**Test Patterns**:
- Co-located with source (`__tests__/` directories)
- Mocked File System Access API
- Fake IndexedDB for persistence tests
- Provider adapter mocking for agent tests

---

## 9. God Files Analysis (>300 lines)

### 9.1 Critical God Files (Top 10)

| File | Lines | Issue | Priority |
|------|-------|-------|----------|
| `routeTree.gen.ts` | 499 | Auto-generated (OK) | N/A |
| `tool-permission-manager.ts` | 584 | Facade pattern | P1 |
| `error-classification.ts` | 563 | Utils (acceptably large) | P2 |
| `session-snapshot.test.ts` | 677 | Test file (acceptable) | N/A |
| `project-store.ts` | 517 | Store god class | P0 |
| `WorkspaceContext.test.tsx` | 380 | Test file (acceptable) | N/A |
| `error-handling.ts` | 454 | Utils (acceptably large) | P2 |
| `security.ts` | 361 | Utils (acceptably large) | P2 |
| `ProjectContext.tsx` | 352 | Context god class | P1 |
| `session-snapshot.ts` | 348 | Session logic | P2 |

**Total God Files**: 19 files identified
**God Classes**: 3-5 high-priority (project-store.ts, ProjectContext.tsx, tool-permission-manager.ts)

### 9.2 Component God Classes (Cycle 17 - 87.5% Complete)

**Eliminated**:
- AgentBasicConfig (302 → 0 lines, 100% reduction)
- WorkspaceToolPermissionsConfig (318 → 175 lines, 45% reduction)
- ToolTrustLevelManager (246 → 83 lines, 66% reduction)

**Pending**:
- AgentConfigDialog (1,089 → ~200 lines target, Phase 4)

---

## 10. RAG Infrastructure

### 10.1 RAG System Components (36 Files)

**Location**: `src/lib/rag/`

Core Files:
- `chunk-strategies/` - Text chunking algorithms (5 files)
- `embeddings/` - Vector embedding generation (4 files)
- `retrieval/` - Hybrid search algorithms (6 files)
- `storage/` - IndexedDB vector storage (3 files)
- `index.ts` - Main RAG orchestrator

**Error Handling Gap** (P0):
- Only 2 try-catch blocks in `embedding-service.ts` (482 lines)
- Recommendation: Add comprehensive error handling

### 10.2 Knowledge Synthesis Station (Future Vision)

**Target Market**: Vietnamese education

**Planned Features**:
- Source ingestion (PDF, URL via client-side parsing)
- Vector store (Orama WASM) for RAG
- Knowledge canvas with blocks + connections
- Study artifact generation (flashcards, quizzes)

**Status**: Concept phase (see `_bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md`)

---

## 11. Workspace System

### 11.1 Workspace Types

1. **IDE Workspace** (`ide`)
   - File tree + Monaco editor
   - WebContainer terminal
   - Agent chat panel
   - 41 components

2. **Knowledge Workspace** (`knowledge`)
   - RAG search interface
   - Source import dialog
   - Knowledge canvas
   - 21 components

3. **Notes Workspace** (`notes`)
   - Markdown editor
   - Note tree view
   - Note linking
   - 13 components

4. **Study Workspace** (`study`)
   - Quiz interface
   - Flashcard viewer
   - Progress tracking
   - 11 components

### 11.2 Workspace Routing

**Pattern**: Lazy-loaded routes with project context
```typescript
// IDE workspace
/ide (no project selected)
/ide/$projectId (specific project)

// Knowledge workspace
/knowledge (no project selected)
/knowledge.$projectId (specific project)
```

**Context Providers**:
- `WorkspaceContext` - Workspace-level state
- `ProjectContext` - Project-level state
- Cross-workspace event bus for communication

---

## 12. BMAD Framework Integration

### 12.1 Framework Size

**Configuration**: 9.6MB
**Documentation Output**: 248MB (1,187 artifacts)

**Structure**:
```
_bmad/
├── _config/ (agent manifests)
├── bmb/ (builder workflows)
├── bmm/ (implementation workflows)
├── cis/ (creative workflows)
├── core/ (orchestration)
└── custom/ (custom modules like CHAM)
```

### 12.2 Active Workflows

**Development Workflows**:
- `bmm/workflows/4-implementation/create-story/` - Story development
- `bmm/workflows/4-implementation/code-review/` - Code review
- `bmm/workflows/4-implementation/sprint-planning/` - Sprint planning

**Analysis Workflows**:
- `bmm/workflows/1-analysis/research/` - Technical research
- `bmm/workflows/3-solutioning/create-architecture/` - Architecture design

**Custom Modules**:
- `cham/` - Comprehensive Health Analysis Module
  - Architecture compliance agent
  - Dependency hygiene agent
  - Security agent
  - Test validator agent
  - Performance agent

---

## 13. Package Dependencies

**Production Dependencies**: 121 packages

**Core Framework**:
- React 18 + React DOM
- TanStack Router (routing)
- TanStore AI (AI SDK)
- Zustand (state management)
- Dexie (IndexedDB wrapper)

**UI Libraries**:
- Radix UI (primitives)
- Monaco Editor (code editor)
- Tailwind CSS (styling)
- Lucide React (icons)

**AI/ML**:
- @tanstack/ai + adapters
- @google/genai
- @xenova/transformers (WASM transformers)

**Infrastructure**:
- @webcontainer/api (WebContainer runtime)
- @xterm/xterm (terminal emulator)
- isomorphic-git (Git client)

---

## 14. Critical Technical Debt (Ralph Loop Cycle 18)

### 14.1 TypeScript Errors

**Current State**: 1,172 errors remaining
- Production: 306 errors
- Test files: 866 errors

**Recent Progress**: 11 errors fixed (983 → 972)

**Target**: <100 errors (6-8 hours estimated)

### 14.2 Infrastructure Gaps (P0)

1. **Data Loss Risk** (DB-001):
   - No IndexedDB quota handling
   - Fix time: 18-22 hours

2. **Silent Failures**:
   - 23 instances of `console.error + return null`
   - Fix: Add proper error boundaries

3. **Maintainability Collapse**:
   - 17 files >300 lines (worst is 9x over limit)
   - Fix: God class elimination

### 14.3 Course Correction (2026-01-01)

**Decision**: ✅ IMMEDIATE COURSE CORRECTION APPROVED

**Previous Claim**: Health Score 100/100
**ACTUAL REALITY**: Health Score ~5.9%

**8-Week Stabilization Plan**:
- Phase 0 (Week 1-2): Foundation Stabilization
- Phase 1 (Week 3-4): Store Refactoring
- Phase 2 (Week 5-6): Infrastructure Hardening
- Phase 3 (Week 7-8): Architecture Transformation

---

## 15. Import/Export Dependencies

### 15.1 Most Imported Modules

**Core Infrastructure**:
- `@/lib/state/ide-store` - IDE state management
- `@/lib/agent/provider-adapter` - AI provider abstraction
- `@/infrastructure/persistence/stores/providers/provider-store-core` - Provider config

**UI Components**:
- `@/presentation/components/ui/*` - Reusable UI primitives
- `@/presentation/components/agent/*` - Agent configuration UI

**Workspace Components**:
- Each workspace imports 5-10 shared components
- Common: `button.tsx`, `dialog.tsx`, `input.tsx`

### 15.2 Circular Dependencies

**High-Risk Cycles** (4 identified):
1. `agents-store.ts` ↔ `provider-store.ts`
2. `conversation-store.ts` → `threads-store.ts` → `conversation-store.ts`
3. `ide-store.ts` → `layout-store.ts` → `ide-store.ts`
4. `tool-permission-store.ts` → `agents-store.ts` → `tool-permission-store.ts`

**Solution**: Event-driven architecture via workspace event bus (zero circular deps)

---

## 16. Development Workflow

### 16.1 Local Development

**Start Server**:
```bash
pnpm dev
# Starts on port 3000
# Requires COOP/COEP headers for WebContainer
```

**Key Configurations**:
- `vite.config.ts` - Cross-origin isolation headers
- `tsconfig.json` - Path aliases (@/*)
- `package.json` - 121 dependencies

### 16.2 Testing

**Run Tests**:
```bash
pnpm test                    # Run all tests
pnpm test -- --coverage      # With coverage
pnpm tsc --noEmit            # Type check
```

**Coverage Target**: ≥80%

### 16.3 Internationalization

**Extraction**:
```bash
pnpm i18n:extract
# Outputs to src/i18n/{en,vi}.json
```

**Languages**:
- English (en.json) - Complete
- Vietnamese (vi.json) - Complete

---

## 17. File Tree Summary (Repomix Output)

**Total Files Packed**: 4,507 files
**Compressed Output**: 1.9M lines, 68MB
**Compression Ratio**: ~70% token reduction via Tree-sitter

**Directory Structure**:
```
project-alpha-master/
├── src/ (1,029 files)
│   ├── presentation/components/ (366 components)
│   ├── infrastructure/persistence/stores/ (81 stores)
│   ├── lib/
│   │   ├── agent/ (52 files)
│   │   ├── rag/ (36 files)
│   │   ├── filesystem/ (25 files)
│   │   └── state/ (5 legacy stores)
│   ├── routes/ (21 routes)
│   ├── core/ (5 files - Layer 1)
│   ├── domain/ (10 files - Layer 2)
│   ├── application/ (2 files - Layer 3)
│   └── infrastructure/ (85 files - Layer 4)
├── _bmad/ (9.6MB - BMAD framework)
├── _bmad-output/ (248MB - 1,187 artifacts)
└── [config files]
```

---

## 18. Next Steps & Recommendations

### 18.1 Immediate Actions (P0 - Week 1)

1. **Fix TypeScript Errors** (TS-001)
   - Target: 1,172 → <100 errors
   - Time: 6-8 hours

2. **Safe IndexedDB Operations** (DB-001)
   - Add quota handling
   - Time: 18-22 hours

3. **Extract AgentConfigDialog Hooks** (UI-001)
   - 1,089 → <300 lines
   - Time: 16-20 hours

### 18.2 Short-Term (Week 2-4)

1. **Store Refactoring** (Epic AC-1)
   - Eliminate 3 duplicate locations
   - Split god stores into slices
   - Time: 42 hours

2. **God Class Elimination**
   - 17 files >300 lines
   - Target: All files ≤300 lines

### 18.3 Long-Term (Week 5-8)

1. **Architecture Transformation**
   - Complete four-layer migration
   - Event-driven orchestration
   - Zero circular dependencies

2. **Validation & Documentation**
   - Update AGENTS.md
   - API documentation
   - Architecture decision records (ADRs)

---

## 19. Repomix Output File

**Location**: `/Users/apple/Documents/coding-projects/project-alpha-master/repomix-codebase-analysis.xml`

**Format**: XML with Tree-sitter compression
**Size**: 1.9M lines, 68MB compressed
**Compression**: ~70% token reduction

**Usage**:
- Codebase exploration via grep/search
- Architecture analysis
- Pattern discovery
- Import/export dependency mapping

**Cleanup Command** (when done):
```bash
rm /Users/apple/Documents/coding-projects/project-alpha-master/repomix-codebase-analysis.xml
```

---

## 20. Conclusion

Project Alpha is a **sophisticated browser-based IDE** with integrated AI agent capabilities, currently in a **critical stabilization phase**. The codebase shows signs of rapid evolution with mixed architectural patterns (old flat structure vs. new four-layer architecture), but the development team has taken decisive action with an **8-week course correction plan** (Ralph Loop Cycle 18).

**Strengths**:
- Comprehensive AI agent infrastructure (52 files)
- Modern React + TanStack Router stack
- Extensive component library (366 components)
- Strong BMAD framework integration (9.6MB configs)
- Good test coverage (141 test files)

**Critical Areas for Improvement**:
- TypeScript error resolution (1,172 remaining)
- Store consolidation (3 duplicate locations)
- God class elimination (19 files >300 lines)
- Four-layer architecture completion (10% migrated)

**Recommended Focus**: Complete Phase 0 stabilization (Week 1-2) before proceeding with feature development. This will reduce technical debt from ~5.9% health score to a stable foundation for future growth.

---

**End of Analysis**
