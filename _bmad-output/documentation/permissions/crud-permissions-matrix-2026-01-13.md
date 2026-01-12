# CRUD Permissions Matrix: Human vs AI Agent

**Document Version:** 1.0.0  
**Date:** 2026-01-13  
**Source:** Codebase analysis of permission definitions

---

## Overview

This document describes the CRUD (Create, Read, Update, Delete) permissions system for **Human Users** vs **AI Agents** across all workspaces (IDE, Knowledge, Notes, Study).

### Key Concepts

1. **Human Permissions**: Direct file system access via FSA (File System Access API) or IndexedDB
2. **AI Agent Permissions**: Controlled through `ToolPermissionManager` with trust levels
3. **Storage Types**: FSA (File System Access) vs IndexedDB - each with different permission models
4. **Workspace Types**: `ide`, `knowledge`, `notes`, `study` - each can have different permission configurations

---

## Tool Trust Levels

| Trust Level | Description | Human Required? | AI Allowed? |
|------------|-------------|-----------------|-------------|
| `auto` | Execute immediately without approval | No | Yes |
| `prompt` | Require user approval before execution | Yes (per-action) | Yes (with approval flow) |
| `block` | Never execute | N/A | No |

---

## Tool Categories

| Category | Description | Default Trust Level |
|----------|-------------|---------------------|
| `files` | File operations (read_file, write_file, etc.) | Varies by operation |
| `terminal` | Command execution (execute_command) | `prompt` |
| `knowledge` | Knowledge synthesis and processing | `prompt` |
| `vision` | Image processing and analysis | `prompt` |
| `search` | Web and file search | `prompt` |
| `web` | URL fetching and web browsing | `prompt` |
| `notes` | Note CRUD operations (create_note, read_note, etc.) | `prompt` |

---

## CRUD Permission Matrix

### File Operations (File Tools)

| Operation | Tool ID | Human Allowed | AI Allowed | Default AI Trust Level | IDE | Knowledge | Notes | Study | Enforcement Point |
|-----------|---------|---------------|------------|----------------------|-----|-----------|-------|-------|-------------------|
| **Read File** | `read_file` | ✅ Full | ✅ Full | `auto` | ✅ | ✅ | ✅ | ✅ | `FileToolsFacade.checkPermission()` at `file-tools-impl.ts:78-107` |
| **Write File** | `write_file` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ❌ | ✅ | ❌ | `FileToolsFacade.checkPermission()` at `file-tools-impl.ts:78-107` |
| **Create File** | `write_file` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ❌ | ✅ | ❌ | `FileToolsFacade.checkPermission()` at `file-tools-impl.ts:78-107` |
| **List Files** | `list_files` | ✅ Full | ✅ Full | `auto` | ✅ | ✅ | ✅ | ✅ | `FileToolsFacade.checkPermission()` at `file-tools-impl.ts:78-107` |
| **Delete File** | `delete_file` | ✅ Full | ❌ Blocked | `block` | ❌ | ❌ | ❌ | ❌ | `FileToolsFacade.checkPermission()` at `file-tools-impl.ts:78-107` |
| **Create Directory** | `create_directory` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ❌ | ✅ | ❌ | `FileToolsFacade.checkPermission()` at `file-tools-impl.ts:78-107` |

### Terminal Operations

| Operation | Tool ID | Human Allowed | AI Allowed | Default AI Trust Level | IDE | Knowledge | Notes | Study | Enforcement Point |
|-----------|---------|---------------|------------|----------------------|-----|-----------|-------|-------|-------------------|
| **Execute Command** | `execute_command` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ❌ | ❌ | ❌ | `TerminalToolsFacade.checkPermission()` at `terminal-tools-impl.ts:74-103` |

### Knowledge Operations (EPIC-38)

| Operation | Tool ID | Human Allowed | AI Allowed | Default AI Trust Level | IDE | Knowledge | Notes | Study | Enforcement Point |
|-----------|---------|---------------|------------|----------------------|-----|-----------|-------|-------|-------------------|
| **Synthesize** | `synthesize` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ✅ | ✅ | ✅ | `WorkspacePermissionManager.checkWorkspacePermission()` at `workspace-permission-manager.ts:80-151` |
| **Process PDF** | `process_pdf` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ✅ | ✅ | ✅ | `WorkspacePermissionManager.checkWorkspacePermission()` at `workspace-permission-manager.ts:80-151` |
| **Process Image** | `process_image` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ✅ | ✅ | ✅ | `WorkspacePermissionManager.checkWorkspacePermission()` at `workspace-permission-manager.ts:80-151` |
| **Process URL** | `process_url` | ✅ Full | ⚠️ Conditional | `prompt` | ✅ | ✅ | ✅ | ✅ | `WorkspacePermissionManager.checkWorkspacePermission()` at `workspace-permission-manager.ts:80-151` |

### Note Operations (EPIC-40)

| Operation | Tool ID | Human Allowed | AI Allowed | Default AI Trust Level | IDE | Knowledge | Notes | Study | Enforcement Point |
|-----------|---------|---------------|------------|----------------------|-----|-----------|-------|-------|-------------------|
| **Create Note** | `create_note` | ✅ Full | ⚠️ Conditional | `prompt` | ⚠️ | ⚠️ | ✅ | ⚠️ | `WorkspacePermissionManager.checkWorkspacePermission()` at `factory.ts:599-612` |
| **Read Note** | `read_note` | ✅ Full | ⚠️ Conditional | `prompt` | ⚠️ | ⚠️ | ✅ | ⚠️ | `WorkspacePermissionManager.checkWorkspacePermission()` at `factory.ts:655-668` |
| **Update Note** | `update_note` | ✅ Full | ⚠️ Conditional | `prompt` | ⚠️ | ⚠️ | ✅ | ⚠️ | `WorkspacePermissionManager.checkWorkspacePermission()` at `factory.ts:703-716` |
| **Delete Note** | `delete_note` | ✅ Full | ⚠️ Conditional | `prompt` | ⚠️ | ⚠️ | ✅ | ⚠️ | `WorkspacePermissionManager.checkWorkspacePermission()` at `factory.ts:759-772` |
| **List Notes** | `list_notes` | ✅ Full | ⚠️ Conditional | `prompt` | ⚠️ | ⚠️ | ✅ | ⚠️ | `WorkspacePermissionManager.checkWorkspacePermission()` at `factory.ts:811-824` |

### Project Operations

| Operation | Human Allowed | AI Allowed | Notes | Enforcement Point |
|-----------|---------------|------------|-------|-------------------|
| **Create Project** | ✅ Full | ❌ Not applicable | AI cannot create projects | N/A |
| **Delete Project** | ✅ Full | ❌ Not applicable | AI cannot delete projects | N/A |
| **Open Project** | ✅ Full | ❌ Not applicable | AI operates within opened project | N/A |
| **Close Project** | ✅ Full | ❌ Not applicable | AI operates within opened project | N/A |

---

## Storage Type Restrictions

### FSA (File System Access) Storage

| Permission State | Description | Human Can Bypass? | AI Can Use? |
|-----------------|-------------|-------------------|-------------|
| `granted` | User has granted read-write permission | Yes (user has direct access) | Yes |
| `prompt` | Permission needs to be requested | Yes (user can grant) | No (AI blocked) |
| `denied` | Permission was denied | Yes (user can retry) | No (AI blocked) |
| `unknown` | Permission state unknown | Yes (user can grant) | No (AI blocked) |

**Key Points:**
- FSA requires explicit user permission via `showDirectoryPicker()`
- Permission can be session-only or persistent (Chrome 122+)
- AI agents cannot bypass FSA permissions - they rely on the same handle
- **For FSA storage type, AI permissions are checked AFTER FSA permissions are granted**

### IndexedDB Storage

| Permission State | Description | Human Can Bypass? | AI Can Use? |
|-----------------|-------------|-------------------|-------------|
| `granted` | Always auto-granted for IndexedDB | N/A (always granted) | Yes (always) |

**Key Points:**
- IndexedDB does not require FSA handle
- Permission is auto-granted (no user prompt needed)
- AI agents have full access to IndexedDB-stored content
- Used for: Notes, Knowledge base, Study materials (flashcards, quizzes)

---

## Permission Enforcement Points

### Layer 1: Storage Layer (FSA Permissions)

**File:** `src/lib/filesystem/permission-lifecycle.ts`

```typescript
export async function getPermissionState(
  handle: FileSystemDirectoryHandle,
  mode: 'read' | 'readwrite' = 'readwrite'
): Promise<FsaPermissionState>
```

**Enforcement:**
- Checks FSA permission state via `handle.queryPermission()`
- Returns: `granted`, `prompt`, `denied`, or `unknown`
- **Applied to:** FSA storage type only

**Integration:** `project-permissions-slice.ts:38-59`

```typescript
checkProjectPermission: async (id) => {
  // For IndexedDB storage type, permission is auto-granted
  if (project.storageType === 'indexeddb') {
    return 'granted';
  }
  // For FSA storage type, check the handle permission
  if (!project.fsaHandle) {
    return 'denied';
  }
  const { getPermissionState } = await import('@/lib/filesystem/permission-lifecycle');
  return await getPermissionState(project.fsaHandle, 'readwrite');
}
```

### Layer 2: Tool Permission Manager (Trust Levels)

**File:** `src/lib/agent/tool-permission/tool-permission-manager.ts`

```typescript
public checkPermission(toolId: string, workspaceType?: WorkspaceType): PermissionCheckResult {
  return checkPermission(toolId, workspaceType);
}
```

**Permission Check Logic:**

```typescript
// From tool-permission-trust.ts
function checkPermission(toolId: string, workspaceType?: WorkspaceType): PermissionCheckResult {
  // 1. Check trust level (auto/prompt/block)
  const trustLevel = getTrustLevel(toolId, workspaceType);
  
  // 2. Check session trust (user approved this tool for this session)
  if (hasSessionTrust(toolId, workspaceType)) {
    return { needsApproval: false, canExecute: true, reason: 'session', ... };
  }
  
  // 3. Check YOLO mode (user enabled "You Only Live Once" mode)
  if (isYOLOActive()) {
    return { needsApproval: false, canExecute: true, reason: 'yolo', ... };
  }
  
  // 4. Check category approval
  if (isCategoryApproved(toolId, workspaceType)) {
    return { needsApproval: false, canExecute: true, reason: 'category', ... };
  }
  
  // 5. Final determination based on trust level
  switch (trustLevel) {
    case 'auto':
      return { needsApproval: false, canExecute: true, reason: 'auto', ... };
    case 'prompt':
      return { needsApproval: true, canExecute: true, reason: 'prompt', ... };
    case 'block':
      return { needsApproval: false, canExecute: false, reason: 'block', ... };
  }
}
```

### Layer 3: Workspace Permission Manager

**File:** `src/lib/agent/workspace-permission-manager.ts`

```typescript
public checkWorkspacePermission(
  toolId: string,
  agentTools: AgentToolBindingProps[],
  agentBindings: WorkspaceBindingProps[],
  currentWorkspace: WorkspaceType
): WorkspacePermissionCheckResult
```

**Check Order:**
1. **Agent Availability:** Is the agent available in this workspace? (`workspaceBindings.isAvailable`)
2. **Tool Workspace Permission:** Is the tool enabled for this workspace? (`workspacePermissions[workspace]`)
3. **Trust Level:** Does the tool have permission via trust level? (Layer 2)

### Layer 4: Facade Layer (Tool Implementation)

**File Facades:**
- `src/lib/agent/facades/file-tools-impl.ts:78-107`
- `src/lib/agent/facades/terminal-tools-impl.ts:74-103`
- `src/lib/agent/facades/note-tools-impl.ts` (if exists)
- `src/lib/agent/facades/knowledge-tools-impl.ts` (if exists)

```typescript
private checkPermission(toolId: string): void {
  const result = this.permissionManager.checkPermission(toolId, this.workspaceType);
  
  if (!result.canExecute) {
    throw new ToolPermissionDeniedError(
      userMessage,
      result.toolName,
      result.reason
    );
  }
}
```

### Layer 5: Factory Layer (Tool Entry Points)

**File:** `src/lib/agent/factory.ts`

Every tool created in the factory has workspace permission checks:

```typescript
const readFile = readFileDef.client(async (args: unknown) => {
  // WB-8.3: Workspace Permission Check
  const permissionCheck = workspacePermissionManager.checkWorkspacePermission(
    'read_file',
    workspaceContext.agent?.tools || [],
    workspaceContext.agent?.workspaceBindings || [],
    workspaceContext.workspaceType
  );
  
  if (!permissionCheck.canExecute) {
    return createWorkspaceDeniedResponse('read_file', workspaceContext.workspaceType, permissionCheck.toolName);
  }
  // ... execute tool
});
```

---

## Default Trust Levels by Workspace

**Source:** `src/infrastructure/persistence/stores/permissions/constants.ts`

### IDE Workspace

| Tool | Trust Level |
|------|-------------|
| `read_file` | `auto` |
| `list_files` | `auto` |
| `read_directory` | `auto` |
| `write_file` | `prompt` |
| `create_directory` | `prompt` |
| `delete_file` | `block` |
| `execute_command` | `prompt` |

### Knowledge Workspace

| Tool | Trust Level |
|------|-------------|
| `read_file` | `auto` |
| `list_files` | `auto` |
| `read_directory` | `auto` |
| `write_file` | `block` |
| `create_directory` | `block` |
| `delete_file` | `block` |
| `execute_command` | `block` |

### Notes Workspace

| Tool | Trust Level |
|------|-------------|
| `read_file` | `auto` |
| `list_files` | `auto` |
| `read_directory` | `auto` |
| `write_file` | `prompt` |
| `create_directory` | `prompt` |
| `delete_file` | `block` |
| `execute_command` | `block` |

### Study Workspace

| Tool | Trust Level |
|------|-------------|
| `read_file` | `auto` |
| `list_files` | `auto` |
| `read_directory` | `auto` |
| `write_file` | `block` |
| `create_directory` | `block` |
| `delete_file` | `block` |
| `execute_command` | `block` |

---

## YOLO Mode (You Only Live Once)

**Purpose:** Allows users to temporarily bypass all permission prompts for a configured duration.

**Configuration:**
- Default duration: 24 hours
- Can be configured via `ToolPermissionManager.toggleYOLO(durationHours)`

**Behavior:**
- When YOLO mode is active, ALL tools execute without prompts
- Includes tools normally set to `prompt` trust level
- Automatically expires after duration
- Can be disabled manually at any time

**Source:** `src/lib/agent/tool-permission/tool-permission-queries.ts`

---

## Category Approval

**Purpose:** Approve all tools in a category at once instead of individually.

**Categories:** `files`, `terminal`, `knowledge`, `vision`, `search`, `web`, `notes`

**Behavior:**
- When a category is approved, all tools in that category auto-execute
- Overrides individual tool trust levels
- Per-workspace configurable

**Source:** `src/lib/agent/tool-permission/tool-permission-queries.ts`

```typescript
setCategoryApproval(category: ToolCategory, workspaceType: WorkspaceType, approved: boolean)
```

---

## Session Trust

**Purpose:** User can approve a specific tool for the current session only.

**Behavior:**
- One-time approval per tool execution
- Does not persist across sessions
- Useful for one-off operations

**Source:** `src/lib/agent/tool-permission/tool-permission-trust.ts`

```typescript
addSessionTrust(toolId: string, workspaceType?: WorkspaceType)
```

---

## Identified Missing Permission Checks

### 1. Knowledge Tools - Missing Permission Checks in Facade Layer

**Issue:** Knowledge tools (`synthesize`, `process_pdf`, `process_image`, `process_url`) only have permission checks at the factory layer, not at the facade layer.

**Location:** `src/lib/agent/facades/knowledge-tools-impl.ts` (if it exists)

**Risk:** Medium - Factory layer checks provide protection, but defense-in-depth suggests facade layer checks should also exist.

**Recommendation:** Add `checkPermission()` calls to knowledge tool facade methods.

### 2. Note Tools - Permission Configuration Not Fully Defined

**Issue:** Note tools (`create_note`, `read_note`, `update_note`, `delete_note`, `list_notes`) don't have default trust levels defined in `constants.ts`.

**Location:** `src/infrastructure/persistence/stores/permissions/constants.ts`

**Current Behavior:** Falls back to `DEFAULT_TRUST_LEVEL` ('prompt') for unknown tools.

**Risk:** Low - Defaults to 'prompt' which requires approval.

**Recommendation:** Explicitly define note tool trust levels for clarity.

### 3. No Path-Based Restrictions for AI Agents

**Issue:** The current permission system checks tool trust levels but does not restrict which paths AI agents can access.

**Example:** An AI agent with `write_file: auto` can write to ANY file in the project, not just specific directories.

**Location:** `_test-spike/_harness/permission-profiles.ts` - exists but not integrated

**Risk:** High - AI agents can modify any file they have permission to access.

**Recommendation:** Implement path-based permission profiles (as hinted in `_test-spike/_harness/permission-profiles.ts`).

### 4. No Rate Limiting or Quota Enforcement

**Issue:** No mechanism to limit how many times a tool can be executed within a time period.

**Risk:** Medium - AI agents could potentially execute resource-intensive operations repeatedly.

**Recommendation:** Add rate limiting per tool per workspace.

### 5. No Cross-Workspace File Reference Restrictions

**Issue:** `WorkspacePermissionManager.checkCrossWorkspaceFilePermission()` always returns `true` (Phase 1 implementation).

**Location:** `src/lib/agent/workspace-permission-manager.ts:328-344`

**Current Behavior:**
```typescript
public checkCrossWorkspaceFilePermission(
  sourceWorkspace: WorkspaceType,
  targetWorkspace: WorkspaceType
): boolean {
  // Phase 1: Allow all cross-workspace references
  // Phase 2: Add agent config restrictions (future story)
  // Phase 3: Add user-level permission controls (future story)
  
  // Prevent self-references (same workspace)
  if (sourceWorkspace === targetWorkspace) {
    return false;
  }
  
  // Allow all cross-workspace references for now
  return true;
}
```

**Risk:** Medium - AI agents can reference files from any workspace.

**Recommendation:** Implement Phases 2 and 3 for proper cross-workspace isolation.

---

## Permission Escalation Paths

### 1. Trust Level Escalation

```
User changes tool trust level: 'prompt' → 'auto'
```

**How:**
- User navigates to Agent Settings
- Finds tool in permission list
- Clicks to cycle trust level: `prompt` → `auto` → `block` → `prompt`

**Code:** `src/lib/agent/tool-permission/helpers.ts`

```typescript
export function toggleTrustLevel(level: string): string {
  const levels: readonly string[] = ['auto', 'prompt', 'block'];
  const currentIndex = levels.indexOf(level);
  const nextIndex = (currentIndex + 1) % levels.length;
  return levels[nextIndex];
}
```

### 2. Category Approval Escalation

```
User approves category: All tools in category auto-execute
```

**How:**
- User navigates to Agent Settings → Category Approvals
- Toggles category approval ON

**Code:** `src/lib/agent/tool-permission/tool-permission-queries.ts`

```typescript
setCategoryApproval(category: ToolCategory, workspaceType: WorkspaceType, approved: boolean)
```

### 3. YOLO Mode Escalation

```
User enables YOLO mode: All tools auto-execute for duration
```

**How:**
- User navigates to Agent Settings
- Clicks "Enable YOLO Mode"
- Sets duration (default 24 hours)

**Code:** `src/lib/agent/tool-permission/tool-permission-queries.ts`

```typescript
enableYOLO(durationHours?: number): YOLOMode
```

### 4. Session Trust Escalation

```
User approves single tool execution: Tool executes once without further prompts
```

**How:**
- AI agent attempts tool execution
- Permission check returns `needsApproval: true`
- UI shows approval prompt
- User approves
- Tool executes, session trust is added
- Subsequent executions use session trust

**Code:** `src/lib/agent/tool-permission/tool-permission-trust.ts`

```typescript
addSessionTrust(toolId: string, workspaceType?: WorkspaceType)
```

---

## Summary: Human vs AI Agent Differences

| Aspect | Human User | AI Agent |
|--------|-----------|----------|
| **FSA Permission** | Directly prompted by browser | Inherits user's FSA permission |
| **Tool Trust Levels** | N/A (always has full access) | Configurable per tool (`auto`/`prompt`/`block`) |
| **Storage Access** | Full access via OS file picker | Limited by tool permissions |
| **Category Approval** | N/A | Available |
| **YOLO Mode** | N/A | Available |
| **Session Trust** | N/A | Available |
| **Per-Workspace Config** | N/A | Available |
| **Default Trust Levels** | Full access | Varies by tool (see matrix above) |

---

## Conclusion

The permission system provides a robust, multi-layered approach to controlling AI agent operations:

1. **Storage Layer**: FSA permissions for file system access
2. **Tool Layer**: Trust levels with workspace scoping
3. **Workspace Layer**: Agent availability and tool enablement per workspace
4. **Escalation Paths**: YOLO mode, category approval, session trust

**Key Finding:** Humans have full access to everything; AI agents are controlled through a sophisticated permission system with sensible defaults (read-heavy operations are `auto`, write operations require `prompt`, destructive operations are `block`).

**Recommended Next Steps:**
1. Implement path-based restrictions for AI agents
2. Add rate limiting for resource-intensive operations
3. Complete cross-workspace permission controls
4. Add permission checks to knowledge and note tool facades
5. Explicitly define note tool trust levels in constants
