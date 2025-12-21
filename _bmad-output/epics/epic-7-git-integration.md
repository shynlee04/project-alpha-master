# Epic 7: Git Integration

**Goal:** Implement isomorphic-git with FSA adapter for local Git operations.

**Requirements Covered:** FR-GIT-01 to FR-GIT-04, TECH-FSA-ADAPTER

### Story 7.1: Implement FSA Git Adapter

As a **developer**,
I want **an fs.promises adapter for File System Access API**,
So that **isomorphic-git can operate on local folders**.

**Acceptance Criteria:**

**Given** the `src/lib/git/` directory
**When** I implement the fsa-adapter
**Then** it provides `fs.promises`-compatible interface:
  - `readFile`, `writeFile`
  - `mkdir`, `readdir`, `stat`
  - `rm`, `rename`
**And** isomorphic-git operations use this adapter
**And** adapter handles FSA permission errors

---

### Story 7.2: Implement Git Status Display

As a **developer**,
I want **Git status visible in the file tree**,
So that **users see modified, staged, and untracked files**.

**Acceptance Criteria:**

**Given** a Git repository in the project folder
**When** files are modified
**Then** file tree shows status indicators:
  - M (modified)
  - A (staged/added)
  - D (deleted)
  - ? (untracked)
**And** status updates after file operations

---

### Story 7.3: Implement Git Stage/Commit

As a **developer**,
I want **staging and commit functionality**,
So that **users can create commits from the browser**.

**Acceptance Criteria:**

**Given** modified files in the repo
**When** I stage files via UI or agent
**Then** files are added to Git index via `git.add()`
**When** I enter a commit message and commit
**Then** a commit is created in the local `.git`
**And** commit hash is returned
**And** file status updates to reflect commit

---

### Story 7.4: Implement Git Agent Tools

As a **developer**,
I want **Git tools available for the AI agent**,
So that **the agent can check status, stage, and commit**.

**Acceptance Criteria:**

**Given** the agent tool registry
**When** I implement Git tools
**Then** the following tools are available:
  - `git_status()` → returns status matrix
  - `git_add(paths)` → stages files
  - `git_commit(message)` → creates commit
**And** tools use the FSA Git adapter
**And** tool results appear in chat

---
