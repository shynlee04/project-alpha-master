# 46-03: Tool Execution Metadata Display

**Epic:** EPIC-46 - Space-Aware Agent Orchestration
**Story:** 46-03
**Status:** READY
**Created:** 2026-01-14
**Priority:** P2-MEDIUM
**Team:** Team A

---

## User Story

**As a** user monitoring AI agent activity
**I want** to see which workspace a tool executed in and how long it took
**So that** I can understand agent behavior and performance at a glance

---

## Current Problem

### Limited Execution Feedback

The current `ToolExecutionIndicator` shows:
- Tool name
- Status (pending/executing/completed/failed)
- Error message (if failed)
- Duration (optional)

**Missing:**
- Workspace badge (IDE, Notes, Knowledge, Study)
- Project name
- Execution environment context

### User Impact

Users can't tell:
- Which workspace a tool ran in
- Whether a tool executed in browser mode vs specific project
- Relative performance across workspaces

---

## Acceptance Criteria

### AC1: ToolExecutionIndicator Shows Workspace Badge
- [ ] Workspace type badge displayed (IDE, Notes, Knowledge, Study)
- [ ] Badge uses 8-bit pixel style
- [ ] Badge color-coded by workspace type
- [ ] Compact mode has smaller badge

### AC2: Execution Duration Displayed
- [ ] Duration shown in milliseconds (ms) or seconds (s)
- [ ] Auto-format: >1000ms shows as "1.2s", <1000ms shows as "245ms"
- [ ] Duration shown for completed status only
- [ ] Missing duration shows as "--"

### AC3: Status Icon Animation Smooth
- [ ] Pending → Executing transition animates smoothly
- [ ] Executing spinner uses consistent animation
- [ ] Completed → Failed transition shows error state clearly
- [ ] No flicker during state changes

### AC4: Collapsed Summary Shows Metadata
- [ ] "3 tools in IDE · 245ms avg"
- [ ] "1 tool failed in Notes"
- [ ] Clicking expands to show individual tool details
- [ ] Summary updates in real-time as tools complete

---

## Technical Implementation

### Approach: Extend ToolExecutionIndicator

Add new props to `ToolExecutionIndicator`:
- `workspaceType?: 'ide' | 'knowledge' | 'study' | 'notes'`
- `projectName?: string`
- `duration?: number` (already exists, just ensure formatting)

### Files to Modify

#### 1. `src/presentation/components/chat/ToolExecutionIndicator.tsx`

**Add workspace badge:**

```typescript
export interface ToolExecutionIndicatorProps {
  // ... existing props
  /** Workspace type where tool executed */
  workspaceType?: 'ide' | 'knowledge' | 'study' | 'notes';
  /** Project name (optional) */
  projectName?: string;
}

/**
 * Workspace badge configuration
 */
const WORKSPACE_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  ide: { label: 'IDE', color: 'bg-blue-900/30 border-blue-700/50 text-blue-300', icon: '💻' },
  knowledge: { label: 'Knowledge', color: 'bg-purple-900/30 border-purple-700/50 text-purple-300', icon: '🧠' },
  study: { label: 'Study', color: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300', icon: '📚' },
  notes: { label: 'Notes', color: 'bg-green-900/30 border-green-700/50 text-green-300', icon: '📝' },
};

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  if (ms === undefined || ms === null) return '--';
  if (ms < 0) return '--';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}
```

**Updated component render:**

```tsx
export function ToolExecutionIndicator({
  toolName,
  status,
  error,
  duration,
  workspaceType,
  projectName,
  className,
  compact = true,
}: ToolExecutionIndicatorProps) {
  // ... existing code

  const badge = workspaceType ? WORKSPACE_BADGES[workspaceType] : null;

  return (
    <div className={cn('inline-flex items-center gap-2', statusClasses, className)}>
      {/* Workspace badge */}
      {badge && (
        <span className={cn(
          'px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border',
          badge.color
        )}>
          {badge.icon} {badge.label}
        </span>
      )}

      {/* Tool icon and name */}
      <span className={iconSize} role="img" aria-label={toolName}>
        {icon}
      </span>
      <span className={cn('font-medium', textSize)}>
        {toolName}
      </span>

      {/* ... rest of existing UI */}

      {/* Duration */}
      {duration !== undefined && status === 'completed' && (
        <>
          <span className="text-gray-600">·</span>
          <span className={cn(textSize, 'text-gray-500')}>
            {formatDuration(duration)}
          </span>
        </>
      )}
    </div>
  );
}
```

#### 2. `src/presentation/components/chat/CollapsibleSection.tsx`

**Update summary to include workspace metadata:**

```typescript
interface ToolExecutionSummaryProps {
  executions: ToolExecutionInfo[];
  workspaceType?: string;
  averageDuration?: number;
}

function ToolExecutionSummary({
  executions,
  workspaceType,
  averageDuration
}: ToolExecutionSummaryProps) {
  const completed = executions.filter(e => e.status === 'completed');
  const failed = executions.filter(e => e.status === 'error');

  const summaryParts = [];

  if (workspaceType) {
    const badge = WORKSPACE_BADGES[workspaceType];
    summaryParts.push(`${completed.length + failed.length} tools in ${badge.label}`);
  } else {
    summaryParts.push(`${completed.length + failed.length} tools`);
  }

  if (averageDuration) {
    summaryParts.push(`${formatDuration(averageDuration)} avg`);
  }

  if (failed.length > 0) {
    summaryParts.push(`${failed.length} failed`);
  }

  return <span>{summaryParts.join(' · ')}</span>;
}
```

#### 3. `src/lib/agent/tools/tool-execution-logger.ts`

**Ensure duration is captured and returned:**

The logger already captures duration in `result.duration`. We just need to ensure it's returned to the UI.

---

## Design Specifications

### Workspace Badge Styles

| Workspace | Color | Icon | Label |
|-----------|-------|------|-------|
| IDE | Blue | 💻 | IDE |
| Knowledge | Purple | 🧠 | Knowledge |
| Study | Yellow | 📚 | Study |
| Notes | Green | 📝 | Notes |
| Browser Mode | Green + (B) | 📝 | Notes (B) |

### Duration Formatting

| Duration | Display |
|----------|---------|
| < 1ms | "<1ms" |
| 1-999ms | "245ms" |
| 1000-9999ms | "1.2s" |
| ≥ 10000ms | "12.5s" |

### Status Animations

| Status | Icon | Animation |
|--------|------|-----------|
| Pending | Clock | None |
| Executing | Loader2 | spin |
| Completed | CheckCircle2 | fade-in |
| Failed | XCircle | shake |

---

## Component Examples

### Single Tool with Workspace

```
[💻 IDE] 📄 read_file · Running...
```

### Completed Tool with Duration

```
[📝 Notes] ✅ create_note · Done · 245ms
```

### Failed Tool with Error

```
[🧠 Knowledge] ❌ search_knowledge · Failed · index not ready
```

### Collapsed Group Summary

```
▼ 3 tools in IDE · 1.2s avg
```

### Expanded Group

```
▼ 3 tools in IDE · 1.2s avg
  [💻 IDE] 📄 read_file · Done · 120ms
  [💻 IDE] ⌨️ execute_command · Done · 1150ms
  [💻 IDE] 💾 write_file · Done · 85ms
```

---

## Implementation Tasks

| Task | Type | Effort | Depends On |
|------|------|--------|------------|
| Add workspaceType prop to ToolExecutionIndicator | Implementation | 15m | - |
| Create WORKSPACE_BADGES configuration | Implementation | 15m | - |
| Add formatDuration utility function | Implementation | 10m | - |
| Update ToolExecutionIndicator render | Implementation | 30m | Badges |
| Update CollapsibleSection summary | Implementation | 20m | Indicator |
| Add status animations | Implementation | 15m | - |
| Test workspace badge display | Testing | 15m | All above |
| Test duration formatting | Testing | 10m | All above |

**Total Estimated Effort:** ~1.5 hours

---

## Testing Checklist

### Visual Tests
- [ ] Workspace badge appears in correct color
- [ ] Badge icon matches workspace type
- [ ] Compact mode badge is appropriately smaller
- [ ] Duration formats correctly (<1000ms vs ≥1000ms)

### Animation Tests
- [ ] Status transitions are smooth (no flicker)
- [ ] Spinner animates consistently
- [ ] Failed status shows shake animation

### Integration Tests
- [ ] Badge displays when workspaceType prop provided
- [ ] No error when workspaceType is undefined
- [ ] Duration shows "--" when not provided
- [ ] Collapsed summary updates as tools complete

---

## Handoff

**Story Status:** READY TO IMPLEMENT
**Next Phase:** Implementation

### Files Created
- [x] Story artifact (this file)

### Files to Modify
1. `src/presentation/components/chat/ToolExecutionIndicator.tsx`
2. `src/presentation/components/chat/CollapsibleSection.tsx` (if needed)

### Dependencies
- Requires 46-01 completion (for workspace context data)
- Can be developed in parallel with 46-04

---

## Notes

**Why This Matters:**

1. **Visibility** - Users see where tools execute
2. **Debugging** - Performance issues traced to workspace
3. **Transparency** - Clear indication of agent behavior
4. **Professionalism** - Polished UI with consistent styling

**Complexity Consideration:**

This is a P2 feature because:
- Pure UI enhancement (no behavior change)
- Low implementation risk
- Doesn't block other stories
- Can be added incrementally

**Design Note:**

The 8-bit aesthetic must be maintained:
- Sharp corners on badges (`rounded-none` or `rounded-sm`)
- Pixel shadows
- Solid colors (no gradients)
- Monospace fonts for labels
