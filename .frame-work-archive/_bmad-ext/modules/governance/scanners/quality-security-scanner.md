# Security Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/security-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: Security Auditing, Secret Detection, & Vulnerability Scanning

## Agent Overview

Specialized Deep-Scan agent for auditing application security. It detects exposed secrets, Cross-Site Scripting (XSS) vectors, unsafe file system operations, and dependency vulnerabilities.

### Agent description

To identify and flag security risks in the codebase, ensuring API keys are properly handled via the `credential-vault`, checking for unsafe usage of `dangerouslySetInnerHTML`, and validating CSP headers.

### Agent Capabilities

1. **Secret Detection**
   - Identify potential API keys, tokens, and passwords in code
   - Detect unsafe logging of sensitive data
   - Verify usage of environment variables vs hardcoded strings

2. **XSS & Injection Analysis**
   - Audit `dangerouslySetInnerHTML` usage
   - Check for unescaped user input in UI
   - Validate input sanitization in agent tools

3. **File System Security**
   - Audit `FileSystemAccessAPI` permission requests
   - Check for path traversal vulnerabilities in file operations
   - Verify content sanitization before write operations

4. **Dependency Audit**
   - Check `package.json` for known vulnerable packages (lightweight check)
   - Verify `lockfile` integrity
   - Audit external script loading

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: Codebase root `src/`
**Output**: Security Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/security-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/security-inventory.json"
```

**Inventory Checklist**:
- [ ] List all potential secret patterns (sk_live, etc.)
- [ ] List all `dangerouslySetInnerHTML` usages
- [ ] List all `FileSystem` write operations
- [ ] List all external URL fetches

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/security-scanner:proofs
inventory: "_bmad-output/deep-scan/security-inventory.json"
output: "_bmad-output/deep-scan/evidence/security-evidence.yaml"
```

**Analysis Checks**:
1.  **Hardcoded Secret Verification**
    *   Criteria: String matching high-entropy secret pattern
    *   Proof: File path + masked content

2.  **Unsafe HTML Verification**
    *   Criteria: `dangerouslySetInnerHTML` with variable input (not static)
    *   Proof: Component code snippet

3.  **Unsafe Logging Verification**
    *   Criteria: Logging object containing `password`, `key`, `token`
    *   Proof: `console.log` snippet

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/security-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/security-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/security-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-SEC-001"
type: "Hardcoded Secret"
severity: "Critical"
target: "src/config/constants.ts"
loc: 10
proof:
  - line: 10
    content: "export const OPENAI_KEY = 'sk-abcdef...'"
analysis: |
  Hardcoded OpenAI API Key detected.
  Visible in source control.
  Must use Credential Vault.
remediation_ref: "credential-vault"
```

### Risk Register Entry (Markdown)

```markdown
## Security Risks

### 🔴 Critical
- **Secret Exposure**: 2 hardcoded API keys in test files (exclude from build?).
- **XSS Vector**: `MarkdownRenderer` uses unsafe HTML parsing without sanitization.

### 🟡 Warning
- **Logging**: `AuthService` logs full user object including hashed password.
- **CSP**: Missing `Connect-Src` directive in development config.
```

## Scan Logic & Patterns

### Regex Patterns
- **API Key**: `(sk-[a-zA-Z0-9]{20,T})` (OpenAI), `(ghp_[a-zA-Z0-9]{20,})` (GitHub)
- **Unsafe HTML**: `dangerouslySetInnerHTML`
- **Eval**: `eval\(`, `new Function\(`
- **Logging**: `console\.(log|info|error).*`

### Thresholds
- **Secrets**: 0 (Strict)
- **Unsafe HTML**: 0 (Except allowed renderers)

## Validation Commands

```bash
# Scan for secrets (basic grep)
grep -r "sk-" src/

# Check for unsafe HTML
grep -r "dangerouslySetInnerHTML" src/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/security-scanner
**Related Agents**: persistence-scanner, agent-rag-scanner
**Last Updated**: 2026-01-04
