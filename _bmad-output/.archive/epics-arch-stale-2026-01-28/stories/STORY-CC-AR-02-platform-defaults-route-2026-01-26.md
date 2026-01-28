Story ID: CC-AR-02
Title: Wire platform-defaults.ts to Route
Points: 5
Priority: P0
Status: pending
Description: |
  As a user on any device
  I want platform-appropriate default plugins to load automatically
  So that the project route shows the correct toolset without manual setup.

Acceptance Criteria:
  - `initializeDefaults()` action exists in PluginLayoutStore.
  - `$projectId.tsx` calls `getDefaultPlugins()` and `getDefaultLayoutMode()` on first load.
  - Desktop FSA defaults load FileTree + Monaco + Chat.
  - Mobile defaults load Notes only.
  - TypeScript reports no new errors.

Tasks:
  - [ ] Verify existing defaults wiring in `src/routes/$projectId.tsx`.
  - [ ] Confirm `initializeDefaults()` in `src/presentation/layouts/PluginLayoutStore.ts`.
  - [ ] Align any missing defaults logic with `platform-defaults.ts`.
  - [ ] Run `pnpm tsc --noEmit` and capture output.

Dependencies:
  - CC-AR-01

Time Box: 60 min
Handoff Artifacts:
  - _bmad-output/handoffs/2026-01-26/CC-AR-02-DEV-REPORT-2026-01-26.md
