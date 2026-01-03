# STORY-005: Implement useTheme Hook

---

## Story Information

| Field | Value |
|-------|-------|
| **ID** | LT-1.5 |
| **Title** | Implement useTheme Hook |
| **Priority** | P0 |
| **Estimation** | 6 hours |
| **Sprint** | LT-2026-01-03 |
| **Week** | 1 |
| **Assignee** | dev |
| **Status** | drafted |

---

## Description

Create a custom React hook `src/lib/hooks/use-theme.ts` that provides theme state management including:
- Theme mode tracking (light/dark/system)
- Theme persistence to localStorage
- System preference detection
- Theme class application to document root

**User Story Format**:
```
As a React developer
I want a custom hook to manage theme state
So that components can access and change the theme
```

---

## Background

This story builds upon LT-1.4 (TypeScript theme types) and provides the core hook that will be used by ThemeProvider components and React components that need to interact with the theme system.

**Related Stories**:
- Depends on: LT-1.4 - Create TypeScript theme types ✅ (COMPLETE)
- Blocks: LT-1.6 - Create ThemeProvider component

**Design References**:
- `light-theme-developer-handoff-part1-2026-01-03.md` (Section 4.1)
- `light-theme-design-system-foundation-2026-01-03.md` (Theme System Architecture)

---

## Acceptance Criteria

### Functional Requirements

1. **AC-1**: Hook file created at `src/lib/hooks/use-theme.ts`
   - **Given** the file exists
   - **When** a component imports useTheme
   - **Then** the hook is available for use

2. **AC-2**: Hook returns `({ theme, setTheme, resolvedTheme, toggleTheme })`
   - **Given** the hook is called
   - **When** a component accesses the return value
   - **Then** all four properties are available with correct types

3. **AC-3**: Theme persists to localStorage with key 'via-gent-theme'
   - **Given** user changes theme
   - **When** page is refreshed
   - **Then** theme preference is restored

4. **AC-4**: System preference detection working when theme='system'
   - **Given** theme is set to 'system'
   - **When** OS theme preference changes
   - **Then** resolvedTheme matches OS preference

5. **AC-5**: Theme class (`light`/`dark`) applied to `document.documentElement`
   - **Given** a theme is set
   - **When** the theme changes
   - **Then** document root has the correct class applied

6. **AC-6**: Zero TypeScript errors
   - **Given** the hook is implemented
   - **When** `pnpm tsc --noEmit` is run
   - **Then** zero errors are reported

### Design Requirements

- [ ] Design tokens applied correctly
- [ ] Colors match specification
- [ ] Typography follows design system
- [ ] Spacing consistent with system
- [ ] Visual hierarchy maintained

### Accessibility Requirements

- [ ] WCAG 2.1 AA contrast ratios met
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Focus indicators visible
- [ ] Reduced motion respected
- [ ] Color not used as only visual means

### Testing Requirements

- [ ] Unit tests written
- [ ] Unit tests passing
- [ ] Accessibility tests passing
- [ ] Integration tests (if applicable)
- [ ] Test coverage >80%

### Documentation Requirements

- [ ] Code comments updated
- [ ] README updated (if needed)
- [ ] API documentation updated (if applicable)
- [ ] Design token documentation updated

---

## Definition of Done

- [ ] Code implemented and reviewed
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Design tokens applied correctly
- [ ] Light theme variant working
- [ ] Accessibility compliance verified
- [ ] Documentation updated
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Peer review approved
- [ ] Merged to main branch
- [ ] Deployed to staging (if applicable)

---

## Technical Notes

### Implementation Approach

Create a React hook that manages theme state with:
- useState for theme mode tracking
- useEffect for system preference detection
- useEffect for localStorage persistence
- useEffect for DOM class application

**File Changes**:
- Create: `src/lib/hooks/use-theme.ts`
- Modify: None

**Key Components**:
1. **getSystemTheme()**: Detect OS theme preference using matchMedia
2. **getStoredTheme()**: Read from localStorage with error handling
3. **saveTheme()**: Write to localStorage with error handling
4. **useTheme()**: Main hook returning theme state and actions

**CSS Custom Properties**:
```
--theme: 'light' | 'dark';
```

**TypeScript Types**:
```typescript
import { ThemeMode, ResolvedTheme, ThemeContextValue } from '@/types/theme';
```

### Design Tokens

[No design tokens used in this story - this is infrastructure code.]

### Dependencies

**Internal Dependencies**:
- src/types/theme.ts: Type definitions (LT-1.4)

**External Dependencies**:
- react: useState, useEffect hooks
- None else needed

### Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| localStorage unavailable | Medium | Low | Graceful fallback to default theme |
| System preference not detected | Low | Low | Default to 'dark' if detection fails |
| Hydration mismatch (SSR) | Medium | Low | Check `typeof window !== 'undefined'` |

---

## Implementation Checklist

### Phase 1: Research and Planning
- [x] Read story and acceptance criteria
- [ ] Review design handoff document
- [ ] Analyze existing theme implementation patterns
- [ ] Create implementation plan
- [ ] Identify dependencies

### Phase 2: Implementation
- [ ] Create `src/lib/hooks/use-theme.ts` file
- [ ] Implement `getSystemTheme()` helper
- [ ] Implement `getStoredTheme()` helper
- [ ] Implement `saveTheme()` helper with error handling
- [ ] Implement `useTheme()` hook with useState + useEffect
- [ ] Add system preference change listener
- [ ] Create `toggleTheme()` helper

### Phase 3: Testing
- [ ] Test theme switching manually
- [ ] Test persistence (refresh page)
- [ ] Test system preference detection
- [ ] Verify class application in DOM
- [ ] Run `pnpm tsc --noEmit`

### Phase 4: Review and Polish
- [ ] Self-review code
- [ ] Run linting
- [ ] Run type checking
- [ ] Update documentation
- [ ] Submit for review

---

## Task Breakdown

- [ ] **T1**: Create `src/lib/hooks/use-theme.ts` file
- [ ] **T2**: Implement `getSystemTheme()` helper using window.matchMedia
- [ ] **T3**: Implement `getStoredTheme()` helper with localStorage handling
- [ ] **T4**: Implement `saveTheme()` helper with error handling
- [ ] **T5**: Implement `useTheme()` hook with useState for theme state
- [ ] **T6**: Add useEffect to apply class to document.documentElement
- [ ] **T7**: Add useEffect to listen for system preference changes
- [ ] **T8**: Create `toggleTheme()` helper function
- [ ] **T9**: Test theme switching manually (light ⇄ dark ⇄ system)
- [ ] **T10**: Test persistence by refreshing page
- [ ] **T11**: Test system preference detection (change OS theme)
- [ ] **T12**: Run `pnpm tsc --noEmit` to verify no TypeScript errors

---

## Research Requirements

### Context7 Research (TypeScript/React Hooks)
- Query: React hooks best practices for theme management
- Query: localStorage error handling patterns in TypeScript

### DeepWiki Research
- Query: next-themes hook implementation patterns

---

## Dev Notes

Reference: `light-theme-developer-handoff-part1-2026-01-03.md` (Section 4.1)

**Key Implementation Details**:
- SSR safety: Check `typeof window !== 'undefined'` before accessing window APIs
- Use `useEffect` with dependency array `[theme]` for class application
- Use `matchMedia` for system preference detection
- Handle localStorage quota errors gracefully
- Default theme: 'dark' for backwards compatibility

**LocalStorage Key**: `'via-gent-theme'`

**Pattern**:
```typescript
import { useState, useEffect } from 'react';
import type { ThemeMode, ResolvedTheme } from '@/types/theme';

const STORAGE_KEY = 'via-gent-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    return localStorage.getItem(STORAGE_KEY) as ThemeMode || 'dark';
  } catch {
    return 'dark';
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Apply class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      setResolvedTheme(getSystemTheme());
      root.classList.add(resolvedTheme);
    } else {
      setResolvedTheme(theme as ResolvedTheme);
      root.classList.add(theme);
    }
  }, [theme, resolvedTheme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme,
  };
}
```

---

## Notes

### Open Questions

1. **Question**: Should we use useSyncExternalStore for system preference detection?
   - **Answer**: Pending React 18+ adoption - can add as enhancement later

### Implementation Notes

- Always use SSR guards (`typeof window !== 'undefined'`) before accessing window APIs
- localStorage errors should be logged but not crash the application
- Default to 'dark' theme for backwards compatibility with existing codebase
- The hook should be callable multiple times from different components

### Lessons Learned

- Store theme in localStorage immediately via setTheme helper
- No blocking on hydration - use pattern that works on both client and server

---

## Review History

| Date | Reviewer | Status | Comments |
|------|----------|--------|----------|
| | | | |

---

## Completion Record

| Field | Value |
|-------|-------|
| **Started** | |
| **Completed** | |
| **Actual Hours** | |
| **Code Reviewer** | |
| **Merged Date** | |

---

**Document Version**: 1.0
**Created**: 2026-01-03
**Last Updated**: 2026-01-03
**Author**: BMAD System (SM Agent)