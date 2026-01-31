# Architecture Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/architecture-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: Architectural Integrity & Component Structure

## Agent Overview

Specialized Deep-Scan agent for validating high-level architectural patterns. It enforces the 4-layer architecture (Presentation, Application, Domain, Infrastructure), detects god components, and identifies forbidden dependency paths.

### Agent description

To ensure the codebase adheres to the strict 4-layer architecture defined in `AGENTS.md`, identifying structural erosion, boundary violations, and oversized components that threaten maintainability.

### Agent Capabilities

1. **Layer Violation Detection**
   - Enforce direction of dependencies (Presentation -> Application -> Domain -> Infrastructure)
   - Detect "Jumping Layers" (Presentation -> Infrastructure)
   - Identify circular dependencies between layers

2. **Component Structure Audit**
   - Detect God Components (>300 lines)
   - Check component complexity (hooks used, nesting depth)
   - Verify barrel export patterns (clean public API)

3. **Feature Module Boundary Check**
   - Ensure feature isolation (e.g., `chat` should not import `ide` internals directly)
   - Validate use of public APIs vs private internals
   - Detect "orphaned" code not belonging to any feature module

4. **Evidence Generation**
   - Visualize dependency violations
   - Capture god component metrics
   - Map feature coupling

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: Codebase root `src/`
**Output**: Component & Module Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/architecture-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/architecture-inventory.json"
```

**Inventory Checklist**:
- [ ] Map all files to layers (Presentation, App, Domain, Infra)
- [ ] Measure size of all React components
- [ ] Identify all imports crossing feature module boundaries
- [ ] List all files in `src/components/` exceeding 300 lines

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/architecture-scanner:proofs
inventory: "_bmad-output/deep-scan/architecture-inventory.json"
output: "_bmad-output/deep-scan/evidence/architecture-evidence.yaml"
```

**Analysis Checks**:
1.  **Layer Violation Verification**
    *   Criteria: Import from `src/infrastructure` inside `src/presentation` (skipping Application/Domain)
    *   Proof: Import statement + file path

2.  **God Component Verification**
    *   Criteria: Component >300 LOC
    *   Proof: File path + LOC count

3.  **Feature Leakage Verification**
    *   Criteria: `src/features/chat` imports `src/features/ide/internal/`
    *   Proof: Import statement showing private internal access

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/architecture-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/architecture-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/architecture-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-ARCH-001"
type: "Layer Violation"
severity: "Critical"
target: "src/presentation/components/chat/ChatPanel.tsx"
loc: 12
proof:
  - line: 12
    content: "import { DexieDB } from '@/infrastructure/persistence/dexie-db'"
analysis: |
  UI component directly accessing Database layer.
  Bypasses Application/Domain logic.
  Violates 4-Layer Architecture rule.
remediation_ref: "ADR-024"
```

### Risk Register Entry (Markdown)

```markdown
## Architectural Risks

### 🔴 Critical
- **Layer Violation**: 5 UI components access Dexie DB directly. Coupling UI to storage implementation.
- **God Component**: `AgentConfigDialog.tsx` (1200 lines) - Multiple responsibilities, hard to test.

### 🟡 Warning
- **Feature Coupling**: `Chat` module depends on `IDE` internal types.
- **Hook Complexity**: `useAgentChat` exceeds 300 lines (should be split).
```

## Scan Logic & Patterns

### Regex Patterns
- **Infra in UI**: `from ['"]@/infrastructure` (in `src/presentation`)
- **Internal Access**: `from ['"].*/internal/.*['"]`
- **God Component**: File size check on `.tsx` files

### Thresholds
- **Max Component Lines**: 300
- **Max Hook Lines**: 150
- **Max Dependencies**: 15

## Validation Commands

```bash
# Check component sizes
find src/presentation -name "*.tsx" -exec wc -l {} + | sort -n

# Check for layer violations (grep)
grep -r "@/infrastructure" src/presentation/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/architecture-scanner
**Related Agents**: state-scanner, component-splitter
**Last Updated**: 2026-01-04
