# BMAD Deep Scan Full-Scan Execution Plan

**Session**: DEEP-SCAN-20260106-PLAN
**Orchestrator**: Deep Scan Orchestrator Agent
**Target**: BMAD V6 Codebase Foundation Audit
**Created**: 2026-01-06

---

## Executive Summary

Execute comprehensive 360-degree codebase audit using 9 parallel scanners to identify:
- God stores (>300 lines) for elimination
- God components (>300 lines) requiring splitting
- Security vulnerabilities (API keys, XSS vectors)
- Persistence layer health (IndexedDB patterns)
- UX completeness (mobile, i18n coverage)
- TypeScript safety (any types, ts-ignore)

**Output**: `_bmad-output/deep-scan/reports/`
- MASTER-RISK-REGISTER.md
- REMEDIATION-BACKLOG.yaml
- DEEP-SCAN-SUMMARY.md

---

## Phase 0: Setup & Initialization

### 0.1 Directory Structure Creation
```bash
_bmad-output/deep-scan/
├── reports/
│   ├── MASTER-RISK-REGISTER.md
│   ├── REMEDIATION-BACKLOG.yaml
│   └── DEEP-SCAN-SUMMARY.md
├── evidence/
│   ├── phase1-inventory/  # 9 JSON files
│   └── phase2-proofs/     # 9 YAML files
└── session-logs/
    └── scan-execution-log.md
```

### 0.2 Scanner Registry Load
Load all 9 scanner agent configurations via `agent-profile-loader`:

| Scanner ID | Agent Path | Target Domain |
|------------|-----------|---------------|
| state-scanner | `_bmad/modules/deep-scan/agents/state-scanner.md` | Zustand stores, god stores |
| types-scanner | `_bmad/modules/deep-scan/agents/types-scanner.md` | TypeScript quality |
| architecture-scanner | `_bmad/modules/deep-scan/agents/architecture-scanner.md` | Component structure |
| persistence-scanner | `_bmad/modules/deep-scan/agents/persistence-scanner.md` | IndexedDB, storage |
| agent-rag-scanner | `_bmad/modules/deep-scan/agents/agent-rag-scanner.md` | Knowledge sync |
| ux-scanner | `_bmad/modules/deep-scan/agents/ux-scanner.md` | Mobile, i18n, accessibility |
| workspace-scanner | `_bmad/modules/deep-scan/agents/workspace-scanner.md` | Workspace bindings |
| security-scanner | `_bmad/modules/deep-scan/agents/security-scanner.md` | Vulns, secrets |
| performance-scanner | `_bmad/modules/deep-scan/agents/performance-scanner.md` | Bottlenecks |

---

## Phase 1: Global Inventory (Parallel Execution)

### 1.1 Launch All 9 Scanners Simultaneously

**Execution Strategy**:
- Use background processes for parallel execution
- Each scanner outputs JSON inventory file
- Timeout: 5 minutes per scanner
- Target: Production code only (exclude `*.test.*`, `__tests__`)

#### Scanner 1: State Scanner
```bash
# Command structure (pseudo)
@bmad/deep-scan/state-scanner
→ Scan src/infrastructure/persistence/stores/
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/01-state-inventory.json
```

**Target Metrics**:
- Total store files
- Stores >300 lines (god stores)
- Stores >120 lines (violations)
- Zustand v5 pattern compliance
- Slice granularity

#### Scanner 2: Types Scanner
```bash
@bmad/deep-scan/types-scanner
→ Scan src/ (exclude tests)
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/02-types-inventory.json
```

**Target Metrics**:
- `any` type usage count
- `ts-ignore` / `ts-expect-error` count
- Implicit any violations
- Missing type annotations
- Generic type usage

#### Scanner 3: Architecture Scanner
```bash
@bmad/deep-scan/architecture-scanner
→ Scan src/components/
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/03-architecture-inventory.json
```

**Target Metrics**:
- Total components
- Components >300 lines (god components)
- Component depth (nesting levels)
- Import/export complexity
- Dependency coupling

#### Scanner 4: Persistence Scanner
```bash
@bmad/deep-scan/persistence-scanner
→ Scan src/infrastructure/persistence/
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/04-persistence-inventory.json
```

**Target Metrics**:
- IndexedDB schema patterns
- Dexie vs raw idb usage
- Quota handling strategies
- Transaction safety
- Migration scripts

#### Scanner 5: Agent RAG Scanner
```bash
@bmad/deep-scan/agent-rag-scanner
→ Scan src/infrastructure/knowledge/
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/05-rag-inventory.json
```

**Target Metrics**:
- Vector store implementations
- Embedding models used
- Chunking strategies
- Retrieval patterns
- Sync mechanisms

#### Scanner 6: UX Scanner
```bash
@bmad/deep-scan/ux-scanner
→ Scan src/routes/, src/components/
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/06-ux-inventory.json
```

**Target Metrics**:
- Touch targets <44px (mobile violations)
- i18n coverage (missing `t()` calls)
- Hardcoded strings count
- Accessibility attributes (aria-*)
- Responsive breakpoints

#### Scanner 7: Workspace Scanner
```bash
@bmad/deep-scan/workspace-scanner
→ Scan src/infrastructure/workspace/
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/07-workspace-inventory.json
```

**Target Metrics**:
- Workspace binding implementations
- File system permissions
- Tool access control
- Workspace isolation
- Context switching patterns

#### Scanner 8: Security Scanner
```bash
@bmad/deep-scan/security-scanner
→ Scan src/ (exclude tests)
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/08-security-inventory.json
```

**Target Metrics**:
- Hardcoded API keys/secrets
- Potential XSS vectors
- eval() / dangerous APIs
- Unvalidated user input
- Authentication/authorization patterns

#### Scanner 9: Performance Scanner
```bash
@bmad/deep-scan/performance-scanner
→ Scan src/
→ Output: _bmad-output/deep-scan/evidence/phase1-inventory/09-performance-inventory.json
```

**Target Metrics**:
- Large bundle imports
- Missing code splitting
- Unoptimized re-renders
- Memory leak patterns
- Network request efficiency

### 1.2 Phase 1 Output Validation

After all scanners complete, verify:
```bash
# Check all 9 inventory files exist
ls -la _bmad-output/deep-scan/evidence/phase1-inventory/

# Validate JSON syntax
for file in _bmad-output/deep-scan/evidence/phase1-inventory/*.json; do
  jq empty "$file" || echo "INVALID: $file"
done
```

---

## Phase 2: Evidence Collection (Parallel Execution)

### 2.1 Generate Detailed Proofs

Each scanner re-scans with depth, producing YAML evidence files:

#### Example: State Scanner Evidence
```yaml
# _bmad-output/deep-scan/evidence/phase2-proofs/01-state-evidence.yaml

scanner: state-scanner
timestamp: "2026-01-06T...:00Z"
findings:
  - id: "GOD-STORE-001"
    severity: "CRITICAL"
    file: "src/infrastructure/persistence/stores/rag-store.ts"
    lines: 1595
    violation_type: "god_store"
    description: "Store exceeds 300-line limit by 5.3x"
    evidence:
      - line_count: 1595
      - functions_count: 47
      - selectors_count: 23
      - slices_needed: 12
    recommendation: "Split into 12 focused slices ≤120 lines each"
    remediation_complexity: "HIGH"
    estimated_effort: "8 hours"
  # ... more findings
```

### 2.2 Evidence File Standards

All 9 YAML files MUST include:
- `scanner`: Scanner ID
- `timestamp`: ISO 8601
- `findings[]`: Array of finding objects
- `severity`: CRITICAL | HIGH | MEDIUM | LOW
- `violation_type`: Specific category
- `evidence`: Concrete proof (line numbers, counts)
- `recommendation`: Actionable fix
- `remediation_complexity`: Effort estimation
- `estimated_effort`: Time estimate

### 2.3 Phase 2 Output Validation

```bash
# Check all 9 evidence files exist
ls -la _bmad-output/deep-scan/evidence/phase2-proofs/

# Validate YAML syntax
for file in _bmad-output/deep-scan/evidence/phase2-proofs/*.yaml; do
  yamllint "$file" || echo "INVALID: $file"
done
```

---

## Phase 3: Evidence Synthesis

### 3.1 Invoke Evidence Synthesizer

```bash
@bmad/deep-scan/evidence-synthesizer
Input: _bmad-output/deep-scan/evidence/phase2-proofs/*.yaml
Output:
  - _bmad-output/deep-scan/reports/MASTER-RISK-REGISTER.md
  - _bmad-output/deep-scan/reports/REMEDIATION-BACKLOG.yaml
  - _bmad-output/deep-scan/reports/DEEP-SCAN-SUMMARY.md
```

### 3.2 Master Risk Register Structure

```markdown
# MASTER RISK REGISTER - BMAD Deep Scan

**Scan Date**: 2026-01-06
**Scanners Executed**: 9/9
**Total Findings**: XX
**Critical Risks**: X

## Executive Summary

[High-level overview]

## Critical Risks (P0)

### [RISK-ID]: [Brief Title]
- **Severity**: CRITICAL
- **Scanner**: [scanner-name]
- **Impact**: [business/technical impact]
- **Finding**: [detailed description]
- **Evidence**: [file:line]
- **Remediation**: [action]

## High Risks (P1)

[... same structure ...]

## Medium Risks (P2)

[... same structure ...]

## Low Risks (P3)

[... same structure ...]
```

### 3.3 Remediation Backlog Structure

```yaml
# REMEDIATION-BACKLOG.yaml

sprint: "ARC-2026-Q1"
created_at: "2026-01-06T...:00Z"

epics:
  - id: "ARC-EPIC-001"
    title: "God Store Elimination"
    priority: "P0"
    stories:
      - id: "ARC-001"
        title: "Split rag-store.ts (1595 lines)"
        estimate: "8h"
        complexity: "HIGH"
        dependencies: []
        acceptance_criteria:
          - "All slices ≤120 lines"
          - "No breaking changes"
          - "TypeScript passes"
      # ... more stories

  - id: "ARC-EPIC-002"
    title: "TypeScript Safety Improvements"
    priority: "P1"
    stories: [...]

metrics:
  total_findings: XX
  critical_risks: X
  high_risks: X
  medium_risks: X
  low_risks: X
  total_estimated_effort: "XXX hours"
```

---

## Execution Checklist

### Pre-Scan
- [ ] Create output directories
- [ ] Load all 9 scanner configurations
- [ ] Verify scanner accessibility
- [ ] Set execution timeouts

### Phase 1 (Inventory)
- [ ] Launch scanner 1: State
- [ ] Launch scanner 2: Types
- [ ] Launch scanner 3: Architecture
- [ ] Launch scanner 4: Persistence
- [ ] Launch scanner 5: Agent RAG
- [ ] Launch scanner 6: UX
- [ ] Launch scanner 7: Workspace
- [ ] Launch scanner 8: Security
- [ ] Launch scanner 9: Performance
- [ ] Wait for all to complete (max 5 min each)
- [ ] Validate 9 JSON files created
- [ ] Check JSON syntax validity

### Phase 2 (Proofs)
- [ ] Re-launch scanner 1 with depth
- [ ] Re-launch scanner 2 with depth
- [ ] Re-launch scanner 3 with depth
- [ ] Re-launch scanner 4 with depth
- [ ] Re-launch scanner 5 with depth
- [ ] Re-launch scanner 6 with depth
- [ ] Re-launch scanner 7 with depth
- [ ] Re-launch scanner 8 with depth
- [ ] Re-launch scanner 9 with depth
- [ ] Wait for all to complete
- [ ] Validate 9 YAML files created
- [ ] Check YAML syntax validity

### Phase 3 (Synthesis)
- [ ] Invoke evidence-synthesizer
- [ ] Generate MASTER-RISK-REGISTER.md
- [ ] Generate REMEDIATION-BACKLOG.yaml
- [ ] Generate DEEP-SCAN-SUMMARY.md
- [ ] Validate all 3 report files
- [ ] Calculate risk metrics
- [ ] Prioritize remediation stories

### Post-Scan
- [ ] Update sprint-status.yaml with scan results
- [ ] Archive scan logs
- [ ] Create handoff artifact for next phase
- [ ] Report completion to coordinator

---

## Risk Mitigation Strategies

### Scanner Execution Failures
- **Strategy**: Retry once with increased timeout
- **Fallback**: Manual grep-based scan
- **Logging**: Capture stderr to session-logs/

### Missing Scanner Configurations
- **Strategy**: Use default scanner template
- **Fallback**: Manual code review
- **Recovery**: Document config gap for future cycles

### Large Codebase Performance
- **Strategy**: Exclude test files, node_modules
- **Optimization**: Use ripgrep for fast pattern matching
- **Timeout**: 5 minutes per scanner max

### Evidence File Corruption
- **Strategy**: Validate JSON/YAML before proceeding
- **Recovery**: Re-run specific scanner
- **Backup**: Keep phase1 inventory as fallback

---

## Success Criteria

✅ **All 9 scanners execute successfully**
✅ **9 JSON inventory files generated (Phase 1)**
✅ **9 YAML evidence files generated (Phase 2)**
✅ **3 report files synthesized (Phase 3)**
✅ **Zero syntax errors in all outputs**
✅ **Critical risks identified and prioritized**
✅ **Remediation backlog is actionable**

---

## Next Actions (After Plan Approval)

1. **Execute Phase 1**: Launch 9 parallel scanners
2. **Validate Inventory**: Check JSON outputs
3. **Execute Phase 2**: Generate evidence proofs
4. **Synthesize Findings**: Create 3 report files
5. **Handoff to ARC Module**: Begin remediation cycles

---

## Estimated Timeline

- **Phase 1**: 5-10 minutes (parallel execution)
- **Phase 2**: 10-15 minutes (detailed scanning)
- **Phase 3**: 5 minutes (synthesis)
- **Total**: 20-30 minutes

---

**Plan Status**: DRAFT - PENDING USER APPROVAL
