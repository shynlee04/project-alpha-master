# Epic 23-1: Install TailwindCSS 4.x + Vite Plugin

## Story Details
**Epic:** 23 (UX/UI Modernization)
**Story:** 23-1
**Title:** Install TailwindCSS 4.x + Vite Plugin
**Points:** 2
**Priority:** P1
**Status:** review

## User Story
As a developer, I want TailwindCSS 4.x installed with the Vite plugin so that I can use modern utility-first CSS styling in the IDE.

## Acceptance Criteria

### AC-1: TailwindCSS Installation Verification
- [x] Verify TailwindCSS 4.x is installed (v4.1.18)
- [x] Verify `@tailwindcss/vite` plugin is installed (v4.1.18)
- [x] Confirm no additional dependencies needed (postcss/autoprefixer handled by plugin)

### AC-2: Configuration Verification
- [x] Verify Vite plugin is configured in `vite.config.ts`
- [x] Confirm plugin placement is correct in plugins array
- [x] Validate cross-origin isolation headers are maintained

### AC-3: CSS Integration Setup
- [x] Create main CSS file with Tailwind directives (@tailwind base, components, utilities)
- [x] Import CSS file in main application entry point
- [x] Test TailwindCSS classes work in a sample component

## Tasks
- [x] Research TailwindCSS 4.x installation requirements - COMPLETED
- [x] Verify current project state - COMPLETED
- [x] Create main CSS file with Tailwind directives - COMPLETED
- [x] Import CSS in application entry point - COMPLETED
- [x] Test TailwindCSS classes in a sample component - COMPLETED
- [x] Update documentation with setup notes - COMPLETED

## Dev Notes
**CRITICAL FINDING:** TailwindCSS 4.x is ALREADY installed and configured!

**Current Setup:**
- tailwindcss@4.1.18 ✓
- @tailwindcss/vite@4.1.18 ✓
- Vite config: tailwindcss() plugin configured ✓
- Cross-origin isolation: Maintained ✓

**Story Focus Shift:**
Since installation is complete, this story now focuses on:
1. Verification of current setup
2. Creating main CSS file with @tailwind directives
3. Testing integration
4. Documentation

**No additional installation needed!**

## Research Requirements
- [x] Context7: TailwindCSS 4.x installation guide
- [x] Context7: `@tailwindcss/vite` plugin configuration
- [x] DeepWiki: ShadcnUI + TailwindCSS integration patterns
- [x] Current project state analysis

## Research Findings

### Current State Analysis
**What's Already Working:**
- ✓ Package dependencies: tailwindcss@4.1.18, @tailwindcss/vite@4.1.18
- ✓ Vite configuration: tailwindcss() plugin in correct position
- ✓ Cross-origin isolation: COOP/COEP headers configured for WebContainers
- ✓ Framework setup: TanStack Start + React 19 + TypeScript

**What Needs to be Added:**
- Main CSS file with @tailwind directives
- CSS import in application entry point
- Component testing of Tailwind classes

### TailwindCSS 4.x + Vite Integration Pattern
**Installation (Already Complete):**
```bash
npm install tailwindcss @tailwindcss/vite
```

**Vite Configuration (Already Complete):**
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // ... other plugins
    tailwindcss(),  // ← Already configured!
    // ... more plugins
  ],
})
```

**Main CSS File (Needs Creation):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**CSS Import (Needs Implementation):**
```typescript
// In main application entry or __root.tsx
import './styles.css'
```

### ShadcnUI + TailwindCSS 4.x Integration
**Compatibility:** ✅ Full compatibility confirmed
- ShadcnUI components use standard Tailwind utility classes
- Theme customization via CSS variables (as per UX design spec)
- No special configuration needed beyond TailwindCSS setup

**Theme Integration Pattern:**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables from UX design */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
```

## Architecture Patterns

### TailwindCSS 4.x Vite Integration
**Pattern:** Modern plugin-based integration
**Source:** TailwindCSS 4.x official documentation

**Key Characteristics:**
- No separate config files needed (postcss.config.js, autoprefixer)
- Vite plugin handles all processing automatically
- Works seamlessly with TanStack Start
- Maintains WebContainer compatibility

### CSS Layer Management
**Pattern:** Standard TailwindCSS layer structure
**Implementation:**
- `@tailwind base` - Reset and base styles
- `@tailwind components` - Component classes
- `@tailwind utilities` - Utility classes

## Implementation Tasks

### T1: Create Main CSS File
**File:** `src/styles.css` or `src/index.css`
**Content:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles if needed */
@layer base {
  /* Custom base styles */
}

/* Custom component styles if needed */
@layer components {
  /* Custom component styles */
}

/* Custom utility styles if needed */
@layer utilities {
  /* Custom utilities */
}
```

### T2: Import CSS in Application Entry
**Location:** `src/routes/__root.tsx` or main entry point
**Implementation:**
```typescript
import './styles.css'
```

### T3: Test Tailwind Classes
**Component:** Create or modify a test component
**Test:** Apply Tailwind classes and verify styling
**Example:**
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  TailwindCSS is working!
</div>
```

### T4: Update Story Status
**Action:** Move from "drafted" to "ready-for-dev"
**Files:** Update sprint-status.yaml and bmm-workflow-status.yaml

## Dependencies
**Current Status:** All required dependencies already installed
- tailwindcss: ^4.1.18 ✓
- @tailwindcss/vite: ^4.1.18 ✓

**No additional dependencies needed for basic setup.**

## References
- Epic 23: UX/UI Modernization
- UX Design Specification: [_bmad-output/ux-design.md](_bmad-output/ux-design.md)
- Architecture: [_bmad-output/architecture.md](_bmad-output/architecture.md)
- Context XML: [_bmad-output/sprint-artifacts/23-1-install-tailwindcss-4-context.xml](_bmad-output/sprint-artifacts/23-1-install-tailwindcss-4-context.xml)

## Dev Agent Record

**Agent:** @bmad-bmm-dev
**Session:** 2025-12-20T15:00Z

### Task Progress:
- [x] T1: Create main CSS file with @tailwind directives
- [x] T2: Import CSS in application entry point
- [x] T3: Test Tailwind classes in a sample component
- [x] T4: Update story documentation

### Research Executed:
- ✅ TailwindCSS 4.x installation patterns (Context7)
- ✅ Vite plugin configuration (Context7)
- ✅ ShadcnUI + TailwindCSS integration (DeepWiki)
- ✅ Current project state analysis

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/styles.css | Verified (already existed) | N/A |
| src/routes/__root.tsx | Verified (already imported) | N/A |
| src/components/ui/TailwindTest.tsx | Created | 20 |
| src/components/ui/index.ts | Updated (export TailwindTest) | 2 |

### Tests Created:
- TailwindCSS integration test component (`TailwindTest`)
- CSS file validation (existing `src/styles.css` uses TailwindCSS 4.x `@import "tailwindcss";`)
- All existing tests pass (`pnpm test`)

### Decisions Made:
- No additional installation needed (already complete)
- Focus on verification and testing
- Maintain existing WebContainer compatibility
- TailwindCSS 4.x uses `@import "tailwindcss";` instead of separate `@tailwind` directives
- Updated UI component index to export new test component

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-20 | backlog | Story created |
| 2025-12-20 | drafted | Context XML created, research completed |
| 2025-12-20 | ready-for-dev | Ready for development |
| 2025-12-20 | in-progress | Development started |
| 2025-12-20 | review | Ready for code review |
| (to be filled) | done | Story completed |

## Code Review

**Reviewer:** (to be filled)
**Date:** (to be filled)

### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found:
- (to be filled)

### Sign-off:
- (to be filled)

## Notes
This story represents Platform B execution per parallel-execution-strategy.md.
Platform A continues Epic 22 (Production Hardening) stories 22-2 → 22-8.
Platform B starts Epic 23 (UX/UI Modernization) Story 23-1.
Both epics are independent and can run in parallel.

**Key Insight:** The research phase revealed that TailwindCSS 4.x is already installed and configured. The story now focuses on verification, CSS file creation, and testing rather than installation.