---
name: deep-scan-security-scan
description: Security scanner for detecting secret leaks (API keys, tokens), XSS vulnerabilities, unsafe file operations, and input validation gaps. Auto-activates on: "secret leak", "api key", "xss", "security", "csrf"

triggers:
  - "secret leak"
  - "api key exposed"
  - "xss"
  - "security vulnerability"
  - "unsafe file op"
  - "input validation"
  - "csrf"

agent: deep-scan-security-scanner
source: _bmad/modules/deep-scan/agents/security-scanner.md
output: _bmad-output/deep-scan/evidence/security-evidence.yaml
---

# Security Scan Skill

Specialized scanner for security vulnerability detection.

## What It Scans

- **Secret Detection**: Exposed API keys, tokens, credentials
- **XSS Vectors**: Dangerous DOM manipulation
- **File Operation Safety**: Unsafe file system access
- **Input Validation**: Unsanitized user input

## Scan Targets

```
src/ (full codebase)
```

## Evidence Output

```yaml
id: "EV-SEC-001"
type: "Secret Leak"
severity: "Critical"
target: "src/lib/agent/providers/openai.ts:12"
secret: "Hardcoded API key pattern detected"
```

## Integration

**IMMEDIATE ESCALATION** for P0 security findings.
