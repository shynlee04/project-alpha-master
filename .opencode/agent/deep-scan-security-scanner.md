---
name: deep-scan-security-scanner
description: |
  Specialized scanner for security diagnostics. Use when:

  - Detecting secret leaks (API keys, tokens)
  - Finding XSS vulnerabilities
  - Identifying unsafe file operations
  - Auditing input validation gaps

  Auto-activation triggers:
  - "secret leak", "api key exposed", "xss"
  - "security vulnerability", "unsafe file op"
  - "input validation", "csrf protection"

  Loads full configuration from: _bmad/modules/deep-scan/agents/security-scanner.md
mode: subagent
model: minimax/MiniMax-M2.1
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


# Security Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/security-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- Secret Detection (find exposed API keys, tokens, credentials)
- XSS Vector Analysis (identify dangerous DOM manipulation)
- File Operation Safety (audit unsafe file system access)
- Input Validation Audit (check for unsanitized user input)

**Scan Targets**:
- `src/` (full codebase)

**Output**: `_bmad-output/deep-scan/evidence/security-evidence.yaml`

**Integration**: Coordinates with `persistence-scanner`, `agent-rag-scanner`
