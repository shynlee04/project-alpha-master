# Project Documentation Index

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive
**Project:** Via-gent (Project Alpha v2.0)

---

## Project Overview

- **Name:** Via-gent (Project Alpha v2.0)
- **Type:** Web Application (IDE + Knowledge Synthesis)
- **Architecture:** 4-Layer Clean Architecture
- **Language:** TypeScript
- **Framework:** React 19 + TanStack Router/Start

---

## Quick Reference

| Category | Technology | description |
|----------|------------|---------|
| **Frontend** | React 19, TanStack Router | Routing, UI |
| **State** | Zustand v5, Dexie | Client state, IndexedDB |
| **UI Library** | Radix UI, Tailwind CSS | Components, styling |
| **Editor** | Monaco Editor | Code editing |
| **Terminal** | XTerm.js | Terminal emulation |
| **AI** | TanStack AI, Anthropic SDK | LLM integration |
| **WebContainer** | StackBlitz @webcontainer/api | Code execution |
| **Vector DB** | Orama WASM | Local RAG |
| **Testing** | Vitest, Playwright | Unit/E2E tests |

---

## Generated Documentation

### Core Documentation
- [Project Overview](./project-overview.md) - Executive summary and tech stack
- [Architecture](./architecture.md) - 4-layer architecture, design patterns
- [Source Tree Analysis](./source-tree-analysis.md) - Annotated directory structure
- [Development Guide](./development-guide.md) - Setup, build, test commands

### State Management
- [State Management Patterns](./state-management.md) - Zustand stores, Dexie persistence
- [Store Catalog](./store-catalog.md) - All stores by domain

### Data & API
- [Data Models](./data-models.md) - Entities, schemas, relationships
- [API Contracts](./api-contracts.md) - REST API endpoints

### UI Components
- [Component Inventory](./component-inventory.md) - 468 presentation components
- [God Components Report](./god-components-report.md) - Components >300 lines

### Quality Reports
- [Master Risk Register](../quality/reports/MASTER-RISK-REGISTER.md) - 47 identified risks
- [TypeScript Error Report](../quality/reports/typescript-errors.md) _(To be generated)_

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION (Components, UI)                          │
│  468 React components, 4 workspace pages                │
├─────────────────────────────────────────────────────────┤
│  APPLICATION (Services, Hooks)                          │
│  Business logic, orchestration                          │
├─────────────────────────────────────────────────────────┤
│  DOMAIN (Entities, Value Objects)                       │
│  Core business rules, no framework dependencies         │
├─────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE (Persistence, Events, Sync)             │
│  Zustand stores, Dexie IndexedDB, WebContainer          │
└─────────────────────────────────────────────────────────┘
```

---

## Workspaces

| Workspace | description | Status |
|-----------|---------|--------|
| **IDE** | Code editing, terminal, file tree | Production |
| **Knowledge** | RAG, document synthesis, canvas | Production |
| **Notes** | Note-taking with AI assistance | Production |
| **Study** | Flashcards, quizzes, learning | Production |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type check (production code only, ~3x faster)
pnpm typecheck

# Run tests
pnpm test

# Build for production
pnpm build
```

---

## Key Files

- `CLAUDE.md` - Project-specific development rules
- `AGENTS.md` - AI agent coordination patterns
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration

---

## Health Metrics

| Metric | Score | Status |
|--------|-------|--------|
| TypeScript Errors | 1363 | 🔴 Critical |
| God Stores (>300 lines) | 3 | 🔴 Fail |
| God Components (>300 lines) | 18+ | 🔴 Fail |
| Explicit `any` types | 234 | 🔴 Fail |
| Overall Health | 42% | 🔴 Critical |

---

## Next Steps

1. Review [Architecture](./architecture.md) for system design
2. Review [Master Risk Register](../quality/reports/MASTER-RISK-REGISTER.md) for technical debt
3. See [Development Guide](./development-guide.md) for local setup
