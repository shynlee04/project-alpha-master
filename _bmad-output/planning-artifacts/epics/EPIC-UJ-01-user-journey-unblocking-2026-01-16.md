---
name: "EPIC-UJ-01"
title: "User Journey Unblocking"
description: "Unblock all user journeys and edge cases to landing on IDE and Notes workspaces without any blocking"
priority: "P0"
status: "planned"
version: "1.0.0"
created: "2026-01-16"
updated: "2026-01-16"
phase: "correct-course"
effort_hours: 8
stories_count: 4
dependencies: []
blocks: []
---

# EPIC-UJ-01: User Journey Unblocking

## Epic Objective

Unblock all user journeys and edge cases to landing on IDE and Notes workspaces without any blocking.

## Epic Context

Based on investigation findings from Team A and Team B, the following critical issues are blocking users:

1. **Platform Detection Conflicts** - Users might be misidentified as mobile on desktop
2. **Chrome 130+ Bug** - Users on Chrome 130+ cannot use FSA (file system access)
3. **Project Space Split Brain** - Users see inconsistent project states
4. **FSA Silent Restore Flaky** - Users get prompted instead of seamless restore

## Epic Stories

### Story UJ-01: Fix Platform Detection Conflicts
**Effort**: 2 hours
**Priority**: P0
**Status**: pending

**Objective**: Delete legacy platform detection and standardize on canonical implementation.

**Tasks**:
1. Delete `src/lib/utils/platform-detection.ts` (legacy)
2. Update all imports to use `src/infrastructure/filesystem/platform-detection.ts`
3. Test platform detection on desktop and mobile

**Acceptance Criteria**:
- [ ] Legacy platform detection file deleted
- [ ] All imports updated to canonical implementation
- [ ] Platform detection works correctly on desktop
- [ ] Platform detection works correctly on mobile
- [ ] No TypeScript errors

**Dependencies**: None

**Blocks**: UJ-02, UJ-03, UJ-04

---

### Story UJ-02: Fix Chrome 130+ Bug
**Effort**: 1 hour
**Priority**: P0
**Status**: pending

**Objective**: Fix Chrome version detection to support Chrome 130+.

**Tasks**:
1. Fix `permission-lifecycle.ts:44` - change `includes('Chrome/129')` to `>=129`
2. Test on Chrome 130+

**Acceptance Criteria**:
- [ ] Chrome version detection fixed
- [ ] Chrome 130+ users can use FSA
- [ ] No TypeScript errors

**Dependencies**: UJ-01

**Blocks**: UJ-04

---

### Story UJ-03: Fix Project Space Split Brain
**Effort**: 3 hours
**Priority**: P0
**Status**: pending

**Objective**: Standardize on one read pattern and fix hydration race conditions.

**Tasks**:
1. Standardize on one read pattern (useLiveQuery for lists, useProjectStore for active session)
2. Fix hydration race conditions
3. Fix WSOD (White Screen of Death) due to missing useProjectStats export

**Acceptance Criteria**:
- [ ] One read pattern standardized
- [ ] Hydration race conditions fixed
- [ ] WSOD fixed
- [ ] Users see consistent project states
- [ ] No TypeScript errors

**Dependencies**: UJ-01

**Blocks**: None

---

### Story UJ-04: Fix FSA Silent Restore
**Effort**: 2 hours
**Priority**: P0
**Status**: pending

**Objective**: Fix FSA silent restore to be truly seamless.

**Tasks**:
1. Fix `showDirectoryPicker({ id })` to only attempt if mode: 'readwrite' was explicitly granted
2. Add graceful degradation to "Ask User" if silent restore fails
3. Test on Chrome 129+

**Acceptance Criteria**:
- [ ] Silent restore logic fixed
- [ ] Graceful degradation implemented
- [ ] Users get seamless restore when possible
- [ ] Users get prompted only when necessary
- [ ] No TypeScript errors

**Dependencies**: UJ-01, UJ-02

**Blocks**: None

---

## Epic Timeline

| Story | Effort | Dependencies | Blocks |
|-------|--------|--------------|--------|
| UJ-01 | 2 hours | None | UJ-02, UJ-03, UJ-04 |
| UJ-02 | 1 hour | UJ-01 | UJ-04 |
| UJ-03 | 3 hours | UJ-01 | None |
| UJ-04 | 2 hours | UJ-01, UJ-02 | None |

**Total Effort**: 8 hours

## Epic Success Criteria

- [ ] All platform detection conflicts resolved
- [ ] Chrome 130+ users can use FSA
- [ ] Users see consistent project states
- [ ] FSA silent restore works seamlessly
- [ ] All user journeys unblocked
- [ ] No TypeScript errors
- [ ] All tests pass

## Epic Risks

- **Risk 1**: Platform detection fix might break existing functionality
  - **Mitigation**: Thorough testing on desktop and mobile

- **Risk 2**: Chrome 130+ fix might not work on all Chrome versions
  - **Mitigation**: Test on multiple Chrome versions

- **Risk 3**: Project space fix might introduce new race conditions
  - **Mitigation**: Careful testing of hydration logic

- **Risk 4**: FSA silent restore fix might not work on all browsers
  - **Mitigation**: Test on Chrome 129+, 130+, 131+

## Epic Notes

- This is the first knot to untie in progressive remediation
- Focus is on unblocking user journeys, not architectural cleanup
- Architectural cleanup will be addressed in subsequent epics
- All stories are P0 (critical) priority

---

**Version**: 1.0.0
**Last Updated**: 2026-01-16