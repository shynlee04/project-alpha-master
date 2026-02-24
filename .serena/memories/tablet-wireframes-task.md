# Tablet Wireframes Task

## Task: Create 11 Tablet Wireframes (768px-1024px)

### Output Directory
`_bmad-output/design/wireframes/tablet/`

### Files to Create
1. `tablet/ide/stack-2/tree-editor.html`
2. `tablet/ide/stack-3/tree-editor-preview.html`
3. `tablet/ide/stack-4/tree-editor-preview-terminal.html`
4. `tablet/notes/stack-2/tree-editor.html`
5. `tablet/notes/stack-3/tree-editor-preview.html`
6. `tablet/knowledge/stack-2/tree-grid.html`
7. `tablet/knowledge/stack-3/tree-preview-chat.html`
8. `tablet/study/stack-2/tree-dashboard.html`
9. `tablet/study/stack-3/dashboard-quiz.html`
10. `tablet/hub/stack-2/projects-grid.html`
11. `tablet/hub/stack-3/projects-stats-activities.html`

### Layout Rules (Tablet - 768px-1024px)
- Header: 44px (compact)
- Sidebar: 48px (collapsed icons only) / 180px (expanded)
- Bottom Nav: 56px (4-5 items, 44px touch targets)
- No empty black spaces
- All panels must have content
- 2-column grid for project cards
- 8-bit design system

### CSS Reference
- Use tokens from `../../../styles/global.css`
- Follow STRICT_LAYOUT_VALIDATION.md rules
- Use CSS variables for consistent theming

### Validation Checklist
- [ ] app-container has height: 100vh; width: 100vw
- [ ] main-content has flex: 1; min-height: 0; overflow: hidden
- [ ] All panel children have min-height: 0
- [ ] No panel contains only black background
- [ ] Every panel has visible mock content
- [ ] Scrollable areas have content to scroll
- [ ] Bottom nav with 4-5 items (44px touch targets)
- [ ] 2-column grid for project cards
