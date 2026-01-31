# Codebase Structure

**Analysis Date:** 2026-01-31

## Directory Layout

```
project-alpha-master/
├── src/                       # Source code
│   ├── domain/                # Business logic layer (Clean Architecture)
│   ├── infrastructure/        # External interfaces layer
│   ├── presentation/          # UI components and layouts
│   ├── routes/                # TanStack Router routes
│   ├── plugins/               # Feature plugins (filetree, monaco, notes, etc.)
│   ├── hooks/                 # LEGACY: Shared React hooks (→ migrate to presentation/hooks)
│   ├── lib/                   # LEGACY: Utilities (→ migrate to domain/infrastructure)
│   ├── i18n/                  # Internationalization
│   ├── core/                  # LEGACY: Core entities (→ migrate to domain/entities)
│   ├── e2e/                   # E2E test utilities
│   └── __tests__/             # Root-level tests
├── .planning/                 # GSD planning artifacts
│   └── codebase/              # Codebase analysis documents
├── _bmad-output/              # BMAD framework outputs
│   ├── planning-artifacts/    # ADRs, epics, architecture docs
│   └── governance/            # Governance reports
├── _bmad/                     # BMAD framework core
├── _bmad-ext/                 # BMAD extensions
├── .opencode/                 # OpenCode agent configuration
│   ├── agents/                # Agent role definitions
│   ├── skills/                # Agent skill definitions
│   └── plugins/               # OpenCode plugins
├── public/                    # Static assets
├── test-cases/                # Manual test cases
└── [IDE configs]              # .cursor/, .windsurf/, .gemini/, etc.
```

## Directory Purposes

**`src/domain/`:**
- Purpose: Pure business logic with no external dependencies
- Contains: Entities, services, types, interfaces, value objects
- Key files:
  - `entities/project.ts` - Project entity definition
  - `entities/agent.ts` - Agent entity
  - `interfaces/feature-plugin.interface.ts` - Plugin contract
  - `interfaces/storage-adapter.interface.ts` - Storage abstraction
  - `interfaces/storage-gateway.interface.ts` - File operation facade
  - `types/plugin-types.ts` - Plugin ID union types
  - `services/ProjectRegistry.ts` - Project management service

**`src/infrastructure/`:**
- Purpose: External integrations, persistence, platform adapters
- Contains: Database, stores, filesystem adapters, event bus, sync services
- Key files:
  - `persistence/dexie-db.ts` - Dexie database configuration
  - `persistence/stores/` - Zustand stores (58+ files)
  - `filesystem/fsa-storage-adapter.ts` - FSA adapter
  - `filesystem/StorageAdapterFactory.ts` - Adapter factory
  - `context/project-context.tsx` - ProjectContextProvider
  - `plugins/plugin-registry.ts` - Plugin registration
  - `events/event-bus.ts` - Domain event pub/sub

**`src/presentation/`:**
- Purpose: React UI components and presentation logic
- Contains: Components, hooks, layouts
- Key files:
  - `components/layout/ResponsiveLayout.tsx` - Main layout grid
  - `components/layout/PluginPanelContainer.tsx` - Plugin rendering
  - `components/layout/ActivityBarLeft.tsx` - Left activity bar
  - `components/common/AppErrorBoundary.tsx` - Error handling
  - `layouts/PluginLayoutStore.ts` - Layout state (Zustand)
  - `hooks/useLayoutState.ts` - Layout hook

**`src/routes/`:**
- Purpose: TanStack Router route definitions
- Contains: Route components with loaders, API routes
- Key files:
  - `__root.tsx` - Root route with providers
  - `$projectId.tsx` - Main project route (ADR-034)
  - `settings.tsx` - Settings page
  - `projects.tsx` - Project list
  - `api/chat.ts` - Chat API route
  - `api/providers.ts` - Provider API routes

**`src/plugins/`:**
- Purpose: Feature plugin implementations
- Contains: Plugin definitions implementing FeaturePlugin interface
- Key files:
  - `filetree/FileTreePlugin.tsx` - File browser plugin
  - `monaco/MonacoPlugin.tsx` - Code editor plugin
  - `notes/` - Notes editor plugin
  - `terminal/` - Terminal plugin
  - `chat/` - Chat plugin
  - `preview/` - Preview plugin

**`src/i18n/`:**
- Purpose: Internationalization configuration
- Contains: Locale files, i18next setup
- Key files:
  - `LocaleProvider.tsx` - i18n React provider
  - `en/` - English translations
  - `vi/` - Vietnamese translations

## Key File Locations

**Entry Points:**
- `src/router.tsx`: Router singleton creation
- `src/routes/__root.tsx`: App bootstrap, providers, global UI
- `src/routes/$projectId.tsx`: Main project route (renders everything)
- `src/server.ts`: SSR server entry

**Configuration:**
- `tsconfig.json`: TypeScript configuration with path aliases
- `vite.config.ts`: Vite build configuration
- `app.config.ts`: TanStack Start configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `eslint.config.js`: ESLint rules

**Core Logic:**
- `src/infrastructure/context/project-context.tsx`: Central project provider
- `src/infrastructure/plugins/plugin-registry.ts`: Plugin management
- `src/infrastructure/persistence/dexie-db.ts`: Database schema
- `src/presentation/layouts/PluginLayoutStore.ts`: Layout state

**Testing:**
- `src/__tests__/`: Root-level tests
- `src/test/setup.ts`: Vitest setup
- `vitest.config.ts`: Vitest configuration
- `*/__tests__/`: Co-located tests per directory

**Styles:**
- `src/styles.css`: Main stylesheet entry
- `src/styles/design-tokens.css`: CSS custom properties
- Component CSS: Co-located `.css` files

## Naming Conventions

**Files:**
- `kebab-case.ts` for all TypeScript files (NOT PascalCase)
- `Component.tsx` for React components (exception to kebab-case)
- `use[Feature].ts` for custom hooks
- `[feature]-store.ts` for Zustand stores
- `[name].interface.ts` for interfaces
- `[name].test.ts` or `[name].test.tsx` for tests

**Directories:**
- `kebab-case/` for all directories
- `__tests__/` for co-located test directories
- `_[name]/` for meta directories (underscore prefix)

**Components:**
- PascalCase for component names
- Props interface: `[ComponentName]Props`
- Export component name matches filename

## Where to Add New Code

**New Feature Plugin:**
1. Create directory: `src/plugins/[pluginname]/`
2. Add files:
   - `[PluginName]Plugin.tsx` - Main plugin component
   - `index.ts` - Public exports
   - `types.ts` - Plugin types
   - `use[PluginName]Plugin.ts` - Plugin hook
3. Register in `src/infrastructure/plugins/plugin-registry.ts`
4. Add plugin ID to `src/domain/types/plugin-types.ts`

**New Domain Entity:**
- Primary code: `src/domain/entities/[entity-name].ts`
- Tests: `src/domain/entities/__tests__/[entity-name].test.ts`
- Types: `src/domain/types/[entity-name].ts`

**New React Component:**
- UI primitives: `src/presentation/components/ui/[component-name].tsx`
- Feature components: `src/presentation/components/[feature]/[ComponentName].tsx`
- Layout components: `src/presentation/components/layout/[ComponentName].tsx`
- Tests: Same directory in `__tests__/` subdirectory

**New Infrastructure Service:**
- Implementation: `src/infrastructure/[category]/[service-name].ts`
- Categories: `persistence/`, `filesystem/`, `sync/`, `events/`, `services/`

**New Zustand Store:**
- Location: `src/infrastructure/persistence/stores/[feature]-store.ts`
- Must follow governance: ≤300 lines
- Use `useShallow` for selectors

**New Route:**
- Location: `src/routes/[route-name].tsx`
- Follow TanStack Router conventions
- Use `createFileRoute()` or `createLazyFileRoute()`

**New Hook (Presentation):**
- Location: `src/presentation/hooks/use[Feature].ts`
- NOT in legacy `src/hooks/` (migrate existing)

**New API Route:**
- Location: `src/routes/api/[endpoint].ts`
- Follow TanStack Start API route conventions

## Special Directories

**`src/lib/` (LEGACY - Do Not Add New Code):**
- Purpose: Historical utilities and helpers
- Generated: No
- Committed: Yes
- Note: 654+ imports use `@/lib/` - migrate to canonical paths

**`src/hooks/` (LEGACY - Migrate to presentation/hooks):**
- Purpose: Shared React hooks
- Generated: No
- Committed: Yes
- Note: Should migrate to `src/presentation/hooks/`

**`src/core/` (LEGACY - Migrate to domain/):**
- Purpose: Core entities
- Generated: No
- Committed: Yes
- Note: Should migrate to `src/domain/entities/`

**`src/routeTree.gen.ts`:**
- Purpose: Auto-generated route tree
- Generated: Yes (by TanStack Router CLI)
- Committed: Yes
- Note: Do NOT edit manually

**`node_modules/`:**
- Purpose: Dependencies
- Generated: Yes (by pnpm)
- Committed: No

**`dist/`:**
- Purpose: Build output
- Generated: Yes (by Vite)
- Committed: No

**`.planning/`:**
- Purpose: GSD planning and analysis documents
- Generated: No (created by agents)
- Committed: Yes

**`_bmad-output/`:**
- Purpose: BMAD framework artifacts (ADRs, epics, specs)
- Generated: No (created by agents/users)
- Committed: Yes

## Path Aliases

Defined in `tsconfig.json`:

| Alias | Target | Status |
|-------|--------|--------|
| `@/*` | `./src/*` | Generic (avoid for new code) |
| `@/domain/*` | `./src/domain/*` | ✅ Canonical |
| `@/infrastructure/*` | `./src/infrastructure/*` | ✅ Canonical |
| `@/presentation/*` | `./src/presentation/*` | ✅ Canonical |

**Forbidden Imports:**
- `@/lib/*` → Migrate to `@/domain/*` or `@/infrastructure/*`
- `@/stores/*` → Never existed, use `@/infrastructure/persistence/stores/*`
- Relative imports crossing layers

## File Size Governance

| Type | Max Lines | Violation Count |
|------|-----------|-----------------|
| Stores | 300 | 30 god files exist |
| Components | 400 | Various violations |
| Services | 500 | Various violations |

Files exceeding limits should be split into focused modules.

## Important Root Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `pnpm-lock.yaml` | Lockfile |
| `tsconfig.json` | TypeScript config |
| `vite.config.ts` | Vite build config |
| `vitest.config.ts` | Test config |
| `tailwind.config.js` | Tailwind CSS |
| `AGENTS.md` | Agent constitution (governance) |
| `app.config.ts` | TanStack Start config |

---

*Structure analysis: 2026-01-31*
