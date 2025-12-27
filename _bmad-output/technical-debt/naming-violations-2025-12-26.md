# Naming Violations - Technical Debt Analysis

**Date**: 2025-12-26
**Priority**: P2
**Status**: Analysis Complete
**Context**: Phase 3 technical debt cleanup based on Phase 1 investigation

## Naming Convention Reference

Per CLAUDE.md and AGENTS.md:

| Category | Convention | Example |
|----------|------------|---------|
| Components | PascalCase | `AgentChatPanel.tsx` |
| Hooks | camelCase with `use` prefix | `useAgentChatWithTools` |
| State Stores | `use*Store` pattern | `useIDEStore` |
| Utilities | camelCase | `syncManager.ts` |
| Types/Interfaces | PascalCase | `FileSystemError` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_ITERATIONS` |
| File Names | Match exported thing | `useAgentChatWithTools.ts` |

## Violation Inventory

### Violations Found

| # | File | Current Name | Expected Name | Severity |
|---|------|--------------|---------------|----------|
| 1 | `src/lib/utils.ts` | `utils.ts` | `formatUtils.ts` or similar | Low |
| 2 | `src/lib/events/index.ts` | `index.ts` | barrel export - OK | None |
| 3 | `src/lib/filesystem/index.ts` | `index.ts` | barrel export - OK | None |
| 4 | `src/lib/state/index.ts` | `index.ts` | barrel export - OK | None |
| 5 | `src/components/ui/index.ts` | `index.ts` | barrel export - OK | None |
| 6 | `src/components/ide/index.ts` | `index.ts` | barrel export - OK | None |
| 7 | `src/components/chat/index.ts` | `index.ts` | barrel export - OK | None |
| 8 | `src/components/layout/index.ts` | `index.ts` | barrel export - OK | None |

### Review Findings

**Barrel exports (`index.ts`)** are correct - they follow the standard pattern for re-exporting modules from a directory.

**Utility files** - `utils.ts` is acceptable as a general utilities file. The name `utils` is commonly used and the file exports utility functions, which is appropriate.

### Convention Compliance Check

| Convention | Status | Notes |
|------------|--------|-------|
| Components PascalCase | ✅ | All components follow this |
| Hooks use prefix | ✅ | `use*` pattern consistent |
| State stores use*Store | ✅ | 6 stores follow pattern |
| Types PascalCase | ✅ | Interfaces use PascalCase |
| Import order | ⚠️ | Need spot-check |

## Priority Actions

### P3 - Future Cleanup
1. **Spot-check import order** in main files
2. **Review constant naming** in codebase

### P3 - Accepted
1. `utils.ts` - Common pattern, acceptable
2. Barrel exports - Correct pattern

## Recommendations

1. **No immediate action required** - naming conventions are well-followed
2. **Future improvement** - Consider more descriptive names for utility files
3. **Continue enforcing** - Import order convention should be enforced via linter

## References
- [Component Inventory](_bmad-output/technical-dead/component-inventory-2025-12-26.md)
- [Architecture Conflicts](_bmad-output/technical-debt/architecture-conflicts-2025-12-26.md)
