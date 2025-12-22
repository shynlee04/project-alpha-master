# Story 28.18: StatusBar with Connection Indicators

**Status:** ready-for-dev
**Created:** 2025-12-22T21:40:00+07:00
**Epic:** 28 - UX Brand Identity & Design System
**Phase:** 6 - AI Foundation Integration Readiness
**Priority:** P0
**Points:** 3
**Platform:** Platform B

---

## Story

As a **developer using Via-Gent IDE**,
I want **to see connection status indicators in a VS Code-style status bar**,
so that **I can understand at a glance whether WebContainer is ready, my LLM provider is connected, and file sync is active**.

---

## Context & Business Value

This story is the **first component in Epic 28 Phase 6** (AI Foundation Integration Readiness). The StatusBar is critical infrastructure that:

1. **Prepares for Epic 25** (AI Foundation) - StatusBar will display AI agent status, token usage, current tool being executed
2. **Consolidates existing indicators** - Replaces scattered sync/permission indicators with unified status bar
3. **Follows VS Code UX pattern** - Bottom-fixed status bar with segmented information regions
4. **Enables future agent visibility** - Container for agent:status, tool:executing events

### Cross-Epic Integration Points

| Epic | Story | Integration |
|------|-------|-------------|
| Epic 10 | 10-7 | Subscribe to sync:progress, sync:error events |
| Epic 25 | 25-1 | Display agent:idle/thinking/executing states |
| Epic 26 | 26-5 | Show LLM provider connection status |

---

## Acceptance Criteria

### AC-1: StatusBar Rendering
**Given** the IDE is loaded  
**When** the IDELayout renders  
**Then** a 24px-height StatusBar appears fixed at the bottom of the viewport with primary background color

### AC-2: WebContainer Status
**Given** WebContainer boot() is called  
**When** WebContainer state changes (booting → ready → error)  
**Then** StatusBar displays:
- 🔄 "WC: Booting..." during boot
- ✓ "WC: Ready" when booted
- ⚠ "WC: Error" on boot failure

### AC-3: Sync Status
**Given** file sync is in progress or completed  
**When** sync status changes  
**Then** StatusBar displays:
- "Syncing: 45/120" during active sync  
- "✓ Synced" on successful completion
- "⚠ Sync Error" on failure (clickable to retry)

### AC-4: LLM Provider Status (Mock)
**Given** provider configuration exists  
**When** StatusBar renders  
**Then** displays mock provider status:
- "Gemini: Connected" (mock online)
- "Gemini: Not Configured" (mock offline)

### AC-5: Cursor Position & File Info (VS Code style)
**Given** a file is open in Monaco editor  
**When** cursor position changes  
**Then** StatusBar displays:
- "Ln 24, Col 36" for cursor position
- "UTF-8" for encoding (static)
- "TypeScript React" for file type (from extension)

### AC-6: i18n Localization
**Given** user language is Vietnamese  
**When** StatusBar renders  
**Then** all text labels display in Vietnamese

---

## Tasks / Subtasks

### Task 1: Create Zustand Store for StatusBar State (AC: 2, 3, 4, 5)
- [ ] 1.1: Create `src/lib/state/statusbar-store.ts`
- [ ] 1.2: Define StatusBarState interface:
  - webContainerStatus: 'booting' | 'ready' | 'error'
  - syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  - syncProgress: { current: number, total: number } | null
  - providerStatus: { name: string, connected: boolean }
  - cursorPosition: { line: number, column: number }
  - fileType: string
- [ ] 1.3: Add actions: setWebContainerStatus, setSyncStatus, etc.
- [ ] 1.4: Export useStatusBarStore hook
- [ ] 1.5: Add JSDoc with @integrates Epic 25, Epic 26

### Task 2: Create StatusBar Component (AC: 1, 6)
- [ ] 2.1: Create `src/components/ide/StatusBar.tsx`
- [ ] 2.2: Implement fixed-bottom layout (h-6, primary bg)
- [ ] 2.3: Create left region (branch, sync, errors)
- [ ] 2.4: Create right region (cursor, encoding, file type)
- [ ] 2.5: Add pixel aesthetic (font-mono, squared edges)
- [ ] 2.6: Wire to useStatusBarStore
- [ ] 2.7: Add i18n with useTranslation()

### Task 3: Create StatusBar Segment Components (AC: 2, 3, 4, 5)
- [ ] 3.1: Create `StatusBarSegment.tsx` wrapper with divider support
- [ ] 3.2: Create `WebContainerStatus.tsx` segment
- [ ] 3.3: Create `SyncStatusSegment.tsx` segment
- [ ] 3.4: Create `ProviderStatus.tsx` segment (mock)
- [ ] 3.5: Create `CursorPosition.tsx` segment
- [ ] 3.6: Create `FileTypeIndicator.tsx` segment

### Task 4: Wire to IDELayout (AC: 1)
- [ ] 4.1: Import StatusBar into IDELayout.tsx
- [ ] 4.2: Add StatusBar below main content area
- [ ] 4.3: Adjust main area height to account for StatusBar
- [ ] 4.4: Remove redundant status indicators from IDEHeaderBar

### Task 5: Add i18n Keys (AC: 6)
- [ ] 5.1: Add English keys to src/i18n/en.json
- [ ] 5.2: Add Vietnamese keys to src/i18n/vi.json
- [ ] 5.3: Verify all labels use t() function

### Task 6: Connect to Event Sources (AC: 2, 3)
- [ ] 6.1: Subscribe to WebContainer boot state from manager.ts
- [ ] 6.2: Subscribe to sync events from SyncManager
- [ ] 6.3: Subscribe to cursor position from Monaco editor
- [ ] 6.4: Add JSDoc comments for Epic 25 wiring points

### Task 7: Write Tests
- [ ] 7.1: Create `src/components/ide/__tests__/StatusBar.test.tsx`
- [ ] 7.2: Test StatusBar renders with correct structure
- [ ] 7.3: Test segment visibility based on store state
- [ ] 7.4: Test i18n key rendering
- [ ] 7.5: Test click handlers (sync retry, etc.)

---

## Dev Notes

### Architecture Requirements

**File Structure:**
```
src/
  lib/state/
    statusbar-store.ts         # NEW - Zustand store
  components/ide/
    StatusBar.tsx              # NEW - Main component
    statusbar/                 # NEW - Directory
      StatusBarSegment.tsx     # NEW - Wrapper
      WebContainerStatus.tsx   # NEW - WC state
      SyncStatusSegment.tsx    # NEW - Sync state
      ProviderStatus.tsx       # NEW - LLM provider (mock)
      CursorPosition.tsx       # NEW - Ln/Col
      FileTypeIndicator.tsx    # NEW - File type
    __tests__/
      StatusBar.test.tsx       # NEW - Tests
```

**Design Tokens (from styles.css):**
- Background: `bg-primary` (orange #f97316)
- Text: `text-white`, `text-primary-foreground`
- Height: `h-6` (24px like VS Code)
- Font: `font-mono text-[10px]`
- Borders: None (solid bar)

### Code Patterns

**Zustand Store Pattern (from ide-store.ts):**
```typescript
import { create } from 'zustand';

interface StatusBarState {
  webContainerStatus: 'booting' | 'ready' | 'error';
  // ... other state
  setWebContainerStatus: (status: 'booting' | 'ready' | 'error') => void;
}

export const useStatusBarStore = create<StatusBarState>((set) => ({
  webContainerStatus: 'booting',
  setWebContainerStatus: (status) => set({ webContainerStatus: status }),
}));
```

**Existing Patterns to Reference:**
- `SyncStatusIndicator.tsx` - Shows sync state patterns
- `StatusDot.tsx` - Status variants (online, offline, active)
- `IDEHeaderBar.tsx` - Current header layout
- `ide-store.ts` - Zustand with persistence

### Integration Points (JSDoc Pattern)

```typescript
/**
 * StatusBar - VS Code-style footer status bar
 * 
 * @epic Epic-28 Story 28-18
 * @integrates Epic-10 Story 10-7 - Subscribes to sync:progress events
 * @integrates Epic-25 Story 25-1 - Displays agent:idle/thinking/executing
 * @integrates Epic-26 Story 26-5 - Shows provider connection status
 * 
 * @roadmap
 * - Epic 25: Add AgentStatusSegment with token counter
 * - Epic 26: Wire ProviderStatus to real API key validation
 * 
 * @listens sync:progress, sync:error, webcontainer:status
 * @example
 * <StatusBar />
 */
```

### i18n Keys to Add

**English (en.json):**
```json
{
  "statusBar": {
    "wcBooting": "WC: Booting...",
    "wcReady": "WC: Ready",
    "wcError": "WC: Error",
    "syncing": "Syncing: {{current}}/{{total}}",
    "synced": "Synced",
    "syncError": "Sync Error",
    "notConfigured": "Not Configured",
    "connected": "Connected",
    "cursorPosition": "Ln {{line}}, Col {{column}}",
    "encoding": "UTF-8"
  }
}
```

**Vietnamese (vi.json):**
```json
{
  "statusBar": {
    "wcBooting": "WC: Đang khởi động...",
    "wcReady": "WC: Sẵn sàng",
    "wcError": "WC: Lỗi",
    "syncing": "Đồng bộ: {{current}}/{{total}}",
    "synced": "Đã đồng bộ",
    "syncError": "Lỗi đồng bộ",
    "notConfigured": "Chưa cấu hình",
    "connected": "Đã kết nối",
    "cursorPosition": "Dòng {{line}}, Cột {{column}}",
    "encoding": "UTF-8"
  }
}
```

### UX Design Reference

**VS Code Status Bar Pattern:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ main* ↓0 ↑1 │ ⚠0 ✕0 │ WC: Ready │ Synced │     │ Ln 24, Col 36 │ UTF-8 │ TSX │
└─────────────────────────────────────────────────────────────────────────┘
  ^LEFT REGION (git, errors, status)                ^RIGHT REGION (file info)
```

---

## References

- [Source: _bmad-output/analysis/epic-28-holistic-integration-analysis.md] - Phase 6 scope expansion
- [Source: _bmad-output/epics/epic-28-ux-brand-identity-design-system.md] - Design tokens
- [Source: src/lib/state/ide-store.ts] - Zustand store pattern
- [Source: src/components/ide/SyncStatusIndicator.tsx] - Existing sync status
- [Source: src/components/ui/status-dot.tsx] - Status variants
- [Source: _bmad-output/project-context.md] - Coding standards

---

## Dev Agent Record

### Agent Model Used
_(To be filled by Dev Agent)_

### Debug Log References
_(To be filled during implementation)_

### Completion Notes List
_(To be filled after each task)_

### File List
_(To be filled with created/modified files)_
