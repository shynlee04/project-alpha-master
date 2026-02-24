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
model: sonnet
color: "#FF0000"
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
