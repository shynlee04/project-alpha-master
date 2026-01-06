# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-033
**Title: Notification System with Toast/Badge
**Date**: 2026-01-06T09:30:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add notification system with toast messages, notification center, badge counters, and permission handling.

## Context
No unified notification system exists. Users miss important events (errors, successes, updates).

## Root Cause
```typescript
// No notification manager exists
// No toast/snackbar system
// No notification center
// Missing permission handling
```

## Files to Create/Modify
- **Create**: `src/lib/notifications/notification-manager.ts` - Central notification manager
- **Create**: `src/presentation/components/notifications/NotificationCenter.tsx` - Notification panel
- **Create**: `src/presentation/components/notifications/NotificationBadge.tsx` - Badge counter
- **Create**: `src/hooks/useNotifications.ts` - Hook for notifications
- **Create**: `src/lib/notifications/notification-store.ts` - Zustand store for state
- **Modify**: `src/routes/__root.tsx` - Request notification permissions

## Notification Types

### Notification Categories
1. **Success**: Operations completed successfully
2. **Error**: Errors and failures
3. **Warning**: Non-critical issues
4. **Info**: General information
5. **System**: System events (updates, maintenance)

### Notification Features
- **Toast Messages**: Auto-dismiss after 5s (configurable)
- **Action Buttons**: "Undo", "Retry", "View Details"
- **Priority Levels**: Low, Normal, High, Urgent
- **Grouping**: Similar notifications grouped (e.g., "3 errors")
- **Persistence**: Important notifications saved to history
- **Sound**: Optional notification sound
- **Vibration**: Mobile vibration for important notifications

### Notification Center
- **Panel**: Slide-out panel with all notifications
- **Filter**: By type (success, error, warning, info)
- **Mark Read**: Individual or mark all as read
- **Clear All**: Remove all notifications
- **Timestamp**: Show relative time (2m ago, 1h ago)
- **Pagination**: Show 50 most recent, paginate older

### Badge Counter
- **Icon Badge**: Red circle with count on bell icon
- **Max Count**: Show "99+" for 100+
- **Unread Only**: Count only unread notifications
- **Zero State**: Hide badge when count = 0

## Browser Notifications

### Permission Handling
- **Request**: Prompt on first user interaction
- **Status**: Show permission status (granted/denied/default)
- **Fallback**: In-app notifications if denied
- **Settings**: Link to browser notification settings

### Native Notifications
- **Title**: Notification title
- **Body**: Message content
- **Icon**: App icon
- **Click**: Navigate to relevant page
- **Auto-Close**: Dismiss after 5s

## Constraints
- Notification API integration with permission request
- Toast auto-dismiss (default 5s, configurable)
- Group similar notifications (max 5 visible toasts)
- Sound optional with user setting
- Mobile: Native notifications, vibration support
- i18n strings via t() function
- 8-bit gaming style (no blur)
- Accessibility: ARIA live regions, screen reader support

## Acceptance Criteria
- [ ] Notification manager singleton
- [ ] Toast messages (success, error, warning, info)
- [ ] Notification center with history
- [ ] Badge counter with unread count
- [ ] Priority levels (low, normal, high, urgent)
- [ ] Action buttons (undo, retry, view details)
- [ ] Grouping of similar notifications
- [ ] Mark read/unread, clear all
- [ ] Browser notification permission handling
- [ ] Native notifications for important events
- [ ] Auto-dismiss (5s default, configurable)
- [ ] Sound optional with user setting
- [ ] Mobile: Native notifications, vibration
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained
- [ ] ARIA live regions for accessibility

## Skills to Invoke
- `frontend-components` - Build notification UI
- `brainstorming` - Design notification system
- `global-coding-style` - Notification patterns
- `frontend-accessibility` - ARIA compliance

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify notification components
ls -la src/presentation/components/notifications/

# Verify notification manager
ls -la src/lib/notifications/notification-manager.ts
```

## Related Issues
- User feedback
- Error visibility
- Ralph Loop Cycle 5B: User communication

## Next Action
Create notification manager with toast system, notification center, badge counter, browser permissions, and accessibility support.

---
**Handoff ID**: S-033-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
