# Remediation Roadmap

## Priority Score Calculation
| Issue | Impact (1-10) | Effort (1-10) | Risk (1-10) | Score | Track |
|-------|---------------|---------------|-------------|-------|-------|
| **Broken Routes** | 10 (Blocker) | 3 (Low) | 3 (Low) | 11.1 | Track 1 |
| **Infinite Loops** | 9 (Critical) | 5 (Med) | 5 (Med) | 3.6 | Track 2 |
| **Disabled Sync** | 8 (High) | 4 (Med) | 4 (Med) | 5.0 | Track 2 |
| **Boot Delay** | 6 (Med) | 1 (Low) | 2 (Low) | 30.0 | Track 1 |
| **Store Fragments** | 5 (Med) | 8 (High) | 6 (Med) | 1.0 | Track 3 |

## Track 1: Quick Wins (Do Today)
| Issue | File(s) | Fix | Time Est |
|-------|---------|-----|----------|
| **Fix Routing** | `workspace-access-helper.tsx` | Restore `useLiveQuery` with proper dependency array `[]` or use `useProjectStore`. Remove hardcoded status. | 30min |
| **Remove Boot Delay** | `HubHomePage.tsx` | Remove `BootSequence` component and state. | 15min |
| **Fix Notes Route** | `notes.lazy.tsx` | Revert to using `useWorkspaceAccess` once helper is fixed. | 15min |

## Track 2: Short Term (This Week)
| Issue | File(s) | Fix | Dependencies | Time Est |
|-------|---------|-----|--------------|----------|
| **Fix Infinite Loops** | `useAllCrossWorkspaceEvents.ts` | Debug `useAgentsStore` subscription. Use selectors. | None | 4h |
| **Re-enable Sync** | `NotesPage.tsx`, etc. | Uncomment `useAllCrossWorkspaceEvents`. | Fix Infinite Loops | 1h |
| **Optimize Hub** | `HubHomePage.tsx` | Move `db.projects.update(lastOpened)` to click handler ONLY. | None | 2h |

## Track 3: Major Refactors (This Month)
| Issue | Scope | Fix Approach | Dependencies | Time Est |
|-------|-------|--------------|--------------|----------|
| **Store Consolidation** | `project-store.ts`, `rag-store.ts` | Complete migration to `useAppStore` / infrastructure stores. | None | 2 weeks |
| **File Sync Engine** | `useFileSyncService` | Move heavy sync logic to WebWorker to unblock main thread. | None | 1 week |

## Fix Dependencies Graph
Fix `workspace-access-helper` (Track 1)
    ↓
Fix `/knowledge`, `/study`, `/ide` Routes (Track 1)
    ↓
Fix Infinite Loops in Events (Track 2)
    ↓
Re-enable Cross-Workspace Sync (Track 2)

## Verification Steps
1. **Routing**: Navigate to `/knowledge`. Expect: "No projects" empty state (if none) or Project list (if exists). NOT broken state.
2. **Loops**: Open DevTools. Navigate between workspaces. Ensure React render count is stable (<5 per nav).
3. **Sync**: Create note in Notes. Check if other workspaces receive event (console log).
