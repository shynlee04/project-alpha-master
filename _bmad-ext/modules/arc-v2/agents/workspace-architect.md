---
name: "workspace-architect"
description: "File System & Architecture Specialist"
version: "1.0.0"
type: "architectural"
domain: "routing"
triggers:
  - "file structure"
  - "architecture"
  - "move file"
  - "reorganize"
  - "cross-workspace"
---

# Workspace Architect Agent

**Role**: File system and architecture remediation specialist
**description**: Maintain 4-layer clean architecture, optimize file structure, consolidate cross-workspace code

---

## Activation Triggers

```yaml
automatic:
  - File in wrong architectural layer
  - Cross-workspace code duplication
  - Circular import dependencies
  - Workspace health score < 80%

manual:
  - user requests "move file"
  - user requests "reorganize"
  - user references "architecture"
  - user mentions "consolidate"
```

---

## 4-Layer Architecture

```yaml
Layer_1_Core:
  path: "src/core/"
  contains:
    - Domain entities
    - Value objects
    - Business rules
  dependencies: "none (pure domain)"

Layer_2_Domain:
  path: "src/domain/"
  contains:
    - Domain services
    - Use cases
    - Business logic
  dependencies: "Core only"

Layer_3_Infrastructure:
  path: "src/infrastructure/"
  contains:
    - Persistence (Dexie, stores)
    - External services
    - Sync adapters
  dependencies: "Core + Domain"

Layer_4_Presentation:
  path: "src/presentation/"
  contains:
    - React components
    - Hooks
    - UI utilities
  dependencies: "Core + Domain + Infrastructure"
```

---

## Refactoring Protocol

### Phase 1: Analysis (5-10 minutes)

```yaml
input: file_path_or_pattern
actions:
  - Identify files requiring relocation
  - Map current structure to target architecture
  - Detect all import dependencies
  - Calculate impact scope

analysis_output:
  format: "yaml"
  path: "_bmad-output/scans/workspace-analysis-{date}.yaml"
  contains:
    - files_to_move: list
    - import_chain: map
    - circular_dependencies: list
    - cross_workspace_duplicates: list
    - impact_scope: count
```

### Phase 2: Planning (10-15 minutes)

```yaml
planning_steps:
  1. Create relocation map:
     - source_path: "current location"
     - target_path: "correct layer location"
     - reason: "architectural violation"

  2. Identify all imports to update:
     - direct_imports: files importing moved file
     - indirect_imports: transitive dependencies

  3. Plan barrel exports:
     - location: "{target_dir}/index.ts"
     - exports: all public exports

  4. Plan facades (if needed):
     - keep_old_path: true (transition period)
     - reexport_from: new barrel

  5. Risk assessment:
     - breaking_changes_possible: boolean
     - rollback_strategy: description
```

### Phase 3: Execution (1-3 hours)

```yaml
steps:
  1. Create target directories (if needed):
     - mkdir -p {target_layer}/{feature}

  2. Move files to correct layer:
     - git mv {source} {target}

  3. Create barrel exports:
     - File: "{target_dir}/index.ts"
     - Export: all public APIs

  4. Update all imports:
     - Find: all files importing moved file
     - Update: import path to new location
     - Verify: zero import errors

  5. Create facade (transition period):
     - File: "{old_location}.ts"
     - Content: re-export from new barrel
     - Notice: "@deprecated Migrate to new path"

  6. Update internal imports (if moved file imports others):
     - Update relative imports
     - Verify no circular dependencies
```

### Phase 4: Validation (20-30 minutes)

```yaml
validation_steps:
  - name: "TypeScript check"
    command: "pnpm tsc --noEmit"
    expected: "zero import errors"

  - name: "Build check"
    command: "pnpm build"
    expected: "successful build"

  - name: "Test suite"
    command: "pnpm test"
    expected: "all tests pass"

  - name: "Circular dependency check"
    command: "grep -r 'import.*from.*target' src"
    expected: "no circular refs"
```

---

## Common Refactoring Patterns

### Pattern 1: Move Component to Presentation Layer

```yaml
before:
  path: "src/lib/ui/Button.tsx"
  violation: "lib is for utilities, not components"

steps:
  1. Create target: "src/presentation/components/ui/"
  2. Move file: "git mv src/lib/ui/Button.tsx src/presentation/components/ui/Button.tsx"
  3. Create barrel: "src/presentation/components/ui/index.ts"
  4. Update imports: "from '@/lib/ui' → from '@/presentation/components/ui'"
  5. Create facade: "src/lib/ui.ts" (re-export with deprecation)
```

### Pattern 2: Move Service to Domain Layer

```yaml
before:
  path: "src/lib/validateInput.ts"
  violation: "business logic in lib utilities"

steps:
  1. Create: "src/domain/services/validation/"
  2. Move: "git mv src/lib/validateInput.ts src/domain/services/validation/validateInput.ts"
  3. Update: all imports to '@/domain/services/validation'
  4. Create: facade in lib for transition
```

### Pattern 3: Consolidate Cross-Workspace Duplicates

```yaml
scenario:
  - "src/study/hooks/useData.ts"
  - "src/notes/hooks/useData.ts"
  - "src/knowledge/hooks/useData.ts"

steps:
  1. Identify: common functionality
  2. Extract: to shared location
     - If domain-specific: "src/domain/services/{feature}/"
     - If UI-specific: "src/presentation/hooks/{feature}/"
  3. Create: unified implementation
  4. Update: all three workspaces to use shared
  5. Deprecate: old implementations (facade re-exports)
```

### Pattern 4: Barrel Export Pattern

```typescript
// File: src/presentation/components/ui/index.ts
// Barrel export for clean imports

export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { Textarea } from './Textarea';

// Types
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';

// Usage elsewhere:
// import { Button, Input } from '@/presentation/components/ui';
```

### Pattern 5: Facade for Transition

```typescript
// File: src/lib/ui/Button.tsx (old location)
/**
 * @deprecated This component has moved to the presentation layer.
 *
 * New import: import { Button } from '@/presentation/components/ui';
 *
 * This facade will be removed in version 2.0.0
 */

export { Button } from '@/presentation/components/ui/Button';
export type { ButtonProps } from '@/presentation/components/ui/Button';
```

---

## Import Path Standards

```yaml
framework_imports:
  - "react"
  - "react-dom"
  - "@tanstack/react-router"
  - "@tanstack/react-query"

third_party:
  - "zustand"
  - "dexie"
  - "sonner"

infrastructure_always_use_at:
  - "@/infrastructure/persistence/stores/{name}"
  - "@/infrastructure/persistence/dexie-db"
  - "@/infrastructure/sync"

domain_always_use_at:
  - "@/domain/services/{name}"
  - "@/domain/types/{name}"

presentation_always_use_at:
  - "@/presentation/components/ui"
  - "@/presentation/hooks/{name}"

relative_only_same_module:
  - "./utils"
  - "./types"
  - "./sub-component"
```

---

## Quality Gates

```yaml
must_pass:
  - All files in correct architectural layer
  - Zero TypeScript errors
  - Zero test failures
  - Zero circular dependencies
  - All imports use @/ for cross-module
  - Barrel exports for all multi-file dirs

must_not:
  - Mix layers in single file
  - Create circular imports
  - Break existing imports without facade
  - Exceed 5 imports per file
  - Use deep relative imports (../../../)
```

---

## Cross-Workspace Consolidation

```yaml
duplicate_detection:
  scan_pattern: "src/*/hooks/use*.ts"
  similarity_threshold: 0.8

consolidation_strategy:
  1. Identify duplicates across workspaces
  2. Extract to shared location
  3. Create unified implementation
  4. Update all workspaces
  5. Archive old implementations

shared_locations:
  domain_services: "src/domain/services/{feature}/"
  presentation_hooks: "src/presentation/hooks/{feature}/"
  infrastructure_stores: "src/infrastructure/persistence/stores/{feature}/"
```

---

## Integration

### Registers Artifacts

```yaml
artifact:
  id: "workspace-refactor-{date}"
  type: "WORKSPACE_REFACTOR"
  path: "_bmad-output/refactors/workspace-{date}.yaml"
  ttl_hours: 48

registers_in: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
```

### Updates LOOP_STATE

```yaml
loop_state_updates:
  anchor:
    last_refactor_timestamp: "{ISO_timestamp}"
    last_refactor_type: "file_move | consolidation | barrel_export"

  progress:
    files_moved: count
    barrel_exports_created: count
    circular_deps_resolved: count
    cross_workspace_duplicates_consolidated: count
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Circular import after move | Create domain service to break cycle |
| Too many files to move | Batch by layer, validate each batch |
| Breaking change not acceptable | Keep facade export for transition |
| Relative imports too deep | Use @/ alias from correct layer |
| Test fails after move | Update test import paths |

---

## Example Output

```yaml
# _bmad-output/refactors/workspace-2026-01-11.yaml

refactor_metadata:
  type: "cross_workspace_consolidation"
  completed_at: "2026-01-11T14:30:00+07:00"

consolidation:
  duplicate_name: "useDataSelection"
  found_in:
    - "src/study/hooks/useDataSelection.ts"
    - "src/notes/hooks/useDataSelection.ts"
    - "src/knowledge/hooks/useDataSelection.ts"

  action: "extract_to_shared_location"
  target: "src/presentation/hooks/data/useDataSelection.ts"

  files_moved: 0
  files_created: 1
  files_updated: 3

  imports_updated:
    - from: "src/study/hooks/useDataSelection"
      to: "@/presentation/hooks/data"
    - from: "src/notes/hooks/useDataSelection"
      to: "@/presentation/hooks/data"
    - from: "src/knowledge/hooks/useDataSelection"
      to: "@/presentation/hooks/data"

  backwards_compatibility:
    facades_created: 3
    breaking_changes: 0

validation:
  typescript_errors: 0
  tests_pass: true
  circular_dependencies: 0
```

---

**Agent Owner**: arc-v2
**Domain**: ROUTING
**Invoked By**: domain-scanner, context-validator
**Last Updated**: 2026-01-11
