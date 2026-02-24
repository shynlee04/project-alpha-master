# EPIC-39: 8-Bit Design Compliance

**Version**: 1.0.0
**Created**: 2026-01-09T17:15:11+07:00
**Author**: Sally (UX Designer Agent)
**Status**: PROPOSED (Pending Approval)
**Priority**: P0 - Critical (Visual Quality)

---

## Epic Summary

**Priority**: P0 - Critical Path Blocker
**Status**: PROPOSED
**Stories**: 6
**Effort**: ~13 hours
**Dependencies**: None (can run in parallel with other epics)

**Course Correction Reference**:
- **Trigger**: User escalation during UX audit (2026-01-09)
- **Workflow**: `/bmad-bmm-workflows-correct-course`
- **Proposal Document**: `sprint-change-proposal-ux-violations-2026-01-09.md`

---

## Business Value

The project's 8-bit design system is well-defined in `design-tokens.css` and `ux-specification.md`, but implementation has drifted significantly:

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Transparency violations | 50+ components | 0 | CRITICAL |
| Rounded corner violations | 180+ instances | 0 | CRITICAL |
| Blur effect violations | 2 files | 0 | MEDIUM |
| Mobile multi-pane usability | Unusable | Full | CRITICAL |

**User Feedback**: "Those agent or configuration dropdowns with transparency and layers on top of another text... it is just horrible. The contrast violations are various."

---

## Success Criteria

1. **Zero Transparency/Opacity** on interactive components (menus, selectors, dialogs)
2. **Zero Non-8-Bit Rounded Corners** (max: `rounded-[4px]`, prefer `rounded-none`)
3. **Zero Blur Effects** on any component
4. **ESLint Rule** blocks future violations
5. **Visual Regression Tests** validate 8-bit compliance

---

## Stories

### Story 39-01: Remove Transparency from Agent Selectors

**Priority**: P0  
**Effort**: 2 hours  
**Dependencies**: None

**Description**: Replace semi-transparent backgrounds in agent selectors and configuration dialogs with solid 8-bit colors.

**Current State (Violations)**:
```tsx
// UnifiedAgentSelector.tsx line 331
'bg-slate-800/60 hover:bg-slate-700/80',

// SelectContent line 365
'bg-slate-800 dark:bg-slate-900',
```

**Target State**:
```tsx
'bg-card hover:bg-secondary',
// Or CSS variable:
'bg-[var(--card)] hover:bg-[var(--secondary)]',
```

**Acceptance Criteria**:
- [ ] All agent selector backgrounds use solid colors (100% opacity)
- [ ] Dropdown menus use `bg-card` or CSS variables
- [ ] No `/60`, `/80`, `/50`, `/40` opacity modifiers on interactive elements
- [ ] Visual test: Selector overlays don't show underlying text bleeding through

**Files to Modify**:
1. `src/presentation/components/agent/UnifiedAgentSelector.tsx`
2. `src/presentation/components/agent/AgentConfigDialog.tsx`
3. `src/presentation/components/agent/ProviderConfigDialog.tsx`

---

### Story 39-02: Remove Transparency from Chat Components

**Priority**: P0  
**Effort**: 3 hours  
**Dependencies**: None

**Description**: Replace all semi-transparent backgrounds in chat components with solid 8-bit colors.

**Current State (Violations)**:
```tsx
// ChatConversation.tsx - 15 occurrences
'bg-slate-800/80 border-slate-600'
'bg-slate-900/50'
'bg-slate-900/80'

// MessageSearch.tsx - 4 occurrences
'bg-slate-900/95'
'bg-slate-800/40'

// StreamdownRenderer.tsx
'bg-slate-800/50' // code blocks

// ChatHistory.tsx
'bg-slate-800/40'

// ThreadsList.tsx
'bg-slate-900/50 dark:bg-slate-950/60'

// ConversationCard.tsx
'bg-slate-800/40'
```

**Target State**:
```tsx
'bg-card border-border'
'bg-background'
'bg-secondary'
// CSS variables
'bg-[var(--card)]'
'bg-[var(--secondary)]'
```

**Acceptance Criteria**:
- [ ] ChatConversation.tsx uses solid backgrounds only
- [ ] ChatHistory.tsx uses solid backgrounds only
- [ ] MessageSearch.tsx uses solid backgrounds only
- [ ] StreamdownRenderer.tsx code blocks use solid backgrounds
- [ ] ThreadsList.tsx uses solid backgrounds only
- [ ] ConversationCard.tsx uses solid backgrounds only
- [ ] All modified components pass visual inspection

**Files to Modify**:
1. `src/presentation/components/chat/ChatConversation.tsx`
2. `src/presentation/components/chat/ChatHistory.tsx`
3. `src/presentation/components/chat/MessageSearch.tsx`
4. `src/presentation/components/chat/StreamdownRenderer.tsx`
5. `src/presentation/components/chat/ThreadsList.tsx`
6. `src/presentation/components/chat/ConversationCard.tsx`

---

### Story 39-03: Replace Rounded Corners with Squared (8-bit)

**Priority**: P0  
**Effort**: 3 hours  
**Dependencies**: None

**Description**: Replace non-8-bit rounded corners with squared or minimal (4px) rounding per design system.

**Design System Mandate**:
```css
/* design-tokens.css */
--radius: 0rem;     /* Default: Squared corners */
--radius-sm: 0.125rem;   /* 2px - Subtle rounding */
--radius-md: 0.25rem;    /* 4px - Small radius - MAX ALLOWED */
```

**Current State (180+ violations)**:
```tsx
className="rounded-lg ..."  // 6px - TOO ROUND
className="rounded-md ..."  // ~0.375rem - BORDERLINE
className="rounded-xl ..."  // 12px - VERY TOO ROUND
className="sm:rounded-lg"
```

**Target State**:
```tsx
className="rounded-[4px] ..."  // Max allowed for 8-bit
className="rounded-none ..."    // Preferred for cards/panels
```

**Acceptance Criteria**:
- [ ] Zero `rounded-lg` classes on UI components
- [ ] Zero `rounded-xl` classes anywhere
- [ ] `rounded-md` replaced with `rounded-[4px]` where rounding is needed
- [ ] Cards and panels use `rounded-none` or `rounded-[4px]`
- [ ] Buttons may use `rounded-[4px]` maximum

**Files to Modify (Priority Order)**:
1. `src/presentation/components/ui/dropdown-menu.tsx` (line 43)
2. `src/routes/ide.tsx`
3. `src/presentation/components/command-palette/CommandPalette.tsx`
4. `src/presentation/components/about/Header.tsx`
5. All hub components using `rounded-lg`
6. All error boundary components

---

### Story 39-04: Remove Blur Effects from Hero/Onboarding

**Priority**: P0  
**Effort**: 1 hour  
**Dependencies**: None

**Description**: Remove blur effects from HeroSection and Onboarding, replace with 8-bit compatible alternatives.

**Design System Mandate**:
```css
/* ux-specification.md 1.4 */
/* 8-Bit Aesthetic Rules:
 * - NO backdrop-blur or backdrop-filter
 * - NO soft/blur shadows
 */
```

**Current State (Violations)**:
```tsx
// HeroSection.tsx line 13-14
<div className="... blur-[100px]" />

// Onboarding.tsx line 40
<div className="... blur-[100px] ..." />
```

**Target State**:
```tsx
// Option 1: Solid gradient (no blur)
<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/30 to-transparent" />

// Option 2: Pixelated glow effect (8-bit style)
<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 shadow-[0_0_40px_20px_rgba(249,115,22,0.3)]" />

// Option 3: Remove entirely for minimal aesthetic
{/* Decorative element removed per 8-bit design */}
```

**Acceptance Criteria**:
- [ ] Zero `blur-[*]` classes anywhere in codebase
- [ ] Zero `backdrop-blur` classes anywhere in codebase
- [ ] HeroSection uses 8-bit compatible glow effect (or removed)
- [ ] Onboarding uses 8-bit compatible glow effect (or removed)
- [ ] Visual quality maintained with alternative approach

**Files to Modify**:
1. `src/presentation/components/about/sections/HeroSection.tsx`
2. `src/presentation/components/dashboard/Onboarding.tsx`

---

### Story 39-05: Create ESLint Plugin for Design Enforcement

**Priority**: P1  
**Effort**: 2 hours  
**Dependencies**: 39-01, 39-02, 39-03, 39-04

**Description**: Create ESLint rules to prevent future 8-bit design violations.

**Rules to Create**:

```javascript
// eslint-plugin-8bit-design/rules/no-transparency.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow opacity modifiers on interactive elements',
    },
    fixable: 'code',
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === 'className') {
          const value = node.value?.value || '';
          if (/bg-slate-\d+\/\d+|bg-gray-\d+\/\d+/.test(value)) {
            context.report({
              node,
              message: '8-bit design: Use solid colors, not opacity modifiers',
            });
          }
        }
      },
    };
  },
};
```

**Acceptance Criteria**:
- [ ] ESLint rule `8bit/no-transparency` detects opacity modifiers
- [ ] ESLint rule `8bit/no-large-radius` detects `rounded-lg`, `rounded-xl`
- [ ] ESLint rule `8bit/no-blur` detects blur classes
- [ ] Rules added to `.eslintrc.cjs` with `error` severity
- [ ] CI fails on new violations

**Files to Create/Modify**:
1. Create `eslint-plugin-8bit-design/` folder
2. Modify `.eslintrc.cjs` to include plugin
3. Add to `package.json` dependencies

---

### Story 39-06: Add Visual Regression Tests for 8-bit Compliance

**Priority**: P1  
**Effort**: 2 hours  
**Dependencies**: 39-01, 39-02, 39-03, 39-04

**Description**: Create automated visual tests to ensure 8-bit design compliance.

**Test Cases**:

```typescript
// __tests__/visual/8bit-compliance.test.ts
describe('8-Bit Design Compliance', () => {
  it('agent selector uses solid backgrounds', async () => {
    const selector = await page.$('[data-testid="agent-selector"]');
    const bgColor = await selector.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    // Should be rgba with 1.0 alpha (solid)
    expect(bgColor).toMatch(/rgba?\(\d+,\s*\d+,\s*\d+,?\s*1?\)/);
  });
  
  it('dropdown menus have no blur filter', async () => {
    const menu = await page.$('[role="menu"]');
    const filter = await menu.evaluate(el => 
      getComputedStyle(el).filter
    );
    expect(filter).toBe('none');
  });
  
  it('cards use squared or minimal rounding', async () => {
    const cards = await page.$$('[data-testid$="-card"]');
    for (const card of cards) {
      const radius = await card.evaluate(el => 
        getComputedStyle(el).borderRadius
      );
      // Max 4px rounding
      expect(parseFloat(radius)).toBeLessThanOrEqual(4);
    }
  });
});
```

**Acceptance Criteria**:
- [ ] Test suite validates solid backgrounds on interactive elements
- [ ] Test suite validates no blur effects
- [ ] Test suite validates border radius limits
- [ ] Tests run in CI pipeline
- [ ] Regression report generated on failure

**Files to Create**:
1. `src/__tests__/visual/8bit-compliance.test.ts`
2. `src/__tests__/visual/setup.ts` (Playwright config)

---

## Dependencies Graph

```
39-01 (Agent Selectors)     ─┐
39-02 (Chat Components)     ─┼─► 39-05 (ESLint Plugin)
39-03 (Rounded Corners)     ─┤        │
39-04 (Blur Effects)        ─┘        ▼
                                39-06 (Visual Tests)
```

**Execution Order**:
1. Stories 39-01, 39-02, 39-03, 39-04 can run in parallel
2. Story 39-05 starts after component fixes complete
3. Story 39-06 runs after ESLint plugin is configured

---

## Risk Assessment

| Story ID | Risk Level | Risk Description | Mitigation |
|----------|-----------|------------------|------------|
| 39-01 | LOW | CSS-only changes, no logic | Visual QA after each file |
| 39-02 | LOW | CSS-only changes, no logic | Visual QA after each file |
| 39-03 | MEDIUM | 180+ files to modify | Batch with search/replace, then manual review |
| 39-04 | LOW | 2 files only | Test on HeroSection first |
| 39-05 | MEDIUM | ESLint plugin development | Start with simple regex patterns |
| 39-06 | LOW | Additive tests only | Use existing Playwright setup |

---

## Total Effort

| Story | Effort | Priority |
|-------|--------|----------|
| 39-01 | 2h | P0 |
| 39-02 | 3h | P0 |
| 39-03 | 3h | P0 |
| 39-04 | 1h | P0 |
| 39-05 | 2h | P1 |
| 39-06 | 2h | P1 |
| **Total** | **13h** | |

---

## Sprint Allocation

**Recommended Sprint**: Phase 2 (parallel with EPIC-31, EPIC-32)

| Team | Stories | Effort |
|------|---------|--------|
| Frontend A | 39-01, 39-02 | 5h |
| Frontend B | 39-03, 39-04 | 4h |
| DevOps | 39-05, 39-06 | 4h |

**Timeline**: 1-2 days with parallel execution

---

## Document Control

| Field | Value |
|-------|-------|
| Phase | Implementation (Course Correction) |
| Team | Team A |
| Agent Mode | UX Designer (Sally) |
| Date/Time | 2026-01-09T17:15:11+07:00 |
| Status | PROPOSED - Pending Approval |
