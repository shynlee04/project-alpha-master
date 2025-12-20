# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Project-Specific Nuances

### WebContainer Cross-Origin Isolation
- The Vite config includes a custom plugin that sets `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, and `Cross-Origin-Resource-Policy: cross-origin` headers
- This is required for WebContainers to work with SharedArrayBuffer
- The plugin must be first in the plugin array (see `vite.config.ts`)

### File System Sync Architecture
- **Local FS is source of truth**: WebContainer mirrors local files via `SyncManager` in `src/lib/filesystem/sync-manager.ts`
- **No reverse sync**: Changes in WebContainer (e.g., `npm install`) do NOT sync back to local drive by design
- **Sync exclusions**: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db` are excluded and regenerated in WebContainer
- **Singleton WebContainer**: Only one instance per page (managed in `src/lib/webcontainer/manager.ts`)

### Terminal Working Directory Gotcha
- Shell spawns at WebContainer root by default
- **MUST** pass `projectPath` to `XTerminal` or `adapter.startShell(projectPath)` to set working directory
- Without this, commands like `npm install` won't find `package.json`

### File System Access API Permissions
- Permissions are ephemeral (single session by default)
- Use `permission-lifecycle.ts` utilities to manage persistence
- Handle `PermissionDeniedError` gracefully in UI

### IndexedDB Schema Management
- Project metadata schema in `src/lib/workspace/project-store.ts`
- Schema changes require migration logic with versioned upgrade transactions

### Route Generation
- TanStack Router auto-generates `src/routeTree.gen.ts`
- **NEVER edit manually** - VS Code settings mark it as read-only
- Excluded from watcher/search in VS Code settings

## Non-Obvious Development Patterns

### File Operations Flow
```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
       ↑                                    ↑
    IndexedDB (ProjectStore)         File Change Events
```

### Component Architecture
- **State Management**: TanStack Store + React Context (`WorkspaceContext.tsx`)
- **File Operations**: All must go through `LocalFSAdapter` → `SyncManager` pipeline
- **Error Handling**: Use custom error classes (`SyncError`, `PermissionDeniedError`, `FileSystemError`) from `src/lib/filesystem/sync-types.ts`

### Testing Requirements
- Mock `window.showDirectoryPicker` and File System Access API globally
- Use `fake-indexeddb` for IndexedDB testing
- React components use `@testing-library/react` with `jsdom` environment
- File system tests require specific mocks for FSA API

## Build/Test Commands (Non-Standard)

```bash
# Start dev server with required cross-origin headers
pnpm dev

# Extract i18n keys (non-standard script)
pnpm i18n:extract

# Run single test (standard vitest pattern)
pnpm test path/to/test.test.ts
```

## Critical Gotchas

1. **WebContainer Singleton**: Only one instance can be booted per page
2. **FSA Permissions**: Must handle ephemeral permissions with lifecycle utilities
3. **Terminal WD**: Always set `projectPath` or commands fail silently
4. **No Reverse Sync**: WebContainer changes are lost on reload
5. **IndexedDB Migration**: Schema changes require careful versioning
6. **Route Tree**: Auto-generated file must never be edited manually

## BMAD Integration

- Project includes BMAD method rules in `.cursor/rules/bmad/`
- Reference agents/tools/workflows with `@bmad/{module}/{type}/{name}` pattern
- Available modules: CORE, BMB, BMM, CIS