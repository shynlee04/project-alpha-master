# Architecture Conflict Resolution

**Date**: 2025-12-26
**Priority**: P1
**Status**: Analysis Complete
**Context**: Phase 3 technical debt cleanup based on Phase 1 investigation

## Executive Summary

Identified architectural conflicts from Phase 1 investigation. Most issues are already resolved or mitigated. Remaining items are non-blocking for MVP completion.

## Conflict Inventory

### Conflict #1: Tool Wiring Gap (RESOLVED)
| Aspect | Details |
|--------|---------|
| **Description** | Tools defined in `src/lib/agent/tools/` not wired to `useAgentChatWithTools` |
| **Impact** | MVP-3 blocked - agents cannot execute file operations |
| **Status** | Resolved via [Tool Wiring Spec](_bmad-output/technical-debt/tool-wiring-spec-2025-12-26.md) |
| **Resolution** | Wire `fileTools` and `terminalTools` to hook configuration |

### Conflict #2: State Duplication (MITIGATED)
| Aspect | Details |
|--------|---------|
| **Description** | `IDELayout.tsx` duplicates Zustand state with local `useState` |
| **Files** | [`IDELayout.tsx`](src/components/layout/IDELayout.tsx:86-106), [`useIDEStore`](src/lib/state/ide-store.ts) |
| **Impact** | Potential state sync issues between persisted and local state |
| **Status** | Mitigated - persisted state correctly uses Zustand, only ephemeral state is local |
| **Resolution** | DEFERRED to avoid MVP-3 interference (see [State Refactoring Plan](_bmad-output/technical-debt/state-refactoring-plan-2025-12-26.md)) |

### Conflict #3: Duplicate Streaming Components (P2)
| Aspect | Details |
|--------|---------|
| **Description** | Both `StreamingMessage` and `StreamdownRenderer` provide streaming UI |
| **Files** | [`StreamingMessage.tsx`](src/components/ide/StreamingMessage.tsx), [`StreamdownRenderer.tsx`](src/components/chat/StreamdownRenderer.tsx) |
| **Impact** | Code duplication, potential inconsistency |
| **Status** | Identified for cleanup in future iteration |
| **Resolution** | Consolidate to single component, remove obsolete implementation |

### Conflict #4: Chat Panel Duplication (P2)
| Aspect | Details |
|--------|---------|
| **Description** | Both `ChatPanel.tsx` and `ChatPanelWrapper.tsx` exist with unclear relationship |
| **Files** | [`ChatPanel.tsx`](src/components/chat/ChatPanel.tsx), [`ChatPanelWrapper.tsx`](src/components/layout/ChatPanelWrapper.tsx) |
| **Impact** | Confusion about which component to use/modify |
| **Status** | Identified for cleanup in future iteration |
| **Resolution** | Clarify relationship, consolidate or remove wrapper |

### Conflict #5: Error Boundary Duplication (P3)
| Aspect | Details |
|--------|---------|
| **Description** | Both `ErrorBoundary.tsx` and `AppErrorBoundary.tsx` exist |
| **Files** | [`ErrorBoundary.tsx`](src/components/common/ErrorBoundary.tsx), [`AppErrorBoundary.tsx`](src/components/common/AppErrorBoundary.tsx) |
| **Impact** | Minimal - both can coexist for different error handling scopes |
| **Status** | Accepted - pattern acceptable for different error scopes |
| **Resolution** | Keep both, document usage scope |

### Conflict #6: Hub Components (P3)
| Aspect | Details |
|--------|---------|
| **Description** | Hub feature components (`HubHomePage`, `HubSidebar`, etc.) may be unused |
| **Files** | [`src/components/hub/`](src/components/hub/) |
| **Impact** | Dead code if hub feature not in MVP scope |
| **Status** | Identified in [Component Inventory](_bmad-output/technical-dead/component-inventory-2025-12-26.md) |
| **Resolution** | Audit hub feature scope, remove if not needed |

## Conflict Resolution Priority Matrix

| Priority | Conflict | Effort | Impact | Action |
|----------|----------|--------|--------|--------|
| P0 | Tool Wiring | Low | High | COMPLETED |
| P1 | State Duplication | Medium | Medium | DEFERRED |
| P2 | Streaming Components | Low | Low | Future cleanup |
| P2 | Chat Panel | Low | Low | Future cleanup |
| P3 | Error Boundary | Low | Negligible | Accept |
| P3 | Hub Components | Medium | Low | Future audit |

## Recommendations

1. **Tool wiring is complete** - MVP-3 can proceed
2. **State refactoring deferred** - current architecture is stable enough for MVP
3. **Duplicate components** - can be consolidated post-MVP
4. **Hub components** - should be reviewed after MVP completion

## References
- [State Management Audit](_bmad-output/state-management-audit-p1.10-2025-12-26.md)
- [Component Inventory](_bmad-output/technical-dead/component-inventory-2025-12-26.md)
- [MVP Sprint Plan](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
