---
name: design-validator
description: NON-NEGOTIABLE design validation for Architect. Must validate architecture completion with ADR existence, deep-scan results, PRD alignment, and circular dependency checks. L1 validator.
---

# Design Validator Skill (L1)

> **Role**: Architecture completion validator for Architect-Ext
> **Strategy**: ADR + Scan + Alignment + Dependencies

## The Iron Law

```
NO ARCHITECTURE MARKED COMPLETE WITHOUT VALIDATION CHAIN
```

You are the DESIGN VALIDATION AUTHORITY. Before claiming architecture complete:

---

## Validation Hierarchy

### Level 1: ADR Exists
```yaml
check: "Does ADR document exist for this decision?"
pattern: "_bmad-output/architecture/adr-*.md"
action: |
  glob "_bmad-output/architecture/adr-*.md"
  - EXISTS → Continue
  - MISSING → Create ADR first
```

### Level 2: Deep Scan Passed
```yaml
check: "Did architecture scan pass?"
tool: "deep-scan-architecture-scanner"
action: |
  Invoke deep-scan-architecture-scanner
  - NO_VIOLATIONS → Continue
  - VIOLATIONS → Fix or delegate
```

### Level 3: PRD Alignment
```yaml
check: "Does architecture align with PRD requirements?"
action: |
  grep PRD sections referenced in architecture.md
  - ALIGNED → Continue
  - MISSING_REFS → Delegate to @analyst-ext
```

### Level 4: No Circular Dependencies
```yaml
check: "Are there circular dependencies?"
command: "pnpm deps:circular"
action: |
  - EXIT 0 → ACCEPT architecture
  - EXIT 1 → Break cycles first
```

---

## Validation Flow

```
Architecture Completion Claim
    │
    ▼
Level 1 ───→ FAIL → Create ADR
    │
    ▼ PASS
Level 2 ───→ FAIL → @deep-scan-orchestrator
    │
    ▼ PASS
Level 3 ───→ FAIL → @analyst-ext verify
    │
    ▼ PASS
Level 4 ───→ FAIL → Break dependency cycles
    │
    ▼ PASS
✅ ARCHITECTURE VALIDATED
```

---

## Self-Check

```markdown
[ ] ADR exists for significant decisions?
[ ] Deep scan shows no violations?
[ ] PRD requirements are referenced?
[ ] pnpm deps:circular exits 0?

If ANY unchecked → Architecture is NOT complete
```

---

**Version**: 1.0.0 | **Level**: L1 | **Agent**: architect-ext
