# Presentation Domain Documentation

## Overview

This documentation covers the `src/presentation` directory, which contains 479 TypeScript files totaling 72,334 lines of code. The presentation layer handles all UI components, layouts, pages, and hooks for the application.

## Directory Structure

```
src/presentation/
├── components/
│   ├── about/          # Portfolio/about page components
│   ├── agent/          # AI agent configuration components
│   ├── audio/          # Audio player components
│   ├── canvas/         # Knowledge canvas visualization
│   ├── chat/           # Chat interface components
│   ├── common/         # Common utility components
│   ├── dashboard/      # Dashboard components
│   ├── dev/            # Development tools
│   ├── hub/            # Hub and project management
│   ├── ide/            # IDE workspace components
│   ├── knowledge/      # Knowledge management components
│   ├── layout/         # Layout components
│   ├── notes/          # Notes editor components
│   ├── rag/            # RAG search components
│   ├── study/          # Study and quiz components
│   ├── ui/             # Base UI components
│   └── workspace/      # Workspace components
├── Header.tsx
└── LanguageSwitcher.tsx
```

## Documentation Files

| File | Description |
|------|-------------|
| `scan-inventory.json` | Structured scan data with metadata |
| `file-structure.txt` | Tree view of directory structure |
| `components.md` | Component documentation |
| `layouts.md` | Layout component documentation |
| `pages.md` | Page component documentation |
| `hooks.md` | Custom hooks documentation |
| `i18n.md` | Internationalization coverage |
| `accessibility.md` | Accessibility patterns |
| `README.md` | This file (English) |
| `README-VI.md` | Vietnamese version |

## Quick Reference

### Component Categories

| Category | Files | Description |
|----------|-------|-------------|
| UI | 49 | Base components (Button, Dialog, etc.) |
| Agent | 43 | AI agent configuration |
| Chat | 25 | Chat interface |
| IDE | 31 | IDE workspace |
| Knowledge | 25 | Knowledge management |
| Layout | 16 | Layout wrappers |
| Study | 14 | Study and quiz |
| Hub | 38 | Project hub |

### Key Statistics

- **Total Files:** 479
- **Lines of Code:** 72,334
- **Hooks:** 89
- **i18n Usage:** 387 components
- **Interfaces:** 100+

## Design System

### 8-bit Aesthetic

The application uses an 8-bit inspired dark theme with:
- No glassmorphism or blur effects
- Solid retro styling
- Design tokens for consistency
- Pixel-perfect components

### Responsive Design

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** >= 1024px

Uses `useResponsive` hook for breakpoint detection.

## State Management

### Zustand Stores

| Store | Purpose |
|-------|---------|
| `useIDEStore` | IDE state (panels, tabs, etc.) |
| `useConversationStore` | Conversation/thread state |
| `useAgentsStore` | Agent configuration |
| `useProviderStore` | LLM provider configuration |

### Persistence

State is persisted via:
- IndexedDB (Dexie.js) for complex data
- localStorage for simple preferences

## Internationalization

### Supported Languages

- **English (en)** - Default
- **Vietnamese (vi)**

### Usage Pattern

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <button>{t('actions.save')}</button>;
}
```

### Key Domains

- `agents.*` - Agent configuration
- `memory.*` - Conversation memory
- `deepThink.*` - Deep analysis
- `citation.*` - RAG citations
- `actions.*` - Button labels

## Accessibility

### WCAG 2.1 Level AA

- Keyboard navigation
- Screen reader support (ARIA)
- Focus management
- Skip links
- Status announcements

### Key Components

- `SkipLinks` - Skip navigation links
- `StatusAnnouncer` - Screen reader announcements
- ErrorBoundary - Error handling

## Development Guidelines

### Component Pattern

```typescript
// Props interface
interface ComponentNameProps {
  required: Type;
  optional?: Type;
  onAction?: (data: Data) => void;
}

// Component with hooks
export function ComponentName({ required }: ComponentNameProps) {
  const { data } = useHook();
  return <div>{data}</div>;
}
```

### Hook Pattern

```typescript
export function useHookName(params: Params): ReturnType {
  const [state, setState] = useState(initial);
  // Implementation
  return { state, actions };
}
```

### Import Convention

```typescript
// Barrel exports
import { Button, Card } from '@/presentation/components/ui';

// Specific imports
import { AgentConfigDialog } from '@/presentation/components/agent';
```

## Testing

### Component Tests

Tests co-located with `__tests__/` directories:

```
Component/
├── Component.tsx
└── __tests__/
    └── Component.test.tsx
```

### Testing Libraries

- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **jest-axe** - Accessibility testing

## Build and Run

### Development

```bash
pnpm dev
```

### Type Checking

```bash
pnpm typecheck
```

### Internationalization

```bash
# Extract translation keys
pnpm i18n:extract
```

## Related Documentation

- **Architecture:** `_bmad-output/architecture/`
- **State Management:** `ADR-024` in `_bmad-output/project-planning-artifacts/`
- **Components:** `src/presentation/components/ui/index.ts`
