---
# ⚠️ ARCHIVED DECISION RECORD
**Original ADR ID**: ADR-036
**Status**: ARCHIVED
**Archived Date**: 2026-01-25
**Archived By**: tech-writer-ext (CTX-01)
**Reason**: ID collision - renamed to ADR-037-platform-contract-consolidation-2026-01-18.md
**New ADR ID**: ADR-037
**New Location**: `_bmad-output/planning-artifacts/adr/ADR-037-platform-contract-consolidation-2026-01-18.md`
**Archive Location**: `_bmad-ext/.archive/ADR-036-platform-contract-consolidation-2026-01-18-archived-2026-01-25.md`
---

# ADR-036: PlatformContract Interface Consolidation

**Status**: ARCHIVED (renamed to ADR-037)
**Date**: 2026-01-18
**Author**: architect-ext

## Issue

The `PlatformContract` interface is defined in two locations with inconsistencies:

- **Location 1**: `src/infrastructure/filesystem/platform-contract.ts:74-95`
- **Location 2**: `src/infrastructure/filesystem/storage-types.ts:90-105`

### Inconsistencies Found

| Aspect | `platform-contract.ts` | `storage-types.ts` |
|--------|------------------------|-------------------|
| **Type Name** | `DeviceType` | `PlatformType` |
| **Values** | `'desktop' \| 'mobile' \| 'tablet'` | `'desktop' \| 'mobile' \| 'tablet'` |
| **Modifiers** | `readonly` on all fields | None |
| **Caching** | Singleton with 5s cache | None |

### Impact

- **19 import locations** affected across the codebase
- TypeScript compatibility issues when passing `PlatformContract` between modules
- Violates DRY (Don't Repeat Yourself) principle
- Single source of truth principle violated

## Analysis

### Evidence from Validation Reports

**PRD/Architecture Validation (M1 & M2)**:
> "PlatformContract interface defined in `platform-contract.ts:74` AND `storage-types.ts:90`"
> "`deviceType` vs `PlatformType` naming inconsistency"

**Past Fix Attempts**:
> "Architecture Scout recommends consolidation to `src/infrastructure/filesystem/platform-types.ts`"
> "19 locations using `getPlatformContract()` have been scanned"

**Infection Scan Results**:
| ID | File | Status |
|----|------|--------|
| PLAT-002 | `notes.lazy.tsx:43-46` | Resolved |
| PLAT-003 | `MainSidebar.tsx` | Resolved |
| PLAT-004 | Multiple routes | Resolved |

### Root Cause

The interface was duplicated during parallel development without proper coordination. ADR-033 specifies the interface but implementation was split across two files with different conventions.

## Decision

Consolidate `PlatformContract` interface to a single canonical location with standardized naming and modifiers.

### Proposed Solution

1. **Keep canonical location**: `src/infrastructure/filesystem/platform-contract.ts`
2. **Use consistent type names**: Standardize on `DeviceType` (per ADR-033)
3. **Apply readonly modifiers**: Add to all interface fields for immutability
4. **Update storage-types.ts**: Import from canonical location
5. **Update all 19 import locations**

### Implementation Plan

```
Phase 1: Create unified types file
├── Create: src/infrastructure/filesystem/platform-types.ts
├── Define: DeviceType, StorageType, PlatformContract (canonical)
└── Export: All platform-related types

Phase 2: Update canonical platform-contract.ts
├── Import types from platform-types.ts
├── Keep: getPlatformContract() singleton with 5s cache
└── Remove: Duplicate type definitions

Phase 3: Update storage-types.ts
├── Import: DeviceType, PlatformContract from platform-types.ts
├── Remove: Duplicate interface definitions
└── Keep: StorageType and storage-specific types

Phase 4: Update all 19 import locations
├── Update: Route files (notes.lazy.tsx, ide.$projectId.tsx, etc.)
├── Update: Components (MainSidebar.tsx, etc.)
└── Update: Hooks and utilities
```

## Consequences

### Positive
- Single source of truth for platform types
- Consistent `DeviceType` naming across codebase
- Readonly modifiers prevent accidental mutation
- Easier maintenance and future changes
- Clearer architecture documentation

### Negative
- Requires updating 19 import locations
- Breaking change for modules using `PlatformType`
- Migration effort for existing code

### Neutral
- No functional changes to platform detection logic
- Build tooling (TypeScript) will catch any missed updates

## Implementation

### Step 1: Create platform-types.ts

```typescript
// src/infrastructure/filesystem/platform-types.ts

export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type StorageType = 'fsa' | 'indexeddb';

export interface PlatformContract {
  readonly deviceType: DeviceType;
  readonly storageType: StorageType;
  readonly canAccessFSA: boolean;
  readonly canWatchFiles: boolean;
  readonly canRunTerminal: boolean;
  readonly canDoAgenticCoding: boolean;
  readonly canAccessIDE: boolean;
}
```

### Step 2: Update platform-contract.ts

```typescript
// src/infrastructure/filesystem/platform-contract.ts

import type { DeviceType, StorageType, PlatformContract } from './platform-types';

// Keep existing getPlatformContract() implementation
// Remove duplicate interface definitions
```

### Step 3: Update storage-types.ts

```typescript
// src/infrastructure/filesystem/storage-types.ts

import type { DeviceType, PlatformContract } from './platform-types';

// Remove duplicate PlatformContract interface
// Remove PlatformType type alias
```

### Step 4: Update import locations (19 files)

Files to update:
- `src/routes/notes.lazy.tsx`
- `src/routes/notes.$projectId.lazy.tsx`
- `src/routes/ide.$projectId.tsx`
- `src/routes/knowledge.$projectId.tsx`
- `src/routes/study.$projectId.tsx`
- `src/presentation/components/common/MainSidebar.tsx`
- And 13 more files from infection scan

### Step 5: Validation

```bash
# Run TypeScript check
pnpm tsc --noEmit

# Verify no duplicate interface definitions
grep -r "interface PlatformContract" src/infrastructure/filesystem/

# Verify consistent DeviceType usage
grep -r "PlatformType" src/infrastructure/filesystem/
# Should return 0 results after migration
```

## References

- **Validation Report**: `_bmad-ext/.correct-course/validation/prd-architecture-validation.md` (Lines 92-130)
- **Past Fix Attempts**: `_bmad-ext/.correct-course/validation/past-fix-attempts.md` (Lines 115-150)
- **ADR-033**: Platform and Storage Decisions
- **Architecture Scout**: `cycle1-architecture-scout-2026-01-18.md`
- **Infection Scan**: `platform-contract-infection-scan-2026-01-21.md`
