# Infrastructure Security Implementations

## Overview

The infrastructure layer implements several security measures to protect sensitive data and ensure secure file system access.

### Security Features

- **Credential Encryption**: AES-256-GCM encryption for API keys
- **FSA Permission Management**: File System Access API permission handling
- **Migration Audit Logging**: Track all schema changes
- **LocalStorage Isolation**: Separate storage for migration flags
- **Data Isolation**: Per-project data isolation in IndexedDB

---

## Credential Encryption

### Architecture

```
API Key → Encryption (AES-256-GCM) → Encrypted Data → IndexedDB
         ↑                    ↓
      PBKDF2              + IV + AuthTag
   Key Derivation
```

### Encryption Implementation

```typescript
import { encrypt, decrypt } from '@/lib/agent/providers/credential-encryption';

const PLAINTEXT = 'sk-abc123...';

// Encrypt
const { encrypted, iv, authTag } = await encrypt(PLAINTEXT);

// Store in IndexedDB
await db.credentials.put({
  providerId: 'openrouter',
  encryptedKey: encrypted,
  iv: iv,
  authTag: authTag,
  createdAt: Date.now(),
});

// Decrypt
const decrypted = await decrypt(encrypted, iv, authTag);
```

### Encryption Details

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-256-GCM |
| Key Derivation | PBKDF2 (100,000 iterations) |
| IV Length | 12 bytes |
| Auth Tag Length | 16 bytes |

### Credential Vault

```typescript
import { credentialVault } from '@/lib/agent/providers/credential-vault';

// Save credential (encrypted)
await credentialVault.saveCredential('openrouter', 'sk-abc123...');

// Get credential (decrypted)
const apiKey = await credentialVault.getCredential('openrouter');

// Check if credential exists
const exists = await credentialVault.hasCredential('openrouter');

// Delete credential
await credentialVault.deleteCredential('openrouter');
```

---

## File System Access (FSA) Permissions

### Permission States

```typescript
type PermissionStatus = 'unknown' | 'granted' | 'prompt' | 'denied';

interface FSAHandleRecord {
  projectId: string;
  handle: FileSystemDirectoryHandle;
  permissionStatus: PermissionStatus;
  lastAccessedAt: number;
  createdAt: number;
  updatedAt: number;
}
```

### Permission Management

```typescript
import { fsaPermissionManager } from '@/infrastructure/sync/adapters/fsa-permission-manager';

// Request permission
const granted = await fsaPermissionManager.requestPermission(handle);

// Check permission status
const status = await fsaPermissionManager.getPermissionStatus(handle);

// Verify permission is still valid
const isValid = await fsaPermissionManager.verifyPermission(handle);
```

### Permission Persistence

```typescript
import { storeFSAHandle, getFSAHandle, updateFSAHandleStatus } from '@/infrastructure/persistence/dexie-db';

// Store handle for later use
await storeFSAHandle({
  projectId: 'project-123',
  handle: directoryHandle,
  permissionStatus: 'granted',
});

// Retrieve handle
const record = await getFSAHandle('project-123');
if (record) {
  const handle = record.handle;
  // Handle is ready for use
}

// Update permission status
await updateFSAHandleStatus('project-123', 'denied');
```

### Permission Flow

```
1. User opens project directory
2. Browser prompts for permission
3. User grants/denies permission
4. Handle stored in IndexedDB
5. On reload, check stored permission
6. Request permission if needed
```

---

## Migration Security

### Migration Audit Logging

```typescript
import { logDexieMigration } from '@/infrastructure/persistence/dexie-db-migrations';

// Log migration start
logDexieMigration(9, 'epic-24-schema', 'started');

// Log migration completion
logDexieMigration(9, 'epic-24-schema', 'completed', {
  tableName: 'fileMetadata',
  itemsCount: 0
});

// Log migration failure
logDexieMigration(9, 'epic-24-schema', 'failed', {
  tableName: 'fileMetadata',
  error: 'Migration failed'
});
```

### Migration Isolation

Migrations are tracked in localStorage to prevent re-execution:

```typescript
// Check if migration was applied
function isMigrationApplied(version: number): boolean {
  const key = `dexie-migration-v${version}-applied`;
  return localStorage.getItem(key) === 'true';
}

// Mark as applied
function markMigrationApplied(version: number): void {
  const key = `dexie-migration-v${version}-applied`;
  localStorage.setItem(key, 'true');
}
```

---

## Data Isolation

### Project-Level Isolation

All data is scoped to project IDs:

```typescript
// ❌ Bad: Querying all data
await db.sources.toArray();

// ✅ Good: Querying by project
await db.sources.where('projectId').equals('project-123').toArray();
```

### Workspace Isolation

```typescript
interface WorkspaceBindings {
  ide: boolean;
  knowledge: boolean;
  notes: boolean;
  study: boolean;
}

// Check if workspace is enabled for project
const isKnowledgeEnabled = project.workspaceBindings.knowledge;
```

### IndexedDB Security

- **Same-Origin Policy**: Data only accessible from same origin
- **No Cross-Domain Access**: IndexedDB cannot be accessed from other domains
- **Browser Sandbox**: Each browser profile has separate storage

---

## Security Best Practices

### 1. Never Log Sensitive Data

```typescript
// ❌ Bad: Logging credentials
console.log('Saving credential:', apiKey);

// ✅ Good: Logging without sensitive data
console.log('Saving credential for provider:', providerId);
```

### 2. Validate File Paths

```typescript
// Validate file path before operations
function validatePath(path: string): void {
  if (path.includes('..')) {
    throw new Error('Invalid path: directory traversal not allowed');
  }
  if (path.startsWith('/')) {
    throw new Error('Invalid path: absolute paths not allowed');
  }
}
```

### 3. Handle Permission Denials

```typescript
async function openDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await window.showDirectoryPicker();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('User cancelled directory selection');
      return null;
    }
    console.error('Permission denied:', error);
    return null;
  }
}
```

### 4. Secure Data Cleanup

```typescript
// Clear sensitive data on logout
async function clearSensitiveData(): Promise<void> {
  // Clear tool execution logs
  await clearToolExecutionLogs();
  
  // Clear session snapshots
  await clearExpiredSessionSnapshots();
  
  // Clear FSA handles
  await clearAllFSAHandles();
}
```

---

## Security Limitations

### Browser-Based Security

- **No Server-Side Encryption**: All encryption/decryption happens client-side
- **Physical Access Risk**: Device access = data access
- **No Password Protection**: Database not encrypted with user password

### IndexedDB Limitations

- **No Built-in Encryption**: Database contents visible to extensions/apps
- **Browser Access**: Extensions with appropriate permissions can access data
- **Memory Exposure**: Data in memory not encrypted

### FSA Limitations

- **Permission Scope**: Permission applies to entire directory
- **Revocation**: User can revoke permission at any time
- **No Granular Control**: Cannot limit to specific files

---

## Security Checklist

### Development

- [ ] Never commit API keys or credentials
- [ ] Use environment variables for secrets
- [ ] Log without sensitive data
- [ ] Validate all inputs
- [ ] Handle permission denials gracefully

### Production

- [ ] Use HTTPS for all communications
- [ ] Implement Content Security Policy
- [ ] Regular security audits
- [ ] Monitor for unauthorized access
- [ ] Plan for data breach response

---

## Compliance Considerations

### Data Privacy

- **GDPR**: User data can be exported/deleted
- **Local Storage**: Data stored on user's device
- **No Third-Party Sharing**: Data never sent to external servers

### Data Retention

| Data Type | Retention | Cleanup Method |
|-----------|-----------|----------------|
| Sync Status | 7 days | `clearOldSyncStatus()` |
| Tool Execution Logs | 30 days | `clearOldToolExecutionLogs()` |
| Session Snapshots | 7 days | `clearExpiredSessionSnapshots()` |
| FSA Handles | Until revoked | Manual deletion |

---

## Security Testing

### Manual Testing

1. Test permission prompts
2. Test permission denial handling
3. Test credential encryption/decryption
4. Test data isolation between projects
5. Test cleanup operations

### Automated Testing

```typescript
describe('Security', () => {
  it('should encrypt credentials', async () => {
    const { encrypted, iv, authTag } = await encrypt('test-key');
    expect(encrypted).not.toBe('test-key');
    expect(iv).toBeDefined();
    expect(authTag).toBeDefined();
  });

  it('should decrypt credentials', async () => {
    const { encrypted, iv, authTag } = await encrypt('test-key');
    const decrypted = await decrypt(encrypted, iv, authTag);
    expect(decrypted).toBe('test-key');
  });

  it('should isolate data by project', async () => {
    const project1Sources = await getSourcesForProject('project-1');
    const project2Sources = await getSourcesForProject('project-2');
    expect(project1Sources).not.toEqual(project2Sources);
  });
});
```
