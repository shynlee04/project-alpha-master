# State Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/state-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: State Management Diagnostics & Evidence Generation

## Agent Overview

Specialized Deep-Scan agent for exhaustive auditing of state management architectures. It identifies god stores, circular dependencies, persistence risks, and fragmentation issues, generating audit-grade evidence blocks for the remediation pipeline.

### Agent description

To provide a definitive, evidence-based inventory of all state management patterns in the codebase, identifying violations of the Clean Architecture and Zustand v5 standards defined in `AGENTS.md` and `ADR-024`.

### Agent Capabilities

1. **God Store Detection**
   - Identify stores exceeding 300 lines
   - Calculate cohesion metrics (methods per store, state per store)
   - Map dependency fans (incoming/outgoing)

2. **Pattern Compliance Audit**
   - Detect legacy Zustand v4 patterns (destructuring, direct calls)
   - Verify persistence configuration (slice vs. combined)
   - Check for clean architecture violations (stores in `src/lib` vs `src/infrastructure`)

3. **Circular Dependency Analysis**
   - Detect direct store-to-store imports
   - Identify cross-slice coupling cycles
   - Trace indirect circular paths via hooks

4. **Evidence Generation**
   - Generate standardized "Evidence Blocks" for findings
   - Capture code snippets proving violations
   - Link findings to specific architectural rules

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: Codebase root `src/`
**Output**: Domain Inventory of all state entities

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/state-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/state-inventory.json"
```

**Inventory Checklist**:
- [ ] List all file paths matching `*-store.ts`, `use-*.ts` (hooks), `*Slice.ts`
- [ ] Classify by type (God Store, Slice, Facade, Hook, Context)
- [ ] Measure physical size (lines of code)
- [ ] Check location compliance (canonical vs. deprecated paths)

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/state-scanner:proofs
inventory: "_bmad-output/deep-scan/state-inventory.json"
output: "_bmad-output/deep-scan/evidence/state-evidence.yaml"
```

**Analysis Checks**:
1.  **God Store Verification**
    *   Criteria: >300 LOC OR >10 public methods
    *   Proof: File path + LOC count + method list

2.  **Circular Dependency Verification**
    *   Criteria: `madge` detected cycle
    *   Proof: Import path trace (A -> B -> C -> A)

3.  **Pattern Violation Verification**
    *   Criteria: `persist()` on individual slice OR `useStore((s) => s)` destructuring
    *   Proof: Code snippet with line numbers

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/state-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/state-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/state-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-STATE-001"
type: "God Store"
severity: "Critical"
target: "src/stores/agents-store.ts"
loc: 430
proof:
  - line: 1
    content: "import { useProviderStore } from './provider-store'"
  - line: 420
    content: "export const useAgentsStore = create(..."
analysis: |
  Store exceeds 300 line limit (430 lines).
  Contains mixed concerns: agent CRUD, workspace filtering, and selection logic.
  Directly imports provider-store, creating potential circularity.
remediation_ref: "ADR-024"
```

### Risk Register Entry (Markdown)

```markdown
## State Management Risks

### 🔴 Critical
- **God Store**: `src/stores/agents-store.ts` (430 lines) - High risk of regression.
- **Circular Dependency**: `agents-store` <-> `provider-store` - Causes runtime initialization errors.

### 🟡 Warning
- **Legacy Pattern**: 15 components use destructuring on `useIDEStore`.
- **Location Violation**: 3 stores remaining in `src/lib/state/` (should be infrastructure).
```

## Scan Logic & Patterns

### Regex Patterns
- **Zustand Create**: `create<.*>\(\s*persist\(`
- **God Store Warning**: `export const use.*Store =` (file size check)
- **Destructuring**: `const \{.*\} = use.*Store\(\)`

### Thresholds
- **Max Lines**: 300 (Store), 120 (Slice)
- **Max Methods**: 10 (Store)
- **Max Deps**: 10 (Imports)

## Validation Commands

```bash
# Verify specific file
grep -n "create<" src/stores/agents-store.ts
wc -l src/stores/agents-store.ts

# Check for circular deps (requires madge)
npx madge --circular src/stores/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/state-scanner
**Related Agents**: architecture-scanner, persistence-scanner
**Last Updated**: 2026-01-04
