# Persistence Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/persistence-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: Data Storage, Caching, & Synchronization Analysis

## Agent Overview

Specialized Deep-Scan agent for auditing the persistence layer. It analyzes IndexedDB (Dexie) schemas, LocalStorage usage, File System Access API patterns, and synchronization logic to ensure data integrity, security, and performance.

### Agent Purpose

To validate the reliability and security of local-first data storage, ensuring compliance with `ADR-024` (Clean Architecture), detecting unencrypted sensitive data, and verifying schema migration safety.

### Agent Capabilities

1. **Schema Integrity Audit**
   - Validate Dexie schema definitions against current types
   - Check version upgrade paths for breaking changes
   - Identify additive-only schema violations

2. **Sensitive Data Scan**
   - Detect plain-text API keys in LocalStorage/IndexedDB
   - Verify usage of `credential-vault` for secrets
   - Audit data export/import safety

3. **Storage Quota & Performance**
   - Analyze potential storage bottlenecks (bloated tables)
   - Check for missing indexes on frequently queried fields
   - Identify "God Tables" storing massive JSON blobs

4. **Synchronization Logic Audit**
   - Verify conflict resolution logic in sync managers
   - Detect race conditions in async storage operations
   - Audit error handling in persistence layers

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: `src/infrastructure/persistence/`, `src/lib/filesystem/`
**Output**: Persistence Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/persistence-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/persistence-inventory.json"
```

**Inventory Checklist**:
- [ ] List all Dexie table definitions
- [ ] List all `localStorage` / `sessionStorage` access points
- [ ] Identify all File System Access API usage
- [ ] Map encryption usage (where `AES-GCM` is applied)

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/persistence-scanner:proofs
inventory: "_bmad-output/deep-scan/persistence-inventory.json"
output: "_bmad-output/deep-scan/evidence/persistence-evidence.yaml"
```

**Analysis Checks**:
1.  **Unencrypted Secret Verification**
    *   Criteria: Storing `apiKey`, `token`, `secret` in `localStorage` or non-encrypted Dexie table
    *   Proof: Code snippet of setItem/put operation

2.  **Schema Mutation Verification**
    *   Criteria: Modifying existing fields in Dexie version upgrade (instead of adding new)
    *   Proof: Schema version diff logic

3.  **Storage Anti-Pattern Verification**
    *   Criteria: Large binary blobs (images/PDFs) stored directly in IndexedDB (without chunking)
    *   Proof: Type definition of stored entities

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/persistence-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/persistence-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/persistence-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-PER-001"
type: "Security Violation"
severity: "Critical"
target: "src/lib/legacy-storage.ts"
loc: 45
proof:
  - line: 45
    content: "localStorage.setItem('openai_api_key', apiKey);"
analysis: |
  Plain text storage of API keys in LocalStorage.
  Vulnerable to XSS attacks.
  Violates Security Policy and ADR-024.
remediation_ref: "credential-vault"
```

### Risk Register Entry (Markdown)

```markdown
## Persistence Risks

### 🔴 Critical
- **Unencrypted Secrets**: Found 3 instances of plain-text API key storage in legacy components.
- **Schema Risk**: Version 4 -> 5 migration drops `content` column without backup.

### 🟡 Warning
- **Performance**: `chat_logs` table lacks index on `timestamp`, slowing down history load.
- **Quota**: No checking of `StorageManager.estimate()` before saving large files.
```

## Scan Logic & Patterns

### Regex Patterns
- **LocalStorage**: `localStorage\.(setItem|getItem)`
- **Dexie Table**: `\.(stores|version)\(`
- **API Key Storage**: `.*(Key|Token|Secret).*(setItem|put)`
- **Encryption**: `crypto\.subtle\.encrypt`

### Thresholds
- **Max JSON Blob Size**: 5MB (conceptual check)
- **Table Column Count**: 20
- **Unindexed Queries**: 0 (Strict)

## Validation Commands

```bash
# Search for localStorage usage
grep -r "localStorage" src/

# Check Dexie versions
grep -r "\.version(" src/infrastructure/persistence/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/persistence-scanner
**Related Agents**: security-scanner, state-scanner
**Last Updated**: 2026-01-04
