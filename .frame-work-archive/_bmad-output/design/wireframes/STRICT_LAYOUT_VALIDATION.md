# STRICT Layout Validation Rules for Wireframes

**Purpose**: Prevent empty black spaces, broken layouts, and non-functional UI

---

## CRITICAL Rules (FAIL if violated)

### 1. Container Must Fill Viewport
```css
/* ✅ CORRECT */
.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

/* ❌ WRONG - Missing viewport dimensions */
.app-container {
  display: flex;
  flex-direction: column;
}
```

### 2. Main Content Must Fill Remaining Space
```css
/* ✅ CORRECT */
.main-content {
  flex: 1;              /* Takes remaining height */
  display: flex;        /* Horizontal layout */
  overflow: hidden;     /* No scroll on container */
  min-height: 0;        /* CRITICAL: Allows children to shrink */
}

/* ❌ WRONG - No flex:1 or min-height:0 */
.main-content {
  display: flex;
  /* Will overflow or create empty space */
}
```

### 3. Panel Children Must Have min-height: 0
```css
/* ✅ CORRECT */
.panel {
  flex: 1;
  min-height: 0;        /* CRITICAL: Allows shrinking */
  overflow: hidden;     /* Internal scrolling */
  display: flex;
  flex-direction: column;
}

/* ❌ WRONG - Missing min-height:0 */
.panel {
  flex: 1;
  /* Will cause empty space or overflow */
}
```

### 4. All Panels Must Have Content (NO EMPTY BLACK SQUARES)
```css
/* ✅ CORRECT - Panel has content */
.preview-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.preview-panel .browser-mock {
  padding: 16px;
  background: #fff;  /* Has visible content */
}

/* ❌ WRONG - Empty black panel */
.preview-panel {
  flex: 1;
  background: #000;  /* Just black, no content */
}
```

### 5. Scrollable Areas Must Have Explicit Content
```css
/* ✅ CORRECT - Has content to scroll */
.tree-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.tree-content .tree-item {
  padding: 4px 12px;
  /* Multiple tree items ensure scrollable area has content */
}

/* ❌ WRONG - Empty scroll area */
.tree-content {
  flex: 1;
  overflow-y: auto;
  /* No items inside */
}
```

---

## Layout Structure Rules

### Horizontal Layout (Desktop - Multiple Panels)
```css
/* ✅ CORRECT - Panel + Resizable Handle + Panel */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.left-panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: var(--structural);
}

.right-panel {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}
```

### Vertical Layout (Editor + Terminal)
```css
/* ✅ CORRECT - Editor on top, Terminal below */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.editor {
  flex: 1;
  min-height: 100px;  /* Minimum visible area */
}

.terminal {
  height: 200px;
  flex-shrink: 0;     /* Don't shrink below this */
}

.resize-handle {
  height: 4px;
  cursor: row-resize;
}
```

---

## Viewport Height Calculations

### Desktop (1920x1080)
```
Header: 48px (fixed)
Main Content: 100vh - 48px - 24px = 1008px
Footer: 24px (fixed)
```

### Main Content Breakdown (3 panels)
```
Tree Panel: 220px
Resize Handle: 4px
Editor Panel: 1fr (flex)
Resize Handle: 4px  
Preview Panel: 35% of remaining
```

**Total must equal: 100%**

---

## No Empty States Allowed

### ❌ UNACCEPTABLE Patterns

1. **Giant Black Rectangle**
```css
.empty-panel {
  background: #000;
  /* No content inside */
}
```

2. **Placeholder with No Content**
```html
<div class="panel">
  <!-- Nothing here -->
</div>
```

3. **Invisible Scroll Area**
```css
.scroll-area {
  overflow: auto;
  /* Empty - no items to scroll */
}
```

### ✅ ACCEPTABLE Patterns

1. **Mock Browser Frame**
```html
<div class="preview-panel">
  <div class="browser-mock">
    <div class="browser-toolbar">...</div>
    <div class="browser-content">
      <h1>Welcome</h1>
      <p>App content here...</p>
    </div>
  </div>
</div>
```

2. **Code Editor with Syntax Highlighting**
```html
<div class="editor">
  <div class="tab-bar">...</div>
  <div class="code-area">
    <span class="keyword">import</span>
    <span class="variable">React</span>
    ...
  </div>
</div>
```

3. **File Tree with Items**
```html
<div class="tree-content">
  <div class="tree-item">📁 src</div>
  <div class="tree-item">📁 components</div>
  <div class="tree-item selected">📄 App.tsx</div>
</div>
```

---

## Responsive Behavior

### Tablet (768px - 1024px)
- Sidebar may collapse to icons only
- Panels adjust proportionally
- Preview may hide or become toggle

### Mobile (< 768px)
- Single panel visible at a time
- Tab/bottom navigation
- No resizable handles

---

## Validation Checklist (MUST PASS)

### Before Committing Any Wireframe:

- [ ] `app-container` has `height: 100vh; width: 100vw`
- [ ] `main-content` has `flex: 1; min-height: 0; overflow: hidden`
- [ ] All panel children have `min-height: 0`
- [ ] No panel contains only black background
- [ ] Every panel has visible mock content
- [ ] Scrollable areas have content to scroll
- [ ] Heights calculate correctly (100vh - header - footer)
- [ ] No fixed heights that overflow viewport
- [ ] Resizable handles have cursor: col-resize/row-resize
- [ ] Flex items use `flex-shrink: 0` for fixed-width panels
- [ ] Content is realistic (not lorem ipsum)

---

## Common Fixes

### Problem: Empty black space between panels
**Cause**: Missing `flex: 1` or `min-height: 0`
**Fix**:
```css
.panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
```

### Problem: Panel overflows instead of scrolling
**Cause**: Missing `overflow: hidden` on container
**Fix**:
```css
.main-content {
  overflow: hidden;
}

.scroll-panel {
  overflow: auto;
}
```

### Problem: Fixed height creates empty space
**Cause**: Hard-coded height that doesn't match content
**Fix**:
```css
/* Use flex instead of fixed height */
.panel {
  flex: 1;
  min-height: 100px;  /* Minimum, not fixed */
}
```

---

## File Naming Convention for Fixed Files

When fixing wireframes, append `-fixed` to indicate corrected version:
- `tree-editor-preview.html` → Already exists (needs fixing)
- `tree-editor-preview-fixed.html` → Fixed version

After validation passes, rename `-fixed` to original name.
