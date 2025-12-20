# Story 21-1: Locale-Aware Routing & HTML Lang

**Epic:** 21 - Client-Side Localization (EN/VI)  
**Sprint:** 13 (parallel track)  
**Status:** drafted  
**Priority:** P2  

---

## User Story
As a **user**,  
I want **to toggle language (EN/VI) client-side without URL changes**,  
So that **the UI and metadata reflect my language choice**.

---

## Acceptance Criteria
- **AC-21-1-1**: Language toggle switches UI strings between EN and VI without altering routes/URLs.  
- **AC-21-1-2**: Locale choice persists (localStorage) and is restored on reload; defaults to EN.  
- **AC-21-1-3**: `<html lang>` and head metadata update to the active locale on toggle.  
- **AC-21-1-4**: Locale is exposed via context/store hook for any component to read.  
- **AC-21-1-5**: Fallback: if stored/unknown locale, app gracefully falls back to EN and resets invalid value.

---

## Tasks
- [ ] **T0 Research**: Review architecture/state docs; confirm client-only i18n guidance.  
- [ ] **T1 I18n provider**: Add react-i18next (or equivalent) with EN/VI bundles; lazy-load; fallback EN.  
- [ ] **T2 Locale state**: Implement locale context/hook (useLocalePreference) with localStorage persistence and validation (en|vi).  
- [ ] **T3 UI toggle**: Add Header toggle to switch locale; propagates to provider.  
- [ ] **T4 Head/HTML lang**: Update `<html lang>` and head meta (e.g., og:locale) on locale change.  
- [ ] **T5 Tests/QA**: Unit tests for fallback, toggle, persistence, head/lang update.  
- [ ] **T6 Docs**: Update sprint-status and bmm-workflow-status after implementation.

---

## Research Requirements
- Read `_bmad-output/architecture.md` (cross-cutting: localization client-only, lazy bundles, `<html lang>`).  
- Read `_bmad-output/state-management.md` (planned `useLocalePreference` hook).  
- Use DeepWiki/Context7 for client-side i18n patterns and head/lang updates (no routing changes).  

---

## Dev Notes
- Client-only SPA (no SSR); lazy-load locale resources.  
- No URL changes; keep current routes.  
- Update `<html lang>` and head meta on toggle.  
- Validate `en` | `vi`; fallback to `en` on invalid stored value.  

---

## References
- `_bmad-output/architecture.md` (cross-cutting concern #6)  
- `_bmad-output/state-management.md` (planned `useLocalePreference` hook)  
- `_bmad-output/epics.md` Epic 21  

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
| 2025-12-20 | drafted | Story created for localization routing/lang |
