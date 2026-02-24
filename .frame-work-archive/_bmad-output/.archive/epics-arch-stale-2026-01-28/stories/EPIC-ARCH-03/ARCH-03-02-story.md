# ARCH-03-02: Mobile-Responsive Plugin Layouts

**Story ID:** ARCH-03-02
**Epic:** EPIC-ARCH-03 - Layout System & UX
**Team:** Team B
**Priority:** P0 - Critical Path
**Estimated Effort:** 4 hours
**Created:** 2026-01-22
**Status:** COMPLETE ✅
**Completion Date:** 2026-01-22T20:00+07:00
**Dependencies:** ARCH-03-00 (Platform-First Plugin Defaults) ✅ COMPLETE, ARCH-03-01 (ProjectSidebar) ✅ COMPLETE

---

## Authority Documents

**CRITICAL: All work must reference these documents:**

1. **ADR-034: Project-Centric Architecture** (Phase 3 - Layout System & UX)
   - Path: `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
    - Status: APPROVED - COMPLETE
2. **ADR-034-AMENDMENT-001: Platform-First Plugin Selection**
    - Path: `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`
    - Status: APPROVED - IMPLEMENTED ✅
   - Story Location: Lines 433-503 (ARCH-03-02 specification)

4. **Architect Handoff: ARCH-03-00 Impact**
   - Path: `_bmad-output/handoffs/2026-01-22/ARCH-03-00-architect-handoff.md`
   - Status: IMPLEMENTED ✅
   - Key Impact: Platform defaults now available via `getDefaultPlugins()` and `getDefaultLayoutMode()`

---

## Description

Implement mobile-responsive layout system for PluginLayout to ensure optimal experience across devices. The current implementation is desktop-first and needs to adapt to tablet and mobile viewports with appropriate constraints and navigation patterns.

**User Story:**
As a developer using ViaGent on various devices,
I want the plugin layout to automatically adapt to my screen size and device capabilities,
So that I can efficiently manage files, code, notes, and communication regardless of device.

---

## Acceptance Criteria

**All criteria must be met for story completion:**

| # | Criterion | Status | Evidence |
|---|------------|--------|----------|
| 1 | Mobile (< 768px): Single plugin fullscreen with bottom tab navigation | ⏳ | PluginLayout detects mobile breakpoint, shows only 1 plugin |
| 2 | Tablet (768-1024px): 2-column max, collapsible sidebar | ⏳ | PluginLayout enforces max 2 plugins, sidebar toggle works |
| 3 | Desktop (> 1024px): Full layout options, persistent sidebar | ⏳ | PluginLayout allows up to 5 plugins, sidebar always visible |
| 4 | No horizontal scroll at any viewport | ⏳ | CSS overflow-x: hidden, viewport meta tag present |
| 5 | Touch targets ≥ 44x44px on mobile | ⏳ | All interactive elements meet WCAG 2.5.5 touch target requirements |
| 6 | Swipe left/right to switch plugins on mobile | ⏳ | Gesture handlers implemented, plugin switching works |
| 7 | Bottom nav shows icons for active plugins | ⏳ | MobilePluginNav renders fixed bottom bar with plugin icons |
| 8 | Sidebar overlays content on mobile (not push) | ⏳ | CSS positioning fixed with z-index overlay, backdrop backdrop |
| 9 | TypeScript: 0 compilation errors | ⏳ | `pnpm tsc --noEmit` passes for all modified files |

---

## Technical Implementation

### Breakpoints Specification

```typescript
// From EPIC-ARCH-03 specification
const BREAKPOINTS = {
  mobile: 375,    // iPhone SE
  mobileLg: 414,  // iPhone Pro Max
  tablet: 768,    // iPad portrait
  desktop: 1024,  // iPad landscape / small laptop
  wide: 1440,     // Desktop
};

const LAYOUT_RULES = {
  mobile: {
    maxPlugins: 1,
    layoutMode: '1-column',
    sidebarMode: 'overlay',
    showBottomNav: true,
  },
  tablet: {
    maxPlugins: 2,
    layoutMode: '2-column',
    sidebarMode: 'collapsible',
    showBottomNav: false,
  },
  desktop: {
    maxPlugins: 5,
    layoutMode: 'user-selected',
    sidebarMode: 'persistent',
    showBottomNav: false,
  },
};
```

### Files to Modify

1. **src/presentation/layouts/PluginLayout.tsx** (add responsive logic)
   - Import breakpoint detection from new `useBreakpoint` hook
   - Apply layout rules based on current breakpoint
   - Render `MobilePluginNav` on mobile
   - Apply sidebar mode (overlay vs persistent vs collapsible)
   - Enforce max plugins per platform

2. **src/presentation/layouts/PluginPanel.tsx** (touch-friendly resize)
   - Add touch event handlers for panel resizing
   - Ensure touch targets meet 44x44px minimum
   - Disable drag-drop on mobile (swipe instead)
   - Adjust resize handle size for touch

3. **src/presentation/layouts/PluginLayoutStore.ts** (responsive state)
   - Add `breakpoint` state field
   - Add `currentPlugin` field (for mobile single-view)
   - Add `setBreakpoint` action
   - Add `switchPlugin` action (for mobile plugin switching)
   - Integrate with platform defaults from ARCH-03-00

4. **src/presentation/layouts/MobilePluginNav.tsx** (NEW - bottom navigation)
   - Fixed bottom bar component
   - Renders plugin icons for active plugins
   - Highlights current plugin
   - Click handler calls `switchPlugin` action
   - 8-bit design compliance (sharp corners, pixel shadows)

### Files to Create

1. **src/presentation/layouts/useBreakpoint.ts** (NEW - breakpoint hook)
   ```typescript
   import { useEffect, useState } from 'react';
   import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

   export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

   export const BREAKPOINTS = {
     mobile: 375,
     mobileLg: 414,
     tablet: 768,
     desktop: 1024,
     wide: 1440,
   };

   export function useBreakpoint(): Breakpoint {
     const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

     useEffect(() => {
       const platform = getPlatformContract();
       const handleResize = () => {
         const width = window.innerWidth;

         if (width < BREAKPOINTS.mobileLg) {
           setBreakpoint('mobile');
         } else if (width < BREAKPOINTS.tablet) {
           setBreakpoint('mobileLg');
         } else if (width < BREAKPOINTS.desktop) {
           setBreakpoint('tablet');
         } else if (width < BREAKPOINTS.wide) {
           setBreakpoint('desktop');
         } else {
           setBreakpoint('wide');
         }
       };

       // Set initial breakpoint based on platform
       if (platform.deviceType === 'mobile') {
         setBreakpoint('mobile');
       } else if (platform.deviceType === 'tablet') {
         setBreakpoint('tablet');
       }

       window.addEventListener('resize', handleResize);
       return () => window.removeEventListener('resize', handleResize);
     }, []);

     return breakpoint;
   }
   ```

2. **src/presentation/layouts/MobilePluginNav.tsx** (NEW - bottom navigation)
   ```typescript
   import React from 'react';
   import type { PluginId } from '@/domain/types/plugin-types';

   interface MobilePluginNavProps {
     activePlugins: PluginId[];
     currentPlugin: PluginId;
     onSwitchPlugin: (pluginId: PluginId) => void;
   }

   export function MobilePluginNav({
     activePlugins,
     currentPlugin,
     onSwitchPlugin
   }: MobilePluginNavProps) {
     return (
       <nav className="mobile-plugin-nav">
         {activePlugins.map((pluginId) => (
           <button
             key={pluginId}
             className={`plugin-tab ${pluginId === currentPlugin ? 'active' : ''}`}
             onClick={() => onSwitchPlugin(pluginId)}
             aria-label={`Switch to ${pluginId}`}
             style={{ minHeight: '44px', minWidth: '44px' }}
           >
             {/* Render plugin icon based on pluginId */}
             <PluginIcon pluginId={pluginId} />
           </button>
         ))}
       </nav>
     );
   }
   ```

### PluginLayout.tsx Responsive Logic

```typescript
import { useBreakpoint, type Breakpoint } from '@/presentation/layouts/useBreakpoint';

const LAYOUT_RULES: Record<Breakpoint, LayoutRules> = {
  mobile: {
    maxPlugins: 1,
    layoutMode: '1-column',
    sidebarMode: 'overlay',
    showBottomNav: true,
  },
  tablet: {
    maxPlugins: 2,
    layoutMode: '2-column',
    sidebarMode: 'collapsible',
    showBottomNav: false,
  },
  desktop: {
    maxPlugins: 5,
    layoutMode: 'user-selected',
    sidebarMode: 'persistent',
    showBottomNav: false,
  },
  wide: {
    maxPlugins: 5,
    layoutMode: 'user-selected',
    sidebarMode: 'persistent',
    showBottomNav: false,
  },
};

function PluginLayout() {
  const breakpoint = useBreakpoint();
  const layoutRules = LAYOUT_RULES[breakpoint];
  const layoutStore = usePluginLayoutStore();

  // Enforce max plugins per platform
  const visiblePlugins = layoutStore.activePlugins.slice(0, layoutRules.maxPlugins);
  const currentPlugin = layoutStore.currentPlugin || visiblePlugins[0];

  return (
    <div className={`plugin-layout breakpoint-${breakpoint}`}>
      {/* Sidebar mode based on platform */}
      {layoutRules.sidebarMode === 'overlay' ? (
        <ProjectSidebar overlayMode />
      ) : (
        <ProjectSidebar persistent={layoutRules.sidebarMode === 'persistent'} />
      )}

      {/* Plugin panels */}
      <main className="plugin-main">
        {breakpoint === 'mobile' ? (
          // Mobile: Single plugin fullscreen
          <PluginPanel
            pluginId={currentPlugin}
            fullscreen={true}
          />
        ) : (
          // Desktop/Tablet: Multiple plugins
          visiblePlugins.map((pluginId) => (
            <PluginPanel key={pluginId} pluginId={pluginId} />
          ))
        )}
      </main>

      {/* Bottom navigation on mobile */}
      {layoutRules.showBottomNav && (
        <MobilePluginNav
          activePlugins={visiblePlugins}
          currentPlugin={currentPlugin}
          onSwitchPlugin={(pluginId) => layoutStore.switchPlugin(pluginId)}
        />
      )}
    </div>
  );
}
```

---

## Design Specifications

### 8-bit Design Compliance

All components must follow 8-bit design system from AGENTS.md:

```css
/* MobilePluginNav */
.mobile-plugin-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #333;
  border-top: 2px solid #000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -4px 0 0 rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.plugin-tab {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 44px;  /* WCAG 2.5.5 touch target */
  min-width: 44px;
}

.plugin-tab.active {
  background: #0066cc;
  color: #fff;
}

.plugin-tab:hover:not(.active) {
  background: #444;
}

/* Touch targets - minimum 44x44px */
.mobile-plugin-nav button {
  min-height: 44px;
  min-width: 44px;
  padding: 8px;
}
```

### Sidebar Overlay Mode (Mobile)

```css
.plugin-layout.breakpoint-mobile .project-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 56px;  /* Above bottom nav */
  width: 280px;
  max-width: 100%;
  background: #f0f0f0;
  border-right: 2px solid #000;
  z-index: 999;
  transform: translateX(-100%);
  transition: transform 200ms;
}

.plugin-layout.breakpoint-mobile .project-sidebar.open {
  transform: translateX(0);
}

.plugin-layout.breakpoint-mobile .sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.plugin-main {
  width: 100%;
  overflow-x: hidden;  /* No horizontal scroll */
}
```

---

## Swipe Gesture Implementation

```typescript
// In PluginPanel.tsx for mobile
import { useEffect, useRef } from 'react';

function PluginPanel({ pluginId, fullscreen }: PluginPanelProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
      const layoutStore = usePluginLayoutStore();

      if (deltaX > 0) {
        // Swipe right - switch to previous plugin
        layoutStore.switchToPreviousPlugin();
      } else {
        // Swipe left - switch to next plugin
        layoutStore.switchToNextPlugin();
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="plugin-panel"
    >
      {/* Plugin content */}
    </div>
  );
}
```

---

## PluginLayoutStore.ts Changes

### New State Fields

```typescript
interface PluginLayoutState {
  // ... existing fields

  // New responsive state
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
  currentPlugin: PluginId | null;  // For mobile single-view

  // Actions
  setBreakpoint: (bp: string) => void;
  switchPlugin: (pluginId: PluginId) => void;
  switchToNextPlugin: () => void;
  switchToPreviousPlugin: () => void;
}
```

### New Actions

```typescript
setBreakpoint: (bp) => {
  set((state) => ({
    ...state,
    breakpoint: bp,
    // Enforce max plugins on breakpoint change
    activePlugins: state.activePlugins.slice(0, LAYOUT_RULES[bp].maxPlugins),
    // Set current plugin if not set
    currentPlugin: state.currentPlugin || state.activePlugins[0],
  }));
},

switchPlugin: (pluginId) => {
  set((state) => ({
    ...state,
    currentPlugin: pluginId,
  }));
},

switchToNextPlugin: () => {
  set((state) => {
    const currentIndex = state.activePlugins.indexOf(state.currentPlugin);
    const nextIndex = (currentIndex + 1) % state.activePlugins.length;
    return {
      ...state,
      currentPlugin: state.activePlugins[nextIndex],
    };
  });
},

switchToPreviousPlugin: () => {
  set((state) => {
    const currentIndex = state.activePlugins.indexOf(state.currentPlugin);
    const prevIndex = currentIndex === 0
      ? state.activePlugins.length - 1
      : currentIndex - 1;
    return {
      ...state,
      currentPlugin: state.activePlugins[prevIndex],
    };
  });
},
```

---

## Dependencies

| Story | Status | Notes |
|--------|--------|-------|
| ARCH-03-00 | ✅ COMPLETE | Platform defaults (`getDefaultPlugins`, `getDefaultLayoutMode`) available |
| ARCH-03-01 | ✅ COMPLETE | ProjectSidebar component ready for integration |

---

## Out of Scope

**NOT implemented in this story:**

- Keyboard shortcuts for plugin switching (desktop feature)
- Plugin drag-drop reordering (ARCH-03-04)
- Layout presets (ARCH-03-03)
- Progressive disclosure UI (ARCH-03-05)
- Root layout integration (ARCH-03-06)

---

## Validation Checklist

### Before Implementation
- [x] Load ADR-034 and Phase 3 specifications
- [x] Load ADR-034-AMENDMENT-001 (platform-first patterns)
- [x] Load EPIC-ARCH-03 with ARCH-03-02 details
- [x] Load architect handoff for ARCH-03-00 impact
- [x] Verify ARCH-03-00 and ARCH-03-01 complete
- [x] Create story file with all sections
- [ ] Validate story file is 100% complete (Step 2)
- [ ] Create context file (Step 3)
- [ ] Validate context file (Step 4)
- [ ] Delegate to dev-ext with tool permissions (Step 5)
- [ ] Monitor dev-ext progress (Step 6)
- [ ] Code review (Step 7)
- [ ] Run TypeScript validation (Step 8)
- [ ] Create completion report (Step 9)
- [ ] Wait for Orchestrator authorization

### During Implementation
- [ ] Implement `useBreakpoint` hook with platform integration
- [ ] Update `PluginLayout.tsx` with responsive logic
- [ ] Update `PluginPanel.tsx` with touch-friendly resize
- [ ] Update `PluginLayoutStore.ts` with responsive state
- [ ] Create `MobilePluginNav.tsx` component
- [ ] Test mobile viewport (375px, 414px)
- [ ] Test tablet viewport (768px)
- [ ] Test desktop viewport (1024px, 1440px)
- [ ] Test swipe gestures on mobile
- [ ] Test bottom navigation switching
- [ ] Verify no horizontal scroll
- [ ] Verify touch targets ≥ 44x44px

### After Implementation
- [ ] TypeScript: 0 errors
- [ ] Application starts without errors
- [ ] Manual testing on all breakpoints
- [ ] Verify ADR-034-001 compliance (no workspace modes)
- [ ] Verify 8-bit design compliance
- [ ] Verify no window.location.href usage (use navigate())
- [ ] Create completion report

---

## Success Metrics

| Metric | Target | Before | After |
|--------|---------|---------|--------|
| Mobile breakpoint implemented | Yes | No | ⏳ |
| Tablet breakpoint implemented | Yes | No | ⏳ |
| Desktop breakpoint implemented | Yes | No | ⏳ |
| MobilePluginNav component exists | Yes | No | ⏳ |
| Bottom nav renders correctly | Yes | No | ⏳ |
| Swipe gesture implemented | Yes | No | ⏳ |
| Touch targets ≥ 44x44px | Yes | No | ⏳ |
| Acceptance criteria | 9/9 | 0/9 | ⏳ |
| TypeScript errors | 0 | - | ⏳ |

---

## Time Box

**Duration:** 4 hours
**Monitoring:** Every 15 minutes
**Escalation:** If > 2x estimated time (8 hours) without progress

---

## Sign-Off

**Implementation Team:** Team B (dev-ext)
**Story Owner:** bmad-sprint-manager
**Reviewers:** architect-ext, Sprint Manager
**Status:** IN PROGRESS

**Ready for Next Story:** ARCH-03-03 (Layout Presets System) - blocked until ARCH-03-02 complete

---

**END OF STORY FILE**
