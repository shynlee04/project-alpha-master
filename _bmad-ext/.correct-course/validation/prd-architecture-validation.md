# PRD/Architecture Validation Report

**Generated**: 2026-01-18T21:00:00+07:00
**Validator**: architect-ext
**Scope**: PRD, Architecture Document, ADR-033, ADR-034, ADR-035, and actual implementation

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Documents Validated | 4 (PRD, Architecture, ADR-033, ADR-034, ADR-035) |
| Contradictions Found | 6 |
| ADR Misalignments | 4 |
| Implementation Mismatches | 3 |
| Severity: Critical | 2 |
| Severity: High | 5 |
| Severity: Medium | 3 |

---

## Contradictions Found

| # | Document A | Document B | Issue | Severity |
|---|------------|------------|-------|----------|
| C1 | PRD (Line 28) | Architecture (Line 84) | PRD calls system "Desktop-First IDE with mobile Notes/Knowledge/Study access" but Architecture says "browser-based, **mobile-first** AI development workspace" | **HIGH** |
| C2 | PRD (Line 33) | Architecture (Line 84) | PRD claims "Entry Matrix: New/Returned User x Desktop/Mobile/Tablet" but Architecture calls system "mobile-first" - contradictory positioning | **HIGH** |
| C3 | PRD (Line 54) | Paper 2 Validation | PRD says "Mobile-First IDE - No competitor has this" but mobile users are **blocked from IDE** per ADR-033 D1 | **CRITICAL** |
| C4 | Architecture (Line 96) | ADR-033 (D1) | Architecture states "Clean Architecture Compliance: ~50%" but ADR-033 has no such metric - appears to be fabricated | **MEDIUM** |
| C5 | PRD (Line 36) | Paper 2 Validation | PRD claims "31 infection points identified (ADR-034)" but Paper 2 found **duplicate interface definitions** and **XSS vectors** not mentioned in PRD | **MEDIUM** |
| C6 | Architecture (Line 39) | Actual Code | Architecture says "God Components: 8 (Not 19)" but Paper 2 validation found **no god stores** - `dexie-db.ts` is a facade, not a god store | **HIGH** |

---

## ADR Misalignments

| # | ADR | Document Claim | Actual | Impact |
|---|-----|----------------|--------|--------|
| M1 | ADR-033 D1 | PlatformContract interface defined once | **DUPLICATE**: Interface defined in `platform-contract.ts:74` AND `storage-types.ts:90` | Violates single source of truth |
| M2 | ADR-033 D1 | DeviceType = 'desktop' \| 'mobile' \| 'tablet' | **NAMING INCONSISTENCY**: `platform-contract.ts` uses `DeviceType` while `storage-types.ts` uses `PlatformType` | Confusion, potential type errors |
| M3 | ADR-033 D10 | Handle storage: Single source `db.fsaHandles` via `HandlePersistenceService` | **VIOLATION**: Paper 2 found **3 different handle managers** (FSA-009 in ADR-034) | Persistence broken |
| M4 | ADR-035 | Chrome version check must use `>= 129` for structuredClone | **BUG STILL EXISTS**: ADR-035 Bug 001 cites `handle-persistence.ts` with exact match `=== 129` | P0 blocker |

---

## Implementation Mismatches

| # | Claim | Implementation | Evidence | Status |
|---|-------|----------------|----------|--------|
| I1 | PlatformContract exists with canAccessIDE | ✅ EXISTS | `src/infrastructure/filesystem/platform-contract.ts:74-95` | ALIGNED |
| I2 | getPlatformContract() cached | ✅ EXISTS | `src/infrastructure/filesystem/platform-contract.ts:263-270` | ALIGNED |
| I3 | Route guards use PlatformContract | ✅ EXISTS | `src/infrastructure/filesystem/route-guards.ts:24` | ALIGNED |
| I4 | StorageGateway interface | ⚠️ INCOMPLETE | Interface exists in docs, but 8 direct Dexie calls found bypassing it | **MISMATCH** |
| I5 | Chrome 129+ detection | ❌ BUGGY | ADR-035 Bug 001: Still uses exact match `=== 129` instead of `>= 129` | **MISMATCH** |
| I6 | FSA handle persistence | ❌ BROKEN | ADR-034 FSA-001 through FSA-010: Multiple issues with handle storage | **MISMATCH** |

---

## Detailed Analysis

### C1 & C2: "Mobile-First" vs "Desktop-First" Contradiction

**PRD Line 28-31**:
> "Via-Gent is a browser-based AI-powered development workspace..."
> "Via-Gent is a **Desktop-First IDE** with mobile Notes/Knowledge/Study access."

**Architecture Line 84**:
> "Via-Gent is a browser-based, **mobile-first** AI development workspace..."

**Root Cause**: Architecture document incorrectly describes the system. Per ADR-033 D1, the IDE is **desktop-only** because it requires FSA and WebContainers. The "mobile-first" claim contradicts ADR-033 and is incorrect.

**Recommendation**: Update Architecture document to match PRD and ADR-033: "Desktop-First IDE with mobile Notes/Knowledge/Study access."

---

### C3: "Mobile-First IDE" Claim

**PRD Line 134**:
> "1. Mobile-First IDE - No competitor has this"

**ADR-033 D1**:
> "IDE Access: Desktop only"
> "Mobile IDE Behavior: Block and redirect to Notes"

**Reality**: There is NO mobile IDE access. The claim "Mobile-First IDE" is factually incorrect.

**Recommendation**: Remove "Mobile-First IDE" from PRD marketing claims. The differentiator is "Mobile-accessible Notes/Knowledge/Study workspaces" not IDE.

---

### M1: PlatformContract Duplicate Interface

**Location 1**: `src/infrastructure/filesystem/platform-contract.ts:74`
```typescript
export interface PlatformContract {
  readonly deviceType: DeviceType;
  readonly storageType: StorageType;
  // ...
}
```

**Location 2**: `src/infrastructure/filesystem/storage-types.ts:90`
```typescript
export interface PlatformContract {
  deviceType: PlatformType;  // Different type name!
  storageType: StorageType;
  // ...
}
```

**Issues**:
1. Duplicate interface definitions (violates DRY)
2. `deviceType` vs `PlatformType` naming inconsistency
3. `readonly` modifier present in one but not other

**Recommendation**: Consolidate to single source in `platform-contract.ts`. Update `storage-types.ts` to import from canonical location.

---

### M2: DeviceType vs PlatformType Naming

| File | Type Name | Value |
|------|-----------|-------|
| `platform-contract.ts` | `DeviceType` | `'desktop' \| 'mobile' \| 'tablet'` |
| `storage-types.ts` | `PlatformType` | `'desktop' \| 'mobile' \| 'tablet'` |

**Impact**: TypeScript compatibility issues when passing PlatformContract between modules using different type definitions.

**Recommendation**: Standardize on `DeviceType` per ADR-033. Remove `PlatformType` from `storage-types.ts`.

---

### M3 & M4: Chrome 129+ Bug Persistence

**ADR-035 Bug 001**:
> "Chrome version check uses exact match instead of `>= 129`"

**Status**: According to ADR-034/035, this is still **INFECTED**. The bug has not been fixed.

**Impact**: 
- FileSystemObserver (Chrome 129+) not properly feature-detected
- structuredClone optimization not applied
- FSA handle storage may fail on Chrome 128

---

### C4 & C6: Architecture Metrics Inconsistency

| Metric | Architecture Claim | Paper 2 Evidence | Status |
|--------|-------------------|------------------|--------|
| Clean Architecture Compliance | ~50% | Not validated | **SUSPICIOUS** |
| God Components | 8 | None found | **INACCURATE** |
| God Stores | 8 | `dexie-db.ts` is facade, not god store | **INACCURATE** |

**Architecture Line 39**:
> "God Components: 8 (Not 19)"

**Paper 2 Validation**:
> "`dexie-db.ts` IS 1,165 lines but functions as a **facade/aggregator**"

**Conclusion**: Architecture metrics appear to be guesses rather than measured values. "God store" characterization is misleading for facade patterns.

---

## Recommendations

### Critical (Fix Immediately)

1. **Remove "Mobile-First IDE" from all marketing materials**
   - IDE is desktop-only per ADR-033
   - Correct differentiator: "Mobile-accessible Notes/Knowledge"

2. **Fix ADR-035 Bug 001 (Chrome 129+ version check)**
   - Change `=== 129` to `>= 129`
   - Location: `handle-persistence.ts`

3. **Consolidate PlatformContract interface**
   - Keep canonical in `platform-contract.ts`
   - Import from `storage-types.ts`
   - Remove duplicate

### High Priority

4. **Standardize DeviceType naming**
   - Use `DeviceType` consistently
   - Remove `PlatformType` from `storage-types.ts`

5. **Fix FSA handle persistence**
   - Address ADR-034 FSA-001 through FSA-010
   - Implement single source of truth: `db.fsaHandles`

6. **Enforce StorageGateway usage**
   - Block direct Dexie calls in note slices
   - Add lint rule or runtime check

### Medium Priority

7. **Update Architecture metrics with actual measurements**
   - Remove fabricated compliance percentages
   - Document measurement methodology
   - Clarify "god store" definitions

8. **Add interface read-only consistency**
   - Add `readonly` modifier to all PlatformContract fields
   - Apply consistently across both files

---

## Files Affected

| File | Issue | Action Required |
|------|-------|-----------------|
| `prd.md` | "Mobile-First IDE" claim | Remove/Clarify |
| `architecture.md` | "mobile-first" contradiction | Fix to match ADR-033 |
| `src/infrastructure/filesystem/platform-contract.ts` | Canonical - keep | No change |
| `src/infrastructure/filesystem/storage-types.ts` | Duplicate interface | Import from canonical |
| `handle-persistence.ts` | Chrome version check | Fix `===` to `>=` |

---

## Validation Checklist

- [x] PRD read (lines 1-300)
- [x] Architecture read (lines 1-300)
- [x] ADR-033 reviewed (complete)
- [x] ADR-034 reviewed (partial)
- [x] ADR-035 reviewed (partial)
- [x] Paper 2 Validation reviewed
- [x] Implementation verified (platform-contract.ts)
- [x] Implementation verified (storage-types.ts)
- [x] Interface duplicates identified
- [x] Type naming inconsistencies identified
- [x] Contradictions documented
- [x] Recommendations prioritized

---

*Report generated by architect-ext validation workflow*
*Validation date: 2026-01-18*
