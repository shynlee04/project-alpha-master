
## Project Overview

**Via-gent** (Project Alpha v2.0) is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. The project is evolving toward a **Knowledge Synthesis Station** — a local-first platform that merges Google NotebookLM-style AI synthesis with Notion-like knowledge organization.

### ✅ Phase 2 Complete: Knowledge Synthesis Foundation

The core agent system and Knowledge Synthesis foundation (Epics 6-9) are **CERTIFIED PRODUCTION READY** (Health Score: 99/100).

The current development focus is on **Advanced Features & Polish** (Phase 3):

- **Epic 29: About Me Redesign** - Strategic recruitment asset (In Progress)
- **Epic 26: The Brain** - Intelligent Knowledge Base (In Progress)
- **Epic 24: Performance** - Optimization & UX (In Progress)

### 🎯 Future Vision: Knowledge Synthesis Station

A local-first platform targeting Vietnamese education market with:
- Source ingestion (PDF, URL via client-side parsing)
- Vector store (Orama WASM) for RAG
- Knowledge canvas with blocks + connections
- Study artifact generation (flashcards, quizzes)

See: `_bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md`

---

## Phase 4: Knowledge Synthesis Station Research (COMPLETED)

**Research Completion Date:** 2025-12-31
**Research Artifacts:** 7 documents created
**Overall Confidence Score:** 87%

### Research Summary

The Knowledge Synthesis Station research phase has been completed by @bmad-bmm-architect with comprehensive technical specifications for implementing a local-first RAG-powered knowledge management platform.

### Key Research Deliverables

| # | Artifact | Confidence |
|---|----------|------------|
| 1 | Agent Interaction Protocols | 90% |
| 2 | System Architecture Specification | 85% |
| 3 | RAG Pipeline Optimization Report | 90% |
| 4 | Pedagogical Framework Design | 85% |
| 5 | Multimodal Processing Specification | 82% |
| 6 | Integration Guide | 88% |
| 7 | Implementation Playbook | 87% |

### Technology Stack Validated

| Component | Technology | Purpose |
|-----------|------------|---------|
| Vector Store | Orama WASM | Local-first vector search |
| LLM Orchestration | TanStack AI + Gemini 2.0/2.5 | Query orchestration |
| Embeddings | Transformers.js (CLIP) | Text/image embeddings |
| Audio Processing | Whisper WASM | Speech-to-text |
| Document Processing | PDF.js | Client-side PDF parsing |

### Implementation Roadmap

| Phase | Focus | Duration | EPIC Range |
|-------|-------|----------|------------|
| Phase 1 | RAG Infrastructure | Weeks 1-5 | EPIC-32 |
| Phase 2 | Agent Integration | Weeks 6-10 | EPIC-33 |
| Phase 3 | Multimodal Processing | Weeks 11-15 | EPIC-34, EPIC-35 |
| Phase 4 | Adaptive Learning | Weeks 16-20 | EPIC-36, EPIC-37 |

### New EPIC Definitions (EPIC-32 through EPIC-37)

| Epic | Name | Stories | Status |
|------|------|---------|--------|
| EPIC-32 | RAG Infrastructure | 32-1 through 32-5 | READY (Sprint Planning) |
| EPIC-33 | Agent Integration | 33-1 through 33-4 | READY |
| EPIC-34 | Image Understanding | 34-1 through 34-3 | READY |
| EPIC-35 | Document Processing | 35-1 through 35-4 | READY |
| EPIC-36 | Adaptive Learning Engine | 36-1 through 36-4 | READY |
| EPIC-37 | Study Artifact Generation | 37-1 through 37-4 | READY |

### Research Artifacts Location

All research artifacts are stored in: `_bmad-output/research-artifacts/`

See: `_bmad-output/research-artifacts/implementation-playbook-2025-12-31.md` for complete implementation guidance.

---

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
| **Epic 24-1, 24-2** (Incremental Sync) | **Epic 24-3, 24-4, 24-5** (Conversation Restore) |

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

# Type checking
pnpm tsc --noEmit
```

---

## State Management Architecture (Updated 2026-01-01)

### December 2025 Zustand Patterns

The project follows **December 2025 Zustand best practices** for state management:

**Core Patterns**:
1. **Slice Pattern**: Split stores into focused slices (<120 lines each)
2. **Persist on Combined Store**: Apply persist middleware ONLY to combined store, not individual slices
3. **partialize**: Selective persistence (API keys yes, UI state no)
4. **version + migrate**: Schema evolution support with migration functions
5. **Workspace-Aware State**: Multi-workspace architecture native support
6. **Typed Hooks**: Best-in-class DX with typed hooks (useProviderCredentials, useProviderSelection)

**Example**:
```typescript
// ✅ RIGHT - Persist on combined store only
export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (...a) => ({
      ...createCoreSlice(...a),
      ...createCredentialsSlice(...a),
      ...createWorkspaceSlice(...a),
    }),
    {
      name: 'provider-config',
      partialize: (state) => ({
        credentials: state.credentials, // ✅ Persist
        // uiState: state.uiState, // ❌ Don't persist (transient)
      }),
    }
  )
);

// ❌ WRONG - Applying persist to individual slices
// const coreSlice = create(persist(coreSliceFn, { name: 'provider-core' }));
// This causes multiple hydration cycles + conflicts!
```

### Provider Configuration Architecture

**Single Source of Truth** (Consolidated 2026-01-01):

The provider configuration system has been **consolidated from 3 duplicate stores (765 lines) into 1 unified store (850 lines)**:

**Before**:
```typescript
// ❌ 3 duplicate stores causing API key confusion
src/lib/agent/providers/index.ts (333 lines)
src/stores/provider-store.ts (216 lines)
src/infrastructure/persistence/stores/provider-config-store.ts (216 lines)
```

**After**:
```typescript
// ✅ Single consolidated store with workspace awareness
src/infrastructure/persistence/stores/providers/
├── provider-store-core.ts (97 lines) - Core state + UI state
├── provider-store-credentials.ts (178 lines) - Encrypted API key vault
├── provider-store-workspace.ts (169 lines) - Workspace-scoped selection
├── provider-store-events.ts (206 lines) - Event emission + React hooks
├── index.ts (305 lines) - Combined store with Dexie persist
├── migrate.ts (308 lines) - Migration script (3 old stores → 1 new)
└── use-provider-migration.ts (200 lines) - React hook for one-time migration
```

**Usage**:
```typescript
// Use typed hooks for best DX
import { useProviderCredentials, useProviderSelection } from '@/infrastructure/persistence/stores/providers';

const { getCredential, setCredential } = useProviderCredentials();
const { activeProvider, setActiveProvider } = useProviderSelection();
const { isProviderAvailableInWorkspace } = useProviderWorkspaces();

// Save API key (encrypted automatically)
await setCredential('openrouter', { providerId: 'openrouter', apiKey: 'sk-or-v1-...' });

// Set active provider for current workspace
setActiveProvider('openrouter'); // Uses current workspace automatically

// Check availability
const available = isProviderAvailableInWorkspace('anthropic', 'knowledge');
```

**Migration**:
- Automatic on app mount (useProviderMigration hook)
- Creates backup before migration
- Merges data from 3 old stores (last write wins)
- Clears old localStorage entries
- Sets migration-complete flag

### Agent Configuration Architecture

**Workspace Bindings** (Added 2026-01-01):

Agents now have **workspace-specific availability** and **tool permissions**:

```typescript
// Core entity: src/core/entities/Agent.ts
interface Agent {
  id: string;
  name: string;
  workspaceBindings: WorkspaceBinding[]; // ✅ Per-workspace availability
  tools: AgentToolBinding[]; // ✅ Workspace-scoped tool permissions
}

interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}

interface AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    notes: boolean;
  };
}
```

**Usage**:
```typescript
import { useAgentsStore } from '@/stores/agents-store';

const { getAgentsForWorkspace, updateWorkspaceBinding } = useAgentsStore();

// Get agents available in IDE workspace
const ideAgents = getAgentsForWorkspace('ide');

// Update agent availability
updateWorkspaceBinding('agent-1', 'knowledge', true); // Enable in Knowledge
```

### Tool Permissions System

**Workspace-Aware Permission Checking** (Fully Implemented):

The tool permissions system ensures agents only execute tools in allowed workspaces:

```typescript
// Permission manager: src/lib/agent/workspace-permission-manager.ts
class WorkspacePermissionManager {
  // 3-step permission check
  checkWorkspacePermission(toolId, tools, workspaceBindings, workspaceType) {
    // Step 1: Check agent available in workspace
    // Step 2: Check tool enabled for workspace
    // Step 3: Check trust level (auto/prompt/block)
  }
}

// Usage in agent execution
const permission = permissionManager.checkWorkspacePermission(
  'file-read',
  agent.tools,
  agent.workspaceBindings,
  'knowledge'
);

if (!permission.canExecute) {
  return createBlockedToolResult('file-read');
}
```

**Trust Levels**:
- `auto`: Execute without asking (safe operations like reading)
- `prompt`: Ask user for approval (risky operations like writing)
- `block`: Never execute (dangerous operations like deleting)

### Cross-Workspace Event System

**Event Bus** (Enhanced 2026-01-01):

All stores emit events via **CrossWorkspaceEventBus** for system-wide sync:

```typescript
// Event bus: src/lib/events/cross-workspace-event-bus.ts
crossWorkspaceEventBus.emitWorkspaceChanged({ from: 'ide', to: 'knowledge' });
crossWorkspaceEventBus.emitProviderConfigChange({ workspaceId: 'ide', providerId: 'openrouter' });
crossWorkspaceEventBus.emitAgentConfigChange({ workspaceId: 'knowledge', agentId: 'agent-1' });
```

**React Hooks for Event Subscriptions**:
```typescript
// Auto-subscribe to workspace changes
import { useWorkspaceChangedEvents, useProviderEvents } from '@/lib/events/use-cross-workspace-events';

function MyComponent() {
  useProviderEvents(); // Auto-start + cleanup
  // ...
}
```

### Four-Layer Architecture

**Compliance** (Achieved 2026-01-01):

The codebase now follows **strict four-layer architecture**:

```
PRESENTATION (UI Components)
  AgentConfigDialog.tsx, ProviderConfigDialog.tsx
        ↓ uses hooks
APPLICATION (React Hooks + Services)
  useProviderCredentials(), AgentService.ts
        ↓ calls store
DOMAIN (Business Logic)
  ProviderCredential entity, Agent entity, ProviderVault service
        ↓ persists to
INFRASTRUCTURE (Persistence + Events)
  provider-store-*.ts slices, Dexie storage, CrossWorkspaceEventBus
```

**Component Size Limits**:
- Max 120 lines per component (enforced)
- Max 3 functions per module
- Max 5 dependencies per component
- Max 3 nesting levels

---

## Key Directories & Files

```
src/
├── components/           # React components organized by feature
│   ├── agent/           # AI agent configuration and dialogs
│   ├── chat/            # Chat interface components (ChatConversation, ThreadCard, etc.)
│   ├── common/          # Common utilities (ErrorBoundary)
│   ├── ide/             # IDE components: editor, terminal, file tree, preview, agent panels
│   │   └── statusbar/   # Status bar segments (AgentStatusSegment)
│   ├── ui/              # Reusable UI components (Button, Dialog, Input, etc.)
│   │   └── icons/       # Icon components (AIIcon, TerminalIcon, etc.)
│   └── layout/          # Layout components (IDELayout, IDEHeaderBar, etc.)
├── lib/
│   ├── agent/           # AI agent infrastructure
│   │   ├── facades/    # Agent tool facades (FileTools, TerminalTools)
│   │   ├── providers/  # Provider adapters, model registry, credential vault
│   │   ├── tools/      # Individual agent tools (read, write, execute)
│   │   └── hooks/      # React hooks for agent operations
│   ├── filesystem/     # File system sync and FSA utilities
│   ├── webcontainer/   # WebContainer lifecycle and process management
│   ├── workspace/      # Workspace state and project persistence
│   ├── editor/         # Monaco editor integration
│   ├── events/         # Event system
│   ├── state/          # Zustand stores (IDE, statusbar, navigation, file-sync-status)
│   └── utils/          # Utilities including error-handling.ts
├── routes/              # TanStack Router file-based routes
│   └── api/            # API endpoints (/api/chat)
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization files (en.json, vi.json)
├── stores/             # Agent-specific stores (agents.ts, agent-selection.ts)
└── styles/             # Global styles including design-tokens.css, animations.css

.agent/rules/            # AI agent rules and prompts
_bmad-output/           # BMAD method artifacts and sprint tracking
docs/2025-12-23/        # Comprehensive technical documentation
```

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

### State Architecture (P1.10 Audit Complete)
- **Persisted State** (IndexedDB): `useIDEStore` - open files, active file, panels, terminal tab, chat visibility
- **Ephemeral State** (in-memory): `useStatusBarStore`, `useFileSyncStatusStore`, `useNavigationStore`
- **Agent State** (localStorage): `useAgentsStore`, `useAgentSelectionStore`
- **UI State** (React Context): Workspace context, theme context
- **Prompt Enhancement**: `usePromptEnhancementStore`, `conversationThreadsStore`

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

### 5b. Dexie Schema v9 (Epic 24) - NEW
- **fileMetadata table**: Caches file paths, lastModified, size for incremental sync
- **toolExecutionLogs table**: Persists tool approvals and execution history
- **fsaHandles table**: Stores FileSystemDirectoryHandle for instant permission restore
- Schema upgrade path: v8 → v9 with additive migrations only
- See `src/lib/state/dexie-db.ts` for table definitions

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

### Recent Updates (Updated: 2025-12-31)

#### Knowledge Synthesis Station Research Complete (NEW)
- **Research Phase:** 7 artifacts created with 87% confidence score
- **Implementation Roadmap:** 20-week timeline across 4 phases
- **New EPICs:** EPIC-32 through EPIC-37 defined and ready for sprint planning
- **Technology Stack:** Orama WASM, Transformers.js, Whisper WASM, PDF.js validated
- **Next Step:** Sprint Planning for EPIC-32 (RAG Infrastructure) by @bmad-bmm-pm

#### Epic 24: Performance & UX Optimization (NEW via correct-course)
- **Incremental Sync**: Stories 24-1, 24-2 for metadata cache + FSA handle persistence
- **Conversation Restore**: Stories 24-3, 24-4 for auto-restore + tool context
- **Session Snapshots**: Story 24-5 for complete IDE state restoration
- **Dexie Schema v9**: Adds `fileMetadata`, `toolExecutionLogs` tables
- **Team Assignment**: Team A (24-1, 24-2), Team B (24-3, 24-4, 24-5)

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
