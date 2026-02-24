---
name: "implementation-commands"
description: "Unified command reference for BMAD-ext Implementation Module v2.0 - MVP (Notes + IDE only)"
version: "2.0.0"
created: "2026-01-12"
updated: "2026-01-12"
tier: "execution"
---

# Implementation Module Commands

**Purpose**: Provide unified command reference for all BMAD-ext Implementation Module commands.

## Command Index

### Sprint Commands
| Command | Module | Description |
|---------|--------|-------------|
| `/sprint-start` | MOD-C-SPRINT | Initialize sprint artifacts |
| `/sprint-status` | MOD-C-SPRINT | Show current progress |
| `/sprint-complete` | MOD-C-SPRINT | Complete sprint, trigger retrospective |

### Story Commands
| Command | Module | Description |
|---------|--------|-------------|
| `/story-create` | MOD-C-SPRINT | Create new story file |
| `/story-validate` | MOD-C-SPRINT | Validate story structure |
| `/story-dev` | MOD-C-SPRINT | Execute story development |
| `/story-done` | MOD-C-SPRINT | Mark story complete |

### Development Commands
| Command | Module | Description |
|---------|--------|-------------|
| `/dev-start` | MOD-A-CGOV | Initialize development environment |
| `/dev-fix` | MOD-A-CGOV | Fix issues in current branch |
| `/dev-complete` | MOD-A-CGOV | Complete development, create PR |

### Architecture Commands
| Command | Module | Description |
|---------|--------|-------------|
| `/arch-scan` | MOD-B-ARCH | Run architecture scan |
| `/arch-fix` | MOD-B-ARCH | Fix architecture issues |

### Testing Commands
| Command | Module | Description |
|---------|--------|-------------|
| `/test-run` | MOD-D-TEST | Run test suite |
| `/test-e2e` | MOD-D-TEST | Run E2E tests |

### UX Commands
| Command | Module | Description |
|---------|--------|-------------|
| `/ux-review` | MOD-C-SPRINT | Review UI/UX design |
| `/ux-fix` | MOD-C-SPRINT | Fix UI/UX issues |

---

## Detailed Command Reference

### `/sprint-start`
Initialize sprint artifacts and prepare for development.

**Usage**: `/sprint-start [sprint-id]`

**Options**:
- `sprint-id`: Optional sprint identifier

**Example**: `/sprint-start sprint-2026-01-13`

---

### `/sprint-status`
Show current sprint progress across all stories.

**Usage**: `/sprint-status`

**Output**:
```
Sprint Status: sprint-2026-01-13
========================================
Stories: 4/8 Complete (50%)
  ✓ FS-01: File System Foundation
  ✓ FS-02: Project CRUD Operations
  ○ FS-03: File Watching (In Progress)
  ○ FS-04: Project Selector UI
  ...

Errors: 2 Active
  ✗ ARC-01: TypeScript Errors (12 remaining)
  ✗ ARC-02: Component Cleanup (blocked by ARC-01)
```

---

### `/sprint-complete`
Complete sprint and trigger retrospective.

**Usage**: `/sprint-complete`

**Prerequisites**:
- All stories must be complete
- No TypeScript errors
- All tests passing

---

### `/story-create`
Create a new story file from epic backlog.

**Usage**: `/story-create [epic-id].[story-id]`

**Example**: `/story-create FS-03`

**Output**: Creates `stories/FS-03-context.xml`

---

### `/story-validate`
Validate story structure and acceptance criteria.

**Usage**: `/story-validate [epic-id].[story-id]`

**Example**: `/story-validate FS-03`

---

### `/story-dev`
Execute story development workflow.

**Usage**: `/story-dev [epic-id].[story-id]`

**Example**: `/story-dev FS-03`

---

### `/story-done`
Mark story as complete and update governance.

**Usage**: `/story-done [epic-id].[story-id]`

**Example**: `/story-done FS-03`

---

### `/dev-start`
Initialize development environment for story.

**Usage**: `/dev-start [story-id]`

---

### `/dev-fix`
Fix issues in current branch.

**Usage**: `/dev-fix [issue-type]`

**Issue Types**:
- `typescript`: Fix TypeScript errors
- `lint`: Fix linting issues
- `test`: Fix failing tests
- `all`: Fix all issues

---

### `/dev-complete`
Complete development and prepare for PR.

**Usage**: `/dev-complete`

---

### `/arch-scan`
Run architecture scan on codebase.

**Usage**: `/arch-scan [scope]`

**Options**:
- `scope`: Optional scope (all, stores, components)

---

### `/arch-fix`
Fix architecture issues.

**Usage**: `/arch-fix [issue-id]`

**Example**: `/arch-fix ARC-01`

---

### `/test-run`
Run test suite.

**Usage**: `/test-run [type]`

**Options**:
- `type`: Optional test type (unit, integration, all)

---

### `/test-e2e`
Run E2E browser tests.

**Usage**: `/test-e2e`

---

### `/ux-review`
Review UI/UX design.

**Usage**: `/ux-review [component]`

**Example**: `/ux-review ProjectSelector`

---

### `/ux-fix`
Fix UI/UX issues.

**Usage**: `/ux-fix [issue-id]`

**Example**: `/ux-fix UX-01`

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-12 | BMAD | MVP version - Notes + IDE only |
