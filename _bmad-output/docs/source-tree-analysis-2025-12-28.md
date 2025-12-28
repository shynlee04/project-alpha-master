---
title: Via-gent Source Tree Analysis
version: 1.0.0
date: 2025-12-28
phase: Documentation
agent_mode: bmad-bmm-tech-writer
team: Documentation Team
---

# Via-gent Source Tree Analysis

## Root Directory Structure

The Via-gent project follows a standard React + TypeScript project structure with BMAD framework artifacts organized in dedicated directories.

```
project-alpha-master/
├── .agent/                  # AI agent configuration and rules
├── .bmad/                   # BMAD framework configuration
├── .cursor/                 # Cursor IDE configuration
├── .vscode/                 # VS Code workspace settings
├── agent-os/                # Agent operating standards
├── public/                  # Static assets
├── server/                  # Server-side code
├── src/                     # Application source code
├── _bmad-output/            # BMAD method artifacts
├── docs/                    # Documentation
├── netlify/                 # Netlify configuration
├── bmm-workflow-status.yaml # Workflow state tracking
├── AGENTS.md               # Project-specific dev patterns
├── CLAUDE.md               # Claude Code guidance
├── package.json            # Project dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── eslint.config.mjs       # ESLint configuration
```

## Source Code Organization

The `src/` directory contains all application code organized by function and feature.

### Component Directory Structure

```
src/
├── components/
│   ├── agent/              # AI agent configuration components
│   │   ├── AgentConfigDialog.tsx
│   │   ├── ProviderConfigDialog.tsx
│   │   ├── ProviderSettings.tsx
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── chat/               # Chat interface components
│   │   ├── AgentSelector.tsx
│   │   ├── ApprovalOverlay.tsx
│   │   ├── AutoApproveSettings.tsx
│   │   ├── ChatConversation.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── DiffPreview.tsx
│   │   ├── StreamdownRenderer.tsx
│   │   ├── ThreadCard.tsx
│   │   ├── ThreadsList.tsx
│   │   ├── ToolCallBadge.tsx
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── dashboard/          # Dashboard components
│   │   ├── Onboarding.tsx
│   │   └── __tests__/
│   ├── hub/                # Hub page components
│   │   ├── HubHomePage.tsx
│   │   ├── MobileProjectSelector.tsx
│   │   ├── NavigationBreadcrumbs.tsx
│   │   ├── TopicCard.tsx
│   │   ├── TopicPortalCard.tsx
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── ide/                # IDE feature components
│   │   ├── AgentChatPanel.tsx
│   │   ├── AgentsPanel.tsx
│   │   ├── BentoCardPreview.tsx
│   │   ├── BentoGrid.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── EnhancedChatInterface.tsx
│   │   ├── ExplorerPanel.tsx
│   │   ├── FeatureSearch.tsx
│   │   ├── IconSidebar.tsx
│   │   ├── PanelShell.tsx
│   │   ├── QuickActionsMenu.tsx
│   │   ├── SearchPanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── StatusBar.tsx
│   │   ├── StreamingMessage.tsx
│   │   ├── SyncEditWarning.tsx
│   │   ├── SyncStatusIndicator.tsx
│   │   ├── XTerminal.tsx
│   │   ├── __tests__/
│   │   ├── FileTree/
│   │   ├── MonacoEditor/
│   │   ├── PreviewPanel/
│   │   ├── statusbar/
│   │   └── index.ts
│   ├── layout/             # Layout components
│   │   ├── ChatPanelWrapper.tsx
│   │   ├── IDEHeaderBar.tsx
│   │   ├── IDELayout.tsx
│   │   ├── MainLayout.tsx
│   │   ├── MainSidebar.tsx
│   │   ├── MinViewportWarning.tsx
│   │   ├── MobileIDELayout.tsx
│   │   ├── MobileTabBar.tsx
│   │   ├── PermissionOverlay.tsx
│   │   ├── TerminalPanel.tsx
│   │   ├── __tests__/
│   │   ├── hooks/
│   │   └── index.ts
│   └── ui/                 # Reusable UI primitives
│       ├── brand-logo.tsx
│       ├── breadcrumbs.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── CollapsibleSection.tsx
│       ├── ContextTooltip.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── icons/
│       ├── input.tsx
│       ├── KeyboardShortcutsOverlay.tsx
│       ├── label.tsx
│       ├── LoadingState.tsx
│       ├── pixel-badge.tsx
│       ├── ProgressIndicator.tsx
│       ├── resizable.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── SkeletonLoader.tsx
│       ├── sonner.tsx
│       ├── StatusDot.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── ThemeProvider.tsx
│       ├── ThemeToggle.tsx
│       ├── Toast/
│       ├── tooltip.tsx
│       └── index.ts
```

### Library Directory Structure

```
src/lib/
├── agent/                   # AI agent infrastructure
│   ├── factory.ts           # Agent factory for creating instances
│   ├── system-prompt.ts     # System prompt configuration
│   ├── __tests__/
│   ├── facades/             # Agent tool facades
│   │   ├── file-lock.ts     # File locking mechanism
│   │   ├── file-tools-impl.ts
│   │   ├── file-tools.ts
│   │   ├── index.ts
│   │   ├── terminal-tools-impl.ts
│   │   ├── terminal-tools.ts
│   │   └── __tests__/
│   ├── providers/           # AI provider adapters
│   │   ├── credential-vault.ts
│   │   ├── index.ts
│   │   ├── model-registry.ts
│   │   ├── provider-adapter.ts
│   │   ├── types.ts
│   │   └── __tests__/
│   ├── routes/              # API routes for agent
│   │   ├── __tests__/
│   │   └── chat-api.test.ts
│   ├── tools/               # Agent tools
│   │   ├── execute-command-tool.ts
│   │   ├── index.ts
│   │   ├── list-files-tool.ts
│   │   ├── read-file-tool.ts
│   │   ├── types.ts
│   │   ├── write-file-tool.ts
│   │   └── __tests__/
│   └── hooks/               # React hooks for agent
├── editor/                  # Monaco editor integration
│   ├── index.ts
│   ├── language-utils.ts
│   └── __tests__/
├── events/                  # Event system
│   ├── index.ts
│   ├── use-workspace-event.ts
│   ├── workspace-events.ts
│   └── __tests__/
├── filesystem/              # File system operations
├── monitoring/              # Error monitoring (Sentry)
├── persistence/             # Persistence utilities
├── state/                   # Zustand stores
│   ├── dexie-db.ts
│   ├── dexie-storage.ts
│   ├── hub-store.ts
│   ├── ide-store.ts
│   ├── index.ts
│   ├── layout-store.ts
│   ├── navigation-store.ts
│   ├── provider-store.test.ts
│   ├── provider-store.ts
│   └── statusbar-store.ts
├── webcontainer/            # WebContainer integration
│   ├── index.ts
│   ├── manager.ts
│   ├── process-manager.ts
│   ├── terminal-adapter.ts
│   ├── types.ts
│   └── __tests__/
└── workspace/               # Workspace management
```

### Routes Directory Structure

```
src/routes/
├── __root.tsx               # Root route with providers
├── index.tsx                # Landing page
├── ide.tsx                  # Main IDE route
├── workspace/
│   └── $projectId.tsx       # Workspace route
├── agents.tsx               # Agent configuration
├── settings.tsx             # Settings page
├── hub.tsx                  # Hub page
├── knowledge.tsx            # Knowledge base
├── test-fs-adapter.tsx      # FSA testing route
├── webcontainer.$.tsx       # WebContainer catch-all
├── api/
│   ├── __tests__/
│   │   └── chat.test.ts
│   └── chat.ts              # Chat API endpoint
└── routeTree.gen.ts         # Auto-generated (DO NOT EDIT)
```

### Supporting Directories

```
src/
├── data/                    # Static data files
├── hooks/                   # Custom React hooks
├── i18n/                    # Internationalization
│   ├── config.ts
│   ├── en.json
│   ├── LocaleProvider.tsx
│   └── vi.json
├── mocks/                   # Test mocks
└── types/                   # TypeScript type definitions
```

## Key File Patterns

### Component File Pattern

All components follow a consistent pattern:

```typescript
// Component file naming: PascalCase.tsx
// Test file naming: PascalCase.test.tsx
// Location: Feature directory in components/

import { type FC } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentProps } from './types';

// Props interface naming: ComponentNameProps
interface AgentConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Component naming: PascalCase
export const AgentConfigDialog: FC<ComponentNameProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn('base-styles', className)} {...props}>
      {/* Component implementation */}
    </div>
  );
};
```

### Library File Pattern

Library modules follow a functional pattern:

```typescript
// File naming: kebab-case.ts
// Test file naming: kebab-case.test.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from './dexie-storage';

interface IDEState {
  openFiles: string[];
  activeFile: string | null;
  // ... state and actions
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFile: null,
      // ... implementations
    }),
    {
      name: 'ide-store',
      storage: createJSONStorage(() => createDexieStorage('ide')),
    }
  )
);
```

### Test File Pattern

Tests are co-located with source files:

```typescript
// __tests__/ComponentName.test.tsx
// or
// __tests__/library-file.test.ts

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

vi.mock('@/lib/agent/providers/credential-vault', () => ({
  useCredentialVault: vi.fn(),
}));

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Directory Purpose Summary

| Directory | Purpose | Key Patterns |
|-----------|---------|--------------|
| `components/agent` | AI agent configuration UI | Dialog components, provider settings |
| `components/chat` | Chat interface | Streaming messages, tool calls |
| `components/ide` | IDE features | Editor, terminal, file tree, status bar |
| `components/layout` | Layout wrappers | IDELayout, MainLayout, navigation |
| `components/ui` | Reusable primitives | Radix UI wrappers, custom components |
| `lib/agent` | AI agent logic | Provider adapters, tools, facades |
| `lib/state` | State management | Zustand stores with Dexie persistence |
| `lib/webcontainer` | WebContainer integration | Singleton manager, terminal adapter |
| `routes` | Navigation | TanStack Router file-based routes |
| `i18n` | Internationalization | i18next with en/vi locales |

## File Count Summary

| Category | Count | Description |
|----------|-------|-------------|
| Components | 70+ | React components across all feature directories |
| Library Modules | 40+ | Core logic modules in lib/ |
| Routes | 15+ | TanStack Router route files |
| Tests | 50+ | Vitest test files |
| Store Modules | 10+ | Zustand store definitions |

---

**Document Information**
- Version: 1.0.0
- Created: 2025-12-28
- Agent: bmad-bmm-tech-writer
- Phase: Documentation