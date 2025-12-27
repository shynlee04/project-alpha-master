# IndexedDB Persistence Patterns (IDB Library)

**Date**: 2025-12-10
**Source**: Context7 /jakearchibald/idb
**Status**: MCP-VALIDATED ✅

## IDB Library Overview

The `idb` library is a tiny wrapper around IndexedDB with Promise support and convenience methods.

```bash
npm install idb
```

## Core Patterns

### 1. Open Database with Schema
```typescript
import { openDB } from 'idb';

const db = await openDB('via-gent-db', 1, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // Create object stores
    if (!db.objectStoreNames.contains('messages')) {
      const store = db.createObjectStore('messages', { keyPath: 'id' });
      store.createIndex('sessionId', 'sessionId');
      store.createIndex('timestamp', 'timestamp');
    }
    
    if (!db.objectStoreNames.contains('sessions')) {
      db.createObjectStore('sessions', { keyPath: 'id' });
    }
  },
});
```

### 2. CRUD Operations
```typescript
// PUT (create/update)
await db.put('messages', {
  id: 'msg-123',
  sessionId: 'session-abc',
  role: 'user',
  content: 'Hello',
  timestamp: Date.now(),
});

// GET by key
const message = await db.get('messages', 'msg-123');

// GET ALL
const allMessages = await db.getAll('messages');

// DELETE
await db.delete('messages', 'msg-123');

// CLEAR store
await db.clear('messages');
```

### 3. Index Queries
```typescript
// Get by index
const sessionMessages = await db.getAllFromIndex(
  'messages', 
  'sessionId', 
  'session-abc'
);

// Get with cursor
let cursor = await db.transaction('messages').store.openCursor();
while (cursor) {
  console.log(cursor.key, cursor.value);
  cursor = await cursor.continue();
}
```

### 4. Transactions
```typescript
const tx = db.transaction(['messages', 'sessions'], 'readwrite');

await Promise.all([
  tx.objectStore('messages').put(message),
  tx.objectStore('sessions').put(session),
  tx.done,
]);
```

## Via-Gent Implementation Pattern

### MemoryService IndexedDB Adapter
```typescript
// src/infrastructure/persistence/IndexedDBAdapter.ts
import { openDB, type IDBPDatabase } from 'idb';
import type { Message, Session } from '@/domains/memory/contracts';

interface ViaGentDB {
  messages: Message;
  sessions: Session;
}

class IndexedDBAdapter {
  private dbPromise: Promise<IDBPDatabase<ViaGentDB>>;

  constructor() {
    this.dbPromise = openDB<ViaGentDB>('via-gent', 1, {
      upgrade(db) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
        messagesStore.createIndex('sessionId', 'sessionId');
        
        db.createObjectStore('sessions', { keyPath: 'id' });
      },
    });
  }

  async saveMessage(message: Message): Promise<void> {
    const db = await this.dbPromise;
    await db.put('messages', message);
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('messages', 'sessionId', sessionId);
  }

  async saveSession(session: Session): Promise<void> {
    const db = await this.dbPromise;
    await db.put('sessions', session);
  }

  async getAllSessions(): Promise<Session[]> {
    const db = await this.dbPromise;
    return db.getAll('sessions');
  }
}
```

## Integration with TanStack AI useChat

```typescript
// In chat hook
const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  initialMessages: await indexedDBAdapter.getSessionMessages(sessionId),
  onFinish: async (message) => {
    await indexedDBAdapter.saveMessage(message);
  },
});
```

## Files to Create

1. `src/infrastructure/persistence/IndexedDBAdapter.ts` - Main adapter
2. Update `src/domains/memory/core/MemoryService.ts` - Inject adapter
3. Update `src/core/state/PersistMiddleware.ts` - Add IndexedDB impl

## Current TODOs in Codebase

| File | Line | TODO |
|------|------|------|
| `MemoryService.ts` | 9 | IndexedDB persistence (TODO: future implementation) |
| `MemoryService.ts` | 37 | Enable IndexedDB persistence |
| `MemoryService.ts` | 201 | Load from IndexedDB for non-active sessions |
| `PersistMiddleware.ts` | 120 | IndexedDB implementation would go here |
| `PersistMiddleware.ts` | 154 | IndexedDB implementation would go here |
| `PersistMiddleware.ts` | 169 | IndexedDB implementation would go here |
| `LLMService.ts` | 48-50 | Store key in IndexedDB |

## Dependencies

```json
{
  "idb": "^8.0.0"
}
```

## References
- [idb GitHub](https://github.com/jakearchibald/idb)
- [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
