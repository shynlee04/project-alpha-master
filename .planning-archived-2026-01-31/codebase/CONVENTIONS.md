# Coding Conventions

**Analysis Date:** 2026-01-31

## Naming Patterns

**Files:**
- kebab-case for all TypeScript files: `sidebar-store.ts`, `project-card.tsx`, `use-fsa-projects.ts`
- Test files use `.test.ts` or `.test.tsx` suffix co-located or in `__tests__/` subdirectory
- Spec files use `.spec.ts` for E2E tests (Playwright)
- Index files for barrel exports: `index.ts`
- Slice pattern for store modules: `*-slice.ts` (e.g., `canvas-state-slice.ts`, `git-operations-slice.ts`)

**Functions:**
- camelCase: `getEnabledWorkspaces()`, `loadPersistedState()`, `validatePersistedState()`
- Verb-noun pattern: `handleWorkspaceClick()`, `toggleSidebar()`, `setExpanded()`
- Boolean getters: `shouldAutoCollapse()`, `getViewportState()`

**Variables:**
- camelCase: `isExpanded`, `activeWorkspace`, `boundWorkspaces`
- Constants: SCREAMING_SNAKE_CASE: `SIDEBAR_STORAGE_KEY`, `TOGGLE_DEBOUNCE_MS`, `DEFAULT_SIDEBAR_STATE`
- Refs: `toggleTimeoutRef`, `lastToggleTimeRef`

**Types/Interfaces:**
- PascalCase: `SidebarState`, `ProjectCardProps`, `WorkspaceBindings`
- Type vs Interface: Use `interface` for object shapes, `type` for unions/aliases
- Props suffix for component props: `ProjectCardProps`, `WorkspaceBadgeProps`
- Return type suffix: `UseSidebarStateReturn`

**Components:**
- PascalCase for component names: `ProjectCard`, `WorkspaceBadge`, `SidebarStore`
- Function component pattern: `export const ComponentName: React.FC<Props> = ({...}) => {...}`

## Code Style

**Formatting:**
- Tool: Prettier
- Config: `.prettierrc`
- Key settings:
  - Semi: `true` (semicolons required)
  - Single quotes: `false` (use double quotes)
  - Trailing comma: `es5`
  - Print width: 80
  - Tab width: 2
  - Arrow parens: `avoid` (omit when possible)
  - End of line: `lf`
  - JSX quotes: double

**Linting:**
- Tool: ESLint with flat config (`eslint.config.mjs`)
- TypeScript: `typescript-eslint` recommended rules
- React: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Key rules:
  - `@typescript-eslint/no-unused-vars`: warn (ignore `_` prefix)
  - `@typescript-eslint/no-explicit-any`: warn
  - `no-console`: warn (allow `warn`, `error`, `info`, `debug`)
  - `react-refresh/only-export-components`: warn

## Import Organization

**Order:**
1. Node/built-in modules (if any)
2. External packages (`react`, `zustand`, `@tanstack/*`, etc.)
3. Internal aliases (`@/infrastructure/*`, `@/presentation/*`, `@/domain/*`)
4. Relative imports (same module/directory)

**Path Aliases:**
- `@/*` → `./src/*`
- `@/domain/*` → `./src/domain/*`
- `@/infrastructure/*` → `./src/infrastructure/*`
- `@/presentation/*` → `./src/presentation/*`
- `@/core/entities/*` → specific entity paths (legacy, being migrated)

**FORBIDDEN Paths (from AGENTS.md):**
- `@/lib/*` → Use `@/infrastructure/*` or `@/domain/*` instead
- `@/stores/*` → Does not exist
- Relative imports crossing architectural layers

**Example:**
```typescript
// External
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';

// Internal aliases
import type { SidebarState } from '@/presentation/components/layout/types';
import { SIDEBAR_STORAGE_KEY } from '@/presentation/components/layout/types';

// Relative (same module)
import { validatePersistedState } from './validation';
```

## Error Handling

**Patterns:**
- Try-catch with conditional logging based on environment:
```typescript
try {
  const stored = localStorage.getItem(KEY);
  // ... processing
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[module-name] Error description:', error);
  }
  return null; // or default value
}
```

- Zod for runtime validation with `.safeParse()`:
```typescript
const result = schema.safeParse(data);
if (!result.success) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[module] Validation failed:', result.error.format());
  }
  return null;
}
return result.data;
```

- React Error Boundaries: `src/presentation/components/error/ErrorBoundary.tsx`
- Event listener cleanup in useEffect returns
- Ref-based cleanup for timeouts

## Logging

**Framework:** Console with module prefix pattern

**Patterns:**
- Module prefix in brackets: `[sidebar-store]`, `[ProjectCard]`
- Environment-gated logs:
```typescript
if (process.env.NODE_ENV !== 'production') {
  console.log('[module] Message');
}
```
- Use appropriate level:
  - `console.log()` - Debug/info (dev only)
  - `console.warn()` - Warnings (dev only)
  - `console.error()` - Errors (may appear in prod for Sentry)

## Comments

**When to Comment:**
- File headers with JSDoc: `@fileoverview`, `@module`, `@updated`, `@governance`
- Complex business logic or non-obvious code
- CRITICAL FIX notes with date: `// CRITICAL FIX (2026-01-09): Description`
- TODO/FIXME for known issues

**JSDoc/TSDoc:**
- File-level documentation:
```typescript
/**
 * @fileoverview Sidebar State Store
 * @module infrastructure/persistence/stores/layout/sidebar-store
 * @updated 2026-01-30
 *
 * Description of the module's purpose.
 * @governance Reference to governance doc if applicable
 */
```

- Function documentation:
```typescript
/**
 * Get current sidebar width based on state
 * @param isExpanded Whether sidebar is expanded
 * @returns Width in pixels (200 for expanded, 48 for collapsed)
 */
```

## Function Design

**Size:**
- Functions should be focused and single-purpose
- Store action handlers: 5-15 lines typically
- Utility functions: prefer under 30 lines
- Complex logic extracted to helper functions

**Parameters:**
- Destructure props in function signature: `({ project, onOpen, className })`
- Use TypeScript for explicit typing
- Default values in destructuring: `(timeout: number = 30000)`

**Return Values:**
- Explicit return types on exported functions and hooks
- Objects for multiple return values (especially hooks)
- `null` for "not found" / validation failures
- Partial types for optional returns

## Module Design

**Exports:**
- Named exports preferred: `export const useSidebarStore = create<...>()`
- Default exports for React components optionally (but named preferred)
- Re-export via barrel files: `index.ts`

**Barrel Files:**
- `src/infrastructure/persistence/stores/index.ts` - Central store exports
- Re-export hooks and utilities for clean imports:
```typescript
export { useLiveQuery } from 'dexie-react-hooks';
export { useProjectStore } from './project/useProjectStore';
```

## Zustand Patterns (CRITICAL)

**Store Creation:**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create<StoreType>()(
  persist(
    (set) => ({
      // State
      ...DEFAULT_STATE,
      // Actions
      action: () => set((state) => ({ ...state, value: newValue })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: STATE_VERSION,
      partialize: (state) => ({ /* fields to persist */ }),
      migrate: (persisted, version) => { /* migration logic */ },
    }
  )
);
```

**useShallow - MANDATORY for Object Selectors:**
```typescript
import { useShallow } from 'zustand/react/shallow';

// CORRECT - prevents infinite re-renders
const { items, addItem } = useStore(
  useShallow((state) => ({ items: state.items, addItem: state.addItem }))
);

// WRONG - causes infinite loops with object/array selectors
const state = useStore((state) => ({ items: state.items }));
```

**Individual Selectors for Single Values:**
```typescript
// OK without useShallow for primitive values
const isExpanded = useSidebarStore((state) => state.isExpanded);
const setExpanded = useSidebarStore((state) => state.setExpanded);
```

## Dexie/IndexedDB Patterns

**useLiveQuery for Reactive Data:**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';

// Always call at top level (no conditionals)
const projects = useLiveQuery(() => db.projects.toArray(), []);
```

**Async Query Pattern:**
```typescript
const browserProject = useLiveQuery(async () => {
  const projects = await db.projects.toArray();
  return projects.find(p => p.isBrowserMode);
}, []);
```

## 8-Bit Design System (NON-NEGOTIABLE)

**REQUIRED Styles:**
```css
border-radius: 0;              /* Sharp corners - PRIMARY RULE */
border-radius: 2px;            /* Maximum allowed rounding */
box-shadow: 4px 4px 0 0;       /* Pixel shadows */
animation-timing-function: steps(N, end);  /* 8-bit timing */
```

**FORBIDDEN:**
```css
border-radius: 0.5rem;         /* Too rounded */
backdrop-filter: blur();       /* Glassmorphism */
opacity: 0.8;                  /* Use solid colors */
```

**Tailwind Classes:**
- `rounded-none` or `rounded-sm` only
- `shadow-pixel` custom utility
- `font-pixel` for 8-bit typography

## File Size Limits (Governance)

| Type | Max Lines | Action if Exceeded |
|------|-----------|-------------------|
| Stores | 300 | Split into slices immediately |
| Components | 400 | Extract hooks/composables |
| Services | 500 | Decompose by responsibility |

Enforcement: `pnpm governance:size` script

## TypeScript Strictness

**Compiler Settings (tsconfig.json):**
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- Target: ES2022, JSX: react-jsx

**Fast Typecheck:**
- Use `pnpm typecheck:fast` (tsgo native compiler)
- Watch mode: `pnpm typecheck:watch`

---

*Convention analysis: 2026-01-31*
