# Ralph Loop Rollback Procedures - 2026-01-03

**Date**: 2026-01-03
**Session**: Ralph Loop Autonomous Execution
**Procedures Version**: 1.0.0

---

## 🎯 PURPOSE

This document defines **comprehensive rollback procedures** for Ralph Loop execution. These procedures ensure **data safety**, **quick recovery**, and **minimal disruption** when things go wrong across 100 iterations.

---

## 🚨 WHEN TO ROLLBACK

### Trigger Conditions

#### Critical Triggers (Immediate Rollback Required)
- **Test failure rate >5%** (more than 7-8 tests failing)
- **Circular dependency detected** (any new circular imports)
- **API breakage affecting >3 components** (breaking changes without migration)
- **Performance degradation >10%** (measurable slowdown)
- **Data loss scenario** (any data corruption or deletion)
- **Build failure** (cannot build the project)

#### High Triggers (Rollback Recommended)
- **Test failure rate 2-5%** (2-7 tests failing)
- **TypeScript errors increased by >10%**
- **File size violations** (new god stores or giant components)
- **Coverage decreased by >5 percentage points**

#### Medium Triggers (Consider Rollback)
- **Test failure rate 1-2%** (1-2 tests failing)
- **TypeScript errors increased by 5-10%**
- **Minor performance degradation (5-10%)**

#### Low Triggers (Monitor, Don't Rollback)
- **Documentation gaps**
- **Formatting issues**
- **Code style violations**

---

## 🔄 ROLLBACK OPTIONS

### Option 1: Git Revert (Single Story Failure)

**When to Use**:
- Single story (2-10 iterations) failed
- Clear commit to revert
- No downstream dependencies affected

**Steps**:
```bash
# 1. Identify the commit to revert
git log --oneline -10

# 2. Revert the commit
git revert {commit-hash}

# 3. Resolve any conflicts
# Edit conflicted files
git add {resolved-files}

# 4. Complete the revert
git revert --continue

# 5. Verify the revert
pnpm test
pnpm tsc --noEmit
pnpm build

# 6. Push the revert
git push origin dev
```

**Time**: 5-10 minutes
**Risk**: Low
**Recovery**: Complete

---

### Option 2: Restore from Backup (Epic/Phase Failure)

**When to Use**:
- Epic or phase failed (10-50 iterations)
- Multiple commits need rollback
- Need to return to known good state

**Steps**:
```bash
# 1. Identify the backup branch
git branch -a | grep backup

# 2. Create recovery branch from backup
git checkout -b recovery-{date} backup-before-{phase}-{date}

# 3. Merge recovery into main branch
git checkout dev
git merge recovery-{date}

# 4. Resolve conflicts (if any)
# Edit conflicted files
git add {resolved-files}

# 5. Verify the restore
pnpm test
pnpm tsc --noEmit
pnpm build

# 6. Push the recovery
git push origin dev
```

**Time**: 15-30 minutes
**Risk**: Medium
**Recovery**: Complete (to backup point)

---

### Option 3: Cherry-Pick (Partial Rollback)

**When to Use**:
- Some commits good, some bad
- Need to keep specific changes
- Rollback only problematic commits

**Steps**:
```bash
# 1. Identify commits to keep and remove
git log --oneline -20

# 2. Create rollback branch
git checkout -b rollback-{date}
git reset --hard {last-good-commit}

# 3. Cherry-pick good commits
git cherry-pick {good-commit-1}
git cherry-pick {good-commit-2}
# ... etc

# 4. Resolve conflicts (if any)
# Edit conflicted files
git add {resolved-files}

# 5. Verify the cherry-pick
pnpm test
pnpm tsc --noEmit
pnpm build

# 6. Replace main branch
git checkout dev
git reset --hard rollback-{date}
git push origin dev --force
```

**Time**: 30-60 minutes
**Risk**: High (force push)
**Recovery**: Selective (keeps good commits)

---

## 📦 BACKUP STRATEGY

### Pre-Phase Backups

Create backup before each phase:

```bash
# Phase 0 Backup
git checkout -b backup-phase-0-2026-01-03
git push origin backup-phase-0-2026-01-03

# Phase 1 Backup
git checkout -b backup-phase-1-2026-01-17
git push origin backup-phase-1-2026-01-17

# etc...
```

### Pre-Epic Backups

Create backup before each epic:

```bash
# Epic CC-1 Backup
git checkout -b backup-epic-cc-1-2026-01-03
git push origin backup-epic-cc-1-2026-01-03

# Epic CP-1 Backup
git checkout -b backup-epic-cp-1-2026-01-10
git push origin backup-epic-cp-1-2026-01-10

# etc...
```

### Pre-Story Backups (Critical Stories)

Create backup before critical stories:

```bash
# P0-1 Circular Dependency Fix Backup
git checkout -b backup-p0-1-circular-dep-2026-01-03
git push origin backup-p0-1-circular-dep-2026-01-03

# P0-2 TypeScript Errors Backup
git checkout -b backup-p0-2-typescript-2026-01-03
git push origin backup-p0-2-typescript-2026-01-03

# etc...
```

### IndexedDB Backups

For data migration stories, backup IndexedDB:

```typescript
// File: src/infrastructure/persistence/backup-db.ts

export async function backupIndexedDB(backupId: string) {
  // 1. Export all data from IndexedDB
  const db = await Dexie.open('ProjectAlphaDB', 1);
  const tables = db.tables.map(t => t.name);

  const backup: Record<string, any[]> = {};

  for (const tableName of tables) {
    const table = db.table(tableName);
    backup[tableName] = await table.toArray();
  }

  // 2. Save to localStorage (temporary)
  localStorage.setItem(`indexeddb-backup-${backupId}`, JSON.stringify(backup));

  // 3. Also download as JSON file (user can save)
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `indexeddb-backup-${backupId}.json`;
  a.click();

  return backupId;
}

export async function restoreIndexedDB(backupId: string) {
  // 1. Load backup from localStorage
  const backupData = localStorage.getItem(`indexeddb-backup-${backupId}`);
  if (!backupData) {
    throw new Error(`Backup ${backupId} not found`);
  }

  const backup = JSON.parse(backupData);

  // 2. Clear existing database
  const db = await Dexie.open('ProjectAlphaDB', 1);
  await db.delete();

  // 3. Restore backup
  const db2 = await Dexie.open('ProjectAlphaDB', 1);

  for (const tableName in backup) {
    const table = db2.table(tableName);
    await table.bulkAdd(backup[tableName]);
  }

  return backupId;
}
```

---

## 🚀 ROLLBACK EXECUTION

### Step 1: Stop Execution

**Immediate Halt**:
```bash
# Kill any running processes
# Stop all agents
# Notify BMad Master
```

### Step 2: Assess Damage

**Create Assessment Report**:
```markdown
# Rollback Assessment: {Failure Description}

**Date**: {ISO-8601}
**Iteration**: {N}
**Phase**: {0-4}

## What Happened
{Description of failure}

## Impact Assessment
- **Tests Failing**: {X}/{total}
- **TS Errors Added**: {X} errors
- **Components Broken**: {X} components
- **Data Loss**: {Yes/No}
- **Performance Impact**: {X}% degradation

## Root Cause Analysis
{Why the failure occurred}

## Rollback Recommendation
- **Option**: {1/2/3}
- **Rationale**: {Why this option}
- **Risk Level**: {Low/Medium/High}
- **Estimated Time**: {X minutes}
```

### Step 3: Execute Rollback

**Follow rollback option procedures** (Option 1, 2, or 3)

### Step 4: Verify Restoration

**Validation Steps**:
```bash
# 1. Verify no circular dependencies
madge --circular src/

# 2. Verify TypeScript errors acceptable
pnpm tsc --noEmit

# 3. Verify all tests passing
pnpm test

# 4. Verify build succeeds
pnpm build

# 5. Verify data integrity (if applicable)
# Check IndexedDB, verify data exists
```

### Step 5: Document Failure

**Create Incident Report**:
```markdown
# Incident Report: {Failure Title}

**Date**: {ISO-8601}
**Iteration**: {N}
**Severity**: {Critical/High/Medium/Low}

## Summary
{What happened}

## Impact
{How it affected the project}

## Root Cause
{Why it happened}

## Timeline
- {Start time}: Failure detected
- {End time}: Rollback complete
- {Duration}: Total time to recover

## Rollback Details
- **Option Used**: {1/2/3}
- **Backup Restored**: {backup-branch}
- **Commits Reverted**: {count}
- **Data Loss**: {Yes/No}

## Lessons Learned
{What to avoid next time}

## Prevention Measures
{How to prevent recurrence}
```

### Step 6: Adjust Strategy

**Modify Approach**:
1. **Analyze why rollback happened**
2. **Identify flawed assumptions**
3. **Revise implementation plan**
4. **Add additional safety checks**
5. **Update quality gates**
6. **Proceed with corrected strategy**

---

## 🛡️ SAFETY MECHANISMS

### Pre-Rollback Safety

Before rolling back:
- [ ] Confirm rollback is necessary
- [ ] Identify correct backup/commit
- [ ] Notify team of impending rollback
- [ ] Estimate rollback time
- [ ] Prepare rollback plan

### During Rollback Safety

While rolling back:
- [ ] Work on rollback branch (not main)
- [ ] Verify each step before proceeding
- [ ] Keep detailed notes
- [ ] Test after each major step
- [ ] Be prepared to abort if needed

### Post-Rollback Safety

After rolling back:
- [ ] Verify system is functional
- [ ] Run full test suite
- [ ] Check for data integrity
- [ ] Document what happened
- [ ] Update procedures to prevent recurrence
- [ ] Notify team rollback complete

---

## 📋 ROLLBACK CHECKLISTS

### Pre-Rollback Checklist

- [ ] Failure confirmed and documented
- [ ] Impact assessed
- [ ] Root cause identified
- [ ] Rollback option selected
- [ ] Backup/commit identified
- [ ] Team notified
- [ ] Rollback plan created
- [ ] Safety mechanisms reviewed

### During Rollback Checklist

- [ ] Working on rollback branch
- [ ] Each step verified
- [ ] Tests run after changes
- [ ] Detailed notes kept
- [ ] Progress tracked

### Post-Rollback Checklist

- [ ] System functional
- [ ] All tests passing
- [ ] Data integrity verified
- [ ] Incident report created
- [ ] Team notified
- [ ] Procedures updated
- [ ] Lessons learned documented

---

## 🔄 ROLLBACK SCENARIOS

### Scenario 1: Test Failures After Refactoring

**Situation**: After refactoring a store, 10 tests fail

**Trigger**: Test failure rate >5% (10/153 = 6.5%)

**Rollback**: Option 1 (Git Revert)
```bash
# Revert the refactoring commit
git revert {refactor-commit}

# Verify tests pass
pnpm test

# Push revert
git push origin dev
```

**Time**: 5 minutes
**Outcome**: Tests restored to passing state

---

### Scenario 2: Circular Dependency Introduced

**Situation**: New store imports create circular dependency

**Trigger**: Circular dependency detected (Critical)

**Rollback**: Option 1 (Git Revert)
```bash
# Revert the problematic commit
git revert {circular-dep-commit}

# Verify no circular dependencies
madge --circular src/

# Push revert
git push origin dev
```

**Time**: 5 minutes
**Outcome**: Circular dependency eliminated

---

### Scenario 3: Data Migration Failure

**Situation**: Data migration script corrupts IndexedDB

**Trigger**: Data loss scenario (Critical)

**Rollback**: Option 2 (Restore from Backup)
```bash
# 1. Restore IndexedDB from backup
await restoreIndexedDB('backup-before-migration-{date}');

# 2. Revert migration code
git checkout backup-before-migration-{date}

# 3. Verify data integrity
# Check IndexedDB, verify all data present

# 4. Push restore
git push origin dev --force
```

**Time**: 30 minutes
**Outcome**: Data restored to pre-migration state

---

### Scenario 4: Epic Failure (Multiple Stories)

**Situation**: Epic CC-1 (Conversation Consolidation) fails - 3 stories have issues

**Trigger**: Epic failure (multiple story failures)

**Rollback**: Option 2 (Restore from Backup)
```bash
# 1. Restore from epic backup
git checkout dev
git reset --hard backup-epic-cc-1-2026-01-03
git push origin dev --force

# 2. Verify restoration
pnpm test
pnpm build

# 3. Document epic failure
# Create incident report
```

**Time**: 30 minutes
**Outcome**: System restored to pre-epic state

---

### Scenario 5: Performance Degradation

**Situation**: After refactoring, app is 15% slower

**Trigger**: Performance degradation >10% (High)

**Rollback**: Option 1 or 2 (depending on scope)
```bash
# If single commit: revert it
git revert {slow-commit}

# If multiple commits: restore backup
git reset --hard backup-before-performance-regression
git push origin dev --force
```

**Time**: 10-30 minutes
**Outcome**: Performance restored

---

## 🎯 ROLLBACK PREVENTION

### Best Practices to Avoid Rollbacks

1. **Run quality gates** at every stage
2. **Test incrementally** (don't wait until the end)
3. **Use feature branches** (merge to dev only when stable)
4. **Create backups** before major changes
5. **Monitor metrics** (catch regressions early)
6. **Document assumptions** (avoid flawed decisions)
7. **Communicate blockers** (don't hide problems)
8. **Learn from failures** (update procedures)

### Early Warning Signs

Watch for these indicators that rollback might be needed:

- Test failures increasing gradually
- TypeScript errors creeping up
- Components growing larger each iteration
- Code reviews finding more issues
- Performance getting slower
- Team feeling uneasy about changes

**When you see these signs**: **STOP and assess before proceeding**

---

## ✅ ROLLBACK PROCEDURES COMPLETE

**Status**: Ready for Execution
**Version**: 1.0.0
**Next**: Create Progress Tracking document
