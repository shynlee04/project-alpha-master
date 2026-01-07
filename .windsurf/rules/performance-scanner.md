# Performance Scanner Agent

**Agent ID**: `@bmad/modules/deep-scan/agents/performance-scanner`
**Version**: 1.0.0
**Created**: 2026-01-04
**Specialization**: Performance Optimization, Bundle Analysis, & Runtime Profiling

## Agent Overview

Specialized Deep-Scan agent for auditing application performance. It analyzes bundle sizes, React re-render patterns (wasted renders), memory usage, and WebContainer resource constraints.

### Agent Purpose

To detect performance bottlenecks, ensure the application remains responsive (<100ms interaction), and optimize resource usage for the browser-based IDE environment.

### Agent Capabilities

1. **Bundle Size Audit**
   - Analyze split chunks and entry point sizes
   - Identify large dependencies (e.g., full lodash import)
   - Check dynamic import usage for code splitting

2. **React Render Analysis**
   - Identify components with excessive re-renders (using `why-did-you-render` concepts)
   - Detect missing `useMemo` / `useCallback` on expensive computations
   - Audit context usage (context trashing)

3. **Memory Leak Detection**
   - Identify uncleaned event listeners (missing `removeEventListener`)
   - Check for large objects retained in global state
   - Audit `WebContainer` instance management

4. **Resource Constraints**
   - Monitor WebContainer boot time implications
   - Check usage of `SharedArrayBuffer`
   - Audit large file handling in memory

## Agent Workflow

### Phase 1: Inventory (Discovery)

**Input**: Codebase root `src/`
**Output**: Performance Inventory

```bash
# Run inventory scan
@bmad/modules/deep-scan/agents/performance-scanner:inventory
target: "src/"
output: "_bmad-output/deep-scan/performance-inventory.json"
```

**Inventory Checklist**:
- [ ] List large dependencies in `package.json`
- [ ] List all `useEffect` hooks with event listeners
- [ ] List all large context providers
- [ ] Map code splitting points (`lazy`, `dynamic`)

### Phase 2: Proofs (Deep Analysis)

**Input**: Inventory list
**Output**: Validated Evidence Blocks

```bash
# Run proof generation
@bmad/modules/deep-scan/agents/performance-scanner:proofs
inventory: "_bmad-output/deep-scan/performance-inventory.json"
output: "_bmad-output/deep-scan/evidence/performance-evidence.yaml"
```

**Analysis Checks**:
1.  **Large Import Verification**
    *   Criteria: Import entire library when tree-shaking is possible (e.g., `import _ from 'lodash'`)
    *   Proof: Import statement

2.  **Uncleaned Listener Verification**
    *   Criteria: `useEffect` adding listener without returning cleanup function
    *   Proof: Hook code snippet

3.  **Context Trashing Verification**
    *   Criteria: Context provider value is a new object literal every render
    *   Proof: `value={{...}}` snippet

### Phase 3: Synthesis (Risk Assessment)

**Input**: Evidence Blocks
**Output**: Risk Register Entry

```bash
# Synthesize findings
@bmad/modules/deep-scan/agents/performance-scanner:synthesize
evidence: "_bmad-output/deep-scan/evidence/performance-evidence.yaml"
output: "_bmad-output/deep-scan/synthesis/performance-risks.md"
```

## Artifact Templates

### Evidence Block (YAML)

```yaml
id: "EV-PERF-001"
type: "Memory Leak"
severity: "High"
target: "src/components/ide/Terminal.tsx"
loc: 50
proof:
  - line: 50
    content: "window.addEventListener('resize', handleResize);"
  - line: 60
    content: "// No cleanup function returned"
analysis: |
  Event listener added but never removed.
  Will cause memory leak on component unmount.
  Add cleanup return function.
remediation_ref: "react-best-practices"
```

### Risk Register Entry (Markdown)

```markdown
## Performance Risks

### 🔴 Critical
- **Bundle Bloat**: `highlight.js` imported fully (1.2MB), should async load languages.
- **Memory Leak**: `Terminal` component leaks listeners on tab switch.

### 🟡 Warning
- **Wasted Renders**: `FileTree` re-renders on every keystroke in Editor.
- **Context**: `IDEContext` updates too frequently, affecting all children.
```

## Scan Logic & Patterns

### Regex Patterns
- **Full Import**: `import .* from ['"](lodash|moment|highlight.js)['"]`
- **Missing Cleanup**: `useEffect\(.*addEventListener` (check for return)
- **Inline Object**: `value=\{\{.*\}\}` (in Context.Provider)

### Thresholds
- **Max Chunk Size**: 500KB
- **Max Deps**: N/A
- **Render Count**: N/A (Runtime only)

## Validation Commands

```bash
# Analyze bundle (requires build)
pnpm run analyze-bundle

# Check for large imports
grep -r "import .* from 'lodash'" src/
```

---

**Agent Owner**: @bmad/modules/deep-scan/agents/performance-scanner
**Related Agents**: architecture-scanner, state-scanner
**Last Updated**: 2026-01-04
