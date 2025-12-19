# Via-Gent Remediation Roadmap
**Generated:** 2025-12-09T13:25:00Z  
**Audit ID:** cham-via-gent-2025-12-09-v2  
**Overall Health Score:** 65/100

---

## Executive Summary

The via-gent codebase has a **solid domain architecture foundation** (75% compliant) but suffers from:
1. **Incomplete TanStack AI integration** (55%) - custom patterns instead of official hooks
2. **Scattered test organization** (40%) - 16 different test locations
3. **Route structure duplication** - `_workspace/ide/` vs `routes/ide/`

---

## Priority Clusters

### 🔴 Cluster 1: TanStack AI Integration (CRITICAL)
**Impact:** Core feature - agent chat functionality  
**Effort:** L (2 weeks)  
**Files:** 8

| Task | File | Action |
|------|------|--------|
| 1.1 | `src/app/hooks/useAgentChat.ts` | Refactor to use `@tanstack/ai-react` `useChat` |
| 1.2 | `src/lib/agent-api.ts` | Update to use TanStack AI `chat()` function |
| 1.3 | `src/lib/agent-tools.ts` | Convert to TanStack AI `tool()` pattern |
| 1.4 | `src/domains/agent/core/ToolRegistry.ts` | Align with TanStack AI tool architecture |
| 1.5 | `src/components/ide/ChatPanel.tsx` | Use streaming via `fetchServerSentEvents` |
| 1.6 | `src/components/ide/AgentChatPanel.tsx` | Integrate tool state monitoring |
| 1.7 | `src/infrastructure/ai/GeminiAdapter.ts` | Ensure TanStack AI adapter compatibility |
| 1.8 | `src/lib/coordinator-agent.ts` | Migrate to agentic cycle pattern |

**Research Required:**
- TanStack AI `useChat` hook patterns
- Tool definition with `tool()` function
- Streaming with `fetchServerSentEvents`
- Agentic cycle with `maxIterations`

---

### 🔴 Cluster 2: Route Structure Consolidation (CRITICAL)
**Impact:** Navigation, URL consistency  
**Effort:** S (2-3 days)  
**Files:** 6

| Task | File | Action |
|------|------|--------|
| 2.1 | `src/routes/ide/` | DELETE - empty/duplicate |
| 2.2 | `src/routes/_workspace/ide/index.tsx` | Primary IDE route |
| 2.3 | `src/lib/ide-search.ts` | Extract search schema here |
| 2.4 | `src/routes/_workspace.tsx` | Add `zodValidator` to search |
| 2.5 | All `<Link>` components | Fix search prop typing |
| 2.6 | `src/router.tsx` | Verify route tree generation |

**Pattern to Follow:**
```typescript
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'
import { fallback } from '@tanstack/zod-adapter'

const ideSearchSchema = z.object({
  projectId: fallback(z.string(), '').default(''),
  view: fallback(z.enum(['code', 'dashboard']), 'code').default('code'),
  rightPanel: fallback(z.enum(['chat', 'preview', 'none']), 'chat').default('chat'),
})

export const Route = createFileRoute('/_workspace/ide/')({
  validateSearch: zodValidator(ideSearchSchema),
})
```

---

### 🟠 Cluster 3: Test Consolidation (HIGH)
**Impact:** Developer experience, CI/CD  
**Effort:** M (1 week)  
**Files:** 35

| Task | Action |
|------|--------|
| 3.1 | Create `src/__tests__/domains/` mirroring domain structure |
| 3.2 | Create `src/__tests__/components/` mirroring component structure |
| 3.3 | Create `src/__tests__/lib/` for utility tests |
| 3.4 | Move all inline `.test.tsx` files to `__tests__/` |
| 3.5 | Update import paths in moved tests |
| 3.6 | Remove empty `__tests__` directories |
| 3.7 | Update vitest config if needed |

**Target Structure:**
```
src/__tests__/
├── domains/
│   ├── agent/
│   ├── ide/
│   ├── llm/
│   ├── memory/
│   └── project/
├── components/
│   ├── ide/
│   └── onboarding/
├── lib/
├── infrastructure/
├── integration/
└── e2e/
```

---

### 🟠 Cluster 4: Domain API Enforcement (HIGH)
**Impact:** Architecture integrity  
**Effort:** S (2-3 days)  
**Files:** 4

| Task | File | Action |
|------|------|--------|
| 4.1 | `src/core/state/RootStore.ts` | Import from domain `index.ts` only |
| 4.2 | `src/core/types/DomainEvents.ts` | Keep as-is (aggregation acceptable) |
| 4.3 | `src/core/events/eventSchemas.ts` | Keep as-is (aggregation acceptable) |
| 4.4 | All components | Audit imports, use domain APIs |

**Before:**
```typescript
import type { IDEState, IDEStore } from '@/domains/ide/core/IDEStore'
```

**After:**
```typescript
import { useIDEStore, type IDEState } from '@/domains/ide'
```

---

### 🟡 Cluster 5: Cleanup & Hygiene (MEDIUM)
**Impact:** Codebase clarity  
**Effort:** XS (1 day)  
**Files:** 10

| Task | Action |
|------|--------|
| 5.1 | Delete `src/components/storybook/` (empty) |
| 5.2 | Delete `src/data/` (empty) |
| 5.3 | Delete `src/routes/ide/__tests__/` (empty) |
| 5.4 | Delete `src/Users/` (artifact, already cleaned) |
| 5.5 | Review `src/lib/coordinator-agent.ts` usage |
| 5.6 | Review `src/lib/gemini-client.ts` vs `GeminiAdapter.ts` |
| 5.7 | Remove `src/lib/app-store.ts` if unused |
| 5.8 | Standardize all imports to use `@/` alias |

---

## Execution Order

```
Week 1: Cluster 2 (Routes) → Cluster 5 (Cleanup)
Week 2: Cluster 4 (Domain APIs) → Cluster 3 (Tests)
Week 3-4: Cluster 1 (TanStack AI)
```

---

## Validation Checklist

After each cluster:
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm dev` starts without errors
- [ ] Manual smoke test of affected features

---

## Files to Keep (Do Not Modify Core Structure)

| Path | Reason |
|------|--------|
| `src/domains/*/` | Domain architecture is sound |
| `src/core/events/EventBus.ts` | Event system working correctly |
| `src/infrastructure/file-systems/` | Dual FS implementation correct |
| `src/infrastructure/permissions/` | Permission handling correct |
| `src/app/use-cases/` | Orchestration layer correct |
| `src/app/workflows/` | Workflow patterns correct |

---

## Research Links

### TanStack AI
- https://tanstack.com/ai/latest/docs/guides/tools
- https://tanstack.com/ai/latest/docs/guides/agentic-cycle
- https://tanstack.com/ai/latest/docs/guides/streaming

### TanStack Router
- https://tanstack.com/start/latest/docs/framework/react/guide/routing
- https://tanstack.com/router/latest/docs/framework/react/guide/search-params

### WebContainers
- https://webcontainers.io/api

---

## Next Steps

1. **Approve this roadmap** or request modifications
2. **Start Cluster 2** (Routes) - lowest risk, highest clarity gain
3. **Run scanning phase** for detailed issue reports per cluster
