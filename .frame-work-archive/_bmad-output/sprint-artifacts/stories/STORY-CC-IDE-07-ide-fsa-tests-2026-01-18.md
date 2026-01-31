# Story: CC-IDE-07
# IDE FSA Migration Tests

**Title**: IDE FSA Migration Tests
**Epic**: CC-IDE-FSA
**Points**: 6
**Status**: ready-for-dev
**Team**: TEAM_B

---

## Acceptance Criteria

1. [ ] **E2E test for file create/read/update/delete**
   - Test file creation from Monaco
   - Test file reading in Monaco
   - Test file update and persistence
   - Test file deletion from tree

2. [ ] **E2E test for WebContainer integration**
   - Test mounting FSA folder
   - Test npm install in WebContainer
   - Test bidirectional sync

3. [ ] **Test terminal-FSA connectivity**
   - Test ls command lists FSA files
   - Test cat command reads FSA files
   - Test git operations on FSA

4. [ ] **Test mobile guard behavior**
   - Test mobile redirected to Notes
   - Test toast message shows
   - Test desktop can access IDE

5. [ ] **All tests pass with pnpm vitest run**
   - Unit tests ≥ 80% coverage
   - Integration tests pass
   - E2E tests pass

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Create file CRUD E2E tests
  - [ ] Subtask 1.1: Test create file
  - [ ] Subtask 1.2: Test read file
  - [ ] Subtask 1.3: Test update file
  - [ ] Subtask 1.4: Test delete file

- [ ] **Task 2**: Create WebContainer integration tests
  - [ ] Subtask 2.1: Test mount FSA
  - [ ] Subtask 2.2: Test npm install
  - [ ] Subtask 2.3: Test sync

- [ ] **Task 3**: Create terminal-FSA tests
  - [ ] Subtask 3.1: Test ls command
  - [ ] Subtask 3.2: Test cat command
  - [ ] Subtask 3.3: Test git operations

- [ ] **Task 4**: Create mobile guard tests
  - [ ] Subtask 4.1: Test mobile redirect
  - [ ] Subtask 4.2: Test desktop access
  - [ ] Subtask 4.3: Test toast message

- [ ] **Task 5**: Run test suite and verify coverage
  - [ ] Subtask 5.1: Run pnpm vitest run
  - [ ] Subtask 5.2: Check coverage ≥ 80%
  - [ ] Subtask 5.3: Fix any failing tests

---

## Dependencies
- All previous CC-IDE stories (CC-IDE-01 through CC-IDE-06)

---

## File List
- Created: src/e2e/ide-fsa-crud.spec.ts
- Created: src/e2e/ide-webcontainer.spec.ts
- Created: src/e2e/ide-terminal-fsa.spec.ts
- Created: src/e2e/ide-mobile-guard.spec.ts

---

## Status
ready-for-dev

---

**Created**: 2026-01-18T14:15:00+07:00
