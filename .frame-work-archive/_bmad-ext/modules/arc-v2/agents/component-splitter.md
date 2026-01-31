---
name: "component-splitter"
description: "React Component Splitting Specialist"
version: "1.0.0"
type: "remediation"
domain: "ux"
triggers:
  - "god component"
  - "component too big"
  - "split"
  - "refactor"
thresholds:
  max_component_lines: 300
  max_functions: 3
  max_dependencies: 5
  max_nesting_depth: 3
---

# Component Splitter Agent

**Role**: React component refactoring specialist
**description**: Split god components into focused modules with zero breaking changes

---

## Activation Triggers

```yaml
automatic:
  - component file > 300 lines
  - component has >3 functions
  - component has >5 dependencies
  - nesting level > 3
  - Single Responsibility Principle violated

manual:
  - user requests "split component"
  - user mentions "god component"
  - user references "component refactor"
```

---

## Refactoring Protocol

### Phase 1: Analysis (5-10 minutes)

```yaml
input: component_file_path
actions:
  - Read target component file
  - Count lines, functions, dependencies
  - Analyze component structure:
    - Custom hooks
    - Sub-components
    - Event handlers
    - Business logic
  - Map import dependencies

analysis_output:
  format: "yaml"
  path: "_bmad-output/scans/component-analysis-{component_name}-{date}.yaml"
  contains:
    - current_lines: number
    - violation_factor: "current_lines / 300"
    - hooks: list
    - sub_components: list
    - event_handlers: count
    - dependencies: list
    - nesting_depth: max
    - risk_level: "LOW" | "MEDIUM" | "HIGH"
```

### Phase 2: Split Planning (10-15 minutes)

```yaml
split_strategy:
  patterns:
    - "Custom Hook Extraction"
    - "Sub-Component Extraction"
    - "Business Logic Extraction"
    - "Utility Extraction"

boundaries:
  custom_hooks:
    - Form state management
    - Data fetching
    - Calculations/memoization
    - Side effects

  sub_components:
    - UI sections
    - Form inputs
    - Display items
    - Control elements

  business_logic:
    - Validation
    - Data transformation
    - API calls

  utilities:
    - Formatters
    - Constants
    - Type definitions

max_lines_per_module: 120
```

### Phase 3: Implementation (2-4 hours)

```yaml
steps:
  1. Extract custom hooks:
     - Location: "{component_dir}/hooks/use{Feature}.ts"
     - Each ≤120 lines
     - Single responsibility

  2. Split into sub-components:
     - Location: "{component_dir}/{Feature}Component.tsx"
     - Each ≤120 lines
     - Clear props interface

  3. Extract utilities:
     - Location: "{component_dir}/utils/{utility}.ts"
     - Location: "{component_dir}/types.ts"

  4. Create main orchestrator:
     - Reduced to ~150-200 lines
     - Composition of sub-components
     - Uses extracted hooks

  5. Create barrel export:
     - File: "{component_dir}/index.ts"
     - Export main component
     - Export sub-components (if reusable)

  6. Update imports:
     - Find all imports of old component
     - Update to new barrel export
     - Verify zero breaking changes
```

### Phase 4: Validation (30 minutes)

```yaml
validation_steps:
  - name: "TypeScript check"
    command: "pnpm tsc --noEmit"
    expected: "zero new errors"

  - name: "Test coverage"
    command: "pnpm test -- --coverage"
    expected: "≥80% coverage"

  - name: "Line count"
    command: "find {component_dir} -name '*.tsx' -exec wc -l {} \\;"
    expected: "all ≤120 lines except main"

  - name: "Visual regression"
    action: "manual UI check"
    expected: "no visual changes"
```

---

## Hook Template

```typescript
// File: src/presentation/components/{feature}/hooks/use{FeatureName}.ts
import { useShallow } from 'zustand/react/shallow';
import { use{Feature}Store } from '@/infrastructure/persistence/stores/{feature}';

export interface Use{FeatureName}Props {
  id: string;
  enabled?: boolean;
}

export interface Use{FeatureName}Return {
  // State (max 5 properties)
  data: DataType | null;
  loading: boolean;
  error: string | null;

  // Actions (max 3 functions)
  update: (value: DataType) => void;
  reset: () => void;
}

export const use{FeatureName} = ({
  id,
  enabled = true,
}: Use{FeatureName}Props): Use{FeatureName}Return => {
  // useShallow for multi-property selects (prevents re-renders)
  const { data, loading, error, updateData, clearData } = use{Feature}Store(
    useShallow((state) => ({
      data: state.items.get(id),
      loading: state.loading,
      error: state.error,
      updateData: state.updateItem,
      clearData: state.clearItem,
    }))
  );

  const update = useCallback((value: DataType) => {
    updateData(id, value);
  }, [id, updateData]);

  const reset = useCallback(() => {
    clearData(id);
  }, [id, clearData]);

  return {
    data,
    loading,
    error,
    update,
    reset,
  };
};
```

---

## Sub-Component Template

```typescript
// File: src/presentation/components/{feature}/{Feature}Component.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface {Feature}ComponentProps {
  // Props (max 5)
  data: DataType;
  onAction: (value: ValueType) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * {Feature}Component - Single responsibility description
 */
export const {Feature}Component: React.FC<{Feature}ComponentProps> = ({
  data,
  onAction,
  disabled = false,
  className,
}) => {
  // Event handlers (max 2)
  const handleClick = useCallback(() => {
    if (!disabled) {
      onAction(data.value);
    }
  }, [data, disabled, onAction]);

  // Render (≤120 lines total)
  return (
    <div
      className={cn(
        "base-styles",
        disabled && "opacity-50",
        className
      )}
    >
      {/* Component JSX */}
    </div>
  );
};
```

---

## Main Orchestrator Template

```typescript
// File: src/presentation/components/{feature}/{Feature}Dialog.tsx
import React from 'react';
import { use{Feature}Data } from './hooks/use{Feature}Data';
import { {Feature}BasicInfo } from './{Feature}BasicInfo';
import { {Feature}Config } from './{Feature}Config';
import { {Feature}Actions } from './{Feature}Actions';

export interface {Feature}DialogProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

/**
 * {Feature}Dialog - Main orchestrator component
 *
 * Orchestrates sub-components and hooks for {feature} functionality.
 * Reduced from {original_lines} → ~150 lines through extraction.
 */
export const {Feature}Dialog: React.FC<{Feature}DialogProps> = ({
  id,
  open,
  onClose,
}) => {
  // Custom hooks
  const { data, loading, error, update, reset } = use{Feature}Data({ id, enabled: open });

  // Event handlers
  const handleSave = useCallback(() => {
    if (data) {
      update(data);
      onClose();
    }
  }, [data, update, onClose]);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Render
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        {/* Sub-components */}
        <{Feature}BasicInfo data={data} onChange={update} />
        <{Feature}Config data={data} onChange={update} />
        <{Feature}Actions
          loading={loading}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
```

---

## Quality Gates

```yaml
must_pass:
  - All modules ≤120 lines (except orchestrator)
  - Main orchestrator ≤200 lines
  - Zero TypeScript errors
  - Zero test failures
  - ≥80% test coverage
  - Zero breaking imports
  - All event handlers memoized
  - All selectors use useShallow

must_not:
  - Create components with >5 props
  - Use inline event handlers
  - Destructure store selectors (causes re-renders)
  - Create deeply nested JSX (>3 levels)
  - Use any types
```

---

## Risk Assessment Matrix

```yaml
LOW:
  duration: "3-4 hours"
  examples:
    - "Study workspace components"
    - "Notes workspace components"
  coordination: "minimal"

MEDIUM:
  duration: "6-8 hours"
  examples:
    - "Knowledge workspace components"
    - "Chat components"
  coordination: "moderate"

HIGH:
  duration: "11-15 hours"
  examples:
    - "IDE workspace components"
    - "Agent configuration dialogs"
  coordination: "extensive"
```

---

## Integration

### Registers Artifacts

```yaml
artifact:
  id: "component-split-{component_name}-{date}"
  type: "COMPONENT_SPLIT"
  path: "_bmad-output/refactors/component-{component_name}-{date}.yaml"
  ttl_hours: 48

registers_in: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
```

### Updates LOOP_STATE

```yaml
loop_state_updates:
  anchor:
    last_split_timestamp: "{ISO_timestamp}"
    last_split_component: "{component_name}"

  progress:
    components_split: increment
    hooks_created: count
    lines_saved: total_original_lines - total_new_lines
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Prop drilling too deep | Create context or use store |
| Re-render on every state change | Use individual selectors with useShallow |
| Too many props | Extract to sub-component with store access |
| Component still too large | Extract more hooks/sub-components |
| Breaking imports after refactor | Keep barrel export, add facade if needed |

---

## Example Output

```yaml
# _bmad-output/refactors/AgentConfigDialog-2026-01-11.yaml

refactor_metadata:
  component: "AgentConfigDialog"
  original_path: "src/presentation/components/agent/AgentConfigDialog.tsx"
  refactored_at: "2026-01-11T14:30:00+07:00"

before:
  lines: 1089
  functions: 15
  dependencies: 12
  violation_factor: "3.6x"

after:
  modules: 8
  avg_lines_per_module: 95
  total_lines: 760
  main_component_lines: 180

modules_created:
  hooks:
    - path: "agent/hooks/useAgentFormState.ts"
      lines: 85
      responsibility: "Form state management"
    - path: "agent/hooks/useAgentPermissions.ts"
      lines: 65
      responsibility: "Permission checks"

  components:
    - path: "agent/AgentBasicInfo.tsx"
      lines: 95
      responsibility: "Basic agent fields"
    - path: "agent/AgentModelConfig.tsx"
      lines: 110
      responsibility: "Model selection"
    - path: "agent/WorkspaceBindingConfig.tsx"
      lines: 105
      responsibility: "Workspace permissions"
    - path: "agent/AgentAdvancedConfig.tsx"
      lines: 90
      responsibility: "Advanced options"

  utils:
    - path: "agent/utils/validation.ts"
      lines: 75
      responsibility: "Form validation"
    - path: "agent/utils/constants.ts"
      lines: 35
      responsibility: "Config constants"

backwards_compatibility:
  barrel_export: true
  barrel_path: "agent/index.ts"
  breaking_changes: 0
  imports_updated: 8

validation:
  typescript_errors: 0
  test_coverage: "82%"
  visual_regression: "none"
```

---

**Agent Owner**: arc-v2
**Domain**: UX
**Invoked By**: domain-scanner, context-validator
**Last Updated**: 2026-01-11
