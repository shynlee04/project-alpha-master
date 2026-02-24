# Deepscan Pass 5: UX Gap Report (Mobile)

**Date:** 2026-01-03
**Status:** Complete

## 1. Responsive Fundamentals
Audited `IconSidebar.tsx` and core layout styles.

**Strengths:**
- **Dynamic sizing:** Uses CSS variables (`--sidebar-activity-bar`, `--sidebar-content-panel`) which usually maps to media queries (though CSS file wasn't deep-read, the intent is there).
- **Touch Targets:** The `ActivityBarItem` explicitly sets height to `var(--sidebar-activity-bar-height)`, intended for touch.
- **Collapsible:** Essential for mobile real-estate.

**Gaps:**
- **Touch Action:** No explicit `touch-action: none` or swipe gestures detected in search. Swipe-to-close sidebar is a standard mobile expectation.
- **Hover States:** Heavy reliance on `:hover` styles in `ActivityBarItem` (`hover:bg-secondary`). On mobile, sticky hover states can be confusing.
- **Bottom Navigation:** The current design is a "Left Sidebar". On mobile, a "Bottom Tab Bar" is often preferred for thumb reachability. The current implementation downgrades gracefully but isn't "Mobile-First" optimized.

## 2. Touch Readiness
- **Targets:** 40px/48px icons are good (Apple recommends 44px minimum).
- **Input Fields:** `MonacoEditor` (from Pass 4) is notoriously hard to use on mobile without a dedicated "Mobile Toolbar" (Tab key, arrow keys). No mobile toolbar detected in `MonacoEditor` component tree.

## 3. Offline UX (Mobile Context)
- **Status:** `SyncStatusIndicator` is present, but on mobile, network flakiness is common.
- **Gap:** No "Toast" notification system seen for "You are offline" vs "Sync Failed".

## 4. Recommendations
- **Mobile Toolbar:** Add a helper toolbar for the Code Editor on mobile (provides `{ } [ ] < >` shortcuts).
- **Bottom Sheet:** Convert the "Settings" and "Agent Config" panels to Bottom Sheets (Drawers) on `< md` screens.
- **Touch Gestures:** Implement `useGesture` or similar for swipe-to-open sidebar.
