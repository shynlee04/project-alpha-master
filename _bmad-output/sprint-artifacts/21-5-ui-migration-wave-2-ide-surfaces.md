# Story 21-5: UI Migration & Bulk Automation

**Epic:** 21 - Client-Side Localization (EN/VI)  
**Sprint:** 13 (parallel track)  
**Status:** drafted  
**Priority:** P2  

---

## User Story
As a **developer**,  
I want **to bulk-migrate hardcoded strings to i18n keys using automation**,  
So that **I can rapidly localize the IDE surfaces with minimal manual error**.

---

## Acceptance Criteria
- **AC-21-5-1**: Core IDE surfaces (Header, Sidebar, Editor controls, Terminal labels) use `t()` function.
- **AC-21-5-2**: All English strings are extracted to `en.json` via the automation pipeline.
- **AC-21-5-3**: `vi.json` contains placeholder translations (or machine translated baseline).
- **AC-21-5-4**: No functional regressions in IDE layout or interactivity.

---

## Tasks
- [ ] **T0 Automation**: Run `pnpm i18n:extract` (setup in 21-1) to generate initial baseline.
- [ ] **T1 Codemod/Manual**: Wrap hardcoded strings in `t('key', 'default value')` in `src/components/ide/*`.
    - *Focus on: Sidebar, PreviewPanel, Terminal, Editor status bar.*
- [ ] **T2 Toast/Feedback**: Migrate imperative strings in toast notifications.
- [ ] **T3 Extraction**: Run extraction script to populate `en.json`.
- [ ] **T4 Translation**: Populate `vi.json` (use AI or auto-translate tool for initial pass).
- [ ] **T5 Verification**: Verify UI in both languages.

---

## Research Requirements
- Identify any strings passed as props that need special handling.

---

## Dev Notes
- Use `i18n-ally` or similar VS Code extensions to assist identification.
- Commit `en.json` updates frequently.

---

## References
- Story 21-1
