# Story 21-3: Project Management UI Localization

**Epic:** 21 - Client-Side Localization (EN/VI)  
**Sprint:** 13 (parallel track)  
**Status:** drafted  
**Priority:** P2  

---

## User Story
As a **user**,  
I want **the dashboard/project management UI to honor my language choice (EN/VI) without URL changes**,  
So that **all dashboard labels, actions, and empty states read in my selected language**.

---

## Acceptance Criteria
- **AC-21-3-1**: Dashboard headings, buttons, and CTAs (e.g., “Recent Projects”, “Open Local Folder”, “Open Workspace”) render in the selected locale (EN/VI).  
- **AC-21-3-2**: All dashboard toasts/errors/empty states (e.g., permission denied, failed to load projects, “No file open”, “Waiting for dev server…”) render in the selected locale.  
- **AC-21-3-3**: Locale choice persists via localStorage and is restored on reload with fallback to EN on invalid/missing values.  
- **AC-21-3-4**: `html lang` and `og:locale` reflect the selected locale after toggle (client-only).  

---

## Tasks
- [ ] **T0 Research**: Load architecture.md (cross-cutting #6 localization); gather patterns from deepwiki/context7 for client-only i18n and head updates.  
- [ ] **T1 Strings Inventory**: Identify all user-facing strings in dashboard route (`src/routes/index.tsx`) and related helpers/toasts.  
- [ ] **T2 Resource Keys**: Add EN/VI keys for dashboard + toasts/errors/empty/loader texts to `src/i18n/en.json`/`vi.json`.  
- [ ] **T3 Wire t()**: Replace hardcoded dashboard strings with `t(...)`; ensure locale toggle from Header is applied.  
- [ ] **T4 Meta/Head check**: Verify `html lang` and `og:locale` update after toggle; adjust if route head needs awareness.  
- [ ] **T5 Tests**: Add/extend tests covering persistence fallback and at least one dashboard string in each locale (happy path + fallback).  
- [ ] **T6 Docs/Governance**: Update sprint-status.yaml and bmm-workflow-status.yaml when promoted.  

---

## Research Requirements
- Read `_bmad-output/architecture.md` (Localization: client-only, html lang, lazy bundles).  
- Use DeepWiki/Context7 for client-only i18n patterns with TanStack Router head management (no URL segments).  
- Confirm no SSR coupling needed; rely on client-only locale state.  

---

## Dev Notes
- Follow hook composition; avoid touching routeTree.gen.ts.  
- Keep LocaleProvider single source of locale; reuse existing `setLocale` to update html lang + og:locale.  
- Ensure toasts/errors routed through i18n keys; avoid hardcoded strings.  

---

## References
- `_bmad-output/architecture.md` (Localization cross-cutting #6)  
- `src/routes/index.tsx` (Dashboard)  
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
| 2025-12-20 | drafted | Story created for dashboard localization |
