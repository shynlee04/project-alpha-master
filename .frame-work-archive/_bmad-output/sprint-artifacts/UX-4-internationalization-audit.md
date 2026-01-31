# Story UX-4: Internationalization Audit

**Epic:** EPIC-UX: System-Wide UX Remediation  
**Priority:** P1 - HIGH  
**Story Points:** 4  
**Estimated Effort:** 2 hours  
**Status:** Ready for Implementation  
**Component Area:** i18n, All Components

---

## User Story

**As a** Vietnamese user of the Via-Gent application  
**I want** all UI text to be available in Vietnamese  
**So that** I can use the application comfortably in my native language

## Problem Statement

The codebase may contain:
1. Hardcoded English strings that should use `t()` function
2. Vietnamese translations missing in `vi.json` that exist in `en.json`

This creates a poor experience for non-English users and violates i18n standards.

## Background

From the UX scan at `_bmad-output/ux-scan-results.md`:
- **24+ potential hardcoded strings detected**
- **Vietnamese translation completeness unknown**

Reference: `src/i18n/locales/en.json` and `vi.json`

## Technical Details

### Files to Audit

| File | Status | Notes |
|------|--------|-------|
| `src/presentation/components/ui/` | Needs verification | Button labels, status messages |
| `src/presentation/components/ide/` | Needs verification | Status messages, tooltips |
| `src/presentation/components/chat/` | Needs verification | Chat labels, button text |

### Search Patterns for Hardcoded Strings

```bash
# Search for common hardcoded patterns
grep -r ">'Save'<" src/ --include="*.tsx"
grep -r ">'Cancel'<" src/ --include="*.tsx"
grep -r ">'Loading...'" src/ --include="*.tsx"
grep -r "'>Delete<'" src/ --include="*.tsx"
grep -r "'>Confirm<'" src/ --include="*.tsx"
grep -r "'>Close<'" src/ --include="*.tsx"
grep -r "'>Edit<'" src/ --include="*.tsx"
grep -r "'>New<'" src/ --include="*.tsx"
grep -r "'>Add<'" src/ --include="*.tsx"
grep -r "'>Remove<'" src/ --include="*.tsx"
```

### Vietnamese Translation Comparison

```bash
# Compare keys between en.json and vi.json
diff <(jq -r 'keys[]' src/i18n/locales/en.json | sort) \
     <(jq -r 'keys[]' src/i18n/locales/vi.json | sort)
```

## Acceptance Criteria

### AC-1: Hardcoded String Audit
- [ ] Search for common hardcoded patterns across all components
- [ ] Identify files with hardcoded English text
- [ ] Document findings in audit report

### AC-2: Replace Hardcoded Strings (if found)
- [ ] Replace hardcoded strings with `t('key')` calls
- [ ] Add missing keys to `en.json`
- [ ] Verify existing keys are used

### AC-3: Vietnamese Translation Completeness
- [ ] Compare `en.json` and `vi.json` key counts
- [ ] Identify missing keys in `vi.json`
- [ ] Document missing keys

### AC-4: Add Vietnamese Translations
- [ ] Add Vietnamese translations for missing keys
- [ ] Run `pnpm i18n:extract` to update translation files
- [ ] Verify translations are correct

### AC-5: i18n Function Verification
- [ ] Verify all `t()` calls use valid keys
- [ ] Verify no missing keys cause runtime errors
- [ ] Test language switching (if implemented)

## Tasks

### Task 1: Hardcoded String Search (30 minutes)
- [ ] Search for common hardcoded patterns
- [ ] Review search results
- [ ] Document findings

### Task 2: Hardcoded String Replacement (if found) (30 minutes)
- [ ] Replace identified hardcoded strings
- [ ] Add keys to translation files
- [ ] Verify replacements

### Task 3: Vietnamese Translation Comparison (30 minutes)
- [ ] Compare translation files
- [ ] Identify missing keys
- [ ] Document missing keys

### Task 4: Add Vietnamese Translations (30 minutes)
- [ ] Add translations for missing keys
- [ ] Run i18n extraction
- [ ] Verify completeness

## Implementation Notes

### Adding New Translation Keys

1. Add to `src/i18n/locales/en.json`:
```json
{
  "common.save": "Save",
  "common.cancel": "Cancel"
}
```

2. Add to `src/i18n/locales/vi.json`:
```json
{
  "common.save": "Lưu",
  "common.cancel": "Hủy"
}
```

3. Use in component:
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <button>{t('common.save')}</button>
  );
}
```

### Running i18n Extraction

```bash
pnpm i18n:extract
```

This will scan code for `t()` calls and update translation files.

### Translation Key Naming Convention

- Use dot notation: `component.section.key`
- Example: `ide.fileTree.newFile`, `common.save`, `chat.sendMessage`

## Dependencies

- None - can be implemented independently

## Testing Approach

### Unit Testing
- Verify no hardcoded strings remain (grep)
- Verify all `t()` calls use valid keys

### Manual Testing
- Switch to Vietnamese language
- Verify UI text displays in Vietnamese
- Verify no missing translation keys

### Visual Testing
- Compare English and Vietnamese views
- Verify translations fit in UI elements
- Verify no text overflow

## Definition of Done

- [ ] All hardcoded strings replaced with `t()` calls
- [ ] All Vietnamese translations added
- [ ] i18n extraction runs successfully
- [ ] No runtime errors from missing keys
- [ ] Code reviewed and approved
- [ ] Handoff artifact created

## References

- **UX Scan Results:** `_bmad-output/ux-scan-results.md`
- **i18n Configuration:** `i18next-scanner.config.cjs`
- **Translation Files:** `src/i18n/locales/en.json`, `vi.json`

---

**Created:** 2026-01-09  
**Story Key:** UX-4
