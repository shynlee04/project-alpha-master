# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-032
**Title**: Task Scheduler and Automation
**Date**: 2026-01-06T10:00:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add task scheduler for recurring operations (auto-save, backups, index updates) with cron-like syntax.

## Context
No automation exists for repetitive tasks. Users need scheduled backups, auto-save, and maintenance operations.

## Root Cause
```typescript
// No task scheduler exists
// No cron-like syntax for scheduling
// No automation framework
// Missing recurring task management
```

## Files to Create/Modify
- **Create**: `src/lib/scheduler/task-scheduler.ts` - Task scheduling engine
- **Create**: `src/lib/scheduler/cron-parser.ts` - Cron expression parser
- **Create**: `src/presentation/components/scheduler/ScheduledTasksDialog.tsx` - Task management UI
- **Create**: `src/presentation/components/scheduler/TaskEditor.tsx` - Create/edit scheduled tasks
- **Create**: `src/hooks/useTaskScheduler.ts` - Hook for scheduler
- **Create**: `src/lib/scheduler/built-in-tasks.ts` - Pre-defined task templates

## Scheduling Features

### Cron Syntax Support
- **Minute**: 0-59
- **Hour**: 0-23
- **Day of Month**: 1-31
- **Month**: 1-12
- **Day of Week**: 0-6 (0=Sunday)

### Special Characters
- **\***: Any value
- **,**: Value list separator (e.g., 1,3,5)
- **-**: Range (e.g., 1-5)
- **/**: Step (e.g., */5 = every 5)

### Example Schedules
- `0 * * * *` - Every hour
- `*/30 * * * *` - Every 30 minutes
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1-5` - Weekdays at 9 AM
- `0 0 1 * *` - First day of month
- `*/15 9-17 * * 1-5` - Every 15 min, 9 AM-5 PM, weekdays

### Built-in Tasks
1. **Auto-Save Projects**: Save project state every N minutes
2. **Backup Database**: Export settings to JSON daily
3. **Clean Cache**: Remove old cache entries weekly
4. **Index Updates**: Rebuild search index hourly
5. **Sync Snippets**: Export snippets to remote (future)

### Task Execution
- **Run Now**: Manually trigger task immediately
- **Pause/Resume**: Enable/disable scheduled tasks
- **Execution History**: Log last run time, status, duration
- **Error Handling**: Retry on failure, email notifications (future)
- **Concurrency**: Prevent overlapping executions

## Constraints
- Task execution in background (Web Workers)
- Persistence: Schedule saved to IndexedDB
- Battery awareness: Pause on low battery
- Idle detection: Run heavy tasks only when idle
- Mobile: Full-screen task management UI
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Task scheduler with cron expression support
- [ ] Cron parser: */5, 1-5, 1,3,5 syntax
- [ ] Task editor with schedule builder UI
- [ ] Built-in tasks: Auto-save, backup, cache clean, index update
- [ ] Run now button for manual execution
- [ ] Pause/resume scheduled tasks
- [ ] Execution history with timestamps
- [ ] Error handling with retry logic
- [ ] Background execution (Web Workers)
- [ ] IndexedDB persistence
- [ ] Battery awareness and idle detection
- [ ] Mobile: Full-screen task UI
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build scheduler UI
- `brainstorming` - Design cron parser
- `global-coding-style` - Background task patterns
- `global-validation` - Cron expression validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify scheduler components
ls -la src/presentation/components/scheduler/

# Verify cron parser
ls -la src/lib/scheduler/cron-parser.ts
```

## Related Issues
- Automation features
- Maintenance tasks
- Ralph Loop Cycle 5C: Background operations

## Next Action
Create task scheduler with cron parser, built-in tasks, execution history, and background worker support.

---
**Handoff ID**: S-032-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
