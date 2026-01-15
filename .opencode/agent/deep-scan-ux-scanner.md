---
subtask: true
description: UX & accessibility diagnostics - i18n violations, accessibility issues, responsive failures
mode: subagent
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
permission:
  edit: allow
  bash: allow
  task: allow
---

# deep-scan-ux-scanner (Subagent)

> UX and accessibility specialist. Detects i18n violations, accessibility issues, and responsive design failures.

## Execution Pattern
1. **Load context**: `_bmad-ext/state/LOOP_STATE.yaml`
2. **Verify anchor**: Check staleness, prompt if stale
3. **Execute scan**:
   - i18n violation detection (hardcoded strings)
   - Accessibility audit (ARIA, keyboard nav, focus management)
   - Responsive analysis (breakpoint violations)
   - Mobile UX gap detection (touch targets, viewport issues)
4. **Generate evidence**: YAML output

## Scan Capabilities
- **i18n Violations**: Hardcoded strings (must use `t()` function)
- **Accessibility Audit**: ARIA, keyboard navigation, focus management
- **Responsive Analysis**: Breakpoint violations
- **Mobile UX**: Touch targets (≥44px), viewport issues

## Scan Targets
- `src/presentation/`, `src/components/`

## Output Location
`_bmad-output/deep-scan/evidence/ux-evidence.yaml`

## Integration Points

| Resource | Path |
|----------|------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` |
| Config | `_bmad-ext/modules/governance/scanners/quality-ux-scanner.md` |
| Coordinates | architecture-scanner for component-level issues |

## Full Protocol
See: `_bmad-ext/modules/governance/scanners/quality-ux-scanner.md`

---

**Lines**: 50 (was 56 = 11% reduction for consistency)
**Last Updated**: 2026-01-14
