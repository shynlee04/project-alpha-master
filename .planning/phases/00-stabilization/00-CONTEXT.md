# Phase 0: Foundation Cleanup - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Eliminate all 1,734 codebase violations (workspaceBindings, workspaceId, @/lib/ imports) AND establish extensible schema patterns that prevent future architectural debt. This is cleanup + foundation — not just deletion.

**Why this matters:** Phase 1 was executed without Phase 0 completion, resulting in 39 TypeScript errors and contaminated planning documents. No more phases will execute on unstable ground.

</domain>

<decisions>
## Implementation Decisions

### Execution Strategy
- **Wave-by-wave execution** with deep reasoning before each wave
- Each wave must document its impact on subsequent waves BEFORE execution
- Track what happened before each step — no blind forward progress
- Verification gates between waves: `pnpm typecheck:fast` + `pnpm governance` must pass
- Wave dependencies explicitly stated in PLAN.md

### Rollback Safety
- **Git branch strategy**: Create `phase-0-cleanup` branch before any destructive changes
- Backup IndexedDB schema separately (export to JSON)
- Test restore procedure before proceeding with Wave 1
- Document rollback steps in each PLAN.md

### Broken Code Handling
- **Move contaminated code to `.archive/` folder** — do NOT delete silently
- Each archived file gets a notice comment at top explaining why it was archived
- Create `.archive/MANIFEST.md` documenting what was archived, when, and why
- Update AGENTS.md and project governance to reference archive decisions

### Runtime Validation
- After each wave: Chrome dev build must be accessible on main routes (`/`, `/project/:id`)
- Project must load with plugins functional (FileTree visible, Chat panel accessible)
- No broken layouts (panels render, no overlap, no disappearing elements)
- Simple smoke test, not exhaustive E2E — "can I use the app?"

### Schema Extensibility Governance (CRITICAL)
- **All schema changes must consider future extensibility** — this is not optional
- Schema domains that MUST remain extensible:

| Domain | What Must Extend | Current Anchor |
|--------|------------------|----------------|
| Plugin ecosystem | New modules (beyond Monaco, Notes, Terminal) | `ModuleType` union in `@/domain/schemas/` |
| Platform Operators | New operators (beyond FileTree, Chat-Cascade) | `IPlatformOperator` interface |
| Thread/Message | New message part types (beyond text, code, artifact) | `MessagePart` union type |
| Tool system | New tools without breaking existing | `TOOL_REGISTRY` pattern |
| RAG sources | New indexable content types | `sourceType` union in Orama schema |

- **Before ANY schema modification:**
  1. Check if change is additive (extends) or breaking (modifies existing)
  2. Additive → proceed with documentation
  3. Breaking → STOP and inquire user first
  
- **Update AGENTS.md** with schema extension rules (see Specific Ideas below)

### Claude's Discretion
- Exact wave ordering (as long as dependencies respected)
- Batch sizes for @/lib/ import migration
- Specific ESLint rule syntax
- Archive folder structure within `.archive/`

</decisions>

<specifics>
## Specific Ideas

### AGENTS.md Update Required
Add this section to AGENTS.md under a new "Schema Governance" heading:

```markdown
## 🔒 SCHEMA GOVERNANCE (NON-NEGOTIABLE)

### Before Extending Any Schema
1. **Check extensibility** — Is this additive or breaking?
2. **Review SOURCE-OF-TRUTH.md** — Does it align with Part 3 (Entity Model)?
3. **Inquire user** — Any breaking change requires explicit approval

### Protected Schema Domains
These require user approval before modification:
- `@/domain/schemas/project.schema.ts` — Project entity
- `@/domain/schemas/thread.schema.ts` — Thread, ThreadMessage, MessagePart
- `@/domain/schemas/tool.schema.ts` — ToolDefinition, ToolCall, ToolResult
- `@/infrastructure/persistence/dexie-schema.ts` — Database tables

### Roadmap Changes
- NO phase additions without user approval
- NO phase reordering without user approval
- Deferred ideas go to backlog, not roadmap
```

### Reference Documents
- `.planning/SOURCE-OF-TRUTH.md` — THE canonical architecture (Parts 3, 4, 6 especially)
- `.planning/KILL-PLAN.md` — Exact elimination targets and execution order
- `.planning/what-bring-us-here.md` — Historical context on why this matters

### Wave Execution Pattern
Each wave PLAN.md should follow this structure:
```
1. BEFORE STATE: What exists now (grep counts, file list)
2. DEPENDENCIES: What waves must complete before this
3. ACTIONS: What this wave does
4. AFTER STATE: What must be true after (verification commands)
5. IMPACTS: How this affects subsequent waves
6. ROLLBACK: How to undo if needed
```

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

However, the following were identified as future concerns (already in roadmap):
- AI provider extensibility — Phase 2 (AI Integration)
- RAG indexing patterns — Phase 4 (RAG System)
- Module registry patterns — Phase 3 (Feature Modules)

These will inherit the extensibility governance established in Phase 0.

</deferred>

---

*Phase: 00-stabilization*
*Context gathered: 2026-02-01*
