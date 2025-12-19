# Project Alpha - Project Overview

> **Generated:** 2025-12-20 | **Version:** 1.0.0

## Executive Summary

**Project Alpha** (formerly "via-gent") is a **100% client-side, browser-based AI-powered IDE**. It provides a VS Code-like development experience running entirely in the browser, with no server-side compute required.

### Core Value Proposition

- **Zero Server Infrastructure** - Runs entirely in client browser
- **Full Filesystem Access** - Syncs with local drive via File System Access API
- **Sandboxed Execution** - Node.js environment via WebContainers
- **AI-Powered Development** - Integrated AI agent using TanStack AI + Gemini
- **Git Integration** - Client-side git via isomorphic-git

---

## Project Status

| Aspect | Status |
|--------|--------|
| **Phase** | Spike → Brownfield Transition |
| **Epics Completed** | 1-5, 10 (partial), 11 (partial) |
| **Current Focus** | Epic 3 hotfixes, Terminal/WebContainer integration |
| **Known Issues** | Terminal cwd mismatch, auto-sync timing, file tree state |

### Validation Sequence

The project follows a **14-Step Validation Sequence** to prove architectural viability:

1. ✅ Open existing project folder
2. ✅ Grant FSA permissions
3. ✅ Files sync to WebContainer
4. ⚠️ Run `npm install` (terminal cwd issue)
5. ⚠️ Preview dev server
6. ✅ Edit file in Monaco
7. ✅ Changes sync to local FS
8. ⚠️ Hot reload in preview
9. ⏸️ AI chat interaction
10-14. Future steps...

---

## Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│  (React Components: FileTree, Monaco, XTerminal, Preview)    │
├─────────────────────────────────────────────────────────────┤
│                   Application Layer                          │
│  (WorkspaceContext, Routes, State Management)                │
├─────────────────────────────────────────────────────────────┤
│                   Domain Layer                               │
│  (SyncManager, ProcessManager, Project/IDE Stores)           │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                        │
│  (LocalFSAdapter, WebContainer API, IndexedDB, EventBus)     │
└─────────────────────────────────────────────────────────────┘
```

### Key Subsystems

| Subsystem | Location | Description |
|-----------|----------|-------------|
| **Filesystem** | `src/lib/filesystem/` | FSA adapter, sync manager, path utilities |
| **WebContainer** | `src/lib/webcontainer/` | Container lifecycle, terminal, process manager |
| **Workspace** | `src/lib/workspace/` | Context provider, persistence stores |
| **Events** | `src/lib/events/` | Typed event bus for cross-component communication |
| **Persistence** | `src/lib/persistence/` | IndexedDB schema and operations |

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-start` | 1.141.7 | Full-stack React framework |
| `@tanstack/react-router` | 1.141.6 | File-based routing |
| `@tanstack/react-store` | 0.8.0 | State management |
| `react` | 19.2.3 | UI library |
| `vite` | 7.3.0 | Build tool |

### Browser APIs

| Package | Version | Purpose |
|---------|---------|---------|
| `@webcontainer/api` | 1.6.1 | Browser-based Node.js runtime |
| `@monaco-editor/react` | 4.7.0 | Code editor |
| `@xterm/xterm` | 5.5.0 | Terminal emulator |
| `isomorphic-git` | 1.36.1 | Client-side git |
| `idb` | 8.0.3 | IndexedDB wrapper |

### AI Agent Integration (Future - Epic 6+)

**NOT just a chat interface** - this is a sophisticated **developer agent platform**:

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/ai` | 0.0.3 | AI framework |
| `@tanstack/ai-gemini` | 0.0.3 | Gemini adapter |
| `zod` | 4.2.1 | Schema validation |

**Planned Architecture** (per `roo-code-agent-patterns.md`):

| Component | Description |
|-----------|-------------|
| **BaseTool Pattern** | Abstract tool class separating parsing from execution |
| **ToolRegistry** | Centralized registry with mode-based tool filtering |
| **TaskContext** | Rich context object with project files, services, history |
| **Agent Types** | Orchestrator, Coder, Planner, Validator with permission matrix |
| **Tool Callbacks** | requestApproval, reportProgress, reportError, pushResult |
| **MCP Bridge** | Integration with external MCP servers |

**Agent-Accessible Tools (Planned):**

| Tool | Purpose |
|------|---------|
| `read_file` | Read file contents with line ranges |
| `write_file` | Write/create files in project |
| `list_files` | List directory contents |
| `execute_command` | Run terminal commands |
| `search_code` | Semantic code search |
| `apply_diff` | Apply code patches |
| `ask_question` | Request user input |
| `complete_task` | Mark task complete |

**Project Fugu Enhancements** (per `project-fugu-integration-guide.md`):

| API | Priority | Purpose |
|-----|----------|---------|
| FSA Permission Persistence | P0 | Auto-restore project access |
| File Watcher (Polling) | P0 | Detect external file changes |
| Async Clipboard | P1 | Copy code with syntax highlighting |
| Badging API | P2 | Show build errors on app badge |

---

## File Distribution

| Directory | Files | Lines (Est) | Purpose |
|-----------|-------|-------------|---------|
| `src/lib/filesystem/` | 20 | ~2,500 | FSA operations, sync |
| `src/lib/workspace/` | 11 | ~1,500 | State management |
| `src/lib/webcontainer/` | 5 | ~800 | Container lifecycle |
| `src/components/ide/` | 8+ | ~1,200 | IDE panels |
| `src/components/layout/` | 5+ | ~800 | Layout structure |
| `src/routes/` | 5+ | ~600 | Page routes |

**Total Source:** ~70+ TypeScript files, ~7,500+ lines

---

## Development Workflow

### Local Development

```bash
pnpm dev          # Start with COOP/COEP headers on port 3000
pnpm test         # Run Vitest unit tests
pnpm build        # Production build
```

### Testing Strategy

- **Unit Tests:** Co-located in `__tests__/` directories
- **Mocking:** FSA, IndexedDB mocked via `fake-indexeddb`
- **Coverage:** Variable (needs improvement per CHAM audit)

### Key Configuration

- `vite.config.ts` - COOP/COEP header plugin, TanStack Router plugin
- `tsconfig.json` - Strict TypeScript, path aliases
- `vitest.config.ts` - Test configuration

---

## Known Technical Debt

From CHAM audit findings:

| Issue | Impact | Epic |
|-------|--------|------|
| Files >300 LOC | Maintainability | Epic 11 |
| Low test coverage | Reliability | All |
| Missing event bus usage | Extensibility | Epic 10 |
| No AI integration wiring | Feature | Epic 6 |
| Terminal cwd mismatch | Functionality | Epic 13 (proposed) |

---

*Generated by BMAD Document Project Workflow v1.2.0*
