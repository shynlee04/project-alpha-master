# Story: CC-IDE-03
# Monaco Editor File Operations

**Title**: Monaco Editor File Operations
**Epic**: CC-IDE-FSA
**Points**: 8
**Status**: ready-for-dev
**Team**: TEAM_A

---

## Acceptance Criteria

1. [ ] **Open file reads from FSA via gateway**
   - Monaco loads file content from ide-file-gateway.read()
   - File path passed from file tree selection
   - Loading indicator shows during read

2. [ ] **Save file writes to FSA via gateway**
   - Save button calls ide-file-gateway.write()
   - Content formatted to Uint8Array before write
   - Success toast shows on save

3. [ ] **Auto-save debounced to 500ms**
   - Auto-save triggers after 500ms of inactivity
   - Debounced save only when content changed
   - No auto-save when file is clean (no changes)

4. [ ] **Unsaved changes indicator**
   - Tab shows dot or asterisk when unsaved
   - Clear indicator after successful save
   - Warn before closing unsaved file

5. [ ] **External file change detection with reload prompt**
   - FileSystemObserver detects external change
   - Prompt user: "File changed externally. Reload?"
   - Merge dialog if local dirty + external change

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Update MonacoEditor to use gateway for read/write
  - [ ] Subtask 1.1: Replace direct file-system calls with gateway
  - [ ] Subtask 1.2: Handle Uint8Array conversion

- [ ] **Task 2**: Implement auto-save with debounce
  - [ ] Subtask 2.1: Add 500ms debounce timer
  - [ ] Subtask 2.2: Track dirty state

- [ ] **Task 3**: Add unsaved changes indicator
  - [ ] Subtask 3.1: Show dot/asterisk on tab
  - [ ] Subtask 3.2: Warn on close

- [ ] **Task 4**: Implement external change detection
  - [ ] Subtask 4.1: Integrate FileSystemObserver
  - [ ] Subtask 4.2: Show reload/merge dialog

---

## Dependencies
- CC-IDE-02: File Tree Integration

---

## File List
- Modified: src/presentation/components/ide/MonacoEditor.tsx
- Created: src/presentation/components/ide/__tests__/MonacoEditor.test.tsx

---

## Status
ready-for-dev

---

**Created**: 2026-01-18T13:15:00+07:00
