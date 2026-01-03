# Week 3 Planning - P1 Components
**Date:** 2026-01-04
**Sprint:** Light Theme Design System Implementation

---

## Week 3 Overview

| Metric | Value |
|--------|-------|
| Phase | Week 3: P1 Components |
| Stories | 5 |
| Estimated Hours | 15 |
| Adjusted Hours (0.5x) | 7.5 |
| Start Date | 2026-01-04 |
| Status | Ready to Start |

---

## Story List

### LT-3.14: Badge Component
| Field | Value |
|-------|-------|
| Priority | P1 |
| Estimated Hours | 2 |
| Adjusted Hours | 1 |
| Assignee | light-theme-dev-agent |
| Dependencies | LT-2.13 |

### LT-3.15: Card Component
| Field | Value |
|-------|-------|
| Priority | P1 |
| Estimated Hours | 3 |
| Adjusted Hours | 1.5 |
| Assignee | light-theme-dev-agent |
| Dependencies | LT-2.13 |

### LT-3.16: Dialog Component
| Field | Value |
|-------|-------|
| Priority | P1 |
| Estimated Hours | 4 |
| Adjusted Hours | 2 |
| Assignee | light-theme-dev-agent |
| Dependencies | LT-2.13 |

### LT-3.17: Toast Component
| Field | Value |
|-------|-------|
| Priority | P1 |
| Estimated Hours | 3 |
| Adjusted Hours | 1.5 |
| Assignee | light-theme-dev-agent |
| Dependencies | LT-2.13 |

### LT-3.18: Tabs Component
| Field | Value |
|-------|-------|
| Priority | P1 |
| Estimated Hours | 3 |
| Adjusted Hours | 1.5 |
| Assignee | light-theme-dev-agent |
| Dependencies | LT-2.13 |

---

## Velocity Tracking

| Epic | Stories | Hours (Est) | Hours (Adj) | Hours (Act) | Status |
|------|---------|-------------|-------------|-------------|--------|
| Week 1 | 7 | 24 | 24 | 24 | Complete |
| Week 2 | 6 | 23 | 11.5 | 9.5 | Complete |
| Week 3 | 5 | 15 | 7.5 | TBD | In Progress |
| Week 4 | 5 | 26 | 13 | TBD | Pending |
| **Total** | **23** | **88** | **56** | **33.5** | **56%** |

---

## Technical Approach

### CSS Custom Properties Pattern (Week 2 Standard)

All P1 components will follow the established pattern:

```css
/* Base styles */
bg-[var(--background)]
text-[var(--foreground)]
border-[var(--border)]

/* Focus states */
focus-visible:ring-[var(--ring)]
focus-visible:ring-offset-2
focus-visible:ring-offset-[var(--background)]

/* Transitions */
transition-[background-color,border-color] duration-150 ease-out

/* Border radius */
rounded-[4px]
```

### Token Usage by Component

| Component | Tokens | Key Tokens |
|-----------|--------|------------|
| Badge | 6 | `--primary`, `--success`, `--warning`, `--destructive` |
| Card | 8 | `--card`, `--card-foreground`, `--border`, `--shadow-md` |
| Dialog | 12 | `--dialog`, `--overlay`, `--primary`, `--ring` |
| Toast | 10 | `--success`, `--warning`, `--destructive`, `--info` |
| Tabs | 8 | `--primary`, `--muted`, `--foreground`, `--border` |

---

## Resource Allocation

### Dev Agent Assignments

| Story | Component | Hours (Adj) | Priority |
|-------|-----------|-------------|----------|
| LT-3.14 | Badge | 1 | High |
| LT-3.15 | Card | 1.5 | High |
| LT-3.16 | Dialog | 2 | High |
| LT-3.17 | Toast | 1.5 | Medium |
| LT-3.18 | Tabs | 1.5 | Medium |

**Total:** 7.5 hours (adjusted)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dialog complexity | Medium | Use Radix UI primitives, follow Select pattern |
| Toast animations | Low | Use standard animation utilities |
| Tabs state | Medium | Use Radix UI Tabs primitive |

---

## Dependencies

### External
- Radix UI primitives (Dialog, Toast, Tabs)
- Lucide React icons
- Class Variance Authority (CVA)

### Internal
- `light-theme-tokens.css` (91 tokens)
- `src/lib/utils.ts` (cn helper)
- Design system patterns from Week 2

---

## Quality Gates

### Code Review Checklist
- [ ] All CSS custom properties resolve correctly
- [ ] Focus indicators visible in light/dark themes
- [ ] Transitions work correctly (150ms)
- [ ] WCAG 2.1 AA compliance (contrast, keyboard)
- [ ] No hardcoded color values
- [ ] CVA variants properly structured
- [ ] JSDoc documentation complete
- [ ] TypeScript types correct

### Acceptance Criteria
- [ ] Component works in light theme
- [ ] Component works in dark theme
- [ ] All variants implemented
- [ ] Accessibility verified
- [ ] Code review approved

---

## Next Steps

1. **Begin LT-3.14 (Badge component)**
   - Load context document
   - Research Radix UI Badge (if available) or custom
   - Implement with CSS custom properties
   - Run code review

2. **Continue with remaining P1 components**
   - LT-3.15: Card
   - LT-3.16: Dialog
   - LT-3.17: Toast
   - LT-3.18: Tabs

3. **Week 4 preparation**
   - Plan workspace components
   - Identify cross-cutting concerns
   - Prepare integration testing

---

## Success Criteria for Week 3

| Metric | Target | Status |
|--------|--------|--------|
| Stories Completed | 5/5 | TBD |
| Code Review Pass Rate | 100% | TBD |
| Hours (Adjusted) | ≤7.5 | TBD |
| WCAG Compliance | 100% | TBD |

---

**Planned by:** light-theme-sm-agent
**Date:** 2026-01-04
**Execution Start:** 2026-01-04
