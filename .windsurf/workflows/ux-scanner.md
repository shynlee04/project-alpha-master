# UX Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/ux-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: User Experience, Accessibility, & Internationalization

## Agent Overview

Specialized Deep-Scan agent for auditing the frontend user experience. It validates mobile responsiveness, internationalization coverage, accessibility compliance, and error state handling.

### Agent description

To ensure the application is usable, accessible, and localized, identifying hardcoded strings, non-responsive layouts, and accessibility violations (WCAG).

### Agent Capabilities

1. **Responsiveness Audit**
   - Detect hardcoded pixel values (use `rem`/`em` instead)
   - Verify usage of `useResponsive` hook vs media queries
   - Check for mobile-specific layout logic

2. **Internationalization (i18n) Audit**
   - Identify hardcoded text strings in JSX
   - Verify usage of `t()` hook
   - Check for missing translation keys in `en.json` / `vi.json`

3. **Accessibility (a11y) Audit**
   - Detect missing `alt` text on images
   - Check for `aria-*` attributes on interactive elements
   - Verify keyboard navigability (focus management)
   - Identify semantic HTML violations (div soups)

4. **Error Handling & Feedback**
   - Audit usages of `toast` notifications
   - Check for Loading/Error states in components
   - Verify `ErrorBoundary` usage

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: `src/presentation/`, `src/components/`
**Output**: UX Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/ux-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/ux-inventory.json"
```

**Inventory Checklist**:
- [ ] List all React Components
- [ ] Map hardcoded strings in JSX
- [ ] List usages of `px` units in styles
- [ ] Inventory interactive elements (`button`, `a`, `input`)

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/ux-scanner:proofs
inventory: "_bmad-output/deep-scan/ux-inventory.json"
output: "_bmad-output/deep-scan/evidence/ux-evidence.yaml"
```

**Analysis Checks**:
1.  **Hardcoded String Verification**
    *   Criteria: Text content inside JSX tags not wrapped in `{t('...')}`
    *   Proof: Component file + line number + string content

2.  **Responsiveness Violation**
    *   Criteria: Fixed width/height in pixels (`width: 500px`)
    *   Proof: Style definition snippet

3.  **Accessibility Violation**
    *   Criteria: `<img>` tag missing `alt` prop
    *   Proof: Code snippet

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/ux-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/ux-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/ux-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-UX-001"
type: "i18n Violation"
severity: "Medium"
target: "src/components/chat/ChatPanel.tsx"
loc: 45
proof:
  - line: 45
    content: "<button>Send Message</button>"
analysis: |
  Hardcoded string "Send Message".
  Will not translate to Vietnamese.
  Use `{t('chat.sendMessage')}` instead.
remediation_ref: "i18n-scanner"
```

### Risk Register Entry (Markdown)

```markdown
## UX Risks

### 🔴 Critical
- **Accessibility**: 15 buttons missing `aria-label` or text content.
- **Mobile**: `Sidebar` has fixed width 300px causing overflow on mobile.

### 🟡 Warning
- **i18n**: 45 hardcoded strings detected in `Settings` pages.
- **Feedback**: Long running actions missing loading indicators.
```

## Scan Logic & Patterns

### Regex Patterns
- **Hardcoded String**: `>[\w\s]+<` (simplified)
- **Pixel Usage**: `:\s*\d+px`
- **Missing Alt**: `<img(?!.*alt=).*?>`
- **Missing i18n**: `(?!t\().*` (conceptual)

### Thresholds
- **Hardcoded Strings**: 0 (Goal)
- **Missing Alt**: 0 (Strict)

## Validation Commands

```bash
# Find hardcoded text (requires specialized linter or complex grep)
# Simple check for missing t() calls
grep -r ">[A-Z]" src/components/ | grep -v "t("

# Check for fixed pixel widths
grep -r "width:.*px" src/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/ux-scanner
**Related Agents**: architecture-scanner
**Last Updated**: 2026-01-04
