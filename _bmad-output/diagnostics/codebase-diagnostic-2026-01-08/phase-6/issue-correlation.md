# Issue Correlation Matrix

## Symptom 1: Broken Routes (/knowledge, /study)
**Contributing Factors:**
| Phase | Finding | Files | Impact |
|-------|---------|-------|--------|
| Phase 1 | Routes show empty state | `knowledge.lazy.tsx`, `study.lazy.tsx` | User cannot access workspace |
| Phase 2 | Helper mocked | `workspace-access-helper.tsx` | Status always `no_projects` |

**Root Cause Chain:**
1. `workspace-access-helper.tsx` caused infinite loops via `useLiveQuery`.
2. Developer "fixed" it by removing logic and hardcoding `status = 'no_projects'`.
3. `/knowledge` and `/study` rely solely on this helper.
4. Result: Routes are effectively disabled/broken.

**Fix Path:**
1. Restore data fetching in helper using `useProjectStore` selectors (Zustand) instead of `useLiveQuery` (Dexie) directly in render.
2. Or use `useLiveQuery` correctly with stable dependencies.
3. Remove hardcoded status.

## Symptom 2: Infinite Render Loops
**Contributing Factors:**
| Phase | Finding | Files | Impact |
|-------|---------|-------|--------|
| Phase 1 | Notes bypassed helper | `notes.lazy.tsx` | Fragmentation |
| Phase 2 | `useLiveQuery` removed | `workspace-access-helper.tsx` | Broken functionality |
| Phase 2 | Event listeners disabled | `NotesPage.tsx`, `KnowledgePage.tsx` | No sync |

**Root Cause Chain:**
1. Components (Pages) subscribe to `db.projects` (via helper) or `useAgentsStore` (via events).
2. Render triggers a side effect (e.g. `lastOpened` update or agent config check).
3. Side effect updates DB/Store.
4. Subscription fires -> Re-render.
5. Loop.

**Fix Path:**
1. Audit all `useEffect` deps for store/DB subscriptions.
2. Use Zustand selectors `useStore(s => s.slice)` instead of `useStore()`.
3. Move side effects (like `lastOpened` update) to event handlers, not render path.

## Symptom 3: Cross-Workspace Sync Disabled
**Contributing Factors:**
| Phase | Finding | Files | Impact |
|-------|---------|-------|--------|
| Phase 2 | Listeners commented out | `NotesPage.tsx`, `KnowledgePage.tsx` | State isolation |

**Root Cause Chain:**
1. Infinite loops detected in `useAllCrossWorkspaceEvents`.
2. Emergency fix: Comment out the hook.
3. Result: No sync.

**Fix Path:**
1. Fix the underlying loop (likely `useAgentsStore` subscription).
2. Uncomment listeners.

## Issue Clusters
| Cluster | Related Issues | Common Root Cause |
|---------|----------------|-------------------|
| **Routing Cluster** | Broken /knowledge, /study, /ide | Mocked `workspace-access-helper` |
| **Reactivity Cluster** | Infinite loops, Disabled Sync | Reactive subscriptions triggering updates |
| **Performance Cluster** | Slow Load, Hub Lag | `BootSequence`, Unoptimized DB queries |
