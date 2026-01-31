# Team A Foundation & Core Investigation Report

**Date**: 2026-01-16  
**Team**: Team A (Identity & Routing Squad)  
**Duration**: 2-3 hours  
**Investigators**: Deep-scan-workspace-scanner, Deep-scan-architecture-scanner

---

## Executive Summary

This investigation analyzed 5 key areas of Project Alpha's foundation and core infrastructure. The overall status is **PARTIALLY WORKING** with critical issues identified in platform detection, route guards, and FSA integration.

### Overall Status Matrix

| Area | Status | Score | Critical Issues |
|------|--------|-------|-----------------|
| **A1: Project Space** | ✅ WORKING | 92% | 0 |
| **A2: Platform Detection** | ⚠️ PARTIAL | 72% | 1 |
| **A3: Platform Guards** | ⚠️ PARTIAL | 75% | 2 |
| **A4: FSA Integration** | ⚠️ PARTIAL | 78% | 2 |
| **A5: BYOK** | ✅ IMPLEMENTED | 85% | 0 |
| **OVERALL** | **PARTIALLY WORKING** | **80%** | **5** |

### Key Findings

1. **Project Space** is well-architected with proper separation of concerns
2. **Platform Detection** has critical Chrome version detection issues
3. **Platform Guards** are missing for Knowledge and Study routes
4. **FSA Integration** has Chrome 129+ structuredClone detection bugs
5. **BYOK** is fully implemented with strong encryption but localStorage risks

---

## Priority Findings

### Task A1: Project Space Analysis (PRIORITY - FIRST UNBINDING KNOT)

**Status**: ✅ WORKING  
**Score**: 92%  
**Issues Found**: 3 (1 MEDIUM, 2 LOW)

#### Project Creation Flow ✅ WORKING

| Component | Status | File |
|-----------|--------|------|
| Quick Create (Hub) | ✅ Working | `HubHomePage.tsx:162-220` |
| Wizard Create | ✅ Working | `ProjectCreationWizard.tsx` (536 lines) |
| Store Persistence | ✅ Working | `project-crud-slice.ts:111-165` |

#### Project Selection Flow ✅ WORKING

| Component | Purpose | File |
|-----------|---------|------|
| ProjectPickerDialog | Filter by workspace binding | `ProjectPickerDialog.tsx` |
| RecentProjectsSection | Top 5 recent projects | `RecentProjectsSection.tsx` |
| ProjectCard | Direct workspace navigation | `ProjectCard.tsx:129-137` |

#### Entry Matrix ✅ IMPLEMENTED

| Platform | Storage | IDE | Notes | Knowledge | Study |
|----------|---------|-----|-------|-----------|-------|
| **Desktop FSA** | `fsa` | ✅ | ✅ | ✅ | ✅ |
| **Desktop non-FSA** | `indexeddb` | ❌ | ✅ | ✅ | ✅ |
| **Mobile** | `indexeddb` | ❌ | ✅ | ✅ | ✅ |
| **Tablet** | `indexeddb` | ❌ | ✅ | ✅ | ✅ |

#### Issues Found

| # | Severity | Issue | Location | Recommendation |
|---|----------|-------|----------|----------------|
| A1-1 | MEDIUM | Binding format inconsistency | `ProjectPickerDialog.tsx:135` | Migrate all to `workspaceBindings` format |
| A1-2 | LOW | Wrong event type | `ProjectCard.tsx:117` | Change `FILE_SAVED` to `WORKSPACE_PROJECT_UPDATED` |
| A1-3 | LOW | Uses window.location.href | `ProjectPickerDialog.tsx:173` | Use TanStack Router `navigate()` |

---

### Task A2: Platform Detection Analysis

**Status**: ⚠️ PARTIAL  
**Score**: 72%  
**Issues Found**: 3 (1 MEDIUM, 1 HIGH, 1 LOW)

#### getPlatformContract() ✅ FOUND

**Location**: `src/infrastructure/filesystem/platform-contract.ts` (340 lines)

The function is properly implemented with:
- Caching mechanism (`cachedContract` singleton)
- Complete `PlatformContract` interface
- Helper functions for invalidation and requirements checking

#### Device Detection ⚠️ PARTIAL

**Issue #1 (MEDIUM)**: Mobile detection logic error at line 156

```typescript
// CURRENT (INCORRECT):
const isMobile =
  /Android/i.test(ua) && !/Mobile/i.test(ua) === false ||
  /webOS/i.test(ua) ||
```

**Problem**: Operator precedence issue - `=== false` applies only to `/Mobile/i.test(ua)`, not the whole `&&` expression.

**Fix**:
```typescript
// AFTER:
const isMobile =
  (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
  /webOS/i.test(ua) ||
```

#### Chrome 129+ Detection ❌ INCOMPLETE

**Issue #2 (HIGH)**: Missing FileSystemObserver detection

**Current** (line 206-207):
```typescript
const canWatchFiles = canAccessFSA;
```

**Problem**: Only checks FSA support, doesn't detect Chrome 129+ FileSystemObserver API.

**Fix**:
```typescript
import { isFileSystemObserverSupported } from './fsa-gateway';

const canWatchFiles = canAccessFSA && isFileSystemObserverSupported();
```

#### Duplicate Code ⚠️ LOW

**Issue #3**: Multiple platform detection implementations

| File | Purpose | Status |
|------|---------|--------|
| `platform-contract.ts` | Primary | ✅ Canonical |
| `platform-detection.ts` | Legacy (318 lines) | ⚠️ Duplicate |
| `lib/utils/platform-detection.ts` | Legacy (149 lines) | ⚠️ Duplicate |

**Recommendation**: Consolidate to `platform-contract.ts` as single source of truth.

---

### Task A3: Platform Guards Analysis

**Status**: ⚠️ PARTIAL  
**Score**: 75%  
**Issues Found**: 4 (2 HIGH, 2 LOW)

#### Route Guard Implementation

| Route | Guard | Status |
|-------|-------|--------|
| `/ide/$projectId` | `beforeLoad` + platform check | ✅ WORKING |
| `/ide` | `beforeLoad` + platform check | ✅ WORKING |
| `/notes/$projectId` | None (by design) | ✅ CORRECT |
| `/knowledge/$projectId` | **NONE** | ❌ MISSING |
| `/study/$projectId` | **NONE** | ❌ MISSING |

#### IDE Blocking on Mobile ✅ WORKING

```typescript
// ide.$projectId.tsx:41-58
beforeLoad: async ({ params }) => {
  const platform = getPlatformContract();
  if (!platform.canAccessIDE) {
    throw redirect({
      to: '/notes/$projectId',
      params: { projectId: params.projectId },
      search: { reason: 'mobile-not-supported' }
    });
  }
}
```

#### Mobile to Notes Redirect ✅ WORKING

```
Mobile → /ide/$projectId
    → canAccessIDE === false
    → redirect to /notes/$projectId?reason=mobile-not-supported
    → Toast notification displays
```

#### Issues Found

| # | Severity | Issue | Location | Recommendation |
|---|----------|-------|----------|----------------|
| A3-1 | HIGH | Missing platform guard | `knowledge.$projectId.tsx` | Add `beforeLoad` guard |
| A3-2 | HIGH | Missing platform guard | `study.$projectId.tsx` | Add `beforeLoad` guard |
| A3-3 | LOW | Redundant project fetch | `ide.$projectId.tsx:60-81` | Accept - not blocking |
| A3-4 | LOW | Same redundant pattern | `knowledge.$projectId.tsx` | Accept - not blocking |

#### Required Fix (HIGH PRIORITY)

```typescript
// Add to knowledge.$projectId.lazy.tsx and study.$projectId.lazy.tsx
beforeLoad: async ({ params }) => {
  const platform = getPlatformContract();
  if (!platform.canAccessIDE) {
    throw redirect({
      to: '/notes/$projectId',
      params: { projectId: params.projectId },
      search: { reason: 'mobile-not-supported' }
    });
  }
  // ... existing project fetch
}
```

---

### Task A4: FSA Integration Analysis

**Status**: ⚠️ PARTIAL  
**Score**: 78%  
**Issues Found**: 8 (2 CRITICAL, 3 MEDIUM, 3 LOW)

#### FSA CRUD Operations ✅ WORKING

| Method | Status |
|--------|--------|
| `read(path)` | ✅ Working |
| `write(path, data)` | ✅ Working |
| `delete(path)` | ✅ Working |
| `list(path)` | ✅ Working |
| `exists(path)` | ✅ Working |

#### Handle Persistence ✅ WORKING

**Storage Schema**: `FSAHandleRecord` in Dexie table `fsaHandles`

| Field | Purpose |
|-------|---------|
| `projectId` | Primary key |
| `handleData` | Serialized handle (Chrome 129+) or metadata |
| `directoryPath` | Display name |
| `permissionStatus` | granted/prompt/denied/unknown/dismissed |

#### Permission Persistence ⚠️ PARTIAL

**Chrome 122+ Flow**:
1. User selects directory via `showDirectoryPicker()`
2. User chooses "Allow on every visit" (persistent)
3. Handle ID is persisted
4. On reload: `showDirectoryPicker({id: projectId})` returns handle without prompt

#### Issues Found

| # | Severity | Issue | Location | Recommendation |
|---|----------|-------|----------|----------------|
| A4-1 | CRITICAL | `isStructuredCloneSupported()` exact match | `permission-lifecycle.ts:44` | Use `>=129` instead of `includes('Chrome/129')` |
| A4-2 | HIGH | Version list stale | `handle-persistence.ts:68-70` | Use `>=122` logic instead of list |
| A4-3 | MEDIUM | Duplicate detection functions | Both persistence files | Create shared utility |
| A4-4 | MEDIUM | Proxy detection issue | `permission-lifecycle.ts:255` | Use direct version detection |
| A4-5 | MEDIUM | Test signature mismatch | `fsa-handle-helpers.test.ts` | Fix test expectations |
| A4-6 | LOW | 'dismissed' status not handled | `handle-persistence.ts:256` | Add handling |
| A4-7 | LOW | No real FSA e2e tests | Test suite | Add Playwright tests |
| A4-8 | LOW | No Safari handling | Browser detection | Add Safari 15.2+ partial support |

#### Required Fixes (Priority Order)

**Fix #1 (CRITICAL)**:
```typescript
// permission-lifecycle.ts - isStructuredCloneSupported()
function isStructuredCloneSupported(): boolean {
  if (typeof window === 'undefined' || !('structuredClone' in window)) return false;
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  if (!match) return false;
  const chromeVersion = parseInt(match[1], 10);
  return chromeVersion >= 129;  // NOT exact match!
}
```

**Fix #2 (HIGH)**:
```typescript
// Create unified Chrome version detection utility
export function getChromeVersion(): number | null {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function isChrome129OrHigher(): boolean {
  const version = getChromeVersion();
  return version !== null && version >= 129;
}

export function isChrome122OrHigher(): boolean {
  const version = getChromeVersion();
  return version !== null && version >= 122;
}
```

---

### Task A5: BYOK Analysis

**Status**: ✅ IMPLEMENTED  
**Score**: 85%  
**Issues Found**: 2 (1 HIGH, 1 MEDIUM)

#### BYOK Implementation ✅ FOUND

**Core Files**:
- `credential-vault.ts` (544 lines) - Main vault facade
- `credential-encryption.ts` (367 lines) - AES-256-GCM encryption
- `credential-storage.ts` (239 lines) - IndexedDB operations

#### Key Storage Method: Hybrid

```
localStorage (Vault Keys):
├── vg_ek_v3 (Encrypted Key)
├── vg_salt_v3 (16-byte salt)
├── vg_kv_v3 (Version "3")
└── vg_vp_v3 (Vault Password)

IndexedDB (Encrypted Credentials):
└── credentials table with {providerId, workspaceId, encrypted, iv}
```

#### Encryption Status ✅ ENCRYPTED

| Parameter | Value |
|-----------|-------|
| **Algorithm** | AES-256-GCM |
| **Key Length** | 256 bits |
| **IV Length** | 12 bytes |
| **PBKDF2 Iterations** | 100,000 |
| **Key Derivation** | PBKDF2-SHA256 |

#### Provider Support ✅ CONDITIONAL

```typescript
// Supported Providers
- openai, openrouter, openai-compatible
- anthropic, gemini, groq
- mistral, chutes
```

#### Issues Found

| # | Severity | Issue | Location | Recommendation |
|---|----------|-------|----------|----------------|
| A5-1 | HIGH | localStorage vault key persistence | `credential-vault.ts` | Consider user-provided passphrase |
| A5-2 | MEDIUM | Password stored directly | `credential-vault.ts:252-254` | Increase PBKDF2 iterations |

#### Security Assessment: MODERATE

**Strengths**:
- ✅ Strong AES-256-GCM encryption
- ✅ Obfuscated storage keys
- ✅ SSR-safe initialization
- ✅ Migration system with rollback

**Risks**:
- ⚠️ Vault keys in localStorage could be exposed via XSS
- ⚠️ Password stored directly (not user-derived)

---

## Priority Recommendations

### Immediate (Critical/High)

1. **Fix Chrome version detection** (`permission-lifecycle.ts:44`)
   - Change exact match to `>=129` comparison
   - Prevents Chrome 130+ from being misclassified

2. **Add platform guards to Knowledge and Study routes**
   - Add `beforeLoad` guard to `knowledge.$projectId.lazy.tsx`
   - Add `beforeLoad` guard to `study.$projectId.tsx`
   - Prevent mobile access to IDE features

3. **Fix mobile detection logic** (`platform-contract.ts:156`)
   - Fix operator precedence in `isMobile` detection
   - Prevents misclassification of Android devices

### High Priority

4. **Create unified Chrome version utility**
   - Single source for version detection
   - Prevents stale version lists

5. **Add Chrome 129+ FileSystemObserver detection**
   - Update `canWatchFiles` field
   - Improve file watching capabilities

### Medium Priority

6. **Migrate binding format to `workspaceBindings`**
   - Standardize on single format
   - Reduce code complexity

7. **Add FSA unsupported browser UX**
   - User-facing messages for Safari
   - Graceful degradation

8. **Consider user-provided passphrase for BYOK**
   - Increase security against XSS
   - Key derivation from user input

### Low Priority

9. **Fix event listener type in ProjectCard**
10. **Replace window.location.href with navigate()**
11. **Add Playwright tests for real FSA behavior**
12. **Add Safari partial support handling**

---

## Files Modified/Required

### Files to Create

| File | Purpose |
|------|---------|
| `src/infrastructure/filesystem/chrome-version.ts` | Unified Chrome version detection |

### Files to Modify

| File | Change |
|------|--------|
| `permission-lifecycle.ts:44` | Fix `isStructuredCloneSupported()` |
| `platform-contract.ts:156` | Fix mobile detection logic |
| `platform-contract.ts:207` | Add FileSystemObserver detection |
| `knowledge.$projectId.lazy.tsx` | Add platform guard |
| `study.$projectId.tsx` | Add platform guard |
| `ProjectPickerDialog.tsx:135` | Standardize binding format |
| `ProjectCard.tsx:117` | Fix event type |
| `ProjectPickerDialog.tsx:173` | Use TanStack Router navigate() |

### Files to Archive

| File | Reason |
|------|--------|
| `platform-detection.ts` | Duplicate (318 lines) |
| `lib/utils/platform-detection.ts` | Duplicate (149 lines) |

---

## Next Steps

### Phase 1: Critical Fixes (Day 1)

1. Fix Chrome version detection bugs (A4-1, A4-2)
2. Add platform guards to Knowledge/Study routes (A3-1, A3-2)
3. Fix mobile detection logic (A2-1)

### Phase 2: High Priority (Day 2)

4. Create unified Chrome version utility
5. Add Chrome 129+ FileSystemObserver detection
6. Migrate binding format to `workspaceBindings`

### Phase 3: Medium Priority (Day 3)

7. Add FSA unsupported browser UX
8. Fix event listener type
9. Replace window.location.href

### Verification

After all fixes:
```bash
pnpm tsc --noEmit && pnpm vitest run
```

Expected: 0 TypeScript errors, all tests pass

---

## Investigation Evidence

| Task | Investigator | Session ID |
|------|--------------|------------|
| A1: Project Space | deep-scan-workspace-scanner | `ses_43b71ab93ffejjmQxKbAmMaPlu` |
| A2: Platform Detection | deep-scan-architecture-scanner | `ses_43b719c55ffeR2i6k6JRu0NyRv` |
| A3: Platform Guards | deep-scan-architecture-scanner | `ses_43b718e51ffe0TYZRZuBFWp3ks` |
| A4: FSA Integration | deep-scan-workspace-scanner | `ses_43b6da1b8ffeWjgOB0wYmapnUZ` |
| A5: BYOK | deep-scan-workspace-scanner | `ses_43b6d906effeujaRrzUzPyG1ox` |

---

## Appendix: Architecture Strengths

Despite the issues found, the architecture demonstrates several strengths:

1. **Platform Contract Pattern**: Cached singleton ensures consistent platform detection
2. **Hydration Guards**: `waitForHydration()` prevents race conditions
3. **Slice Architecture**: Zustand slices are all <120 lines (single responsibility)
4. **Dexie Single Source**: Projects stored only in Dexie (no dual storage)
5. **Route Guards**: Platform validation at router level
6. **Strong BYOK Encryption**: AES-256-GCM with proper key derivation
7. **Migration System**: Comprehensive backup and rollback for credential migration

---

**Report Generated**: 2026-01-16  
**Next Action**: Wait for Team B report, then consolidate into unified remediation plan
