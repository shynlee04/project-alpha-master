# Story UX-4: Internationalization Audit

**Epic:** EPIC-UX: System-Wide UX Remediation
**Status:** drafted
**Priority:** P1 - High
**Points:** 4
**Estimated:** 2 hours
**Created:** 2026-01-09
**Source:** `_bmad-output/ux-scan-results.md`

---

## User Story

As a Vietnamese user,
I want all UI text to be available in my language,
So that I can understand and use the application effectively.

---

## Problem Statement

The codebase has potential hardcoded English strings and potential gaps in Vietnamese translations. While most UI uses i18n `t()` calls, an audit is needed to ensure:
1. No hardcoded strings remain
2. All English translations have Vietnamese equivalents
3. New strings are properly extracted

---

## Context

- **Reference:** `_bmad-output/ux-scan-results.md` (Section 4)
- **Translation Files:** `src/i18n/locales/en.json`, `src/i18n/locales/vi.json`
- **Extractor:** `i18next-scanner.config.cjs`

---

## Acceptance Criteria

### AC-1: Hardcoded String Audit ✅
- [ ] Search for common hardcoded patterns in presentation components
- [ ] `src/presentation/components/ui/` - Verify all strings use `t()`
- [ ] `src/presentation/components/ide/` - Verify all strings use `t()`
- [ ] `src/presentation/components/chat/` - Verify all strings use `t()`
- [ ] Replace any hardcoded strings with `t()` calls

### AC-2: Translation Key Comparison ✅
- [ ] Compare `en.json` vs `vi.json` key counts
- [ ] Identify missing keys in `vi.json`
- [ ] Add Vietnamese translations for missing keys
- [ ] Verify translation files are valid JSON

### AC-3: Translation Extraction ✅
- [ ] Run `pnpm i18n:extract` to scan for new strings
- [ ] Add new keys to both translation files
- [ ] Verify extracted keys are complete

### AC-4: Critical Path Verification ✅
- [ ] Verify button labels (Save, Cancel, Delete, Confirm)
- [ ] Verify status messages (Loading, Error, Success)
- [ ] Verify dialog titles and descriptions
- [ ] Verify form labels and placeholders

### AC-5: Validation ✅
- [ ] Build passes without errors
- [ ] All translation files valid JSON
- [ ] No hardcoded strings in presentation components
- [ ] Vietnamese translations display correctly

---

## Tasks

### Task 1: Hardcoded String Search (30 min)
- [ ] Search for `'>Save<'`, `'>Cancel<'`, `'>Loading...'`, etc.
- [ ] Identify files with potential hardcoded strings
- [ ] Document findings in story file

### Task 2: Translation Key Comparison (30 min)
- [ ] Compare en.json and vi.json key counts
- [ ] Identify missing keys
- [ ] Create list of keys needing Vietnamese translation

### Task 3: Add Missing Vietnamese Translations (30 min)
- [ ] Add Vietnamese translations for missing keys
- [ ] Ensure translations are contextually appropriate
- [ ] Validate JSON syntax

### Task 4: Hardcoded String Replacement (15 min)
- [ ] Replace any hardcoded strings found
- [ ] Add new i18n keys if needed
- [ ] Update translation files

### Task 5: Extraction and Validation (15 min)
- [ ] Run `pnpm i18n:extract`
- [ ] Verify no extraction errors
- [ ] Run `pnpm build` to verify

---

## Technical Notes

### Hardcoded String Search Commands
```bash
# Search for common hardcoded patterns
grep -r ">'Save'<" src/ --include="*.tsx"
grep -r ">'Cancel'<" src/ --include="*.tsx"
grep -r ">'Loading...'" src/ --include="*.tsx"
grep -r ">'Delete<'" src/ --include="*.tsx"
grep -r ">'Confirm<'" src/ --include="*.tsx"
```

### Translation Comparison
```bash
# Compare keys between languages
diff <(jq -r 'keys[]' src/i18n/locales/en.json | sort) \
     <(jq -r 'keys[]' src/i18n/locales/vi.json | sort)
```

### i18n Extraction
```bash
# Extract new translation keys
pnpm i18n:extract
```

---

## Dev Notes

**Reference:** `_bmad-output/project-planning-artifacts/architecture.md`

### Architecture Patterns
- All UI strings must use `t()` hook from i18next
- Translation files located in `src/i18n/locales/`
- Use `pnpm i18n:extract` to update translation files

### Component Patterns
- Search for hardcoded strings: `'>Save<'`, `'>Cancel<'`, etc.
- Compare en.json vs vi.json for completeness
- Ensure all new strings are extracted to both files

---

## Research Requirements

- [ ] Review current i18n configuration
- Check i18next-scanner.config.csc for extraction patterns

---

## Dependencies

- None - can be done independently

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing translations | Medium | Fallback to English for missing keys |
| Invalid JSON | Low | Validate with `jq` before saving |

---

## Definition of Done

- [ ] No hardcoded strings in presentation components
- [ ] All en.json keys have vi.json equivalents
- [ ] `pnpm i18n:extract` completes without errors
- [ ] Build passes without errors
- [ ] Story file updated with completion timestamp

---

## Files Modified

- `src/i18n/locales/vi.json` - Add missing Vietnamese translations
- Any component files with hardcoded strings - Replace with `t()` calls

---

## Notes

- Some technical terms may not have Vietnamese translations - use English with context
- Button labels and dialog text are highest priority for translation
- Status messages and error text are second priority

---

**Created:** 2026-01-09  
**Last Updated:** 2026-01-09
