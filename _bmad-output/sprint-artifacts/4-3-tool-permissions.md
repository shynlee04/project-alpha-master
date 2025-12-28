---
title: "4-3 Tool Permissions & Trust Levels"
epic: "Epic 4: Smart Agent Tools"
story: "4-3-tool-permissions"
status: "ready-for-dev"
priority: "P0"
points: 5
created: "2025-12-29"
sprint: "SPRINT-1"
team: "Team B"
dependencies:
  - "4-1-system-prompt-composer"
  - "25-5-implement-approval-flow"
---

# Story: 4-3 Tool Permissions & Trust Levels

**As a** user,
**I want** to control which operations the AI can perform automatically,
**So that** I maintain security and oversight of file changes.

---

## Story Context

### From Epic 4

Epic 4 delivers "Smart Agent Tools" with reliable file operations, clear feedback, and error recovery. Story 4-1 delivered the 5-Layer System Prompt Composer. Story 4-3 delivers the Tool Permissions & Trust Levels system that controls when the AI needs user approval.

### User Journey

1. User configures AI agent with specific trust levels for each tool
2. Agent attempts to execute tool based on trust level
3. `auto` tools execute immediately
4. `prompt` tools show approval overlay
5. `block` tools are prevented entirely

### Technical Context

**Trust Levels:**
- `auto`: Execute immediately without approval (safe tools like `read_file`)
- `prompt`: Require user approval before execution (risky tools like `write_file`)
- `block`: Never execute (dangerous tools)

**Architecture:**
- `ToolPermissionManager`: Central permission registry with trust levels
- `ToolTrustLevel` type: `auto` | `prompt` | `block`
- Session-based trust: "Trust for this session" checkbox in approval overlay
- Audit logging: All tool executions logged to `useAgentsStore().toolExecutionHistory`

---

## Acceptance Criteria

### AC-1: Tool Trust Level Configuration

**Given** a user opens agent configuration
**When** they navigate to "Tool Permissions"
**Then** they see a list of available tools with trust level selectors

**And** the selector options are:
- "Auto-allow" (green) - executes immediately
- "Prompt each time" (amber) - shows approval dialog
- "Block" (red) - never executes

**And** the default trust levels are:
- `read_file`: auto (safe read-only operation)
- `list_files`: auto (safe listing operation)
- `write_file`: prompt (modifies files)
- `execute_command`: prompt (runs arbitrary commands)
- `delete_file`: block (dangerous operation)

---

### AC-2: Auto-Allow Execution

**Given** a tool is configured with trust level `auto`
**When** the agent requests it
**Then** it executes immediately without user approval
**And** the execution is logged to `toolExecutionHistory` with:
- Tool name
- Timestamp
- Parameters (sanitized)
- Result status

**And** the chat UI shows a subtle indicator:
- "🔓 [ToolName] executed automatically" (collapsed by default)

---

### AC-3: Prompt-Required Approval

**Given** a tool is configured with trust level `prompt`
**When** the agent requests it
**Then** an approval overlay appears
**And** the overlay includes:
- Tool name and icon
- Target file/command
- Preview of what will happen
- "Allow this time" button
- "Allow for this session" checkbox
- "Deny" button

**Given** the user checks "Allow for this session"
**When** they click "Allow this time"
**Then** the tool executes
**And** subsequent requests for the same tool execute automatically for the session
**And** the "Available Tools" indicator updates to show auto-allowed tools

---

### AC-4: Blocked Tool Execution

**Given** a tool is configured with trust level `block`
**When** the agent requests it
**Then** execution is prevented
**And** an error message appears in chat:
- "⛔ [ToolName] is blocked. Enable it in agent settings to use."

**And** the "Available Tools" indicator in chat updates:
- Shows blocked tools with strike-through
- Tooltip: "Blocked - requires agent configuration change"

---

### AC-5: Session-Based Trust Persistence

**Given** a user grants "Trust for this session"
**When** the session ends (page reload)
**Then** the trust expires
**And** tools revert to their configured trust level
**And** no persistent "always allow" option is available (security requirement)

---

### AC-6: Permission Change Detection

**Given** a tool permission is changed while agent is active
**When** the change is saved
**Then** the change takes effect immediately
**And** a toast notification confirms: "Tool permissions updated"

---

## Implementation Tasks

### Task 1: Create ToolPermissionManager class

**File:** `src/lib/agent/tool-permission-manager.ts`

**Responsibilities:**
- Store trust levels for each tool
- Check if tool needs approval
- Handle session-based trust
- Provide permission configuration UI

**Interface:**
```typescript
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

export interface ToolPermission {
  toolId: string;
  trustLevel: ToolTrustLevel;
  sessionTrust: Set<string>; // Tools auto-allowed for this session
}

export interface PermissionCheckResult {
  needsApproval: boolean;
  canExecute: boolean;
  reason: 'auto' | 'prompt' | 'block' | 'session';
  toolName: string;
}

export class ToolPermissionManager {
  // Get/set trust level for a tool
  getTrustLevel(toolId: string): ToolTrustLevel;
  setTrustLevel(toolId: string, level: ToolTrustLevel): void;

  // Session-based trust
  addSessionTrust(toolId: string): void;
  removeSessionTrust(toolId: string): void;
  hasSessionTrust(toolId: string): boolean;
  clearSessionTrust(): void;

  // Permission check
  checkPermission(toolId: string): PermissionCheckResult;

  // Configuration
  getDefaultPermissions(): Record<string, ToolTrustLevel>;
  resetToDefaults(): void;

  // Serialization for persistence
  toJSON(): { permissions: Record<string, ToolTrustLevel> };
  static fromJSON(data: { permissions: Record<string, ToolTrustLevel> }): ToolPermissionManager;
}
```

---

### Task 2: Update ToolExecutionContext with permission check

**File:** `src/lib/agent/tools/types.ts`

Add permission context to tool execution:

```typescript
export interface ToolExecutionContext {
  permissionManager: ToolPermissionManager;
  // ... existing fields
}

export interface ToolExecutionRequest {
  toolId: string;
  parameters: Record<string, unknown>;
  permissionCheck?: PermissionCheckResult;
}
```

---

### Task 3: Integrate permission check in tool execution flow

**File:** `src/lib/agent/tools/index.ts` or `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

Before executing any tool:
1. Check `permissionManager.checkPermission(toolId)`
2. If `canExecute === false`, return blocked error
3. If `needsApproval === true`, queue for approval overlay

---

### Task 4: Create permission configuration UI

**File:** `src/components/agent/ToolPermissionsConfig.tsx`

**Features:**
- List all available tools
- Trust level selector for each
- Visual indicators (green/amber/red)
- Reset to defaults button

---

### Task 5: Update ApprovalOverlay for session trust

**File:** `src/components/chat/ApprovalOverlay.tsx`

Add "Trust for this session" checkbox when appropriate.

---

### Task 6: Add unit tests

**File:** `src/lib/agent/__tests__/tool-permission-manager.test.ts`

**Test cases:**
- Default trust levels are correct
- Auto tools execute without approval
- Prompt tools require approval
- Blocked tools are rejected
- Session trust overrides configured level
- Session trust clears on reload
- Permission changes persist
- Serialization works correctly

---

## Technical Notes

### Security Considerations

1. **No persistent "always allow"**: Session trust only, expires on reload
2. **Block takes precedence**: Blocked tools never execute, even with session trust
3. **Audit logging**: All executions logged for security review

### Performance

1. Permission checks are O(1) lookups
2. Session trust stored in Set for fast lookup
3. No async operations during permission check

### Integration Points

1. `useAgentsStore`: Store permission configuration
2. `ApprovalOverlay`: Show trust checkbox
3. `ToolExecutionService`: Check permissions before execution
4. Event bus: Emit `tool:permission-changed` on updates

---

## Dependencies

| Dependency | Status | Purpose |
|------------|--------|---------|
| Story 4-1 | ✅ Done | SystemPromptComposer for context |
| Story 25-5 | ✅ Done | ApprovalOverlay component |
| useAgentsStore | ✅ Exists | Permission persistence |

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Unit tests written and passing (≥90% coverage)
- [ ] Integration tested with ApprovalOverlay
- [ ] Permission changes work without page reload
- [ ] Security review passed (no persistent always-allow)
- [ ] Story file updated with Dev Agent Record
- [ ] `sprint-status.yaml` updated: `4-3-tool-permissions: done`

---

## Notes

### Deferred to Phase 2

- Per-tool-path permissions (e.g., allow `read_file src/*` but not `read_file /etc`)
- User-defined tool categories
- Permission templates (e.g., "Strict", "Balanced", "Permissive")

### Future Integration

- After Story 4-4 (Error Handling), blocked tools will show retry options
- After Epic 5 (Polish), audit log UI will show execution history
