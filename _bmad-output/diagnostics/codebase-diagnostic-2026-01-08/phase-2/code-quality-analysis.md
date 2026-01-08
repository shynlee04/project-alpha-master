## Code Quality & Patterns Analysis

### Configuration
- **Linter**: ESLint (Hybrid/Migration state: `.eslintrc.json` and `eslint.config.mjs` both present)
- **Formatter**: Prettier (`.prettierrc` present)

### Code Hygiene Indicators
| Indicator | Count | Status | Analysis |
|-----------|-------|--------|----------|
| `TODO` | 149 | 🟡 Moderate | Significant backlog of tasks/refactors. |
| `FIXME` | 0 | 🟢 Excellent | No explicit "broken" code markers. |
| `console.log` | 902 | 🔴 Critical | Excessive usage in source code. Suggests lack of proper logging abstraction or debugging code left in production. |

### Type Safety (TypeScript)
| Pattern | Count | Status | Analysis |
|---------|-------|--------|----------|
| `: any` | 366 | 🟠 High | Explicit `any` typing weakens type safety. |
| `as any` | 610 | 🔴 Critical | High reliance on type casting/assertions. |
| `@ts-ignore` | 4 | 🟢 Good | Minimal use of brute-force suppression. |
| `@ts-expect-error`| 35 | 🟡 Moderate | Preferable to ignore, but indicates unresolved type conflicts. |
| **Total 'any'** | **976** | 🔴 Critical | Nearly 1000 instances of type bypass. |

### Testing Status
- **Test Files**: 171 (`.test.ts` / `.test.tsx`)
- **Source Files**: ~1,564
- **File Ratio**: ~1:9 (Test:Source)
- **Observation**: Test coverage appears low based on file ratio. A 10-15% ratio usually correlates with <50% code coverage.

### Recommendations
1.  **Logging Strategy**: Implement a structured logging service (e.g., `src/lib/logger`) and replace `console.log` calls. Enforce `no-console` rule in ESLint.
2.  **Type Safety Campaign**:
    *   Audit `as any` usages. Many are likely quick fixes for complex types.
    *   Enable `no-explicit-any` in ESLint to prevent new additions.
3.  **ESLint Migration**: Consolidate to `eslint.config.mjs` (Flat Config) and remove `.eslintrc.json` to avoid confusion.
4.  **Test Coverage**: Prioritize adding tests for "God Files" identified in Phase 0 (e.g., `template-registry.ts`, `dexie-db.ts`).
