# Story Context: E1-4 - Notion-style Chat Bubble

**Document ID**: `e1-4-story-context-2026-01-05`
**Version**: 1.0.0
**Created**: 2026-01-05T13:30:00Z
**Story**: E1-4 - Notion-style Chat Bubble
**Epic**: E1 - Cross-Workspace Chat Integration
**Points**: 6

---

## 1. Story Validation

### Acceptance Criteria (from stories.md)
- [x] Chat bubble renders in bottom-right corner
- [x] Tapping bubble opens chat overlay
- [x] Chat overlay takes full screen on mobile
- [x] Unread message count badge on bubble
- [x] Bubble dismisses with swipe or tap outside
- [x] Accessible (keyboard navigation, ARIA labels)

**Validation Result**: ✅ All acceptance criteria clear and measurable.

---

## 2. Technical Context

### Existing Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `useDeviceType` | `src/hooks/useMediaQuery.ts` | Mobile detection (`<768px`) |
| `UnifiedChatPanel` | `src/presentation/components/chat/` | Chat interface to wrap |
| `ExpandableChatPanel` | `src/presentation/components/chat/` | Desktop expandable panel |

### Breakpoints

```typescript
// Mobile breakpoint
mobile: '(max-width: 767px)'

// Device types from useDeviceType()
const { isMobile, isTablet, isDesktop } = useDeviceType();
```

### Design Tokens

```css
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--primary: 24.6 95% 53.1%; /* #f97316 Orange */
```

---

## 3. Implementation Plan

### File Structure

```
src/presentation/components/chat/
├── ChatBubble.tsx                 # NEW - Floating bubble button
├── ChatBubbleOverlay.tsx          # NEW - Full-screen overlay
└── index.ts                        # UPDATE - Export
```

### Component API

```typescript
interface ChatBubbleProps {
  /** Chat panel to render in overlay */
  chatPanel: React.ReactNode;
  /** Initial unread count */
  unreadCount?: number;
  /** Position of bubble ('bottom-right' or 'bottom-left') */
  position?: 'bottom-right' | 'bottom-left';
  /** Show only on mobile (default: true) */
  mobileOnly?: boolean;
}

interface ChatBubbleOverlayProps {
  /** Whether overlay is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Chat content */
  children: React.ReactNode;
}
```

### State Management

| State | Default | Purpose |
|-------|---------|---------|
| `isOpen` | `false` | Overlay visibility |
| `unreadCount` | `0` | Badge count |

---

## 4. CSS Architecture

```css
/* Floating bubble */
.chat-bubble {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-bubble:hover {
  transform: scale(1.1);
}

/* Unread badge */
.chat-bubble-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
}

/* Full-screen overlay */
.chat-bubble-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  animation: slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

---

## 5. Integration Points

### Usage in Workspace Pages

```tsx
import { ChatBubble } from '@/presentation/components/chat';
import { UnifiedChatPanel } from '@/presentation/components/chat';

<ChatBubble
  unreadCount={unreadCount}
  position="bottom-right"
  chatPanel={
    <UnifiedChatPanel
      mode="agent"
      projectId={projectId}
      workspaceType="notes"
    />
  }
/>
```

---

## 6. Edge Cases & Constraints

| Edge Case | Handling |
|-----------|----------|
| Desktop viewport | Hide bubble, show ExpandableChatPanel instead |
| Swipe to dismiss | Touch handlers on overlay backdrop |
| Keyboard navigation | Escape key closes overlay, Tab focuses bubble |
| Zero unread count | Hide badge when count is 0 |

---

## 7. Dependencies

### Peer Dependencies
- React 18.2.0
- Lucide React (MessageSquare, X icons)
- Tailwind CSS
- Framer Motion (optional, for smoother animations)

### Internal Dependencies
- `@/hooks/useMediaQuery` - Device detection
- `@/presentation/components/ui/dialog` - Overlay pattern reference

---

## 8. Test Strategy

### Unit Tests
- Bubble renders on mobile viewport
- Bubble hidden on desktop viewport
- Badge shows correct count
- Badge hidden when count is 0

### Integration Tests
- Tap opens overlay
- Escape closes overlay
- Chat panel renders in overlay
- Unread count updates

### Manual Tests
- Touch interactions on mobile device
- Swipe dismiss gesture
- Keyboard navigation (Tab, Enter, Escape)

---

## 9. i18n Requirements

| Key | Vietnamese | English |
|-----|------------|---------|
| `chat.open` | "Mở chat" | "Open chat" |
| `chat.close` | "Đóng" | "Close" |
| `chat.unread` | "chưa đọc" | "unread" |

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| TypeScript compilation | ✅ Pass | `pnpm typecheck` |
| Component size | ≤120 lines each | Line count |
| Accessibility | ✅ Pass | axe DevTools |
| Animation smoothness | 60fps | Chrome DevTools Performance |

---

*Context document created for Story E1-4 implementation*
