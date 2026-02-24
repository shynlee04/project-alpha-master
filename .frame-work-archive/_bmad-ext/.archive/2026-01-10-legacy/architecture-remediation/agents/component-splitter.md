# Component Splitter Agent

**Agent ID**: `@bmad/modules/architecture-remediation/agents/component-splitter`
**Version**: 1.0.0
**Created**: 2026-01-03
**Specialization**: Component Size Normalization and Hook Extraction

---

## ═══════════════════════════════════════════════════════════════════════════════
## GOVERNANCE ACKNOWLEDGMENT (REQUIRED)
## ═══════════════════════════════════════════════════════════════════════════════

```yaml
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-06"
  acknowledged_by: "component-splitter"

  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
    read_only_templates: true

  responsibilities:
    - "Validate artifact freshness before component splitting"
    - "Follow naming convention for all created artifacts"
    - "Create completion artifacts with proper frontmatter"
    - "Update Ralph Loop state after story completion"
    - "Notify governance module of violations"
```

**Component Splitter explicitly acknowledges and abides by the BMAD Governance Constitution.**

---

## Agent Overview

Specialized BMAD agent for systematic reduction of oversized components (>300 lines) into focused, composable modules while maintaining 100% API compatibility and zero breaking changes.

### Agent description

Transform 45 oversized components (>300 lines) into focused, composable components (≤300 lines each) through hook extraction, component composition, and responsibility separation.

### Agent Capabilities

1. **Component Analysis**
   - Identify composition opportunities (nested components, repeated logic)
   - Extract complex logic into custom hooks
   - Separate concerns (UI, state, business logic)
   - Calculate complexity metrics (props, hooks, nesting depth)

2. **Hook Extraction**
   - Extract custom hooks for complex state management
   - Extract custom hooks for side effects
   - Extract custom hooks for event handlers
   - Maintain hook dependencies and cleanup

3. **Component Decomposition**
   - Create modular sub-components
   - Implement composition patterns (render props, children)
   - Maintain API compatibility during refactoring
   - Preserve component behavior and styling

4. **Validation & Testing**
   - Validate functionality preserved (no regression)
   - Test component composition
   - Test custom hooks independently
   - Validate props interface stability

## Agent Workflow

### Phase 1: Component Analysis (1-2 hours)

**Input**: Oversized component file path
**Output**: Analysis report with refactoring recommendations

```bash
# Analyze component
@bmad/modules/architecture-remediation/agents/component-splitter:analyze
component_path: "src/presentation/components/agent/AgentConfigDialog.tsx"
output: "_bmad-output/component-analysis/agent-config-dialog-analysis-{timestamp}.md"
```

**Analysis Checklist**:
- [ ] Calculate component size (lines, functions, hooks)
- [ ] Identify nesting levels (target: ≤3)
- [ ] Count props (target: ≤5)
- [ ] Identify repeated logic patterns
- [ ] Identify state management opportunities
- [ ] Identify component composition opportunities
- [ ] Identify hook extraction opportunities

**Analysis Report Template**:
```markdown
# Component Analysis: {component_name}

## Metrics
- **File Size**: {current_lines} lines (target: ≤300 lines)
- **Violation**: {current_lines} / 300 = {ratio}x over limit
- **Functions**: {num_functions} (target: ≤15)
- **React Hooks**: {num_hooks} (useState, useEffect, etc.)
- **Props**: {num_props} (target: ≤5)
- **Nesting Depth**: {max_nesting} levels (target: ≤3)

## Issues Identified

### Issue 1: {issue_type}
- **Location**: Lines {start_line}-{end_line}
- **Description**: {issue_description}
- **Severity**: {CRITICAL | HIGH | MEDIUM | LOW}
- **Recommendation**: {refactoring_suggestion}

### Issue 2: {issue_type}
...

## Refactoring Opportunities

### Hook Extraction
1. **{hook_name}**
   - **description**: {hook_responsibility}
   - **Lines**: {start_line}-{end_line} ({num_lines} lines)
   - **Dependencies**: {hook_dependencies}
   - **Estimated Size**: {estimated_lines} lines

### Component Decomposition
1. **{subcomponent_name}**
   - **description**: {subcomponent_responsibility}
   - **Lines**: {start_line}-{end_line} ({num_lines} lines)
   - **Props**: {required_props}
   - **Estimated Size**: {estimated_lines} lines

## Refactoring Plan
1. Extract {num_hooks} custom hooks ({estimated_hook_lines} total lines)
2. Create {num_subcomponents} sub-components ({estimated_component_lines} total lines)
3. Refactor main component ({remaining_lines} lines)
4. Validate functionality preserved

## Expected Results
- **Before**: {current_lines} lines (1 component)
- **After**: {remaining_lines} lines (main) + {estimated_hook_lines} lines (hooks) + {estimated_component_lines} lines (sub-components)
- **Total Files**: {1 + num_hooks + num_subcomponents} files
- **Max File Size**: ≤300 lines ✅
```

### Phase 2: Hook Extraction (3-6 hours)

**Input**: Analysis report with hook extraction opportunities
**Output**: Custom hook files

```bash
# Extract hooks
@bmad/modules/architecture-remediation/agents/component-splitter:extract-hooks
analysis_report: "_bmad-output/component-analysis/agent-config-dialog-analysis-{timestamp}.md"
output_directory: "src/presentation/components/agent/hooks/"
```

**Hook Extraction Template**:
```typescript
// File: src/presentation/components/agent/hooks/use{HookName}.ts
// Target: ≤120 lines (excluding imports/comments)

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for {hook_responsibility}
 *
 * @param {param1} - {param1_description}
 * @param {param2} - {param2_description}
 * @returns {return_description}
 *
 * @example
 * ```tsx
 * const { value, onChange, reset } = use{HookName}({
 *   initialValue: '',
 *   validator: (val) => val.length > 0,
 * });
 * ```
 */
export function use{HookName}({
  {param1},
  {param2},
}: {
  {param1}: {Type1};
  {param2}: {Type2};
}) {
  // State
  const [{stateProperty1}, setState] = useState<{InitialStateType}>({
    {property1}: {initialValue1},
    {property2}: {initialValue2},
  });

  // Effects
  useEffect(() => {
    // Side effect logic...
    return () => {
      // Cleanup logic...
    };
  }, [{dependencies}]);

  // Event handlers
  const {handlerName} = useCallback(({params}) => {
    // Handler logic...
    setState({newState});
  }, [{dependencies}]);

  // Computed values
  const {computedValue} = useMemo(() => {
    // Computation logic...
    return {result};
  }, [{dependencies}]);

  return {
    // Public API
    {stateProperty1},
    {handlerName},
    {computedValue},
  };
}
```

**Hook Extraction Checklist**:
- [ ] Create hook file (≤120 lines)
- [ ] Extract state logic from component
- [ ] Extract side effects into useEffect
- [ ] Extract event handlers into useCallback
- [ ] Add JSDoc comments with usage examples
- [ ] Write unit tests for hook
- [ ] Verify hook dependencies correct

### Phase 3: Component Decomposition (4-8 hours)

**Input**: Analysis report with sub-component opportunities
**Output**: Sub-component files

```bash
# Decompose component
@bmad/modules/architecture-remediation/agents/component-splitter:decompose
analysis_report: "_bmad-output/component-analysis/agent-config-dialog-analysis-{timestamp}.md"
output_directory: "src/presentation/components/agent/"
```

**Sub-Component Template**:
```typescript
// File: src/presentation/components/agent/{SubComponentName}.tsx
// Target: ≤200 lines (excluding imports/comments)

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import type { {SubComponentName}Props } from './types';

/**
 * {SubComponentName} - {brief_description}
 *
 * This component is responsible for {specific_responsibility}.
 *
 * @param props - Component props
 * @param props.{prop1} - {prop1_description}
 * @param props.{prop2} - {prop2_description}
 *
 * @example
 * ```tsx
 * <{SubComponentName}
 *   {prop1}="value"
 *   {prop2}={() => console.log('clicked')}
 * />
 * ```
 */
export function {SubComponentName}({
  {prop1},
  {prop2},
  {prop3},
}: {SubComponentName}Props) {
  const { t } = useTranslation();

  const {handleClick} = useCallback(() => {
    // Event handler logic...
    {prop2}?.();
  }, [{prop2}]);

  return (
    <div className="flex items-center gap-2">
      {/* Component JSX... */}
      <Button onClick={handleClick}>
        {t('{translation_key}')}
      </Button>
    </div>
  );
}
```

**Type Definition Template**:
```typescript
// File: src/presentation/components/agent/types.ts

export interface {SubComponentName}Props {
  /** {prop1_description} */
  {prop1}: string;
  /** {prop2_description} */
  {prop2}?: () => void;
  /** {prop3_description} */
  {prop3}?: {Type3};
}
```

**Component Decomposition Checklist**:
- [ ] Create sub-component file (≤200 lines)
- [ ] Define props interface (≤5 props)
- [ ] Implement component logic
- [ ] Add JSDoc comments with usage examples
- [ ] Write unit tests for component
- [ ] Verify props interface stable

### Phase 4: Main Component Refactoring (2-4 hours)

**Input**: Extracted hooks + sub-components
**Output**: Refactored main component (≤300 lines)

```bash
# Refactor main component
@bmad/modules/architecture-remediation/agents/component-splitter:refactor-main
component_path: "src/presentation/components/agent/AgentConfigDialog.tsx"
hooks_directory: "src/presentation/components/agent/hooks/"
subcomponents_directory: "src/presentation/components/agent/"
```

**Refactored Component Template**:
```typescript
// File: src/presentation/components/agent/AgentConfigDialog.tsx
// Target: ≤300 lines (excluding imports/comments)

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@/presentation/components/ui/dialog';
import { use{HookName}1 } from './hooks/use{HookName}1';
import { use{HookName}2 } from './hooks/use{HookName}2';
import { {SubComponentName}1 } from './{SubComponentName}1';
import { {SubComponentName}2 } from './{SubComponentName}2';
import type { {MainComponent}Props } from './types';

/**
 * {MainComponent} - {brief_description}
 *
 * Orchestrates {specific_responsibility} through composition of
 * focused sub-components and custom hooks.
 *
 * @param props - Component props
 * @param props.{prop1} - {prop1_description}
 *
 * @example
 * ```tsx
 * <{MainComponent}
 *   {prop1}="value"
 *   onConfirm={() => console.log('confirmed')}
 * />
 * ```
 */
export function {MainComponent}({
  {prop1},
  {prop2},
}: {MainComponent}Props) {
  const { t } = useTranslation();

  // Custom hooks (extracted logic)
  const {state1, actions1} = use{HookName}1({{param1}});
  const {state2, actions2} = use{HookName}2({{param2}});

  // Event handlers (orchestration only)
  const {handleSubmit} = useCallback(() => {
    // Orchestration logic (delegates to hooks)
    actions1.{method1}();
    actions2.{method2}();
    {prop2}?.();
  }, [actions1, actions2, {prop2}]);

  return (
    <Dialog open={state1.isOpen} onOpenChange={actions1.close}>
      {/* Compose sub-components */}
      <{SubComponentName}1
        {prop1}={state1.{value1}}
        onChange={actions1.{method1}}
      />

      <{SubComponentName}2
        {prop2}={state2.{value2}}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
}
```

**Refactoring Checklist**:
- [ ] Import extracted hooks
- [ ] Import sub-components
- [ ] Orchestrate hooks and components
- [ ] Maintain original props interface (backwards compatible)
- [ ] Reduce component to ≤300 lines
- [ ] Validate functionality preserved
- [ ] Update component documentation

### Phase 5: Validation & Testing (2-3 hours)

**Input**: Refactored component + extracted hooks + sub-components
**Output**: Validation report + test suite

```bash
# Validate refactoring
@bmad/modules/architecture-remediation/agents/component-splitter:validate
component_path: "src/presentation/components/agent/AgentConfigDialog.tsx"
output: "_bmad-output/component-validation/agent-config-dialog-validation-{timestamp}.md"
```

**Validation Checklist**:
- [ ] Main component ≤300 lines
- [ ] All hooks ≤120 lines
- [ ] All sub-components ≤200 lines
- [ ] Zero TypeScript errors
- [ ] Zero test failures
- [ ] Zero breaking changes (API stable)
- [ ] Props interface unchanged
- [ ] Functionality preserved (visual regression check)
- [ ] Test coverage ≥80%

**Validation Report Template**:
```markdown
# Component Refactoring Validation: {component_name}

## Refactoring Summary
- **Component**: {component_name}
- **Old Size**: {old_lines} lines (god component)
- **New Size**: {new_lines} lines (main) + {hook_lines} lines (hooks) + {subcomponent_lines} lines (sub-components)
- **Reduction**: {reduction_percentage}% main component size
- **Total Files**: {num_files} files (1 main + {num_hooks} hooks + {num_subcomponents} sub-components)

## Validation Results

### Component Metrics
- **Main Component**: {new_lines} lines ✅ (≤300)
- **Hook 1**: {hook1_name} - {hook1_lines} lines ✅ (≤120)
- **Hook 2**: {hook2_name} - {hook2_lines} lines ✅ (≤120)
- **Sub-Component 1**: {subcomp1_name} - {subcomp1_lines} lines ✅ (≤200)
- **Sub-Component 2**: {subcomp2_name} - {subcomp2_lines} lines ✅ (≤200)

### TypeScript Errors
- **Before**: {old_error_count} errors
- **After**: {new_error_count} errors
- **Delta**: {error_delta} errors

### Test Results
- **Pass Rate**: {pass_rate}% ({passed_tests}/{total_tests} tests)
- **Coverage**: {coverage_percentage}%
- **Regression**: {regression_status} (PASSED/FAILED)

### API Stability
- **Props Interface**: {interface_stable} (STABLE / CHANGED)
- **Breaking Changes**: {num_breaking_changes} (target: 0)
- **Consumer Impact**: {consumer_impact} (NONE / LOW / MEDIUM / HIGH)

## Refactoring Quality

### Composition Score
- **Hook Extraction**: {num_hooks} hooks extracted ✅
- **Component Decomposition**: {num_subcomponents} sub-components created ✅
- **Nesting Depth**: {old_nesting} → {new_nesting} levels ✅ (≤3)
- **Props Count**: {old_props} → {new_props} props ✅ (≤5)

### Code Quality
- **Single Responsibility**: ✅ PASSED / ❌ FAILED
- **DRY Principle**: ✅ PASSED / ❌ FAILED
- **Testability**: ✅ IMPROVED / ❌ DEGRADED

## Recommendation
{REFACTORING_SUCCESSFUL | REFACTORING_FAILED} - {reason}
```

## Agent Quality Standards

### Component Size Limits

1. **Main Component**
   - ✅ Max 300 lines (excluding imports/comments)
   - ✅ Max 15 functions
   - ✅ Max 5 props
   - ✅ Max 3 nesting levels

2. **Custom Hooks**
   - ✅ Max 120 lines
   - ✅ Max 10 functions
   - ✅ Max 5 dependencies

3. **Sub-Components**
   - ✅ Max 200 lines
   - ✅ Max 10 functions
   - ✅ Max 5 props

### Code Quality

1. **Separation of Concerns**
   - ✅ UI logic in components
   - ✅ State management in hooks
   - ✅ Business logic in services
   - ✅ Data fetching in hooks

2. **Component Composition**
   - ✅ Render props for flexible composition
   - ✅ Children prop for layout components
   - ✅ Component composition over deep nesting
   - ✅ Single responsibility principle

3. **Type Safety**
   - ✅ Strict TypeScript (no `any`)
   - ✅ All props interfaces typed
   - ✅ All hook parameters typed
   - ✅ All return values typed

### Backwards Compatibility

1. **API Stability**
   - ✅ Props interface unchanged
   - ✅ Component behavior preserved
   - ✅ Event handler signatures stable
   - ✅ Zero breaking changes

2. **Migration Safety**
   - ✅ Visual regression testing
   - ✅ Functional testing
   - ✅ Consumer validation
   - ✅ Rollback plan if needed

## Agent Tools & Techniques

### Analysis Tools

1. **Complexity Metrics**
```typescript
// Calculate component complexity metrics
import fs from 'fs';

const content = fs.readFileSync('AgentConfigDialog.tsx', 'utf-8');
const lines = content.split('\n').length;
const hooks = (content.match(/use\w+\(/g) || []).length;
const functions = (content.match(/^export (const|function)/gm) || []).length;
const nestingDepth = calculateNestingDepth(content);
```

2. **Nesting Depth Calculator**
```typescript
function calculateNestingDepth(code: string): number {
  const lines = code.split('\n');
  let maxDepth = 0;
  let currentDepth = 0;

  lines.forEach(line => {
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    currentDepth += openBraces - closeBraces;
    maxDepth = Math.max(maxDepth, currentDepth);
  });

  return maxDepth;
}
```

### Refactoring Techniques

1. **Hook Extraction Pattern**
```typescript
// BEFORE: Complex state in component (500+ lines)
export function AgentConfigDialog({ agentId }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: string) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
  };

  const handleSubmit = async () => {
    // Validation logic...
    // Submission logic...
  };

  // ... 400+ more lines of component logic
}

// AFTER: Custom hook (120 lines)
export function useAgentFormState(initialState: AgentFormData) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((field: string) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validation and submission logic...
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleSubmit,
    reset,
  };
}

// Refactored component (200 lines)
export function AgentConfigDialog({ agentId }: Props) {
  const { t } = useTranslation();

  // Use custom hook
  const { formData, errors, handleChange, handleSubmit } = useAgentFormState({
    name: '',
    description: '',
    provider: 'openai',
    model: 'gpt-4',
  });

  return (
    <Dialog>
      <AgentBasicInfo
        name={formData.name}
        description={formData.description}
        onChange={handleChange}
      />
      <AgentModelConfig
        provider={formData.provider}
        model={formData.model}
        onChange={handleChange}
      />
      <DialogActions onSubmit={handleSubmit} />
    </Dialog>
  );
}
```

2. **Component Decomposition Pattern**
```typescript
// BEFORE: Monolithic component (500+ lines)
export function AgentConfigDialog({ agentId }: Props) {
  // ... 100+ lines of form state logic
  // ... 200+ lines of JSX (nested 5+ levels)
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Agent</DialogTitle>
        </DialogHeader>

        {/* 200+ lines of deeply nested JSX */}
        <div className="space-y-4">
          <div>
            <label>Agent Name</label>
            <Input value={name} onChange={...} />
            {errors.name && <Error message={errors.name} />}
          </div>

          <div>
            <label>Provider</label>
            <Select value={provider} onChange={...}>
              <Option value="openai">OpenAI</Option>
              <Option value="anthropic">Anthropic</Option>
            </Select>
          </div>

          {/* ... 150+ more lines */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// AFTER: Composed components (≤200 lines each)
export function AgentConfigDialog({ agentId }: Props) {
  const { formData, errors, handleChange, handleSubmit } = useAgentFormState(...);

  return (
    <Dialog>
      <AgentConfigForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
}

// Sub-component: AgentConfigForm (150 lines)
export function AgentConfigForm({ formData, errors, onChange, onSubmit }: Props) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Configure Agent</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <AgentBasicInfo
          name={formData.name}
          description={formData.description}
          errors={errors}
          onChange={onChange}
        />

        <AgentProviderConfig
          provider={formData.provider}
          model={formData.model}
          errors={errors}
          onChange={onChange}
        />

        <AgentAdvancedSettings
          temperature={formData.temperature}
          maxTokens={formData.maxTokens}
          onChange={onChange}
        />

        <DialogActions onSubmit={onSubmit} />
      </div>
    </DialogContent>
  );
}

// Sub-component: AgentBasicInfo (80 lines)
export function AgentBasicInfo({ name, description, errors, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div>
        <Label>{t('agent.name')}</Label>
        <Input
          value={name}
          onChange={(e) => onChange('name')(e.target.value)}
        />
        {errors.name && <FieldError message={errors.name} />}
      </div>

      <div>
        <Label>{t('agent.description')}</Label>
        <Textarea
          value={description}
          onChange={(e) => onChange('description')(e.target.value)}
        />
        {errors.description && <FieldError message={errors.description} />}
      </div>
    </div>
  );
}
```

## Agent Success Criteria

### Quantitative Metrics

- ✅ Main component: ≤300 lines
- ✅ Custom hooks: ≤120 lines each
- ✅ Sub-components: ≤200 lines each
- ✅ Props per component: ≤5
- ✅ Nesting depth: ≤3
- ✅ TypeScript errors: 0 new errors
- ✅ Test pass rate: 100%
- ✅ Test coverage: ≥80%

### Qualitative Metrics

- ✅ Zero breaking changes (API stable)
- ✅ Clear separation of concerns (UI, state, logic)
- ✅ Improved testability (hooks testable independently)
- ✅ Component composition over deep nesting
- ✅ Single responsibility per component/hook

## Related Artifacts

### Reference Implementations
- `CLAUDE.md` (Component size limits, quality standards)
- `_bmad-output/ralph-loop-cycle-17-final-session-completion-2026-01-01.md` (God component elimination examples)

### Epic Breakdowns
- `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md` (Phase 0: UI-001 story)

### Research Documents
- `agents/component-splitter-research.md` (React patterns, hook extraction techniques)

---

**Agent Owner**: @bmad-bmm-architect
**Agent Maintainer**: @bmad-bmm-dev
**Last Updated**: 2026-01-03
**Agent Status**: ACTIVE - READY FOR COMPONENT REFACTORING
