# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-026
**Title: Offline Mode with Service Worker
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
Implement offline mode with service worker, cache static assets, and show offline status indicator.

## Context
App fails when network unavailable. Users need basic functionality offline (view projects, read files, compose messages).

## Root Cause
```typescript
// No service worker registered
// No caching strategy
// No offline detection
// No offline UI feedback
```

## Files to Create/Modify
- **Create**: `public/sw.js` - Service worker with cache strategies
- **Create**: `src/lib/offline/cache-manager.ts` - Cache management utilities
- **Create**: `src/lib/offline/offline-detector.ts` - Online/offline detection
- **Create**: `src/presentation/components/offline/OfflineIndicator.tsx` - Status banner
- **Create**: `src/hooks/useOfflineStatus.ts` - Hook for offline state
- **Modify**: `src/routes/__root.tsx` - Register service worker
- **Modify**: `src/main.tsx` - Service worker initialization

## Service Worker Strategy

### Cache Patterns
1. **Cache First** (static assets): HTML, CSS, JS, images
   - Serve from cache, fallback to network
   - Background sync for updates

2. **Network First** (API requests): Projects, files, messages
   - Try network, fallback to cache
   - Show stale data while revalidating

3. **Stale While Revalidate** (dynamic content):
   - Serve cache immediately, update in background
   - Always keep cache fresh

### Assets to Cache
- App shell: index.html, main.css, main.js
- Static assets: Icons, fonts, images
- Chunks: React lazy-loaded components
- API responses: Projects list, user settings

### Offline Functionality
- View previously loaded projects
- Read cached files
- Compose messages (queue for sync)
- Show "Working offline" banner
- Disable network-dependent features

## Constraints
- Service worker scope: root directory
- Cache version: Busting with timestamps
- Cache size: Max 100MB, LRU eviction
- Background sync: Queue failed requests
- Graceful degradation: Show cached data
- i18n strings via t() function
- 8-bit gaming style (no blur effects)
- Mobile: Works offline on first load

## Acceptance Criteria
- [ ] Service worker registered and active
- [ ] Static assets cached (app shell, chunks, fonts, icons)
- [ ] Cache first strategy for static assets
- [ ] Network first strategy for API requests
- [ ] Offline indicator shows status (online/offline)
- [ ] Offline banner: "You're offline. Some features may be limited."
- [ ] Can view cached projects offline
- [ ] Can read cached files offline
- [ ] Message composition queues for sync
- [ ] Background sync when back online
- [ ] Cache size management (LRU eviction)
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `brainstorming` - Design caching strategy
- `global-coding-style` - Service worker patterns
- `frontend-components` - Offline indicator UI

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify service worker created
ls -la public/sw.js

# Verify offline components
ls -la src/presentation/components/offline/
```

## Related Issues
- PWA support
- Offline-first architecture
- Ralph Loop Cycle 5B: Mobile UX enhancements

## Next Action
Create service worker with cache strategies, offline detector, and status indicator UI.

---
**Handoff ID**: S-026-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
