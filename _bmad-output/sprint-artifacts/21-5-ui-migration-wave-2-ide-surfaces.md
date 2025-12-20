# Story 21-5: Workspace/IDE Core Localization

**Epic:** 21 - Client-Side Localization (EN/VI)  
**Sprint:** 13 (parallel track)  
**Status:** drafted  
**Priority:** P2  

---

## User Story
As a **user**,  
I want **the IDE/workspace UI (editor, terminal, sync/permissions, toasts/empty states) to reflect my language choice (EN/VI)**,  
So that **all in-app surfaces read in my selected language without changing URLs**.

---

## Acceptance Criteria
- **AC-21-5-1**: Workspace chrome labels (auto-sync, sync now, switch folder, hide chat, agent chat) render in selected locale.  
- **AC-21-5-2**: Sync/permission prompts, warnings, and per-file sync messages render in selected locale.  
- **AC-21-5-3**: Editor/terminal empty states and waiting messages (e.g., “No file open”, “Waiting for dev server…”) render in selected locale.  
- **AC-21-5-4**: Locale choice persists (localStorage) and falls back to EN on invalid/missing values; html lang and og:locale match selection.  

---

## Tasks
- [ ] **T0 Research**: Review architecture.md (localization cross-cutting); reference 21-1/21-3 findings; confirm client-only approach.  
- [ ] **T1 Strings Inventory**: Identify user-facing strings in workspace route/components (sync indicators, toasts, permission prompts, empty states).  
- [ ] **T2 Resource Keys**: Add EN/VI keys for workspace/IDE strings to `src/i18n/en.json`/`vi.json`.  
- [ ] **T3 Wire t()**: Replace hardcoded strings in workspace UI components; ensure locale toggle applies.  
- [ ] **T4 Meta/Head check**: Ensure html lang/og:locale remain aligned after toggle (reuse LocaleProvider).  
- [ ] **T5 Tests**: Add/extend tests for at least one workspace label per locale and fallback behavior.  
- [ ] **T6 Docs/Governance**: Update sprint-status.yaml and bmm-workflow-status.yaml when promoted.  

---

## Research Requirements
- Read `_bmad-output/architecture.md` (Localization cross-cutting #6).  
- Use DeepWiki/Context7 for client-only i18n and head updates (no URL segments).  
- Cross-check sync/permission strings for consistency with File System Access patterns.  

---

## Dev Notes
- Reuse LocaleProvider and existing setLocale for html lang/og:locale.  
- Avoid touching routeTree.gen.ts; keep translations in i18n JSON.  
- Keep technical logs untouched; only user-facing strings go through i18n.  

---

## References
- `_bmad-output/architecture.md` (Localization)  
- `src/routes/workspace/*`, `src/components/ide/*`, `src/lib/filesystem/*` (UI-facing strings)  
- `src/i18n/config.ts`, `src/i18n/LocaleProvider.tsx`, `src/i18n/en.json`, `src/i18n/vi.json`  

---

## Dev Agent Record
- Agent: _(set in dev phase)_  
- Session: _(set in dev phase)_  
- Files changed: _(set in dev phase)_  
- Tests: _(set in dev phase)_  

---

## Status History
| Date | Status | Notes |
|------|--------|-------|
| 2025-12-20 | drafted | Story created for workspace/IDE localization |
