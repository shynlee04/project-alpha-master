# Story: CC-IDE-04
# Terminal File System Access

**Title**: Terminal File System Access
**Epic**: CC-IDE-FSA
**Points**: 6
**Status**: ready-for-dev
**Team**: TEAM_B

---

## Acceptance Criteria

1. [ ] **Terminal can cd into FSA project folder**
   - Terminal context set to project root
   - Tab completion works for paths
   - Relative paths resolve correctly

2. [ ] **ls, cat, grep work on FSA files**
   - ls lists files from gateway.list()
   - cat reads via gateway.read()
   - grep filters file content

3. [ ] **File editing via terminal (nano, vim)**
   - nano/vim commands use gateway.write()
   - Content persisted to FSA
   - File watching detects changes

4. [ ] **Git operations work on FSA folder**
   - git status reads file list via gateway
   - git add/commit use gateway operations
   - .git excluded from IDE file tree

5. [ ] **Integration tests verify terminal-FSA connectivity**
   - Test command execution with FSA files
   - Test error handling (file not found, permission denied)

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Integrate terminal with FSA project folder
  - [ ] Subtask 1.1: Set working directory to project root
  - [ ] Subtask 1.2: Mount FSA files to virtual file system

- [ ] **Task 2**: Implement file commands via gateway
  - [ ] Subtask 2.1: ls → gateway.list()
  - [ ] Subtask 2.2: cat → gateway.read()
  - [ ] Subtask 2.3: grep → read + filter

- [ ] **Task 3**: Add editor commands
  - [ ] Subtask 3.1: nano → gateway.write()
  - [ ] Subtask 3.2: vim → gateway.write()

- [ ] **Task 4**: Enable git operations
  - [ ] Subtask 4.1: Git status via gateway.list()
  - [ ] Subtask 4.2: Git add/commit use gateway

---

## Dependencies
- CC-IDE-02: File Tree Integration

---

## File List
- Modified: src/presentation/components/ide/Terminal.tsx
- Created: src/infrastructure/filesystem/terminal-adapter.ts
- Created: src/infrastructure/filesystem/__tests__/terminal-adapter.test.ts

---

## Status
ready-for-dev

---

**Created**: 2026-01-18T13:30:00+07:00
