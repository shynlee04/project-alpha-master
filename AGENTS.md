# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Via-gent** is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. It provides:
- Monaco Editor for code editing with tabbed interface
- xterm.js-based terminal integrated with WebContainers
- Bidirectional file sync between local File System Access API and WebContainers
- **AI Agent System** with multi-provider support (OpenRouter, Anthropic, etc.) via TanStack AI
- Multi-language support (English, Vietnamese) with i18next
- Project persistence via IndexedDB
- React 19 + TypeScript + Vite + TanStack Router stack

**Current Status (2025-12-25)**: The project has undergone a major consolidation (INC-2025-12-24-001 response):
- Reduced 26+ epics to 1 focused MVP epic (96% reduction)
- Reduced 124+ stories to 7 sequential stories (94% reduction)
- Current active story: MVP-1 (Agent Configuration & Persistence) - IN_PROGRESS
- Platform A (Antigravity) single workstream approach
- **Mandatory browser E2E verification** for all story completions

**Consolidation Context**: Epics 12 (Tool Interface), 25 (AI Foundation), and 28 (UX Brand) have been consolidated into a single MVP epic to ensure a complete vertical slice of the AI coding agent functionality. See [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md) for details.

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

# Type checking
pnpm tsc --noEmit
```

## Key Directories & Files

```
src/
├── components/           # React components organized by feature
│   ├── agent/           # AI agent configuration and dialogs
│   ├── chat/            # Chat interface components (ApprovalOverlay, CodeBlock, ToolCallBadge)
│   ├── ide/             # IDE components: editor, terminal, file tree, preview, agent panels
│   ├── ui/              # Reusable UI components (Toast, Dialog, etc.)
│   └── layout/          # Layout components (IDELayout, IDEHeaderBar, etc.)
├── lib/
│   ├── agent/           # AI agent infrastructure (NEW)
│   │   ├── facades/    # Agent tool facades (FileTools, TerminalTools)
│   │   ├── providers/  # Provider adapters, model registry, credential vault
│   │   ├── tools/      # Individual agent tools (read, write, execute)
│   │   └── hooks/      # React hooks for agent operations
│   ├── filesystem/     # File system sync and FSA utilities
│   ├── webcontainer/   # WebContainer lifecycle and process management
│   ├── workspace/      # Workspace state and project persistence
│   ├── editor/         # Monaco editor integration
│   ├── events/         # Event system
│   ├── state/          # TanStack stores (IDE, statusbar)
│   └── persistence/    # Data persistence utilities
├── routes/              # TanStack Router file-based routes
│   └── api/            # API endpoints (NEW: /api/chat)
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization files (en.json, vi.json)
└── types/              # TypeScript type definitions

.agent/rules/            # AI agent rules and prompts (NEW: general-rules.md)
_bmad-output/           # BMAD method artifacts and sprint tracking
docs/2025-12-23/        # Comprehensive technical documentation (NEW)
```

## Architecture & Key Components

### Core Architecture
- **Local FS as Source of Truth**: All file operations go through `LocalFSAdapter` to browser's File System Access API
- **WebContainer Mirror**: `SyncManager` syncs files to WebContainer sandbox
- **State Management**: Zustand stores with React Context for workspace and IDE state (migration complete - see [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md))
- **Project Persistence**: IndexedDB via Dexie for project metadata and conversations

### File System Sync Flow
```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
      ↑                                    ↑
   IndexedDB (ProjectStore)         File Change Events
```

### AI Agent Architecture (NEW)
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

### API Routes
- **GET/POST `/api/chat`** (NEW): AI chat endpoint with SSE streaming
  - Supports multi-provider AI models
  - Returns ChatGPT-compatible or OpenAI format
  - Integrates with provider adapter system

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

### MVP Story Development Cycle
The project follows a sequential story approach for the MVP epic. Each story must be completed before starting the next:

1. **MVP-1**: Agent Configuration & Persistence (IN_PROGRESS)
2. **MVP-2**: Chat Interface with Streaming
3. **MVP-3**: Tool Execution - File Operations
4. **MVP-4**: Tool Execution - Terminal Commands
5. **MVP-5**: Approval Workflow
6. **MVP-6**: Real-time UI Updates
7. **MVP-7**: E2E Integration Testing

**Critical Requirements**:
- Stories must be completed sequentially (no parallel execution)
- **MANDATORY: Browser E2E verification** required before marking any story DONE
- Story dependencies must be respected (see [`_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md))
- Screenshot or recording must be captured for each E2E verification

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
1. **MCP Research Protocol** (`/update-claudemd/update-claudemd`): Before implementing unfamiliar patterns:
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
- Catch specific error types rather than generic `Error`

### 7. Import Order Convention
1. React imports
2. Third-party libraries
3. Internal modules with `@/` alias
4. Relative imports

### 8. AI Agent Tool Concurrency (NEW)
- Agent tools use a file locking mechanism via `FileLock` class
- Multiple concurrent file operations on the same path are serialized
- Always await tool results before proceeding
- Tools validate paths before execution

### 9. TanStack AI Streaming (NEW)
- Chat responses are Server-Sent Events (SSE) streams
- Use `Symbol.asyncIterator` to consume streams
- Handle `done` event types for completion
- Stream responses require proper error handling

### 10. MVP Consolidation Approach (NEW)
- **Single Epic**: All AI agent functionality consolidated into one MVP epic
- **Sequential Stories**: 7 stories must be completed in order (no parallel execution)
- **Platform A Only**: Single workstream approach (Platform B not utilized for MVP)
- **Vertical Slice**: Complete user journey from configuration to E2E validation
- **Traceability**: All MVP stories trace back to original Epics 12, 25, 28

### 11. Mandatory Browser E2E Verification (NEW)
- **MANDATORY**: Every story requires manual browser E2E verification before DONE
- **Screenshot Required**: Capture screenshot or recording of working feature
- **Full Workflow**: Test complete user journey, not just component existence
- **No Exceptions**: Stories cannot be marked DONE without browser verification
- **Definition of Done**: Updated to enforce E2E verification gate

### 12. Agentic Loop Limitation (Temporary MVP Measure)
- **maxIterations(3)**: Currently enforced as a temporary safety measure during MVP-3/MVP-4 validation
- **Limited Execution**: Agents will terminate after 3 tool execution iterations to prevent infinite loops
- **Full Implementation Deferred**: Complete agentic loop with state tracking, iteration UI, and intelligent termination is planned for Epic 29
- **Reference**: See course correction analysis in [`_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md`](_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md) and Epic 29 specification in [`_bmad-output/epics/epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md)

See [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md) for complete MVP story details.

## Existing Documentation & Guidance

### AGENTS.md
The repository already has comprehensive guidance in `AGENTS.md` covering:
- Development workflow and story development cycle
- Git commit message format with epic/story context
- Branch strategy (feature branches created after epic completion)
- Project-specific nuances and gotchas
- Code style and conventions
- Testing structure and patterns

### .agent/rules/general-rules.md (NEW)
Comprehensive development rules including:
- **Mandators MCP Research Protocol**: Step-by-step research before implementing unfamiliar patterns
- **Dependency documentation**: Full list of GitHub repos and official docs for all dependencies
- **Development tools guidance**: When to use Context7, Deepwiki, Tavily, Exa, Repomix MCP tools
- **Context preservation**: Document artifact IDs, variables, naming conventions, date stamps

### BMAD Method Integration
The project includes BMAD (Business Model & Agile Development) method rules in `.cursor/rules/bmad/`:

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

### State Management
- All client state uses Zustand stores (6 stores total)
- No legacy TanStack Store usage (migration complete)
- IndexedDB operations use Dexie exclusively (no legacy idb)
- Project metadata persisted in IndexedDB via Dexie
- Agent configurations persisted in localStorage

**State Architecture**:
- `useIDEStore` - Main IDE state (open files, active file, panels) - persisted to IndexedDB
- `useStatusBarStore` - StatusBar state (WC status, sync status, cursor) - ephemeral
- `useFileSyncStatusStore` - File sync progress and status - ephemeral
- `useAgentsStore` - Agent configuration and state - persisted to localStorage
- `useAgentSelectionStore` - Selected agent state - persisted to localStorage

See [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md) for complete state architecture details.

### State Management Best Practices (P1.10 - 2025-12-26)
**Status**: Audit completed - 1 P0 issue documented, refactoring recommended for future iteration

**Audit Findings**:
- **Zero Legacy State**: No TanStack Store usage found (migration complete)
- **Zero Duplicate Stores**: All 6 Zustand stores are unique and serve distinct purposes
- **1 P0 Issue Identified**: [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) duplicates IDE state with local `useState` instead of using [`useIDEStore`](src/lib/state/ide-store.ts)

**Recommended Refactoring** (deferred to avoid MVP-3 interference):
1. Replace duplicated state in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) with Zustand hooks:
   - `isChatVisible` → `useIDEStore(s => s.chatVisible)` + `setChatVisible()`
   - `terminalTab` → `useIDEStore(s => s.terminalTab)` + `setTerminalTab()`
   - `openFiles` → Use `useIDEStore` with local file content cache
   - `activeFilePath` → `useIDEStore(s => s.activeFile)` + `setActiveFile()`

2. Add local `fileContentCache` Map for ephemeral file content (not persisted)

3. Update [`useIDEFileHandlers`](src/components/layout/hooks/useIDEFileHandlers.ts) to work with Zustand actions

4. Remove duplicate state synchronization code (lines 142-148 in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx))

**State Architecture Summary**:
- **Persisted State** (IndexedDB): [`useIDEStore`](src/lib/state/ide-store.ts) - open files, active file, panels, terminal tab, chat visibility
- **Ephemeral State** (in-memory): [`useStatusBarStore`](src/lib/state/statusbar-store.ts), [`useFileSyncStatusStore`](src/lib/state/file-sync-status-store.ts)
- **Agent State** (localStorage): [`useAgentsStore`](src/stores/agents.ts), [`useAgentSelectionStore`](src/stores/agent-selection.ts)
- **UI State** (React Context): Workspace context, theme context

**Key Principle**: Single source of truth - each state property has ONE owner (either Zustand, Context, or localStorage)

**Reference**: See [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md) for detailed audit findings and refactoring plan.

## Testing Notes

- Mock `window.showDirectoryPicker` in tests
- Use `fake-indexeddb` for IndexedDB testing
- React component tests use `@testing-library/react` with `jsdom`
- File system tests mock File System Access API

### Agent Testing (NEW)
- Mock TanStack AI with `vi.mock('@tanstack/ai')`
- Mock provider adapters for unit tests
- Facade tests should mock WebContainer operations
- Use `FileLock` wrapper for concurrency tests

## Performance Considerations

- WebContainer boot is expensive (≈3-5 seconds)
- File sync uses debounced batch operations
- Large `node_modules` directories are excluded from sync (regenerated in WebContainer)
- Monaco Editor loads languages/features on-demand

### AI Agent Performance (NEW)
- Tool execution uses non-blocking async patterns
- Streaming responses reduce perceived latency
- File operations are debounced and batched
- Credential vault uses fast IndexedDB lookups

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

### Agent Tool Not Executing (NEW)
1. Verify tool is registered in `tools/index.ts`
2. Check facade is properly initialized with WebContainer instance
3. Verify file lock is not held by another operation
4. Check browser console for tool execution errors
5. Verify API credentials are set via `AgentConfigDialog`

### Chat API Returning 401 (NEW)
1. Check if provider has credentials in `credentialVault`
2. Open `AgentConfigDialog` and configure API keys
3. Verify provider is supported in `model-registry`
4. Check `/api/chat` logs for authentication errors

## Recent Updates (Updated: 2025-12-25)

### MVP Consolidation (INC-2025-12-24-001 Response)
- **Major Consolidation**: Reduced 26+ epics to 1 focused MVP epic (96% reduction)
- **Story Reduction**: Reduced 124+ stories to 7 sequential stories (94% reduction)
- **Single Workstream**: Platform A (Antigravity) only - no parallel execution
- **Vertical Slice**: Complete AI coding agent workflow from configuration to E2E validation
- **Traceability Preserved**: All MVP stories trace to original Epics 12, 25, 28
- **Mandatory E2E Verification**: Browser testing required for all story completions

### Course Corrections (2025-12-25)
- **OpenRouter 401 Fix**: Fixed provider adapter signature for `createOpenaiChat` (see [`_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md`](_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md))
- **Chat API Integration**: Resolved authentication and streaming issues
- **Provider Configuration**: Updated provider adapter factory for correct API calls

### State Management Migration (Complete)
- **Zustand Migration**: All client state migrated to Zustand (6 stores)
- **Dexie Migration**: All IndexedDB operations use Dexie (no legacy idb)
- **TanStack Store Removed**: Zero legacy TanStack Store usage
- **Audit Complete**: See [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md)

### Major AI Agent Infrastructure (Epic 25 - Consolidated into MVP)
- **Provider Adapter System**: Multi-provider support for OpenRouter, Anthropic, etc.
- **Credential Vault**: Secure storage of API keys in IndexedDB
- **Model Registry**: Centralized configuration of available AI models
- **Agent Tools**: `read`, `write`, `list`, `execute` for file and terminal operations
- **Agent Facades**: Abstract WebContainer operations for safe agent interactions
- **FileLock**: Concurrency control for file operations
- **TanStack AI Integration**: Streaming chat with tool support
- **Chat API**: New `/api/chat` endpoint with SSE streaming

### UI Enhancements (Epic 28 - Partially absorbed in MVP)
- **Chat System Components**: `StreamingMessage`, `ApprovalOverlay`, `CodeBlock`, `ToolCallBadge`, `DiffPreview`
- **Agent Management**: `AgentConfigDialog`, `AgentsPanel`, `AgentChatPanel`
- **Status Bar**: Segmented status indicators for sync, WebContainer, cursor, file type
- **8-bit Design System**: Dark-themed aesthetic with pixel-perfect styling

### Documentation (2025-12-25)
- **MVP Sprint Plan**: [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- **Story Validation**: [`_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md)
- **Sprint Status**: [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)
- **State Audit**: [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md)
- **Comprehensive Tech Docs**: `docs/2025-12-23/` with architecture, tech context, data contracts, flows
- **Development Guidelines**: `.agent/rules/general-rules.md` with MCP research protocol

### Dependency Changes
- Added `@tanstack/ai`, `@tanstack/ai-gemini`, `@tanstack/ai-react` for AI/chat functionality
- Updated various UI libraries
- New utilities for agent and chat features

### Key Files for AI Agent Development
- `src/lib/agent/providers/provider-adapter.ts`: Provider abstraction layer
- `src/lib/agent/providers/credential-vault.ts`: Secure credential storage
- `src/lib/agent/providers/model-registry.ts`: Model configuration
- `src/lib/agent/tools/`: Individual agent tools
- `src/lib/agent/facades/`: Agent tool facades
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts`: Chat with tool integration
- `src/routes/api/chat.ts`: Chat API endpoint

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
- **Translation Keys**: `src/i18n/{en,vi}.json`

### BMAD Artifacts
- **BMAD Workflows**: `.cursor/commands/bmad/`
- **Sprint Status**: `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`
- **MVP Sprint Plan**: `_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`
- **Story Validation**: `_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`
- **Workflow Status**: `_bmad-output/bmm-workflow-status-consolidated.yaml`

### Documentation
- **Tech Documentation**: `docs/2025-12-23/`
- **State Audit**: `_bmad-output/state-management-audit-2025-12-24.md`
- **Course Corrections**: `_bmad-output/course-corrections/`
- **Development Guidelines**: `.agent/rules/general-rules.md`