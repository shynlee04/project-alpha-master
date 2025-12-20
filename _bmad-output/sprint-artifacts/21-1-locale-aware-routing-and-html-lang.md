# Story 21-1: Client-Side Localization Foundation & Automation Setup

**Epic:** 21 - Client-Side Localization (EN/VI)
**Sprint:** 13 (parallel track)
**Status:** drafted
**Priority:** P1

---

## User Story
As a **developer/user**,
I want **a robust client-side localization infrastructure with automated key extraction**,
So that **I can easily translate the app without manual JSON management or URL routing changes**.

---

## Acceptance Criteria
- **AC-21-1-1**: `react-i18next` is configured with `initReactI18next` and a client-side language detector (localStorage/navigator).
- **AC-21-1-2**: `i18next-scanner` (or equivalent) is configured to automatically scan code for `t('key')` and update `en.json`/`vi.json`.
- **AC-21-1-3**: `<html lang>` and document head metadata update dynamically based on the current locale.
- **AC-21-1-4**: No URL path changes occur when switching languages (pure client-side state).
- **AC-21-1-5**: Helper scripts (e.g., `pnpm i18n:extract`) exist to run the extraction tool.

---

## Tasks
- [ ] **T0 Research**: Validate `i18next-scanner` config for TypeScript/React.
- [ ] **T1 Dependencies**: Install `react-i18next`, `i18next`, `i18next-browser-languagedetector`, `i18next-scanner`.
- [ ] **T2 I18n Config**: Implement `src/i18n/config.ts` with detector and React plugin.
- [ ] **T3 Automation Setup**: Create `i18next-scanner.config.js` and add `i18n:extract` script to `package.json`.
- [ ] **T4 Locale Provider**: Create `LocaleProvider` context (wrapping `I18nextProvider` if needed, or just managing global sync).
- [ ] **T5 Head Updates**: Implement distinct logic (effect) to update `<html lang>` on locale change.
- [ ] **T6 Tests**: Unit test the configuration and detector fallback logic.
- [ ] **T7 Docs**: Document the extraction workflow in `development-guide.md`.

---

## Research Requirements
- Confirm `i18next-scanner` support for dynamic keys/defaults.
- Ensure `i18next-browser-languagedetector` order: `['localStorage', 'navigator']`.

---

## Dev Notes
- **NO ROUTING CHANGES**. Do not implement locale subpaths.
- Use `en` as the source of truth/default.
- Automation should sort keys for consistent diffs.

---

## References
- Epic 21
- `_bmad-output/architecture.md`
