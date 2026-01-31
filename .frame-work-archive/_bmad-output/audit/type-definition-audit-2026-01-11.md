# Type Definition Audit
**Date:** 2026-01-11
**Category:** Type System - Duplicates, Inconsistencies, Violations
**Status:** Complete

---

## Executive Summary

This document audits type definitions across the codebase, identifying:
- Duplicate type definitions
- Type contract violations
- Inconsistent type usage
- Misplaced type files

**Key Findings:**
- **Duplicate Type Definitions:** 8+ instances
- **Contract Violations:** 3 instances
- **Misplaced Types:** 2 instances
- **Inconsistent Definitions:** 5+ instances

---

## 1. Duplicate Type Definitions

### 1.1 ValidationResult (4+ Definitions)

**Severity:** HIGH

**Locations:**
1. `src/domain/services/agent-orchestration-service.ts:15`
2. `src/domain/services/workspace-transition-service.ts:227`
3. `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts`
4. (Possibly more in other files)

**Definition Pattern:**
```typescript
// Defined in at least 4 places
interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```

**Impact:**
- Type drift risk - definitions may diverge
- Maintenance burden - changes must be mirrored
- Import confusion - unclear which to use
- Potential for subtle bugs if definitions differ

**Remediation:**
1. Create canonical definition in `src/domain/types/common-types.ts`
2. Update all files to import canonical version
3. Add ESLint rule to prevent future duplicates

---

### 1.2 ProviderResponse (2 Definitions)

**Severity:** MEDIUM

**Locations:**
1. `src/domain/types/llm/provider-types.ts:376` (Canonical)
2. `src/routes/$__debug__.provider-playground.tsx:79` (Duplicate)

**Duplicate Definition:**
```typescript
// $__debug__.provider-playground.tsx:79
interface ProviderResponse {
  content: string;
  usage?: TokenUsage;
  // ... duplicates domain type
}
```

**Impact:**
- Risk of drift from canonical definition
- Debug route may break if domain type changes
- Unnecessary duplication

**Remediation:**
1. Remove duplicate from debug route
2. Import from `src/domain/types/llm/provider-types.ts`

---

### 1.3 Provider Types Scattered (4 Locations)

**Severity:** MEDIUM

**Locations:**
1. `src/shared/types/index.ts` (lines 21-27)
2. `src/lib/agent/providers/types.ts`
3. `src/infrastructure/persistence/stores/providers/types.ts`
4. `src/domain/types/llm/provider-types.ts` (Should be canonical)

**Analysis:**
Provider-related types defined in four separate locations with potential inconsistencies.

**Impact:**
- Unclear canonical source
- Risk of inconsistency
- Import confusion
- Potential for subtle bugs

**Remediation:**
1. Audit all provider type definitions
2. Consolidate to `src/domain/types/llm/provider-types.ts`
3. Update all imports
4. Deprecate other locations

---

### 1.4 TokenUsage (3+ Definitions)

**Severity:** MEDIUM

**Locations:**
1. `src/domain/types/llm/model-types.ts`
2. `src/lib/agent/providers/types.ts`
3. `src/shared/types/index.ts`

**Impact:** Similar to ProviderResponse - risk of drift

---

## 2. Type Contract Violations

### 2.1 AgentProviderValidator Contract

**Severity:** MEDIUM

**Location:** `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts:70`

**Contract:** Function should always return `ValidationResult` with error message

**Actual Behavior:** Sometimes throws without returning `ValidationResult`

**Issue:** Inconsistent error handling pattern

**Impact:**
- Callers must handle both return values and throws
- Violates function signature contract
- Makes error handling unpredictable

**Remediation:**
1. Standardize on returning ValidationResult always
2. Remove throws in favor of error results
3. Update all callers

---

### 2.2 UniversalProviderRegistry.update()

**Severity:** MEDIUM

**Location:** `src/domain/services/universal-provider-registry.ts:298`

**Contract:** Method signature suggests it always returns updated entry

**Actual Behavior:** Returns `undefined` when entry not found

**Issue:** Contract ambiguity

**Code:**
```typescript
// Signature suggests always returns
update(id: string, config: Partial<ProviderConfig>): ProviderConfig | undefined

// But documentation says "returns undefined if not found"
// This creates ambiguity for callers
```

**Remediation:**
1. Either: Throw if entry not found (fail fast)
2. Or: Rename to `updateIfExists()` for clarity
3. Document behavior clearly

---

### 2.3 ProjectRegistry Conflict Detection

**Severity:** LOW-MEDIUM

**Locations:**
- `ProjectRegistry.detectConflict()`
- `ProjectRegistry.resolveConflict()`

**Issue:** `detectConflict()` returns `isResolvable: false` for conflicts that `resolveConflict()` can handle

**Impact:** Inconsistent API promises

**Remediation:**
1. Align conflict detection with resolution capabilities
2. Document what conflicts are actually resolvable

---

## 3. Type Safety Issues

### 3.1 Type Assertions with `as any`

**Severity:** MEDIUM

**Location:** `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts:59`

**Issue:** Type assertions using `as any` when accessing domain services

**Code Pattern:**
```typescript
const someValue = domainService.someMethod() as any;
```

**Impact:**
- Bypasses type checking
- Hides potential errors
- Makes refactoring dangerous
- Loses type safety benefits

**Remediation:**
1. Properly type the return values
2. Add proper type definitions for domain services
3. Remove `as any` assertions

---

### 3.2 Ambiguous Input Types

**Severity:** MEDIUM

**Location:** `src/domain/services/agent-workspace-utils.ts:30`

**Issue:** Functions expect both plain objects AND class instances

**Impact:**
- Runtime type checking required
- Type safety compromised
- Unclear API contract

**Remediation:**
1. Standardize on one input format
2. Add proper type guards
3. Document expected format

---

### 3.3 Optional vs Required Confusion

**Severity:** LOW-MEDIUM

**Location:** `src/domain/types/llm/provider-types.ts:302`

**Issue:** `keyId` in `UniversalProviderConfig` is optional but used in critical paths

**Code:**
```typescript
interface UniversalProviderConfig {
  keyId?: string;  // Optional...
  // But used in critical paths where it's required
}
```

**Impact:**
- Runtime null checks needed everywhere
- Potential for null reference errors

**Remediation:**
1. Make keyId required if it's always needed
2. Or: Create separate config types for authenticated vs non-authenticated

---

## 4. Misplaced Type Files

### 4.1 project-registry-types.ts

**Severity:** LOW

**Current Location:** `src/domain/services/project-registry-types.ts`

**Should Be:** `src/domain/types/project-registry-types.ts`

**Issue:** Type definitions in services directory

**Remediation:** Move to types directory

---

### 4.2 Shared Types Ambiguity

**Location:** `src/shared/types/index.ts`

**Issue:** "Shared" is unclear - shared with what?

**Analysis:** Contains provider types that should be in domain layer

**Remediation:**
1. Audit contents
2. Move to appropriate domain locations
3. Deprecate if unnecessary

---

## 5. Legacy/Deprecated Fields

### 5.1 ProviderConfig.isActive

**Location:** `src/domain/types/llm/provider-types.ts:106`

**Issue:** Contains deprecated `isActive` field

**Impact:**
- Confusing API surface
- Unclear which fields to use
- Maintenance burden

**Remediation:**
1. Remove deprecated fields
2. Document deprecation timeline if recently removed

---

## 6. Type Import Patterns

### 6.1 Inconsistent Import Sources

**Issue:** Same type imported from different locations across codebase

**Example:**
```typescript
// Some files:
import { ProviderConfig } from '@/domain/types/llm/provider-types';

// Other files:
import { ProviderConfig } from '@/shared/types';
import { ProviderConfig } from '@/lib/agent/providers/types';
```

**Impact:**
- Confusing navigation
- Risk of importing wrong version
- Difficult to refactor

**Remediation:**
1. Establish canonical import paths
2. Add ESLint rule for import enforcement
3. Document import patterns

---

## 7. Remediation Priority

### P0 - Critical
1. Consolidate `ValidationResult` to single definition
2. Remove `as any` type assertions

### P1 - High
3. Consolidate provider types to single location
4. Fix `ProviderResponse` duplication

### P2 - Medium
5. Fix contract violations in validation
6. Resolve `UniversalProviderRegistry` ambiguity
7. Fix ambiguous input types

### P3 - Low
8. Move misplaced type files
9. Remove deprecated fields
10. Standardize import patterns

---

## 8. Success Metrics

**Before:**
- Duplicate types: 8+ instances
- Contract violations: 3 instances
- Type assertions with `as any`: Multiple

**After:**
- Duplicate types: 0
- Contract violations: 0
- Type assertions: 0 (or justified with comments)

---

## Related Artifacts

- [Comprehensive Codebase Audit](./comprehensive-codebase-audit-2026-01-11.md)
- [Architecture Conflicts Analysis](./architecture-conflicts-2026-01-11.md)

---

*Audit conducted by: BMAD Type System Analysis Agent*
*Report Version: 1.0*
