# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-025
**Title**: Real-Time Collaboration Indicators
**Date**: 2026-01-06T09:15:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add real-time collaboration indicators showing other users viewing/editing files, with live cursor positions and presence awareness.

## Context
Multi-user collaboration lacks awareness of other users' activity. Need presence indicators showing who's viewing/editing.

## Root Cause
```typescript
// No collaboration/presence system exists
// No WebSocket connection for real-time updates
// No user presence tracking
// Missing live cursor indicators
```

## Files to Create/Modify
- **Create**: `src/lib/collaboration/presence-manager.ts` - User presence tracking
- **Create**: `src/lib/collaboration/cursor-tracker.ts` - Live cursor positions
- **Create**: `src/presentation/components/collaboration/UserPresenceIndicator.tsx` - User avatars
- **Create**: `src/presentation/components/collaboration/LiveCursor.tsx` - Remote cursor display
- **Create**: `src/hooks/useCollaborationPresence.ts` - Hook for presence updates
- **Modify**: `src/presentation/components/editor/MonacoEditor.tsx` - Add cursor overlay
- **Create**: `src/lib/collaboration/websocket-client.ts` - WebSocket connection

## Features

### User Presence
- Show user avatars in file tree for files being viewed
- Avatar stack: Show up to 5 avatars, overflow shows "+N more"
- Avatar: User initials or profile picture with colored border
- Tooltip: "John Doe viewing this file"
- Last activity timestamp (e.g., "Active now", "2m ago")

### Live Cursors
- Show remote users' cursor positions in editor
- Cursor label: User name with colored border matching avatar
- Cursor follows remote user's editing position
- Smooth animation when cursor moves (lerp)
- Disappear after user idle (30s timeout)

### Typing Indicators
- Show "User X is typing..." in status bar
- Real-time character-by-character updates
- Debounced (show after 100ms of typing)

### Active User List
- Sidebar showing all active users in current project
- Green dot for online, yellow for idle (5m), gray for offline
- Click user avatar to see their profile
- Filter by "Viewing my files"

## Constraints
- WebSocket connection for real-time updates
- Reconnection logic with exponential backoff
- Privacy: Only show users in same project
- Performance: Limit cursor updates to 10fps (throttle)
- Mobile: Hide live cursors (screen too small)
- i18n strings via t() function
- 8-bit gaming style (pixel art borders)
- GDPR compliance: No IP logging, anonymized user IDs

## Technologies
- **WebSocket**: Native WebSocket API with reconnection
- **Presence**: Heartbeat every 30s, timeout 60s
- **Cursors**: Absolute positioning with CSS transforms
- **Avatars**: UserInitials component from existing codebase

## Acceptance Criteria
- [ ] WebSocket connection established for project
- [ ] User avatars shown in file tree for active files
- [ ] Avatar stack with overflow indicator (+N more)
- [ ] Live cursors shown in editor (desktop only)
- [ ] Cursor labels with user names
- [ ] Smooth cursor animation (lerp)
- [ ] Typing indicators in status bar
- [ ] Active user list in sidebar
- [ ] Reconnection logic with exponential backoff
- [ ] Privacy: Only same-project users visible
- [ ] Mobile: Live cursors hidden
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build collaboration UI
- `brainstorming` - Design presence system
- `global-coding-style` - WebSocket patterns
- `frontend-accessibility` - Privacy controls

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify collaboration components
ls -la src/presentation/components/collaboration/

# Verify WebSocket client
ls -la src/lib/collaboration/websocket-client.ts
```

## Related Issues
- Real-time collaboration features
- Multi-user workspace support
- Ralph Loop Cycle 5C: Collaboration features

## Next Action
Create presence manager, cursor tracker, WebSocket client, and collaboration UI components (avatars, cursors, typing indicators).

---
**Handoff ID**: S-025-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
