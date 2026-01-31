---
name: 'step-04-performance'
description: 'Phase 3: Analyze performance bottlenecks - load time, DB ops, re-renders'

workflow_path: '{project-root}/_bmad/bmm/workflows/codebase-diagnostic'
thisStepFile: '{workflow_path}/steps/step-04-performance.md'
nextStepFile: '{workflow_path}/steps/step-05-features.md'
outputPath: '{output_folder}/diagnostics/codebase-diagnostic-{date}/phase-3'
---

# Step 4: Performance Bottleneck Analysis (Phase 3)

## STEP GOAL

Identify performance bottlenecks: slow initial loads, heavy database operations, excessive re-renders, bundle size issues.

## MANDATORY EXECUTION RULES

- 🛑 Execute ALL 3 sub-agent prompts
- 📖 Focus on measurable performance issues
- 💾 Each analysis saved separately

---

## SUB-AGENT PROMPT 3.1: Initial Load Analysis

```
OBJECTIVE: Analyze what makes initial page load slow.

TRACE INITIAL LOAD SEQUENCE:
1. HTML document loads
2. JavaScript bundles fetch
3. React hydration
4. Providers initialize
5. First route renders
6. Data fetches complete

FOR EACH PHASE:
- What code executes?
- What is blocking?
- Estimated duration

ANALYZE:
1. Bundle size breakdown:
   - Check package.json dependencies
   - Identify heavy packages (monaco-editor, blocknote, etc.)
   - Check for code splitting (lazy imports)

2. Synchronous initialization:
   - Find all top-level code that runs on import
   - Find store initializations
   - Find database connections

3. Blocking operations in render:
   - useLiveQuery without suspense
   - Heavy computations in render
   - Large list renders without virtualization

OUTPUT FORMAT:
## Initial Load Analysis

### Load Sequence
| Phase | Duration Est | Blocking? | Files |
|-------|--------------|-----------|-------|
| Bundle fetch | Xms | Yes | |
| React init | Xms | Yes | |
| Provider init | Xms | Yes | |
| Route render | Xms | Yes | |
| Data load | Xms | Partial | |

### Heavy Dependencies
| Package | Size Est | Used In | Lazy? |
|---------|----------|---------|-------|
| monaco-editor | ~2MB | IDE | ? |
| @blocknote | ~500KB | Notes | ? |

### Blocking Operations
| Operation | File:Line | Phase | Impact |
|-----------|-----------|-------|--------|

### Code Splitting Status
| Route | Lazy Loaded? | Dependencies |
|-------|--------------|--------------|
| /notes | Yes (lazy.tsx) | |
| /ide | Yes (lazy.tsx) | |

### Recommendations
1. [Most impactful optimization]
2. [Second priority]

SAVE TO: {outputPath}/initial-load-analysis.md
```

---

## SUB-AGENT PROMPT 3.2: Database Operation Profiling

```
OBJECTIVE: Profile all Dexie database operations for performance issues.

FIND ALL DATABASE OPERATIONS:
grep -rn "db\." src --include="*.ts" --include="*.tsx" | grep -v "node_modules"

CATEGORIZE:
1. Read operations (get, where, toArray)
2. Write operations (put, add, update, delete)
3. Bulk operations (bulkPut, bulkAdd)
4. Subscription operations (useLiveQuery)

FOR EACH OPERATION:
1. What triggers it?
2. How often does it run?
3. How much data does it read/write?
4. Is it batched or individual?
5. Is it in render path (blocking UI)?

PROBLEM PATTERNS:
- Operations on every render
- Operations on every keystroke
- Large data reads without pagination
- Missing indexes on queried fields
- Transactions spanning multiple operations

OUTPUT FORMAT:
## Database Operation Profiling

### Operation Inventory
| Operation | File:Line | Trigger | Frequency | Data Size |
|-----------|-----------|---------|-----------|-----------|

### Hot Path Operations (Render Blocking)
| Operation | File | Impact | Fix |
|-----------|------|--------|-----|

### Frequent Operations (>10x per minute)
| Operation | File | Frequency | Batching? |
|-----------|------|-----------|-----------|

### Missing Indexes
| Table | Query Field | Has Index? |
|-------|-------------|------------|

### Optimization Recommendations
1. [Batch these operations: ...]
2. [Add index for: ...]
3. [Move to background: ...]

SAVE TO: {outputPath}/database-profiling.md
```

---

## SUB-AGENT PROMPT 3.3: Re-render Analysis

```
OBJECTIVE: Identify components that re-render excessively.

ANALYZE COMPONENTS FOR RE-RENDER RISK:

1. Components using useLiveQuery:
   - useLiveQuery returns new array reference each time
   - Components re-render on every query update

2. Components with multiple store subscriptions:
   - useStore(state => state) vs useStore(state => state.specific)
   - Missing shallow equality checks

3. Components with unstable props:
   - Objects/arrays created in render
   - Functions created in render (not useCallback)

4. Parent-child re-render chains:
   - Parent re-renders → all children re-render
   - Missing React.memo on children

5. Context consumers:
   - Context value changes → all consumers re-render
   - Missing memoization on context value

HIGH-RISK PATTERNS:
- useLiveQuery result directly in JSX
- useEffect with unstable dependencies
- store.getState() in render
- Object spread in props

OUTPUT FORMAT:
## Re-render Analysis

### Components by Risk Level

#### 🔴 High Risk (Re-renders frequently)
| Component | File | Reason | Evidence |
|-----------|------|--------|----------|

#### 🟡 Medium Risk
| Component | File | Reason | Evidence |
|-----------|------|--------|----------|

### useLiveQuery Re-render Risks
| Component | Query | Mitigation? |
|-----------|-------|-------------|

### Store Subscription Analysis
| Component | Store | Selector | Optimized? |
|-----------|-------|----------|------------|

### Optimization Recommendations
1. [Add React.memo to: ...]
2. [Fix selector in: ...]
3. [Memoize context value in: ...]

SAVE TO: {outputPath}/rerender-analysis.md
```

---

## ORCHESTRATOR SYNTHESIS

After ALL 3 sub-agents complete:

1. **Create Phase 3 Summary:**

```markdown
# Phase 3 Summary: Performance

## Critical Bottlenecks
1. [Most impactful bottleneck]
2. [Second priority]
3. [Third priority]

## Performance Metrics
| Area | Current | Target | Gap |
|------|---------|--------|-----|
| Initial Load | Xms | <1000ms | |
| Route Change | Xms | <200ms | |
| DB Query | Xms | <50ms | |

## Quick Wins
- [Fix that can be done in 1 hour]
- [Fix that can be done in 1 day]

## Major Refactors Needed
- [Refactor requiring significant effort]
```

2. **Save:** `{outputPath}/phase-3-summary.md`

---

## MENU OPTIONS

- **[C] Continue** → Load step-05-features.md
- **[R] Review** → Examine performance outputs
- **[RE] Re-execute** → Re-run specific prompt

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All 3 analysis files created
- Bottlenecks quantified with estimates
- Optimization recommendations provided

### ❌ FAILURE:
- Missing analysis files
- Vague "it's slow" without specifics
- No actionable recommendations
