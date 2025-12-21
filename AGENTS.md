# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Via-gent** is a browser-based IDE that runs code locally using WebContainers. It provides:
- Monaco Editor for code editing with tabbed interface
- xterm.js-based terminal integrated with WebContainers
- Bidirectional file sync between local File System Access API and WebContainers
- Multi-language support (English, Vietnamese) with i18next
- Project persistence via IndexedDB
- React 19 + TypeScript + Vite + TanStack Router stack

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
```

## Dependencies Github repos and docs links:
Based on my research, here's a comprehensive list of official documentation and GitHub repository links for your stack dependencies:

## Core UI & Component Libraries

### @radix-ui (Dialog, Dropdown Menu, Label, Select, Separator, Slot, Switch, Tabs)
- **Docs**: [https://www.radix-ui.com/primitives](https://www.radix-ui.com/primitives)[1]
- **GitHub**: [https://github.com/radix-ui/primitives](https://github.com/radix-ui/primitives)[2]

### @monaco-editor/react
- **Docs**: [https://github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)[3]
- **GitHub**: [https://github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)[3]

### monaco-editor
- **Docs**: [https://microsoft.github.io/monaco-editor/](https://microsoft.github.io/monaco-editor/)[4]
- **GitHub**: [https://github.com/microsoft/monaco-editor](https://github.com/microsoft/monaco-editor)[5]

### lucide-react
- **Docs**: [https://lucide.dev](https://lucide.dev)[6]
- **GitHub**: [https://github.com/lucide-icons/lucide](https://github.com/lucide-icons/lucide)[7]

## Styling & Theming

### tailwindcss & @tailwindcss/vite
- **Docs**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)[8]
- **GitHub**: [https://github.com/tailwindlabs/tailwindcss.com](https://github.com/tailwindlabs/tailwindcss.com)[9]

### class-variance-authority
- **Docs**: [https://cva.style](https://cva.style)[10]
- **GitHub**: [https://github.com/joe-bell/cva](https://github.com/joe-bell/cva)[10]

### next-themes
- **Docs**: [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)[11]
- **GitHub**: [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)[11]

### clsx & tailwind-merge
- **clsx GitHub**: [https://github.com/lukeed/clsx](https://github.com/lukeed/clsx)
- **tailwind-merge GitHub**: [https://github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge)

## TanStack Ecosystem

### @tanstack/react-router, @tanstack/react-router-devtools, @tanstack/react-router-ssr-query, @tanstack/react-start, @tanstack/router-plugin
- **Docs**: [https://tanstack.com/router](https://tanstack.com/router)[12]
- **GitHub**: [https://github.com/TanStack/router](https://github.com/TanStack/router)[13]

### @tanstack/ai, @tanstack/ai-gemini, @tanstack/ai-react
- **Docs**: [https://tanstack.com/ai](https://tanstack.com/ai)[14]
- **GitHub**: [https://github.com/TanStack/ai](https://github.com/TanStack/ai)[15]

### @tanstack/store
- **Docs**: [https://tanstack.com](https://tanstack.com)[16]
- **GitHub**: [https://github.com/TanStack](https://github.com/TanStack)

### @tanstack/react-devtools
- **Docs**: [https://tanstack.com](https://tanstack.com)[16]
- **GitHub**: [https://github.com/TanStack](https://github.com/TanStack)

## Data & State Management

### zustand
- **Docs**: [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)[17]
- **GitHub**: [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)[18]

### dexie & dexie-react-hooks
- **Docs**: [https://dexie.org](https://dexie.org)[19]
- **GitHub**: [https://github.com/dexie/Dexie.js](https://github.com/dexie/Dexie.js)[20]

### idb
- **Docs**: [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)[21]
- **GitHub**: [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)[21]

### zod
- **Docs**: [https://zod.dev](https://zod.dev)[22]
- **GitHub**: [https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)[23]

## Development Tools & Utilities

### @webcontainer/api
- **Docs**: [https://developer.stackblitz.com/platform/api/webcontainer-api](https://developer.stackblitz.com/platform/api/webcontainer-api)[24]
- **GitHub**: [https://github.com/stackblitz/webcontainer-docs](https://github.com/stackblitz/webcontainer-docs)[25]

### @xterm/xterm & @xterm/addon-fit
- **Docs**: [http://xtermjs.org](http://xtermjs.org)[26]
- **GitHub**: [https://github.com/xtermjs/xterm.js](https://github.com/xtermjs/xterm.js)[27]

### isomorphic-git
- **Docs**: [https://isomorphic-git.org](https://isomorphic-git.org)[28]
- **GitHub**: [https://github.com/isomorphic-git/isomorphic-git](https://github.com/isomorphic-git/isomorphic-git)[29]

## Internationalization

### i18next, i18next-browser-languagedetector, react-i18next
- **Docs**: [https://www.i18next.com](https://www.i18next.com)[30]
- **GitHub**: [https://github.com/i18next/i18next](https://github.com/i18next/i18next)[31]

## UI Utilities

### react-resizable-panels
- **Docs**: [https://react-resizable-panels.vercel.app](https://react-resizable-panels.vercel.app)[32]
- **GitHub**: [https://github.com/bvaughn/react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)[33]

### sonner
- **Docs**: [https://sonner.emilkowal.ski](https://sonner.emilkowal.ski)
- **GitHub**: [https://github.com/emilkowalski/sonner](https://github.com/emilkowalski/sonner)

### eventemitter3
- **Docs**: [http://nodejs.org/api/events.html](http://nodejs.org/api/events.html)[34]
- **GitHub**: [https://github.com/primus/eventemitter3](https://github.com/primus/eventemitter3)[34]

## Observability

### @sentry/react
- **Docs**: [https://docs.sentry.io/platforms/javascript/guides/react/](https://docs.sentry.io/platforms/javascript/guides/react/)[35]
- **GitHub**: [https://github.com/getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript)[36]

## React Core

### react & react-dom
- **Docs**: [https://react.dev](https://react.dev)
- **GitHub**: [https://github.com/facebook/react](https://github.com/facebook/react)

### vite-tsconfig-paths
- **GitHub**: [https://github.com/aleclarson/vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths)


## Key Directories & Files

```
src/
├── components/           # React components organized by feature
│   ├── ide/             # IDE components: editor, terminal, file tree, preview
│   ├── ui/              # Reusable UI components (Toast, etc.)
│   └── layout/          # Layout components (IDELayout, IDEHeaderBar, etc.)
├── lib/                 # Core business logic
│   ├── filesystem/      # File system sync and FSA utilities
│   ├── webcontainer/    # WebContainer lifecycle and process management
│   ├── workspace/       # Workspace state and project persistence
│   ├── editor/          # Monaco editor integration
│   ├── events/          # Event system
│   └── persistence/     # Data persistence utilities
├── routes/              # TanStack Router file-based routes
├── i18n/                # Internationalization files (en.json, vi.json)
└── data/                # Demo data and fixtures

.cursor/rules/bmad/      # BMAD method agents, workflows, and tools
vite.config.ts           # Vite config with WebContainer cross-origin plugin
vitest.config.ts         # Test configuration
tsconfig.json           # TypeScript config with @/* path alias
```

## Architecture & Key Components

### Core Architecture
- **Local FS as Source of Truth**: All file operations go through `LocalFSAdapter` to browser's File System Access API
- **WebContainer Mirror**: `SyncManager` (`src/lib/filesystem/sync-manager.ts`) syncs files to WebContainer sandbox
- **State Management**: TanStack Store with React Context (`src/lib/workspace/WorkspaceContext.tsx`)
- **Project Persistence**: IndexedDB via `ProjectStore` (`src/lib/workspace/project-store.ts`)

### File System Sync Flow
```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
      ↑                                    ↑
   IndexedDB (ProjectStore)         File Change Events
```

### Key Directories
- `src/lib/filesystem/` - File system sync and FSA utilities
- `src/lib/webcontainer/` - WebContainer lifecycle and process management
- `src/lib/workspace/` - Workspace state and project persistence
- `src/components/ide/` - Monaco editor, file tree, terminal, preview panel
- `src/routes/` - TanStack Router file-based routes (SSR disabled for WebContainer compatibility)
- `src/data/` - Demo data and fixtures

### Component Structure
- Components organized by feature: `ide/`, `ui/`, `layout/`
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

### Starting Development
1. Run `pnpm dev` - starts on port 3000 with required headers
2. Open browser to `http://localhost:3000`
3. Grant file system permissions when prompted

### Testing
- Tests use `vitest` with `jsdom` for React components
- File System Access API is mocked in tests
- Test files follow naming pattern `*.test.ts` or `*.test.tsx`

### Internationalization
- Use `t()` hook or `i18next.t()` function for translations
- Run `pnpm i18n:extract` to update translation files
- Keys auto-extracted from source code

### Route Generation
- TanStack Router auto-generates `src/routeTree.gen.ts`
- **DO NOT edit this file manually**
- VS Code settings (`.vscode/settings.json`) mark it as read-only and exclude from watcher/search

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

## Existing Documentation & Guidance

### AGENTS.md
The repository already has comprehensive guidance in `AGENTS.md` covering:
- Development workflow and story development cycle
- Git commit message format with epic/story context
- Branch strategy (feature branches created after epic completion)
- Project-specific nuances and gotchas
- Code style and conventions
- Testing structure and patterns

**Key points from AGENTS.md:**
- Ignore admin route completely (100% client-side project)
- Terminal working directory must be set with `projectPath` parameter
- No reverse sync from WebContainer to local FS
- `.git` and `node_modules` excluded from sync (regenerated in WebContainer)
- Use BMAD method for development workflows

**Development Tools & Research Guidance (from AGENTS.md):**
- Use innate search tools, grep, etc. for codebase exploration
- Use Context7 MCP tools for official documentation (2 sequential steps per turn based on scoring)
- Use Deepwiki for semantic questions about specific tech stacks (TanStack Router, WebContainer, xterm.js, etc.)
- Use Tavily and Exa MCP tools for semantic repo search
- Use Repomix MCP tools for granular codebase analysis
- Create controlled documents/artifacts with IDs, variables, naming, date stamps for context preservation
- Prioritize iteration, insertion, updates on single-source of truth
- When generating new files, isolate with new folders and date-time-stamp marking

> ⚠️ **MANDATORY MCP RESEARCH PROTOCOL (2025-12-21)**
>
> Before implementing unfamiliar patterns or using libraries for the first time:
>
> 1. **Context7**: Query library documentation for API signatures
> 2. **Deepwiki**: Check repo wikis for architecture decisions
> 3. **Tavily/Exa**: Search for 2025 best practices
> 4. **Repomix**: Analyze current codebase structure
>
> See `agent-os/standards/global/mcp-research.md` for full protocol.
> **Never assume. Always verify. Document findings.**

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

#### Development Workflow from AGENTS.md
1. **Story Development Cycle**: After completing a story following the **story-dev-cycle** workflow:
   - Run tests: `pnpm test`
   - Stage changes: `git add .`
   - Commit with story ID: `git commit -m "feat(epic-N): Story N-X - [Story Title]"`
2. **Branch Strategy**: Feature branches created after epic completion (not per-story)
   - Branch naming: `epic-N/descriptive-name`
   - Created after `/bmad-bmm-workflows-retrospective` workflow
3. **Commit Message Format**:
   ```
   feat(epic-13): Story 13-1 - Fix Terminal Working Directory
   fix(epic-13): Story 13-2 - Fix Auto-Sync on Project Load
   docs(governance): Update sprint-status.yaml with Story 13-6
   chore(bmad): Course correction - Add Story 13-6 for Preview in New Tab
   ```

## Common Operations

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
- Workspace state via `WorkspaceContext` React Context
- TanStack Store for reactive state
- Project metadata persisted in IndexedDB

## Testing Notes

- Mock `window.showDirectoryPicker` in tests
- Use `fake-indexeddb` for IndexedDB testing
- React component tests use `@testing-library/react` with `jsdom`
- File system tests mock File System Access API

## Performance Considerations

- WebContainer boot is expensive (≈3-5 seconds)
- File sync uses debounced batch operations
- Large `node_modules` directories are excluded from sync (regenerated in WebContainer)
- Monaco Editor loads languages/features on-demand

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