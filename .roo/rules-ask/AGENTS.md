# Project Documentation Rules (Non-Obvious Only)

- "src/" contains VSCode extension code, not source for web apps (counterintuitive)
- Provider examples in src/api/providers/ are the canonical reference (docs are outdated)
- UI runs in VSCode webview with restrictions (no localStorage, limited APIs)
- Package.json scripts must be run from specific directories, not root
- Locales in root are for extension, webview-ui/src/i18n for UI (two separate systems)

## Documentation Gotchas

- **Component Structure**: Components organized by feature (ide/, ui/, layout/) not by type
- **File Naming**: Test files use kebab-case (e.g., `local-fs-adapter.test.ts`)
- **Import Order**: Strict convention: React → third-party → internal (`@/`) → relative
- **Error Handling**: Custom error classes in `src/lib/filesystem/sync-types.ts`
- **State Management**: TanStack Store + React Context, not Redux or other libraries