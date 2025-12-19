# AGENTS.md

This file provides guidance to agents when working with code in this repository.
## ignore admin route completely
this is a 100% client-side project, so ignore the admin route completely
## Build/Test Commands

- `pnpm dev` - Starts dev server on port 3000 with cross-origin isolation headers required for WebContainers
- `pnpm build` - Builds for production using Vite
- `pnpm preview` - Preview production build
- `pnpm test` - Run Vitest tests (tests are co-located in `__tests__` directories adjacent to source files)

## GUIDE and NOTICES FOR DEVELOPMENT 



----
# Pick the right tools, use the terminal commands

- innate search tools, fast context, grep etc to discover and investigate codebase and gain context
- innate read of files, documents and artifacts to gain context
- using all commands of terminal shell console to list files, grep, read, tree, create folders etc - knowing what to use as everything has been provided
- serena mcp tools for symbol search of the local codebase
- Context7 mcp tools to pull sepecific official documents - must make 2 sequential steps for each turn base on scoring of documents
- Deepwiki to ask semantic in-depth questions to a specific known name stack on Github's public repo
-- Deepwiki repos' links: https://deepwiki.com/TanStack/router ; https://deepwiki.com/stackblitz/webcontainer-core ; https://deepwiki.com/stackblitz/webcontainer-docs ; https://deepwiki.com/xtermjs/xterm.js ; https://deepwiki.com/TanStack/query  and etc (you must also base on the actual list of dependencies at use on package.json) 
- Tavily and Exa MCP tools to semantic search of repos, stacks and dependencies in either specific repo, or multiple of them, or simply asking research questions
- Repomix MCP tools, ranging tools from packing remote to local repo, read, grep on downloaded and packed repo, this can be a very useful set of tools for more granular, consecutive, sequential, iterative knowledge synthesis and ingestion of particular repo, dependencies or you can make multi-round iterative runs to consume, synthesized cross-dependencies knowledge
- Directly use @web tool if having direct urls - creating outlines and subsequentially access and read
-Making use of local's dependencies' libraries to find the best patterns, combinations for developments based on the latest technological changes (remember to expand list for full detailed directories, sub-directories, files -> then using search tools, grep searchs, read/consume code files, document files to gain knowledge)

```
```

## Load and consume correct profiles, templates of agents, workflow and status files 

## Logically and critically make decisions on these approach based on your context (both read and write, context window cap)

Meaning to make the most out of each run cycle consider these


- Making use of interleave reasoning, to conditionally route and branch your decisions for just-in-time tool uses / mcp tools uses results

- The same mindset for making decisions between parallel executions or sequential execution on tools (both innnate and MCP servers' tools) as sometimes and some tools require previous tool runs results to make another; but some others can be make to run simultaneously because they are not dependent on each other. 

- Grep search the long-conversation for integration points between conversation, the closest to the current turn, and the most relevant to the current turn. 

- Produce controlled documents, artifacts and status files (governanced with ids, variables, naming, date stamp organized into modules etc) - these can be re-fetch and consume as context to continually keep long-running development context happened in the conversation

- The same arguments are for rereading the files (of document, context, artifacts before writing - prioritize iteration, isertion, updates on the single-source of truth, if new set must be generated, isolate with new folder, and sub-folders and marking with date-time-stamp. BUT, all the time, when a full-course/module run, all files must be compelted as well as every sections, parts of a files must be iteratively generated. So choose your approach wisely.

-- Conclusively, I hate asking back questions or making too many in-between conversation stops. When everything is clear, I prefer autonomy and self-regulated iterative executions. 

-- It is also worth noticing that in-chat output does not retain nor brought over or reused as context - making in-chat concise while focusing more on generation of controlled and governance documents, artifacts and status files (governanced with ids, variables, naming, date stamp organized into modules etc) - these can be re-fetch and consume as context to continually keep long-running development context happened in the conversation


## Project-Specific Nuances

### WebContainer Cross-Origin Isolation
- The Vite config includes a custom plugin that sets `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, and `Cross-Origin-Resource-Policy: cross-origin` headers
- This is required for WebContainers to work with SharedArrayBuffer
- The plugin must be first in the plugin array (see `vite.config.ts`)

### File System Sync Architecture
- Local FS is source of truth, WebContainers mirrors it via `SyncManager` in `src/lib/filesystem/sync-manager.ts`
- Sync excludes: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`
- Uses File System Access API with permission lifecycle management (`src/lib/filesystem/permission-lifecycle.ts`)
- Project metadata stored in IndexedDB via `project-store.ts`

### Testing Structure
- Tests are co-located with source files in `__tests__` directories (e.g., `src/lib/filesystem/__tests__/`)
- Uses Vitest with mocks for File System Access API
- Test files follow naming pattern `*.test.ts` or `*.test.tsx`

### Route Generation
- TanStack Router generates `src/routeTree.gen.ts` automatically
- VS Code settings mark this file as read-only and exclude from watcher/search
- Do not manually edit `routeTree.gen.ts`

### TypeScript Configuration
- Uses `verbatimModuleSyntax: false` (not strict ESM)
- Path alias `@/*` maps to `./src/*`
- Strict TypeScript with `noUnusedLocals` and `noUnusedParameters` enabled

### IDE Workspace Context
- Workspace state managed via React Context in `src/lib/workspace/WorkspaceContext.tsx`
- Uses TanStack Store for state management
- File operations go through `LocalFSAdapter` and `SyncManager`

## Code Style & Conventions

### Import Order
- React imports first
- Third-party libraries next
- Internal modules with `@/` alias
- Relative imports last

### Error Handling
- Custom error classes in `src/lib/filesystem/sync-types.ts` (`SyncError`, `PermissionDeniedError`, `FileSystemError`)
- Use `try/catch` with specific error types rather than generic Error

### Component Structure
- Components in `src/components/` organized by feature (ide/, ui/, layout/)
- Each component directory has `index.ts` barrel exports
- Use TypeScript interfaces for props with `interface` rather than `type` for better error messages

### File Naming
- PascalCase for React components and TypeScript types
- camelCase for utilities and hooks
- kebab-case for test files (e.g., `local-fs-adapter.test.ts`)

## Gotchas & Warnings

1. **WebContainer Singleton**: Only one WebContainer instance can be booted per page (singleton pattern in `src/lib/webcontainer/manager.ts`)
2. **FSA Permissions**: File System Access API permissions are ephemeral; use `permission-lifecycle.ts` utilities to manage persistence
3. **Route Tree**: Never edit `src/routeTree.gen.ts` directly; it's auto-generated by TanStack Router plugin
4. **Cross-Origin Headers**: Missing COOP/COEP headers will break WebContainers in dev mode
5. **Sync Exclusions**: `.git` and `node_modules` are excluded from sync to WebContainers (they'll be regenerated)
6. **IndexedDB Schema**: Project metadata schema is in `src/lib/workspace/project-store.ts`; changes require migration
7. **Test Mocks**: Tests mock `window.showDirectoryPicker` and File System Access API globally
8. **Terminal Working Directory**: The shell spawns at WebContainer root by default. Pass `projectPath` to `XTerminal` or `adapter.startShell(projectPath)` to set the working directory. Without this, commands like `npm install` won't find your `package.json`.
9. **No Reverse Sync**: Changes inside WebContainer (e.g., `npm install` creating `node_modules`) do NOT sync back to local drive by design. The local FS is source of truth.
10. **Sync Exclusions Active**: `.git` and `node_modules` are excluded from sync. This is intentional - they are regenerated within the WebContainer sandbox.

## Development Workflow

1. **Starting**: Run `pnpm dev` (automatically sets required headers)
2. **Testing**: Run `pnpm test` for unit tests
3. **Building**: Run `pnpm build` (outputs to `dist/`)
4. **Preview**: Run `pnpm preview` to test production build locally

## CI/CD Development & Git Workflow

### Story Development Cycle
After each completed story following the **story-dev-cycle** workflow:
1. **Run tests**: Ensure all tests pass with `pnpm test`
2. **Stage changes**: `git add .` (respects `.gitignore`)
3. **Commit with story ID**: `git commit -m "feat(epic-N): Story N-X - [Story Title]"`

### Commit Message Format
Follow conventional commits with epic/story context:
```
feat(epic-13): Story 13-1 - Fix Terminal Working Directory
fix(epic-13): Story 13-2 - Fix Auto-Sync on Project Load
docs(governance): Update sprint-status.yaml with Story 13-6
chore(bmad): Course correction - Add Story 13-6 for Preview in New Tab
```

### Branch Strategy
- **Feature branches**: Created after completing an entire Epic (not per-story)
- **Naming**: `epic-N/story-sprint` (e.g., `epic-13/terminal-sync-stability`)
- **Trigger**: Run branch creation after `/bmad-bmm-workflows-retrospective` workflow

### Epic Completion Branch Workflow
```bash
# After epic retrospective is complete:
git checkout -b epic-N/descriptive-name
git push -u origin epic-N/descriptive-name
```

### Files Excluded from Git (via .gitignore)
- `node_modules/`
- `dist/`
- `.next/`
- `.turbo/`
- `*.local`
- `.env*`

## Key Directories

- `src/lib/filesystem/` - File system sync and FSA utilities
- `src/lib/webcontainer/` - WebContainer lifecycle and process management
- `src/lib/workspace/` - Workspace state and project persistence
- `src/components/ide/` - Monaco editor, file tree, terminal, preview panel
- `src/routes/` - TanStack Router file-based routes
- `src/data/` - Demo data and fixtures