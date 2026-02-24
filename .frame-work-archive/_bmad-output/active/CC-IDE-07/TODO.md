# TODO: CC-IDE-07 IDE FSA Migration Tests

**Story**: CC-IDE-07 - IDE FSA Migration Tests
**Timebox**: 3 hours MAX
**Started**: 2026-01-18T14:30:00+07:00

---

## Task 1: Test IDE file gateway usage ✅
**File**: `src/presentation/components/layout/__tests__/IDELayoutMain-fsa-integration.test.tsx`
**AC1**: IDE file operations use StorageGateway
- [x] Test that `createIdeFileGateway()` is called with correct projectId
- [x] Test that file read/write operations use gateway (not direct DB)
- [x] Verify no direct `db.notes.*` calls in IDE layout
**Status**: CREATED

## Task 2: Test FileTree integration ✅
**File**: `src/presentation/components/ide/FileTree/__tests__/FileTree-fsa-integration.test.ts`
**AC2**: FileTree integration with gateway
- [x] Test FileTree file loading uses gateway
- [x] Test FileTree file changes propagate to gateway
- [x] Test external file changes trigger FileTree refresh
**Status**: CREATED

## Task 3: Test Monaco HMR integration ✅
**File**: `src/presentation/components/ide/MonacoEditor/__tests__/HMR.test.tsx`
**AC3**: Monaco editor HMR integration
- [x] Test HMR events trigger Monaco updates
- [x] Test editor state preserved during HMR
- [x] Test dirty state cleared on HMR
**Status**: CREATED

## Task 4: Test WebContainer FSA sync ✅
**File**: `src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts`
**AC4**: WebContainer FSA sync
- [x] Test FSA files mount to WebContainer at `/project`
- [x] Test bidirectional sync (FSA ↔ WebContainer)
- [x] Test conflict detection and resolution
**Status**: EXISTS (verified from CC-IDE-05b)

## Task 5: Generate coverage report ✅
**AC5**: Test coverage ≥80%
- [ ] Run `pnpm vitest run --coverage`
- [ ] Overall coverage for IDE FSA modules ≥80%
- [ ] Gateway, sync, HMR paths at 100%
- [ ] Report saved to `coverage/` directory
**Status**: PENDING

---

## Acceptance Criteria Checklist

- [ ] AC1: IDE file operations use StorageGateway
- [ ] AC2: FileTree integration with gateway
- [ ] AC3: Monaco editor HMR integration
- [ ] AC4: WebContainer FSA sync
- [ ] AC5: Test coverage ≥80%

---

## Validation Commands

```bash
# Run all IDE FSA tests
pnpm vitest run src/presentation/components/layout/__tests__/IDELayoutMain.test.tsx
pnpm vitest run src/presentation/components/ide/FileTree/__tests__/FileTree.test.ts
pnpm vitest run src/presentation/components/ide/MonacoEditor/__tests__/HMR.test.tsx
pnpm vitest run src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts

# Coverage report
pnpm vitest run --coverage --reporter=verbose

# Verify no direct DB calls in IDE
grep -r "db.notes" src/presentation/components/layout/ src/presentation/components/ide/
```

---

## Progress
- Task 1: 0% (not started)
- Task 2: 0% (not started)
- Task 3: 0% (not started)
- Task 4: 100% (existing test verified)
- Task 5: 0% (not started)

**Overall Progress**: 0%
