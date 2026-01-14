---
name: deep-scan-ux-scanner
description: |
  Specialized scanner for UX & accessibility diagnostics. Use when:

  - Detecting i18n violations (hardcoded strings)
  - Finding accessibility issues
  - Identifying responsive design failures
  - Auditing mobile UX gaps

  Auto-activation triggers:
  - "hardcoded string", "i18n violation", "a11y"
  - "accessibility", "responsive issue", "mobile ux"
  - "aria violation", "touch target"

  Loads full configuration from: _bmad/modules/deep-scan/agents/ux-scanner.md
mode: subagent
model: MiniMax/MiniMax-M2.1
temperature: 0.1
tools:
  write_md_json_yaml_xml: true
  edit_md_json_yaml_xml: true
  bash:  true
  read:  true
  mcp: true
  glob: true
  grep: true
  list: true
  search: true
  serena mcp: true
  repomix mcp: true
  tavily mcp: true
  context7 mcp: true
  deepwiki mcp: true
  tanstack mcp: true
---

# UX Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/ux-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- i18n Violation Detection (hardcoded strings)
- Accessibility Audit (ARIA, keyboard nav, focus management)
- Responsive Analysis (breakpoint violations)
- Mobile UX Gap Detection (touch targets, viewport issues)

**Scan Targets**:
- `src/presentation/`, `src/components/`

**Output**: `_bmad-output/deep-scan/evidence/ux-evidence.yaml`

**Integration**: Coordinates with `architecture-scanner` for component-level issues
