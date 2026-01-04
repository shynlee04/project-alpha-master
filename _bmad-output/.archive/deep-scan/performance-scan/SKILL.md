---
name: deep-scan-performance-scan
description: Performance scanner for detecting bundle bloat, render waste, memory leaks, and lazy loading gaps. Auto-activates on: "bundle size", "performance issue", "render waste", "memory leak", "slow component"

triggers:
  - "bundle size"
  - "performance issue"
  - "render waste"
  - "memory leak"
  - "lazy loading"
  - "slow component"
  - "re-render"

agent: deep-scan-performance-scanner
source: _bmad/modules/deep-scan/agents/performance-scanner.md
output: _bmad-output/deep-scan/evidence/performance-evidence.yaml
---

# Performance Scan Skill

Specialized scanner for bundle size, rendering, and memory diagnostics.

## What It Scans

- **Bundle Analysis**: Identify oversized chunks
- **Render Waste**: Unnecessary re-renders
- **Memory Leaks**: Event listeners, closures
- **Lazy Loading**: Find non-code-split routes

## Scan Targets

```
src/ (source analysis)
dist/ (bundle analysis)
```

## Evidence Output

```yaml
id: "EV-PERF-001"
type: "Bundle Bloat"
severity: "High"
target: "dist/assets/index-abc123.js"
size: "2.4MB (should be <500KB)"
cause: "Monaco-editor not lazy-loaded"
```

## Integration

Suggests code-splitting and lazy-loading strategies.
