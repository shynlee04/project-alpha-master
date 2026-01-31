# Workspace Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/workspace-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: Workspace Architecture & Cross-Workspace Integration

## Agent Overview

Specialized Deep-Scan agent for auditing the multi-workspace architecture (IDE, Knowledge, Notes, Study). It validates cross-workspace event communication, file synchronization strategies, and boundary isolation between workspaces.

### Agent description

To ensure seamless integration and correct isolation between workspaces, preventing state leaks, ensuring consistent file synchronization, and validating the event-driven architecture defined in `ADR-024` and `AGENTS.md`.

### Agent Capabilities

1. **Cross-Workspace Event Audit**
   - Verify usage of `CrossWorkspaceEventBus`
   - Detect direct coupling between workspace stores
   - Audit event payload consistency (Domain Events)

2. **Synchronization Strategy Audit**
   - Validate workspace-specific sync configurations (IDE vs Notes)
   - Check conflict resolution logic consistency
   - Audit `SyncStatusIndicator` integration

3. **Workspace Isolation Check**
   - Ensure workspace-specific components don't leak into others
   - Verify agent workspace binding usage
   - Check for hardcoded workspace types in generic components

4. **Integration Point Verification**
   - Audit `UnifiedNavigation` configuration
   - Check `AgentSelector` workspace awareness
   - Verify context switching logic

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: `src/lib/workspace/`, `src/lib/events/`
**Output**: Workspace Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/workspace-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/workspace-inventory.json"
```

**Inventory Checklist**:
- [ ] List all workspace definitions and types
- [ ] Map Event Bus publishers and subscribers
- [ ] List components specific to each workspace
- [ ] Inventory shared workspace components

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/workspace-scanner:proofs
inventory: "_bmad-output/deep-scan/workspace-inventory.json"
output: "_bmad-output/deep-scan/evidence/workspace-evidence.yaml"
```

**Analysis Checks**:
1.  **Direct Coupling Verification**
    *   Criteria: `IDEWorkspace` importing `NotesStore` directly (bypassing events/contracts)
    *   Proof: Import statement

2.  **Event Schema Verification**
    *   Criteria: Emitting unstructured objects instead of typed events
    *   Proof: `emit` call snippet

3.  **Sync Configuration Verification**
    *   Criteria: Missing exclude patterns for Knowledge workspace (performance risk)
    *   Proof: Sync config object

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/workspace-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/workspace-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/workspace-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-WORK-001"
type: "Direct Coupling"
severity: "High"
target: "src/workspaces/ide/IDEPanel.tsx"
loc: 15
proof:
  - line: 15
    content: "import { useNotesStore } from '@/workspaces/notes/store'"
analysis: |
  IDE Panel directly depends on Notes Store.
  Should use CrossWorkspaceEventBus or Shared Domain Store.
  Violates Workspace Isolation principle.
remediation_ref: "ADR-024"
```

### Risk Register Entry (Markdown)

```markdown
## Workspace Risks

### 🔴 Critical
- **Event Leak**: 3 event listeners not cleaned up on workspace switch.
- **State Leak**: `activeFile` persists when switching from IDE to Study.

### 🟡 Warning
- **Hardcoded Type**: `workspace === 'ide'` checks scattered in generic logic.
- **Sync Lag**: Knowledge workspace syncs full tree instead of delta.
```

## Scan Logic & Patterns

### Regex Patterns
- **Direct Store Access**: `use[A-Z][a-z]+Store` (cross-module import)
- **Event Bus Usage**: `crossWorkspaceEventBus\.(emit|on)`
- **Workspace Type**: `['"](ide|knowledge|notes|study)['"]`

### Thresholds
- **Cross-Imports**: 0 (Strict)
- **Hardcoded Checks**: <5 (Generic components)

## Validation Commands

```bash
# Check event bus usage
grep -r "crossWorkspaceEventBus" src/

# Check for cross-workspace imports
grep -r "@/workspaces/notes" src/workspaces/ide/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/workspace-scanner
**Related Agents**: architecture-scanner, state-scanner
**Last Updated**: 2026-01-04
