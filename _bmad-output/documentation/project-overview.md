# Project Overview: Via-gent (Project Alpha v2.0)

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Executive Summary

Via-gent is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. The project is evolving toward a **Knowledge Synthesis Station** — a local-first platform merging Google NotebookLM-style AI synthesis with Notion-like knowledge organization.

### Vision Statement

A local-first, AI-powered development environment where users can:
- Write and execute code in a browser-based IDE
- Chat with AI agents that have tool access (file read/write, terminal)
- Build knowledge bases from documents (PDF, URL) with local RAG
- Create study artifacts (flashcards, quizzes) from knowledge sources
- Organize notes with AI-powered transformations

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | UI Framework |
| TanStack Router | 1.144.0 | File-based routing |
| TanStack Start | 1.145.5 | SSR framework |
| Vite | Latest | Build tool |
| TypeScript | Latest | Language |

### State & Persistence
| Technology | Purpose |
|------------|---------|
| Zustand | v5 client state management |
| Dexie | IndexedDB wrapper |
| TanStack Store | Lightweight state |
| Event Emitter 3 | Event bus |

### UI Components
| Technology | Purpose |
|------------|---------|
| Radix UI | Headless component primitives |
| Tailwind CSS v4 | Utility-first styling |
| Lucide React | Icons |
| Framer Motion | Animations |
| Sonner | Toast notifications |
| cmdk | Command palette |

### Editor & Terminal
| Technology | Purpose |
|------------|---------|
| Monaco Editor | Code editor (VS Code core) |
| XTerm.js | Terminal emulation |
| @xterm/addon-fit | Terminal resize |

### AI Integration
| Technology | Purpose |
|------------|---------|
| TanStack AI | LLM abstraction layer |
| Anthropic SDK | Claude API |
| Google GenAI | Gemini API |
| @xenova/transformers | Client-side embeddings |

### Web Container
| Technology | Purpose |
|------------|---------|
| @webcontainer/api | StackBlitz WebContainer |
| isomorphic-git | Git operations in browser |

### Vector & Search
| Technology | Purpose |
|------------|---------|
| Orama | WASM vector database |
| Orama Plugin Data Persistence | Vector persistence |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit testing |
| Playwright | E2E testing |
| @testing-library/react | Component testing |

### Internationalization
| Technology | Purpose |
|------------|---------|
| i18next | i18n framework |
| react-i18next | React bindings |
| i18next-browser-languagedetector | Language detection |

### Observability
| Technology | Purpose |
|------------|---------|
| Sentry React | Error tracking |

---

## Architecture Classification

**Pattern:** 4-Layer Clean Architecture

```
┌─────────────────────────────────────────────┐
│  PRESENTATION LAYER                         │
│  - React components (468 files)             │
│  - Route handlers (TanStack Router)          │
│  - UI state (React Context)                  │
├─────────────────────────────────────────────┤
│  APPLICATION LAYER                           │
│  - Services (orchestration)                 │
│  - Custom hooks                              │
│  - Use cases                                 │
├─────────────────────────────────────────────┤
│  DOMAIN LAYER                                │
│  - Entities (Agent, Workspace, etc.)         │
│  - Value objects                             │
│  - Domain services                           │
├─────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                        │
│  - Zustand stores (state management)         │
│  - Dexie (IndexedDB persistence)             │
│  - WebContainer (code execution)             │
│  - Event bus (cross-workspace comms)         │
└─────────────────────────────────────────────┘
```

---

## Repository Structure

**Type:** Monolith with modular organization

**Key Directories:**
- `src/presentation/` - UI components (468 files)
- `src/application/` - Application services
- `src/domain/` - Business logic (entities, value objects)
- `src/infrastructure/` - Persistence, events, sync
- `src/lib/` - Legacy utilities (being consolidated)
- `src/routes/` - TanStack Router file-based routes

---

## Four Workspaces

### 1. IDE Workspace
- Monaco editor with syntax highlighting
- Integrated terminal (XTerm.js)
- File tree explorer
- Agent chat panel with tool execution

### 2. Knowledge Workspace
- RAG document ingestion (PDF, URL)
- Orama vector search
- Knowledge canvas with block linking
- AI-powered synthesis

### 3. Notes Workspace
- BlockNote editor
- AI transform commands
- Project/file associations
- Note organization

### 4. Study Workspace
- Flashcard generation
- Quiz creation
- Spaced repetition
- Progress tracking

---

## Deployment Targets

| Target | Status | Notes |
|--------|--------|-------|
| Node | ✅ Production | Default `pnpm build` |
| Cloudflare Workers | ✅ Production | `pnpm build:cloudflare` |
| Vercel | ✅ Production | `pnpm build:vercel` |
| Netlify | ✅ Production | `pnpm build:netlify` |

---

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm dev:cloudflare          # Cloudflare Workers target

# Building
pnpm build                  # Node.js build
pnpm build:cloudflare        # Cloudflare build
pnpm build:vercel           # Vercel build
pnpm build:netlify           # Netlify build

# Type Checking (Production code only - 3x faster)
pnpm typecheck              # Check production TypeScript
pnpm typecheck:all          # Check all TypeScript (includes tests)

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e               # Run E2E tests
pnpm test:e2e:ui            # E2E with UI
pnpm test:e2e:debug         # E2E with debugger

# Linting
pnpm lint                   # ESLint check
pnpm lint:fix               # ESLint auto-fix

# Governance
pnpm governance             # Check size limits + import paths
pnpm governance:size        # Check file size limits only
pnpm governance:imports     # Check import paths only

# Internationalization
pnpm i18n:extract           # Extract translation keys
```

---

## Critical Health Issues

| Issue | Count | Priority |
|-------|-------|----------|
| TypeScript errors (production) | 1363 | P0 |
| God stores (>300 lines) | 3 | P0 |
| God components (>300 lines) | 18+ | P1 |
| Explicit `any` types | 234 | P1 |
| TS suppressions | 162 | P1 |
| Layer violations | 20+ | P1 |

**Overall Health Score:** 42/100 🔴

---

## Related Documentation

- [Architecture Details](./architecture.md)
- [Source Tree](./source-tree-analysis.md)
- [State Management](./state-management.md)
- [API Contracts](./api-contracts.md)
- [Component Inventory](./component-inventory.md)
- [Master Risk Register](../quality/reports/MASTER-RISK-REGISTER.md)
