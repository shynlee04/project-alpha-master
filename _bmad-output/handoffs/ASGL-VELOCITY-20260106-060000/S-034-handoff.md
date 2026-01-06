# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-034
**Title: Analytics Dashboard and Metrics
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
Add analytics dashboard showing usage metrics, project statistics, and performance indicators.

## Context
No visibility into usage patterns. Users need insights into their productivity, project health, and app performance.

## Root Cause
```typescript
// No analytics collection exists
// No metrics dashboard UI
// Missing usage tracking
// No performance monitoring
```

## Files to Create/Modify
- **Create**: `src/lib/analytics/metrics-collector.ts` - Collect usage metrics
- **Create**: `src/lib/analytics/performance-monitor.ts` - Monitor app performance
- **Create**: `src/presentation/components/analytics/AnalyticsDashboard.tsx` - Dashboard UI
- **Create**: `src/presentation/components/analytics/MetricsChart.tsx` - Chart components
- **Create**: `src/hooks/useAnalytics.ts` - Hook for analytics data
- **Modify**: `src/routes/settings.tsx` - Add Analytics section

## Metrics to Track

### Usage Metrics
- **Session Duration**: Time spent in app per session
- **Projects Created**: New projects over time
- **Files Edited**: Number of files edited daily/weekly/monthly
- **Lines of Code**: Lines added/removed/deleted
- **Commands Run**: AI commands executed (chat, refactor, etc.)
- **Features Used**: Which features are most used (search, snippets, etc.)

### Project Metrics
- **Project Size**: Files, folders, total lines
- **File Types**: Breakdown by file type (TS, TSX, MD, etc.)
- **Code Churn**: Files most frequently edited
- **Dependencies**: Number of dependencies per project
- **Activity Heatmap**: GitHub-style contribution graph

### Performance Metrics
- **Load Time**: App initialization time
- **Search Performance**: Average search query time
- **RAG Indexing**: Indexing progress and speed
- **Memory Usage**: Heap size over time
- **Cache Hit Rate**: Cache effectiveness

### AI Agent Metrics
- **Agent Usage**: Which agents used most
- **Response Time**: Average agent response time
- **Token Usage**: Total tokens consumed
- **Success Rate**: Successful vs failed operations

## Dashboard Features

### Charts and Visualizations
1. **Line Chart**: Metrics over time (daily/weekly/monthly)
2. **Bar Chart**: Feature usage, file type distribution
3. **Pie Chart**: Language breakdown, time distribution
4. **Heatmap**: Activity by hour/day
5. **Gauge**: Performance scores (load time, response time)

### Dashboard Sections
1. **Overview**: Key metrics at a glance
2. **Usage**: Session duration, projects, files edited
3. **Projects**: Project statistics, file types, churn
4. **Performance**: Load time, memory, cache hits
5. **AI Agents**: Agent usage, tokens, response times
6. **Activity**: Heatmap, recent events

### Time Range Selection
- **Last 24 Hours**: Hourly breakdown
- **Last 7 Days**: Daily breakdown
- **Last 30 Days**: Daily breakdown
- **Last 12 Months**: Monthly breakdown
- **Custom**: Date range picker

## Data Collection

### Privacy-First Approach
- **Local Only**: All data stored locally (IndexedDB)
- **No Telemetry**: No data sent to external servers
- **Opt-In**: User must enable analytics
- **Data Deletion**: Clear all analytics data button
- **Anonymous**: No personal identifiers

### Collection Points
- **Session Start**: Track session start time
- **Session End**: Calculate duration
- **File Operations**: Log file edits, creations, deletions
- **Commands**: Log AI commands, search queries
- **Performance**: Measure load times, response times
- **Errors**: Track error rates and types

## Constraints
- Privacy-first: All data local, no external telemetry
- Opt-in: Analytics disabled by default
- Performance: Minimal overhead (<1% performance impact)
- Mobile: Responsive dashboard charts
- Export: Export analytics data as CSV/JSON
- i18n strings via t() function
- 8-bit gaming style (no blur)
- Chart library: Use Recharts or similar lightweight library

## Acceptance Criteria
- [ ] Metrics collector for usage data
- [ ] Performance monitor for app metrics
- [ ] Analytics dashboard with charts
- [ ] Line/bar/pie charts for visualizations
- [ ] Activity heatmap (GitHub-style)
- [ ] Time range selection (24h, 7d, 30d, 12m, custom)
- [ ] Dashboard sections: Overview, Usage, Projects, Performance, AI, Activity
- [ ] Privacy-first: Local storage only, no telemetry
- [ ] Opt-in: Analytics disabled by default
- [ ] Data deletion button
- [ ] Export data as CSV/JSON
- [ ] Mobile: Responsive charts
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained
- [ ] Minimal performance overhead (<1%)

## Skills to Invoke
- `frontend-components` - Build dashboard UI
- `brainstorming` - Design metrics collection
- `global-coding-style` - Analytics patterns
- `global-validation` - Data validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify analytics components
ls -la src/presentation/components/analytics/

# Verify metrics collector
ls -la src/lib/analytics/metrics-collector.ts
```

## Related Issues
- User insights
- Performance monitoring
- Ralph Loop Cycle 5C: Analytics

## Next Action
Create metrics collector, performance monitor, analytics dashboard with charts, and privacy-first data collection.

---
**Handoff ID**: S-034-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
