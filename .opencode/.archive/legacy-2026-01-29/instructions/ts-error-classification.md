# GOVERNANCE RULE: TypeScript Error Classification & Handling

**Version**: 1.0.0
**Created**: 2026-01-25
**Status**: ACTIVE
**Governance Tier**: 2 (Controlled)
**Applies To**: All agents handling TypeScript errors

---

## 🎯 PURPOSE

Prevent dev-ext agents from attempting architectural fixes on TypeScript errors that require architect-ext intervention. Ensure clear delegation boundaries between implementation and architecture work.

---

## 📋 ERROR CLASSIFICATION MATRIX

### Category A: Simple Type Errors (DEV-EXT CAN FIX)

**Fixable by dev-ext with NO architectural impact**

| Error Type | Examples | Fix Approach |
|------------|----------|--------------|
| Missing imports | `Cannot find name 'Component'` | Add import statement |
| Unused variables | `Variable declared but never used` | Remove or prefix with `_` |
| Unused imports | `All imports unused` | Remove unused import |
| Wrong type annotation | `Type 'string' not assignable to 'number'` | Correct annotation |
| Null/undefined checks | `Object possibly null` | Add null check |
| Property access safety | `Property 'x' does not exist on type 'Y'` | Use optional chaining or add to type |
| Explicit any | `Parameter implicitly has 'any'` | Add explicit type annotation |
| Duplicate exports | `Export declaration conflicts` | Remove duplicate |
| Array literal type | `Object literal may only specify known properties` | Fix property name or type |

**Files Typically in Category A:**
- Component files (`*.tsx`)
- Utility functions (`*.ts` helper files)
- Test files (`*.test.ts`, `*.test.tsx`)
- Simple type definition files

**Example Fix:**
```typescript
// ❌ Before (Category A - Simple Fix)
import { Button } from '@/ui/button';

function Component() {
  return <div>Content</div>;
}
```

```typescript
// ✅ After
import { Button } from '@/ui/button';

function Component() {
  return <div>Content</div>;
}
// Note: If Button was unused, just remove the import
```

---

### Category B: Map/Array Method Confusion (DEV-EXT CAN FIX - PATTERN KNOWN)

**Fixable by dev-ext using established pattern**

| Error Type | Examples | Fix Approach |
|------------|----------|--------------|
| Map using Array methods | `Property 'filter' does not exist on type 'Map'` | `Array.from(map.values()).filter(...)` |
| Map using Array.find | `Property 'find' does not exist on type 'Map'` | `Array.from(map.values()).find(...)` |
| Map forEach | Property 'forEach' exists (OK to use) | Keep as-is |

**Files Typically in Category B:**
- Cache management files
- Store implementations
- Sync/replication logic

**Example Fix:**
```typescript
// ❌ Before (Category B - Pattern Fix)
const notes: Map<string, NoteRecord> = new Map();
const filtered = notes.filter(n => n.active); // Error: filter doesn't exist on Map

// ✅ After
const notes: Map<string, NoteRecord> = new Map();
const filtered = Array.from(notes.values()).filter(n => n.active);
```

---

### Category C: Architecture-Level Type Mismatches (ARCHITECT-EXT MUST FIX)

**REQUIRES architect-ext analysis - DO NOT PATCH**

| Error Type | Examples | Action Required |
|------------|----------|-----------------|
| SDK/Type incompatibility | `unknown[] is not assignable to AnyClientTool[]` | **STOP** - Create ARCHITECT-REPORT artifact |
| Missing properties on domain types | `Property 'knowledge' does not exist on type` | **STOP** - Type definition incomplete |
| Wrong type contracts | `Promise<Block[]>` assigned to `Block[]` | **STOP** - Architectural flaw in contract |
| Missing properties on interfaces | `Type 'X' is missing properties from type 'Y'` | **STOP** - Investigate with architect-ext |
| Wrong data structure pattern | `Map` where `Array` expected (or vice versa) | **STOP** - Architect needs to decide data model |

**Files Typically in Category C:**
- Domain entities (`src/domain/entities/`)
- Domain services (`src/domain/services/`)
- Core business logic
- SDK integration layers
- API contracts/interfaces
- Store state types (core state shape)

**Example - DO NOT FIX (Category C):**
```typescript
// ❌ WRONG - DO NOT PATCH THIS
// Error: unknown[] is not assignable to AnyClientTool[]
// This is an SDK type incompatibility - architect must decide how to handle
const tools: AnyClientTool[] = toolRegistry.getAll(); // Returns unknown[]

// ✅ CORRECT ACTION - Create ARCHITECT-REPORT
// Document the error, file location, and let architect-ext handle it
```

---

### Category D: Missing Property on Core Types (ARCHITECT-EXT MUST FIX)

**REQUIRES architect-ext - Domain model incomplete**

| Error Type | Examples | Action Required |
|------------|----------|-----------------|
| Missing property on Project type | `Property 'deviceType' does not exist on type 'Project'` | **STOP** - Project type definition incomplete |
| Missing property on domain entities | `Property 'keyConcepts' does not exist on type 'KnowledgeSource'` | **STOP** - Entity needs architect to add property |
| Missing properties on wizard/form types | `Property 'selectedAgent' does not exist on type 'WizardFormData'` | **STOP** - Form type definition incomplete |

**Files Typically in Category D:**
- Type definition files (`src/domain/types/`)
- Domain entity files
- Wizard/form type files

**Example - DO NOT FIX (Category D):**
```typescript
// ❌ WRONG - DO NOT PATCH THIS
// Error: Property 'deviceType' does not exist on type 'Project'
// Adding deviceType to Project type without architect approval is wrong
const deviceType = project.deviceType; // Error

// ✅ CORRECT ACTION - Create ARCHITECT-REPORT
// Document: Project type missing deviceType property
// Let architect-ext add it with proper typing and update ADR-034 if needed
```

---

### Category E: Duplicate/Conflicting Exports (DEV-EXT CAN FIX - CAUTION)

**Fixable by dev-ext BUT requires careful analysis**

| Error Type | Examples | Fix Approach |
|------------|----------|--------------|
| Export declaration conflicts | `Export declaration conflicts with exported declaration` | Remove duplicate, verify intended API |
| Re-export conflicts | Multiple re-exports of same name | Consolidate to single source |

**CAUTION**: Before fixing, check if duplicate exports serve different purposes (e.g., default export vs named export, different implementations).

**Example Fix:**
```typescript
// ❌ Before (Category E - Duplicate Export)
export function completeTrace() { /* implementation 1 */ }
export function completeTrace() { /* implementation 2 */ } // Error: duplicate

// ✅ After (Consolidate)
export function completeTrace() {
  /* Single implementation */
}
```

---

### Category F: Type Safety Violations (DEV-EXT CAN FIX)

**Fixable by dev-ext - Improves code quality**

| Error Type | Examples | Fix Approach |
|------------|----------|--------------|
| Unused @ts-expect-error | `Unused '@ts-expect-error' directive` | Remove directive (error was fixed) |
| Implicit any (non-SDK) | `Parameter implicitly has 'any'` | Add type annotation |
| Missing generics | Type inference failure | Add explicit generic |

**Files Typically in Category F:**
- API route files
- Migration scripts
- Utility functions

**Example Fix:**
```typescript
// ❌ Before (Category F - Type Safety)
// @ts-expect-error: This was expected to fail but it doesn't anymore
const result = someFunction(); // No error now

// ✅ After
// Remove the directive - error was fixed
const result = someFunction();
```

---

## 🔍 DECISION TREE FOR DEV-EXT

```
START: TypeScript Error Found
       │
       ├─ Is it unused variable/import?
       │  └─ YES → Remove it (Category A)
       │
       ├─ Is it missing import?
       │  └─ YES → Add import (Category A)
       │
       ├─ Is it wrong type annotation?
       │  └─ YES → Correct annotation (Category A)
       │
       ├─ Is it Map using Array methods (filter/find)?
       │  └─ YES → Use Array.from(map.values()) (Category B)
       │
       ├─ Is it SDK type incompatibility (unknown[], AnyClientTool)?
       │  └─ YES → **STOP** - Create ARCHITECT-REPORT (Category C)
       │
       ├─ Is it missing property on domain type (Project, KnowledgeSource)?
       │  └─ YES → **STOP** - Create ARCHITECT-REPORT (Category D)
       │
       ├─ Is it duplicate export?
       │  └─ YES → Remove duplicate (Category E) - Verify API first
       │
       ├─ Is it unused @ts-expect-error?
       │  └─ YES → Remove directive (Category F)
       │
       └─ UNSURE?
          └─ **STOP** - Create ARCHITECT-REPORT
```

---

## 📋 ARCHITECT-REPORT ARTIFACT TEMPLATE

When dev-ext encounters Category C or D errors, create this artifact:

```markdown
# ARCHITECT-REPORT: TypeScript Error Analysis

**Created**: [DATE-TIME]
**Agent**: dev-ext
**Priority**: P0 (Blocks development)
**Status**: READY_FOR_ARCHITECT
**File**: [File path with error]

---

## Error Summary

**Error Type**: [Category C or D]
**Error Message**: [Full error message]
**File**: [File path]
**Line**: [Line number]

---

## Analysis

**Why This Is Architectural:**
[Explain why this requires architect-ext intervention]

**Potential Solutions:**
[List 2-3 possible approaches architect could take]

**Impact Assessment:**
[What breaks if this isn't fixed?]

---

## Recommendation

**Recommended Action**: [What architect-ext should do]

**Priority**: P0/P1/P2

**Estimated Effort**: [Hours]

---

## References

**ADR**: [ADR-034 or relevant ADR]
**Type Definition**: [Relevant type definition file]
**Related Errors**: [Other similar errors]
```

---

## ✅ ACCEPTANCE CRITERIA

### For dev-ext (Fixing Category A, B, E, F):

- [ ] Error is classified correctly (A, B, E, or F)
- [ ] Fix follows established patterns
- [ ] No new TypeScript errors introduced
- [ ] Runtime behavior unchanged (verified by tests)
- [ ] Code compiles with `pnpm tsc --noEmit`
- [ ] All imports resolved correctly
- [ ] No dead code added

### For dev-ext (Creating ARCHITECT-REPORT for Category C, D):

- [ ] ARCHITECT-REPORT artifact created
- [ ] Error classified as Category C or D
- [ ] Analysis includes impact assessment
- [ ] 2-3 potential solutions proposed
- [ ] Priority assigned
- [ ] References to relevant ADRs included
- [ ] NO code changes attempted

### For architect-ext (Handling Category C, D):

- [ ] ARCHITECT-REPORT reviewed
- [ ] Architectural decision documented (ADR or update existing)
- [ ] Type definitions updated in domain layer
- [ ] All consumers updated
- [ ] ARCHITECT-REPORT archived as RESOLVED
- [ ] LOOP_STATE.yaml updated with fix details

---

## 🚨 CRITICAL RULES

1. **NEVER** attempt to fix Category C or D errors without architect-ext approval
2. **ALWAYS** create ARCHITECT-REPORT for Category C or D errors
3. **NEVER** add properties to domain types (Project, Note, etc.) without architect
4. **NEVER** modify SDK integration types without architect-ext analysis
5. **ALWAYS** verify fix doesn't introduce new errors
6. **NEVER** use `// @ts-ignore` or `// @ts-expect-error` as a workaround
7. **ALWAYS** run `pnpm tsc --noEmit` after fixes
8. **NEVER** push code with TypeScript errors to main branch

---

## 📊 CATEGORY BREAKDOWN OF CURRENT ERRORS (2026-01-25)

Based on current `pnpm tsc --noEmit` output (~83 errors):

| Category | Count | Agent Responsible | Status |
|----------|-------|-------------------|--------|
| A (Simple Fixes) | ~25 | dev-ext | READY_TO_FIX |
| B (Map/Array) | ~15 | dev-ext | READY_TO_FIX |
| C (SDK/Architecture) | ~20 | architect-ext | BLOCKING |
| D (Missing Properties) | ~15 | architect-ext | BLOCKING |
| E (Duplicate Exports) | ~5 | dev-ext | READY_TO_FIX |
| F (Type Safety) | ~3 | dev-ext | READY_TO_FIX |

**Total Fixable by dev-ext:** ~48 errors (Category A, B, E, F)
**Total requiring architect-ext:** ~35 errors (Category C, D)

---

## 🔄 WORKFLOW

```
dev-ext encounters TypeScript error
        │
        ├─ Classify error (A/B/C/D/E/F)
        │
        ├─ A/B/E/F → Fix error
        │   │
        │   ├─ Run pnpm tsc --noEmit
        │   ├─ Verify no new errors
        │   └─ Report completion to sprint-manager
        │
        └─ C/D → Create ARCHITECT-REPORT
            │
            ├─ Document error
            ├─ Analyze impact
            ├─ Propose solutions
            └─ Hand off to architect-ext
                    │
                    ├─ architect-ext reviews
                    ├─ Architect makes decision
                    ├─ Update type definitions
                    ├─ Update ADR if needed
                    └─ Report completion to sprint-manager
```

---

## 📝 CHANGE HISTORY

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-25 | 1.0.0 | Initial creation | orchestrator |

---

## 🔗 REFERENCES

- ADR-034: Project-Centric Architecture
- LOOP_STATE.yaml: TypeScript error tracking
- EPIC-TS-DEBT: TypeScript Technical Debt Remediation Epic
