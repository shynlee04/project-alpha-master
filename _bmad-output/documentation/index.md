---
date: 2025-12-27
time: 2025-12-27T12:40:00.000Z
phase: Documentation
team: Team A
agent_mode: documentation-writer
document_id: DOC-INDEX-2025-12-27-001
version: 1.0.0
title: Via-gent Documentation Index
---

# Via-gent Documentation Index

Welcome to the comprehensive documentation index for **Via-gent**, a browser-based IDE with integrated AI agent capabilities.

## Project Overview

**Via-gent** is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. It provides:

- Monaco Editor for code editing with tabbed interface
- xterm.js-based terminal integrated with WebContainers
- Bidirectional file sync between local File System Access API and WebContainers
- **AI Agent System** with multi-provider support (OpenRouter, Anthropic, etc.) via TanStack AI
- Multi-language support (English, Vietnamese) with i18next
- Project persistence via IndexedDB
- React 19 + TypeScript + Vite + TanStack Router stack

### Current Status (2025-12-27)

The project has undergone a major consolidation (INC-2025-12-24-001 response):
- Reduced 26+ epics to 1 focused MVP epic (96% reduction)
- Reduced 124+ stories to 7 sequential stories (94% reduction)
- Current active story: MVP-1 through MVP-7 (sequential execution)
- Platform A (Antigravity) single workstream approach
- **Mandatory browser E2E verification** for all story completions

### Tech Stack

| Category | Technology |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Vite, TanStack Router |
| **UI Components** | Radix UI, Tailwind CSS 4, shadcn/ui |
| **Code Editor** | Monaco Editor (@monaco-editor/react) |
| **Terminal** | xterm.js (@xterm/xterm) |
| **Runtime** | WebContainer API (@webcontainer/api) |
| **AI/LLM** | TanStack AI, OpenRouter, Anthropic |
| **State Management** | Zustand, Dexie (IndexedDB) |
| **i18n** | i18next, react-i18next |
| **Testing** | Vitest, @testing-library/react |

## Quick Start Guide

### Prerequisites

- Node.js 18+ and pnpm
- Chrome or Edge browser (for File System Access API support)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd project-alpha-master

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Commands

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

# Type checking
pnpm tsc --noEmit
```

### Getting Started

1. Run `pnpm dev` - starts on port 3000 with required headers
2. Open browser to `http://localhost:3000`
3. Grant file system permissions when prompted
4. Configure AI provider via Agent Config Dialog
5. Start coding with AI assistance!

## Documentation Navigation

### Core Documentation (2025-12-27)

| Document | Description | Link |
|----------|-------------|-------|
| **Project Architecture Analysis** | Complete architecture analysis including component structure, state management, and system flows | [`project-architecture-analysis-2025-12-27.md`](project-architecture-analysis-2025-12-27.md) |
| **Internationalization Setup** | i18n configuration, usage patterns, and translation management | [`internationalization-setup-2025-12-27.md`](internationalization-setup-2025-12-27.md) |
| **Testing Infrastructure** | Testing framework setup, strategies, and best practices | [`testing-infrastructure-2025-12-27.md`](testing-infrastructure-2025-12-27.md) |
| **Development Workflow** | Development commands, conventions, and workflow patterns | [`development-workflow-2025-12-27.md`](development-workflow-2025-12-27.md) |

### Technical Documentation (2025-12-23)

Located in [`docs/2025-12-23/`](../docs/2025-12-23/):

| Document | Description |
|----------|-------------|
| **Architecture** | System architecture diagrams and component relationships |
| **Tech Context** | Technology stack decisions and rationale |
| **Data Contracts** | Type definitions and data flow specifications |
| **Flows** | User flows and system interaction patterns |

### BMAD Framework Artifacts

Located in [`_bmad-output/sprint-artifacts/`](../sprint-artifacts/):

| Artifact | Description |
|----------|-------------|
| **MVP Sprint Plan** | [`mvp-sprint-plan-2025-12-24.md`](../sprint-artifacts/mvp-sprint-plan-2025-12-24.md) - Consolidated MVP epic with 7 sequential stories |
| **Story Validation** | [`mvp-story-validation-2025-12-24.md`](../sprint-artifacts/mvp-story-validation-2025-12-24.md) - Story dependency and validation rules |
| **Sprint Status** | [`sprint-status-consolidated.yaml`](../sprint-artifacts/sprint-status-consolidated.yaml) - Current sprint tracking |
| **E2E Verification Checklist** | [`MVP-E2E-verification-checklist-2025-12-27.md`](../sprint-artifacts/MVP-E2E-verification-checklist-2025-12-27.md) - Browser E2E testing requirements |
| **Tech Spec MVP Completion** | [`tech-spec-mvp-completion-2025-12-27.md`](../sprint-artifacts/tech-spec-mvp-completion-2025-12-27.md) - MVP completion specification |
| **Risk Register** | [`mvp-risk-register-2025-12-24.md`](../sprint-artifacts/mvp-risk-register-2025-12-24.md) - Project risk analysis |

### State Management Documentation

| Document | Description |
|----------|-------------|
| **State Management Audit** | [`../state-management-audit-2025-12-24.md`](../state-management-audit-2025-12-24.md) - Complete Zustand and Dexie migration audit |
| **State Management Audit P1.10** | [`../state-management-audit-p1.10-2025-12-26.md`](../state-management-audit-p1.10-2025-12-26.md) - P0 issue findings and refactoring recommendations |

### Course Corrections

Located in [`_bmad-output/course-corrections/`](../course-corrections/):

| Document | Description |
|----------|-------------|
| **OpenRouter 401 Fix** | [`openrouter-401-fix-2025-12-25.md`](../course-corrections/openrouter-401-fix-2025-12-25.md) - Provider adapter authentication fix |
| **Agentic Execution Analysis** | [`read-file-and-agentic-execution-analysis-2025-12-25.md`](../course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md) - Loop limitation analysis |

### Development Guidelines

| Document | Location |
|----------|-----------|
| **AGENTS.md** | [`../../AGENTS.md`](../../AGENTS.md) - Project-specific development patterns and gotchas |
| **General Rules** | [`.agent/rules/general-rules.md`](../../.agent/rules/general-rules.md) - MCP research protocol and development rules |
| **Agent Rules** | [`.agent/rules/`](../../.agent/rules/) - AI agent-specific rules and prompts |

## Getting Started for New Developers

### 1. Understand the Architecture

Start with the **Project Architecture Analysis** document to understand:
- Component organization and structure
- State management architecture (Zustand stores)
- File system sync flow (Local FS → WebContainer)
- AI agent architecture (Provider adapters, tools, facades)

### 2. Learn the Development Workflow

Read the **Development Workflow** document to understand:
- Essential development commands
- Code style and conventions
- Testing structure and patterns
- Import order conventions

### 3. Understand State Management

Review the **State Management Audit** documents to learn:
- Zustand store architecture (6 stores total)
- Dexie IndexedDB patterns
- State persistence strategy
- P0 issues and refactoring recommendations

### 4. Learn Internationalization

Study the **Internationalization Setup** document for:
- i18next configuration
- Translation key extraction
- Multi-language support patterns
- Locale-aware routing

### 5. Understand Testing

Read the **Testing Infrastructure** document for:
- Vitest configuration
- Test file organization
- Mocking strategies (File System Access API, TanStack AI)
- Component testing patterns

### 6. Explore BMAD Framework

Familiarize yourself with the BMAD method:
- **MVP Sprint Plan** - Understand the consolidated epic structure
- **Story Validation** - Learn story dependency rules
- **AGENTS.md** - Review project-specific patterns

## BMAD Framework Integration

### BMAD V6 Framework

This project follows the BMAD (Business Model & Agile Development) V6 framework:

**Core Principles:**
- Strict workflow hierarchy (Architecture → Epic → Sprint → Story)
- Sequential story execution for MVP (no parallel workstreams)
- Mandatory browser E2E verification for all story completions
- Single source of truth documentation with iterative updates

**Workflow Status Files:**
- [`bmm-workflow-status-consolidated.yaml`](../bmm-workflow-status-consolidated.yaml) - Overall project workflow state
- [`sprint-status-consolidated.yaml`](../sprint-artifacts/sprint-status-consolidated.yaml) - Sprint-level tracking

### Agent Coordination

The project uses a multi-agent framework with specialized modes:

| Mode | Purpose |
|-------|----------|
| `@bmad-core-bmad-master` | Orchestrator/Coordinator |
| `@bmad-bmm-dev` | Feature implementation, coding |
| `@bmad-bmm-architect` | System design, technical specs |
| `@bmad-bmm-tech-writer` | Documentation, API refs, guides |
| `@bmad-bmm-ux-designer` | UI/UX design, wireframes |
| `@code-reviewer` | Code review, quality gates |

### Artifact Naming Conventions

All BMAD artifacts follow controlled naming:
- Format: `{name}-{YYYY-MM-DD}.md`
- Location: `_bmad-output/{category}/`
- Example: `mvp-sprint-plan-2025-12-24.md`

## Key Project Files

### Code Locations

| Component | Location |
|------------|-----------|
| **AI Agent System** | `src/lib/agent/` |
| **Chat UI Components** | `src/components/chat/` |
| **Chat API** | `src/routes/api/chat.ts` |
| **Agent Configuration** | `src/components/agent/AgentConfigDialog.tsx` |
| **File System Logic** | `src/lib/filesystem/` |
| **WebContainer Manager** | `src/lib/webcontainer/manager.ts` |
| **Zustand Stores** | `src/lib/state/`, `src/stores/` |
| **Translation Keys** | `src/i18n/{en,vi}.json` |

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration with COOP/COEP headers for WebContainers |
| `tsconfig.json` | TypeScript configuration with path aliases |
| `vitest.config.ts` | Test configuration |
| `i18next-scanner.config.cjs` | Translation key extraction configuration |

## Related Resources

### External Documentation

| Technology | Documentation |
|-------------|----------------|
| **React 19** | [react.dev](https://react.dev) |
| **TanStack Router** | [tanstack.com/router](https://tanstack.com/router) |
| **TanStack AI** | [tanstack.com/ai](https://tanstack.com/ai) |
| **WebContainer API** | [developer.stackblitz.com/platform/api/webcontainer-api](https://developer.stackblitz.com/platform/api/webcontainer-api) |
| **Monaco Editor** | [microsoft.github.io/monaco-editor](https://microsoft.github.io/monaco-editor) |
| **xterm.js** | [xtermjs.org](http://xtermjs.org) |
| **Zustand** | [zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs) |
| **Dexie** | [dexie.org](https://dexie.org) |
| **i18next** | [www.i18next.com](https://www.i18next.com) |
| **Vite** | [vitejs.dev](https://vitejs.dev) |
| **Vitest** | [vitest.dev](https://vitest.dev) |

### GitHub Repositories

| Library | Repository |
|---------|-----------|
| Radix UI | [github.com/radix-ui/primitives](https://github.com/radix-ui/primitives) |
| Monaco React | [github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react) |
| TanStack Router | [github.com/TanStack/router](https://github.com/TanStack/router) |
| TanStack AI | [github.com/TanStack/ai](https://github.com/TanStack/ai) |
| Zustand | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| Dexie | [github.com/dexie/Dexie.js](https://github.com/dexie/Dexie.js) |
| xterm.js | [github.com/xtermjs/xterm.js](https://github.com/xtermjs/xterm.js) |

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

### File System Operations

- Use `LocalFSAdapter` for all file operations
- File changes trigger sync via `SyncManager`
- Handle permission lifecycle with `permission-lifecycle.ts` utilities

## Critical Gotchas

### 1. WebContainer Cross-Origin Isolation

Missing COOP/COEP headers break WebContainers in dev mode. The `crossOriginIsolationPlugin` must be **FIRST** in Vite plugins array.

### 2. File System Sync Architecture

- **Local FS is source of truth**: WebContainer mirrors local files
- **No reverse sync**: Changes in WebContainer (e.g., `npm install`) do NOT sync back to local drive
- **Sync exclusions**: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db` are excluded

### 3. Terminal Working Directory

The shell spawns at WebContainer root by default. Pass `projectPath` to `XTerminal` component or `adapter.startShell(projectPath)` to set working directory.

### 4. File System Access API Permissions

Permissions are ephemeral (single session by default). Use `permission-lifecycle.ts` utilities to manage persistence.

### 5. Mandatory Browser E2E Verification

Every story requires manual browser E2E verification before being marked DONE. Screenshot or recording must be captured.

### 6. Agentic Loop Limitation

Currently enforced as `maxIterations(3)` as a temporary safety measure. Full implementation planned for Epic 29.

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

## MVP Story Sequence

The MVP epic consists of 7 sequential stories:

1. **MVP-1**: Agent Configuration & Persistence
2. **MVP-2**: Chat Interface with Streaming
3. **MVP-3**: Tool Execution - File Operations
4. **MVP-4**: Tool Execution - Terminal Commands
5. **MVP-5**: Approval Workflow
6. **MVP-6**: Real-time UI Updates
7. **MVP-7**: E2E Integration Testing

**Critical Requirements:**
- Stories must be completed sequentially (no parallel execution)
- **MANDATORY: Browser E2E verification** required before marking any story DONE
- Screenshot or recording must be captured for each E2E verification

See [`mvp-sprint-plan-2025-12-24.md`](../sprint-artifacts/mvp-sprint-plan-2025-12-24.md) for complete details.

## Tracking Section

### Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | DOC-INDEX-2025-12-27-001 |
| **Version** | 1.0.0 |
| **Date** | 2025-12-27 |
| **Time** | 2025-12-27T12:40:00.000Z |
| **Phase** | Documentation |
| **Team** | Team A (Antigravity) |
| **Agent Mode** | documentation-writer |

### Handoff History

| Date | Phase | Agent Mode | Action |
|------|--------|-------------|--------|
| 2025-12-27T12:40:00.000Z | Documentation | documentation-writer | Initial document creation |

### Related Documents

- [`project-architecture-analysis-2025-12-27.md`](project-architecture-analysis-2025-12-27.md)
- [`internationalization-setup-2025-12-27.md`](internationalization-setup-2025-12-27.md)
- [`testing-infrastructure-2025-12-27.md`](testing-infrastructure-2025-12-27.md)
- [`development-workflow-2025-12-27.md`](development-workflow-2025-12-27.md)
- [`../../AGENTS.md`](../../AGENTS.md)
- [`../sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](../sprint-artifacts/mvp-sprint-plan-2025-12-24.md)

---

**Last Updated:** 2025-12-27T12:40:00.000Z  
**Maintained By:** Team A (Antigravity) - documentation-writer mode
