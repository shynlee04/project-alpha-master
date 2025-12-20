# Epic 23-3: Migrate Layout Components (Header, Panels)

## Story Header
- **Epic:** 23 (UX/UI Modernization)
- **Story:** 23-3
- **Title:** Migrate Layout Components (Header, Panels)
- **Priority:** 🟠 P1
- **Points:** 5
- **Status:** backlog → ready-for-dev
- **Created:** 2025-12-20
- **Updated:** 2025-12-20

## User Story
As a **developer**,<br>
I want **the IDE layout components migrated to ShadcnUI**,<br>
So that **the IDE has a consistent, modern UI with improved accessibility and theming support**.

## Acceptance Criteria

### AC-23-3-1: Header Component Migration
**Given** ShadcnUI is initialized with theme configuration<br>
**When** I migrate the IDE header component<br>
**Then** the header includes:
- ShadcnUI-based navigation with proper theming
- Language switcher integrated with ShadcnUI dropdown
- Responsive design using ShadcnUI layout primitives
- Dark/light mode toggle functionality

### AC-23-3-2: Panel Layout Migration
**Given** ShadcnUI components are available<br>
**When** I migrate the IDE panel layout<br>
**Then** the layout includes:
- Resizable panels using ShadcnUI resizable component
- Proper spacing and padding using TailwindCSS classes
- Panel headers with ShadcnUI card components
- Consistent theming across all panels

### AC-23-3-3: Component Integration
**Given** Layout components are migrated<br>
**When** I integrate them with existing IDE functionality<br>
**Then** all components:
- Maintain existing functionality (file tree, editor, terminal)
- Support theme switching without breaking
- Have proper TypeScript typing
- Follow ShadcnUI accessibility standards

### AC-23-3-4: Testing and Validation
**Given** Migrated layout components<br>
**When** I test the components<br>
**Then** all components:
- Render correctly in both dark and light modes
- Maintain responsive behavior
- Have no console errors or warnings
- Pass accessibility checks (WCAG AA)

## Tasks

### Task 1: Research Layout Migration Patterns
- [ ] Research ShadcnUI layout component patterns
- [ ] Review existing IDE layout structure
- [ ] Identify migration approach for Header component
- [ ] Identify migration approach for Panel components
- [ ] Review UX design specification for layout requirements

### Task 2: Migrate Header Component
- [ ] Create new Header component using ShadcnUI
- [ ] Integrate language switcher with ShadcnUI dropdown
- [ ] Add theme toggle functionality
- [ ] Implement responsive navigation
- [ ] Update header styling with TailwindCSS

### Task 3: Migrate Panel Layout Components
- [ ] Create resizable panel layout using ShadcnUI resizable
- [ ] Migrate IDELayout component to use ShadcnUI primitives
- [ ] Update panel headers with ShadcnUI card components
- [ ] Ensure proper spacing and theming
- [ ] Test panel resizing functionality

### Task 4: Integrate with Existing Components
- [ ] Connect migrated layout to existing IDE components
- [ ] Ensure FileTree works with new layout
- [ ] Verify MonacoEditor integration
- [ ] Test Terminal panel functionality
- [ ] Check Preview panel compatibility

### Task 5: Testing and Quality Assurance
- [ ] Create comprehensive test cases for layout components
- [ ] Test theme switching functionality
- [ ] Verify responsive behavior
- [ ] Run accessibility checks
- [ ] Test cross-browser compatibility

### Task 6: Documentation
- [ ] Update component documentation
- [ ] Add migration notes for future reference
- [ ] Document theming approach
- [ ] Add usage examples

## Dev Notes

### Architecture Patterns
- Follow ShadcnUI component structure patterns
- Use TailwindCSS for styling with ShadcnUI primitives
- Maintain existing component organization (layout/, ide/, ui/)
- Use barrel exports pattern for all new components

### Technical Considerations
- ShadcnUI components are unstyled by default
- Use TailwindCSS classes for custom styling
- Ensure proper TypeScript interfaces for props
- Maintain backward compatibility where possible
- Follow import order convention

### Research Requirements
- ShadcnUI layout component documentation
- TailwindCSS 4.x responsive design patterns
- ShadcnUI resizable component API
- Accessibility best practices for layout components
- Theme integration patterns

## References
- **Epic 23:** UX/UI Modernization
- **Epic 23-1:** Install TailwindCSS 4.x + Vite Plugin (completed)
- **Epic 23-2:** Initialize ShadcnUI + Theme Configuration (completed)
- **UX Design Specification:** [_bmad-output/ux-design.md](_bmad-output/ux-design.md)
- **ShadcnUI Documentation:** [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **TailwindCSS Documentation:** [https://tailwindcss.com/](https://tailwindcss.com/)

## Dev Agent Record

**Agent:** (to be filled by dev agent)
**Session:** (to be filled by dev agent)

### Task Progress:
- [ ] T1: Research Layout Migration Patterns
- [ ] T2: Migrate Header Component
- [ ] T3: Migrate Panel Layout Components
- [ ] T4: Integrate with Existing Components
- [ ] T5: Testing and Quality Assurance
- [ ] T6: Documentation

### Research Executed:
- (to be filled by dev agent)

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| (to be filled by dev agent) | | |

### Tests Created:
- (to be filled by dev agent)

### Decisions Made:
- (to be filled by dev agent)

## Code Review

**Reviewer:** (to be filled by code reviewer)
**Date:** (to be filled by code reviewer)

### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found:
- (to be filled by code reviewer)

### Sign-off:
❌ Pending code review

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-20 | backlog | Story created |
| 2025-12-20 | ready-for-dev | Requirements finalized, context prepared |

## Next Steps
1. **Immediate:** Dev agent to implement Story 23-3
2. **After Implementation:** Code review and testing
3. **After Approval:** Proceed to Story 23-4 (IDE Panel Components Migration)