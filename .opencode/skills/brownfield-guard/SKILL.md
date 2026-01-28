---
name: brownfield-guard
description: Enforce canonical paths and prevent file tree anarchy in existing codebases with established patterns.
---

# Brownfield Guard

> **MIN Strategy**: Always enforced on file operations

## Purpose

Before creating or moving any file, verify the path follows project conventions. Never hardcode specific document IDs - reference architecture documentation.

## Forbidden Path Patterns

Never create files matching these patterns:

- `src/lib/*` → Use domain or infrastructure directories
- `lib/*` → Use domain or infrastructure directories  
- `src/helpers/*` → Use domain-specific modules
- `src/utils/*.ts` → Move to relevant domain module

## Canonical Path Resolution

Path decisions reference project architecture:

| Purpose | Canonical Path |
|---------|---------------|
| Domain logic | `src/domain/` |
| Infrastructure | `src/infrastructure/` |
| Routes | `src/routes/` |
| Components | `src/components/` |
| Stores | `src/stores/` |
| Hooks | `src/hooks/` |

## Validation Protocol

Before creating/modifying any file:

1. **Path check**: Does it match forbidden patterns? → Block
2. **Convention check**: Does it follow architecture layers? → Warn
3. **Size check**: Would file exceed 300 LOC? → Flag for splitting

## On Violation

```
⛔ BROWNFIELD GUARD BOUNCE

Path: {path}
Reason: {reason}
Convention source: docs/architecture.md

Required: Consult architecture documentation for correct path.
```

## Integration

After file operations, run governance:
```bash
pnpm governance:imports
pnpm governance:size
```
