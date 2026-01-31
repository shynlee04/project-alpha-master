# Hierarchical Agentic Reading - Research Index

**Date**: 2026-01-14
**Location**: `_bmad-output/research/2026-01-14-hierarchical-reading/`

---

## Research Documents

| # | Document | Focus | Key Findings |
|---|----------|-------|--------------|
| 01 | [Aider Repo Map](./01-aider-repo-map-research.md) | Tree-sitter codebase understanding | Signature-only extraction, graph ranking, 1k token budget |
| 02 | [TanStack Router Context](./02-tanstack-router-context-research.md) | State preservation & hierarchical DI | Router context inheritance, breadcrumbs, invalidation |
| 03 | [Zustand + Dexie](./03-zustand-dexie-persistence-research.md) | IndexedDB persistence | Custom StateStorage, async hydration, reference breaking issues |
| 04 | [Monaco + Tree-sitter](./04-monaco-tree-sitter-integration-research.md) | AST integration for code editor | Parallel parsing, web-tree-sitter, SCM queries |
| 05 | [TanStack AI Client Tools](./05-tanstack-ai-client-tools-research.md) | Agentic orchestration & tool execution | Isomorphic tools, agentic cycle, auto-execution, type safety |

---

## Tech Stack Mapping

| Our Tech | Research Finding | HARS Application |
|-----------|------------------|-----------------|
| **TanStack AI** | Isomorphic tools + agentic cycle | Client-side tool orchestration for drill-down/bounce-back |
| **TanStack Router** | Hierarchical context inheritance | Drill-bounce-continue pattern via route context |
| **Zustand** | Persist middleware with custom storage | Dexie as StateStorage backend |
| **Dexie** | IndexedDB wrapper for large datasets | Persist-first contract (D3) |
| **Monaco Editor** | No built-in AST, requires tree-sitter | Parallel tree-sitter integration |
| **BlockNote** | Block-based editor | Could use tree-sitter for block structure |
| **File System API** | Browser-native file access | Client tools can invoke FSA operations |

---

## Key Patterns Discovered

### 1. TanStack AI Client Tool Pattern
```typescript
// Define shared schema
const drillDownDef = toolDefinition({
  name: "drill_down",
  description: "Navigate into a document section",
  inputSchema: z.object({
    sectionId: z.string(),
    filePath: z.string(),
  }),
  outputSchema: z.object({
    content: z.string(),
    breadcrumbs: z.array(z.object({
      title: z.string(),
      path: z.string(),
    })),
  }),
});

// Client implementation (executes in browser)
const drillDown = drillDownDef.client(async ({ sectionId, filePath }) => {
  const navigate = useNavigate();
  await navigate({ to: `/documents/${filePath}#${sectionId}` });
  return {
    content: await fetchSectionContent(sectionId),
    breadcrumbs: updateBreadcrumbs(sectionId),
  };
});

// Agentic flow: User → drill_down → content → search_context → bounce_back → summary
```
**Status**: ALPHA (2026-01-14) - API may change

### 2. Repo Map Pattern (Aider)
```
Full File:
  function myHelper(x: number, y: string) {
    // 50 lines of implementation
  }

Repo Map:
  myHelper(x: number, y: string) { ... }
```
**Result**: 80-90% token reduction

### 3. Two-Threshold Compression (Factory.ai)
```yaml
fill_line: 8000   # Trigger compression
drain_line: 5000  # After compression, retain only this
```

### 4. Graph Ranking
- Build dependency graph: files = nodes, imports = edges
- Rank by centrality (most referenced = highest priority)
- Respect token budget with top-k selection

### 5. Breadcrumb Accumulation
```typescript
const matches = useRouterState({ select: (s) => s.matches })
const breadcrumbs = matches
  .filter((match) => match.context.getTitle)
  .map(({ pathname, context }) => ({
    title: context.getTitle(),
    path: pathname,
  }))
```

---

## Actionable Insights

### For Agentic Orchestration (TanStack AI)
1. **Client-side tools** - Define `toolDefinition()`, implement `.client()` for browser execution
2. **Agentic cycle** - Multi-step reasoning with automatic tool continuation
3. **Drill-down tools** - Use `useNavigate()` from TanStack Router for hierarchical navigation
4. **Type safety** - Zod schemas + TypeScript inference end-to-end
5. **Tool states** - Monitor `awaiting-input` → `input-streaming` → `input-complete` → `complete` for UI feedback

### For Context Economy
1. **Extract signatures only** - no function bodies in repo map
2. **Graph-rank files** - prioritize by reference frequency
3. **Token budgets** - design for configurable limits (default: 1k tokens)

### For State Persistence
1. **Custom Dexie storage** - implement StateStorage interface
2. **Hydration lifecycle** - handle async gaps properly
3. **Reference equality** - beware rehydration breaking object references

### For Code Navigation
1. **Parallel tree-sitter** - run alongside Monaco, don't replace
2. **SCM queries** - use for language-agnostic symbol extraction
3. **Incremental parsing** - tree-sitter's specialty for large files

---

## Next Steps

Would you like me to:
- **A)** Deep dive into any specific research finding?
- **B)** Create prototypes/experiments for validation?
- **C)** Map these findings to specific implementation tasks?
- **D)** Research additional patterns (GraphRAG, Cursor/Windsurf approaches)?

---

## Related Artifacts

- [Master Plan](../../planning-artifacts/hierarchical-agentic-reading-master-plan-2026-01-16.md)
- [State Files](../../state/LOOP_STATE.yaml)
