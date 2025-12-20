# Project Coding Rules (Non-Obvious Only)

- Always use safeWriteJson() from src/utils/ instead of JSON.stringify for file writes (prevents corruption)
- API retry mechanism in src/api/providers/utils/ is mandatory (not optional as it appears)
- Database queries MUST use the query builder in packages/evals/src/db/queries/ (raw SQL will fail)
- Provider interface in packages/types/src/ has undocumented required methods
- Test files must be in same directory as source for vitest to work (not in separate test folder)

## Project-Specific Patterns

- **File Operations**: All file operations MUST go through `LocalFSAdapter` → `SyncManager` pipeline
- **Error Handling**: Use custom error classes (`SyncError`, `PermissionDeniedError`, `FileSystemError`) from `src/lib/filesystem/sync-types.ts`
- **Component Structure**: Each component directory must have `index.ts` barrel exports
- **TypeScript**: Use `interface` for props, not `type` aliases (better error messages)
- **Imports**: Follow strict order: React → third-party → internal (`@/`) → relative

## Hidden Dependencies

- Webview and extension communicate through specific IPC channel patterns only
- Database migrations cannot be rolled back - forward-only by design
- React hooks required because external state libraries break webview isolation
- Monorepo packages have circular dependency on types package (intentional)