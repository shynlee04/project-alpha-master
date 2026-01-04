# Story Context: E1-3 - Perplexity-style Expandable Panel

**Document ID**: `e1-3-story-context-2026-01-05`
**Version**: 1.0.0
**Created**: 2026-01-05T12:45:00Z
**Story**: E1-3 - Implement Perplexity-style Expandable Panel
**Epic**: E1 - Cross-Workspace Chat Integration
**Points**: 10

---

## 1. Story Validation

### Acceptance Criteria (from stories.md)
- [x] Chat panel expands from collapsed (20%) to expanded (60%)
- [x] Smooth CSS transition (300ms cubic-bezier)
- [x] Panel can be collapsed back to original size
- [x] Chat history preserved during expansion
- [x] Drag handle for custom sizing
- [x] Arrow indicator shows expansion state

**Validation Result**: ✅ All acceptance criteria clear and measurable.

---

## 2. Technical Context

### Existing Components

| Component | Location | Lines | Purpose |
|-----------|----------|-------|---------|
| `UnifiedChatPanel` | `src/presentation/components/chat/` | 194 | Routes to appropriate chat mode |
| `AgentChatPanel` | `src/presentation/components/ide/` | 403 | Main agent chat interface |
| `ResizablePanel` | `src/presentation/components/ui/resizable.tsx` | 746 | Custom resizable panel implementation |

### Key Dependencies

```typescript
// Existing resizable infrastructure
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/presentation/components/ui/resizable';

// Chat panel to wrap
import { UnifiedChatPanel } from '@/presentation/components/chat/UnifiedChatPanel';

// Agent chat (if using agent mode)
import { AgentChatPanel } from '@/presentation/components/ide/AgentChatPanel';
```

### Design Tokens (from styles/design-tokens.css)

```css
--transition-duration: 300ms;
--transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 3. Implementation Plan

### File Structure

```
src/presentation/components/chat/
├── ExpandableChatPanel.tsx      # NEW - Main component
├── ExpandableChatPanel.css       # NEW - Styles
└── index.ts                       # UPDATE - Export
```

### Component API

```typescript
interface ExpandableChatPanelProps {
  /** Default collapsed size (percentage) */
  collapsedSize?: number;
  /** Default expanded size (percentage) */
  expandedSize?: number;
  /** Minimum panel size */
  minSize?: number;
  /** Maximum panel size */
  maxSize?: number;
  /** Panel position ('left', 'right', 'top', 'bottom') */
  position?: 'left' | 'right';
  /** Auto-save ID for persistence */
  autoSaveId?: string;
  /** Props to pass to UnifiedChatPanel */
  chatProps: React.ComponentProps<typeof UnifiedChatPanel>;
}
```

### State Management

| State | Default | Purpose |
|-------|---------|---------|
| `isExpanded` | `false` | Current expansion state |
| `panelSize` | `30` (collapsed) / `60` (expanded) | Current panel size % |

---

## 4. CSS Architecture

### Classes

```css
/* Expandable panel container */
.expandable-chat-panel {
  position: relative;
  transition: flex-basis 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Expanded state */
.expandable-chat-panel.expanded {
  /* Additional styles when expanded */
}

/* Collapse handle */
.collapse-handle {
  position: absolute;
  cursor: pointer;
  touch-action: manipulation;
}

/* Arrow indicator */
.expand-arrow {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-arrow.expanded {
  transform: rotate(180deg);
}
```

---

## 5. Integration Points

### Usage in NotesPage

```tsx
import { ExpandableChatPanel } from '@/presentation/components/chat';

<ExpandableChatPanel
  collapsedSize={30}
  expandedSize={60}
  position="right"
  autoSaveId="notes-chat-panel"
  chatProps={{
    mode: 'agent',
    projectId: projectId,
    projectName: projectMetadata?.name,
    workspaceType: 'notes'
  }}
/>
```

### Persistence

Use `autoSaveId` with existing ResizablePanelGroup to persist user's panel size preference.

---

## 6. Edge Cases & Constraints

| Edge Case | Handling |
|-----------|----------|
| Mobile viewport | Maximize panel on mobile, disable drag |
| Panel collapsed at minSize | Show expand arrow only |
| Panel at maxSize | Prevent further expansion |
| Window resize | Maintain percentage, not pixels |

---

## 7. Dependencies

### Peer Dependencies
- React 18.2.0
- Lucide React (for icons)
- Tailwind CSS (for styling)

### Internal Dependencies
- `@/presentation/components/ui/resizable`
- `@/presentation/components/chat/UnifiedChatPanel`
- `@/lib/utils` (cn utility)

---

## 8. Test Strategy

### Unit Tests
- Toggle expansion state
- Verify size percentages (30% ↔ 60%)
- CSS transition classes applied correctly

### Integration Tests
- Chat history preserved during expansion
- Persistence (auto-save) works correctly
- Arrow indicator updates with state

### Visual Regression
- Expanded vs collapsed appearance
- Transition smoothness

---

## 9. i18n Requirements

| Key | Vietnamese | English |
|-----|------------|---------|
| `chat.expand` | "Mở rộng" | "Expand" |
| `chat.collapse` | "Thu gọn" | "Collapse" |
| `chat.fullWidth` | "Toàn màn hình" | "Full width" |

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| TypeScript compilation | ✅ Pass | `pnpm typecheck` |
| Component size | ≤120 lines | Line count |
| Transition smoothness | 60fps | Chrome DevTools Performance |
| i18n coverage | 100% | All strings externalized |

---

*Context document created for Story E1-3 implementation*
