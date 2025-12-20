# Story 13-6: Fix Preview in New Tab

**Epic:** 13 - Terminal & Sync Stability  
**Sprint:** 13 - Terminal & Sync Stability  
**Priority:** P1  
**Story Points:** 3 (updated for Focus Mode enhancement)  
**Status:** done

---

## User Story

As a **user**,  
I want **to know why the preview might not work in a new tab AND have an alternative for fullscreen preview**,  
So that **I can use supported preview methods instead of seeing an error**.

---

## Acceptance Criteria

### AC-13-6-1: Informative error page for /webcontainer/ routes
**Given** the user attempts to open a WebContainer URL in a new tab  
**When** the URL is loaded (e.g., `/webcontainer/connect/xyz`)  
**Then** an informative page is displayed  
**And** it explains that WebContainer preview is bound to the IDE tab

### AC-13-6-2: Toast notification in IDE
**Given** the preview panel is active  
**When** the user clicks "Open in new tab"  
**Then** the new tab opens  
**And** a toast notification appears explaining it might show an info page

### AC-13-6-3: No "Cannot GET" errors
**Given** the user is redirected to a localhost webcontainer route  
**When** the page loads  
**Then** no 404 or "Cannot GET" error is shown

### AC-13-6-4: Focus Mode for fullscreen preview (NEW)
**Given** the preview panel has a loaded dev server  
**When** the user clicks the "Focus Mode" (Maximize) button  
**Then** a 95% viewport modal overlay appears with the preview  
**And** the modal includes device selector and refresh controls  
**And** pressing ESC exits focus mode

---

## Implementation Tasks

- [x] T1: Create catch-all route handler for `/webcontainer/$`
- [x] T2: Implement informative page component with i18n
- [x] T3: Add toast notification to PreviewPanel
- [x] T4: Add translations for English and Vietnamese
- [x] T5: Manual verification
- [x] T6: Implement Focus Mode modal (NEW)
- [x] T7: Add ESC key handling and body scroll lock (NEW)
- [x] T8: Add Focus Mode i18n keys (NEW)

---

## Dev Notes

### Technical Limitation
WebContainer's `forwardPreviewErrors: true` option causes it to proxy preview URLs through the parent origin. However, WebContainers must be booted in the specific window context to function. A new tab cannot serve the preview content.

### Solution
1. Implemented an informative "Not Supported" page via catch-all route for `/webcontainer/*`
2. **Added Focus Mode** - a 95% viewport modal that keeps preview in the same window context

### Files Modified
- `src/routes/webcontainer.$.tsx` (MODIFIED - branded error page)
- `src/components/ide/PreviewPanel/PreviewPanel.tsx` (MODIFIED - Focus Mode modal)
- `src/i18n/en.json` (MODIFIED - webcontainer.notSupported.* and preview.focusMode.* keys)
- `src/i18n/vi.json` (MODIFIED - Vietnamese translations)

---

## Dev Agent Record

**Agent:** Antigravity  
**Date:** 2025-12-20  
**Session 1:** Fixed placeholder route with branded error page  
**Session 2:** Added Focus Mode enhancement with modal overlay, ESC handling, device selector

---
# Walkthrough: Fix Preview in New Tab (Story 13-6)

## Issue

Users clicking "Open in New Tab" in the Preview Panel were seeing a broken experience:
1. WebContainer's proxy URL opened in a new tab
2. StackBlitz showed "Connect to Project" prompt
3. After connecting, only placeholder text `Hello '/webcontainer/$'!` was displayed

````carousel
![Issue: Connect to Project Page](/Users/apple/.gemini/antigravity/brain/7f2a3b58-b4d4-494f-9bcb-0d735cffedf6/uploaded_image_0_1766215848572.png)
<!-- slide -->
![Issue: Placeholder text displayed](/Users/apple/.gemini/antigravity/brain/7f2a3b58-b4d4-494f-9bcb-0d735cffedf6/uploaded_image_1_1766215848572.png)
````

---

## Root Cause

The catch-all route [webcontainer.$.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/routes/webcontainer.$.tsx) had only a placeholder implementation:
```tsx
function RouteComponent() {
  return <div>Hello "/webcontainer/$"!</div>
}
```

---

## Solution

Implemented a branded, informative error page with:
- **Amber warning icon** indicating a limitation
- **Title/subtitle** explaining the WebContainer limitation
- **Description** of why previews can't work in separate tabs
- **Back to Dashboard button** for easy navigation
- **i18n support** for English and Vietnamese

---

## Files Changed

| File | Change |
|------|--------|
| [webcontainer.$.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/routes/webcontainer.$.tsx) | Replaced placeholder with full error page |
| [en.json](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/i18n/en.json) | Added `webcontainer.notSupported.*` keys |
| [vi.json](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/i18n/vi.json) | Added Vietnamese translations |

---

## Verification

![Fixed Error Page](/Users/apple/.gemini/antigravity/brain/7f2a3b58-b4d4-494f-9bcb-0d735cffedf6/preview_error_page_1766216366444.png)

**Tested:**
- ✅ Navigation to `/webcontainer/connect/*` shows informative page
- ✅ Title, subtitle, description all display correctly
- ✅ "Back to Dashboard" button navigates to `/`
- ✅ No "Cannot GET" errors

![Browser Recording](/Users/apple/.gemini/antigravity/brain/7f2a3b58-b4d4-494f-9bcb-0d735cffedf6/webcontainer_error_page_1766216351212.webp)
