# UX/UI Consistency Analysis Report

**Date:** 2026-01-09
**Source:** Screenshot analysis
**Theme:** Dark 8-bit design system

---

## Critical Issues (P0)

### 1. Z-Index Stacking Failure

**Location:** Bottom right (chat input area)

**Issue:** The "Trạng thái đồng bộ" (Sync Status) panel acts as an overlay but sits **on top** of the chat input area.

**Impact:** The paperclip icon (attachment) is partially obscured. It is likely impossible to click the paperclip or type in the chat box.

**Fix Required:**
```css
/* Move sync panel above input bar in DOM, not z-index */
.sync-status-panel {
  order: -1; /* Place before input in flex container */
}
```

---

## High Priority Issues (P1)

### 2. Flexbox Overflow

**Location:** Top middle (Navigation Bar)

**Issue:** The container holding "Ghi chú," "Chat," "Files," and "AI Search" does not have enough space. The "AI Search" button is being clipped by the right edge.

**Fix Required:**
```css
.nav-button-container {
  display: flex;
  flex-wrap: wrap; /* OR */
  overflow-x: auto; /* scrolling */
}
```

### 3. Theme Inconsistency

**Location:** Top right (Agent Toolbar)

**Issue:** The "Capture" and "Clear" buttons use bright Blue, clashing with the Orange/Black 8-bit theme.

**Fix Required:** Replace blue with Orange/Grey/White to maintain theme consistency.

---

## Medium Priority Issues (P2)

### 4. Tab Hierarchy Confusion

**Issue:** In the sidebar, user selects "Ghi chú" (Notes). In the second column, there's a prominent orange "Ghi chú" button, followed by tabs for "Chat" and "Files."

**Confusion:** It's unclear if "Chat" and "Files" are sub-tabs *of* a Note, or global filters.

**Recommendation:** If they're filters, they should look like tabs (underlined), not buttons.

### 5. Chat Redundancy

**Issue:** Right column is clearly a Chat/AI Agent. But there's also a "Chat" tab in the middle column.

**Confusion:** Users won't understand the difference between "Chat" in middle column vs. Chat panel on right.

---

## Layout Stability Recommendations

### Text Overflow Handling

**Good Example:** File list item "MIT License Copyright (c) 2025..." shows ellipsis correctly.

**Bad Examples:**
- "agt_def..." truncated without proper ellipsis
- Sync text aligned to far right, almost touching border

**Rule:** All text that may overflow should use:
```css
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

With tooltip on hover.

---

## 8-bit Design Compliance

### Current Violations

| Element | Issue | Correction |
|---------|-------|------------|
| Capture/Clear buttons | Blue color | Change to orange |
| Save button | Dim grey (looks disabled) | Use white or orange |
| Rounded corners | Some elements have `rounded-lg` | Use `rounded-none` |

---

## Required CSS Changes

```css
/* 1. Fix z-index issue */
.chat-input-container {
  position: relative;
  z-index: 10;
}

.sync-status-panel {
  position: relative;
  z-index: 1;
}

/* 2. Fix flexbox overflow */
.nav-button-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

/* 3. Theme consistency */
.btn-capture,
.btn-clear {
  background-color: hsl(var(--primary)); /* Orange */
  color: white;
}

/* 4. Text overflow */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## Panel Resizing Behavior

**Issue:** As panels are resized, child elements maintain fixed width, causing overflow.

**Recommendation:**
- Set `min-width` on parent containers
- Use `flex-shrink: 1` on buttons/labels
- Implement icon-only mode below breakpoint
- Show full text in tooltip on hover

---

**Analysis Status:** COMPLETE
**Next Action:** Implement fixes in MM-11 story
