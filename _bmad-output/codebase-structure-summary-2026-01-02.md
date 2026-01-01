# Codebase Structure Quick Reference
## Project Alpha - At-a-Glance Overview

**Last Updated:** 2026-01-02
**Analysis Tool:** Repomix (4,232 files → 81MB XML)

---

## 📊 Vital Statistics

```
Total Files:          4,232
TypeScript Files:     946
React Components:     332
State Stores:         141 (distributed across 3 locations)
Test Files:           32
Source Lines:         171,125
Route Definitions:    34 (TanStack Router)
```

---

## 🏗️ Architecture Overview

### Four-Layer Pattern (Partial Implementation)

```
┌─────────────────────────────────────────┐
│ PRESENTATION (UI Components)            │
│ src/presentation/components/ (332)      │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ INFRASTRUCTURE (Persistence, Events)    │
│ src/infrastructure/                     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ DOMAIN (Services, Use Cases)            │
│ src/domain/, src/application/           │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ CORE (Entities, Value Objects)          │
│ src/core/entities/                      │
└─────────────────────────────────────────┘
```

**Status:** ✅ Presentation layer strong, ⚠️ Domain/Core layers minimal

---

## 📁 Directory Structure (Top-Level)

```
src/
├── application/          # Application services & DTOs
├── components/           # ⚠️ DEPRECATED (migrating to presentation/)
├── core/                 # ✅ Domain entities (NEW)
├── domain/               # ✅ Domain services (NEW)
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization (en, vi)
├── infrastructure/       # ✅ Persistence, events (NEW)
├── lib/                  # ⚠️ Legacy business logic (65+ files)
│   ├── agent/            # AI agent infrastructure
│   ├── filesystem/       # File system operations
│   ├── knowledge/        # Knowledge graph, flashcards
│   ├── rag/              # RAG indexing, retrieval
│   ├── state/            # ⚠️ Zustand stores (25+ files)
│   └── [other modules]
├── presentation/         # ✅ UI components (NEW)
│   └── components/       # 332 React components
│       ├── agent/        # Agent configuration (20+)
│       ├── ide/          # IDE components (20+)
│       ├── knowledge/    # Knowledge workspace (15+)
│       ├── study/        # Study workspace (10+)
│       ├── notes/        # Notes workspace (10+)
│       └── ui/           # Reusable primitives (50+)
├── routes/               # ✅ TanStack Router (34 routes)
├── stores/               # ⚠️ DEPRECATED (empty)
└── workspaces/           # Workspace-specific logic
```

---

## 🎯 Key Systems

### 1. AI Agent System ✅
**Status:** Production-ready (83% health)

```
UI (AgentChatPanel, AgentConfigDialog)
    ↓
useAgentChat Hook
    ↓
AgentFactory
    ↓
ProviderAdapter (OpenRouter, Anthropic, etc.)
    ↓
TanStack AI (streaming)
    ↓
Agent Tools (19 tools)
    - read, write, list, execute
    - FileTools facade, TerminalTools facade
```

**Files:**
- `src/lib/agent/` - 65 files
- `src/lib/agent/tools/` - 19 tools
- `src/presentation/components/agent/` - 20+ UI components

### 2. File System Sync ✅
**Status:** Production-ready

```
Local FS (File System Access API)
    ↓ (LocalFSAdapter)
IndexedDB (Project Metadata)
    ↓ (SyncManager)
WebContainer FS (Sandbox)
```

**Files:**
- `src/lib/filesync/` - File sync services
- `src/lib/webcontainer/` - WebContainer lifecycle
- `src/lib/workspace/project-store.ts` - Project metadata

### 3. State Management ⚠️
**Status:** Duplication crisis (42% health)

**3 Locations (141 stores total):**
```
MODERN (Target)
└── src/infrastructure/persistence/stores/ (18 files)
    ✅ Zustand v5 + Dexie
    ✅ Slice pattern
    ✅ Partialize

LEGACY (Migrating)
└── src/lib/state/ (25+ stores)
    ⚠️ God stores (>600 lines)
    ⚠️ Circular dependencies

DEPRECATED (Empty)
└── src/stores/ (8 files)
    ❌ To be deleted
```

**Issue:** 17 duplicate stores, ~6,500 lines redundant code

**Remediation:** Epic AC-1 (42 hours, 8 stories)

### 4. Routing ✅
**Status:** Well-structured (TanStack Router)

**4 Workspace Types:**
1. **IDE** - Code execution
   - `/ide`, `/ide/$projectId`

2. **Knowledge** - RAG knowledge management
   - `/knowledge`, `/knowledge/$projectId`

3. **Notes** - Markdown notes
   - `/notes`, `/notes/$projectId`

4. **Study** - Flashcard learning
   - `/study`, `/study/$projectId`

**API Endpoints:**
- `/api/chat` - AI chat (streaming SSE)
- `/api/flashcards/generate`
- `/api/quizzes/generate`

---

## 🚨 Technical Debt Summary

### Critical Issues (P0)

| Issue | Severity | Count | Status |
|-------|----------|-------|--------|
| **TypeScript Errors** | P0 | 1,172 | Fixing (Phase 0) |
| **God Components** (>300 lines) | P0 | 17 files | Refactoring (Cycle 17) |
| **Store Duplication** | P0 | 17 stores | Epic AC-1 planned |
| **IndexedDB Quota Handling** | P0 | Missing | Phase 0 target |

### High Issues (P1)

| Issue | Severity | Details |
|-------|----------|---------|
| **Circular Dependencies** | P1 | 4 high-risk cycles |
| **Missing Error Boundaries** | P1 | Inconsistent coverage |
| **Test Coverage** | P1 | 32 test files only |

### Medium Issues (P2)

| Issue | Severity | Details |
|-------|----------|---------|
| **Inconsistent Exports** | P2 | 30 default exports |
| **Relative Imports** | P2 | 918 relative imports |
| **Domain Logic in lib/** | P2 | Should be in `src/domain/` |

---

## 🛠️ Tech Stack

### Core Framework
- **React 19** - UI framework (latest)
- **TanStack Router** - File-based routing
- **Zustand 5.0.9** - State management
- **Dexie** - IndexedDB wrapper
- **Vite** - Build tool

### AI & LLM
- **@tanstack/ai** - LLM abstraction
- **@tanstack/ai-gemini** - Gemini adapter
- **@google/genai** - Google AI SDK
- **@xenova/transformers** - Local embeddings (WASM)

### Editor & Terminal
- **@monaco-editor/react** - Monaco wrapper
- **@xterm/xterm** - Terminal emulator
- **@xterm/addon-fit** - Terminal resize

### File System & Sync
- **@webcontainer/api** - WebContainer sandbox
- **isomorphic-git** - Git in browser
- **idb** - IndexedDB promises

---

## 📈 Health Score Breakdown

```
Overall Health: ~50% (up from 5.9%)

├── Architecture:        70% ✅ (four-layer in progress)
├── AI/Agent System:     83% ✅ (production-ready)
├── State Management:    42% ⚠️ (duplication crisis)
├── Code Quality:        55% ⚠️ (god components, TS errors)
└── Documentation:       90% ✅ (comprehensive BMAD)
```

---

## 🎯 Immediate Actions (Phase 0)

**Week 1-2 (26-50 hours total):**

| Story | Effort | Target |
|-------|--------|--------|
| **TS-001**: Fix TypeScript Errors | 6-8h | 1,172 → <100 |
| **DB-001**: Safe IndexedDB Operations | 18-22h | Add quota handling |
| **UI-001**: Extract AgentConfigDialog Hooks | 16-20h | 1,089 → <300 lines |

**Priority:** P0 (Foundation stabilization)

---

## 📚 Key Documentation

### Governance Documents
- `_bmad-output/epics.md` - Epic definitions
- `_bmad-output/project-planning-artifacts/` - PRD, architecture, UX spec
- `bmm-workflow-status.yaml` - Workflow state
- `_bmad-output/sprint-artifacts/sprint-status.yaml` - Sprint tracking

### Analysis Reports
- `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md`
- `_bmad-output/zustand-migration-plan-2026-01-01.md`
- `_bmad-output/zustand-patterns-guide-2026-01-01.md`

### Developer Guides
- `AGENTS.md` - Project-specific dev patterns
- `CLAUDE.md` - Project instructions
- `.agent/rules/general-rules.md` - BMAD framework

---

## 🔍 Largest Files (>600 lines)

| File | Lines | Type |
|------|-------|------|
| `src/lib/state/dexie-db.ts` | 1,267 | Database schema |
| `src/infrastructure/persistence/dexie-db.ts` | 1,061 | Duplicate schema ⚠️ |
| `src/lib/state/__tests__/knowledge-store.test.ts` | 1,024 | Test |
| `src/lib/state/dexie-db-migrations.ts` | 760 | Migrations |
| `conversation-threads-store.ts` | 726 | God store ⚠️ |
| `knowledge-store.ts` | 718 | God store ⚠️ |
| `quiz-store.ts` | 629 | God store ⚠️ |
| `conversation-store.ts` | 626 | God store ⚠️ |

**Note:** 17 files exceed 300-line limit (worst is 4x over)

---

## ✅ Strengths

1. **Clear Architectural Vision** - Four-layer pattern defined and partially implemented
2. **Comprehensive Documentation** - BMAD framework with governance docs
3. **Strong AI/Agent System** - Production-ready (83% health)
4. **Modern React Patterns** - React 19, Zustand v5, TanStack Router
5. **Modular Agent Tools** - 19 well-structured tools

## ⚠️ Risks

1. **Store Duplication** - 6,500 lines redundant code across 3 locations
2. **TypeScript Errors** - 1,172 remaining (need <100 for stability)
3. **God Components** - 17 files >300 lines (maintainability risk)
4. **Circular Dependencies** - 4 high-risk cycles in state layer

## 🎯 Recommendations

1. **Execute Phase 0 Immediately** (26-50 hours)
   - Fix TS errors
   - Add IndexedDB quota handling
   - Extract AgentConfigDialog hooks

2. **Begin Store Consolidation** (Epic AC-1, 42 hours)
   - Migrate to `src/infrastructure/persistence/stores/`
   - Delete duplicates in `src/lib/state/` and `src/stores/`

3. **Complete Workspace Bindings** (Epic WB, 28 hours)
   - Workspace-specific tool permissions
   - Cross-workspace event propagation

---

**Quick Reference Generated:** 2026-01-02
**Analysis Tool:** Repomix (4,232 files → 81MB XML)
**Document ID:** `codebase-structure-summary-2026-01-02.md`

**For full details, see:** `codebase-architecture-analysis-2026-01-02.md`
