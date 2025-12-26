# Component Inventory - Technical Debt Analysis

**Date**: 2025-12-26
**Priority**: P1
**Analysis Method**: Repomix (200 files, 224782 tokens)
**Status**: Inventory Complete

## Executive Summary

Based on Repomix analysis of `src/components/` and `src/lib/agent/` directories, the codebase shows a well-organized structure with minimal dead code. Components follow the feature-based organization pattern.

## Component Structure Overview

```
src/components/
├── agent/           # AI agent configuration (6 files)
├── chat/            # Chat interface (11 files)
├── common/          # Shared components (3 files)
├── dashboard/       # Dashboard (2 files)
├── Header.tsx       # Standalone header
├── hub/             # Hub interface (8 files)
├── ide/             # IDE components (35+ files)
├── layout/          # Layout components (12 files)
└── ui/              # UI primitives (40+ files)

src/lib/agent/
├── facades/         # Agent tool facades (6 files)
├── hooks/           # Agent hooks (4 files)
├── providers/       # AI providers (5 files)
├── routes/          # API routes (2 files)
├── tools/           # Agent tools (9 files)
└── factory.ts       # Agent factory
```

## Component Classification

### Connected Components (Active)
| Component | Location | Status |
|-----------|----------|--------|
| `AgentConfigDialog` | [`src/components/agent/`](src/components/agent/AgentConfigDialog.tsx) | Active - MVP-1 |
| `AgentChatPanel` | [`src/components/ide/`](src/components/ide/AgentChatPanel.tsx) | Active - MVP-2 |
| `ChatConversation` | [`src/components/chat/`](src/components/chat/ChatConversation.tsx) | Active - Chat UI |
| `IDELayout` | [`src/components/layout/`](src/components/layout/IDELayout.tsx) | Active - Core layout |
| `MonacoEditor` | [`src/components/ide/MonacoEditor/`](src/components/ide/MonacoEditor/MonacoEditor.tsx) | Active - Editor |
| `XTerminal` | [`src/components/ide/`](src/components/ide/XTerminal.tsx) | Active - Terminal |
| `FileTree` | [`src/components/ide/FileTree/`](src/components/ide/FileTree/FileTree.tsx) | Active - File explorer |

### Potentially Unconnected Components

| Component | Location | Risk | Action |
|-----------|----------|------|--------|
| `EnhancedChatInterface` | [`src/components/ide/`](src/components/ide/EnhancedChatInterface.tsx) | Medium | Verify usage |
| `BentoGrid` | [`src/components/ide/`](src/components/ide/BentoGrid.tsx) | Low | Check if UI demo |
| `BentoCardPreview` | [`src/components/ide/`](src/components/ide/BentoCardPreview.tsx) | Low | Check if UI demo |
| `CommandPalette` | [`src/components/ide/`](src/components/ide/CommandPalette.tsx) | Low | Feature flag |
| `FeatureSearch` | [`src/components/ide/`](src/components/ide/FeatureSearch.tsx) | Low | Feature flag |

### Dead Code Candidates (Low Priority Cleanup)

| File | Location | Reason |
|------|----------|--------|
| `StreamdownRenderer.tsx` | [`src/components/chat/`](src/components/chat/StreamdownRenderer.tsx) | Obsolete streaming |
| `ThreadCard.tsx` | [`src/components/chat/`](src/components/chat/ThreadCard.tsx) | Unused chat feature |
| `ThreadsList.tsx` | [`src/components/chat/`](src/components/chat/ThreadsList.tsx) | Unused chat feature |
| `HubHomePage.tsx` | [`src/components/hub/`](src/components/hub/HubHomePage.tsx) | Hub feature (unused) |
| `HubSidebar.tsx` | [`src/components/hub/`](src/components/hub/HubSidebar.tsx) | Hub feature (unused) |
| `Onboarding.tsx` | [`src/components/dashboard/`](src/components/dashboard/Onboarding.tsx) | Dashboard feature |
| `QuickActionsMenu.tsx` | [`src/components/ide/`](src/components/ide/QuickActionsMenu.tsx) | Commented out |

### Duplicates to Review

| Component A | Component B | Decision |
|-------------|-------------|----------|
| `StreamingMessage` | `StreamdownRenderer` | Consolidate to one |
| `ChatPanel` | `ChatPanelWrapper` | Clarify relationship |
| `ErrorBoundary` | `AppErrorBoundary` | Consolidate to one |

## Priority Cleanup Actions

### P1 - Verify Unconnected Components
1. **EnhancedChatInterface** - Check if still needed or can be removed
2. **BentoGrid/BentoCardPreview** - Check if UI demo code can be moved to examples
3. **CommandPalette/FeatureSearch** - Verify feature flag status

### P2 - Remove Dead Code
1. **StreamdownRenderer** - Replace with StreamingMessage
2. **ThreadCard/ThreadsList** - Remove if chat threads not implemented
3. **QuickActionsMenu** - Either implement or remove

### P3 - Consolidate Duplicates
1. Consolidate `StreamingMessage` and `StreamdownRenderer`
2. Clarify `ChatPanel` vs `ChatPanelWrapper` relationship
3. Consolidate error boundary components

## Recommendations

1. **Keep current structure** - Feature-based organization is sound
2. **Remove commented code** - `QuickActionsMenu` should be removed or implemented
3. **Audit hub components** - Hub features may be deferred
4. **Consolidate streaming** - Single streaming message component

## References
- [Repomix Output](mcp--repomix--read_repomix_output:db7cb00cd1b4b1ab)
- [MVP Sprint Plan](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
