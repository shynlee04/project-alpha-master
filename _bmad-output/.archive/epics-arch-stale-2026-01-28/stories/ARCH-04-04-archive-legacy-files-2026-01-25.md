Story ID: ARCH-04-04
Title: Archive Legacy Files and Update Imports
Points: 8
Priority: P1
Status: pending
Description: |
  As a maintainer, I want legacy workspace files archived and imports
  updated so the codebase stays aligned with ADR-034.
Acceptance Criteria:
  - No imports remain from legacy ProjectContext paths.
  - Legacy files are archived under _bmad-ext/.archive/.
  - TypeScript compiles with zero errors.
  - Build succeeds without regressions.
Tasks:
  - [ ] Identify legacy workspace imports.
  - [ ] Archive deprecated files per governance.
  - [ ] Update remaining imports to canonical paths.
Dependencies:
  - ARCH-04-05
Time Box: 60 min
Handoff Artifacts:
  - _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
  - _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md

Summary:
  Remove remaining legacy context references and archive old files to
  keep the architecture aligned with ADR-034.

Verification Commands:
  - rg "from '@/lib/workspace/ProjectContext'" src
  - pnpm tsc --noEmit
  - pnpm build

Tool Constraints:
  write: true
  edit: true
  bash: true
  task: false
