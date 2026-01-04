---
name: deep-scan-types-scan
description: TypeScript scanner for detecting `any` type usage, type suppressions (ts-ignore, ts-expect-error), interface duplication, and contract drift. Auto-activates on: "typescript error", "any type", "ts-ignore", "type safety", "interface duplication"

triggers:
  - "typescript error"
  - "any type"
  - "ts-ignore"
  - "ts-expect-error"
  - "type safety"
  - "interface duplication"

agent: deep-scan-types-scanner
source: _bmad/modules/deep-scan/agents/types-scanner.md
output: _bmad-output/deep-scan/evidence/types-evidence.yaml
---

# Types Scan Skill

Specialized scanner for TypeScript strictness and type safety compliance.

## What It Scans

- **`any` Usage**: Quantify and locate all `any` types
- **Suppressions**: Find `ts-ignore`, `ts-expect-error` usage
- **Interface Duplication**: Detect duplicate type definitions
- **Contract Drift**: Interface vs implementation mismatches

## Scan Targets

```
**/*.ts
**/*.tsx
**/*.d.ts
```

## Evidence Output

```yaml
id: "EV-TYPE-001"
type: "Any Usage"
severity: "Warning"
target: "src/lib/agent/tool.ts:45"
count: 23
```

## Integration

Auto-activates `typescript-fixer` when critical type errors detected.
