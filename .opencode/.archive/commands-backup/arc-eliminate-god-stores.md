---
description: Split god stores using eliminate-god-stores workflow
---

# ARC: Eliminate God Stores

Execute: `_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md`

## Targets
Stores > 500 lines (dexie-db.ts, rag-store.ts, conversation stores)

## Pattern
1. Analyze responsibilities
2. Create slices (<120 lines each)
3. Create unified store with composition
4. Add facade for backward compatibility
5. Update imports incrementally

## Post-Workflow
MUST run `/governance-enforcement`
