# TypeScript Fixer Agent

**Agent ID**: `@bmad/modules/architecture-remediation/agents/typescript-fixer`
**Version**: 1.0.0
**Created**: 2026-01-03
**Specialization**: Batch TypeScript Error Remediation

## Agent Overview

Specialized BMAD agent for systematic reduction of TypeScript errors through categorized batch fixing, pattern identification, and validation.

### Agent Purpose

Reduce 1,172 TypeScript errors to <10 through systematic categorization, batch fixing of common patterns, and strict validation to prevent regression.

### Agent Capabilities

1. **Error Categorization**
   - Group errors by type (missing imports, wrong types, circular deps)
   - Prioritize by severity (P0: compilation blockers, P3: style issues)
   - Identify error patterns (repeated issues across files)
   - Track error reduction progress

2. **Batch Fixing**
   - Fix 50-100 errors per session (sustainable pace)
   - Apply pattern-based fixes (common error types)
   - Fix missing imports (auto-import or explicit import)
   - Fix type mismatches (correct type annotations)
   - Eliminate `any` types (strict typing)

3. **Validation**
   - Validate fixes with `pnpm tsc --noEmit`
   - Regression testing with `pnpm test`
   - Zero new errors policy
   - Track error metrics

4. **Documentation**
   - Document error patterns and solutions
   - Create fix templates for common errors
   - Update error tracking metrics
   - Archive validation reports

## Agent Workflow

### Phase 1: Error Analysis (1-2 hours)

**Input**: TypeScript error count
**Output**: Categorized error report with fix recommendations

```bash
# Analyze errors
@bmad/modules/architecture-remediation/agents/typescript-fixer:analyze
error_count: 1172
output: "_bmad-output/ts-analysis/typescript-error-analysis-{timestamp}.md"
```

**Error Categories**:

1. **Missing Imports** (TS2304, TS2305)
   - Cannot find name '{entity}'
   - Module '{module}' has no exported member '{member}'
   - Fix: Add correct import statement

2. **Type Mismatches** (TS2322, TS2345)
   - Type '{TypeA}' is not assignable to type '{TypeB}'
   - Argument of type '{TypeA}' is not assignable to parameter of type '{TypeB}'
   - Fix: Correct type annotations or add type assertions

3. **Missing Properties** (TS2339, TS2739)
   - Property '{prop}' does not exist on type '{Type}'
   - Type '{TypeA}' is missing the following properties from type '{TypeB}'
   - Fix: Add missing properties or correct type definition

4. **Circular Dependencies** (TS2304, TS2580)
   - Cannot find name '{entity}' due to circular imports
   - Fix: Reorganize imports or extract to separate module

5. **Unused Variables** (TS6133, TS6196)
   - '{variable}' is declared but its value is never read
   - Fix: Remove unused code or prefix with underscore

**Analysis Report Template**:
```markdown
# TypeScript Error Analysis

## Summary
- **Total Errors**: {total_errors} (306 production + 866 test)
- **Target**: <10 errors
- **Reduction Required**: {total_errors - 10} errors ({percentage}%)

## Error Breakdown by Category

### 1. Missing Imports ({count} errors - {percentage}%)
**Severity**: P0 - Compilation Blockers
**Fix Time**: 2-3 hours

**Common Patterns**:
- React imports missing: {count} errors
- Component imports missing: {count} errors
- Utility imports missing: {count} errors

**Fix Strategy**:
- Use auto-import for standard libraries
- Add explicit imports for custom modules
- Verify import paths correct

### 2. Type Mismatches ({count} errors - {percentage}%)
**Severity**: P0 - Type Safety Violations
**Fix Time**: 4-6 hours

**Common Patterns**:
- Generic type parameters: {count} errors
- Union type mismatches: {count} errors
- Interface vs type conflicts: {count} errors

**Fix Strategy**:
- Review type definitions
- Add proper type annotations
- Use type assertions sparingly

### 3. Missing Properties ({count} errors - {percentage}%)
**Severity**: P1 - Interface Violations
**Fix Time**: 3-4 hours

**Common Patterns**:
- Optional properties not handled: {count} errors
- Index signature missing: {count} errors
- Interface properties missing: {count} errors

**Fix Strategy**:
- Add missing properties to interfaces
- Use optional properties where appropriate
- Add index signatures for dynamic properties

### 4. Circular Dependencies ({count} errors - {percentage}%)
**Severity**: P0 - Architectural Issues
**Fix Time**: 6-8 hours

**Common Patterns**:
- Store circular imports: {count} errors
- Component circular imports: {count} errors
- Utility circular imports: {count} errors

**Fix Strategy**:
- Reorganize imports
- Extract to separate modules
- Use lazy imports

### 5. Unused Variables ({count} errors - {percentage}%)
**Severity**: P3 - Code Quality
**Fix Time**: 1-2 hours

**Fix Strategy**:
- Remove unused code
- Prefix with underscore for intentional unused variables

## Fix Priority Order

### Phase 1: P0 Errors ({count} errors, 12-20 hours)
1. Missing imports ({count} errors)
2. Type mismatches ({count} errors)
3. Circular dependencies ({count} errors)

### Phase 2: P1 Errors ({count} errors, 3-4 hours)
1. Missing properties ({count} errors)

### Phase 3: P3 Errors ({count} errors, 1-2 hours)
1. Unused variables ({count} errors)

## Estimated Timeline
- **Phase 1** (P0): 12-20 hours → {count} errors fixed
- **Phase 2** (P1): 3-4 hours → {count} errors fixed
- **Phase 3** (P3): 1-2 hours → {count} errors fixed
- **Total**: 16-26 hours → {total_errors} errors → <10 errors

## Success Criteria
- ✅ TypeScript errors <10
- ✅ Zero P0 errors remaining
- ✅ Zero new errors introduced
- ✅ All tests passing (100% pass rate)
```

### Phase 2: Batch Fixing (12-20 hours)

**Input**: Categorized error report
**Output**: Fixed files + validation report

```bash
# Fix errors
@bmad/modules/architecture-remediation/agents/typescript-fixer:fix-batch
error_category: "missing-imports"
target_errors: 100
output: "_bmad-output/ts-fixes/missing-imports-fix-{timestamp}.md"
```

**Fixing Template** (by error category):

#### 1. Missing Imports Fix
```typescript
// BEFORE: TS2304 - Cannot find name 'useState'
export function MyComponent() {
  const [count, setCount] = useState(0); // ❌ Error
  return <div>{count}</div>;
}

// AFTER: Fixed import
import { useState } from 'react'; // ✅ Fixed

export function MyComponent() {
  const [count, setCount] = useState(0); // ✅ No error
  return <div>{count}</div>;
}
```

#### 2. Type Mismatch Fix
```typescript
// BEFORE: TS2322 - Type 'string' is not assignable to type 'number'
interface Props {
  count: number;
}

export function MyComponent({ count }: Props) {
  const value = getCount(); // Returns string
  return <div>{value}</div>;
}

// AFTER: Fixed type annotation
export function MyComponent({ count }: Props) {
  const value: string = getCount(); // ✅ Explicit type
  return <div>{value}</div>;
}

// OR: Fix type conversion
export function MyComponent({ count }: Props) {
  const value = Number(getCount()); // ✅ Convert to number
  return <div>{value}</div>;
}
```

#### 3. Missing Property Fix
```typescript
// BEFORE: TS2739 - Missing 'id' property
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  name: 'John',
  email: 'john@example.com',
  // ❌ Missing 'id' property
};

// AFTER: Added missing property
const user: User = {
  id: 'user-123', // ✅ Added
  name: 'John',
  email: 'john@example.com',
};
```

#### 4. Circular Dependency Fix
```typescript
// BEFORE: Circular import causes TS2304
// File: store-a.ts
import { functionB } from './store-b'; // ❌ Circular

export function functionA() {
  return functionB();
}

// File: store-b.ts
import { functionA } from './store-a'; // ❌ Circular

export function functionB() {
  return functionA();
}

// AFTER: Extract to shared module
// File: store-a.ts
import { sharedFunction } from './shared'; // ✅ No circular

export function functionA() {
  return sharedFunction();
}

// File: store-b.ts
import { sharedFunction } from './shared'; // ✅ No circular

export function functionB() {
  return sharedFunction();
}

// File: shared.ts (NEW)
export function sharedFunction() {
  return 'shared';
}
```

#### 5. Unused Variable Fix
```typescript
// BEFORE: TS6133 - 'unused' is declared but never used
export function myFunction() {
  const unused = 'never used'; // ❌ Error
  return 'result';
}

// AFTER: Removed unused variable
export function myFunction() {
  return 'result'; // ✅ No error
}

// OR: Prefix with underscore for intentional unused
export function myFunction() {
  const _unused = 'kept for future use'; // ✅ No error
  return 'result';
}
```

**Batch Fixing Checklist**:
- [ ] Select error category (e.g., missing-imports)
- [ ] Fix 50-100 errors in batch
- [ ] Validate with `pnpm tsc --noEmit`
- [ ] Verify zero new errors introduced
- [ ] Regression test with `pnpm test`
- [ ] Update error tracking metrics
- [ ] Document fixed patterns

### Phase 3: Validation & Regression Testing (1-2 hours)

**Input**: Fixed files
**Output**: Validation report + updated error metrics

```bash
# Validate fixes
@bmad/modules/architecture-remediation/agents/typescript-fixer:validate
fixed_files: "{list_of_files}"
output: "_bmad-output/ts-validation/typescript-fix-validation-{timestamp}.md"
```

**Validation Commands**:
```bash
# TypeScript check
pnpm tsc --noEmit
# Expected: Error count reduced from {old_count} to {new_count}

# Test suite
pnpm test
# Expected: 100% pass rate (no regression)

# Lint check
pnpm lint
# Expected: Zero new warnings
```

**Validation Report Template**:
```markdown
# TypeScript Fix Validation

## Session Summary
- **Category Fixed**: {error_category}
- **Errors Fixed**: {old_count} → {new_count} ({reduction} errors fixed)
- **Time Taken**: {duration}
- **Files Modified**: {num_files}

## Validation Results

### TypeScript Errors
- **Before**: {old_error_count} errors
- **After**: {new_error_count} errors
- **Reduction**: {reduction_percentage}%
- **Status**: ✅ PASSED / ❌ FAILED

### Test Results
- **Pass Rate**: {pass_rate}% ({passed_tests}/{total_tests} tests)
- **Regression**: {regression_status} (PASSED/FAILED)
- **New Failures**: {num_new_failures} tests

### Lint Results
- **Before**: {old_warning_count} warnings
- **After**: {new_warning_count} warnings
- **Delta**: {warning_delta} warnings

## Fixed Patterns

### Pattern 1: {pattern_name}
- **Errors Fixed**: {count} errors
- **Files Affected**: {num_files}
- **Fix Applied**: {fix_description}
- **Template**: {fix_template}

### Pattern 2: {pattern_name}
...

## Regression Check
- ✅ Zero new TypeScript errors
- ✅ Zero test failures
- ✅ Zero new lint warnings
- ✅ All functionality preserved

## Next Actions
1. Continue to next error category: {next_category}
2. Re-analyze remaining errors: {remaining_count} errors
3. Target: <10 errors by {target_date}

## Recommendation
{FIX_SUCCESSFUL | FIX_FAILED} - {reason}
```

## Agent Quality Standards

### Fix Quality

1. **Type Safety**
   - ✅ No `any` types (strict typing)
   - ✅ Proper type annotations
   - ✅ Correct generic types
   - ✅ Type assertions justified

2. **Import Hygiene**
   - ✅ No unused imports
   - ✅ No duplicate imports
   - ✅ Correct import paths
   - ✅ Named exports preferred

3. **Code Quality**
   - ✅ No unused variables
   - ✅ No dead code
   - ✅ No commented-out code
   - ✅ Clean, readable code

### Validation Standards

1. **Zero Regression**
   - ✅ Zero new TypeScript errors
   - ✅ Zero test failures
   - ✅ Zero breaking changes
   - ✅ All functionality preserved

2. **Sustainable Pace**
   - ✅ Fix 50-100 errors per session
   - ✅ Validate after every batch
   - ✅ Track error metrics
   - ✅ Document patterns and solutions

## Agent Tools & Techniques

### Analysis Tools

1. **Error Categorization Script**
```typescript
// Categorize TypeScript errors by type
import { execSync } from 'child_process';

const errorOutput = execSync('pnpm tsc --noEmit', { encoding: 'utf-8' });
const errors = errorOutput.split('\n').filter(line => line.includes('TS'));

const categorized = {
  missingImports: errors.filter(e => e.includes('TS2304') || e.includes('TS2305')),
  typeMismatches: errors.filter(e => e.includes('TS2322') || e.includes('TS2345')),
  missingProperties: errors.filter(e => e.includes('TS2339') || e.includes('TS2739')),
  circularDeps: errors.filter(e => e.includes('TS2580')),
  unusedVariables: errors.filter(e => e.includes('TS6133') || e.includes('TS6196')),
};

console.log('Missing Imports:', categorized.missingImports.length);
console.log('Type Mismatches:', categorized.typeMismatches.length);
console.log('Missing Properties:', categorized.missingProperties.length);
```

2. **Pattern Detection**
```typescript
// Detect common error patterns across files
function detectErrorPatterns(errors: string[]): Record<string, number> {
  const patterns: Record<string, number> = {};

  errors.forEach(error => {
    // Extract error pattern (e.g., "Cannot find name 'useState'")
    const match = error.match(/Cannot find name '(\w+)'/);
    if (match) {
      const entity = match[1];
      patterns[entity] = (patterns[entity] || 0) + 1;
    }
  });

  return patterns;
}

// Example output:
// {
//   'useState': 15,
//   'useEffect': 12,
//   'useCallback': 8,
//   'FontAwesomeIcon': 23,
// }
```

### Fixing Techniques

1. **Auto-Import Generation**
```bash
# Use IDE auto-import features
# VS Code: Auto Import on paste
# WebStorm: Auto-import suggestions

# Or use ESLint auto-fix
pnpm lint --fix
```

2. **Type Annotation Templates**
```typescript
// Common type annotations

// React component props
interface ComponentProps {
  title: string;
  count: number;
  onAction: () => void;
  optionalProp?: string;
}

// Generic type parameters
function identity<T>(value: T): T {
  return value;
}

// Union types
type Status = 'pending' | 'success' | 'error';

// Intersection types
type UserWithTimestamp = User & {
  createdAt: Date;
  updatedAt: Date;
};

// Type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Type assertions (use sparingly)
const element = document.getElementById('root') as HTMLElement;
```

3. **Circular Dependency Resolution**
```typescript
// Strategy 1: Extract to shared module
// BEFORE (circular):
// store-a.ts imports store-b
// store-b.ts imports store-a

// AFTER (no circular):
// shared.ts (new module)
// store-a.ts imports shared
// store-b.ts imports shared

// Strategy 2: Lazy imports
// BEFORE: import at top level (circular)
import { functionB } from './store-b';

// AFTER: import inside function (lazy)
export function functionA() {
  import('./store-b').then(({ functionB }) => {
    return functionB();
  });
}

// Strategy 3: Dependency injection
// BEFORE: direct import (circular)
import { functionB } from './store-b';

export function functionA() {
  return functionB();
}

// AFTER: injected dependency
export function functionA(deps: { functionB: () => void }) {
  return deps.functionB();
}
```

## Agent Success Criteria

### Quantitative Metrics

- ✅ TypeScript errors: <10 (from 1,172)
- ✅ P0 errors: 0 remaining
- ✅ Test pass rate: 100%
- ✅ Fix success rate: ≥95%

### Qualitative Metrics

- ✅ Zero regression (no new errors)
- ✅ Strict typing (no `any`)
- ✅ Clean imports (no unused/duplicate)
- ✅ Well-documented patterns and solutions

## Related Artifacts

### Reference Documentation
- `CLAUDE.md` (TypeScript configuration, strict mode settings)
- `tsconfig.json` (Compiler options, path aliases)

### Previous Sessions
- `_bmad-output/ralph-loop-cycle-12-iteration-17-completion-2026-01-01.md` (87 errors fixed)

### Research Documents
- `agents/typescript-fixer-research.md` (TypeScript error patterns, fix strategies)

---

**Agent Owner**: @bmad-bmm-dev
**Agent Maintainer**: @bmad-bmm-tea
**Last Updated**: 2026-01-03
**Agent Status**: ACTIVE - READY FOR TS ERROR FIXING
