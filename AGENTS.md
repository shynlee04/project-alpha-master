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

```
Here is a concise list of runtime dependencies with official docs roots and GitHub repos where applicable.

## React core

- **react**  
  - Docs: https://react.dev[1]
  - GitHub: https://github.com/facebook/react[1]
- **react-dom**  
  - Docs: https://react.dev/reference/react-dom[1]
  - GitHub: https://github.com/facebook/react[1]

## Styling / UI

- **tailwindcss**  
  - Docs: https://tailwindcss.com/docs[1]
  - GitHub: https://github.com/tailwindlabs/tailwindcss[1]
- **@tailwindcss/vite**  
  - Docs: https://tailwindcss.com/docs/installation/tailwind-vite[1]
  - GitHub: https://github.com/tailwindlabs/tailwindcss/tree/master/packages/%40tailwindcss/vite[1]
- **tailwind-merge**  
  - Docs: https://www.npmjs.com/package/tailwind-merge[1]
  - GitHub: https://github.com/dcastil/tailwind-merge[1]
- **class-variance-authority**  
  - Docs: https://cva.style[2]
  - GitHub: https://github.com/joe-bell/cva[2]
- **clsx**  
  - Docs: https://www.npmjs.com/package/clsx[1]
  - GitHub: https://github.com/lukeed/clsx[1]
- **lucide-react**  
  - Docs: https://lucide.dev/guide/packages/lucide-react[1]
  - GitHub: https://github.com/lucide-icons/lucide[1]
- **sonner**  
  - Docs: https://sonner.emilkowal.ski[1]
  - GitHub: https://github.com/emilkowalski/sonner[1]
- **next-themes**  
  - Docs: https://github.com/pacocoursey/next-themes#readme[1]
  - GitHub: https://github.com/pacocoursey/next-themes[1]

## Radix UI primitives

- **@radix-ui/react-dialog**  
  - Docs: https://www.radix-ui.com/primitives/docs/components/dialog[3]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/dialog[4]
- **@radix-ui/react-dropdown-menu**  
  - Docs: https://www.radix-ui.com/primitives/docs/components/dropdown-menu[1]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/dropdown-menu[1]
- **@radix-ui/react-label**  
  - Docs: https://www.radix-ui.com/primitives/docs/components/label[1]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/label[1]
- **@radix-ui/react-select**  
  - Docs: https://www.radix-ui.com/primitives/docs/components/select[5]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/select[6]
- **@radix-ui/react-separator**  
  - Docs: https://www.radix-ui.com/primitives/docs/components/separator[1]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/separator[1]
- **@radix-ui/react-slot**  
  - Docs: https://www.radix-ui.com/primitives/docs/utilities/slot[1]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/slot[1]
- **@radix-ui/react-switch**  
  - Docs: https://www.radix-ui.com/primitives/docs/components/switch[1]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/switch[1]
- **@radix-ui/react-tabs**  
  - Docs: https://www.radix-ui.com/primitives/docs/components/tabs[1]
  - GitHub: https://github.com/radix-ui/primitives/tree/main/packages/react/tabs[1]

## TanStack ecosystem

- **@tanstack/ai**  
  - Docs: https://tanstack.com/ai[7]
  - GitHub: https://github.com/TanStack/ai[8]
- **@tanstack/ai-gemini**  
  - Docs: https://tanstack.com/ai/latest/docs/frameworks/gemini (adapter section)[7]
  - GitHub: https://github.com/TanStack/ai/tree/main/packages/ai-gemini[8]
- **@tanstack/ai-react**  
  - Docs: https://tanstack.com/ai/latest/docs/frameworks/react[7]
  - GitHub: https://github.com/TanStack/ai/tree/main/packages/ai-react[8]
- **@tanstack/react-router**  
  - Docs: https://tanstack.com/router[9]
  - GitHub: https://github.com/TanStack/router[9]
- **@tanstack/react-router-devtools**  
  - Docs: https://tanstack.com/router/latest/docs/framework/react/devtools[10]
  - GitHub: https://github.com/TanStack/router/tree/main/packages/react-router-devtools[9]
- **@tanstack/react-router-ssr-query**  
  - Docs: https://tanstack.com/router/latest/docs/framework/react/guide/ssr[10]
  - GitHub: https://github.com/TanStack/router/tree/main/packages/react-router-ssr-query[9]
- **@tanstack/react-start**  
  - Docs: https://tanstack.com/start/latest/docs/framework/react[10]
  - GitHub: https://github.com/TanStack/tanstack-start[10]
- **@tanstack/router-plugin**  
  - Docs: https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing[10]
  - GitHub: https://github.com/TanStack/router/tree/main/packages/router-plugin[9]
- **@tanstack/store**  
  - Docs: https://tanstack.com/store/latest/docs/framework/react/overview[1]
  - GitHub: https://github.com/TanStack/store[1]
- **@tanstack/react-devtools**  
  - Docs: https://tanstack.com/devtools/latest/docs/framework/react/overview[1]
  - GitHub: https://github.com/TanStack/devtools[1]

## Monaco, xterm, editor tooling

- **monaco-editor**  
  - Docs: https://microsoft.github.io/monaco-editor[1]
  - GitHub: https://github.com/microsoft/monaco-editor[1]
- **@monaco-editor/react**  
  - Docs: https://github.com/suren-atoyan/monaco-react#readme[1]
  - GitHub: https://github.com/suren-atoyan/monaco-react[1]
- **@xterm/xterm**  
  - Docs: https://xtermjs.org/docs[11]
  - GitHub: https://github.com/xtermjs/xterm.js[11]
- **@xterm/addon-fit**  
  - Docs: https://xtermjs.org/docs/api/addons/fit[11]
  - GitHub: https://github.com/xtermjs/xterm.js/tree/master/addons/xterm-addon-fit[11]
- **@webcontainer/api**  
  - Docs: https://webcontainers.io/api[12]
  - GitHub: https://github.com/stackblitz/webcontainer-core[13]

## State, data, events

- **zustand**  
  - Docs: https://docs.pmnd.rs/zustand/getting-started/introduction[1]
  - GitHub: https://github.com/pmndrs/zustand[1]
- **dexie**  
  - Docs: https://dexie.org/docs[1]
  - GitHub: https://github.com/dexie/Dexie.js[1]
- **dexie-react-hooks**  
  - Docs: https://dexie.org/docs/React[1]
  - GitHub: https://github.com/dexie/Dexie.js/tree/master/addons/dexie-react-hooks[1]
- **idb**  
  - Docs: https://github.com/jakearchibald/idb#readme[1]
  - GitHub: https://github.com/jakearchibald/idb[1]
- **eventemitter3**  
  - Docs: https://github.com/primus/eventemitter3#readme[1]
  - GitHub: https://github.com/primus/eventemitter3[1]

## i18n

- **i18next**  
  - Docs: https://www.i18next.com[1]
  - GitHub: https://github.com/i18next/i18next[1]
- **i18next-browser-languagedetector**  
  - Docs: https://github.com/i18next/i18next-browser-languageDetector#readme[1]
  - GitHub: https://github.com/i18next/i18next-browser-languageDetector[1]
- **react-i18next**  
  - Docs: https://react.i18next.com[1]
  - GitHub: https://github.com/i18next/react-i18next[1]

## Routing / theming extras

- **react-resizable-panels**  
  - Docs: https://www.npmjs.com/package/react-resizable-panels[1]
  - GitHub: https://github.com/bvaughn/react-resizable-panels[1]
- **next-themes** (already listed under styling but relevant for theming with routing)[1]

## Validation / schema

- **zod**  
  - Docs: https://zod.dev[1]
  - GitHub: https://github.com/colinhacks/zod[1]

## Error monitoring

- **@sentry/react**  
  - Docs: https://docs.sentry.io/platforms/javascript/guides/react[14]
  - GitHub: https://github.com/getsentry/sentry-javascript/tree/master/packages/react[15]

## Git, WebContainers integration

- **isomorphic-git**  
  - Docs: https://isomorphic-git.org/docs/en[1]
  - GitHub: https://github.com/isomorphic-git/isomorphic-git[1]

## Build / tooling in runtime deps

- **vite-tsconfig-paths**  
  - Docs: https://github.com/aleclarson/vite-tsconfig-paths#readme[1]
  - GitHub: https://github.com/aleclarson/vite-tsconfig-paths[1]

```



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