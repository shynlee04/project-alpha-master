# WebContainers Terminal Integration Patterns

**Date**: 2025-12-10
**Source**: DeepWiki stackblitz/webcontainer-docs, xtermjs/xterm.js
**Status**: MCP-VALIDATED ✅

## Complete Integration Pattern

### 1. Initialize xterm.js Terminal
```typescript
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

const terminal = new Terminal({
  convertEol: true,
  fontSize: 13,
  fontFamily: 'JetBrains Mono, monospace',
  cursorBlink: true,
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(containerElement);
fitAddon.fit();
```

### 2. Spawn Shell Process
```typescript
// Use 'jsh' - WebContainers built-in shell
const shellProcess = await webcontainerInstance.spawn('jsh', [], {
  terminal: {
    cols: terminal.cols,
    rows: terminal.rows,
  },
});
```

### 3. Connect Output Stream (Process → Terminal)
```typescript
shellProcess.output.pipeTo(
  new WritableStream({
    write(data) {
      terminal.write(data);
    },
  })
);
```

### 4. Connect Input Stream (Terminal → Process)
```typescript
const writer = shellProcess.input.getWriter();
terminal.onData((data) => {
  writer.write(data);
});
```

### 5. Handle Resize
```typescript
terminal.onResize(({ cols, rows }) => {
  shellProcess.resize({ cols, rows });
});

// Also handle window resize
window.addEventListener('resize', () => {
  fitAddon.fit();
});
```

### 6. Handle Process Exit
```typescript
shellProcess.exit.then((code) => {
  terminal.writeln(`[Process exited with code ${code}]`);
  // Clean up writer, process references
});
```

### 7. Proper Disposal
```typescript
// On component unmount
terminal.dispose();
// Kill process if still running
if (shellProcess) {
  shellProcess.kill();
}
```

## Via-Gent Implementation Status

**Location**: `src/components/ide/XTerminal.tsx`

| Pattern | Implementation | Status |
|---------|----------------|--------|
| Terminal init | ✅ Lines 55-85 | CORRECT |
| Spawn with cols/rows | ✅ Lines 166-168 | CORRECT |
| Output pipeTo | ✅ Lines 178-184 | CORRECT |
| Input onData | ✅ Lines 197-199 | CORRECT |
| Resize handling | ⚠️ Lines 201-210 | NEEDS FIX: Uses stty instead of process.resize |
| Process exit cleanup | ✅ Lines 212-221 | CORRECT |
| Terminal disposal | ❌ Missing | NEEDS CREATE |

## Fix Required

**Issue**: `XTerminal.tsx` line 203 uses `webcontainer.spawn('stty', ...)` for resize instead of `process.resize()`

**Correct Pattern**:
```typescript
terminal.onResize(({ cols, rows }) => {
  shellProcess.resize({ cols, rows });
});
```

**Current Code** (incorrect):
```typescript
instance.terminal.onResize(({ cols, rows }) => {
  webcontainer.spawn('stty', ['cols', String(cols), 'rows', String(rows)]);
});
```

## References

- [WebContainer spawn API](https://webcontainers.io/api#spawn)
- [xterm.js Terminal API](https://xtermjs.org/docs/api/terminal/classes/terminal/)
- [FitAddon](https://github.com/xtermjs/xterm.js/tree/master/addons/addon-fit)
