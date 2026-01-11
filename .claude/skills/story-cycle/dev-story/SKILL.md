---
name: dev-story-enhanced
description: Develop story with TDD, EN/glob context loadingFORCED grep, architectural conflict detection, and systematic code analysis. Use when user says "dev story", "implement story", or after pre-planning passes. RED-GREEN-REFACTOR cycle with deep analysis.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 61
agents:
  - bmad-bmm-dev
triggers:
  - dev story
  - implement story
  - develop story
  - /dev-story
  - enhanced dev story
---

# Step 06: Develop Story - Enhanced with Deep Analysis

**Purpose**: Implement story using TDD (Red-Green-Refactor) cycle with **ENFORCED** grep/glob context loading, architectural conflict detection, and systematic code analysis.

## Critical Change (v2.0)

**OLD**: Jump straight into implementation after reading story.

**NEW**: MUST execute grep/glob context loading and architectural conflict detection BEFORE writing any code. This is non-negotiable.

## When to use

- After pre-planning gate passes
- User says "dev story" or "implement story"
- Starting development work
- Implementation phase

## Instructions

### 1. ENFORCED: Load Context via Systematic Code Analysis

**BEFORE ANY CODE, execute these commands:**

```bash
# Step 1a: Glob all related files
echo "=== GLOB: Related Components ==="
glob pattern="src/presentation/components/**/{ComponentName}*"

echo "=== GLOB: Related Stores ==="
glob pattern="src/infrastructure/persistence/stores/**/*Store*"

echo "=== GLOB: Domain Types ==="
glob pattern="src/domain/{types,services}/**"

echo "=== GLOB: Routes ==="
glob pattern="src/routes/**/*"

# Step 1b: Grep for related patterns
echo "=== GREP: Related Imports ==="
grep pattern="import.*{RelatedModule}" include="*.ts,*.tsx" path="src"

echo "=== GREP: Usages ==="
grep pattern="{ComponentName}|{HookName}" include="*.ts,*.tsx" path="src"

echo "=== GREP: Route Definitions ==="
grep pattern="{route_path}" include="*.ts" path="src/routes"

echo "=== GREP: Store Subscriptions ==="
grep pattern="useStore|useShallow.*{StoreName}" include="*.ts,*.tsx" path="src"

# Step 1c: Read key files
echo "=== READ: Key Files for Understanding ==="
read file="src/presentation/components/{Component}/{Component}.tsx"
read file="src/infrastructure/persistence/stores/{Store}/{Store}.ts"
read file="src/domain/types/{Type}.ts"
read file="src/routes/{route}/route.ts"
read file="src/domain/services/{Service}.ts"
```

### 2. ENFORCED: Architectural Conflict Detection

**BEFORE ANY CODE, execute these checks:**

```bash
# Clean Architecture Violations
echo "=== CHECK: Cross-layer imports ==="
grep pattern="@/infrastructure.*@/presentation" include="*.ts,*.tsx" path="src"

echo "=== CHECK: Domain logic in infrastructure ==="
grep pattern="@/infrastructure/.*business|.*logic" include="*.ts" path="src"

# Circular Dependencies
echo "=== CHECK: Circular dependencies ==="
bash command: "pnpm deptcheck 2>/dev/null || echo 'deptcheck not available'"

# God Patterns
echo "=== CHECK: Large components (>300 lines) ==="
bash command: "find src -name '*.tsx' -exec wc -l {} \; | sort -rn | head -10"

echo "=== CHECK: Large stores (>120 lines) ==="
bash command: "find src -name '*Store*.ts' -exec wc -l {} \; | sort -rn | head -10"

# Import Pattern Violations
echo "=== CHECK: Deep relative imports ==="
grep pattern="from '\\.\\.\\.\\.\\.\\.'" include="*.ts" path="src"
```

### 3. Document Conflict Detection Results

Add to story file:
```markdown
## Architectural Conflict Detection (Pre-Implementation)

### Clean Architecture
- Cross-layer imports: {count} found
- Domain logic in infrastructure: {count} found
- Status: ✅ COMPLIANT / ⚠️ WARNINGS / ❌ VIOLATIONS

### Circular Dependencies
- Detected: {count}
- Status: ✅ NONE / ❌ EXISTS

### God Patterns
- Large components (>300 lines): {count}
- Large stores (>120 lines): {count}
- Status: ✅ OK / ⚠️ NEEDS REFACTOR

### Import Violations
- Deep relative imports: {count}
- Status: ✅ OK / ⚠️ NEEDS FIX
```

### 4. Dead Code & Overlap Detection

```bash
# Orphaned files
echo "=== CHECK: Orphaned files ==="
bash command: "find src -name '*.ts' -o -name '*.tsx' | xargs -I{} sh -c 'grep -l \"import.*{}\" src/**/*.ts 2>/dev/null > /dev/null || echo {}' 2>/dev/null"

# Duplicate logic
echo "=== CHECK: Duplicate patterns ==="
bash command: "grep -r \"function.*similar\" src/ 2>/dev/null || echo 'No obvious duplicates'"

# Conflicting changes
echo "=== CHECK: Git diff ==="
bash command: "git diff --name-only HEAD~1..HEAD | grep -E '\\.(ts|tsx)$'"
```

### 5. TDD Implementation Cycle

#### Red: Write Failing Test

```bash
# Create test file first
WRITE: test/path/to/{feature}.test.ts

# Test should FAIL initially
bash command: "pnpm test {test_file}"
# Expected: Failure (RED)
```

**Evidence**: Capture test file and initial failure output.

#### Green: Make Test Pass

```bash
# Write minimal implementation
WRITE: src/path/to/{feature}.ts

# Run test again
bash command: "pnpm test {test_file}"
# Expected: Success (GREEN)
```

**Evidence**: Capture passing test output.

#### Refactor: Improve Code

```bash
# Refactor while keeping tests green
bash command: "pnpm test"
# Ensure: All tests still pass
```

### 6. Implementation Steps

Follow the implementation plan from pre-planning with evidence:

```yaml
implementation_with_evidence:
  step_1:
    action: "Create {file}"
    file: "{path}"
    lines: "{N}-{M}"
    test: "{test_file}"
    evidence: "File created, test passes"
    
  step_2:
    action: "Modify {file}"
    file: "{path}"
    changes: "{description}"
    lines_affected: "{N}-{M}"
    evidence: "Changes applied, tests pass"
    
  step_3:
    action: "Update store"
    file: "{path}"
    slice: "{slice_name}"
    lines_affected: "{N}-{M}"
    evidence: "Store updated, selector works"
```

### 7. Update Dev Agent Record

**Add to story file:**
```markdown
## Dev Agent Record

### Agent
- Model: {model_name}
- Session: {timestamp}

### Context Loaded (Evidence)
- Files Globbed: {count}
- Files Grepped: {count}
- Files Read: {count}
- Key Files Analyzed:
  - {file}:{line} - {purpose}
  - {file}:{line} - {purpose}

### Architectural Conflict Detection
- Clean Architecture: ✅ COMPLIANT
- Circular Dependencies: ✅ NONE
- God Patterns: ✅ OK
- Violations Found: {count} / Resolved: {count}

### Dead Code Detection
- Orphaned Files: {count}
- Duplicate Logic: {count}
- Conflicting Changes: {count}
- Actions Taken: {list}

### Task Progress
- [x] T1: {task} - {file}:{line}
- [x] T2: {task} - {file}:{line}
- [ ] T3: {task} - IN PROGRESS

### Research Executed
*Document MCP research findings*

### Files Changed
| File | Action | Lines | Evidence |
|------|--------|-------|----------|
| {file} | created | {N} | Test passes |
| {file} | modified | +{N}/-{M} | Tests pass |

### Tests Created
- {test_file}: {count} tests (all passing)

### Decisions Made
- Decision 1: {rationale} - {file}:{line}
```

### 8. TypeScript Check

**Before marking complete:**
```bash
# Check for TypeScript errors (production files only)
bash command: "pnpm tsc --noEmit 2>&1 | grep -v 'test/'"

# Expected: Zero new errors in production code
# Test file errors are non-blocking
```

### 9. Update Story Status

```yaml
{story_key}:
  status: "implementation-complete"
  implemented_at: {timestamp}
  files_changed: {N}
  tests_created: {N}
  context_loaded: true
  conflicts_detected: {count}
  conflicts_resolved: {count}
```

## Validation (100% Pass Required)

Before proceeding to code review:
- [ ] **Context loaded** via grep/glob (evidence required)
- [ ] **Architectural conflict detection** executed (results documented)
- [ ] **Dead code detection** performed (results documented)
- [ ] All acceptance criteria addressed
- [ ] All tests passing (unit + integration)
- [ ] TypeScript check passes (production code)
- [ ] Implementation follows pre-planning approach
- [ ] Files created/modified as planned
- [ ] Dev Agent Record updated with evidence

## Error Handling

| Error | Action |
|-------|--------|
| Context not loaded | STOP - execute grep/glob first |
| Architectural violation detected | Document and fix or defer |
| TypeScript errors | Fix before proceeding |
| Test failures | Debug and fix |
| Timebox exceeded | Trigger correct-course |

## v2.0 Improvements

| Aspect | v1.0 | v2.0 Enhanced |
|--------|------|---------------|
| Context Loading | Read story only | Enforced grep/glob analysis |
| Conflict Detection | None | Systematic architectural check |
| Dead Code | None | Overlap detection |
| Evidence | Minimal | File:line references |
| Validation | Basic | Evidence-based checklist |

## Next Step

After implementation complete:
- Proceed to: [code-review](../code-review/SKILL.md)

If blocked:
- Trigger: [correct-course](../utils/correct-course/SKILL.md)

---

**Source**: `_bmad-ext/modules/implementation/workflows/story-cycle/steps/step-03-implement.md`
**Version**: 2.0.0
**Last Updated**: 2026-01-12
