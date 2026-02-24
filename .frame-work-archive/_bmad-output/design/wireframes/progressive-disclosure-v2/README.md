# Progressive Disclosure Prototypes - Via-Gent v2.0

**Created:** 2026-01-18  
**Version:** 2.0  
**Purpose:** Demonstrate progressive disclosure UI patterns across all device types, workspaces, and interface configurations

## Overview

This collection of HTML prototypes demonstrates Via-Gent's progressive disclosure strategy - showing only essential information by default while making additional functionality available through deliberate user actions. All prototypes follow the 8-bit design system with zero rounded corners, hard pixel shadows, and high contrast.

## Design System

```css
/* Core Colors */
--canvas: #09090b;
--surface: #18181b;
--primary: #fafafa;
--action: #f97316;

/* Typography */
--ui-font: 'JetBrains Mono', monospace;
--prose-font: 'Geist Sans', sans-serif;

/* 8-bit Styling */
border-radius: 0;
box-shadow: 4px 4px 0px 0px #000;
```

## Folder Structure

```
progressive-disclosure-v2/
├── README.md (this file)
├── desktop/
│   ├── ide/          # 6 IDE configurations (2-5 interfaces)
│   └── notes/        # 3 Notes configurations (2-3 interfaces)
├── tablet/
│   ├── ide/          # 2 IDE configurations (2-3 interfaces)
│   └── notes/        # 2 Notes configurations (2-3 interfaces)
├── phone/
│   └── notes/        # 2 Notes configurations (2 interfaces, AI-first)
└── i18n/
    └── vietnamese/   # 2 Vietnamese translations
```

## Desktop (>1024px)

### IDE Workspace

| File | Interfaces | Description | Use Case |
|------|------------|-------------|----------|
| `ide-2-interfaces.html` | Tree + Editor | Minimalist setup | Quick code edits, focused work |
| `ide-3-interfaces-preview.html` | Tree + Editor + Preview | Standard dev workflow | Web development with live preview |
| `ide-3-interfaces-terminal.html` | Tree + Editor + Terminal | CLI-focused development | Backend development, debugging |
| `ide-3-interfaces-chat.html` | Tree + Editor + Chat | AI pair programming | Collaborative coding with AI assistance |
| `ide-4-interfaces-full.html` | Tree + Editor + Preview + Terminal | Full-stack development | Complete development workflow |
| `ide-5-interfaces-complete.html | Tree + Editor + Preview + Terminal + Chat | Maximum functionality | Power users, complex projects |

**Progressive Disclosure Pattern (IDE):**
1. **Level 1:** File tree (collapsed) + Editor
2. **Level 2:** Expand tree sections, open preview panel
3. **Level 3:** Terminal via `Ctrl+\`` or chat via `Cmd+K`
4. **Level 4:** Multiple panels open simultaneously
5. **Level 5:** All panels visible with custom layout

### Notes Workspace

| File | Interfaces | Description | Use Case |
|------|------------|-------------|----------|
| `notes-2-interfaces.html` | Tree + Editor | Zen mode | Distraction-free writing |
| `notes-3-interfaces-preview.html` | Tree + Editor + Preview | Research mode | Writing with live preview |
| `notes-3-interfaces-chat.html` | Tree + Editor + Chat | AI-assisted writing | Content generation, brainstorming |

**Progressive Disclosure Pattern (Notes):**
1. **Level 1:** Note list + Editor
2. **Level 2:** Expand note list, open preview
3. **Level 3:** Chat panel for AI assistance

## Tablet (768-1023px)

### IDE Workspace

| File | Interfaces | Description | Layout |
|------|------------|-------------|---------|
| `ide-tablet-2-interfaces.html` | Tree + Editor | Compact workspace | Side-by-side split |
| `ide-tablet-3-interfaces.html` | Tree + Editor + Preview | Balanced workflow | Stacked panels |

### Notes Workspace

| File | Interfaces | Description | Layout |
|------|------------|-------------|---------|
| `notes-tablet-2-interfaces.html` | Tree + Editor | Full-width editor | Vertical split |
| `notes-tablet-3-interfaces.html` | Tree + Editor + Chat | Overlay chat | Sheet overlay |

**Progressive Disclosure Pattern (Tablet):**
1. **Level 1:** Single active panel
2. **Level 2:** Second panel via split view
3. **Level 3:** Third panel as overlay/sheet

## Phone Portrait (<768px)

### Notes Workspace Only

| File | Interfaces | Description | Interaction |
|------|------------|-------------|-------------|
| `notes-phone-2-interfaces.html` | Editor + Tab Nav | Full-screen editor | Bottom tab navigation |
| `notes-phone-ai-first.html` | Tree Drawer + Chat | AI-first workflow | Drawer navigation |

**Progressive Disclosure Pattern (Phone):**
1. **Level 1:** Single full-screen panel
2. **Level 2:** Swipe navigation between panels
3. **Level 3:** Chat/AI drawer from bottom

## Internationalization (i18n)

### Vietnamese (Tiếng Việt)

| File | Description | Notes |
|------|-------------|-------|
| `ide-5-interfaces-vi.html` | Full Vietnamese IDE | All UI elements translated |
| `notes-phone-2-interfaces-vi.html` | Vietnamese phone notes | Mobile-first translations |

## Interaction Patterns

### Keyboard Shortcuts (Desktop)

| Shortcut | Action | Available In |
|----------|--------|--------------|
| `Ctrl+\`` | Toggle Terminal | All IDE configs (3+ interfaces) |
| `Cmd+K` | Open AI Chat | All IDE/Notes configs (3+ interfaces) |
| `Cmd+P` | Command Palette | All configs |
| `Cmd+B` | Toggle Sidebar | All configs |
| `Ctrl+P` | Toggle Preview | Notes configs (3 interfaces) |

### Touch Gestures (Mobile/Tablet)

| Gesture | Action | Available In |
|---------|--------|--------------|
| Swipe Left | Open next panel | Phone/Tablet |
| Swipe Right | Open previous panel | Phone/Tablet |
| Pull Down | Refresh | All configs |
| Long Press | Context menu | All configs |

### Progressive Disclosure Mechanisms

1. **Sidebar Collapsible:** File tree, project list
2. **Panel Toggles:** Preview, Terminal, Chat
3. **Sheet Overlays:** Quick actions, settings
4. **Modal Dialogs:** Complex operations
5. **Context Menus:** Right-click/long-press
6. **Command Palette:** Quick access to all features

## Design Principles

### Visibility
- ✅ Always-visible: Essential controls (file tree, editor, primary actions)
- ✅ On-demand: Secondary panels (preview, terminal, chat)
- ✅ Context-aware: Tools appear when needed (debug toolbar, format options)

### Feedback
- ✅ Visual feedback on all interactions (hover, active, focus states)
- ✅ Clear indication of available functionality (dots, arrows, badges)
- ✅ Confirmation for destructive actions

### Efficiency
- ✅ Keyboard shortcuts for power users
- ✅ Touch gestures for mobile users
- ✅ Command palette for quick access
- ✅ Search/filter in all lists

### Learnability
- ✅ Clear visual hierarchy
- ✅ Consistent interaction patterns
- ✅ Discoverable features through UI cues
- ✅ Keyboard shortcut hints in tooltips

## Technical Notes

- All prototypes are pure HTML/CSS with minimal JavaScript
- No external dependencies (fonts loaded from Google Fonts)
- Responsive design with mobile-first approach
- WCAG AA compliant (4.5:1 contrast ratio)
- Touch targets minimum 44x44px
- No rounded corners (8-bit aesthetic)
- Hard pixel shadows (4px 4px 0px 0px #000)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile Safari: ✅ Full support
- Chrome Mobile: ✅ Full support

## Usage

1. Open any HTML file in a web browser
2. Interact with controls (tabs, buttons, toggles)
3. Resize browser window to test responsive breakpoints
4. Use DevTools to test mobile/tablet views

## Next Steps

After review, these prototypes will inform:
- React component implementation
- Zustand state management design
- TanStack Router route structure
- Tailwind CSS utility classes
- Accessibility audit checklist

---

**For questions or updates, contact:** UX Designer - Via-Gent v2.0 Project
