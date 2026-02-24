# Automated Type Safety & Contract Management

**Date:** 2026-01-28  
**Status:** ✅ Configuration Complete  
**Framework:** TanStack Start with Type-First Architecture

---

## 🎯 Problem Statement

TanStack Start's type-safe routing and data loading creates complex cross-dependencies that are a nightmare for AI agents:

1. **Route Loaders** must match component props exactly
2. **API Contracts** drift between frontend and backend
3. **Zod Schemas** and TypeScript types get out of sync
4. **Store Slices** have implicit dependencies
5. **Data Flow** is hard to trace across layers

---

## 🚀 Solution: Automated Type Safety Pipeline

This configuration provides **automated tooling** to keep types, schemas, and contracts synchronized without manual intervention.

---

## 📦 Installed Tools

### 1. **Type Generation & Validation**

| Tool | Purpose | Command |
|------|---------|---------|
| `generate-contract-types.js` | Auto-generate types from Zod schemas & routes | `pnpm types:generate` |
| `validate-type-contracts.js` | Validate consistency across the codebase | `pnpm types:validate` |
| `auto-fix-types.js` | Auto-fix common TypeScript issues | `pnpm types:fix` |
| `sync-schemas.js` | Keep Zod schemas and TS types in sync | `pnpm schema:sync` |

### 2. **Dependency Analysis**

| Tool | Purpose | Command |
|------|---------|---------|
| `madge` | Visualize and check dependencies | `pnpm deps:visualize` |
| `madge --circular` | Detect circular dependencies | `pnpm deps:circular` |

### 3. **File Watching**

| Tool | Purpose | Command |
|------|---------|---------|
| `chokidar` | Watch files and auto-regenerate | `pnpm types:watch` |

---

## 🛠️ Available Commands

### Type Generation & Validation

```bash
# Generate types from schemas and routes
pnpm types:generate

# Validate all type contracts
pnpm types:validate

# Auto-fix common type issues (dry-run)
pnpm types:fix

# Apply auto-fixes
pnpm types:fix --apply

# Watch files and auto-regenerate
pnpm types:watch
```

### Schema Synchronization

```bash
# Sync Zod schemas with TypeScript types
pnpm schema:sync

# Full contract check (validate + sync)
pnpm contracts:check
```

### Dependency Analysis

```bash
# Generate dependency graph
pnpm deps:visualize

# Check for circular dependencies
pnpm deps:circular
```

---

## 🔍 What Gets Validated

### 1. **Route Loader Consistency**

✅ **Validates:** All route loaders have explicit return types  
✅ **Prevents:** Implicit `any` return types in loaders

**Example Issue:**
```typescript
// ❌ Missing return type
loader: async ({ params }) => {
  return { project: await fetchProject(params.id) }
}

// ✅ Explicit return type
loader: async ({ params }): Promise<{ project: Project }> => {
  return { project: await fetchProject(params.id) }
}
```

### 2. **Schema Validation at Boundaries**

✅ **Validates:** All API boundaries use Zod validation  
✅ **Prevents:** Runtime errors from untyped data

**Example Issue:**
```typescript
// ❌ No validation
function saveProject(data: any) { ... }

// ✅ Zod validation
const ProjectSchema = z.object({ id: z.string(), name: z.string() })
function saveProject(data: unknown) {
  const project = ProjectSchema.parse(data)
  // ...
}
```

### 3. **Store Slice Consistency**

✅ **Validates:** Zustand stores use `useShallow` optimization  
✅ **Prevents:** Unnecessary re-renders

**Example Issue:**
```typescript
// ❌ No useShallow
const items = useStore(s => s.items)
const addItem = useStore(s => s.addItem)

// ✅ useShallow
const { items, addItem } = useStore(
  useShallow(s => ({ items: s.items, addItem: s.addItem }))
)
```

### 4. **Route Params Sync**

✅ **Validates:** Route params match loader parameter types  
✅ **Prevents:** Mismatched route parameters

**Example Issue:**
```typescript
// Route: /$projectId/settings
// ❌ Loader doesn't use params
loader: async () => { ... }

// ✅ Loader destructures params
loader: async ({ params }) => { 
  const { projectId } = params
  ...
}
```

---

## 🔄 Automated Workflows

### Pre-Commit Hook (Recommended)

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate type contracts
pnpm types:validate || exit 1

# Check for circular dependencies
pnpm deps:circular || exit 1
```

### CI/CD Pipeline

```yaml
# .github/workflows/type-check.yml
name: Type Safety

on: [push, pull_request]

jobs:
  type-safety:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Generate contract types
        run: pnpm types:generate
      
      - name: Validate type contracts
        run: pnpm types:validate
      
      - name: Check for circular dependencies
        run: pnpm deps:circular
      
      - name: Type check with native compiler
        run: pnpm typecheck:fast
```

### Watch Mode (Development)

```bash
# Terminal 1: Watch and regenerate types
pnpm types:watch

# Terminal 2: Watch and sync schemas
pnpm schema:watch

# Terminal 3: Run dev server
pnpm dev
```

---

## 📁 Generated Files

The automation generates files in `src/generated/`:

```
src/generated/
├── index.ts              # Re-exports all generated types
├── contract-types.ts     # Types from Zod schemas & routes
└── README.md             # Auto-generated documentation
```

**Example Generated Types:**

```typescript
// src/generated/contract-types.ts
// AUTO-GENERATED FILE - DO NOT EDIT

// ============================================================================
// Schema Types
// ============================================================================

export type Project = z.infer<typeof import('../domain/schemas/project').ProjectSchema>;
export type User = z.infer<typeof import('../domain/schemas/user').UserSchema>;

// ============================================================================
// Route Types
// ============================================================================

export type ProjectIdParams = {
  projectId: string;
};

export type ProjectIdLoaderData = Promise<{ project: Project }>;
```

---

## 🎨 Architecture Patterns

### 1. **Contract-First Development**

Define contracts before implementation:

```typescript
// src/contracts/project-contract.ts
export const ProjectContract = {
  // Input schema
  input: z.object({
    id: z.string().uuid(),
  }),
  
  // Output schema
  output: z.object({
    project: ProjectSchema,
    files: z.array(FileSchema),
  }),
}

// Type is auto-generated!
export type ProjectContractInput = z.infer<typeof ProjectContract.input>
export type ProjectContractOutput = z.infer<typeof ProjectContract.output>
```

### 2. **Single Source of Truth**

Zod schemas are the source of truth:

```typescript
// src/domain/schemas/project.ts
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.date(),
})

// Type is auto-generated from schema
// export type Project = z.infer<typeof ProjectSchema>
```

### 3. **Route Type Inference**

Route loaders automatically generate types:

```typescript
// src/routes/$projectId.tsx
export const Route = createFileRoute('/$projectId')({
  loader: async ({ params }): Promise<{ project: Project }> => {
    return { project: await fetchProject(params.projectId) }
  },
})

// Types are auto-generated:
// - ProjectIdParams = { projectId: string }
// - ProjectIdLoaderData = { project: Project }
```

---

## 🔧 Configuration Files

### `type-automation.config.json`

```json
{
  "schemaDirs": [
    "src/domain/**/schemas/*.ts",
    "src/infrastructure/**/schemas/*.ts"
  ],
  "routePattern": "src/routes/**/*.tsx",
  "outputDir": "src/generated",
  "contractFiles": [
    "src/infrastructure/filesystem/platform-contract.ts"
  ]
}
```

### Custom Validation Rules

Add custom rules to `scripts/validate-type-contracts.js`:

```javascript
const VALIDATION_RULES = {
  myCustomRule: {
    name: 'My Custom Rule',
    description: 'Description of what this validates',
    async validate() {
      const issues = []
      // Your validation logic here
      return issues
    },
  },
}
```

---

## 📊 Validation Output

### Success

```
🔍 Validating type contracts...

  Route Loader Consistency
  All route loaders must have explicit return types
  ✓ Passed

  Schema Validation at Boundaries
  All API boundaries should use Zod validation
  ✓ Passed

  Store Slice Consistency
  All Zustand stores should follow the same pattern
  ✓ Passed

════════════════════════════════════════════════════════════
✅ All type contracts validated successfully!
```

### With Issues

```
🔍 Validating type contracts...

  Route Loader Consistency
  ✗ $projectId.tsx: Loader should have explicit return type
  ⚠ settings.tsx: Consider adding explicit return type

  Schema Validation at Boundaries
  ✓ Passed

════════════════════════════════════════════════════════════
⚠️  Found 1 errors and 1 warnings
```

---

## 🚀 Quick Start for AI Agents

### Before Writing Code

1. **Check existing contracts:**
   ```bash
   pnpm contracts:check
   ```

2. **Generate fresh types:**
   ```bash
   pnpm types:generate
   ```

### While Writing Code

1. **Use generated types:**
   ```typescript
   import type { Project, User } from '@/generated'
   ```

2. **Define Zod schemas first:**
   ```typescript
   const MySchema = z.object({ ... })
   type MyType = z.infer<typeof MySchema>
   ```

3. **Run validation:**
   ```bash
   pnpm types:validate
   ```

### Before Committing

1. **Full type check:**
   ```bash
   pnpm typecheck:fast
   ```

2. **Validate contracts:**
   ```bash
   pnpm contracts:check
   ```

3. **Check dependencies:**
   ```bash
   pnpm deps:circular
   ```

---

## 🎯 Benefits for AI Agents

| Problem | Solution |
|---------|----------|
| Type errors across files | Automated validation catches issues early |
| Schema/type drift | Auto-sync keeps them consistent |
| Route loader mismatches | Validation ensures params match |
| Circular dependencies | Automated detection with visualization |
| Implicit any types | Auto-fix suggests proper types |
| Cross-layer data flow | Generated types document contracts |

---

## 📚 Additional Resources

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [Zod Documentation](https://zod.dev)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [oRPC - Type-Safe APIs](https://orpc.dev)

---

**Configuration by:** BMAD Workflow Builder  
**Module:** MOD-C-SPRINT (Sprint & Feature Execution)  
**Framework:** BMAD v2.0.0
