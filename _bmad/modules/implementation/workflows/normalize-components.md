---
name: normalize-components
description: Split oversized components into smaller, focused units
version: 1.0.0
created: 2026-01-04
agents: [component-splitter, test-writer]
triggers: [component > 300 lines, hook > 150 lines]
---

# Normalize Components Workflow

// turbo-all

## Overview

Systematically split oversized React components following Single Responsibility Principle.

## Flow

```
ANALYZE → PLAN → EXTRACT → VALIDATE
```

## Step 1: Identify Targets

```bash
# Find components > 300 lines
find src/components -name "*.tsx" -exec wc -l {} + | awk '$1 > 300'

# Find hooks > 150 lines  
find src -name "use*.ts" -exec wc -l {} + | awk '$1 > 150'
```

## Step 2: Analyze Component

For each target, identify:
- UI sections (visual areas to extract)
- Logic blocks (state/effects → hooks)
- Prop drilling (→ context candidates)

Output: `_bmad-output/component-analysis/{name}-analysis.md`

## Step 3: Choose Split Strategy

**A) Vertical Split** - by feature
```
UserDashboard/
├── UserProfile/
├── UserActivity/
└── UserSettings/
```

**B) Horizontal Split** - by layer
```
DataTable/
├── DataTableHeader.tsx
├── DataTableBody.tsx
└── hooks/useDataTableSort.ts
```

**C) Hook Extraction** - logic separation
```
ComplexForm/
├── ComplexForm.tsx (UI only)
└── hooks/useFormValidation.ts
```

## Step 4: Execute Extraction

### Hook Extraction Pattern

```typescript
// Extract from component
export function useDataProcessing(data: Data[]) {
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => 
    data.filter(d => d.name.includes(filter)), 
    [data, filter]
  );
  return { filtered, filter, setFilter };
}
```

### Component Extraction Pattern

```typescript
// Create barrel export
// ComponentFolder/index.ts
export { MainComponent } from './MainComponent';
export { SubComponent1 } from './SubComponent1';
export { SubComponent2 } from './SubComponent2';
```

## Step 5: Update Tests

```typescript
// Add tests for each extracted piece
describe('ExtractedHook', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useHook());
    expect(result.current).toHaveProperty('value');
  });
});
```

## Step 6: Validate

```bash
# Size check
find src/components/{folder} -name "*.tsx" -exec wc -l {} +

# TypeScript (exclude tests)
pnpm exec tsc --noEmit 2>&1 | grep -v "\.test\." | grep "error TS"

# Tests
pnpm test -- --grep "{component}"
```

## Quality Gates

- [ ] All components ≤ 300 lines
- [ ] All hooks ≤ 150 lines
- [ ] TypeScript passes (code only)
- [ ] Tests pass
- [ ] Exports unchanged (backward compatible)

## Handoff

```markdown
## NORMALIZATION COMPLETE
Component: {name}
Lines: {before} → {after}
Sub-components: {count}
Hooks extracted: {count}
All gates: ✅ PASS
```
