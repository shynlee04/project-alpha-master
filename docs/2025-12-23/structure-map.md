# Via-gent Repository Structure Map

**Analysis Date:** 2025-12-23  
**Project:** Via-gent - Browser-based IDE with WebContainers  
**Repository:** project-alpha-master

---

## Executive Summary

Via-gent is a single-page React application that provides a browser-based IDE experience using WebContainers for local code execution. The repository follows a monorepo-style structure with clear separation between application code, BMAD (Business Model & Agile Development) framework, and various AI agent configurations.

**Key Characteristics:**
- **Architecture:** Client-side SPA with WebContainer sandbox isolation
- **Stack:** React 19 + TypeScript + Vite + TanStack Router
- **Primary Technology:** WebContainers (@webcontainer/api) for code execution
- **State Management:** TanStack Store + React Context + IndexedDB (Dexie)
- **Build System:** Vite with cross-origin isolation for WebContainers
- **Testing:** Vitest with jsdom for React components

---

## Root Directory Structure

```
project-alpha-master/
├── src/                          # Application source code
├── _bmad/                        # BMAD v6 multi-agent framework
├── _bmad-output/                 # BMAD artifacts and documentation
├── agent-os/                     # Agent OS framework (alternative agent system)
├── docs/                         # Documentation (non-BMAD)
├── public/                       # Static assets
├── server/                       # Server-side code (minimal)
├── netlify/                      # Netlify deployment configuration
├── .github/                      # GitHub workflows/CI
├── .cursor/                      # Cursor IDE configuration
├── .claude/                      # Claude AI configuration
├── .kilocode/                    # Kilocode AI configuration
├── .vscode/                      # VS Code configuration
├── [multiple .agent directories] # Various AI agent configurations
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite build configuration
├── vitest.config.ts              # Test configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── components.json               # shadcn/ui component configuration
├── wrangler.jsonc                # Cloudflare Workers configuration
├── netlify.toml                  # Netlify deployment config
└── [various config files]        # Other tool configurations
```

---

## Application Source Structure (`src/`)

### Overview
The `src/` directory contains the entire application code organized by feature and concern.

```
src/
├── components/                   # React components (feature-organized)
│   ├── ide/                     # IDE-specific components
│   │   ├── MonacoEditor/        # Monaco editor wrapper
│   │   ├── FileTree/            # File tree component
│   │   ├── statusbar/           # Status bar segments
│   │   ├── AgentChatPanel.tsx   # AI agent chat interface
│   │   ├── AgentsPanel.tsx      # Agent management
│   │   ├── EnhancedChatInterface.tsx
│   │   ├── ExplorerPanel.tsx    # File explorer
│   │   ├── IconSidebar.tsx      # Navigation sidebar
│   │   ├── PanelShell.tsx       # Panel container
│   │   ├── SearchPanel.tsx      # Search interface
│   │   ├── SettingsPanel.tsx    # Settings
│   │   ├── StatusBar.tsx        # Main status bar
│   │   ├── StreamingMessage.tsx # Streaming chat messages
│   │   ├── SyncEditWarning.tsx  # Sync conflict warnings
│   │   ├── SyncStatusIndicator.tsx
│   │   ├── XTerminal.tsx        # Terminal component
│   │   ├── AgentCard.tsx
│   │   └── __tests__/           # Component tests
│   ├── ui/                      # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── resizable.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx           # Toast notifications
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── ThemeProvider.tsx    # Theme management
│   │   ├── ThemeToggle.tsx      # Theme switcher
│   │   ├── Toast/               # Toast component
│   │   ├── brand-logo.tsx
│   │   ├── pixel-badge.tsx
│   │   ├── status-dot.tsx
│   │   ├── tooltip.tsx
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── layout/                  # Layout components
│   │   ├── IDELayout.tsx        # Main IDE layout
│   │   ├── IDEHeaderBar.tsx     # Header with controls
│   │   ├── ChatPanelWrapper.tsx
│   │   ├── TerminalPanel.tsx
│   │   ├── PermissionOverlay.tsx
│   │   ├── MinViewportWarning.tsx
│   │   ├── hooks/               # Layout-specific hooks
│   │   │   ├── useIDEFileHandlers.ts
│   │   │   ├── useIDEKeyboardShortcuts.ts
│   │   │   ├── useIDEStateRestoration.ts
│   │   │   └── useWebContainerBoot.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   ├── chat/                    # Chat-related components
│   │   ├── ApprovalOverlay.tsx  # Tool approval UI
│   │   ├── CodeBlock.tsx        # Code display
│   │   ├── DiffPreview.tsx      # Diff viewer
│   │   ├── ToolCallBadge.tsx
│   │   └── index.ts
│   ├── dashboard/               # Dashboard components
│   │   ├── Onboarding.tsx
│   │   ├── PitchDeck.tsx
│   │   └── __tests__/
│   ├── agent/                   # Agent-related components
│   │   ├── AgentConfigDialog.tsx
│   │   └── __tests__/
│   ├── common/                  # Common components
│   │   └── AppErrorBoundary.tsx
│   ├── Header.tsx               # Main header
│   ├── LanguageSwitcher.tsx     # Language switcher
│   └── __tests__/               # Root-level tests
├── lib/                         # Core business logic
│   ├── filesystem/              # File system synchronization
│   │   ├── local-fs-adapter.ts  # File System Access API wrapper
│   │   ├── sync-manager.ts      # Sync orchestration
│   │   ├── sync-planner.ts      # Sync planning
│   │   ├── sync-executor.ts     # Sync execution
│   │   ├── sync-operations.ts   # Sync operations
│   │   ├── sync-utils.ts        # Sync utilities
│   │   ├── sync-types.ts        # Type definitions
│   │   ├── file-ops.ts          # File operations
│   │   ├── dir-ops.ts           # Directory operations
│   │   ├── directory-walker.ts  # Directory traversal
│   │   ├── exclusion-config.ts  # Sync exclusions
│   │   ├── handle-utils.ts      # Handle utilities
│   │   ├── path-utils.ts        # Path utilities
│   │   ├── path-guard.ts        # Path validation
│   │   ├── permission-lifecycle.ts
│   │   ├── fs-errors.ts         # Error definitions
│   │   ├── fs-types.ts          # Type definitions
│   │   ├── index.ts
│   │   └── __tests__/           # Filesystem tests
│   ├── webcontainer/            # WebContainer lifecycle
│   │   ├── manager.ts           # WebContainer singleton manager
│   │   ├── process-manager.ts   # Process management
│   │   ├── terminal-adapter.ts  # Terminal integration
│   │   ├── types.ts             # Type definitions
│   │   ├── index.ts
│   │   └── __tests__/           # WebContainer tests
│   ├── workspace/               # Workspace state management
│   │   ├── WorkspaceContext.tsx # React Context provider
│   │   ├── workspace-types.ts   # Type definitions
│   │   ├── project-store.ts     # IndexedDB persistence (idb)
│   │   ├── ide-state-store.ts   # IDE state (TanStack Store)
│   │   ├── conversation-store.ts
│   │   ├── file-sync-status-store.ts
│   │   ├── hooks/               # Workspace hooks
│   │   │   ├── useWorkspaceState.ts
│   │   │   ├── useWorkspaceActions.ts
│   │   │   ├── useSyncOperations.ts
│   │   │   ├── useInitialSync.ts
│   │   │   └── useEventBusEffects.ts
│   │   ├── index.ts
│   │   └── __tests__/           # Workspace tests
│   ├── state/                   # State management (Epic 27 migration)
│   │   ├── dexie-db.ts          # Dexie database setup
│   │   ├── dexie-storage.ts     # Dexie storage layer
│   │   ├── ide-store.ts         # IDE state store
│   │   ├── statusbar-store.ts   # Status bar state
│   │   └── index.ts
│   ├── events/                  # Event system
│   │   ├── workspace-events.ts  # Event definitions
│   │   ├── use-workspace-event.ts
│   │   └── __tests__/
│   ├── persistence/             # Data persistence utilities
│   │   ├── db.ts                # Database utilities
│   │   └── __tests__/
│   ├── editor/                  # Monaco editor integration
│   │   ├── language-utils.ts
│   │   └── __tests__/
│   ├── agent/                   # Agent tool facades (Epic 12)
│   │   ├── facades/
│   │   │   ├── file-tools.ts    # File tool interface
│   │   │   ├── file-tools-impl.ts
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   └── index.ts
│   ├── monitoring/              # Observability
│   │   └── sentry.ts            # Sentry integration
│   └── utils.ts                 # General utilities
├── routes/                      # TanStack Router routes
│   ├── __root.tsx               # Root route with providers
│   ├── index.tsx                # Home page
│   ├── test-fs-adapter.tsx      # Test route
│   ├── demo/                    # Demo routes
│   │   ├── start.api-request.tsx
│   │   ├── start.server-funcs.tsx
│   │   ├── start.ssr.data-only.tsx
│   │   ├── start.ssr.full-ssr.tsx
│   │   ├── start.ssr.index.tsx
│   │   ├── start.ssr.spa-mode.tsx
│   │   └── api.names.ts
│   └── routeTree.gen.ts         # Auto-generated route tree
├── i18n/                        # Internationalization
│   ├── config.ts                # i18next configuration
│   ├── LocaleProvider.tsx       # React provider
│   ├── en.json                  # English translations
│   └── vi.json                  # Vietnamese translations
├── data/                        # Demo data and fixtures
│   └── demo.punk-songs.ts
├── styles.css                   # Global styles
├── router.tsx                   # Router configuration
├── test/                        # Test utilities
│   └── setup.ts                 # Test setup
└── types/                       # Shared type definitions
```

---

## BMAD Framework Structure (`_bmad/`)

### Overview
BMAD (Business Model & Agile Development) is a multi-agent orchestration framework integrated into the project.

```
_bmad/
├── _config/                     # BMAD configuration
│   ├── manifest.yaml            # Main manifest
│   ├── agent-manifest.csv       # Agent definitions
│   ├── workflow-manifest.csv    # Workflow definitions
│   ├── tool-manifest.csv        # Tool definitions
│   ├── task-manifest.csv        # Task definitions
│   ├── files-manifest.csv       # File tracking
│   ├── agents/                  # Agent configurations
│   │   ├── bmm-analyst.customize.yaml
│   │   ├── bmm-architect.customize.yaml
│   │   ├── bmm-dev.customize.yaml
│   │   ├── bmm-pm.customize.yaml
│   │   ├── bmm-sm.customize.yaml
│   │   ├── bmm-tea.customize.yaml
│   │   ├── bmm-tech-writer.customize.yaml
│   │   ├── bmm-ux-designer.customize.yaml
│   │   ├── bmm-quick-flow-solo-dev.customize.yaml
│   │   ├── cis-*.customize.yaml
│   │   └── core-bmad-master.customize.yaml
│   └── ides/                    # IDE-specific configs
│       ├── claude-code.yaml
│       └── codex.yaml
├── _memory/                     # BMAD memory/state
│   ├── config.yaml
│   └── storyteller-sidecar/
│       ├── stories-told.md
│       └── story-preferences.md
├── core/                        # Core BMAD module
│   ├── agents/
│   │   └── bmad-master.md       # Master orchestrator agent
│   ├── workflows/
│   │   └── brainstorming/       # Brainstorming workflow
│   ├── resources/
│   │   └── excalidraw/          # Excalidraw diagram resources
│   └── tools/
│       └── shard-doc.xml
├── bmm/                         # Implementation module
│   ├── config.yaml
│   ├── agents/                  # Implementation agents
│   ├── workflows/               # Implementation workflows
│   │   ├── bmad-quick-flow/
│   │   ├── document-project/
│   │   ├── testarch/            # Test architecture workflows
│   │   ├── generate-project-context/
│   │   ├── workflow-status/
│   │   └── excalidraw-diagrams/
│   ├── testarch/                # Test architecture knowledge
│   ├── teams/                   # Team configurations
│   └── workflows-legacy/        # Legacy workflows
├── bmb/                         # Builder module
│   ├── config.yaml
│   ├── agents/
│   │   └── bmad-builder.md
│   ├── workflows/               # Builder workflows
│   │   ├── create-agent/
│   │   ├── create-module/
│   │   ├── create-workflow/
│   │   ├── edit-agent/
│   │   ├── edit-workflow/
│   │   └── workflow-compliance-check/
│   ├── docs/                    # Builder documentation
│   │   ├── agents/
│   │   └── workflows/
│   ├── reference/               # Reference implementations
│   │   ├── agents/
│   │   └── workflows/
│   └── workflows-legacy/
├── cis/                         # Creative/Innovation module
│   ├── config.yaml
│   ├── agents/
│   │   ├── brainstorming-coach.md
│   │   ├── creative-problem-solver.md
│   │   ├── design-thinking-coach.md
│   │   ├── innovation-strategist.md
│   │   ├── presentation-master.md
│   │   └── storyteller/
│   │       └── storyteller.md
│   └── readme.md
└── custom/                      # Custom BMAD extensions
```

---

## BMAD Output Structure (`_bmad-output/`)

### Overview
Contains all artifacts generated by BMAD agents and workflows.

```
_bmad-output/
├── bmm-workflow-status.yaml     # Current workflow state
├── GOVERNANCE-INDEX.md          # Governance document index
├── index.md                     # Main index
├── project-context.md           # Project context
├── project-overview.md          # Project overview
├── prd.md                       # Product requirements
├── ux-design.md                 # UX specifications
├── state-management.md          # State management documentation
├── structure-map.md             # Repository structure
├── parallel-execution-strategy.md
├── development-guide.md         # Development guidelines
├── component-inventory.md       # Component catalog
├── source-tree-analysis.md      # Source tree analysis
├── architecture/                # Architecture artifacts
│   ├── architecture.md
│   ├── data-and-contracts.md
│   ├── flows-and-workflows.md
│   ├── tech-context.md
│   ├── agent-tool-architecture-*.md
│   ├── event-bus-architecture-*.md
│   ├── phase2-architectural-slices-completion.md
│   ├── core-architectural-decisions.md
│   ├── implementation-patterns-*.md
│   ├── lessons-learned-*.md
│   ├── project-structure-boundaries.md
│   ├── workspaceorchestrator-layer.md
│   └── index.md
├── epics/                       # Epic definitions
│   ├── epic-1-*.md
│   ├── epic-3-*.md
│   ├── epic-4-*.md
│   ├── epic-5-*.md
│   ├── epic-6-*.md
│   ├── epic-7-*.md
│   ├── epic-8-*.md
│   ├── epic-10-*.md
│   ├── epic-11-*.md
│   ├── epic-12-*.md
│   ├── epic-13-*.md
│   ├── epic-21-*.md
│   ├── epic-22-*.md
│   ├── epic-23-*.md
│   ├── epic-24-*.md
│   ├── epic-25-*.md
│   ├── epic-26-*.md
│   ├── epic-27-*.md
│   ├── epic-28-*.md
│   └── epic-45-*.md
├── handoffs/                    # Handoff documents
│   ├── architect-*.md
│   ├── bmad-master-to-dev-*.md
│   ├── dev-*.md
│   ├── dev-to-code-reviewer-*.md
│   ├── ux-designer-*.md
│   └── code-reviewer-*.md
├── sprint-artifacts/            # Sprint-level artifacts
│   ├── sprint-status.yaml       # Sprint tracking
│   ├── 12-1-*.md
│   ├── 13-1-*.md
│   ├── 13-2-*.md
│   ├── 13-3-*.md
│   ├── 13-4-*.md
│   ├── 13-5-*.md
│   ├── 13-6-*.md
│   ├── 21-1-*.md
│   ├── 21-3-*.md
│   ├── 21-5-*.md
│   ├── 21-8-*.md
│   ├── 22-1-*.md
│   ├── 22-2-*.md
│   ├── 22-3-*.md
│   ├── 22-4-*.md
│   ├── 22-5-*.md
│   ├── 22-6-*.md
│   ├── 22-7-*.md
│   ├── 22-8-*.md
│   ├── 23-1-*.md
│   ├── 23-2-*.md
│   ├── 23-3-*.md
│   ├── 23-4-*.md
│   ├── 23-5-*.md
│   ├── 27-1-*.md
│   ├── 27-1b-*.md
│   ├── 27-1c-*.md
│   ├── 27-2-*.md
│   ├── 27-5a-*.md
│   ├── 27-I-*.md
│   ├── 28-1-*.md
│   ├── 28-13-*.md
│   ├── 28-14-*.md
│   ├── 28-22-*.md
│   ├── 28-23-*.md
│   └── epic-*-readiness-analysis.md
├── ux-specification/            # UX specifications
│   ├── index.md
│   ├── table-of-contents.md
│   ├── implementation-roadmap.md
│   ├── 1-*.md
│   ├── 2-*.md
│   ├── 3-*.md
│   ├── 4-*.md
│   ├── 5-*.md
│   ├── 6-*.md
│   └── 7-*.md
├── research/                    # Research documents
│   ├── advanced-ide-spike-*.md
│   ├── client-side-git-architecture.md
│   ├── ddd-eda-patterns-*.md
│   ├── indexeddb-persistence-patterns-*.md
│   ├── tanstack-ai-*.md
│   ├── tanstack-router-*.md
│   ├── tanstack-start-patterns-*.md
│   ├── webcontainer-local-fs-sync-architecture.md
│   ├── webcontainers-fs-patterns-*.md
│   └── webcontainers-terminal-patterns-*.md
├── prompts/                     # Prompt templates
│   ├── dev-tasks.md
│   ├── epic-28-*.md
│   └── epic-28-suggestions.md
├── deployment-log/              # Deployment logs
│   └── cloudflare-21-dec-2025.md
├── archive/                     # Archived documents
│   ├── architecture.md
│   └── epics.md
├── new-ADR-total-client-side/   # ADRs for client-side architecture
│   ├── high-level-architecture-proposal.md
│   ├── prd-proposal.md
│   ├── validation-and-recommendation.md
│   └── facing-issues/
├── proposal/                    # Proposals
│   ├── project-fugu.md
│   └── roo-code-*.md
└── analysis/                    # Analysis documents
    └── epic-28-holistic-integration-analysis.md
```

---

## Agent OS Structure (`agent-os/`)

### Overview
Alternative agent framework (Agent OS) with its own configuration and workflows.

```
agent-os/
├── config.yml                   # Agent OS configuration
├── product/                     # Product definitions
│   ├── mission.md
│   ├── roadmap.md
│   └── tech-stack.md
├── commands/                    # Command definitions
│   ├── orchestrate-tasks/
│   ├── plan-product/
│   ├── shape-spec/
│   └── write-spec/
└── standards/                   # Coding standards
    ├── global/
    │   ├── coding-style.md
    │   ├── commenting.md
    │   ├── conventions.md
    │   ├── error-handling.md
    │   ├── mcp-research.md
    │   ├── tech-stack.md
    │   └── validation.md
    └── backend/
        ├── api.md
        ├── migrations.md
        ├── models.md
        └── queries.md
```

---

## Configuration Files

### Root-Level Configuration

| File | Purpose | Technology |
|------|---------|------------|
| [`package.json`](package.json:1) | Dependencies, scripts, metadata | npm/pnpm |
| [`vite.config.ts`](vite.config.ts:1) | Build configuration, plugins, headers | Vite |
| [`vitest.config.ts`](vitest.config.ts:1) | Test configuration | Vitest |
| [`tsconfig.json`](tsconfig.json:1) | TypeScript compiler options | TypeScript |
| [`tailwind.config.js`] | Tailwind CSS configuration | Tailwind CSS |
| [`components.json`](components.json:1) | shadcn/ui component configuration | shadcn/ui |
| [`wrangler.jsonc`] | Cloudflare Workers configuration | Cloudflare |
| [`netlify.toml`] | Netlify deployment configuration | Netlify |
| [`i18next-scanner.config.cjs`] | i18next scanner configuration | i18next |
| [`.prettierrc`] | Prettier formatting rules | Prettier |
| [`.gitignore`] | Git ignore patterns | Git |
| [`.gitignore.main`] | Main gitignore template | Git |

---

## Key Entrypoints

### Application Entrypoints

| Location | Type | Purpose |
|----------|------|---------|
| [`src/router.tsx`](src/router.tsx:1) | Router factory | TanStack Router initialization |
| [`src/routes/__root.tsx`](src/routes/__root.tsx:1) | Root route | App shell with providers |
| [`src/routes/index.tsx`](src/routes/index.tsx:1) | Home route | Main IDE interface |
| [`src/main.tsx`] (inferred) | Application entry | React app initialization |

### Library Entrypoints

| Location | Type | Purpose |
|----------|------|---------|
| [`src/lib/webcontainer/manager.ts`](src/lib/webcontainer/manager.ts:1) | WebContainer manager | Singleton WebContainer lifecycle |
| [`src/lib/filesystem/sync-manager.ts`](src/lib/filesystem/sync-manager.ts:1) | Sync manager | File synchronization orchestration |
| [`src/lib/workspace/WorkspaceContext.tsx`](src/lib/workspace/WorkspaceContext.tsx:1) | Context provider | Workspace state management |
| [`src/lib/agent/facades/`](src/lib/agent/facades/index.ts:1) | Agent facades | Agent tool interface layer |

---

## Testing Topology

### Test Structure

```
src/
├── __tests__/                   # Root-level tests
│   ├── dashboard-i18n.test.tsx
│   └── workspace-i18n.test.tsx
├── components/
│   ├── ide/__tests__/           # IDE component tests
│   │   ├── AgentChatPanel.test.tsx
│   │   ├── StreamingMessage.test.tsx
│   │   └── SyncStatusIndicator.test.tsx
│   ├── ui/__tests__/            # UI component tests
│   │   └── ThemeToggle.test.tsx
│   ├── layout/__tests__/        # Layout component tests
│   │   └── IDELayout.test.tsx
│   ├── agent/__tests__/         # Agent component tests
│   │   └── AgentConfigDialog.test.tsx
│   ├── dashboard/__tests__/     # Dashboard tests
│   │   └── Onboarding.test.tsx
│   └── chat/                    # Chat tests (inferred)
├── lib/
│   ├── filesystem/__tests__/    # Filesystem tests
│   │   ├── local-fs-adapter.test.ts
│   │   ├── local-fs-adapter.integration.test.ts
│   │   ├── sync-manager.test.ts
│   │   ├── sync-planner.test.ts
│   │   ├── sync-executor.test.ts
│   │   ├── directory-walker.test.ts
│   │   ├── exclusion-config.test.ts
│   │   └── path-guard.test.ts
│   ├── webcontainer/__tests__/  # WebContainer tests
│   │   ├── manager.test.ts
│   │   ├── terminal-adapter.test.ts
│   │   └── webcontainer.mock.ts
│   ├── workspace/__tests__/     # Workspace tests
│   │   ├── WorkspaceContext.test.tsx
│   │   ├── project-store.test.ts
│   │   ├── ide-state-store.test.ts
│   │   └── conversation-store.test.ts
│   ├── agent/facades/__tests__/ # Agent facade tests
│   │   ├── file-tools.test.ts
│   │   └── minimal.test.ts
│   ├── events/__tests__/        # Event system tests
│   │   ├── workspace-events.test.ts
│   │   └── use-workspace-event.test.tsx
│   ├── editor/__tests__/        # Editor tests
│   │   └── language-utils.test.ts
│   ├── persistence/__tests__/   # Persistence tests
│   │   └── db.test.ts
│   └── i18n/__tests__/          # i18n tests
│       └── config.test.ts
└── test/
    └── setup.ts                 # Test setup utilities
```

### Test Configuration

- **Framework:** Vitest
- **React Testing:** `@testing-library/react` with jsdom
- **Mocking:** `fake-indexeddb` for IndexedDB, `window.showDirectoryPicker` mock
- **File System Access API:** Mocked in tests
- **Environment:** React components use `jsdom`, others use `node`
- **Setup File:** [`src/test/setup.ts`](src/test/setup.ts:1)

---

## Deployment Configuration

### Cloudflare Workers

```
netlify/
└── (configuration files)
```

### Netlify

```
netlify/
└── (configuration files)
```

### GitHub CI/CD

```
.github/
└── (workflows and actions)
```

---

## AI Agent Configurations

The repository contains multiple AI agent configuration directories for different AI coding assistants:

- [`.agent/`](.agent/) - Agent configuration
- [`.augment/`](.augment/) - Augment configuration
- [`.claude/`](.claude/) - Claude AI configuration
- [`.clinerules/`](.clinerules/) - Cline rules
- [`.codex/`](.codex/) - Codex configuration
- [`.crush/`](.crush/) - Crush configuration
- [`.cursor/`](.cursor/) - Cursor IDE configuration
- [`.gemini/`](.gemini/) - Gemini configuration
- [`.iflow/`](.iflow/) - Iflow configuration
- [`.kilocode/`](.kilocode/) - Kilocode configuration
- [`.kiro/`](.kiro/) - Kiro configuration
- [`.opencode/`](.opencode/) - OpenCode configuration
- [`.qwen/`](.qwen/) - Qwen configuration
- [`.roo/`](.roo/) - Roo Code configuration
- [`.rovodev/`](.rovodev/) - RovoDev configuration
- [`.trae/`](.trae/) - Trae configuration
- [`.windsurf/`](.windsurf/) - Windsurf configuration

---

## Documentation Structure

### Non-BMAD Documentation

```
docs/
├── daily-report/               # Daily reports
├── deployment/                 # Deployment documentation
├── performance/                # Performance documentation
├── Fix IDE Theming and Layout.md
└── specify.md
```

---

## Summary Statistics

### Code Organization

| Category | Count | Notes |
|----------|-------|-------|
| React Components | ~40+ | Organized by feature (ide/, ui/, layout/) |
| Library Modules | ~15 | Core business logic modules |
| Routes | ~8 | TanStack Router file-based routes |
| Test Files | ~30+ | Co-located with source code |
| BMAD Agents | ~15 | Specialized agents for different tasks |
| BMAD Workflows | ~20+ | Structured workflows |
| Epics | ~15 | Defined in `_bmad-output/epics/` |

### Technology Stack Summary

| Layer | Technology | Version Range |
|-------|-----------|---------------|
| Frontend | React | 19.2.3 |
| Routing | TanStack Router | 1.141.8 |
| State | TanStack Store, Zustand, Dexie | Latest |
| Build | Vite | 7.3.0 |
| Testing | Vitest | 3.2.4 |
| Styling | Tailwind CSS | 4.1.18 |
| Editor | Monaco Editor | 0.55.1 |
| Terminal | xterm.js | 5.5.0 |
| Container | WebContainers | 1.6.1 |
| i18n | i18next | 23.10.1 |
| Observability | Sentry | 10.32.1 |
| TypeScript | TypeScript | 5.9.3 |

---

## Key Architectural Boundaries

### 1. **Application vs Framework**
- `src/` - Application code
- `_bmad/` - BMAD framework (meta)
- `agent-os/` - Alternative agent framework

### 2. **Feature Boundaries**
- `components/ide/` - IDE-specific UI
- `components/ui/` - Reusable UI components
- `components/layout/` - Layout orchestration
- `components/chat/` - Chat interface
- `components/agent/` - Agent UI

### 3. **Domain Boundaries**
- `lib/filesystem/` - File system domain
- `lib/webcontainer/` - WebContainer domain
- `lib/workspace/` - Workspace state domain
- `lib/agent/` - Agent tool domain
- `lib/events/` - Event system domain

### 4. **Testing Boundaries**
- Unit tests co-located with source (`__tests__/`)
- Integration tests in domain directories
- Test setup in `src/test/`

---

## Next Steps for Analysis

This structure map provides the foundation for deeper analysis in subsequent phases:

1. **Phase 2** will analyze runtime architecture, data contracts, workflows, and dependencies
2. **Phase 3** will diagnose technical debt and risks
3. **Phase 4** will identify drift, smells, gaps, and opportunities
4. **Phase 5** will synthesize corporate-level documentation

---

**Document Metadata**
- **Created:** 2025-12-23
- **Author:** BMAD Architect Mode
- **Status:** Phase 1 Complete
- **Related Artifacts:** None yet