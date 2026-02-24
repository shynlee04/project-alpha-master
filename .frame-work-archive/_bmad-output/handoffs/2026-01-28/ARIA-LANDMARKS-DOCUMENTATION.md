# ARIA Landmarks Documentation

**Document ID**: UXUI-03-08-LANDMARK-DOC  
**Story**: UXUI-03-08 - Add ARIA Landmarks  
**Date**: 2026-01-28  
**Author**: dev-ext-team-b

---

## Overview

This document describes the ARIA landmark implementation in the WorkspaceLayout component, providing guidance for developers and QA on how to test and maintain accessibility features.

---

## What Are ARIA Landmarks?

ARIA landmarks are semantic regions in a web page that help assistive technologies (like screen readers) identify the structure and purpose of different sections. They allow users to navigate quickly between major content areas.

### Benefits:
- **Screen reader users** can jump directly to specific regions without reading through all content
- **Keyboard users** can navigate efficiently between major page sections
- **Search engines** better understand page structure
- **Developers** have clearer semantic HTML structure

---

## Implemented Landmarks

### 1. Navigation Landmark (`<nav>`)

**Location**: Global Sidebar (leftmost column)

**Implementation**:
```tsx
<nav
  className="workspace-layout__global-sidebar"
  aria-label="Main navigation"
>
  {globalSidebar}
</nav>
```

**Purpose**: Contains the main navigation elements of the application, such as workspace switcher, hub navigation, and primary tool access.

**Screen Reader Announcement**: "Main navigation, navigation landmark"

---

### 2. Main Landmark (`<main>`)

**Location**: Main Content Area (center column)

**Implementation**:
```tsx
<main
  className="workspace-layout__main-content"
  role="main"
  aria-label="Project workspace"
>
  {mainContent}
</main>
```

**Purpose**: Contains the primary content of the application - the notes editor, Monaco IDE, or other main workspace content.

**Screen Reader Announcement**: "Project workspace, main landmark"

**Note**: While `<main>` has an implicit `role="main"`, we explicitly add it for maximum compatibility with older assistive technologies.

---

### 3. Complementary Landmarks (`<aside>`)

**Location**: Plugin Panels (left and right columns)

**Implementation**:
```tsx
<aside
  className="workspace-layout__plugin-left"
  aria-label="Plugin sidebar"
>
  {pluginLeft}
</aside>

<aside
  className="workspace-layout__plugin-right"
  aria-label="Plugin sidebar"
>
  {pluginRight}
</aside>
```

**Purpose**: Contains supplementary content that supports the main content but can stand alone - plugin panels, tool sidebars, etc.

**Screen Reader Announcement**: "Plugin sidebar, complementary landmark"

**Note**: Both left and right plugin panels share the same aria-label since they serve the same purpose (plugin sidebars) on opposite sides.

---

### 4. Contentinfo Landmark (`<footer>`)

**Location**: Status Bar (bottom row)

**Implementation**:
```tsx
<footer
  className="workspace-layout__status-bar"
  role="contentinfo"
  aria-label="Status bar"
>
  {statusBar}
</footer>
```

**Purpose**: Contains information about the application state - sync status, file info, cursor position, etc.

**Screen Reader Announcement**: "Status bar, content information landmark"

**Note**: While `<footer>` inside a sectioning content element has different semantics, at the layout level it represents the contentinfo landmark for the entire application.

---

## Elements Without Landmarks

The following elements remain as generic `<div>` elements as they don't represent distinct content regions:

- **Activity Bar Left**: Toolbar with action buttons (part of navigation context)
- **Activity Bar Right**: Toolbar with action buttons (part of navigation context)

These are considered part of the navigation flow rather than standalone content regions.

---

## Testing with Screen Readers

### VoiceOver (macOS)

1. **Open Landmarks Rotor**: Press `VO+U` (Control+Option+U)
2. **Navigate Landmarks**: Use Left/Right arrows to find "Landmarks" category
3. **Select Landmark**: Use Up/Down arrows to navigate between landmarks
4. **Jump to Landmark**: Press Enter to focus the selected landmark

**Expected Landmarks List**:
- Main navigation
- Project workspace
- Plugin sidebar (may appear twice if both panels are open)
- Status bar

### NVDA (Windows)

1. **Next Landmark**: Press `D`
2. **Previous Landmark**: Press `Shift+D`
3. **Landmarks List**: Press `NVDA+F7` then select "Landmarks" tab

### JAWS (Windows)

1. **Next Region**: Press `R`
2. **Previous Region**: Press `Shift+R`
3. **Regions List**: Press `JAWS+F7` then select "Regions"

### Narrator (Windows)

1. **Next Landmark**: Press `D`
2. **Previous Landmark**: Press `Shift+D`
3. **Landmarks List**: Press `Caps+F7`

---

## Automated Testing

### Recommended Tests

1. **Landmark Count Test**: Verify the correct number of landmarks are present
2. **Unique Labels Test**: Ensure all landmarks have descriptive labels
3. **Semantic HTML Test**: Verify proper HTML5 elements are used
4. **Role Verification Test**: Confirm explicit roles match implicit semantics

### Example Test (Vitest + Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkspaceLayout } from './WorkspaceLayout';

describe('WorkspaceLayout ARIA Landmarks', () => {
  it('should have navigation landmark for global sidebar', () => {
    render(
      <WorkspaceLayout
        globalSidebar={<div>Sidebar Content</div>}
      />
    );
    const navigation = screen.getByRole('navigation', { name: /main navigation/i });
    expect(navigation).toBeInTheDocument();
  });

  it('should have main landmark for content area', () => {
    render(
      <WorkspaceLayout
        mainContent={<div>Main Content</div>}
      />
    );
    const main = screen.getByRole('main', { name: /project workspace/i });
    expect(main).toBeInTheDocument();
  });

  it('should have complementary landmarks for plugin panels', () => {
    render(
      <WorkspaceLayout
        pluginLeft={<div>Left Plugin</div>}
        pluginRight={<div>Right Plugin</div>}
      />
    );
    const complementary = screen.getAllByRole('complementary', { name: /plugin sidebar/i });
    expect(complementary).toHaveLength(2);
  });

  it('should have contentinfo landmark for status bar', () => {
    render(
      <WorkspaceLayout
        statusBar={<div>Status</div>}
      />
    );
    const contentinfo = screen.getByRole('contentinfo', { name: /status bar/i });
    expect(contentinfo).toBeInTheDocument();
  });
});
```

---

## Maintenance Guidelines

### When Adding New Layout Sections

1. **Consider if it needs a landmark**: Is it a distinct content region that users would want to jump to?
2. **Choose the right element**:
   - Navigation sections → `<nav>`
   - Primary content → `<main>`
   - Side content → `<aside>`
   - Footer info → `<footer>`
   - Search → `<search>` (HTML5)
3. **Always add aria-label**: Even if there's only one landmark of its type, labels help users understand purpose
4. **Keep labels concise**: 2-4 words that clearly describe the region's purpose
5. **Use sentence case**: "Main navigation" not "Main Navigation"

### When Modifying Existing Landmarks

1. **Preserve aria-labels**: Don't remove or change labels without updating documentation
2. **Maintain semantic HTML**: Don't replace `<main>` with `<div role="main">` unless necessary
3. **Test with screen readers**: Verify changes don't break landmark navigation
4. **Update tests**: Ensure automated tests reflect the new structure

---

## Common Pitfalls to Avoid

### ❌ Don't: Multiple Main Landmarks

```tsx
// WRONG - Only one main landmark allowed
<main>Content 1</main>
<main>Content 2</main>
```

### ❌ Don't: Empty Landmarks

```tsx
// WRONG - Landmarks should have content
<nav aria-label="Empty navigation"></nav>
```

### ❌ Don't: Generic Labels

```tsx
// WRONG - Labels should be descriptive
<aside aria-label="Sidebar">...</aside>

// RIGHT
<aside aria-label="File explorer sidebar">...</aside>
```

### ❌ Don't: Redundant Roles

```tsx
// WRONG - nav has implicit navigation role
<nav role="navigation">...</nav>

// RIGHT
<nav aria-label="Main">...</nav>
```

---

## References

- [WCAG 2.1 - Info and Relationships (1.3.1)](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships)
- [WCAG 2.1 - Bypass Blocks (2.4.1)](https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks)
- [ARIA Landmarks Example](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/)
- [HTML5 Sectioning Elements](https://html.spec.whatwg.org/multipage/sections.html)
- [Using ARIA: Roles, States, and Properties](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

---

## Related Documentation

- Story: UXUI-03-08
- Component: `src/presentation/layouts/WorkspaceLayout.tsx`
- Epic: EPIC-UXUI-03 (Plugin Layout)
- UX Specification: `ux-specification/VALIDATION-CHECKLIST.md`

---

**Last Updated**: 2026-01-28  
**Maintainer**: Team B (UX/UI)
