# Logging Infrastructure Specification

**Document ID:** logging-spec-2026-01-11  
**Created:** 2026-01-11  
**Author:** Test Spike Harness Implementation  
**Phase:** Implementation

## Overview

This document describes the logging infrastructure for the Test-Spike Harness. The logging system provides dual-output logging (human-readable + machine-readable JSON) for comprehensive observability and debugging.

## Architecture

### Dual-Stream Logging

The logging system writes to two separate streams simultaneously:

1. **Human-Readable Stream** (`run-log.txt`)
   - Formatted for easy reading by developers
   - Includes timestamps, levels, and messages
   - Color-coded output (where supported)

2. **Machine-Readable Stream** (`run-log.json`)
   - Structured JSON for parsing and analysis
   - Includes all metadata
   - Suitable for log aggregation tools

### Log Entry Structure

#### Human-Readable Format

```
[2026-01-11T23:47:00.000Z] [INFO] Test started
[2026-01-11T23:47:01.000Z] [TOOL] read_file - /test/file.txt - ✅
[2026-01-11T23:47:02.000Z] [PERMISSION] read - granted - profile: read-only
[2026-01-11T23:47:03.000Z] [ERROR] Permission denied: cannot write /etc/passwd
```

#### JSON Format

```json
{
  "timestamp": "2026-01-11T23:47:00.000Z",
  "level": "info",
  "category": "test",
  "message": "Test started",
  "runId": "test-run-123"
}
```

### Tool Call Log Structure

```typescript
interface ToolCallLog {
  timestamp: string;          // ISO 8601 timestamp
  toolName: string;           // Name of the tool invoked
  inputs: unknown;            // Input parameters
  permissionsEvaluated: PermissionResult[];
  output: unknown;            // Tool output (if successful)
  latency: number;            // Execution time in milliseconds
  error?: string;             // Error message (if failed)
}

interface PermissionResult {
  permission: string;
  granted: boolean;
  reason: string;
  profile?: string;
}
```

## Core Components

### SpikeLogger Class

The main logging class that manages dual-stream output.

```typescript
export class SpikeLogger {
  humanLogStream: WriteStream;
  jsonLogStream: WriteStream;
  
  constructor(options: {
    humanLogPath: string;
    jsonLogPath: string;
  }) {
    // Initialize log streams
  }
  
  log(level: LogLevel, message: string, data?: unknown): void {
    // Write to both streams
  }
  
  logToolCall(call: ToolCallLog): void {
    // Log tool invocation with full details
  }
  
  logStateTransition(from: AgentState, to: AgentState): void {
    // Log state changes
  }
  
  logPermissionCheck(permission: string, result: PermissionResult): void {
    // Log permission evaluations
  }
}
```

### MetricsCollector Class

Collects and aggregates run metrics.

```typescript
export interface RunMetrics {
  totalToolCalls: number;
  successfulToolCalls: number;
  failedToolCalls: number;
  totalLatency: number;
  permissionDenied: number;
  stateTransitions: number;
}

export class MetricsCollector {
  recordToolCall(result: ToolCallResult): void;
  recordPermissionDenied(permission: string): void;
  recordStateTransition(from: AgentState, to: AgentState): void;
  getMetrics(): RunMetrics;
  reset(): void;
}
```

## Log Levels

| Level | Description | Usage |
|-------|-------------|-------|
| `debug` | Detailed debugging information | Development, troubleshooting |
| `info` | General informational messages | Normal operation |
| `warn` | Warning conditions | Potential issues |
| `error` | Error conditions | Failures, exceptions |
| `fatal` | Critical failures | System-level failures |

## Categories

| Category | Description |
|----------|-------------|
| `test` | Test execution lifecycle |
| `tool` | Tool invocations and results |
| `permission` | Permission checks and results |
| `state` | State transitions |
| `system` | System-level events |
| `ui` | TUI events |

## Log File Locations

| Log Type | Location | description |
|----------|----------|---------|
| Human | `_test-spike/_notes/run-log.txt` | Developer debugging |
| JSON | `_test-spike/_notes/run-log.json` | Analysis, parsing |
| Metrics | `_test-spike/_notes/metrics.json` | Aggregated metrics |

## Usage Examples

### Basic Logging

```typescript
const logger = new SpikeLogger({
  humanLogPath: '_test-spike/_notes/run-log.txt',
  jsonLogPath: '_test-spike/_notes/run-log.json',
});

logger.log('info', 'Test scenario started', { scenarioId: 'agent-tool-execution' });
```

### Tool Call Logging

```typescript
const toolCall: ToolCallLog = {
  timestamp: new Date().toISOString(),
  toolName: 'read_file',
  inputs: { path: '/test/file.txt' },
  permissionsEvaluated: [{
    permission: 'read',
    granted: true,
    reason: 'allowed',
    profile: 'read-only',
  }],
  output: { content: 'file content' },
  latency: 42,
};

logger.logToolCall(toolCall);
```

### Permission Check Logging

```typescript
logger.logPermissionCheck('write', {
  permission: 'write',
  granted: false,
  reason: 'denied by profile',
  profile: 'read-only',
});
```

## Performance Considerations

### Batch Writing

For high-frequency logs, consider batching:

```typescript
class BatchedLogger {
  private buffer: LogEntry[] = [];
  private batchSize = 100;
  private flushInterval = 1000; // 1 second
  
  private flush(): void {
    // write_to_file buffer to both streams
    this.buffer = [];
  }
}
```

### File Rotation

For long-running tests, implement log rotation:

```typescript
function rotateLogs(logger: SpikeLogger): void {
  // Close current streams
  // Rename files with timestamp
  // Reopen with new files
}
```

## Analysis Tools

### JSON Log Analysis

```bash
# Count errors
cat run-log.json | jq '[. | select(.level == "error")] | length'

# Find permission denied
cat run-log.json | jq '. | select(.message | contains("Permission denied"))'

# Get tool call statistics
cat run-log.json | jq '[. | select(.category == "tool")] | group_by(.toolName) | .[] | {tool: .[0].toolName, count: . | length}'
```

### Human Log Analysis

```bash
# Show last 50 lines
tail -n 50 run-log.txt

# Find errors
grep "\[ERROR\]" run-log.txt

# Filter by category
grep "\[TOOL\]" run-log.txt
```

## Best Practices

1. **Use appropriate log levels** - Don't over-log at info level
2. **Include context** - Add relevant data to log entries
3. **Use categories** - Organize logs by functionality
4. **Monitor metrics** - Track run metrics for trends
5. **Rotate logs** - Prevent unbounded disk usage
6. **Validate structure** - Ensure JSON logs are valid

## References

- Source: [`_test-spike/_harness/src/instrumentation/logger.ts`](_test-spike/_harness/src/instrumentation/logger.ts)
- Metrics: [`_test-spike/_harness/src/instrumentation/metrics.ts`](_test-spike/_harness/src/instrumentation/metrics.ts)
- Related: [TUI Implementation](tui-implementation-2026-01-11.md)

---

**End of Document**
