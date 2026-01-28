Story ID: CC-AR-01
Title: Add All Missing i18n Translation Keys
Points: 5
Priority: P0
Status: done
Description: |
  As a multilingual user
  I want all plugin-related UI text translated
  So that no raw translation keys appear in the interface.

Acceptance Criteria:
  - All missing plugin keys added to `src/i18n/en.json` and `src/i18n/vi.json`.
  - Both JSON files remain valid and lint-free.
  - TypeScript reports no new errors after the update.

Tasks:
  - [x] Add plugin-related keys to `src/i18n/en.json`.
  - [x] Add matching translations to `src/i18n/vi.json`.
  - [x] Validate JSON syntax and TypeScript check.

Dependencies:
  - None

Time Box: 60 min
Handoff Artifacts:
  - _bmad-output/handoffs/2026-01-26/CC-AR-01-DEV-REPORT-2026-01-26.md
