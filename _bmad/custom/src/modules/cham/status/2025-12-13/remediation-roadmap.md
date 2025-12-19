# CHAM Remediation Roadmap (2025-12-13)

**Scope:** `spikes/project-alpha/src`

**Summary:** critical=0, high=1, medium=11

## Clusters (priority order)

### Cluster 1 — Split oversized modules to meet <=250 LOC quality bar

- **Priority:** P0
- **Effort:** M
- **Rationale:** Large modules increase cognitive load, raise bug risk, and block future event-bus/tool facade work.

**Items:**
- lib/filesystem/local-fs-adapter.ts (840 LOC)
- components/ide/FileTree/FileTree.tsx (566 LOC)
- lib/filesystem/sync-manager.ts (531 LOC)

### Cluster 2 — E2E validation loop for core user journeys (manual + automated)

- **Priority:** P0
- **Effort:** M
- **Rationale:** Ensures integration remains cohesive across workspace open, edit/save, sync, preview, terminal, chat.

**Items:**
- Open folder -> initial sync -> FileTree render
- Open file -> edit -> autosave -> verify dual-write
- Start dev server in WebContainer -> PreviewPanel shows URL
- Cmd/Ctrl+K -> chat opens + focuses (not in inputs/Monaco)

### Cluster 3 — Remove `as any` escape hatches (type safety)

- **Priority:** P1
- **Effort:** S
- **Rationale:** Type-escape hatches hide contract mismatches and make refactors risky.

**Items:**
- routeTree.gen.ts
- lib/filesystem/sync-manager.test.ts
- lib/filesystem/local-fs-adapter.ts
- lib/filesystem/permission-lifecycle.test.ts
- lib/filesystem/__tests__/local-fs-adapter.integration.test.ts
- lib/filesystem/__tests__/local-fs-adapter.test.ts
- components/ide/FileTree/FileTree.tsx

### Cluster 4 — Replace prompt/confirm/alert with app modal components

- **Priority:** P2
- **Effort:** S
- **Rationale:** Native dialogs are inconsistent with app UX, hard to theme/accessibility-test.

**Items:**
- components/ide/FileTree/FileTree.tsx

