# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Via-gent** (Project Alpha v2.0) is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. The project is evolving toward a **Knowledge Synthesis Station** — a local-first platform that merges Google NotebookLM-style AI synthesis with Notion-like knowledge organization.

### 🚨 CRITICAL: Ralph Loop Cycle 18 - Course Correction Required (2026-01-01)

**Governance Misalignment Discovered:**
- **Previous Claim:** Health Score 100/100 ✅ (Iteration 177)
- **ACTUAL REALITY:** Health Score ~5.9% (1,172 TypeScript errors remaining)
- **Decision:** ✅ IMMEDIATE COURSE CORRECTION APPROVED

**Corrected Development Focus:**
See: `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md`

**8-Week Stabilization Plan:**
- **Phase 0** (Week 1-2): Foundation Stabilization - Fix P0 infrastructure gaps
  - TS-001: Fix TypeScript Errors (6-8 hours) - Reduce from 1,172 to <100
  - DB-001: Safe IndexedDB Operations (18-22 hours) - Add quota handling
  - UI-001: Extract AgentConfigDialog Hooks (16-20 hours) - 1,089 → <300 lines
- **Phase 1** (Week 3-4): Store Refactoring - Split god stores into slices
- **Phase 2** (Week 5-6): Infrastructure Hardening - Fix P1 gaps
- **Phase 3** (Week 7-8): Architecture Transformation - 4-layer clean architecture

**Critical Risks:**
- P0: Data loss (no IndexedDB quota handling)
- P0: Silent failures (23 instances of console.error + return null)
- P1: Maintainability collapse (17 files >300 lines, worst is 9x over limit)

### 🎯 Future Vision: Knowledge Synthesis Station

A local-first platform targeting Vietnamese education market with:
- Source ingestion (PDF, URL via client-side parsing)
- Vector store (Orama WASM) for RAG
- Knowledge canvas with blocks + connections
- Study artifact generation (flashcards, quizzes)

See: `_bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md`

## Project Planning Artifacts (Controlled Documents)

The following governance documents define project direction and constraints:

| Document | Purpose |
|----------|---------|
| `_bmad-output/project-planning-artifacts/architecture.md` | System architecture decisions |
| `_bmad-output/project-planning-artifacts/prd.md` | Product requirements definition |
| `_bmad-output/project-planning-artifacts/project-context.md` | Project context and constraints |
| `_bmad-output/project-planning-artifacts/ux-design-specification.md` | UX/UI design requirements |
| `_bmad-output/epics.md` | Epic breakdown and dependencies |

## Parallel Development Strategy

For two AI agent teams, follow the strategy in `_bmad-output/project-planning-artifacts/parallel-development-dual-agents-mode.md`:

### Team Assignment

| Team A (UI/Foundation) | Team B (Backend/Agent) |
|------------------------|------------------------|
| Epic 1 (Mobile-First Visual) | Epic 4 Foundation (Prompt System) |
| Epic 2 Frontend UI | Epic 2 Backend State + Tool Exec |
| Epic 3 UI Components | Epic 3 WebContainer + Sync |
| Epic 5 Polish | Epic 4 Completion + Epic 5 Backend |

### Key Integration Points

- **Day 3**: Epic 1 UI + Epic 4 Prompt System (Chat UI renders agent modes)
- **Day 6**: Epic 2 UI + Stores (`ChatPanel` consumes `useConversationStore`)
- **Day 9**: Terminal UI + WebContainer (`TerminalPanel` connects to WC shell)
- **Day 12**: Sync UI + Sync Backend (`ProcessPanel` displays sync queue)
- **Day 15**: Full System Integration (E2E validation begins)

### Pre-Work Checklist (Sprint 0)

- [ ] Complete Story 2.0 (Credential Vault) - Team B
- [ ] Create `sample-conversations.json` - Team A
- [ ] Define store interface contracts - Both
- [ ] Set up separate Git branches (`team-a/*`, `team-b/*`) - Both
- [ ] Mock store implementations for Team A - Team A
- [ ] Unit test harness for tool execution - Team B

## Brownfield Context (Reference Only)

These documents provide historical context and lessons learned. Reference them to avoid repeating past issues:

| Document | Purpose |
|----------|---------|
| `_bmad-output/docs/architecture-analysis-2025-12-28.md` | System architecture analysis |
| `_bmad-output/docs/development-patterns-conventions-2025-12-28.md` | Coding patterns and conventions |
| `_bmad-output/docs/project-overview-2025-12-28.md` | Project overview |
| `_bmad-output/docs/source-tree-analysis-2025-12-28.md` | Directory structure analysis |
| `_bmad-output/docs/tech-stack-documentation-2025-12-28.md` | Tech stack details |

### Version 2 Technical Research

Research documents informing current implementation:

| Document | Domain |
|----------|--------|
| `_bmad-output/docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md` | LLM provider configuration |
| `_bmad-output/docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md` | Agent architecture |
| `_bmad-output/docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md` | RAG infrastructure |
| `_bmad-output/docs/2025-12-28/version-2/implementation-roadmap.md` | Implementation roadmap |
| `_bmad-output/docs/2025-12-28/version-2/technical-architecture-document.md` | Technical architecture |
| `_bmad-output/docs/2025-12-28/version-2/remediation-epics.md` | Remediation epics |

## UX/UI Requirements

All UI work must follow these standards:

### Design Principles
- **8-bit Gaming Style**: Dark-themed aesthetic with pixel-perfect styling
- **Responsive First**: Mobile detection with appropriate layouts
- **No Hardcoded Values**: All styles via design tokens, all strings via i18n

### Device Detection
```typescript
// Use useResponsive hook for breakpoint detection
const { isMobile, isTablet, isDesktop } = useResponsive();

// Mobile-specific handling in:
// - IDELayout.tsx
// - MobileIDELayout.tsx
// - ErrorState components
```

### Internationalization
- All UI strings must use `t()` hook from i18next
- Support both English (`en.json`) and Vietnamese (`vi.json`)
- Run `pnpm i18n:extract` after adding new strings

### Component Standards

**Size Limits** (Updated 2026-01-01):
- **Max 120 lines per component** (strictly enforced for new components)
- **Max 3 functions per module** (exported functions only)
- **Max 5 dependencies per component** (imports from different packages)
- **Max 3 nesting levels** (if/for/function nesting)
- **Max 5 parameters per function**

**Quality Standards**:
- Components logically routed and wired
- Interfaces mapped to user journeys
- Professional first impression with meticulous detail
- Clear error states and loading states

### Design Tokens
All styling via CSS custom properties in `src/styles/design-tokens.css`:
- Layout tokens (panel sizes, sidebar dimensions)
- Color tokens (8-bit dark theme palette)
- Typography tokens
- Animation tokens

## Essential Development Commands

```bash
# Start development server (port 3000 with cross-origin isolation headers)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Extract translation keys
pnpm i18n:extract

# Type checking (production code only, ~3x faster)
pnpm typecheck

# Type checking (includes test files)
pnpm typecheck:all
```

## Key Directories & Files (Updated 2026-01-01)

**Complete File Structure** (generated via `tree -L 4` command):

```
src/
├── __tests__/              # Test files
├── application/            # Application services and DTOs
│   ├── dtos/
│   ├── services/           # AgentService, ProviderService
│   └── use-cases/
├── components/             # ✅ DEPRECATED: Moving to presentation/components/
│   └── rag/                # RAG-specific components (CitationSidebar, etc.)
├── core/                   # ✅ NEW: Domain layer entities
│   ├── entities/           # Agent, Provider, Tool, Conversation
│   ├── rules/
│   ├── value-objects/
│   └── index.ts
├── data/                   # Mock data and demo files
├── domain/                 # ✅ NEW: Domain services and use cases
│   ├── entities/           # Domain-specific entities
│   ├── services/           # Orchestration services
│   ├── use-cases/          # Business use cases (switch-workspace)
│   └── value-objects/      # ToolPermission, WorkspaceBinding, WorkspaceType
├── hooks/                  # Custom React hooks
│   ├── __tests__/          # Hook tests
│   ├── useAgents.ts
│   ├── useCanvasDrop.ts
│   ├── useCapabilityDetection.ts
│   ├── useIdeStatePersistence.ts
│   ├── useMediaQuery.ts
│   ├── useProcessManager.ts
│   ├── useQuizSession.ts
│   ├── useQuizTimer.ts
│   ├── useResponsive.ts    # Breakpoint detection
│   ├── useUnsavedWorkPreservation.ts
│   └── useWorkspaceContext.ts
├── i18n/                   # Internationalization
│   ├── en/                 # English translations
│   ├── vi/                 # Vietnamese translations
│   ├── LocaleProvider.tsx
│   ├── config.ts
│   ├── en.json             # Main English translations
│   └── vi.json             # Main Vietnamese translations
├── infrastructure/         # ✅ NEW: Infrastructure layer
│   ├── events/             # Event system (cross-workspace event bus)
│   ├── external/
│   ├── framework/
│   └── persistence/        # Persistence layer (Dexie + Zustand)
│       ├── stores/         # Store slices (294 total components)
│       │   ├── agents/     # Agent store slices
│       │   ├── conversation/
│       │   ├── quiz/
│       │   └── rag/
│       ├── dexie-db-*.ts   # IndexedDB definitions (migrations, types)
│       ├── dexie-storage.ts
│       └── state-orchestrator.ts
├── lib/                    # Core library modules
│   ├── agent/              # AI agent infrastructure (45+ files)
│   │   ├── __tests__/      # Agent tests
│   │   ├── deep-think/     # Deep thinking hooks and parsers
│   │   ├── facades/        # FileTools, TerminalTools facades
│   │   ├── hooks/          # use-agent-chat-with-tools, use-prompt-enhancer
│   │   ├── memory/         # Conversation memory, insight extractor
│   │   ├── multimodal/     # Message builder
│   │   ├── preferences/    # User preferences, profile tracking
│   │   ├── providers/      # Provider adapters, credential vault, model registry
│   │   ├── tools/          # Individual agent tools (read, write, execute, etc.)
│   │   ├── tool-permission-manager.ts
│   │   ├── workspace-permission-manager.ts
│   │   └── workspace-tool-filter.ts
│   ├── audio/              # Audio generation and storage
│   ├── canvas/             # Canvas linkage analyzer
│   ├── chat/               # Context window manager
│   ├── demo/               # Sample conversations
│   ├── editor/             # Monaco editor utilities
│   ├── events/             # Store events, workspace events
│   ├── filesync/           # File sync services
│   ├── filesystem/         # File system sync (25+ files)
│   │   ├── sync-manager/   # Sync manager factory
│   │   ├── sync-transaction/
│   │   └── *.test.ts       # Filesystem tests (12 test files)
│   ├── hooks/              # useProviderEvents
│   ├── knowledge/          # Knowledge graph, flashcards, RAG (30+ files)
│   │   ├── graph/          # Graph CRUD, queries, traversal
│   │   ├── flashcard-*.ts  # Flashcard generation, utils
│   │   ├── gemini-*.ts     # Gemini PDF/URL processors
│   │   └── synthesis-*.ts  # Synthesis service, prompts, types
│   ├── notes/              # Note indexing, AI service, retrieval
│   ├── pdf/                # PDF vision capture, hooks
│   ├── rag/                # RAG indexing, retrieval, search (25+ files)
│   │   ├── chunk-strategies/
│   │   └── __tests__/      # RAG tests (5 test files)
│   ├── state/              # Zustand stores (25+ store files)
│   │   ├── migrations/
│   │   ├── canvas-store.ts
│   │   ├── conversation-store.ts
│   │   ├── ide-store.ts
│   │   ├── knowledge-store.ts
│   │   ├── layout-store.ts
│   │   ├── provider-store.ts
│   │   ├── rag-store.ts     # ❌ GOD STORE (1,595 lines duplicated)
│   │   ├── tool-permission-store.ts
│   │   └── workspace-*.ts
│   ├── study/              # Quiz generation, SRS types
│   ├── sync/               # Sync event bus, reverse sync
│   ├── utils/              # Error handling, platform detection
│   ├── validation/         # Chat request validation
│   ├── webcontainer/       # WebContainer lifecycle, terminal adapter
│   └── workspace/          # Workspace state, project store
├── presentation/           # ✅ NEW: Presentation layer components (294 total)
│   └── components/
│       ├── about/          # About page components
│       ├── agent/          # Agent configuration UI (20+ files)
│       │   ├── AgentConfigDialog.tsx  # ❌ GOD COMPONENT (1,089 lines - Phase 0 target)
│       │   ├── AgentManager.tsx  # ✅ NEW: Comprehensive agent management UI (285 lines)
│       │   ├── UnifiedAgentSelector.tsx  # ✅ NEW: Fixes store fragmentation bug (247 lines)
│       │   ├── ProviderConfigDialog.tsx
│       │   ├── WorkspacePermissionEditor.tsx
│       │   ├── WorkspacePermissions/  # ✅ NEW: Modular workspace permissions (Phase 2)
│       │   │   ├── PermissionBadge.tsx (44 lines)
│       │   │   ├── PermissionSwitch.tsx (56 lines)
│       │   │   ├── PermissionGridHeader.tsx (59 lines)
│       │   │   ├── ToolPermissionRow.tsx (77 lines)
│       │   │   ├── PermissionLegend.tsx (55 lines)
│       │   │   ├── types.ts (46 lines)
│       │   │   ├── hooks/
│       │   │   │   └── useWorkspacePermissions.ts (81 lines)
│       │   │   └── index.ts (30 lines)
│       │   ├── ToolTrustLevels/  # ✅ NEW: Modular tool trust levels (Phase 3)
│       │   │   ├── TrustLevelLegend.tsx (57 lines)
│       │   │   ├── ToolTrustRow.tsx (93 lines)
│       │   │   ├── hooks/
│       │   │   │   └── useToolTrustLevels.ts (120 lines)
│       │   │   └── index.ts (18 lines)
│       │   └── *.tsx        # Various agent config components
│       ├── audio/          # Audio player
│       ├── canvas/         # Canvas components (Canvas, LinkageProposalsPanel)
│       ├── chat/           # Chat interface (15+ components)
│       │   ├── ChatPanel.tsx
│       │   ├── ChatConversation.tsx
│       │   ├── ThreadManager.tsx
│       │   └── *.tsx        # Various chat components
│       ├── common/         # ErrorBoundary, WorkspaceSwitcher
│       ├── dashboard/      # Onboarding, PitchDeck
│       ├── hub/            # Hub home, project cards, workspace badges
│       ├── ide/            # IDE components (20+ files)
│       │   ├── AgentChatPanel.tsx
│       │   ├── CommandPalette.tsx
│       │   ├── ExplorerPanel.tsx
│       │   ├── StatusBar.tsx
│       │   ├── XTerminal.tsx
│       │   └── *.tsx        # Various IDE components
│       ├── knowledge/      # Knowledge workspace UI (15+ components)
│       │   ├── KnowledgePage.tsx
│       │   ├── SourceImportDialog.tsx
│       │   └── *.tsx        # Various knowledge components
│       ├── layout/         # Layout components (10+ files)
│       │   ├── IDELayoutMain.tsx
│       │   ├── MobileIDELayout.tsx
│       │   └── *.tsx        # Various layout components
│       ├── notes/          # Notes workspace UI (10+ components)
│       │   ├── NoteEditor.tsx
│       │   ├── NoteTree.tsx
│       │   └── *.tsx        # Various note components
│       ├── rag/            # RAG chat and search panels
│       ├── study/          # Study workspace UI (10+ components)
│       │   ├── StudyPage.tsx
│       │   ├── QuizContainer.tsx
│       │   └── *.tsx        # Various study components
│       ├── ui/             # Reusable UI components (50+ files)
│       │   ├── ApprovalOverlay.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ErrorState.tsx
│       │   ├── LoadingState.tsx
│       │   ├── SkeletonLoader.tsx
│       │   ├── badge.tsx
│       │   ├── button.tsx
│       │   ├── dialog.tsx
│       │   ├── input.tsx
│       │   └── *.tsx        # Various UI primitives
│       │   └── activity-indicators/  # ✅ NEW: Event activity indicators (Cycle 17)
│       │       ├── DatabaseIndexingIndicator.tsx (84 lines)
│       │       ├── EmbeddingProgressIndicator.tsx (84 lines)
│       │       ├── ChunkingStatusIndicator.tsx (84 lines)
│       │       ├── SyncStatusIndicator.tsx (84 lines)
│       │       ├── types.ts (33 lines)
│       │       └── index.ts (26 lines)
│       └── workspace/      # Workspace switcher
├── routes/                 # TanStack Router file-based routes
│   ├── api/                # API endpoints
│   │   ├── chat.ts         # Chat completion endpoint
│   │   ├── quizzes/
│   │   └── flashcards/
│   ├── workspace/          # Workspace routes
│   ├── __root.tsx
│   ├── index.tsx
│   ├── ide.tsx
│   ├── knowledge.lazy.tsx
│   ├── notes.lazy.tsx
│   └── study.lazy.tsx
├── shared/                 # Shared constants, errors, types
├── stores/                 # ✅ DEPRECATED: Moving to infrastructure/persistence/stores/
│   ├── agents-store.ts     # ❌ GOD STORE (430 lines, circular dep)
│   ├── conversation-threads-store.ts
│   └── *.ts                # Various stores (8 total)
├── styles/                 # Global styles
│   ├── animations.css      # 8-bit themed animations
│   ├── design-tokens.css   # CSS custom properties
│   └── design-tokens.ts    # TypeScript token constants
├── test/                   # Test setup
├── types/                  # Type definitions
├── utils/                  # Export utilities
├── workers/                # Web workers (note-embedding.worker)
├── workspaces/             # Workspace-specific logic
└── [route files]           # router.tsx, server.ts, routeTree.gen.ts
```

**Architecture Changes (Ralph Loop 2026-01-01)**:
- ✅ **Four-Layer Architecture**: Core (Domain) → Domain (Services) → Infrastructure (Persistence) → Presentation (UI)
- ✅ **Provider Store Consolidated**: 3 duplicate stores (765 lines) → 1 store (4 slices, 850 lines)
- ✅ **Agent Workspace Bindings**: Added workspace filtering to agents-store.ts
- ✅ **Cross-Workspace Events**: Added WorkspaceChangeEvent to event bus
- ✅ **December 2025 Zustand Patterns**: Slice pattern, persist on combined store, partialize for selective persistence

**Codebase Statistics (from tree command analysis)**:
- **Total Files**: 711 files across 177 directories
- **React Components**: 294 components across 4 workspaces (IDE: 80+, Knowledge: 15, Study: 12, Notes: 10)
- **Store Files**: 71 total stores across 3 locations
  - `src/lib/state/` → 25 stores
  - `src/stores/` → 8 stores (DEPRECATED)
  - `src/infrastructure/persistence/stores/` → 38+ stores
- **God Components** (>300 lines): 16 files identified
  - Worst: `rag-store.ts` (1,595 lines duplicated between locations)
  - `agents-store.ts` (430 lines with circular dependency)
  - `conversation-threads-store.ts` (726 lines)
- **Test Files**: 40+ test files (agent, filesystem, hooks, RAG, etc.)
- **Agent Tools**: 20+ individual tools in `lib/agent/tools/`

**Critical Technical Debt Identified (Ralph Loop Cycle 17)**:
1. **God Component Elimination** (87.5% COMPLETE - Cycle 17)
   - ✅ **Phase 1**: AgentBasicConfig deleted (302 lines → 0, 100% reduction)
   - ✅ **Phase 2**: WorkspaceToolPermissionsConfig split (318 → 175 lines, 45% reduction)
     - Created 7 focused components + 1 custom hook
     - All components ≤120 lines
   - ✅ **Phase 3**: ToolTrustLevelManager split (246 → 83 lines, 66% reduction)
     - Created 3 components + 1 custom hook
     - localStorage persistence pattern
   - ⏳ **Phase 4**: AgentConfigDialog hook extraction (539 → ~200 lines, PENDING)
   - **Total Progress**: 608 lines eliminated, 21 modular components created

2. **Event Activity Indicators** (✅ COMPLETE - Cycle 17)
   - ✅ DatabaseIndexingIndicator.tsx (84 lines)
   - ✅ EmbeddingProgressIndicator.tsx (84 lines)
   - ✅ ChunkingStatusIndicator.tsx (84 lines)
   - ✅ SyncStatusIndicator.tsx (84 lines)
   - Purpose: User journey gap fulfillment (progress feedback)

3. **System 2 - AI Agents Configuration** (IMPROVED - Cycle 17)
   - God store: `agents-store.ts` (430 lines, 3.6x 120-line standard)
   - Circular dependency: `agents-store.ts` ↔ `provider-store.ts`
   - Store duplication: 25+ duplicated stores across 3 locations
   - **Progress**: Component layer 87.5% refactored, store layer pending
   - **Remediation**: Epic AC-1 (8 stories, 42 hours) required

2. **Store Duplication Crisis**
   - 17 duplicate stores (30% duplication rate)
   - 6,500 lines of redundant code
   - **Remediation**: Delete duplicates, migrate to `infrastructure/persistence/stores/`

3. **Missing UI Components** (20+ P0 priority across all workspaces)
   - Knowledge: KnowledgeSearchInterface, DocumentPreviewViewer, EmbeddingVisualization
   - Study: AdvancedQuizEditor, ProgressTrackingDashboard, SpacedRepetitionScheduler
   - Notes: AdvancedNoteEditor, NoteLinkingGraph, NoteSearchFilter

**Next Steps** (from Ralph Loop Cycle 17):
1. ✅ Phase 1-3 complete: Agent config god components eliminated
2. ✅ Event activity indicators created (user journey gap filled)
3. ✅ Routing validated across all workspaces
4. ⏳ **Iteration 2**: Phase 4 - Extract hooks from AgentConfigDialog (539 → ~200 lines)
5. ⏳ Update CLAUDE.md and AGENTS.md (current task)
6. ⏳ Execute Epic AC-1 (Agent Configuration Consolidation - store layer)
7. ⏳ Execute Epic WB (Workspace Binding completion)

## Architecture & Key Components

### Core Architecture
- **Local FS as Source of Truth**: All file operations go through `LocalFSAdapter` to browser's File System Access API
- **WebContainer Mirror**: `SyncManager` syncs files to WebContainer sandbox
- **State Management**: Zustand stores with React Context for workspace and IDE state
- **Project Persistence**: IndexedDB via Dexie for project metadata and conversations

### File System Sync Flow
```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
      ↑                                    ↑
   IndexedDB (ProjectStore)         File Change Events
```

### AI Agent Architecture
```
UI Components (AgentChatPanel, AgentConfigDialog)
         ↓
useAgentChat Hook (with tools)
         ↓
AgentFactory (creates adapters)
         ↓
ProviderAdapter (OpenRouter, Anthropic, etc.)
         ↓
TanStack AI (chat streaming)
         ↓
Agent Tools (FileTools, TerminalTools)
         ↓
Facades (abstract over WebContainer/LocalFS)
```

**Key Components:**
- **Provider Adapter Factory** (`src/lib/agent/providers/provider-adapter.ts`): Creates adapters for different AI providers
- **Model Registry** (`src/lib/agent/providers/model-registry.ts`): Manages available AI models
- **Credential Vault** (`src/lib/agent/providers/credential-vault.ts`): Secure storage of API keys
- **Agent Tool Facades**: `AgentFileTools` and `AgentTerminalTools` abstract WebContainer operations for agents
- **Tool Registry**: Individual tools for file operations (`read`, `write`, `list`, `execute`)

### Error Handling Architecture
```
Error Boundary Components (src/components/common/ErrorBoundary.tsx)
         ↓
Error State UI (src/components/ui/ErrorState.tsx)
         ↓
Error Utilities (src/lib/utils/error-handling.ts)
```

### State Architecture (P1.10 Audit Complete + Ralph Loop 2026-01-01)

**CRITICAL UPDATE (2026-01-01):**
- ✅ **Phase 1 COMPLETE**: Infinite loop bugs fixed in agent/provider configuration dialogs
- ✅ **Root Cause Identified**: Destructuring pattern causes infinite loops in Zustand v5
- ✅ **Solution Applied**: Individual selector pattern across all components
- ✅ **Verification**: Zero new TypeScript errors
- See: `_bmad-output/zustand-migration-plan-2026-01-01.md` and `_bmad-output/zustand-patterns-guide-2026-01-01.md`

**Current State (Iteration 64 Analysis):**
- **Total Stores**: 71 total stores across 3 locations (CRITICAL ISSUE)
  - `src/lib/state/` → 25 stores
  - `src/stores/` → 8 stores (DEPRECATED)
  - `src/infrastructure/persistence/stores/` → 38+ stores
- **God Stores** (>300 lines): 16 files identified
  - Worst: `rag-store.ts` (1,595 lines duplicated)
  - `agents-store.ts` (430 lines with circular dependency)
  - `conversation-threads-store.ts` (726 lines)
- **Circular Dependencies**: 4 high-risk cycles identified

## Zustand v5 Best Practices (January 2026)

### 1. The Golden Rule: Individual Selectors

**✅ CORRECT PATTERN** (Prevents infinite loops, stable references):
```typescript
// Single property selector
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)

// Multiple properties with useShallow
import { useShallow } from 'zustand/shallow'
const { providers, models } = useAppStore(
  useShallow((s) => ({ providers: s.providers, models: s.models }))
)
```

**❌ ANTI-PATTERN** (Causes infinite loops in v5):
```typescript
// NEVER destructure entire store - creates new object every render
const { providers, removeProvider } = useProviderStore();
```

**Why This Matters**:
- Zustand v5 uses stricter referential equality checks
- Destructuring creates new object references on every render
- React's `useSyncExternalStore` detects reference changes and triggers infinite re-renders
- Individual selectors return stable references, preventing unnecessary re-renders

### 2. Fixed Components (Phase 1 Complete)

The following components were fixed to use individual selectors:
- ✅ `ProviderConfigDialog.tsx:43-48` - LLM provider API key configuration
- ✅ `ProviderSettings.tsx:19-25` - Provider CRUD interface
- ✅ `useAgentFormState.ts:90-94` - Agent form state hook
- ✅ `AgentConfigDialog.tsx:96` - Agent configuration dialog
- ✅ `AgentWorkspaceBindingConfig.tsx:122-123,141` - Workspace permissions with stable useEffect
- ✅ 13 other components across chat, notes, and agent workspaces

**Pattern Applied**:
```typescript
// BEFORE (causing infinite loops):
const { providers, removeProvider } = useProviderStore();

// AFTER (stable selectors):
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)
```

### 3. Store Architecture

**Single Bounded Store** (`src/infrastructure/persistence/stores/use-app-store.ts`):
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Agent slices (5 slices)
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),

      // Provider slices (3 slices)
      ...createProviderCrudSlice(...a),
      ...createProviderModelsSlice(...a),
      ...createProviderUtilsSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('appState')),
      partialize: (state) => ({
        agents: state.agents,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state.agents || state.agents.length === 0) {
          state.agents = [DEFAULT_AGENT];
        }
        state._hasHydrated = true;
      },
    }
  )
)
```

**Store Locations** (Updated 2026-01-03 - Epic 51 Assessment):
- **Canonical**: `src/infrastructure/persistence/stores/` (51+ stores, modern architecture)
  - Agents: `agents/` (5 slices + barrel)
  - Providers: `providers/` (3 slices + barrel)
  - Conversation: `conversation/` (8 slices + barrel)
  - RAG: `rag/` (4 slices)
  - Study: `study-store.ts` (SRS sessions)
  - Canvas: `canvas-store.ts`
  - Flashcard: `flashcard-store.ts`

- **Deleted (Story 51-12 - 2026-01-03)**:
  - `src/lib/workspace/conversation-store.ts` → ✅ DELETED (no consumers, was adapter to infrastructure)
  - `src/lib/workspace/ide-state-store.ts` → ✅ DELETED (no consumers, was deprecated backward compatibility layer)

- **Dexie Utilities** (database persistence, not Zustand stores):
  - `src/lib/workspace/threads-store.ts` → Thread persistence utility (used by infrastructure)
  - `src/lib/state/quiz-store.ts` → Standalone quiz CRUD (complementary to study-store, not a duplicate)

- **Active Library Stores** (pending migration):
  - `src/lib/state/ide-store.ts` → IDE panel state
  - `src/lib/state/knowledge-store.ts` → Knowledge workspace state
  - `src/lib/state/rag-store.ts` → RAG indexing/search (1,595 lines - GOD STORE)

- **Deprecated**: `src/stores/` (8 stores, empty - DELETE)

**Store Consolidation Notes (Epic 51)**:
- quiz-store.ts and study-store.ts are COMPLEMENTARY (not duplicates)
  - quiz-store: Quiz CRUD operations (create, edit, delete quizzes)
  - study-store: SRS sessions (spaced repetition, flashcard progress)
- Most "legacy" stores already function as adapters - no migration needed
- See: `_bmad-output/platform-unification-assessment-2026-01-03.md`

**Migration Plan**: 5 phases, 42-58 hours total
- Phase 1: ✅ COMPLETE - Infinite loop fixes
- Phase 2: ✅ PARTIAL - Store consolidation (Legacy files are adapters, not duplicates)
- Phase 3: ⏳ PENDING - God class elimination (20-25 hours)
- Phase 4: ⏳ PENDING - Four-layer architecture alignment (8-12 hours)
- Phase 5: ⏳ PENDING - Validation & documentation (5 hours)

**Planned Consolidation (Epic AC-1):**
See: `_bmad-output/sprint-artifacts/agent-config-consolidation-plan-2026-01-01.md`

**Target Architecture (December 2025 Zustand Patterns):**
- **Unified Global Store**: Single `useAppStore` with domain slices
  - `src/stores/use-app-store.ts` (NEW - consolidates 50+ files)
  - Slices: ide, agent, provider, conversation, rag, tool-permission, orchestration
- **Event-Driven Orchestration**: Cross-store communication via event bus (zero circular deps)
- **Layer Separation**:
  - Layer 1 (Infrastructure): Dexie database, repositories
  - Layer 2 (Domain): Business entities, rules
  - Layer 3 (Application): Services, DTOs, use cases
  - Layer 4 (Presentation): UI components (React)

**Current Persisted State** (IndexedDB):
- `useIDEStore` - open files, active file, panels, terminal tab, chat visibility
- `useToolPermissionStore` ✅ NEW (Cycle 12) - tool trust levels with Dexie persistence
- Agent state via `useAgentsStore`, `useAgentSelectionStore` (localStorage)
- Provider state via `provider-config-store.ts` (Dexie)

**Current Ephemeral State** (in-memory):
- `useStatusBarStore`, `useFileSyncStatusStore`, `useNavigationStore`
- Session trust (ephemeral part of `useToolPermissionStore`)
- Workspace context, theme context (React Context)

**Tool Permission System** (Ralph Loop Cycle 12 - Phase 1 Complete ✅):
- **Store**: `src/lib/state/tool-permission-store.ts` (Zustand + Dexie)
- **Facade**: `src/lib/agent/tool-permission-manager.ts` (preserves backwards compatibility)
- **UI**: `src/presentation/components/agent/WorkspacePermissionEditor.tsx`
- **Persistence**: Trust levels survive browser reloads
- **Ephemeral**: Session trust cleared on reload (via `partialize`)
- **Pattern**: Facade over Zustand store with Dexie persistence
- **Integration**: 8 files use `ToolPermissionManager.getInstance()` (zero breaking changes)

**Domain Services Pattern** (Ralph Loop Cycle 16 - Epic AC-1.5 ✅):
- **Location**: `src/domain/services/agent-workspace-utils.ts` (106 lines)
- **Purpose**: Encapsulates business logic for Agent workspace operations
- **Pattern**: Pure functions (no side effects) operating on domain entities
- **Export**: Barrel export at `src/domain/services/index.ts`
- **Integration**: Used by agent-selection-store, eliminates circular dependencies
- **Available Utilities**:
  - `isAgentAvailableIn(agent, workspaceType)` - Check workspace availability
  - `isAgentDefaultFor(agent, workspaceType)` - Check default status
  - `getAgentsForWorkspace(agents, workspaceType)` - Filter agents by workspace
  - `getDefaultAgentForWorkspace(agents, workspaceType)` - Find default agent

**Key Design Principles**:
- ✅ Agent entity remains pure (data only, no methods)
- ✅ Business logic in domain service layer (testable, reusable)
- ✅ Functions are composable (can be combined for complex logic)
- ✅ Full JSDoc documentation with examples
- ✅ Zero circular dependencies (unidirectional data flow)

**Migration Guide**: See `_bmad-output/ralph-loop-cycle-16-migration-guide-2026-01-01.md`

### Discovery & Navigation Components
- **Command Palette** (Ctrl+P/Cmd+P): Quick command access
- **Feature Search**: Search across IDE features
- **Quick Actions Menu**: Frequently used actions
- **UnifiedNavigation**: Integrates all discovery components

### Component Structure
- Components organized by feature: `agent/`, `chat/`, `ide/`, `ui/`, `layout/`
- Each component directory has `index.ts` barrel exports
- TypeScript interfaces for props (not `type` aliases)

## Configuration

### Vite Configuration (`vite.config.ts`)
Critical cross-origin isolation headers for WebContainers:
```typescript
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
```
The `crossOriginIsolationPlugin` must be FIRST in the plugins array.

### Design Tokens (`src/styles/design-tokens.css` & `design-tokens.ts`)
CSS custom properties and TypeScript constants for:
- Layout tokens (panel sizes, sidebar dimensions)
- Color tokens (8-bit dark theme palette)
- Typography tokens
- Spacing and sizing tokens
- Animation tokens

### TypeScript (`tsconfig.json`)
- Path alias `@/*` → `./src/*`
- `verbatimModuleSyntax: false` (not strict ESM)
- Strict mode with `noUnusedLocals` and `noUnusedParameters`

### Testing (`vitest.config.ts`)
- Tests co-located in `__tests__` directories adjacent to source files
- React components use `jsdom` environment, others use `node`

### Internationalization (`i18next-scanner.config.cjs`)
- Extracts `t()` and `i18next.t()` calls from source files
- Outputs to `src/i18n/{en,vi}.json`
- Excludes test files and generated routes

## Development Workflow

### Starting Development
1. Run `pnpm dev` - starts on port 3000 with required headers
2. Open browser to `http://localhost:3000`
3. Grant file system permissions when prompted

### Testing
- Tests use `vitest` with `jsdom` for React components
- File System Access API is mocked in tests
- Test files follow naming pattern `*.test.ts` or `*.test.tsx`
- Use `vi.mock()` for mocking TanStack AI and providers

### Internationalization
- Use `t()` hook or `i18next.t()` function for translations
- Run `pnpm i18n:extract` to update translation files
- Keys auto-extracted from source code

### Route Generation
- TanStack Router auto-generates `src/routeTree.gen.ts`
- **DO NOT edit this file manually**
- VS Code settings (`.vscode/settings.json`) mark it as read-only

### AI Agent Development
When implementing agent features:
1. **MCP Research Protocol**: Before implementing unfamiliar patterns:
   - Context7: Query library documentation for API signatures
   - Deepwiki: Check repo wikis for architecture decisions
   - Tavily/Exa: Search for 2025 best practices
   - Repomix: Analyze current codebase structure
2. **Agent Tools**: Implement in `src/lib/agent/tools/` following the facade pattern
3. **Provider Adapters**: Use `providerAdapterFactory.createAdapter(providerId, config)`
4. **Tool Execution**: Wire through `useAgentChatWithTools` hook with approval UI

### VS Code Settings
The `.vscode/settings.json` file configures:
- `routeTree.gen.ts` as read-only and excluded from watchers/search
- i18n-ally locales path to `src/i18n/` for translation management

### Git Ignore Patterns (`.gitignore`)
- `node_modules/`, `dist/`, `dist-ssr/`, `.DS_Store`
- Environment files: `*.local`, `.env`, `.nitro`, `.tanstack`, `.wrangler`
- Build artifacts: `.output/`, `.vinxi/`, `todos.json`

## Critical Gotchas & Warnings

### 1. WebContainer Cross-Origin Isolation
- Missing COOP/COEP headers break WebContainers in dev mode
- The `crossOriginIsolationPlugin` must be first in Vite plugins array
- Required for SharedArrayBuffer support

### 2. File System Sync Architecture
- **Local FS is source of truth**: WebContainer mirrors local files
- **No reverse sync**: Changes in WebContainer (e.g., `npm install`) do NOT sync back to local drive
- **Sync exclusions**: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db` are excluded
- **Singleton WebContainer**: Only one instance per page (managed in `src/lib/webcontainer/manager.ts`)

### 3. Terminal Working Directory
- The shell spawns at WebContainer root by default
- Pass `projectPath` to `XTerminal` component or `adapter.startShell(projectPath)`
- Without this, commands like `npm install` won't find `package.json`

### 4. File System Access API Permissions
- Permissions are ephemeral (single session by default)
- Use `permission-lifecycle.ts` utilities to manage persistence
- Handle `PermissionDeniedError` gracefully in UI

### 5. IndexedDB Schema Management
- Project metadata schema in `src/lib/workspace/project-store.ts`
- Schema changes require migration logic
- Versioned schema with upgrade transactions

### 6. Error Handling
- Use custom error classes from `src/lib/filesystem/sync-types.ts`
- `SyncError`, `PermissionDeniedError`, `FileSystemError`
- Wrap critical components with `ErrorBoundary` from `src/components/common/ErrorBoundary.tsx`
- Use error utilities from `src/lib/utils/error-handling.ts`

### 7. Import Order Convention
1. React imports
2. Third-party libraries
3. Internal modules with `@/` alias
4. Relative imports

### 8. AI Agent Tool Concurrency
- Agent tools use a file locking mechanism via `FileLock` class
- Multiple concurrent file operations on the same path are serialized
- Always await tool results before proceeding
- Tools validate paths before execution

### 9. TanStack AI Streaming
- Chat responses are Server-Sent Events (SSE) streams
- Use `Symbol.asyncIterator` to consume streams
- Handle `done` event types for completion
- Stream responses require proper error handling

### 10. State Management (P0 Issue - Deferred)
- `IDELayout.tsx` duplicates IDE state with local `useState` instead of using `useIDEStore`
- Recommended refactoring deferred to avoid MVP-3 interference
- See `_bmad-output/state-management-audit-p1.10-2025-12-26.md` for details

## Existing Documentation & Guidance

### AGENTS.md
The repository already has comprehensive guidance in `AGENTS.md` covering:
- Development workflow and story development cycle
- Git commit message format with epic/story context
- Branch strategy (feature branches created after epic completion)
- Project-specific nuances and gotchas
- Code style and conventions
- Testing structure and patterns
- State management best practices (P1.10 audit findings)

### .agent/rules/general-rules.md
Comprehensive development rules including:
- **Mandators MCP Research Protocol**: Step-by-step research before implementing unfamiliar patterns
- **Dependency documentation**: Full list of GitHub repos and official docs for all dependencies
- **Development tools guidance**: When to use Context7, Deepwiki, Tavily, Exa, Repomix MCP tools
- **Context preservation**: Document artifact IDs, variables, naming conventions, date stamps

### BMAD Method Integration
The project includes BMAD (Business Model & Agile Development) method rules:

#### Available Modules
- **CORE**: Master agent, brainstorming, party mode workflows
- **BMB**: Builder tools for creating agents, workflows, modules
- **BMM**: Implementation agents (analyst, architect, dev, pm, etc.) and workflows
- **CIS**: Creative/strategy agents (innovation, design thinking, storytelling)

#### Usage
Reference specific agents/tools/workflows with `@bmad/{module}/{type}/{name}` pattern:
- `@bmad/bmm/agents/dev` - Development agent
- `@bmad/bmm/workflows/code-review` - Code review workflow
- `@bmad/core/workflows/brainstorming` - Brainstorming facilitation

---

## Epic Implementation Guide (Platform Unification - Phase 3)

**Current Active Epics** (Iterations 31-150):
- **Epic CC-1**: Conversation Consolidation (15 stories, 127 hours) - HIGHEST PRIORITY
- **Epic CP-1**: Project Consolidation (18 stories, 80-100 hours) - SECOND PRIORITY

**Documentation**:
- Epic breakdowns: `_bmad-output/research/platform-unification-2026-01-02/epic-*-consolidation-breakdown.md`
- Gap documentation: `cornerstone-*-detailed-gap-documentation.md`
- Implementation roadmap: `comprehensive-implementation-roadmap.md`

---

### How to Implement an Epic Story

**Example: Story CC-1.1 (Create Conversation Metadata Slice)**

**Step 1: Read the Story** (15 minutes)
```bash
# Open epic breakdown
cat _bmad-output/research/platform-unification-2026-01-02/epic-cc-1-conversation-consolidation-breakdown.md

# Find story CC-1.1
# Read all acceptance criteria
# Understand test requirements
```

**Step 2: Read Reference Implementations** (30 minutes)
```bash
# See how Cornerstones 1 & 2 were refactored
cat _bmad-output/research/platform-unification-2026-01-02/adrs/ADR-002-agent-vault-architecture.md

# Look at existing slice implementations
ls src/infrastructure/persistence/stores/providers/
# Read provider-store-core.ts (97 lines) - good slice example
```

**Step 3: Create Slice File** (2-4 hours)
```typescript
// File: src/infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts
// Template (max 120 lines):

import { StateCreator } from 'zustand';

export interface ConversationMetadata {
  id: string;
  workspaceType: WorkspaceType;
  projectId: string | null;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'deleted';
}

export interface ConversationMetadataState {
  // State (minimal, typed)
  conversations: Record<string, ConversationMetadata>;
  activeConversationId: string | null;
  activeProjectConversationIds: Record<string, string>;

  // Actions (focused, single responsibility)
  createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
  updateConversationMetadata: (id: string, updates: Partial<ConversationMetadata>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  getConversation: (id: string) => ConversationMetadata | undefined;
  getAllConversations: () => ConversationMetadata[];
  getConversationsByWorkspace: (workspaceType: WorkspaceType) => ConversationMetadata[];
  getConversationsByProject: (projectId: string) => ConversationMetadata[];
}

export const createConversationMetadataSlice: StateCreator<ConversationStore> = (set, get) => ({
  // State initialization
  conversations: {},
  activeConversationId: null,
  activeProjectConversationIds: {},

  // Implementation...
});
```

**Step 4: Write Unit Tests** (2-3 hours)
```typescript
// File: src/infrastructure/persistence/stores/conversation/__tests__/conversation-metadata-slice.test.ts

describe('conversation-metadata-slice', () => {
  it('should create conversation with auto-generated UUID', () => {
    const store = createConversationStore();
    const conversationId = store.getState().createConversation('ide', 'project-123', 'agent-1');

    expect(conversationId).toBeDefined();
    expect(conversationId).toMatch(/^conv_/);

    const conversation = store.getState().getConversation(conversationId);
    expect(conversation.workspaceType).toBe('ide');
    expect(conversation.projectId).toBe('project-123');
    expect(conversation.agentId).toBe('agent-1');
    expect(conversation.createdAt).toBeInstanceOf(Date);
  });

  it('should update conversation timestamp automatically', () => {
    const store = createConversationStore();
    const conversationId = store.getState().createConversation('ide', null, 'agent-1');
    const before = store.getState().getConversation(conversationId).updatedAt;

    // Wait 1ms
    await new Promise(r => setTimeout(r, 1));

    store.getState().updateConversationMetadata(conversationId, { status: 'archived' });
    const after = store.getState().getConversation(conversationId).updatedAt;

    expect(after.getTime()).toBeGreaterThan(before.getTime());
  });

  // ... 8 more tests (total 10 tests for CC-1.1)
});
```

**Step 5: Run Tests** (5 minutes)
```bash
# Run unit tests
pnpm test conversation-metadata-slice.test.ts

# Verify all tests pass
# Expected: 10/10 tests passing

# Run TypeScript check (production code only)
pnpm typecheck
# Expected: Zero new errors (test files excluded)
```

**Step 6: Verify Acceptance Criteria** (30 minutes)
```bash
# Open epic breakdown, check story CC-1.1 acceptance criteria:

# 1. File Created ✅
#    - conversation-metadata-slice.ts exists
#    - File ≤120 lines (excluding imports/comments)
#    - Exports createConversationMetadataSlice function

# 2. State Interface ✅
#    - Defined TypeScript interface with all methods
#    - All getters return typed values (no any)

# 3. Functionality ✅
#    - createConversation auto-generates UUID
#    - createConversation sets initial metadata
#    - updateConversationMetadata updates updatedAt timestamp
#    - deleteConversation soft-deletes (sets status to 'deleted')
#    - setActiveConversation updates active conversation and active project mapping
#    - All getters return typed values (no any)

# 4. Tests (10 tests) ✅
#    - All 10 tests passing
#    - Test coverage ≥80%
```

**Step 7: Create Pull Request** (15 minutes)
```bash
# Commit with conventional commit message
git add .
git commit -m "feat(cc-1): Implement conversation metadata slice (Story CC-1.1)

- Create conversation-metadata-slice.ts (120 lines)
- Implement 10 acceptance criteria
- Write 10 unit tests
- Achieve 85% test coverage

Closes Epic CC-1, Story CC-1.1"

# Push to feature branch
git push origin feature/cc-1-1-conversation-metadata-slice

# Create PR with template
# Link to epic breakdown document
# Request code review
```

---

### Epic-Specific Guidance

#### Epic CC-1 (Conversation Consolidation)

**God Stores to Refactor**:
- `src/infrastructure/persistence/stores/conversation/conversation-store.ts` (626 lines)
- `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts` (726 lines)

**Target Architecture** (6 slices):
```
src/infrastructure/persistence/stores/conversation/
├── conversation-metadata-slice.ts (120 lines) - Story CC-1.1
├── thread-management-slice.ts (120 lines) - Story CC-1.2
├── message-crud-slice.ts (120 lines) - Story CC-1.3
├── conversation-utils-slice.ts (120 lines) - Story CC-1.4
├── conversation-validation-slice.ts (120 lines) - Story CC-1.5
├── conversation-events-slice.ts (120 lines) - Story CC-1.6
├── index.ts (unified store) - Story CC-1.7
└── __tests__/
    ├── conversation-metadata-slice.test.ts (10 tests)
    ├── thread-management-slice.test.ts (14 tests)
    ├── message-crud-slice.test.ts (12 tests)
    ├── conversation-utils-slice.test.ts (10 tests)
    ├── conversation-validation-slice.test.ts (12 tests)
    └── conversation-events-slice.test.ts (12 tests)
```

**Component Migration Order** (Stories CC-1.9 through CC-1.13):
1. **Batch 1** (Story CC-1.9): Study workspace (4 hours) - LOW risk
2. **Batch 2** (Story CC-1.10): Notes workspace (6 hours) - LOW-MEDIUM risk
3. **Batch 3** (Story CC-1.11): Knowledge workspace (8 hours) - MEDIUM risk
4. **Batch 4** (Story CC-1.12): Chat components (6 hours) - MEDIUM risk
5. **Batch 5** (Story CC-1.13): IDE workspace (11 hours) - HIGHEST risk

**Data Migration** (Story CC-1.8):
```typescript
// Migration script: src/infrastructure/persistence/stores/conversation/migrate.ts
export async function migrateConversationData() {
  // Step 1: Create timestamped backup
  const backup = await backupIndexedDB('conversation-backup-' + Date.now());

  // Step 2: Read old stores
  const oldConversations = await getOldConversations();
  const oldThreads = await getOldThreads();

  // Step 3: Transform to new schema
  const newConversations = transformConversations(oldConversations, oldThreads);

  // Step 4: Write to new store
  await writeNewConversations(newConversations);

  // Step 5: Verify data integrity
  const verification = verifyMigration(oldConversations, newConversations);
  if (!verification.success) {
    // Rollback
    await restoreBackup(backup);
    throw new Error('Migration failed: ' + verification.error);
  }

  // Step 6: Cleanup (after successful migration)
  await deleteOldStores();
}
```

---

#### Epic CP-1 (Project Consolidation)

**God Stores to Refactor**:
- `src/lib/workspace/project-store.ts` (450 lines)
- `src/lib/filesystem/file-snapshot-store.ts` (509 lines)

**Target Architecture** (9 slices):
```
src/infrastructure/persistence/stores/project/
├── project-crud-slice.ts (120 lines) - Story CP-1.1
├── project-workspace-bindings-slice.ts (100 lines) - Story CP-1.2
├── project-permissions-slice.ts (110 lines) - Story CP-1.3
├── project-layout-slice.ts (80 lines) - Story CP-1.4
├── project-utils-slice.ts (90 lines) - Story CP-1.5
├── index.ts (unified store) - Story CP-1.6
└── __tests__/ (70 tests)

src/infrastructure/persistence/stores/snapshot/
├── snapshot-metadata-slice.ts (100 lines) - Story CP-1.7
├── snapshot-cache-slice.ts (110 lines) - Story CP-1.8
├── snapshot-bulk-ops-slice.ts (90 lines) - Story CP-1.9
├── snapshot-quota-slice.ts (80 lines) - Story CP-1.10
├── index.ts (unified store) - Story CP-1.11
└── __tests__/ (56 tests)

routes/
└── hub.tsx (NEW) - Story CP-1.12 (Hub accessible via /hub URL)
```

**Hub Routing Fix** (Story CP-1.12):
```typescript
// File: src/routes/hub.tsx (NEW)

import { createFileRoute, Link } from '@tanstack/react-router';
import { HubHomePage } from '@/presentation/components/hub/HubHomePage';

export const Route = createFileRoute('/hub')({
  component: HubHomePage,
  beforeLoad: async () => {
    // Verify Hub components exist
    const { HubHomePage } = await import('@/presentation/components/hub/HubHomePage');
    return { HubHomePage };
  },
});
```

**Component Migration Order** (Stories CP-1.13 through CP-1.15):
1. **Batch 1** (Story CP-1.13): Hub components (4 components, 3 hours) - LOW risk
2. **Batch 2** (Story CP-1.14): IDE components (2 components, 6 hours) - MEDIUM risk
3. **Batch 3** (Story CP-1.15): File sync services (3 services, 8 hours) - MEDIUM-HIGH risk

---

### Common Pitfalls & How to Avoid Them

**Pitfall 1: Circular Dependencies** ❌
```typescript
// WRONG - Direct import causes circular dependency
import { updateConversation } from './conversation-metadata-slice';

export const createThreadManagementSlice = (set, get) => ({
  createThread: (conversationId) => {
    updateConversation(conversationId, { hasThreads: true }); // Circular!
  }
});
```

**Solution** (use `get()` for cross-slice calls):
```typescript
// CORRECT - Use get() to call other slices
export const createThreadManagementSlice = (set, get) => ({
  createThread: (conversationId) => {
    // Call metadata slice via get() (no circular dependency)
    get().updateConversationMetadata(conversationId, { hasThreads: true });
  }
});
```

---

**Pitfall 2: Breaking Existing Components** ❌
```typescript
// WRONG - Rename store without facade (breaks 20+ components)
export const useConversationStore = create<ConversationStore>(...);

// Old components break:
// import { useConversationStore } from './conversation-store';
// Error: Module not found!
```

**Solution** (create facade exports):
```typescript
// CORRECT - Preserve backwards compatibility with facade

// 1. Create new store
export const useUnifiedConversationStore = create<ConversationStore>(...);

// 2. Create facade in old file
// File: src/infrastructure/persistence/stores/conversation/conversation-store.ts
export { useConversationStore } from './index'; // Re-export as facade

// 3. Old components continue to work (zero breaking changes)
// import { useConversationStore } from './conversation-store'; // ✅ Still works
```

---

**Pitfall 3: Data Loss During Migration** ❌
```typescript
// WRONG - No backup before migration
export async function migrateToNewStore() {
  const data = await getOldData();
  await deleteOldData(); // ❌ Data loss if migration fails!
  await writeNewData(data);
}
```

**Solution** (backup + verify + rollback):
```typescript
// CORRECT - Safe migration with backup
export async function migrateToNewStore() {
  // Step 1: Create timestamped backup
  const backupId = 'backup-' + Date.now();
  await backupIndexedDB(backupId);

  try {
    // Step 2: Migrate data
    const data = await getOldData();
    const transformed = transformData(data);
    await writeNewData(transformed);

    // Step 3: Verify integrity
    const verification = await verifyMigration(transformed);
    if (!verification.success) {
      throw new Error(verification.error);
    }

    // Step 4: Delete old data (only after successful migration)
    await deleteOldData();
  } catch (error) {
    // Rollback: Restore from backup
    await restoreBackup(backupId);
    throw error;
  }
}
```

---

### Testing Requirements Summary

**Epic CC-1**: 105 tests total
- 70 unit tests (10 per slice × 6 slices + 10 for migration)
- 20 integration tests (cross-slice communication)
- 15 E2E tests (component workflows)

**Epic CP-1**: 95 tests total
- 60 unit tests (project slices: 12×5 + snapshot slices: 10×4)
- 20 integration tests
- 15 E2E tests (Hub routing + project workflows)

**Test Coverage Target**: ≥80%

**Test Command**:
```bash
# Run all tests
pnpm test

# Run specific epic tests
pnpm test -- epic-cc-1
pnpm test -- epic-cp-1

# Run with coverage
pnpm test -- --coverage

# Expected: ≥80% coverage for all slices
```

---

### Code Review Checklist

Before marking a story as complete, verify:

**Code Quality**:
- [ ] File ≤120 lines (excluding imports/comments)
- [ ] Zero TypeScript errors (`pnpm typecheck` - production code only)
- [ ] Zero ESLint warnings
- [ ] All functions have JSDoc comments
- [ ] No `any` types (strict typing)

**Functionality**:
- [ ] All acceptance criteria met
- [ ] All tests passing (100% pass rate)
- [ ] Test coverage ≥80%
- [ ] Manual testing completed (for UI components)

**Safety**:
- [ ] No breaking changes to existing code
- [ ] Facade exports created (if renaming stores)
- [ ] Data migration script has backup + rollback
- [ ] IndexedDB operations safe (no quota issues)

**Documentation**:
- [ ] Story status updated in epic breakdown
- [ ] Commit message follows conventional commit format
- [ ] Pull request links to epic breakdown
- [ ] Code review approved

---

## Common Operations

### Adding New Agent Tools
1. Create tool in `src/lib/agent/tools/`
2. Add tool schema with `zod` validation
3. Implement tool handler (read from facade, execute, return result)
4. Register in `src/lib/agent/tools/index.ts`
5. Add to agent configuration in `useAgentChatWithTools`
6. Write tests in `src/lib/agent/tools/__tests__/`

### Adding New AI Providers
1. Add provider config to `model-registry.ts`
2. Implement adapter in `provider-adapter.ts` following `ProviderAdapter` interface
3. Register in `providerAdapterFactory.createAdapter()`
4. Add to `AgentConfigDialog` provider selector
5. Test with `/api/chat` endpoint

### Adding New Features
1. Create component in appropriate feature directory (`ide/`, `ui/`, `layout/`)
2. Add barrel export in directory's `index.ts`
3. Add translations using `t()` hook
4. Write tests in adjacent `__tests__/` directory
5. Run `pnpm i18n:extract` if adding new translation keys

### Adding New Icon Components
1. Create icon file in `src/components/ui/icons/` (e.g., `NewIcon.tsx`)
2. Follow the icon component pattern with SVG and 8-bit styling
3. Export from `src/components/ui/icons/index.ts`

### File System Operations
- Use `LocalFSAdapter` for all file operations
- File changes trigger sync via `SyncManager`
- Handle permission lifecycle with `permission-lifecycle.ts` utilities

### State Management
- Workspace state via `WorkspaceContext` React Context
- Zustand stores for reactive state (`src/lib/state/`)
- Project metadata persisted in IndexedDB
- Agent state in `src/stores/` (localStorage)

## Testing Notes

- Mock `window.showDirectoryPicker` in tests
- Use `fake-indexeddb` for IndexedDB testing
- React component tests use `@testing-library/react` with `jsdom`
- File system tests mock File System Access API

### Agent Testing
- Mock TanStack AI with `vi.mock('@tanstack/ai')`
- Mock provider adapters for unit tests
- Facade tests should mock WebContainer operations
- Use `FileLock` wrapper for concurrency tests

### Error Boundary Testing
- Test error boundary catches expected errors
- Verify error state UI displays correctly
- Test error recovery mechanisms

## Performance Considerations

- WebContainer boot is expensive (≈3-5 seconds)
- File sync uses debounced batch operations
- Large `node_modules` directories are excluded from sync (regenerated in WebContainer)
- Monaco Editor loads languages/features on-demand

### AI Agent Performance
- Tool execution uses non-blocking async patterns
- Streaming responses reduce perceived latency
- File operations are debounced and batched
- Credential vault uses fast IndexedDB lookups

### UI Performance
- `react-window` for virtual scrolling in long lists
- `SkeletonLoader` for perceived performance during loading
- CSS animations from `animations.css` for smooth transitions

## Troubleshooting

### WebContainer Not Loading
1. Check console for COOP/COEP header errors
2. Verify `crossOriginIsolationPlugin` is first in Vite plugins
3. Check browser supports File System Access API (Chrome/Edge)

### File Sync Issues
1. Verify permissions granted to File System Access API
2. Check sync exclusions don't affect needed files
3. Monitor `SyncManager` logs for errors

### Terminal Not Responding
1. Ensure `projectPath` is passed to terminal
2. Check WebContainer is booted (`webcontainer-manager.ts`)
3. Verify terminal is connected to WebContainer shell

### Translation Keys Missing
1. Run `pnpm i18n:extract`
2. Check key is in correct namespace (default: `translation`)
3. Verify `t()` function usage follows i18next patterns

### Agent Tool Not Executing
1. Verify tool is registered in `tools/index.ts`
2. Check facade is properly initialized with WebContainer instance
3. Verify file lock is not held by another operation
4. Check browser console for tool execution errors
5. Verify API credentials are set via `AgentConfigDialog`

### Chat API Returning 401
1. Check if provider has credentials in `credentialVault`
2. Open `AgentConfigDialog` and configure API keys
3. Verify provider is supported in `model-registry`
4. Check `/api/chat` logs for authentication errors

### Component Error Boundary Triggered
1. Check browser console for error details
2. Review error state UI for error message
3. Verify component props are valid
4. Check for async operation failures

## Recent Updates (Updated: 2026-01-01)

### 🚨 Ralph Loop Cycle 18: Governance Misalignment & Course Correction (2026-01-01)
- **Critical Finding**: Previous validation claimed 100/100 health score, actual reality is ~5.9%
- **TypeScript Errors**: 1,172 remaining (306 production + 866 test)
- **File Size Violations**: 17 files exceed 300-line limit
- **Infrastructure Gaps**: P0 data loss risks (no quota handling, silent failures)
- **Decision**: ✅ IMMEDIATE COURSE CORRECTION APPROVED
- **8-Week Stabilization Plan**:
  - Phase 0 (Week 1-2): Foundation Stabilization
    - TS-001: Fix TypeScript Errors (6-8 hours) - Reduce from 1,172 to <100
    - DB-001: Safe IndexedDB Operations (18-22 hours) - Add quota handling
    - UI-001: Extract AgentConfigDialog Hooks (16-20 hours) - 1,089 → <300 lines
  - Phase 1 (Week 3-4): Store Refactoring - Split god stores into slices
  - Phase 2 (Week 5-6): Infrastructure Hardening - Fix P1 gaps
  - Phase 3 (Week 7-8): Architecture Transformation - 4-layer clean architecture
- **MCP Research Completed**: 5 tool turns (Context7 x3, Deepwiki x1, Web Search x1)
  - Zustand v5 patterns (persist, slices, middleware)
  - Dexie.js patterns (transactions, quotas, errors)
  - React 2025 patterns (error boundaries, Suspense)
  - TanStack repository patterns
  - God component elimination strategies (2025)
- **Documentation Created**:
  - `ralph-loop-cycle-18-gap-summary-2026-01-01.md`
  - `ralph-loop-cycle-18-mcp-research-findings-2026-01-01.md`
  - `ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md`
- **Reference**: See correct-course workflow for complete stabilization plan

### Agent Selector Fragmentation Fix (Cycle 18 - Iteration 1)
- **Problem**: Three workspaces (Knowledge, Notes, Study) using AgentSelector from chat components which uses `useAgentsStore` (global state) instead of `useAgentSelectionStore` (per-workspace state)
- **User Feedback**:
  > "handle end to end agent selector and migrate them all to other workspaces - at `notes` there is no synchronization of agents selector - completely fragmented"
- **Solution Implemented**:
  - Created `UnifiedAgentSelector.tsx` (247 lines) - Uses proper per-workspace store
  - Created `AgentManager.tsx` (285 lines) - Comprehensive management UI addressing user feedback about short-sighted dropdown design
  - Updated all three workspaces (Knowledge, Notes, Study) to use new components
- **Result**: Agent selections now persist per-workspace and sync across workspaces
- **Components Created**:
  - `UnifiedAgentSelector.tsx` - Fixes store fragmentation bug
  - `AgentManager.tsx` - Quick config, capability badges, status display, workspace binding toggle
- **Documentation**: See `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md`

### Ralph Loop Cycle 17: God Component Elimination (87.5% COMPLETE)
- **Session**: Recursive auto-loop with ultrathink systematized cycles
- **Progress**: 7 of 8 major tasks completed (87.5%)
- **Achievements**:
  - ✅ 608 lines of god component code eliminated
  - ✅ 21 new modular components created (all <120 lines)
  - ✅ 4 event activity indicators created
  - ✅ 0 breaking changes (100% API compatibility)
  - ✅ December 2025 React patterns applied throughout
- **Component Refactoring**:
  - **Phase 1**: AgentBasicConfig deleted (302 → 0 lines, 100%)
  - **Phase 2**: WorkspaceToolPermissionsConfig split (318 → 175 lines, 45%)
    - 7 components + 1 custom hook (useWorkspacePermissions)
    - Component composition pattern
  - **Phase 3**: ToolTrustLevelManager split (246 → 83 lines, 66%)
    - 3 components + 1 custom hook (useToolTrustLevels)
    - localStorage persistence pattern
- **Event Activity Indicators**: 4 components for user journey feedback
  - DatabaseIndexingIndicator.tsx (84 lines)
  - EmbeddingProgressIndicator.tsx (84 lines)
  - ChunkingStatusIndicator.tsx (84 lines)
  - SyncStatusIndicator.tsx (84 lines)
- **Documentation**: 6 comprehensive reports created
  - `ralph-loop-cycle-17-final-session-completion-2026-01-01.md`
  - Phase 2 & 3 completion reports
  - Session status reports
- **Next**: Phase 4 - Extract hooks from AgentConfigDialog (539 → ~200 lines)
- **Reference**: `_bmad-output/ralph-loop-cycle-17-final-session-completion-2026-01-01.md`

### Ralph Loop Cycle 12, Iteration 17: Three Centralized Systems Analysis (2026-01-01)
- **Comprehensive Analysis**: 4-turn MCP research cycle analyzing LLM provider, agent configuration, and tool permissions systems
- **System 1 - LLM Provider Key Vault**: ✅ EXCELLENT (10/12 levels passed, 83% health score)
  - 3-Module Facade Pattern: credential-vault + credential-storage + credential-encryption
  - AES-256-GCM encryption, PBKDF2 key derivation (100,000 iterations)
  - Graceful fallback with validateStorageKeys() before decryption
  - **Status**: Production-ready, no action needed
- **System 2 - AI Agents Configuration**: ❌ CRITICAL DEBT (5/12 levels passed, 42% health score)
  - God store: agents-store.ts (429 lines, 3.6x 120-line standard)
  - Circular dependency: agents-store.ts ↔ provider-store.ts
  - Store duplication: 25+ duplicated stores across 3 locations
  - **Recommendation**: Execute Epic AC-1 (8 stories, 42 hours)
- **System 3 - Tools Use Permissions**: ✅ GOOD (10/12 levels passed, 83% health score)
  - Facade pattern with zero breaking changes
  - Zustand + Dexie persistence with partialize for selective persistence
  - **Status**: Production-ready (fixed in Cycle 12)
- **Codebase Statistics**: 172,582 lines across 4,094 files, 135 god classes, 40 critical files
- **Two Epics Ready for Implementation**:
  - Epic WB (Workspace Binding): 8 stories, 42 hours, 100% story readiness
  - Epic AC-1 (Agent Consolidation): 8 stories, 42 hours, 100% story readiness
- **Documentation Created**: 6 comprehensive artifacts (~5,000 total lines)
- **MCP Tool Usage**: 4 tool turns (Repomix, Zustand docs, Dexie docs, Context7)
- **Analysis Documents**:
  - `complete-system-architecture-analysis-2026-01-01.md` (1,248 lines)
  - `llm-provider-system-analysis-2026-01-01.md` (~500 lines)
  - `agent-configuration-system-analysis-2026-01-01.md` (~700 lines)
  - `tool-permissions-system-analysis-2026-01-01.md` (~600 lines)
  - `architectural-gap-validation-2026-01-01.md` (~900 lines)
  - `ralph-loop-cycle-12-iteration-17-completion-2026-01-01.md` (~550 lines)

### Ralph Loop Cycle 12: TypeScript Remediation (2026-01-01)
- **Autonomous Execution**: 2-hour session, 87 TypeScript errors fixed (6.5% reduction: 1340 → 1253)
- **Vitest Import Fixes**: Removed global imports from 17 test files (57 errors)
- **Component Exports**: Fixed barrel exports in RAG components (10 errors)
- **DomainEvent Pattern**: Fixed event handler payload access in cross-workspace-event-bus.ts (~10 errors)
- **tailwind-merge v3**: Updated import API (tailwindMerge → twMerge) in 2 components
- **Type Imports**: Removed redundant `type` keywords in dexie-db-class.ts (5 errors)
- **Package Installation**: Added @testing-library/user-event@14.6.1 (3 errors)
- **MCP Tool Usage**: 4 tool turns (Context7 TypeScript docs, Web Search ESLint automation)
- **Documentation Created**: Session summary, progress report, validation report (v1.1.0)
- **Files Modified**: 25 files (core architecture, UI components, 17 test files, package.json)
- **Next Session**: Bulk removal of unused imports (~90 TS6196 errors)

### Phase 1: Core Stabilization (Current Focus)
- **Responsive Design**: `useResponsive` hook for breakpoint detection
- **Mobile Layouts**: `IDELayout.tsx` and `MobileIDELayout.tsx` with proper device detection
- **Mobile Error States**: Desktop-only feature messages for mobile users
- **State Management**: Continued cleanup of duplicate state in `IDELayout.tsx`

### UI & Design System Enhancements (Epic 28 & P2)
- **Icon System**: Added 10+ new icon components (AIIcon, ChatIcon, CloseIcon, FileIcon, MenuIcon, PlusIcon, RefreshIcon, SettingsIcon, TerminalIcon)
- **Animation System**: New `animations.css` with 8-bit themed animations
- **Design Tokens**: Comprehensive CSS custom properties and TypeScript constants
- **8-bit Design**: Dark-themed aesthetic with pixel-perfect styling standardized

### Error Handling & Accessibility (Epic 23 P1.8, P1.9)
- **Error Boundaries**: Added `ErrorBoundary` component to critical IDE components
- **Error State UI**: New `ErrorState`, `EmptyState`, `LoadingState`, `SkeletonLoader` components
- **Error Utilities**: New `error-handling.ts` utilities for consistent error handling
- **Accessibility**: Enhanced keyboard navigation and ARIA support across IDE components

### Responsive Design (Epic 23 P1.7)
- **Mobile-First**: Implemented responsive layout for IDE components
- **Breakpoints**: Added responsive classes to `IDELayout` and `IconSidebar`
- **Design Tokens**: Responsive panel sizes and sidebar dimensions

### Navigation & Discovery (Epic 23 P1.5)
- **Command Palette**: Ctrl+P/Cmd+P keyboard shortcut for quick access
- **Feature Search**: Search across IDE features
- **Quick Actions Menu**: Frequently used actions
- **UnifiedNavigation**: Integrates all discovery components
- **Navigation Store**: New `useNavigationStore` for state management

### State Management (Epic 23 P1.10)
- **Audit Complete**: State management audit documented
- **P0 Issue Identified**: `IDELayout.tsx` duplicates IDE state (deferred refactoring)
- **Architecture Documented**: Clear separation of persisted, ephemeral, agent, and UI state

### Workspace Context Migration (Epic 51 - P2-9, 2026-01-04)
- **Status**: ✅ COMPLETE - All IDE-only components marked, OLD context deprecated
- **Migration Required**: For cross-workspace components, migrate from OLD `useWorkspace()` to NEW `useWorkspaceStore()`
- **IDE-Only Components** (may continue using OLD context):
  - `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` - @workspace ide-only
  - `src/presentation/components/ide/AgentChatPanel.tsx` - @workspace ide-only
  - `src/presentation/components/ide/FileTree/FileTree.tsx` - @workspace ide-only
  - `src/presentation/components/ide/statusbar/AgentStatusSegment.tsx` - @workspace ide-only
  - `src/presentation/components/layout/IDEHeaderBar.tsx` - @workspace ide-only
  - `src/presentation/components/layout/MobileIDELayout.tsx` - @workspace ide-only
- **OLD Context** (deprecated):
  - `src/lib/workspace/WorkspaceContext.tsx` - @deprecated IDE-ONLY CONTEXT
  - **DO NOT USE** for new cross-workspace components
- **NEW Store** (use for cross-workspace components):
  - `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx`
  - **Import**: `import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace'`
  - **Usage**: Individual selectors only (Zustand v5 pattern):
    ```typescript
    const projectId = useWorkspaceStore(s => s.projectId);
    const workspaceType = useWorkspaceStore(s => s.workspaceType);
    ```
- **Reference**: `_bmad-output/p2-9-workspace-context-audit-2026-01-04.md`

### Internationalization
- **Vietnamese**: Comprehensive Vietnamese translations added
- **Command Palette**: Full i18n support for discovery components
- **Keyboard Shortcuts**: Translated shortcut descriptions

### Key Files for Recent Changes
- `src/components/layout/IDELayout.tsx`: Main IDE layout with responsive design
- `src/components/layout/MobileIDELayout.tsx`: Mobile-specific layout
- `src/hooks/useResponsive.ts`: Breakpoint detection hook
- `src/components/common/ErrorBoundary.tsx`: Error boundary implementation
- `src/components/ui/icons/`: Icon component library
- `src/styles/design-tokens.css` & `design-tokens.ts`: Design token system
- `src/styles/animations.css`: Animation styles
- `src/lib/state/navigation-store.ts`: Navigation state management
- `src/lib/utils/error-handling.ts`: Error handling utilities
- `_bmad-output/state-management-audit-p1.10-2025-12-26.md`: State audit findings

## Where to Find Things

### Code Locations
- **AI Agent System**: `src/lib/agent/`
- **Chat UI Components**: `src/components/chat/`
- **Chat API**: `src/routes/api/chat.ts`
- **Agent Configuration**: `src/components/agent/AgentConfigDialog.tsx`
- **File System Logic**: `src/lib/filesystem/`
- **WebContainer Manager**: `src/lib/webcontainer/manager.ts`
- **Workspace State**: `src/lib/workspace/`
- **Zustand Stores**: `src/lib/state/`, `src/stores/`
- **UI Components**: `src/components/ui/`
- **Icon Components**: `src/components/ui/icons/`
- **Layout Components**: `src/components/layout/` (IDELayout, MobileIDELayout)
- **Error Handling**: `src/lib/utils/error-handling.ts`, `src/components/common/`
- **Translation Keys**: `src/i18n/{en,vi}.json`
- **Hooks**: `src/hooks/` (useResponsive, etc.)

### Project Planning Artifacts
- **Sprint Status**: `_bmad-output/sprint-artifacts/sprint-status.yaml`
- **Parallel Development Strategy**: `_bmad-output/project-planning-artifacts/parallel-development-dual-agents-mode.md`
- **Architecture**: `_bmad-output/project-planning-artifacts/architecture.md`
- **PRD**: `_bmad-output/project-planning-artifacts/prd.md`
- **Project Context**: `_bmad-output/project-planning-artifacts/project-context.md`
- **UX Design Spec**: `_bmad-output/project-planning-artifacts/ux-design-specification.md`
- **Epics**: `_bmad-output/epics.md`

### BMAD Documentation
- **BMAD Workflows**: `.cursor/commands/bmad/`
- **Knowledge Synthesis Concept**: `_bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md`
- **Tech Documentation**: `docs/2025-12-23/`
- **Brownfield Analysis**: `_bmad-output/docs/`
- **Version 2 Research**: `_bmad-output/docs/2025-12-28/version-2/`
- **Iteration 17 Analysis**: `_bmad-output/architecture-analysis/`, `_bmad-output/sprint-artifacts/`
