# Story 13-6: Fix Preview in New Tab

**Epic:** 13 - Terminal & Sync Stability  
**Sprint:** 13 - Terminal & Sync Stability  
**Priority:** P1  
**Story Points:** 2  
**Status:** in-progress

---

## User Story

As a **user**,  
I want **to know why the preview might not work in a new tab**,  
So that **I can use the supported preview methods instead of seeing an error**.

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

---

## Implementation Tasks

- [x] T1: Create catch-all route handler for `/webcontainer/$`
- [x] T2: Implement informative page component with i18n
- [x] T3: Add toast notification to PreviewPanel
- [x] T4: Add translations for English and Vietnamese
- [ ] T5: Manual verification

---

## Dev Notes

### Technical Limitation
WebContainer's `forwardPreviewErrors: true` option causes it to proxy preview URLs through the parent origin. However, WebContainers must be booted in the specific window context to function. A new tab cannot serve the preview content.

### Solution
Implemented an informative "Not Supported" page via a generic catch-all route for `/webcontainer/*` to guide users back to the IDE.

### Files Modified
- `src/routes/webcontainer.$.tsx` (NEW)
- `src/components/ide/PreviewPanel/PreviewPanel.tsx` (Toast notification)
- `src/i18n/en.json`
- `src/i18n/vi.json`

---

## Dev Agent Record

**Agent:** Antigravity  
**Date:** 2025-12-20
