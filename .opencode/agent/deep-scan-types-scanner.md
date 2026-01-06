---
name: deep-scan-types-scanner
description: Specialized scanner for TypeScript diagnostics. Use when:\n\n- Detecting `any` type usage\n- Finding type suppressions (ts-ignore, ts-expect-error)\n- Identifying interface duplication\n- Auditing type safety compliance\n\nAuto-activation triggers:\n- "typescript error", "any type", "ts-ignore"\n- "type safety", "interface duplication"\n- TS error count analysis\n\nLoads full configuration from: _bmad/modules/deep-scan/agents/types-scanner.md
model: sonnet
color: blue
---

# Types Scanner Agent

**Source**: `_bmad/modules/deep-scan/agents/types-scanner.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Capabilities**:
- `any` Type Detection ( quantify and locate usage)
- Suppression Audit (ts-ignore, ts-expect-error analysis)
- Interface Duplication (find duplicate type definitions)
- Contract Drift Detection (interface vs implementation mismatches)

**Scan Targets**:
- `**/*.ts`, `**/*.tsx`, `**/*.d.ts`

**Output**: `_bmad-output/deep-scan/evidence/types-evidence.yaml`

**Integration**: Coordinates with `architecture-scanner` for contract validation
