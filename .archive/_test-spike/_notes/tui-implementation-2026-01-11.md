# TUI Implementation Documentation

**Document ID:** tui-implementation-2026-01-11  
**Created:** 2026-01-11  
**Author:** Test Spike Harness Implementation  
**Phase:** Implementation

## Overview

This document describes the Terminal User Interface (TUI) implementation for the Test-Spike Harness. The TUI provides a command-line based interface for selecting and running test scenarios, viewing permissions, and monitoring execution.

## Architecture

### Screen Types

The TUI supports the following screen types:

| Screen | Description |
|--------|-------------|
| `scenario-picker` | Main menu for selecting test scenarios |
| `live-run` | Real-time execution view with stdout/stderr |
| `permissions-view` | Permission profile viewer and editor |
| `state-snapshot` | State snapshot viewer for debugging |

### Core Components

#### TerminalUI Class

The main orchestrator class that manages screen navigation and input handling.

```typescript
export class TerminalUI {
  private currentScreen: Screen = 'scenario-picker';
  private scenarios: Map<string, TestScenario> = new Map();
  private logger: SpikeLogger;
  
  async run(): Promise<void> {
    // Main loop - handle input, render screen, process events
  }
  
  async switchScreen(screen: Screen): Promise<void> {
    // Switch between screens with proper cleanup/restore
  }
}
```

#### ScenarioPickerScreen

Allows users to navigate and select test scenarios using keyboard controls.

**Features:**
- List all available scenarios with descriptions
- Keyboard navigation (arrow keys, Enter to select)
- Filter by category or tags
- Show scenario metadata (duration, category, tags)

#### LiveRunScreen

Displays real-time execution progress and output.

**Features:**
- Real-time stdout/stderr streaming
- Tool call visualization
- Progress indicators
- Error highlighting
- Execution timing

#### PermissionsViewScreen

Displays and manages permission profiles.

**Features:**
- View all permission profiles
- Show allowed/denied operations
- Edit path restrictions
- Toggle YOLO mode
- Export/import profiles

#### StateSnapshotScreen

Displays agent state snapshots for debugging.

**Features:**
- View agent messages
- Display tool history
- Show filesystem diffs
- State transition visualization
- Serialization/deserialization

## Input Handling

### Keyboard Controls

| Key | Action |
|-----|--------|
| Arrow Up/Down | Navigate list |
| Enter | Select item |
| Escape | Go back |
| Q | Quit |
| P | Switch to permissions view |
| S | Switch to scenario picker |
| R | Refresh current view |

### Mouse Support

The TUI supports basic mouse clicks for item selection when the terminal supports it.

## Screen Navigation

### Flow Diagram

```
┌─────────────────┐
│ Scenario Picker │◄─────────────────────────┐
└────────┬────────┘                          │
         │ Select Scenario                   │
         ▼                                   │
┌─────────────────┐     ┌─────────────────┐  │
│   Live Run      │────►│ State Snapshot  │  │
└────────┬────────┘     └─────────────────┘  │
         │                                   │
         └─────────────►────────────────────┘
                View Results
```

## Implementation Details

### Rendering

Each screen implements a `render()` method that returns a string representation:

```typescript
interface Screen {
  render(): Promise<string>;
  handleInput(input: string): Promise<void>;
  cleanup(): Promise<void>;
}
```

### Progress Callbacks

Screens receive progress updates through `ScenarioContext`:

```typescript
interface ScenarioContext {
  onProgress(percent: number, message: string): void;
  onStdout(line: string): void;
  onStderr(line: string): void;
  onToolCall(toolName: string, inputs: unknown): void;
}
```

## Error Handling

### Error Types

| Error Type | Handling |
|------------|----------|
| Invalid input | Show error message, stay on current screen |
| Scenario failure | Display error, offer retry |
| Permission denied | Show permission error, suggest profile switch |
| System error | Log error, attempt graceful shutdown |

### Recovery

- All screens support cleanup and restore
- State is preserved across screen switches
- Execution can be resumed after interruption

## Performance Considerations

### Rendering Optimization

- Use incremental updates where possible
- Batch stdout/stderr for performance
- Limit history display to last N entries
- Use pagination for long lists

### Memory Management

- Dispose of event listeners on cleanup
- Limit snapshot history size
- Stream large outputs to files

## Future Enhancements

### Planned Features

1. **Rich formatting** - Colors, bold, underline for better UX
2. **Tables** - Aligned columns for data display
3. **Progress bars** - Visual progress indicators
4. **Split views** - Multiple panels simultaneously
5. **Themes** - Color scheme switching

### Extensibility

- Plugin system for custom screens
- Custom keybindings
- Configurable layouts

## References

- Source: [`_test-spike/_harness/src/tui/index.ts`](_test-spike/_harness/src/tui/index.ts)
- Screens: [`_test-spike/_harness/src/tui/screens.ts`](_test-spike/_harness/src/tui/screens.ts)
- Related: [Logging Specification](logging-spec-2026-01-11.md)

---

**End of Document**
