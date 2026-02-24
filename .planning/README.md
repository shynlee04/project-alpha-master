# .planning Directory Index

**Last Updated:** 2026-01-31
**Status:** DECONTAMINATED

---

## AUTHORITATIVE DOCUMENTS (Read These ONLY)

| File | Purpose | Status |
|------|---------|--------|
| `SOURCE-OF-TRUTH.md` | **THE** architecture document | CANONICAL |
| `KILL-PLAN.md` | Workspace elimination data | EXECUTE THIS |

---

## ARCHIVED (DO NOT READ)

All previous planning documents have been archived to `.planning-archived-2026-01-31/` because they contained:

1. **Shallow synthesis** - Forward-only generation without backward validation
2. **Terminology confusion** - Called platform operators "plugins"
3. **Unconsolidated schemas** - RAG, Tools, Thread relationships not properly addressed
4. **Conflicting information** - Multiple documents with overlapping, conflicting claims

**DO NOT** read, reference, or cite any document in `.planning-archived-2026-01-31/`.

---

## For AI Agents

When working on this project:

1. **READ** `SOURCE-OF-TRUTH.md` FIRST
2. **EXECUTE** `KILL-PLAN.md` for workspace elimination
3. **IGNORE** all `.planning-archived-2026-01-31/` documents
4. **VERIFY** any claims against actual codebase with grep/read

---

## Document Lineage

```
User's actual messages (this conversation)
         │
         ├── Extracted requirements
         ├── Expert pattern validation (LobeChat, ElizaOS, Orama)
         │
         ▼
SOURCE-OF-TRUTH.md (CANONICAL)
         │
         ▼
KILL-PLAN.md (FACTUAL DATA)
```

---

*Decontamination performed: 2026-01-31*
