# Light Theme Sprint - Resource Management Guide

## Sprint Status Summary

| Metric | Value |
|--------|-------|
| Sprint | LT-2026-01-03 |
| Phase | Week 1: Foundation Setup |
| Stories Completed | 3/23 (13%) |
| Hours Completed | 8/88 (9%) |
| Status | 🟡 IN PROGRESS |

### Completed Stories
| # | Story | Hours | Status |
|---|-------|-------|--------|
| LT-1.1 | Create light theme token file | 4 | ✅ Complete |
| LT-1.2 | Update design-tokens.css with transitions | 2 | ✅ Complete |
| LT-1.3 | Update Tailwind config for class-based themes | 2 | ✅ Complete |

### Pending Stories (Week 1)
| # | Story | Hours | Status |
|---|-------|-------|--------|
| LT-1.4 | Create TypeScript theme types | 2 | ⏳ Ready |
| LT-1.5 | Implement useTheme hook | 6 | ⏳ Blocked (LT-1.4) |
| LT-1.6 | Create ThemeProvider component | 4 | ⏳ Blocked (LT-1.5) |
| LT-1.7 | Create ThemeToggle component | 4 | ⏳ Blocked (LT-1.6) |

---

## Resource Management Rules

### Team Guidelines
1. **Two Teams Operating**: 
   - Team A: UI/Frontend components
   - Team B: Backend/State management
   - Coordinate via sprint-status.yaml

2. **Build Management**:
   - ❌ NO full builds during story execution
   - ❌ NO full tsc --noEmit during story execution
   - ✅ ONLY dry-checking (syntax reasoning + file scanning)
   - ✅ ONLY type check on newly created files
   - ✅ Run full build ONLY when all stories in a module are complete

3. **Background Tasks**:
   - ❌ NO heavy background tasks
   - ✅ Only 1 background task at a time
   - ✅ Quick validations (< 30 seconds)

### Dry-Check Protocol

Before marking a story complete:

1. **Syntax Validation** (manual review)
   - Read the modified/created files
   - Check for obvious syntax errors
   - Verify import/export statements

2. **Related Files Scanning**
   - Check files that integrate with the change
   - Verify compatibility with existing code
   - Look for potential conflicts

3. **Type Check Scope** (only if TypeScript)
   ```bash
   # Only check the specific files created/modified
   pnpm tsc --noEmit src/types/theme.ts
   ```
   - NOT the entire project
   - NOT multiple files at once

4. **Build Timing**
   - **Week 1**: Full build after LT-1.7 complete
   - **Week 2**: Full build after LT-2.13 complete
   - **Week 3**: Full build after LT-3.18 complete
   - **Week 4**: Full build after LT-4.23 complete

---

## Current Resource State

### Active Tasks
- None (STORY-003 just completed)

### Background Tasks
- None

### Pending Tasks
- LT-1.4: Create TypeScript theme types

### Blocked Tasks
- LT-1.5 (blocked by LT-1.4)
- LT-1.6 (blocked by LT-1.5)
- LT-1.7 (blocked by LT-1.6)

---

## Quick Reference: Next Steps

### Immediate Action
**Execute STORY-004: Create TypeScript theme types**

```bash
# Create the type file
src/types/theme.ts
```

### Dry-Check for STORY-004
1. Read `src/types/theme.ts` for syntax
2. Scan `src/presentation/components/ui/ThemeProvider.tsx` for compatibility
3. Run `pnpm tsc --noEmit src/types/theme.ts` (single file only)

### After STORY-004 Complete
- Update sprint-status.yaml
- Create STORY-004 execution doc
- Proceed to STORY-005

---

## File Locations

| Purpose | Location |
|---------|----------|
| Sprint Status | `_bmad-output/light-theme-sprint/sprint-status.yaml` |
| Story Specs | `_bmad-output/light-theme-sprint/stories/` |
| Design System | `_bmad-output/light-theme-design-system/` |
| Sprint Output | `_bmad-output/light-theme-sprint/` |

---

## Quality Gates

Before moving to next story:

- [ ] Story spec reviewed
- [ ] Implementation complete
- [ ] Dry-check passed (syntax + scanning)
- [ ] Type check passed (if applicable)
- [ ] Execution doc created
- [ ] Sprint status updated

---

## Risk Management

### Current Risks
| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Build timeout | High | Only build after module complete | ✅ Mitigated |
| Type check too long | Medium | Single-file type check only | ✅ Mitigated |
| Resource conflicts | Medium | One task at a time | ✅ Mitigated |

---

## Communication Protocol

### Team A (UI) Focus
- ThemeToggle component (LT-1.7)
- P0/P1 Component migration (LT-2.8 through LT-3.18)
- Workspace styling (LT-4.19 through LT-4.22)

### Team B (State) Focus
- Theme types (LT-1.4)
- useTheme hook (LT-1.5)
- ThemeProvider (LT-1.6)

### Coordination
- Update sprint-status.yaml when starting/completing stories
- Add blocking notes in story specs
- Flag resource conflicts in next_actions
