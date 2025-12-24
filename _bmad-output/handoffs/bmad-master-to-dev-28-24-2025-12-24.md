# Handoff: BMAD Master → Dev
## Story 28-24: File Tree Event Subscriptions

**Date:** 2025-12-24T00:18:00+07:00
**From:** @bmad-core-bmad-master
**To:** @bmad-bmm-dev
**Platform:** Platform B (Antigravity)

---

## Context Summary

**Epic:** 28 - UX Brand Identity & Design System
**Phase:** 6 - AI Foundation Integration Readiness
**Tier:** 2 - Event Bus Subscriptions
**Story ID:** 28-24
**Priority:** P1
**Points:** 3

### Dependencies
- **Epic 10:** Event Bus Architecture (DONE)
- **Epic 25:** AI Foundation Sprint (DONE)
- **Story 28-23:** Streaming Message Container (DONE)

### Integration Context
This story completes Tier 2 of Epic 28 Phase 6, enabling tool→UI sync for AI agent operations. It integrates:
- Event emissions from [`SyncManager`](src/lib/filesystem/sync-manager.ts)
- Event subscriptions in [`FileTreeItem`](src/components/ide/FileTreeItem.tsx)
- Reactive updates via [`fileSyncStatusStore`](src/lib/state/file-sync-status-store.ts)

---

## Task Specification

### Story File
- **Story:** `_bmad-output/sprint-artifacts/28-24-filetree-event-subscriptions.md`
- **Context:** `_bmad-output/sprint-artifacts/28-24-filetree-event-subscriptions-context.xml`

### Acceptance Criteria
1. **FileTreeItem subscribes to sync events** - Component uses `useEffect` with `eventBus.on()`
2. **Per-file sync status updates** - Icons change based on `fileSyncStatusStore` state
3. **Event cleanup on unmount** - `eventBus.off()` in cleanup function
4. **Tests pass** - All existing tests pass + new event subscription tests
5. **No memory leaks** - Verified via React DevTools Profiler

### Constraints
- **Platform:** Platform B (Antigravity)
- **MCP Research:** Not required - patterns already established in Epic 10
- **i18n:** Add EN/VI keys for any new UI text
- **Testing:** Write tests in `src/components/ide/__tests__/FileTreeItem.test.tsx`

### Technical Notes
- Event emissions already exist in [`SyncManager`](src/lib/filesystem/sync-manager.ts) (26+ `.emit()` calls verified)
- [`FileTreeItem`](src/components/ide/FileTreeItem.tsx) already has per-file icon logic (lines 38-40, 102-132)
- This story adds the **subscription** layer to connect emissions to UI updates

---

## Current Workflow Status

### Last Completed Story
- **Story 25-6:** Wire Agent UI to Providers
- **Epic:** 25 (AI Foundation Sprint)
- **Completed at:** 2025-12-24T07:00:00+07:00
- **Status:** DONE ✅
- **Platform:** Platform A

### Epic 28 Progress
- **Phase 1-4:** DONE (12 stories)
- **Phase 5 (Integration Enforcement):** IN_PROGRESS (5/5 done)
- **Phase 6 (AI Foundation Integration):** IN_PROGRESS (6/9 done)
  - Tier 1 (Chat + Tool Visibility): 6/6 done ✅
  - Tier 2 (Event Bus Subscriptions): 0/3 done ← **Current focus**
  - Tier 3 (Multi-Agent UX): 0/3 backlog
  - Tier 4 (Multi-Interface Skeletons): 0/5 backlog

### Next Stories After 28-24
- 28-25: Monaco Event Subscriptions (P1, 3 points)
- 28-26: Multi-Agent Chat UI (P1, 5 points)
- 28-27: Agent Workflow Editor (P1, 5 points)

---

## References

### Related Stories
- **Epic 10-2:** Refactor SyncManager to Emit Events (DONE)
- **Epic 10-7:** Wire UI Components to Event Bus (DONE)
- **Story 28-18:** StatusBar Connection Indicators (DONE)
- **Story 28-23:** Streaming Message Container (DONE)

### Architecture Docs
- `_bmad-output/architecture/flows-and-workflows-2025-12-22-1121.md` - Event bus flow diagrams
- `_bmad-output/architecture/data-and-contracts-2025-12-22-1105.md` - Event contract definitions

### Code References
- `src/lib/events/event-bus.ts` - Event emitter implementation
- `src/lib/filesystem/sync-manager.ts` - Event emissions (26+ calls)
- `src/components/ide/FileTreeItem.tsx` - Target component for subscriptions
- `src/lib/state/file-sync-status-store.ts` - Reactive state store

---

## Next Agent Assignment

**Mode:** `@bmad-bmm-dev`
**Task:** Implement Story 28-24 - File Tree Event Subscriptions

### Handoff Protocol
1. Read story file and context XML
2. Implement event subscriptions in `FileTreeItem.tsx`
3. Add tests in `FileTreeItem.test.tsx`
4. Run `pnpm test` to verify all tests pass
5. Run `pnpm i18n:extract` if new translation keys added
6. Report completion to `@bmad-core-bmad-master` with:
   - Files modified
   - Tests passing count
   - Screenshot proof (if applicable)
   - Next action recommendation

---

## Output Location

Completion report: `_bmad-output/handoffs/dev-completion-28-24-2025-12-24.md`