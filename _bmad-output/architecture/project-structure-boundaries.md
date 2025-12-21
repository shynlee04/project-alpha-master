# Project Structure & Boundaries

### Complete Project Directory Structure

```
via-gent-spike/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── app.config.ts                    # TanStack Start config (ssr settings)
├── .env.local
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── client.tsx                   # TanStack Start client entry
│   ├── router.tsx                   # Router configuration
│   ├── routes/
│   │   ├── __root.tsx               # Root layout with providers
│   │   ├── index.tsx                # Dashboard/project list
│   │   ├── workspace/
│   │   │   └── $projectId.tsx       # IDE workspace (ssr: false)
│   │   └── api/
│   │       └── chat.ts              # TanStack AI streaming endpoint
│   ├── components/
│   │   ├── ui/                      # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── ide/
│   │   │   ├── MonacoEditor.tsx     # Monaco with FS sync
│   │   │   ├── XTerminal.tsx        # XTerm with WebContainer
│   │   │   ├── FileTree.tsx         # File tree with FSA
│   │   │   ├── ChatPanel.tsx        # TanStack AI useChat
│   │   │   ├── PreviewPanel.tsx     # Dev server preview iframe
│   │   │   └── GitPanel.tsx         # Git status and operations
│   │   └── layout/
│   │       ├── IDELayout.tsx        # Resizable panels container
│   │       └── ProjectCard.tsx      # Dashboard project card
│   ├── lib/
│   │   ├── webcontainer/
│   │   │   ├── manager.ts           # WebContainer lifecycle
│   │   │   ├── terminal-adapter.ts  # XTerm ↔ WebContainer binding
│   │   │   └── types.ts
│   │   ├── filesystem/
│   │   │   ├── local-fs-adapter.ts  # File System Access API wrapper
│   │   │   ├── webcontainer-fs.ts   # WebContainer FS operations
│   │   │   ├── sync-manager.ts      # Bidirectional sync logic
│   │   │   └── types.ts
│   │   ├── git/
│   │   │   ├── git-service.ts       # isomorphic-git operations
│   │   │   ├── fsa-adapter.ts       # FSA fs.promises adapter
│   │   │   ├── github-auth.ts       # PAT handling
│   │   │   └── types.ts
│   │   ├── persistence/
│   │   │   ├── db.ts                # IndexedDB setup via idb
│   │   │   ├── project-store.ts     # Project metadata persistence
│   │   │   ├── conversation-store.ts # Message persistence
│   │   │   ├── handle-store.ts      # FSA handle persistence
│   │   │   └── types.ts
│   │   └── agent/
│   │       ├── tool-definitions.ts  # Tool registry
│   │       ├── file-tools.ts        # read/write/list/delete
│   │       ├── terminal-tools.ts    # run_command
│   │       ├── git-tools.ts         # git operations
│   │       └── types.ts
│   ├── stores/
│   │   ├── ide-store.ts             # IDE state (panels, active file)
│   │   ├── project-store.ts         # Current project state
│   │   └── conversation-store.ts    # Chat state
│   ├── hooks/
│   │   ├── useAgentChat.ts          # TanStack AI useChat wrapper
│   │   ├── useWebContainer.ts       # WebContainer lifecycle hook
│   │   ├── useFileSystem.ts         # FSA operations hook
│   │   └── useProject.ts            # Project operations hook
│   ├── types/
│   │   └── index.ts                 # Shared type definitions
│   └── styles/
│       └── globals.css              # Global styles + Shadcn/ui vars
├── tests/
│   ├── unit/
│   │   ├── filesystem/
│   │   │   └── sync-manager.test.ts
│   │   └── agent/
│   │       └── file-tools.test.ts
│   ├── integration/
│   │   ├── webcontainer.test.ts
│   │   └── git-operations.test.ts
│   └── e2e/
│       └── full-workflow.test.ts    # 14-step validation
└── public/
    └── assets/
```

### Architectural Boundaries

**API Boundaries:**
```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Tab                          │
├─────────────────────────────────────────────────────────────┤
│  /api/chat (SSE)    → LLM Provider (Gemini)                │
│  FSA API            → User's Local File System             │
│  isomorphic-git     → GitHub API (via CORS proxy or PAT)   │
│  WebContainers      → Sandboxed Node.js Runtime            │
└─────────────────────────────────────────────────────────────┘
```

**Component Boundaries:**
```
UI Layer (React)
    ↓ props/events
Store Layer (TanStack Store)
    ↓ actions/selectors
Domain Layer (lib/*)
    ↓ async calls
Adapter Layer (FSA, WebContainers, isomorphic-git, IndexedDB)
    ↓ native APIs
Browser/System
```

### Requirements to Structure Mapping

| Requirement Domain | Directory Mapping |
|--------------------|-------------------|
| IDE Shell (FR-IDE) | `src/routes/workspace/$projectId.tsx`, `src/components/ide/*`, `src/components/layout/*` |
| WebContainers (FR-WC) | `src/lib/webcontainer/*`, `src/hooks/useWebContainer.ts` |
| File System (FR-FS) | `src/lib/filesystem/*`, `src/hooks/useFileSystem.ts` |
| Dual Sync (FR-SYNC) | `src/lib/filesystem/sync-manager.ts` |
| Git (FR-GIT) | `src/lib/git/*` |
| Persistence (FR-PERSIST) | `src/lib/persistence/*` |
| AI Agent (FR-AGENT) | `src/lib/agent/*`, `src/routes/api/chat.ts`, `src/hooks/useAgentChat.ts` |

---
