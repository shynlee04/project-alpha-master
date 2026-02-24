Story ID: CC-AR-07
Title: Archive Legacy/Duplicate Files
Points: 3
Priority: P2
Status: done
Description: |
  As a maintainer
  I want deprecated plugin layout artifacts archived
  So that the codebase only keeps canonical, supported files.

Acceptance Criteria:
  - Duplicate layout files are archived in `_bmad-ext/.archive/epic-cc-ar02ar03-2026-01-26/`.
  - No broken imports remain after archival.
  - Archive manifest lists all archived files.
  - TypeScript reports no new errors.

Tasks:
  - [x] Archive legacy layout assets (drag-drop CSS, duplicate breakpoint hooks).
  - [x] Verify no imports reference archived paths.
  - [x] Record archive manifest with replacements.

Dependencies:
  - CC-AR-04

Time Box: 45 min
Handoff Artifacts:
  - _bmad-ext/.archive/epic-cc-ar02ar03-2026-01-26/ARCHIVE-MANIFEST.md
