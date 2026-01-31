# Story: CC-IDE-05
# WebContainer File Binding

**Title**: WebContainer File Binding
**Epic**: CC-IDE-FSA
**Points**: 8
**Status**: ready-for-dev
**Team**: TEAM_B

---

## Acceptance Criteria

1. [ ] **WebContainer mounts FSA folder**
   - Project folder mounted as /project
   - All files accessible via WebContainer FS
   - Handle persists across WebContainer sessions

2. [ ] **File changes sync bidirectionally (FSA ↔ WebContainer)**
   - Changes in WebContainer reflected in FSA
   - External FSA changes reflected in WebContainer
   - Conflict resolution for concurrent edits

3. [ ] **npm install, npm run dev work in WebContainer**
   - Dependencies install successfully
   - Dev server starts in WebContainer
   - HMR (Hot Module Replacement) works

4. [ ] **Preview server accessible via WebContainer**
   - Preview URL from WebContainer
   - HTTPS support for iframe embedding
   - Port mapping for multiple projects

5. [ ] **Hot reload via WebContainer HMR**
   - File changes trigger HMR
   - Page updates without full reload
   - State preserved during HMR

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: Mount FSA folder to WebContainer
  - [ ] Subtask 1.1: Create file system adapter for FSA
  - [ ] Subtask 1.2: Mount at /project path

- [ ] **Task 2**: Implement bidirectional sync
  - [ ] Subtask 2.1: Watch FSA changes, sync to WebContainer
  - [ ] Subtask 2.2: Watch WebContainer changes, sync to FSA

- [ ] **Task 3**: Enable npm commands
  - [ ] Subtask 3.1: npm install works with FSA files
  - [ ] Subtask 3.2: npm run dev works

- [ ] **Task 4**: Configure preview server
  - [ ] Subtask 4.1: Expose preview URL
  - [ ] Subtask 4.2: Handle port conflicts

- [ ] **Task 5**: Integrate HMR
  - [ ] Subtask 5.1: Configure WebContainer for HMR
  - [ ] Subtask 5.2: Forward HMR events to Monaco

---

## Dependencies
- CC-IDE-03: Monaco Editor File Operations
- CC-IDE-04: Terminal File System Access

---

## File List
- Created: src/infrastructure/webcontainer/fsa-adapter.ts
- Modified: src/presentation/components/ide/WebContainerPanel.tsx
- Created: src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts

---

## Status
ready-for-dev

---

**Created**: 2026-01-18T13:45:00+07:00
