# Source Tree Analysis

Complete directory structure and file organization for the Via-gent project.

## Root Directory

```
project-alpha-master/
├── .agent/                  # AI agent rules and prompts
├── .claude/                 # Claude Code configuration
├── .clinerules/             # Cline rules
├── .cursor/                 # Cursor IDE rules
├── .github/                 # GitHub configurations
├── .kilocode/               # Kilocode mode configurations
├── _bmad/                   # BMAD method artifacts
│   ├── bmb/                 # Builder modules
│   ├── bmm/                 # Method modules
│   ├── cis/                 # Creative/innovation modules
│   └── core/                # Core framework
├── _bmad-output/            # Generated artifacts and sprint tracking
├── docs/                    # Project documentation
├── node_modules/            # Dependencies (excluded from analysis)
├── public/                  # Static assets
├── src/                     # Source code
├── i18next-scanner.config.cjs
├── eslint.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## Source Directory (`src/`)

```
src/
├── __tests__/               # Root-level test utilities
├── components/              # React UI components
│   ├── agent/               # Agent configuration dialogs & chat
│   ├── chat/                # Chat interface components
│   ├── common/              # Common utilities (ErrorBoundary, AppInitializer)
│   ├── dashboard/           # Dashboard pages (Onboarding, PitchDeck)
│   ├── debug/               # Debug tools (AgentDiagnostic)
│   ├── hub/                 # Hub/navigation components
│   ├── ide/                 # IDE core components
│   ├── layout/              # Layout shells (IDELayout, MobileIDELayout)
│   └── ui/                  # Reusable UI primitives
├── data/                    # Demo data
├── hooks/                   # Custom React hooks
├── i18n/                    # Internationalization
├── lib/                     # Core libraries
│   ├── agent/               # AI agent infrastructure
│   ├── editor/              # Monaco editor utilities
│   ├── events/              # Event system
│   ├── filesystem/          # File System Access API
│   ├── persistence/         # Persistence helpers
│   ├── webcontainer/        # WebContainer lifecycle
│   └── workspace/           # Workspace state
├── mocks/                   # Test mocks
├── routes/                  # TanStack Router routes
├── stores/                  # Zustand stores
├── styles/                  # Global styles & design tokens
├── test/                    # Test utilities
├── types/                   # TypeScript types
├── utils/                   # Utility functions
├── workers/                 # Web workers
├── router.tsx               # Route configuration
├── routeTree.gen.ts         # Auto-generated route tree
├── server.ts                # Server entry point
└── styles.css               # Global styles
```

## Critical Directories

### `src/components/ide/`

Core IDE components:

```
src/components/ide/
├── AgentChatPanel.tsx       # AI chat panel with tool execution
├── AgentsPanel.tsx          # Agent management panel
├── BentoGrid.tsx            # Bento-style dashboard grid
├── CommandPalette.tsx       # Ctrl+P/Cmd+P command palette
├── ExplorerPanel.tsx        # File explorer panel
├── FileTree/                # File tree with context menu
│   ├── FileTree.tsx
│   ├── FileTreeItem.tsx
│   ├── ContextMenu.tsx
│   ├── hooks/
│   └── icons.tsx
├── MonacoEditor/            # Monaco editor integration
│   ├── MonacoEditor.tsx
│   ├── EditorTabBar.tsx
│   ├── hooks/
│   └── index.ts
├── PreviewPanel/            # Preview iframe
│   ├── PreviewPanel.tsx
│   └── index.ts
├── QuickActionsMenu.tsx     # Quick actions dropdown
├── SearchPanel.tsx          # Search in files
├── SettingsPanel.tsx        # Settings interface
├── StatusBar.tsx            # IDE status bar
├── StreamingMessage.tsx     # Streaming message display
├── SyncStatusIndicator.tsx  # Sync status indicator
├── XTerminal.tsx            # Terminal with xterm.js
└── statusbar/               # Status bar segments
    ├── AgentStatusSegment.tsx
    ├── CursorPosition.tsx
    ├── FileTypeIndicator.tsx
    ├── ProviderStatus.tsx
    ├── StatusBarSegment.tsx
    ├── SyncStatusSegment.tsx
    └── WebContainerStatus.tsx
```

### `src/lib/agent/`

AI agent infrastructure:

```
src/lib/agent/
├── facades/                 # Tool facades for agents
│   ├── file-tools.ts        # File operations abstraction
│   ├── terminal-tools.ts    # Terminal operations abstraction
│   ├── file-lock.ts         # File locking for concurrency
│   ├── command-sanitizer.ts # Command sanitization
│   └── index.ts
├── hooks/                   # React hooks for agents
│   ├── use-agent-chat-with-tools.ts
│   ├── use-prompt-enhancer.ts
│   └── index.ts
├── providers/               # LLM provider adapters
│   ├── provider-adapter.ts  # Provider adapter interface
│   ├── model-registry.ts    # Model registry
│   ├── credential-vault.ts  # Encrypted credential storage
│   ├── types.ts
│   └── index.ts
├── tools/                   # Agent tools
│   ├── read-file-tool.ts
│   ├── write-file-tool.ts
│   ├── list-files-tool.ts
│   ├── execute-command-tool.ts
│   ├── tool-parser.ts
│   ├── permission-check.ts
│   ├── tool-error.ts
│   ├── retry-queue.ts
│   └── index.ts
├── factory.ts               # Agent factory
├── prompt-composer.ts       # System prompt composition
├── system-prompt.ts         # System prompts
├── tool-permission-manager.ts
└── routes/                  # API routes
    └── __tests__/
        └── sse-streaming.test.ts
```

### `src/lib/filesystem/`

File System Access API implementation:

```
src/lib/filesystem/
├── local-fs-adapter.ts      # Local FS adapter
├── sync-manager.ts          # Sync manager (Local FS ↔ WebContainer)
├── sync-planner.ts          # Sync planning
├── sync-operations.ts       # Sync operations
├── sync-executor.ts         # Sync execution
├── sync-types.ts            # Sync type definitions
├── sync-utils.ts            # Sync utilities
├── dir-ops.ts               # Directory operations
├── file-ops.ts              # File operations
├── handle-utils.ts          # FS handle utilities
├── path-guard.ts            # Path validation/security
├── path-utils.ts            # Path utilities
├── fs-errors.ts             # Error definitions
├── fs-types.ts              # Type definitions
├── directory-walker.ts      # Directory traversal
├── exclusion-config.ts      # Sync exclusions
├── permission-lifecycle.ts  # Permission persistence
├── fsa-handle-manager.ts    # FSA handle management
└── __tests__/               # Unit tests
```

### `src/lib/state/`

State management (Dexie + Zustand):

```
src/lib/state/
├── dexie-db.ts              # Dexie database schema
├── ide-state-store.ts       # IDE state store
├── navigation-store.ts      # Navigation state
├── file-sync-status-store.ts
└── index.ts
```

### `src/components/agent/`

Agent configuration UI:

```
src/components/agent/
├── AgentConfigDialog.tsx    # Agent configuration dialog
├── ProviderConfigDialog.tsx # Provider settings dialog
├── ProviderSettings.tsx     # Provider settings UI
└── ToolPermissionsConfig.tsx
```

### `src/components/chat/`

Chat interface:

```
src/components/chat/
├── AgentSelector.tsx        # Agent selector dropdown
├── ApprovalOverlay.tsx      # Tool approval overlay
├── AutoApproveSettings.tsx  # Auto-approve settings
├── BatchApprovalBar.tsx     # Batch approval bar
├── ChatConversation.tsx     # Conversation display
├── ChatPanel.tsx            # Main chat panel
├── CodeBlock.tsx            # Code block renderer
├── DiffPreview.tsx          # Diff preview component
├── StreamdownRenderer.tsx   # Streamdown renderer
├── ThreadCard.tsx           # Thread card
├── ThreadsList.tsx          # Threads list
└── ToolCallBadge.tsx        # Tool call badge
```

## Entry Points

| File | Purpose |
|------|---------|
| `src/router.tsx` | TanStack Router configuration |
| `src/routeTree.gen.ts` | Auto-generated route tree |
| `src/server.ts` | TanStack Start server entry |
| `src/main.tsx` | Client entry point |
| `src/App.tsx` | Root application component |

## Integration Points

### WebContainer Integration
- **File Sync**: `src/lib/filesystem/sync-manager.ts`
- **Process Management**: `src/lib/webcontainer/process-manager.ts`
- **Shell**: `src/components/ide/XTerminal.tsx`

### AI Provider Integration
- **Factory**: `src/lib/agent/factory.ts`
- **Adapter**: `src/lib/agent/providers/provider-adapter.ts`
- **Chat API**: `src/routes/api/chat.ts`

### State Persistence
- **Database**: `src/lib/state/dexie-db.ts`
- **Stores**: `src/lib/state/` and `src/stores/`

---

*Generated: 2025-12-31*
