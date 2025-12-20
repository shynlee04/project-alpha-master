# Epic 23-2: Initialize ShadcnUI + Theme Configuration

## Story Header
- **Epic:** 23 (UX/UI Modernization)
- **Story:** 23-2
- **Title:** Initialize ShadcnUI + Theme Configuration
- **Priority:** 🟠 P1
- **Points:** 3
- **Status:** backlog → ready-for-dev
- **Created:** 2025-12-20
- **Updated:** 2025-12-20

## User Story
As a **developer**,<br>
I want **ShadcnUI initialized with theme configuration**,<br>
So that **I can use pre-built accessible components for the IDE UI**.

## Acceptance Criteria

### AC-23-2-1: ShadcnUI Initialization
**Given** the project has TailwindCSS 4.x installed<br>
**When** I run the ShadcnUI initialization command<br>
**Then** ShadcnUI is properly configured with:
- `components.json` created in project root
- `@/components/ui` directory structure created
- Required dependencies installed (`@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`)

### AC-23-2-2: Theme Configuration
**Given** ShadcnUI is initialized<br>
**When** I configure the theme<br>
**Then** the theme includes:
- Dark mode as default (matches UX specification)
- Light mode toggle functionality
- CSS variables for theming
- TailwindCSS configuration updated with ShadcnUI theme

### AC-23-2-3: Priority Components Installation
**Given** ShadcnUI is initialized<br>
**When** I install priority components<br>
**Then** the following components are available:
- `button`, `card`, `dialog`, `dropdown-menu`, `tabs`, `scroll-area`
- `resizable`, `tooltip`, `toast`, `sidebar`, `context-menu`
- `input`, `label`, `separator`, `sonner`, `spinner`

### AC-23-2-4: Component Testing
**Given** ShadcnUI components are installed<br>
**When** I test the components<br>
**Then** all components render correctly with:
- Proper styling from TailwindCSS
- Correct dark/light theme application
- No console errors or warnings
- Basic functionality working (buttons clickable, dialogs open/close)

## Tasks

### Task 1: Research ShadcnUI Integration
- [ ] Research ShadcnUI documentation for Vite + React 19 setup
- [ ] Verify compatibility with TailwindCSS 4.x
- [ ] Check for any WebContainer-specific considerations
- [ ] Review UX design specification for theme requirements

### Task 2: Initialize ShadcnUI
- [ ] Run `pnpm dlx shadcn@latest init` command
- [ ] Configure `components.json` with project settings
- [ ] Set up `@/components/ui` directory structure
- [ ] Install required Radix UI dependencies

### Task 3: Configure Theme
- [ ] Set up dark mode as default in `tailwind.config.ts`
- [ ] Add CSS variables for theming in `globals.css`
- [ ] Create theme toggle functionality
- [ ] Test theme switching between dark/light modes

### Task 4: Install Priority Components
- [ ] Install core UI components: `button`, `card`, `dialog`, `dropdown-menu`
- [ ] Install layout components: `tabs`, `scroll-area`, `resizable`, `sidebar`
- [ ] Install utility components: `tooltip`, `toast`, `context-menu`
- [ ] Install form components: `input`, `label`, `separator`
- [ ] Install feedback components: `sonner`, `spinner`

### Task 5: Create Test Component
- [ ] Create `ShadcnTest.tsx` component demonstrating all installed components
- [ ] Add component to barrel export in `src/components/ui/index.ts`
- [ ] Test component rendering and functionality
- [ ] Verify no TypeScript errors

### Task 6: Documentation
- [ ] Update project documentation with ShadcnUI setup instructions
- [ ] Document theme configuration and usage
- [ ] Add component usage examples
- [ ] Update UX design specification references

## Dev Notes

### Architecture Patterns
- Follow existing component structure in `src/components/ui/`
- Use barrel exports pattern for all new components
- Maintain TypeScript interfaces for props
- Follow import order convention (React → third-party → internal → relative)

### Technical Considerations
- ShadcnUI uses Radix UI primitives under the hood
- Components are unstyled by default, styled via TailwindCSS
- Dark mode implementation should use CSS variables for easy theming
- Ensure WebContainer compatibility (no server-side rendering requirements)

### Research Requirements
- ShadcnUI official documentation for React + Vite setup
- TailwindCSS 4.x theming patterns
- Radix UI component APIs and accessibility features
- Dark/light mode implementation best practices

## References
- **Epic 23:** UX/UI Modernization
- **Epic 23-1:** Install TailwindCSS 4.x + Vite Plugin (completed)
- **UX Design Specification:** [_bmad-output/ux-design.md](_bmad-output/ux-design.md)
- **ShadcnUI Documentation:** [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **Radix UI Documentation:** [https://www.radix-ui.com/](https://www.radix-ui.com/)

## Dev Agent Record

**Agent:** (to be filled by dev agent)
**Session:** (to be filled by dev agent)

### Task Progress:
- [ ] T1: Research ShadcnUI Integration
- [ ] T2: Initialize ShadcnUI
- [ ] T3: Configure Theme
- [ ] T4: Install Priority Components
- [ ] T5: Create Test Component
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
1. **Immediate:** Dev agent to implement Story 23-2
2. **After Implementation:** Code review and testing
3. **After Approval:** Proceed to Story 23-3 (Layout Components Migration)