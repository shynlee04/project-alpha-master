---
title: "Architecture Overview - WebContainers & File System Sync trong Via-gent"
date: 2025-12-24
tags: ["WebContainers", "File System Access API", "Architecture", "React", "TypeScript", "Browser IDE"]
author: "Via-gent Team"
series: "Hành Trình Xây Dựng Via-gent"
series_number: 2
---

# Architecture Overview - WebContainers & File System Sync

**English Abstract**: This article explores the core architecture of Via-gent, focusing on WebContainers API integration and File System Access API for bidirectional file sync. It explains how Via-gent runs Node.js directly in the browser, how files are synced between local file system and WebContainer sandbox, and provides code examples and architectural diagrams.

---

## Giới thiệu WebContainers API

WebContainers là một browser API cho phép chạy Node.js applications trực tiếp trong browser. Đây là công nghệ nền tảng của Via-gent, cho phép chúng ta tạo một development environment hoàn chỉnh mà không cần server.

### WebContainers là gì?

WebContainers là một WebAssembly-based runtime cho phép:
- Chạy Node.js applications trong browser
- Execute npm commands
- Install dependencies
- Run development servers
- Tất cả đều client-side, không cần server

### Tại sao chọn WebContainers?

```
Traditional Approach:
User → Browser → Server (Node.js) → Database

WebContainers Approach:
User → Browser (Node.js) → Local File System
```

**Ưu điểm của WebContainers:**
1. **No server infrastructure**: Không cần maintain backend servers
2. **Fast startup**: 3-5 seconds để boot WebContainer
3. **Client-side only**: Code không покид browser
4. **Consistent environment**: Mọi người dùng có cùng environment
5. **Isolated sandbox**: Code chạy trong sandbox an toàn

---

## WebContainers Architecture trong Via-gent

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Via-gent UI                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │ │
│  │  │ Monaco   │  │  xterm   │  │  File    │  │  AI     │ │ │
│  │  │ Editor   │  │ Terminal │  │  Tree    │  │  Chat   │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              ↓                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              WebContainer Manager                        │ │
│  │  - Boot WebContainer                                     │ │
│  │  - Manage lifecycle                                      │ │
│  │  - Execute commands                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              ↓                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              WebContainer Instance                       │ │
│  │  - Node.js runtime                                       │ │
│  │  - File system (virtual)                                │ │
│  │  - Process manager                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Local File System (FSA)                       │
│  - User's project files                                     │
│  - Synced via File System Access API                        │
└─────────────────────────────────────────────────────────────┘
```

### WebContainer Manager

WebContainer Manager là singleton class quản lý lifecycle của WebContainer:

```typescript
// src/lib/webcontainer/manager.ts
import { WebContainer } from '@webcontainer/api';

class WebContainerManager {
  private static instance: WebContainerManager;
  private webcontainer: WebContainer | null = null;
  private isBooted = false;

  private constructor() {}

  static getInstance(): WebContainerManager {
    if (!WebContainerManager.instance) {
      WebContainerManager.instance = new WebContainerManager();
    }
    return WebContainerManager.instance;
  }

  async boot(): Promise<WebContainer> {
    if (this.isBooted && this.webcontainer) {
      return this.webcontainer;
    }

    console.log('Booting WebContainer...');
    this.webcontainer = await WebContainer.boot();
    this.isBooted = true;
    console.log('WebContainer booted successfully!');

    return this.webcontainer;
  }

  async mount(files: FileSystemTree): Promise<void> {
    if (!this.webcontainer) {
      throw new Error('WebContainer not booted');
    }
    await this.webcontainer.mount(files);
  }

  async spawn(command: string, args: string[]): Promise<ProcessOutput> {
    if (!this.webcontainer) {
      throw new Error('WebContainer not booted');
    }
    const process = await this.webcontainer.spawn(command, args);
    return process.output;
  }
}

export const webcontainerManager = WebContainerManager.getInstance();
```

---

## File System Access API Integration

### File System Access API là gì?

File System Access API là một browser API cho phép web applications đọc và ghi files trực tiếp từ local file system của user.

### Tại sao cần File System Access API?

```
Without FSA:
- User uploads files → Browser processes → User downloads files
- No persistent connection
- Manual sync required

With FSA:
- Browser reads/writes directly to local files
- Persistent connection
- Real-time sync
```

### Local FS Adapter

Via-gent sử dụng `LocalFSAdapter` để tương tác với File System Access API:

```typescript
// src/lib/filesystem/local-fs-adapter.ts
export class LocalFSAdapter {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  async openDirectory(): Promise<FileSystemDirectoryHandle> {
    try {
      this.directoryHandle = await window.showDirectoryPicker();
      return this.directoryHandle;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new PermissionDeniedError('User cancelled directory selection');
      }
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.directoryHandle) {
      throw new FileSystemError('Directory not opened');
    }

    const fileHandle = await this.getFileHandle(path);
    const file = await fileHandle.getFile();
    return file.text();
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new FileSystemError('Directory not opened');
    }

    const fileHandle = await this.getFileHandle(path, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async listFiles(path: string = ''): Promise<string[]> {
    if (!this.directoryHandle) {
      throw new FileSystemError('Directory not opened');
    }

    const dirHandle = path 
      ? await this.getDirectoryHandle(path)
      : this.directoryHandle;

    const files: string[] = [];
    for await (const entry of dirHandle.values()) {
      files.push(entry.name);
    }
    return files;
  }

  private async getFileHandle(
    path: string, 
    options: { create?: boolean } = {}
  ): Promise<FileSystemFileHandle> {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    
    let dirHandle = this.directoryHandle!;
    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part);
    }

    return await dirHandle.getFileHandle(fileName, options);
  }

  private async getDirectoryHandle(path: string): Promise<FileSystemDirectoryHandle> {
    let dirHandle = this.directoryHandle!;
    const parts = path.split('/').filter(Boolean);
    
    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part);
    }
    
    return dirHandle;
  }
}
```

---

## Bidirectional Sync Architecture

### Sync Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Action                              │
│  - Edit file in Monaco Editor                                │
│  - Run command in terminal                                   │
│  - Create new file                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Local FS Adapter                            │
│  - Read/Write local files via FSA                            │
│  - Emit file change events                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Sync Manager                              │
│  - Listen to file changes                                    │
│  - Plan sync operations                                      │
│  - Execute sync in batches                                   │
│  - Apply debouncing                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 WebContainer FS                              │
│  - Mirror local files                                        │
│  - Execute commands on synced files                          │
└─────────────────────────────────────────────────────────────┘
```

### Sync Manager Implementation

```typescript
// src/lib/filesystem/sync-manager.ts
export class SyncManager {
  private localFSAdapter: LocalFSAdapter;
  private webcontainer: WebContainer;
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  private syncTimeout: NodeJS.Timeout | null = null;

  constructor(
    localFSAdapter: LocalFSAdapter,
    webcontainer: WebContainer
  ) {
    this.localFSAdapter = localFSAdapter;
    this.webcontainer = webcontainer;
  }

  async syncAll(): Promise<void> {
    const files = await this.localFSAdapter.listFiles();
    const fileTree: FileSystemTree = {};

    for (const file of files) {
      const content = await this.localFSAdapter.readFile(file);
      fileTree[file] = {
        file: {
          contents: content,
        },
      };
    }

    await this.webcontainer.mount(fileTree);
  }

  async syncFile(path: string): Promise<void> {
    // Add to sync queue
    this.syncQueue.push({ type: 'update', path });

    // Debounce sync
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.processSyncQueue();
    }, 300); // 300ms debounce
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      // Process queue in batches
      const batch = this.syncQueue.splice(0, 10);
      
      for (const operation of batch) {
        await this.executeSyncOperation(operation);
      }

      // Process remaining items
      if (this.syncQueue.length > 0) {
        await this.processSyncQueue();
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    if (operation.type === 'update') {
      const content = await this.localFSAdapter.readFile(operation.path);
      const fileTree: FileSystemTree = {
        [operation.path]: {
          file: {
            contents: content,
          },
        },
      };
      await this.webcontainer.mount(fileTree);
    } else if (operation.type === 'delete') {
      // Handle file deletion
      await this.webcontainer.fs.rm(operation.path, { recursive: true });
    }
  }
}
```

---

## Sync Exclusions

Không phải tất cả files đều cần sync. Via-gent excludes:

```typescript
// src/lib/filesystem/exclusion-config.ts
export const SYNC_EXCLUSIONS = [
  '.git',
  'node_modules',
  '.DS_Store',
  'Thumbs.db',
  '.env',
  '.env.local',
  '.env.*.local',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.cache',
];

export function shouldExclude(path: string): boolean {
  return SYNC_EXCLUSIONS.some(exclusion => {
    if (exclusion.endsWith('*')) {
      return path.startsWith(exclusion.slice(0, -1));
    }
    return path === exclusion || path.startsWith(`${exclusion}/`);
  });
}
```

**Tại sao exclude các files này?**

1. **`.git`**: Git metadata không cần sync, được quản lý bởi git
2. **`node_modules`**: Quá lớn, được regen trong WebContainer bằng `npm install`
3. **`.DS_Store`, `Thumbs.db`**: System files, không cần sync
4. **`.env`**: Sensitive data, không nên sync
5. **`dist`, `build`**: Generated files, không cần sync

---

## File Change Events

Via-gent listens to file changes để trigger sync:

```typescript
// src/lib/filesystem/sync-manager.ts
export class SyncManager {
  // ...

  startWatching(): void {
    // Listen to Monaco Editor changes
    this.monacoEditor.onDidChangeModelContent((event) => {
      const filePath = this.monacoEditor.getModel()?.uri.fsPath;
      if (filePath) {
        this.syncFile(filePath);
      }
    });

    // Listen to terminal commands that modify files
    this.terminal.onCommandExecuted((command) => {
      if (this.commandModifiesFiles(command)) {
        this.syncAll();
      }
    });
  }

  private commandModifiesFiles(command: string): boolean {
    const modifyingCommands = [
      'npm install',
      'npm uninstall',
      'git checkout',
      'git pull',
      'git merge',
    ];

    return modifyingCommands.some(cmd => command.startsWith(cmd));
  }
}
```

---

## Challenges và Solutions

### Challenge 1: WebContainer Boot Time

**Problem**: WebContainer mất 3-5 seconds để boot, gây delay cho user.

**Solution**: 
- Boot WebContainer ngay khi user mở app
- Show loading state với progress indicator
- Cache WebContainer instance (singleton pattern)

```typescript
// Boot WebContainer early
useEffect(() => {
  webcontainerManager.boot().then(() => {
    setIsReady(true);
  });
}, []);
```

### Challenge 2: File Sync Performance

**Problem**: Syncing nhiều files cùng lúc có thể gây performance issues.

**Solution**:
- Debounce sync operations (300ms)
- Batch sync operations (10 files per batch)
- Exclude large directories (node_modules)
- Use incremental sync (chỉ sync changed files)

### Challenge 3: Browser Compatibility

**Problem**: File System Access API không hỗ trợ Safari.

**Solution**:
- Detect browser capabilities
- Fallback to file upload/download cho unsupported browsers
- Show warning message cho Safari users

```typescript
function isFileSystemAPISupported(): boolean {
  return 'showDirectoryPicker' in window;
}

if (!isFileSystemAPISupported()) {
  showWarning('File System Access API not supported. Using fallback mode.');
}
```

### Challenge 4: Permission Management

**Problem**: File System Access API permissions là ephemeral (mất khi đóng tab).

**Solution**:
- Request permissions on app load
- Handle permission denied gracefully
- Show permission reminder nếu permissions expire

```typescript
async function requestPermissions(): Promise<void> {
  try {
    await localFSAdapter.openDirectory();
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      showError('Permission denied. Please grant file system access.');
    }
  }
}
```

---

## Code Example: Complete Sync Flow

```typescript
// Complete example of syncing a file
async function syncFileExample() {
  // 1. Boot WebContainer
  const webcontainer = await webcontainerManager.boot();

  // 2. Open local directory
  const localFSAdapter = new LocalFSAdapter();
  await localFSAdapter.openDirectory();

  // 3. Create sync manager
  const syncManager = new SyncManager(localFSAdapter, webcontainer);

  // 4. Sync all files initially
  await syncManager.syncAll();

  // 5. Start watching for changes
  syncManager.startWatching();

  // 6. User edits file in Monaco Editor
  monacoEditor.setValue('console.log("Hello, Via-gent!");');

  // 7. File change detected, sync triggered
  // (handled automatically by syncManager)

  // 8. Run command in terminal
  await webcontainer.spawn('node', ['index.js']);

  // 9. Output: "Hello, Via-gent!"
}
```

---

## Performance Optimization Tips

### 1. Lazy Loading

Chỉ load WebContainer khi cần:

```typescript
function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

  const boot = useCallback(async () => {
    if (!webcontainer) {
      const instance = await webcontainerManager.boot();
      setWebcontainer(instance);
    }
  }, [webcontainer]);

  return { webcontainer, boot };
}
```

### 2. Debouncing

Debounce file sync để tránh quá nhiều sync operations:

```typescript
const debouncedSync = debounce((path: string) => {
  syncManager.syncFile(path);
}, 300);
```

### 3. Batching

Batch sync operations để giảm số lượng API calls:

```typescript
async function batchSync(paths: string[]): Promise<void> {
  const fileTree: FileSystemTree = {};
  
  for (const path of paths) {
    const content = await localFSAdapter.readFile(path);
    fileTree[path] = { file: { contents: content } };
  }
  
  await webcontainer.mount(fileTree);
}
```

---

## Key Takeaways

1. **WebContainers cho phép chạy Node.js trong browser**, không cần server infrastructure
2. **File System Access API cho phép read/write local files**, tạo persistent connection
3. **Bidirectional sync giữ WebContainer và local FS synchronized**, đảm bảo consistency
4. **Debouncing và batching giúp optimize performance**, tránh quá nhiều sync operations
5. **Sync exclusions giảm unnecessary sync**, focus trên source code files

---

## What's Next?

Trong bài tiếp theo, tôi sẽ đi sâu vào **AI Agent System**, cụ thể là:
- Multi-provider AI support (OpenRouter, Anthropic, OpenAI)
- Provider adapter pattern
- Tool facades (FileTools, TerminalTools)
- Streaming chat implementation

Hãy theo dõi series này để hiểu rõ hơn về cách Via-gent integrate AI agents!

---

## Suggested Social Media Posts

### LinkedIn
```
Architecture của Via-gent: WebContainers + File System Sync 🏗️

Chạy Node.js trong browser? Có thể! 🤯

WebContainers API cho phép Via-gent:
✅ Run Node.js applications client-side
✅ Execute npm commands
✅ Install dependencies
✅ Tất cả đều không cần server!

File System Access API giúp:
✅ Read/write local files trực tiếp
✅ Persistent connection
✅ Real-time sync

Đọc full article tại: [link]

#ViaGent #WebContainers #BrowserIDE #Architecture #React #TypeScript
```

### Facebook
```
Bạn có biết Via-gent chạy Node.js trong browser? 🚀

Không cần server, không cần backend!
WebContainers API làm cho điều này trở nên khả thi:

📁 File System Access API → Sync local files
🏗️ WebContainer → Run Node.js in browser
🔄 Sync Manager → Keep everything in sync

Kết quả: Một IDE hoàn chỉnh chạy 100% client-side!

Đọc bài 2 trong series "Hành trình xây dựng Via-gent" tại: [link]

#ViaGent #WebContainers #BrowserIDE #DeveloperTools
```

### Twitter/X
```
Via-gent Architecture: WebContainers + File System Sync 🏗️

How it works:
1. WebContainer boots Node.js in browser (3-5s)
2. File System Access API reads/writes local files
3. Sync Manager keeps everything synchronized
4. All client-side, no server needed!

Read the deep dive: [link]

#ViaGent #WebContainers #BrowserIDE #Architecture
```

---

## Resources

- **WebContainers Docs**: [webcontainer.io](https://webcontainer.io)
- **File System Access API**: [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- **GitHub**: [github.com/yourusername/via-gent](https://github.com/yourusername/via-gent)
- **Live Demo**: [via-gent.dev](https://via-gent.dev)

---

*Đây là bài thứ hai trong series "Hành Trình Xây Dựng Via-gent". Hãy theo dõi để không bỏ lỡ các bài tiếp theo!*