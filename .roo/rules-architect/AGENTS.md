# Project Architecture Rules (Non-Obvious Only)

- Providers MUST be stateless - hidden caching layer assumes this
- Webview and extension communicate through specific IPC channel patterns only
- Database migrations cannot be rolled back - forward-only by design
- React hooks required because external state libraries break webview isolation
- Monorepo packages have circular dependency on types package (intentional)

## Architectural Constraints

- **WebContainer Singleton**: Only one instance per page (singleton pattern)
- **File System Sync**: Local FS is source of truth, no reverse sync
- **State Management**: TanStack Store + React Context, not Redux
- **Routing**: TanStack Router with auto-generated route tree
- **Internationalization**: Dual system (extension vs webview UI)

## Performance Considerations

- WebContainer boot is expensive (≈3-5 seconds)
- File sync uses debounced batch operations
- Large `node_modules` directories excluded from sync
- Monaco Editor loads languages/features on-demand

## Integration Points

- File operations: `LocalFSAdapter` → `SyncManager` pipeline
- State management: `WorkspaceContext` React Context
- WebContainer: Singleton manager in `webcontainer-manager.ts`
- Terminal: `XTerminal` component with `projectPath` requirement