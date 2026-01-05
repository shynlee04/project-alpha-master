# WebContainer Documentation

## Overview

The WebContainer module (`src/lib/webcontainer/`) provides a singleton-based interface for managing the StackBlitz WebContainer lifecycle. WebContainers enable running Node.js directly in the browser, providing a full development environment within the IDE.

## Architecture

```
src/lib/webcontainer/
├── index.ts                # Barrel export
├── manager.ts              # Singleton WebContainer manager
├── types.ts                # Type definitions
├── terminal-adapter.ts     # Terminal adapter
├── process-manager.ts      # Process management
├── crash-recovery.ts       # Crash recovery
└── __tests__/              # Test files
```

## Core Components

### 1. WebContainer Manager (`manager.ts`)

Singleton manager for WebContainer lifecycle:

```typescript
import { boot, mount, spawn, getInstance, isBooted } from '@/lib/webcontainer';

// Boot WebContainer (only once per page)
const wc = await boot({
    coep: 'require-corp',
    workdirName: 'project',
    forwardPreviewErrors: true,
});

// Mount files
await mount({
    'package.json': { file: { contents: '{"name": "test"}' } },
    'index.js': { file: { contents: 'console.log("hello")' } }
});

// Get current instance
const instance = getInstance();
const booted = isBooted();

// Spawn process
const process = await spawn('node', ['index.js']);
process.output.pipeTo(new WritableStream({
    write(data) { console.log(data); }
}));
```

**Key Functions:**

| Function | Description |
|----------|-------------|
| `boot(options?)` | Boot WebContainer (singleton) |
| `mount(files, mountPoint?)` | Mount file system tree |
| `spawn(command, args?, options?)` | Run command in WebContainer |
| `getFileSystem()` | Get WebContainer FS API |
| `getInstance()` | Get current instance |
| `isBooted()` | Check if booted |
| `onServerReady(callback)` | Listen for server-ready events |
| `setEventBus(bus)` | Set event emitter |

### 2. Terminal Adapter (`terminal-adapter.ts`)

Adapter for terminal/shell operations:

```typescript
import { createTerminalAdapter } from '@/lib/webcontainer/terminal-adapter';

const adapter = createTerminalAdapter({
    cols: 80,
    rows: 24,
    cwd: '/project',
});

// Start interactive shell
const shell = await adapter.startShell();

shell.onData((data) => {
    console.log('Output:', data);
});

shell.write('npm install\n');

// Execute command (non-interactive)
const result = await adapter.executeCommand('node', ['script.js'], {
    timeout: 30000,
});
```

### 3. Process Manager (`process-manager.ts`)

Manages processes running in WebContainer:

```typescript
import { 
    runProcess, 
    killProcess, 
    getActiveProcesses,
    isProcessRunning 
} from '@/lib/webcontainer/process-manager';

// Run process
const process = await runProcess('npm', ['run', 'dev'], {
    cwd: '/project',
    onOutput: (data) => console.log(data),
});

// Check if running
const running = isProcessRunning(process.pid);

// Kill process
await killProcess(process.pid);

// List all active processes
const processes = getActiveProcesses();
```

### 4. Crash Recovery (`crash-recovery.ts`)

Handles WebContainer crashes gracefully:

```typescript
import { CrashRecovery } from '@/lib/webcontainer/crash-recovery';

const recovery = new CrashRecovery();

// Register crash handler
recovery.onCrash(async (error) => {
    console.error('WebContainer crashed:', error);
    await recovery.attemptRecovery();
});

// Manual recovery
const recovered = await recovery.attemptRecovery({
    preserveState: true,
    maxRetries: 3,
});
```

## Key Exports

### Main Module (`src/lib/webcontainer/index.ts`)

```typescript
// Manager functions
export { boot, mount, spawn, getFileSystem, getInstance, isBooted, onServerReady, setEventBus } from './manager';

// Types
export type { WebContainer, FileSystemTree, WebContainerProcess, SpawnOptions, WebContainerManagerOptions } from './types';
export { WebContainerError } from './types';

// Terminal
export { createTerminalAdapter, TerminalAdapterError } from './terminal-adapter';
export type { TerminalAdapterOptions, TerminalAdapter } from './terminal-adapter';

// Process Manager
export { runProcess, killProcess, killAllProcesses, getProcess, getActiveProcesses, getAllProcesses, clearCompletedProcesses, isProcessRunning, ProcessManagerError } from './process-manager';
export type { ProcessInfo, ProcessStatus, RunProcessOptions } from './process-manager';
```

## Integration Points

### With File System

```typescript
import { boot, mount } from '@/lib/webcontainer';
import { walkDirectory } from '@/lib/filesystem/directory-walker';

// Get file tree from local FS
const fileTree = {};
for await (const entry of walkDirectory(handle)) {
    const content = await handle.getFileHandle(entry.name).then(f => f.getFile());
    fileTree[entry.name] = {
        file: { contents: await content.text() }
    };
}

// Mount to WebContainer
await mount(fileTree);
```

### With Agent System

```typescript
import { spawn } from '@/lib/webcontainer';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools';

const terminalTools = createTerminalToolsFacade();

// Execute command through agent
const result = await terminalTools.executeCommand('npm', ['install'], {
    cwd: '/project',
    timeout: 120000,
});
```

### With Events

```typescript
import { setEventBus } from '@/lib/webcontainer';
import { createWorkspaceEventBus } from '@/lib/events';

const eventBus = createWorkspaceEventBus();
setEventBus(eventBus);

eventBus.on('container:booted', ({ bootTime }) => {
    console.log(`WebContainer booted in ${bootTime}ms`);
});
```

## Configuration

### Boot Options

```typescript
interface WebContainerManagerOptions {
    /** Cross-Origin Embedder Policy */
    coep?: 'require-corp' | 'credentialless' | 'none';
    /** Working directory name */
    workdirName?: string;
    /** Forward preview errors to console */
    forwardPreviewErrors?: boolean | 'exceptions-only';
}
```

### Spawn Options

```typescript
interface SpawnOptions {
    /** Working directory */
    cwd?: string;
    /** Environment variables */
    env?: Record<string, string>;
    /** Terminal dimensions */
    terminal?: { cols: number; rows: number };
    /** Stdout/stderr callbacks */
    onOutput?: (data: string) => void;
    /** Timeout in ms */
    timeout?: number;
}
```

## Usage Patterns

### Initial Setup

```typescript
async function initializeWebContainer() {
    try {
        const wc = await boot();
        console.log('WebContainer ready');

        // Mount project files
        const fileTree = await buildFileTree(localHandle);
        await mount(fileTree);

        // Install dependencies
        const install = await spawn('npm', ['install']);
        await install.exit;

        // Start dev server
        const dev = await spawn('npm', ['run', 'dev']);
        dev.output.pipeTo(new WritableStream({
            write(data) { console.log(data); }
        }));

        return wc;
    } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        throw error;
    }
}
```

### Interactive Terminal

```typescript
async function createTerminal() {
    const adapter = createTerminalAdapter({
        cols: 80,
        rows: 24,
        cwd: '/project',
    });

    const shell = await adapter.startShell();

    // Handle user input
    document.addEventListener('keydown', (e) => {
        shell.write(e.key);
    });

    // Handle output
    shell.onData((data) => {
        terminalOutput.value += data;
    });

    return shell;
}
```

### Process Management

```typescript
class ProcessManager {
    private processes = new Map<string, WebContainerProcess>();

    async startServer() {
        const server = await spawn('npm', ['run', 'dev'], {
            onOutput: (data) => this.updateOutput(data),
        });
        this.processes.set('dev-server', server);
    }

    async stopServer() {
        const server = this.processes.get('dev-server');
        if (server) {
            await killProcess(server.pid);
            this.processes.delete('dev-server');
        }
    }

    async cleanup() {
        for (const [name, process] of this.processes) {
            await killProcess(process.pid);
        }
        this.processes.clear();
    }
}
```

## Security Considerations

1. **COOP/COEP Headers**: Required for SharedArrayBuffer support
2. **Process Isolation**: Each process runs in WebContainer sandbox
3. **File System Access**: Limited to mounted files
4. **Network Access**: Limited to same-origin by default

## Known Issues

1. **Singleton Limitation**: Only one WebContainer per page
2. **Boot Time**: Initial boot takes 3-5 seconds
3. **Memory Usage**: WebContainer consumes significant memory

## Developer Notes

- Always use the singleton manager (don't create WebContainer directly)
- Handle boot errors gracefully (show loading state)
- Use process manager for tracking running processes
- Register crash recovery handler for production
- Emit lifecycle events for UI feedback
