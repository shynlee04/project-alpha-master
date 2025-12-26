# Project Alpha - Documentation Index

> **Generated:** 2025-12-20 | **Scan Level:** Exhaustive | **Mode:** Initial Scan

## Project Overview

| Property | Value |
|----------|-------|
| **Type** | Web Application (Monolith) |
| **Framework** | TanStack Start 1.141.7 |
| **Language** | TypeScript 5.9 |
| **UI** | React 19.2.3 |
| **Bundler** | Vite 7.3.0 |

### Purpose

**Project Alpha** is a 100% client-side, browser-based AI-powered IDE built with modern web technologies. It synchronizes with the user's local filesystem via the File System Access API and runs Node.js environments using WebContainers.

---

## Quick Reference

### Tech Stack Summary

| Category | Technology |
|----------|------------|
| Frontend Framework | TanStack Start + React 19 |
| Routing | TanStack Router (file-based) |
| State Management | TanStack Store + React Context |
| Styling | TailwindCSS 4.x + ShadcnUI |
| Editor | Monaco Editor 0.55.1 |
| Terminal | xterm.js 5.5.0 |
| Sandboxing | WebContainers API 1.6.1 |
| Git | isomorphic-git 1.36.1 |
| Persistence | IndexedDB (idb 8.0.3) |
| AI | TanStack AI + Gemini Adapter |
| Testing | Vitest 3.2.4 |

### Entry Points

- `src/routes/index.tsx` - Dashboard/Home
- `src/routes/workspace/$projectId.tsx` - IDE Workspace
- `vite.config.ts` - Build configuration
- `src/router.tsx` - Router setup

---

## Generated Documentation

### Architecture & Structure

- [Project Overview](./project-overview.md) ✅
- [Source Tree Analysis](./source-tree-analysis.md) ✅
- [Component Inventory](./component-inventory.md) ✅
- [State Management](./state-management.md) ✅
- [State Management Audit P1.10](./state-management-audit-p1.10-2025-12-26.md) ✅

### Development Guides

- [Development Guide](./development-guide.md) ✅

### Governance Documents (Migrated 2025-12-20)

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Architectural decisions and patterns ✅ |
| [PRD](./prd.md) | Product Requirements Document ✅ |
| [Epics](./epics.md) | Epic and story breakdown (includes Epic 13) ✅ |
| [UX Design](./ux-design.md) | UX design specification ✅ |
| [Workflow Status](./bmm-workflow-status.yaml) | BMAD workflow tracking ✅ |
| [Sprint Status](./sprint-artifacts/sprint-status-consolidated.yaml) | Consolidated sprint tracking ✅ |
| [Design System 8-bit](./design-system-8bit-2025-12-25.md) | 8-bit design system foundation ✅ |

### Sprint Artifacts & Retrospectives

| Document | Description |
|----------|-------------|
| [Epic 13 Retrospective](./sprint-artifacts/epic-13-retrospective.md) | Terminal & Sync Stability |
| [Epic 23 Retrospective](./sprint-artifacts/epic-23-retrospective.md) | UX/UI Modernization |
| [Production Readiness Epic 13](./sprint-artifacts/production-readiness-epic-13-report.md) | Production hardening report |

### Testing & Quality Assurance

The project includes comprehensive test coverage across all major components:

| Category | Test Files | Coverage |
|----------|------------|----------|
| **Components** | 14 test files | IDE layout, chat panels, file tree, sync status, agent config |
| **Agent System** | 12 test files | Factory, providers, tools, facades, hooks |
| **Events & State** | 3 test files | Event bus, workspace events, state stores |
| **Filesystem** | 7 test files | FS adapter, sync planner, path guard |
| **WebContainer** | 2 test files | Manager, terminal adapter |
| **Internationalization** | 3 test files | i18n config, dashboard, workspace |
| **Editor** | 1 test file | Language utilities |

**Test Running Instructions:**
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test src/components/ide/__tests__/AgentChatPanel.test.tsx

# Run tests in watch mode
pnpm test --watch
```

**Test Configuration:**
- React components: `jsdom` environment
- Library/unit tests: `node` environment
- Test files co-located in `__tests__/` directories adjacent to source
- Mock patterns: `vi.mock()` for external dependencies (TanStack AI, providers)

### To Be Generated

- [API & Services](./api-contracts.md) _(Future epic)_

---

## Legacy Documentation

> [!NOTE]
> Legacy documents remain in `docs/legacy-unfiltered/` for reference but are no longer the primary source of truth. See above for migrated governance documents.

### Agent Instructions

| Document | Description |
|----------|-------------|
| [Dependency Usage](../docs/legacy-unfiltered/agent-instructions/dependency-libraries-usage.md) | Library usage patterns |
| [Project Fugu](../docs/legacy-unfiltered/agent-instructions/project-fugu-integration-guide.md) | Fugu API integration |

### Sprint Artifacts (70+ files)

Located in `docs/legacy-unfiltered/sprint-artifacts/`:
- Story implementation context files
- Epic retrospectives
- Sprint change proposals
- Course correction documents

---

## Source Structure

```
project-alpha/
├── src/
│   ├── components/          # React components
│   │   ├── ide/             # IDE panels (FileTree, Monaco, Terminal, Preview)
│   │   ├── layout/          # Layout components (IDELayout, panels)
│   │   └── ui/              # Shared UI components
│   ├── lib/                 # Core libraries
│   │   ├── filesystem/      # FSA adapter, sync manager (20 files)
│   │   ├── webcontainer/    # WebContainer manager, terminal (5 files)
│   │   ├── workspace/       # Context, stores (11 files)
│   │   ├── events/          # Event bus infrastructure
│   │   └── persistence/     # IndexedDB layer
│   ├── routes/              # TanStack Router pages
│   └── hooks/               # Custom React hooks
├── docs/legacy-unfiltered/  # Governance docs (70+ files)
├── _bmad/                   # BMAD framework config
└── public/                  # Static assets
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server (with COOP/COEP headers)
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

**Important:** Dev server runs on port 3000 with cross-origin isolation headers required for WebContainers.

---

## Critical Warnings

1. **WebContainer Singleton** - Only one instance per page
2. **FSA Permissions** - Handle permission lifecycle carefully
3. **COOP/COEP Headers** - Required for SharedArrayBuffer
4. **Route Tree** - Never edit `routeTree.gen.ts` directly
5. **Sync Exclusions** - `.git` and `node_modules` excluded from sync

---

*Generated by BMAD Document Project Workflow v1.2.0*
