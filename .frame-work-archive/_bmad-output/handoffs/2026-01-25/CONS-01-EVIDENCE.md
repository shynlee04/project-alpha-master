# CONS-01: Remove Remaining window.location.href - Evidence Package

**Story ID**: CONS-01
**Team**: Team B (Parallel Consolidation)
**Agent**: dev-ext
**Date**: 2026-01-25
**Status**: COMPLETE

---

## 1. Files Modified

| File | Line Changed | Change Type |
|------|--------------|-------------|
| `src/presentation/components/common/DatabaseRecoveryDialog.tsx` | 112 | `window.location.href` → `window.location.pathname` |
| `src/routes/$__debug__.provider-playground.tsx` | 137 | `window.location.href` → `window.location.origin` |

### Change Details

#### File 1: DatabaseRecoveryDialog.tsx (Line 112)

**Before**:
```typescript
if (pattern.test(window.location.href) || pattern.test(document.body.innerText)) {
```

**After**:
```typescript
// ARCH-01-01: Use window.location.pathname for pattern matching (not navigation)
if (pattern.test(window.location.pathname) || pattern.test(document.body.innerText)) {
```

**Rationale**: Pattern matching for error detection only needs path, not full URL with query strings.

#### File 2: provider-playground.tsx (Line 137)

**Before**:
```typescript
'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : '',
```

**After**:
```typescript
// ARCH-01-01: Use window.location.origin for referer header (not full URL)
'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
```

**Rationale**: Referer header should use origin (scheme + host) not full URL with path/query.

---

## 2. Grep Verification

**Command**:
```bash
grep -rn "window.location.href" src/ --include="*.ts" --include="*.tsx" | grep -v "// ARCH-01-01"
```

**Output**:
```
src/lib/offline/offline-detector.ts:126:      const response = await fetch(window.location.href, {
```

**Result**: PASS - Only `offline-detector.ts` remains (legitimate use for fetch URL as documented in task)

---

## 3. TypeScript Verification

**Command**: `pnpm tsc --noEmit`

**Result**:
- Total errors: 5
- Errors in CONS-01 files: **0** (verified with grep filter)
- All 5 errors are in Team A files (HubHomePage.tsx, ProjectsPage.tsx) - outside CONS-01 scope

**Verification Command**:
```bash
pnpm tsc --noEmit 2>&1 | grep -E "(DatabaseRecoveryDialog|provider-playground)" || echo "No errors in CONS-01 files"
```

**Output**: `No errors in CONS-01 files`

---

## 4. Summary

| Check | Result |
|-------|--------|
| Files modified | 2/2 |
| Grep verification | PASS (only offline-detector.ts remains) |
| TypeScript errors in CONS-01 files | 0 |
| CONS-01 introduced new errors | NO |

---

## 5. Status: COMPLETE

CONS-01 successfully completed. Two files fixed with proper commenting (ARCH-01-01 tags).

**Note**: The 5 TypeScript errors visible are Team A work (FSA handle integration in HubHomePage.tsx and ProjectsPage.tsx) and are NOT related to this story.

---

## Next Steps for Team B

- CONS-02: Consolidate project creation deprecation (READY)
- CONS-03: Complete MonacoPlugin integration (READY)
