# Comprehensive Deep Scan Diagnostic Report

**Generated**: 2026-01-06T02:20:00+07:00
**Scan Focus**: Critical console error patterns from production logs
**Thoroughness**: Very Thorough (root cause analysis)
**Scanner**: BMAD Deep Scan Orchestrator (Manual Execution)

---

## Executive Summary

This report analyzes **4 critical error patterns** observed in production console logs, providing **root cause analysis**, **code locations**, **architectural dependencies**, and **remediation priorities**.

### Critical Findings

| Issue | Severity | Root Cause | Status |
|-------|----------|------------|--------|
| **Storage Middleware Failure** | P0 | Dexie database not initialized before RAG store hydration | Blocking |
| **Deprecated Import Paths** | P1 | ADR-024 migration incomplete (34 files still using old path) | Technical Debt |
| **Crypto Key Export Failure** | P0 | Master key generated as non-extractable, then exported | Blocking |
| **SSR Hydration Mismatch** | P2 | Theme provider SSR compatibility issue | Minor |

---

## 1. Storage/State Management Failures

### Error Pattern
```
[DexieStorage] Failed to get item 'rag-state': TypeError: Cannot read properties of undefined (reading 'get')
Location: dexie-storage.ts:120, rag-store.ts:38
```

### Root Cause Analysis

**PRIMARY ISSUE**: Database initialization race condition

The RAG store attempts to hydrate before the Dexie database instance is fully initialized. Here's the failure sequence:

1. **rag-store.ts:54** - Creates Dexie storage adapter during store definition
   ```typescript
   storage: createJSONStorage(() => createDexieStorage('ragState' as keyof typeof import('../../dexie-db').db)),
   ```

2. **dexie-storage.ts:117** - `getItem()` calls `getDb()` to get database instance
   ```typescript
   const database = getDb();
   if (!database) return null;
   const table = database[tableName] as Table<PersistedStateRecord, string>;
   ```

3. **dexie-db.ts:191-203** - `getDb()` creates instance but opens database asynchronously
   ```typescript
   export function getDb(): ViaGentDatabase | null {
     if (typeof window === 'undefined') return null;
     if (!dbInstance) {
       dbInstance = new ViaGentDatabase();
       dbInstance.open().catch((err) => { /* async error */ }); // FIRE-AND-FORGET
     }
     return dbInstance;
   }
   ```

4. **FAILURE**: Table properties (`database['ragState']`) are `undefined` because `dbInstance.open()` hasn't completed yet.

**CONTRIBUTING FACTORS**:

- **Line 54 TODO comment** confirms missing schema:
  ```typescript
  // TODO: Add 'ragState' table to ViaGentDatabase schema (dexie-db-class.ts)
  // For now, using type assertion to bypass schema check
  ```
  The `'ragState' as keyof typeof import('../../dexie-db').db` type assertion bypasses TypeScript validation, but the table doesn't exist in the schema.

- **Zustand persist middleware** calls `getItem()` immediately on store creation, before database tables are attached.

- **No initialization guard** in `createDexieStorage()` to wait for `db.open()` to complete.

### Code Locations

**File**: `src/infrastructure/persistence/stores/rag/rag-store.ts`
- **Line 54**: Storage adapter creation with type assertion
- **Line 38**: Store definition with persist middleware

**File**: `src/infrastructure/persistence/dexie-storage.ts`
- **Line 117-125**: `getItem()` method that fails
- **Line 119**: Table access that throws TypeError

**File**: `src/infrastructure/persistence/dexie-db.ts`
- **Line 191-203**: `getDb()` with async `open()` call
- **Line 198**: Fire-and-forget `dbInstance.open()` doesn't await completion

**File**: `src/infrastructure/persistence/dexie-db-class.ts`
- **Location**: Database schema definition (missing `ragState` table)

### Architectural Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Startup                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RAG Store Definition (rag-store.ts)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ persist(set, get, api, {                              │ │
│  │   name: 'rag-state',                                  │ │
│  │   storage: createDexieStorage('ragState') ← IMMEDIATE │ │
│  │ })                                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          createDexieStorage('ragState')                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ getItem: async (name) => {                            │ │
│  │   const database = getDb();  ← Returns instance       │ │
│  │   const table = database[tableName]; ← FAILS HERE     │ │
│  │ }                                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               getDb() (dexie-db.ts)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ if (!dbInstance) {                                    │ │
│  │   dbInstance = new ViaGentDatabase();                 │ │
│  │   dbInstance.open().catch(...) ← ASYNC, NOT AWAITED  │ │
│  │ }                                                      │ │
│  │ return dbInstance; ← Returns before open() completes  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Verification Commands

```bash
# 1. Check if ragState table exists in schema
grep -r "ragState" src/infrastructure/persistence/dexie-db-class.ts

# 2. Find all stores using createDexieStorage
grep -r "createDexieStorage" src/infrastructure/persistence/stores --include='*.ts'

# 3. Check for getDb() usage patterns
grep -r "getDb()" src/infrastructure/persistence --include='*.ts' -A 2

# 4. Verify database initialization timing
grep -r "dbInstance.open()" src/infrastructure/persistence/dexie-db.ts -B 5 -A 5
```

### Remediation Priority

**P0 - BLOCKING**: This prevents RAG store from persisting state, breaking knowledge indexing and search functionality.

### Remediation Plan

**Option 1: Add ragState table to schema (RECOMMENDED)**
```typescript
// src/infrastructure/persistence/dexie-db-class.ts
export class ViaGentDatabase extends Dexie {
  persistedState!: Table<PersistedStateRecord, string>;

  constructor() {
    super('ViaGentDatabase');
    this.version(1).stores({
      // ... existing tables
      persistedState: 'id,updatedAt', // Add this table
    });
  }
}
```

**Option 2: Fix createDexieStorage to wait for initialization**
```typescript
// src/infrastructure/persistence/dexie-storage.ts
export function createDexieStorage(tableName: keyof typeof db) {
  let dbInitPromise: Promise<ViaGentDatabase | null> | null = null;

  return {
    getItem: async (name: string): Promise<string | null> => {
      // Wait for database to be ready
      if (!dbInitPromise) {
        dbInitPromise = (async () => {
          const db = getDb();
          if (!db) return null;
          await db.open(); // Wait for tables to be attached
          return db;
        })();
      }

      const database = await dbInitPromise;
      if (!database) return null;
      const table = database[tableName] as Table<PersistedStateRecord, string>;
      const record = await table.get(name);
      return record ? JSON.stringify(record.state) : null;
    },
    // ... setItem, removeItem similar pattern
  };
}
```

**Option 3: Use zustand persist with hydration guard**
```typescript
// src/infrastructure/persistence/stores/rag/rag-store.ts
export const useRAGStore = create<RAGStoreState>()(
  persist(
    (set, get, api) => ({ ... }),
    {
      name: 'rag-state',
      storage: createJSONStorage(() => createDexieStorage('persistedState')),
      skipHydration: true, // Don't hydrate immediately
    }
  )
);

// Component usage
function MyComponent() {
  const hasHydrated = useRAGStore((state) => state._hasHydrated);
  useEffect(() => {
    if (!hasHydrated) {
      useRAGStore.persist.rehydrate();
    }
  }, [hasHydrated]);
}
```

---

## 2. Deprecated Import Paths

### Error Pattern
```
@/lib/state/dexie-db is deprecated. Please migrate to: @/infrastructure/persistence/dexie-db
```

### Root Cause Analysis

**PRIMARY ISSUE**: ADR-024 State Management Consolidation migration is incomplete.

Epic 24-SMC-1 (Consolidate Dexie Database Files) established the canonical location:
- **OLD**: `src/lib/state/dexie-db.ts`
- **NEW**: `src/infrastructure/persistence/dexie-db.ts`

The facade pattern at `src/lib/state/dexie-db.ts` was supposed to be temporary, but **34 files** still import from the old location.

**WHY THIS MATTERS**:
1. **Dual maintenance burden**: Both files must be kept in sync
2. **Developer confusion**: New contributors don't know which path to use
3. **Technical debt indicator**: Incomplete migrations accumulate
4. **Import resolution overhead**: TypeScript/IDE must resolve facade indirection

### Code Locations

**Facade File**: `src/lib/state/dexie-db.ts`
- **Line 6**: `@deprecated This module is deprecated. Import from '@/infrastructure/persistence/dexie-db' instead.`
- **Line 32-34**: Console warning in development mode
- **Line 44-223**: Re-exports from canonical location

**Files Still Using Deprecated Path** (sample):
```bash
# Test files (18 files)
src/lib/state/__tests__/dexie-db.test.ts
src/lib/filesystem/sync-manager/__tests__/incremental-sync.test.ts
src/presentation/components/knowledge/__tests__/*.test.tsx

# Source files (16 files)
src/lib/workspace/__tests__/project-metadata.test.ts
src/lib/knowledge/__tests__/*.test.ts
src/lib/rag/__tests__/*.test.ts
```

**Full List Command**:
```bash
grep -r "from '@/lib/state/dexie-db'" src --include='*.ts' --include='*.tsx' | wc -l  # 34 files
```

### Architectural Dependencies

```
ADR-024: State Management Consolidation
│
├── Canonical Location (infrastructure/persistence)
│   ├── dexie-db.ts (main export)
│   ├── dexie-db-class.ts (database schema)
│   ├── dexie-db-*.ts (type definitions)
│   └── dexie-db-helpers/*.ts (CRUD helpers)
│
└── Deprecated Location (lib/state) - SHOULD BE DELETED
    ├── dexie-db.ts (FACADE - re-exports from infrastructure)
    ├── dexie-db-types.ts
    └── dexie-db-dashboard-types.ts
```

### Verification Commands

```bash
# 1. Count files using deprecated import
grep -r "from '@/lib/state/dexie-db'" src --include='*.ts' --include='*.tsx' | wc -l

# 2. List all files with deprecated imports
grep -r "from '@/lib/state/dexie-db'" src --include='*.ts' --include='*.tsx' -l

# 3. Check for unique exports in deprecated location
diff <(grep "^export" src/lib/state/dexie-db.ts) <(grep "^export" src/infrastructure/persistence/dexie-db.ts)

# 4. Verify no synthesisResults table in canonical location
grep -r "synthesisResults" src/infrastructure/persistence/dexie-db-class.ts
```

### Remediation Priority

**P1 - TECHNICAL DEBT**: Not blocking, but indicates incomplete migration. Should be resolved to prevent accumulated debt.

### Remediation Plan

**Phase 1: Identify Unique Exports**
```bash
# Check if lib/state has exports not in infrastructure/persistence
# Known unique: SynthesisResultRecord, SynthesisResultsTable
# TODO: Decide if these should be added to canonical location
```

**Phase 2: Update All Imports**
```typescript
// Find and replace in 34 files
// OLD: import { db, getDb } from '@/lib/state/dexie-db';
// NEW: import { db, getDb } from '@/infrastructure/persistence/dexie-db';
```

**Phase 3: Delete Facade**
```bash
# After all imports migrated
rm src/lib/state/dexie-db.ts
rm src/lib/state/dexie-db-types.ts
rm src/lib/state/dexie-db-dashboard-types.ts
```

**Phase 4: Update Governance**
```markdown
# AGENTS.md - Update ADR-024 status
## ADR-024: State Management Consolidation
**Status**: ✅ COMPLETE (2026-01-06)
**Migration**: All imports migrated to infrastructure/persistence
**Deleted**: src/lib/dexie-db.ts facade
```

---

## 3. Credential Vault Crypto Failure

### Error Pattern
```
InvalidAccessError: Failed to execute 'exportKey' on 'SubtleCrypto': key is not extractable
Location: credential-encryption.ts:148 in encryptMasterKey()
Called from: credential-vault.ts:255 in createNewVault()
```

### Root Cause Analysis

**PRIMARY ISSUE**: Master key generated as non-extractable, then code attempts to export it.

**Code Flow**:

1. **credential-encryption.ts:127-132** - `generateMasterKey()` creates NON-EXTRACTABLE key
   ```typescript
   async generateMasterKey(): Promise<CryptoKey> {
     return crypto.subtle.generateKey(
       { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
       false, // ← NON-EXTRACTABLE (correct for security)
       ['encrypt', 'decrypt']
     );
   }
   ```

2. **credential-encryption.ts:146-148** - `encryptMasterKey()` attempts to export
   ```typescript
   async encryptMasterKey(masterKey: CryptoKey, encryptionKey: CryptoKey): Promise<string> {
     const iv = this.generateIV();
     const keyData = await crypto.subtle.exportKey('raw', masterKey); // ← FAILS HERE
   ```

3. **credential-vault.ts:252-255** - `createNewVault()` calls the failing sequence
   ```typescript
   this.masterKey = await this.encryption.generateMasterKey(); // Non-extractable
   const encryptedKey = await this.encryption.encryptMasterKey(this.masterKey, this.encryptionKey); // Fails
   ```

**SECURITY DESIGN CONFLICT**:

The code follows **2025 security best practices** (non-extractable keys), but the vault architecture requires exporting the master key to encrypt it with the password-derived key.

**ARCHITECTURAL ISSUE**:

The vault design is:
```
User Password → PBKDF2 → encryptionKey
masterKey (non-extractable) → exportKey('raw') → FAILS
encryptionKey encrypts masterKey.raw → encryptedMasterKey
Store encryptedMasterKey in localStorage
```

This **cannot work** with non-extractable master keys.

### Code Locations

**File**: `src/lib/agent/providers/credential-encryption.ts`
- **Line 127-132**: `generateMasterKey()` creates non-extractable key (SECURE)
- **Line 146-148**: `encryptMasterKey()` tries to export it (FAILS)

**File**: `src/lib/agent/providers/credential-vault.ts`
- **Line 252**: `generateMasterKey()` called
- **Line 255**: `encryptMasterKey()` called (throws InvalidAccessError)
- **Line 236-265**: `createNewVault()` method that fails

### Architectural Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                  Credential Vault Architecture              │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│  User Password      │              │  Vault Password     │
│  (provider enters)  │              │  (auto-generated)   │
└─────────────────────┘              └─────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│  PBKDF2 Derivation  │              │  PBKDF2 Derivation  │
│  userSalt → userKey │              │  vaultSalt → vaultKey│
└─────────────────────┘              └─────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│  userKey decrypts   │              │  vaultKey encrypts  │
│  masterKey          │              │  masterKey          │
│  (per-provider)     │              │  (vault-wide)       │
└─────────────────────┘              └─────────────────────┘
         │                                      │
         └──────────────────┬──────────────────┘
                            ▼
                 ┌─────────────────────┐
                 │  masterKey must be  │
                 │  exportable to      │
                 │  encrypt it!        │
                 └─────────────────────┘
```

### Verification Commands

```bash
# 1. Check extractable flag in generateMasterKey
grep -A 5 "generateMasterKey" src/lib/agent/providers/credential-encryption.ts | grep "extractable"

# 2. Find all exportKey calls
grep -r "exportKey" src/lib/agent/providers --include='*.ts' -B 2 -A 2

# 3. Check credential vault initialization
grep -A 10 "createNewVault" src/lib/agent/providers/credential-vault.ts

# 4. Verify Web Crypto API usage
grep -r "crypto.subtle" src/lib/agent/providers --include='*.ts' | grep -E "(generateKey|exportKey|importKey)"
```

### Remediation Priority

**P0 - BLOCKING**: Vault initialization completely broken. No API keys can be stored.

### Remediation Plan

**CRITICAL SECURITY DECISION REQUIRED**: Choose one approach:

**Option 1: Make masterKey extractable (SIMPLE, LESS SECURE)**
```typescript
// src/lib/agent/providers/credential-encryption.ts:127
async generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true, // ← EXTRACTABLE (required for vault encryption)
    ['encrypt', 'decrypt']
  );
}
```

**Option 2: Use non-extractable masterKey with Key Wrapping (SECURE, COMPLEX)**
```typescript
// src/lib/agent/providers/credential-encryption.ts
async wrapMasterKey(masterKey: CryptoKey, wrappingKey: CryptoKey): Promise<string> {
  // Use AES-KW key wrapping instead of export+encrypt
  const iv = this.generateIV();
  const wrapped = await crypto.subtle.wrapKey(
    'raw', // Export key in raw format
    masterKey,
    wrappingKey,
    { name: 'AES-KW' }
  );
  return arrayBufferToBase64(wrapped);
}

async unwrapMasterKey(wrappedKey: string, wrappingKey: CryptoKey): Promise<CryptoKey> {
  const wrapped = base64ToArrayBuffer(wrappedKey);
  return crypto.subtle.unwrapKey(
    'raw',
    wrapped,
    wrappingKey,
    { name: 'AES-KW' },
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false, // masterKey remains non-extractable
    ['encrypt', 'decrypt']
  );
}
```

**Option 3: Store masterKey in IndexedDB, not localStorage (ALTERNATIVE)**
```typescript
// Don't encrypt masterKey at all - store it in IndexedDB
// Protected by browser same-origin policy
// Only encrypt with userKey when user provides password
```

**RECOMMENDATION**: Option 2 (AES-KW key wrapping) maintains security while fixing the bug.

---

## 4. SSR Hydration Mismatch

### Error Pattern
```
Warning: Server/client HTML attributes don't match in __root.tsx
Text content did not match. Server: "..." Client: "..."
```

### Root Cause Analysis

**PRIMARY ISSUE**: Theme provider or locale provider causing SSR/client attribute mismatch.

**Code Review**:

**File**: `src/routes/__root.tsx`
- **Line 67**: `<html lang="en" suppressHydrationWarning>` - Already has suppression
- **Line 72-84**: Provider stack
  ```tsx
  <ThemeProvider>
    <LocaleProvider>
      <TooltipProvider>
        <AppInitializer>
          <UnifiedWorkspaceProvider initialWorkspace={"hub" as any}>
  ```

**POTENTIAL SOURCES**:

1. **ThemeProvider** may render different attributes on server vs client
2. **LocaleProvider** may have browser-specific language detection
3. **MigrationStatus** component (line 86) might have dynamic content
4. **AppInitializer** might run async initialization that changes DOM

**HYDRATION MISMATCH MECHANISM**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Server-Side Render                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  <html lang="en">                                          │
│    <body>                                                  │
│      <ThemeProvider value="system">                        │
│        <div class="theme-dark">                            │ ← SSR HTML
│          Content...                                        │
│        </div>                                              │
│      </ThemeProvider>                                      │
│    </body>                                                 │
│  </html>                                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Hydration                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  <html lang="en">                                          │
│    <body>                                                  │
│      <ThemeProvider value="dark">  ← BROWSER DETECTED       │
│        <div class="theme-dark">                            │ ← Client HTML (different!)
│          Content...                                        │
│        </div>                                              │
│      </ThemeProvider>                                      │
│    </body>                                                 │
│  </html>                                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                      ⚠️ HYDRATION MISMATCH
```

### Code Locations

**File**: `src/routes/__root.tsx`
- **Line 67**: `<html>` element with `suppressHydrationWarning`
- **Line 72-84**: Provider stack
- **Line 86**: `<MigrationStatus />` component

**Files to Investigate**:
- `src/presentation/components/ui/ThemeProvider.tsx`
- `src/i18n/LocaleProvider.tsx`
- `src/presentation/components/common/AppInitializer.tsx`
- `src/infrastructure/persistence/stores/workspace/unified-workspace-provider.tsx`
- `src/presentation/components/agent/MigrationStatus.tsx`

### Architectural Dependencies

```
__root.tsx (Root Layout)
├── ThemeProvider ← LIKELY CULPRIT
│   └── Detects system theme on client (window.matchMedia)
│   └── SSR has no window, uses default
│   └── Hydration mismatch!
│
├── LocaleProvider ← POSSIBLE CULPRIT
│   └── Detects browser language on client
│   └── SSR uses 'en' default
│   └── May cause mismatch
│
├── AppInitializer
│   └── Async initialization (SSR-safe?)
│
├── UnifiedWorkspaceProvider
│   └── Store hydration (SSR-safe?)
│
└── MigrationStatus ← LIKELY CULPRIT
    └── Reads localStorage on mount
    └── Different content on server vs client
```

### Verification Commands

```bash
# 1. Check ThemeProvider SSR handling
grep -r "typeof window" src/presentation/components/ui/ThemeProvider.tsx -A 5 -B 5
grep -r "suppressHydrationWarning" src/presentation/components/ui/ThemeProvider.tsx -A 2 -B 2

# 2. Check LocaleProvider SSR handling
grep -r "useEffect" src/i18n/LocaleProvider.tsx -A 5
grep -r "navigator.language" src/i18n --include='*.tsx' -A 2

# 3. Check MigrationStatus for client-only code
grep -r "localStorage" src/presentation/components/agent/MigrationStatus.tsx -A 2 -B 2
grep -r "useEffect" src/presentation/components/agent/MigrationStatus.tsx -A 5

# 4. Check for browser API usage in providers
grep -r "window.matchMedia\|navigator\|localStorage" src/i18n src/presentation/components/ui --include='*.tsx'
```

### Remediation Priority

**P2 - MINOR**: SSR warnings don't break functionality, but indicate poor SSR compatibility.

### Remediation Plan

**Option 1: Suppress warnings (QUICK FIX)**
```typescript
// src/routes/__root.tsx
<html lang="en" suppressHydrationWarning>
  {/* Also suppress on body if needed */}
  <body suppressHydrationWarning>
```

**Option 2: Fix ThemeProvider (RECOMMENDED)**
```typescript
// src/presentation/components/ui/ThemeProvider.tsx
import { useServerInsertedHTML } from 'next/navigation'; // Or equivalent

export function ThemeProvider({ children }) {
  // On server, render without theme detection
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>; // Server render
  }

  // Client-only theme detection
  const theme = detectTheme();
  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
}
```

**Option 3: Use CSS-only theming (BEST)**
```css
/* Use media queries instead of JS theme detection */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000;
    --fg: #fff;
  }
}
```

---

## Remediation Backlog

### P0 - Blocking (Fix Immediately)

| ID | Issue | File | Fix | Est. Time |
|----|-------|------|-----|-----------|
| **P0-1** | Database initialization race | `dexie-storage.ts:113` | Add init guard in createDexieStorage | 2h |
| **P0-2** | Missing ragState table schema | `dexie-db-class.ts` | Add `persistedState` table to schema | 1h |
| **P0-3** | Crypto key export failure | `credential-encryption.ts:148` | Use AES-KW key wrapping OR make key extractable | 3h |

**Total P0**: 6 hours

### P1 - Technical Debt (Fix This Sprint)

| ID | Issue | File | Fix | Est. Time |
|----|-------|------|-----|-----------|
| **P1-1** | Deprecated import paths | 34 files | Migrate to infrastructure/persistence | 2h |
| **P1-2** | Delete facade after migration | `lib/state/dexie-db.ts` | Remove deprecated facade file | 0.5h |

**Total P1**: 2.5 hours

### P2 - Minor (Fix Next Sprint)

| ID | Issue | File | Fix | Est. Time |
|----|-------|------|-----|-----------|
| **P2-1** | SSR hydration warnings | `__root.tsx`, `ThemeProvider.tsx` | Fix ThemeProvider SSR compatibility | 2h |

**Total P2**: 2 hours

---

## Verification Checklist

Before marking any issue as resolved, verify:

### P0-1: Database Initialization
- [ ] Rag store hydrates successfully without errors
- [ ] `createDexieStorage('ragState')` returns valid storage
- [ ] `db.persistedState` table exists in schema
- [ ] IndexedDB contains `rag-state` record after hydration
- [ ] TypeScript passes with new table type

**Verification Commands**:
```bash
# Run dev server and check console
pnpm dev
# Should see: [RAGStore] Rehydrated from IndexedDB (NO errors)

# Check IndexedDB in DevTools
# Application → IndexedDB → ViaGentDatabase → persistedState
# Should have record with id='rag-state'
```

### P0-3: Crypto Key Export
- [ ] `CredentialVault.createNewVault()` completes without error
- [ ] Master key successfully encrypted and stored in localStorage
- [ ] Vault can unlock and decrypt API keys
- [ ] No `InvalidAccessError` in console

**Verification Commands**:
```bash
# Clear localStorage and IndexedDB
localStorage.clear()
indexedDB.deleteDatabase('ViaGentDatabase')

# Refresh app and check console
pnpm dev
# Should see: [CredentialVault] New vault created successfully
# Should NOT see: InvalidAccessError
```

### P1-1: Import Path Migration
- [ ] Zero files import from `@/lib/state/dexie-db`
- [ ] All imports use `@/infrastructure/persistence/dexie-db`
- [ ] No deprecation warnings in console
- [ ] TypeScript passes after migration

**Verification Commands**:
```bash
# Check for remaining deprecated imports
grep -r "from '@/lib/state/dexie-db'" src --include='*.ts' --include='*.tsx'
# Should return zero results

# Check TypeScript
pnpm typecheck
# Should pass with zero errors
```

---

## Appendix A: System Architecture Context

### State Management Architecture (ADR-024)

```
┌─────────────────────────────────────────────────────────────┐
│                   Application State Layer                    │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│   Zustand Stores    │              │    Dexie.js         │
│   (In-Memory)       │◄────────────►│   (IndexedDB)       │
├─────────────────────┤   Persist    ├─────────────────────┤
│ • rag-store.ts      │              │ • ViaGentDatabase   │
│ • workspace-store   │              │ • Tables:           │
│ • provider-store    │              │   - persistedState  │
│ • agents-store      │              │   - projects        │
│ • conversations     │              │   - ideState        │
└─────────────────────┘              │   - conversations   │
                                     │   - credentials     │
                                     └─────────────────────┘
```

### Credential Vault Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Credential Vault (WB-PR-2)                    │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│   credential-       │              │   credential-       │
│   storage.ts        │              │   encryption.ts     │
├─────────────────────┤              ├─────────────────────┤
│ • IndexedDB CRUD    │              │ • AES-256-GCM       │
│ • Dexie.js API      │              │ • PBKDF2 derivation │
│ • Credentials table │              │ • Key generation    │
└─────────────────────┘              └─────────────────────┘
         │                                      │
         └──────────────────┬──────────────────┘
                            ▼
                 ┌─────────────────────┐
                 │ credential-vault.ts │
                 │ (Public API)        │
                 └─────────────────────┘
```

---

## Appendix B: Related Documentation

### ADR References
- **ADR-024**: State Management Consolidation (Epic 24-SMC-1)
- **WB-PR-2**: Refactor Credential Vault (Story WB-PR-2.1)

### Epic References
- **Epic 7**: RAG (Retrieval-Augmented Generation)
- **Epic 24**: State Management Consolidation
- **Epic 53**: Foundation Stabilization

### Sprint References
- **ARC Sprint**: Comprehensive Architecture Remediation (Target: 95% Health)
- **Session**: ASGL-20260106-021651-COURSE-CORRECTION

---

**Report Generated**: 2026-01-06T02:20:00+07:00
**Next Review**: After P0 fixes deployed
**Maintained By**: BMAD Deep Scan Orchestrator
