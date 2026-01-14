# Types Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/types-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: TypeScript Integrity & Type System Health

## Agent Overview

Specialized Deep-Scan agent for auditing TypeScript health, identifying loose typing, contract violations, and type system degradation. It distinguishes between real type errors and configuration noise.

### Agent description

To enforce strict typing standards, eliminate `any` usage, and ensure type contracts (interfaces) are respected across architectural boundaries, generating evidence for the `typescript-fixer` agent.

### Agent Capabilities

1. **Strict Type Audit**
   - Identify explicit and implicit `any` usage
   - Detect `// @ts-ignore` and `// @ts-expect-error` suppressions
   - Validate return type annotations on public methods

2. **Contract Consistency**
   - Detect duplicate interface definitions (Type Drift)
   - Verify mismatch between backend DTOs and frontend types
   - Identify Zod schema vs TypeScript interface mismatches

3. **Error Analysis**
   - Categorize TS errors (Semantic vs. Syntactic)
   - Filter out test-file errors (as per governance)
   - Identify "Viral `any`" paths (one `any` infecting a call chain)

4. **Evidence Generation**
   - Capture type error traces
   - Snippet explicit `any` violations
   - Map duplicate type definitions

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: Codebase root `src/`
**Output**: Type Def Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/types-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/types-inventory.json"
```

**Inventory Checklist**:
- [ ] Scan `*.ts`, `*.tsx`, `*.d.ts` files
- [ ] Count total type definitions (interfaces, types, enums)
- [ ] List all files with TS errors (excluding `src/__tests__`)
- [ ] Count total `any` occurrences

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/types-scanner:proofs
inventory: "_bmad-output/deep-scan/types-inventory.json"
output: "_bmad-output/deep-scan/evidence/types-evidence.yaml"
```

**Analysis Checks**:
1.  **Implicit Any Verification**
    *   Criteria: Variable/Parameter has `any` type (explicit or implicit)
    *   Proof: File path + line number + code snippet

2.  **Suppression Verification**
    *   Criteria: Usage of `// @ts-ignore`
    *   Proof: File path + line number + justification comment (or lack thereof)

3.  **Type Duplication Verification**
    *   Criteria: Two interfaces with >90% similar structure in different files
    *   Proof: Diff of the two interfaces

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/types-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/types-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/types-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-TYPE-001"
type: "Explicit Any"
severity: "High"
target: "src/lib/agent/agent-io.ts"
loc: 45
proof:
  - line: 45
    content: "export async function executeTool(input: any): Promise<any> {"
analysis: |
  Critical function `executeTool` loses all type safety.
  Infects all consumers with `any` return type.
  Violates `Global Coding Style` skill.
remediation_ref: "typescript-fixer"
```

### Risk Register Entry (Markdown)

```markdown
## Type System Risks

### 🔴 Critical
- **Viral Any**: `src/lib/agent/agent-io.ts` - Core IO function uses `any`, bypassing checks for all tools.
- **Suppression**: 12 `ts-ignore` in `src/infrastructure/` masking potential runtime crashes.

### 🟡 Warning
- **Duplicate Types**: `ProjectMetadata` defined in 3 places (`src/types/`, `src/store/`, `src/lib/`).
- **Missing Return Types**: 45 exported functions missing return type annotations.
```

## Scan Logic & Patterns

### Regex Patterns
- **Explicit Any**: `:\s*any\b`
- **Suppression**: `//\s*@ts-ignore` | `//\s*@ts-nocheck`
- **Missing Return**: `export (async )?function \w+\([^)]*\)\s*\{` (no `: Type`)

### Thresholds
- **Max Any**: 0 (Strict)
- **Max Suppressions**: 0 (Strict)
- **Duplication Similarity**: >90%

## Validation Commands

```bash
# Check for any usage
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# Run type check (production only)
pnpm typecheck

# Count suppressions
grep -r "@ts-ignore" src/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/types-scanner
**Related Agents**: typescript-fixer, state-scanner
**Last Updated**: 2026-01-04
