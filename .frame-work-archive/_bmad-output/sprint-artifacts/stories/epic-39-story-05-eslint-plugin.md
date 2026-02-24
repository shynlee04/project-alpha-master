# Story: EPIC-39-05 - ESLint Plugin for 8-bit Design Enforcement

**Epic:** EPIC-39 (8-bit Design Compliance)
**Story ID:** 39-05
**Priority:** P1
**Effort:** 2h
**Points:** 3
**Status:** drafted
**Created:** 2026-01-09
**Dependencies:** 39-01, 39-02, 39-03, 39-04

---

## User Story

**As a** developer  
**I want** automated enforcement of 8-bit design rules via ESLint  
**So that** the codebase remains compliant after the initial remediation and future contributions don't introduce violations

---

## Background

### Context from Previous Work

1. **Stories 39-01 through 39-04 Completed:**
   - 39-01: Removed transparency from Agent Selectors
   - 39-02: Removed transparency from Chat Components
   - 39-03: Replaced rounded corners with squared (8-bit)
   - 39-04: Removed blur effects from Hero/Onboarding

2. **Why ESLint Enforcement is Critical:**
   - Manual remediation is time-consuming (13+ hours for initial fix)
   - New contributions could reintroduce violations
   - CSS/Tailwind classes are easy to miss in code review
   - Automated enforcement prevents regression

### Target Violations to Detect

| Rule ID | Violation | Examples |
|---------|-----------|----------|
| `8bit/no-transparency` | Opacity modifiers on interactive elements | `bg-slate-800/60`, `opacity-50`, `/80` |
| `8bit/no-large-radius` | Large border radius values | `rounded-lg`, `rounded-xl`, `rounded-2xl` |
| `8bit/no-blur` | Blur effects | `blur-[*]`, `backdrop-blur-*`, `blur-md` |

---

## Acceptance Criteria

### AC-01: ESLint Plugin Structure
- [ ] Create `eslint-plugin-8bit-design/` directory
- [ ] Package exports 3 rules: `no-transparency`, `no-large-radius`, `no-blur`
- [ ] Plugin compatible with ESLint 8.x and 9.x
- [ ] Plugin includes TypeScript type definitions

### AC-02: Rule - no-transparency
- [ ] Detects Tailwind opacity modifiers on background colors
- [ ] Detects `opacity-*` utility classes on interactive elements
- [ ] Detects `/60`, `/80`, `/50`, `/40` patterns in class strings
- [ ] Provides autofix for common patterns
- [ ] Has clear error message: "Use solid colors instead of transparency"

### AC-03: Rule - no-large-radius
- [ ] Detects `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- [ ] Detects `rounded-[1rem]`, `rounded-[16px]` above threshold
- [ ] Allows `rounded-none`, `rounded-[2px]`, `rounded-[4px]`
- [ ] Provides autofix to replace with `rounded-none`
- [ ] Has clear error message: "8-bit design requires squared corners (rounded-none or max 4px)"

### AC-04: Rule - no-blur
- [ ] Detects `blur-[*]`, `blur-md`, `blur-lg`, `blur-xl`
- [ ] Detects `backdrop-blur-*` classes
- [ ] Allows `blur-0` or explicit `blur-none`
- [ ] Provides autofix to remove blur effects
- [ ] Has clear error message: "Blur effects are not allowed in 8-bit design"

### AC-05: Configuration and Integration
- [ ] Plugin exports shared config `8bit/recommended`
- [ ] Config enables all 3 rules with appropriate severity
- [ ] `.eslintrc.cjs` or `eslint.config.mjs` includes plugin
- [ ] CI pipeline fails on new violations

### AC-06: Testing
- [ ] Unit tests for each rule with valid/invalid code samples
- [ ] Test coverage ≥80% for each rule
- [ ] Tests verify autofix output
- [ ] All tests pass

### AC-07: Documentation
- [ ] README.md explains each rule and its rationale
- [ ] Examples of violating code and fixed code
- [ ] Installation and configuration instructions
- [ ] Changelog with version 1.0.0

---

## Tasks

- [ ] **T1: Create plugin directory structure**
  - `eslint-plugin-8bit-design/`
  - `lib/rules/`
  - `tests/lib/rules/`
  - `package.json`
- [ ] **T2: Implement no-transparency rule**
  - Create regex patterns for opacity modifiers
  - Implement rule logic
  - Add autofix capability
- [ ] **T3: Implement no-large-radius rule**
  - Create patterns for rounded-* classes
  - Implement rule logic
  - Add autofix capability
- [ ] **T4: Implement no-blur rule**
  - Create patterns for blur classes
  - Implement rule logic
  - Add autofix capability
- [ ] **T5: Create shared config**
  - Export recommended config
  - Include type definitions
- [ ] **T6: Add tests**
  - Test each rule with invalid examples
  - Test autofix output
  - Achieve ≥80% coverage
- [ ] **T7: Update project ESLint config**
  - Add plugin to eslint.config.mjs
  - Configure rules
- [ ] **T8: Run full test suite**
  - Verify all existing tests pass
  - Verify new plugin tests pass
- [ ] **T9: Code review**
  - Self-review against ACs
  - Request formal review

---

## Technical Implementation

### Plugin Structure

```
eslint-plugin-8bit-design/
├── package.json
├── tsconfig.json
├── lib/
│   ├── index.ts           # Plugin entry, exports rules and configs
│   └── rules/
│       ├── no-transparency.ts
│       ├── no-large-radius.ts
│       └── no-blur.ts
└── tests/
    └── lib/
        └── rules/
            ├── no-transparency.test.ts
            ├── no-large-radius.test.ts
            └── no-blur.test.ts
```

### Example Rule Implementation (no-transparency)

```typescript
// lib/rules/no-transparency.ts
import { Rule } from 'eslint'
import { TSESTree } from '@typescript-eslint/types'

export const noTransparency: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow transparency on interactive elements',
      category: 'Design',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noTransparency: 'Use solid colors instead of transparency on interactive elements',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        // Detect bg-*/XX patterns in JSX
        // Detect opacity-XX classes
        // Report violations and suggest fixes
      },
    }
  },
}
```

### Autofix Patterns

| Violation | Fix |
|-----------|-----|
| `bg-slate-800/60` | `bg-card` |
| `rounded-lg` | `rounded-none` |
| `blur-md` | remove blur class |
| `backdrop-blur-sm` | remove backdrop-blur |

---

## Dependencies

| Dependency | description | Status |
|------------|---------|--------|
| ESLint 8.x or 9.x | Rule framework | Already installed |
| @typescript-eslint/typescript-estree | AST parsing | Already installed |
| vitest | Test framework | Already installed |

---

## Dev Notes

### Files to Create

| File | description |
|------|---------|
| `eslint-plugin-8bit-design/package.json` | Package metadata |
| `eslint-plugin-8bit-design/tsconfig.json` | TypeScript config |
| `eslint-plugin-8bit-design/lib/index.ts` | Plugin entry point |
| `eslint-plugin-8bit-design/lib/rules/no-transparency.ts` | Rule implementation |
| `eslint-plugin-8bit-design/lib/rules/no-large-radius.ts` | Rule implementation |
| `eslint-plugin-8bit-design/lib/rules/no-blur.ts` | Rule implementation |
| `eslint-plugin-8bit-design/tests/lib/rules/*.ts` | Rule tests |

### Files to Modify

| File | description |
|------|---------|
| `eslint.config.mjs` | Add plugin and configure rules |

### Testing Strategy

1. **Valid code samples:**
   - `className="bg-card text-foreground"`
   - `className="rounded-none"`
   - No blur classes

2. **Invalid code samples:**
   - `className="bg-slate-800/60"`
   - `className="rounded-lg"`
   - `className="blur-md"`

3. **Autofix verification:**
   - Run `--fix` and verify output matches expected

### CI Integration

The plugin should be integrated into CI:

```yaml
# .github/workflows/lint.yml
- name: Run 8-bit design lint
  run: npx eslint --ext .tsx,.ts,.jsx,.js --plugin 8bit-design .
```

---

## Research Notes

<research_notes>
  <!-- To be populated during development -->
</research_notes>

---

## References

### Documentation

- ESLint Plugin Developer Guide: https://eslint.org/docs/developer-guide/working-with-rules
- Creating Plugins: https://eslint.org/docs/developer-guide/working-with-plugins
- AST Explorer: https://astexplorer.net/

### Existing Code

| File | description |
|------|---------|
| `eslint.config.mjs` | Existing ESLint configuration |
| `agent-os/standards/frontend/css.md` | 8-bit design system rules |

---

## Dev Agent Record

**Agent:** 
**Session:** 

#### Task Progress:
- [ ] T1: 
- [ ] T2: 
- [ ] T3: 
- [ ] T4: 
- [ ] T5: 
- [ ] T6: 
- [ ] T7: 
- [ ] T8: 
- [ ] T9: 

#### Research Executed:
- ESLint plugin documentation: 
- AST patterns: 

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

#### Tests Created:
- 

#### Decisions Made:
- 

---

## Code Review

**Reviewer:** 
**Date:** 

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] Autofix works correctly
- [ ] CI integration tested

#### Issues Found:
- 

#### Sign-off:
✅ APPROVED / ❌ CHANGES REQUESTED

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-09 | drafted | Story created |
|  |  |  |
|  |  |  |

---

*Generated 2026-01-09 by BMAD Story Development Cycle*
