# Context Scanner Agent

**Agent ID**: `@bmad/modules/governance/scanners/quality-context-scanner`
**Version**: 1.0.0
**Created**: 2026-01-14
**Specialization**: Context Quality & Freshness Diagnostics

## Agent Overview

Specialized scanner for detecting context poisoning, stale artifacts, and context bloat. Enforces the 48-hour freshness threshold and relevance scoring defined in `context-strategy.md`.

### Agent description

To identify and flag context quality issues that could lead to incorrect decisions, wasted tokens, or context poisoning during agent execution.

### Agent Capabilities

1. **Staleness Detection**
   - Identify artifacts older than 48-hour threshold
   - Check file modification timestamps
   - Flag outdated documentation and specs

2. **Context Bloat Analysis**
   - Measure context package token counts
   - Detect redundant information
   - Identify over-inclusion of irrelevant files

3. **Consistency Validation**
   - Detect conflicting information across sources
   - Verify single-source-of-truth per domain
   - Flag orphaned file references

4. **Evidence Generation**
   - Generate standardized "Evidence Blocks" for findings
   - Capture specific violations with line numbers
   - Link findings to context-strategy policy

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: Context package, artifact registry
**Output**: Context Inventory

```bash
# Run inventory scan
@bmad/modules/governance/scanners/quality-context-scanner:inventory
target: "_bmad-output/context/"
output: "_bmad-output/deep-scan/context-inventory.json"
```

**Inventory Checklist**:
- [ ] List all artifact files with timestamps
- [ ] Measure token count per context package
- [ ] Check reference validity (files exist?)
- [ ] Categorize by domain and relevance

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/governance/scanners/quality-context-scanner:proofs
inventory: "_bmad-output/deep-scan/context-inventory.json"
output: "_bmad-output/deep-scan/evidence/context-evidence.yaml"
```

**Analysis Checks**:
1.  **Staleness Verification**
    *   Criteria: `NOW() - file_mtime > 48 hours`
    *   Proof: File path + timestamp + age calculation

2.  **Bloat Verification**
    *   Criteria: Token count > 10K OR relevance score < 0.5
    *   Proof: Token count + low-relevance file list

3.  **Consistency Verification**
    *   Criteria: Conflicting values for same property
    *   Proof: Conflicting snippets with sources

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/governance/scanners/quality-context-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/context-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/context-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-CONTEXT-001"
type: "Stale Artifact"
severity: "High"
target: "_bmad-output/artifacts/ux-specification.md"
age_hours: 72
proof:
  - file: "_bmad-output/artifacts/ux-specification.md"
    mtime: "2026-01-11T10:00:00Z"
    current_time: "2026-01-14T10:00:00Z"
    age: "72 hours"
analysis: |
  Artifact exceeds 48-hour freshness threshold (72 hours old).
  May contain outdated UI patterns or deprecated components.
  Should be refreshed before use in agent context.
remediation_ref: "context-strategy.md#staleness"
```

### Risk Register Entry (Markdown)

```markdown
## Context Quality Risks

### 🔴 High
- **Stale Artifact**: `ux-specification.md` (72 hours) - May contain outdated patterns
- **Orphaned Reference**: Context references deleted file `src/old/component.tsx`

### 🟡 Warning
- **Context Bloat**: Design context package (12K tokens) - Exceeds 10K limit
- **Low Relevance**: 3 files with relevance score < 0.3 included
```

## Scan Logic & Patterns

### Regex Patterns
- **Timestamp Extraction**: `lastUpdated:\s*"(\d{4}-\d{2}-\d{2})"`
- **File Reference**: `path:\s*"([^"]+\.md)"`
- **Token Estimate**: `(approx|~)\s*(\d+)\s*tokens`

### Thresholds
- **Max Age**: 48 hours (artifacts)
- **Max Tokens**: 10K (context package)
- **Min Relevance**: 0.5 (inclusion score)

## Validation Commands

```bash
# Check file age
stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" _bmad-output/artifacts/ux-specification.md

# Count tokens (rough estimate)
wc -w _bmad-output/context/*.md

# Verify file references exist
grep -oh 'path: "[^"]*"' context-package.yaml | xargs -I {} test -f {} || echo "Missing"
```

## Integration Points

| Resource | Path |
|----------|------|
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` |
| Context Strategy | `_bmad-ext/modules/governance/policies/context-strategy.md` |
| Evidence Output | `_bmad-output/deep-scan/evidence/context-evidence.yaml` |
| Coordinates | artifact-scanner for registry validation |

---

**Agent Owner**: @bmad/modules/governance/scanners/quality-context-scanner
**Related Agents**: artifact-scanner, evidence-synthesizer
**Last Updated**: 2026-01-14
