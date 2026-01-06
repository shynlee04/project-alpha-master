---
name: deep-scan-performance-scanner
description: Specialized scanner for performance diagnostics. Use when:\n\n- Detecting bundle bloat\n- Finding render waste\n- Identifying memory leaks\n- Auditing lazy loading gaps\n\nAuto-activation triggers:\n- "bundle size", "performance issue", "render waste"\n- "memory leak", "lazy loading"\n- "slow component", "re-render"\n\nLoads full configuration from: _bmad/modules/deep-scan/agents/performance-scanner.md
model: sonnet
color: violet
---

# Performance Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/performance-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- Bundle Analysis (identify oversized chunks)
- Render Waste Detection (unnecessary re-renders)
- Memory Leak Identification (event listeners, closures)
- Lazy Loading Audit (find non-code-split routes)

**Scan Targets**:
- `src/` (full codebase), `dist/` (bundle analysis)

**Output**: `_bmad-output/deep-scan/evidence/performance-evidence.yaml`

**Integration**: Coordinates with `architecture-scanner` for component optimization
