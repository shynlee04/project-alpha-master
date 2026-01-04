---
name: deep-scan-ux-scan
description: UX scanner for detecting i18n violations (hardcoded strings), accessibility issues, responsive design failures, and mobile UX gaps. Auto-activates on: "hardcoded string", "i18n", "a11y", "accessibility", "responsive", "mobile"

triggers:
  - "hardcoded string"
  - "i18n violation"
  - "a11y"
  - "accessibility"
  - "responsive issue"
  - "mobile ux"

agent: deep-scan-ux-scanner
source: _bmad/modules/deep-scan/agents/ux-scanner.md
output: _bmad-output/deep-scan/evidence/ux-evidence.yaml
---

# UX Scan Skill

Specialized scanner for internationalization, accessibility, and responsive design.

## What It Scans

- **i18n Violations**: Hardcoded non-translatable strings
- **Accessibility**: ARIA, keyboard navigation, focus issues
- **Responsive**: Breakpoint violations, mobile failures
- **Touch Targets**: Minimum 44x44px requirement

## Scan Targets

```
src/presentation/
src/components/
```

## Evidence Output

```yaml
id: "EV-UX-001"
type: "i18n Violation"
severity: "Medium"
target: "src/components/ide/StatusBar.tsx:23"
issue: "Hardcoded string: 'Files' instead of t('files')"
```

## Integration

No auto-remediation (requires human review for UX decisions).
