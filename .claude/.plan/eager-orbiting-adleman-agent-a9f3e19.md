# BMAD Master Plan: Cycle 3 & 4 Workflow Specifications

**Session**: BMAD-MASTER-20250106-CYCLE34
**Status**: READY FOR PARALLEL EXECUTION
**Created**: 2026-01-06
**Parent Plan**: `/Users/apple/.claude/plans/eager-orbiting-adleman.md`

---

## Executive Summary

This document provides systematic workflow specifications for **Cycle 3** (Synchronization Root Fixes) and **Cycle 4** (State & Key Management) from the BMAD Master Plan.

Each sub-cycle is designed to:
- Execute independently in a new thread
- Have clear entry/exit points
- Produce completion artifacts
- Update Ralph Loop state on finish

**Parallel Execution Strategy**: Cycles 3 and 4 can run simultaneously as they operate on independent domains (synchronization vs state management).

---

## Part 1: Codebase Analysis Summary

### Critical Files Identified

**Synchronization (Cycle 3)**:
- `/src/lib/events/cross-workspace-event-bus.ts` (588 lines)
  - Has emission methods but gaps in bidirectional sync
  - Lines 84-85: State preservation incomplete
  - Missing: Complete state restoration logic

- `/src/lib/workflow/executor/workflow-executor.ts` (714 lines)
  - Has pause/resume/cancel methods (lines 257-324)
  - Missing: UI components for user control
  - Missing: Progress indicators for long operations

**State Management (Cycle 4)**:
- God stores found (12 total, not 69 as initially estimated):
  - Test files (exclude from remediation): 3 files >300 lines
  - Infrastructure files: `dexie-db.ts` (1081 lines), `event-bus.ts` (764 lines)
  - Large components: `workflow-executor.ts` (713 lines), `debate-agent.ts` (752 lines)
  - UI components: `resizable.tsx` (745 lines)

- Database: `dexie-db-class.ts`
  - Has `providerConfigs` table (line 96)
  - Has `agentConfigs` table (line 97)
  - Missing: Unified key orchestration layer

---

## Part 2: Cycle 3 - Synchronization Root Fixes

### Sub-Cycle 3A: Bidirectional Event System Completion

**Objective**: Complete the cross-workspace event system for full state synchronization

**Files to Modify**:
1. `/src/lib/events/cross-workspace-event-bus.ts`
   - Add state preservation/restoration logic (lines 84-85 gap)
   - Implement bidirectional emission/reception
   - Add event replay mechanism for missed events

2. `/src/lib/workspace/session-snapshot.ts` (if exists)
   - Verify it integrates with event bus
   - Add snapshot restoration on workspace switch

**Implementation Requirements**:

1. **State Snapshot on Workspace Switch**:
   ```typescript
   // When workspace:changed event fires
   - Save current workspace state to IndexedDB (SessionSnapshotTable)
   - Include: active agents, open files, conversation state, tool permissions
   - Emit workspace:changing event (before switch)
   - Emit workspace:changed event (after switch)
   ```

2. **State Restoration on Switch Completion**:
   ```typescript
   // When receiving workspace:changed event
   - Load previous workspace state from SessionSnapshotTable
   - Restore: agents, files, conversations, permissions
   - Emit workspace:restored event
   ```

3. **Event Replay for Missed Events**:
   ```typescript
   // Add event buffer with TTL
   - Buffer events for 5 minutes
   - On workspace switch, replay relevant events from buffer
   - Prevent race conditions with event sequencing
   ```

**Acceptance Criteria**:
- [ ] Switching from IDE → Knowledge preserves IDE state
- [ ] Switching back to IDE restores exact state (agents, files, position)
- [ ] No data loss during workspace switch
- [ ] Event replay catches missed events during switch
- [ ] Zero TypeScript errors

**Validation Commands**:
```bash
# TypeScript check
pnpm typecheck

# Verify event types
grep -r "emitWorkspaceChanged\|onWorkspaceChanged" src/lib/events --include='*.ts'

# Check state persistence
grep -r "SessionSnapshotTable" src --include='*.ts'
```

**Expected Artifacts**:
1. `_bmad-output/artifacts/2026-01-06/cycle-3a-bidirectional-events-completion.md`
   - Implementation summary
   - Test results (manual or automated)
   - Code snippets showing state preservation/restoration

2. Updated Ralph Loop state:
   ```yaml
   current_subcycle: "3A"
   last_completed_subcycle: "3A"
   phase: "synchronization"
   ```

**Dependencies**: None (can start immediately)

---

### Sub-Cycle 3B: Pause/Resume/Cancel UI Components

**Objective**: Create user-facing controls for workflow management

**Files to Create**:
1. `/src/presentation/components/workflow/workflow-control-bar.tsx`
   - Control bar with pause/resume/cancel buttons
   - Progress indicator (percentage, current step)
   - Status badge (idle/running/paused/completed/failed)

2. `/src/presentation/components/workflow/workflow-progress-modal.tsx`
   - Modal for long-running operations
   - Step-by-step progress visualization
   - Estimated time remaining
   - Cancel button with confirmation

**Files to Modify**:
1. `/src/lib/workflow/executor/workflow-executor.ts`
   - Already has pause/resume/stop methods (lines 257-324)
   - Add progress callback to ExecutionConfig
   - Add time estimation for steps

2. `/src/presentation/components/ui/` (existing UI components)
   - Reuse button, badge, progress components
   - Ensure mobile compatibility (touch targets ≥44px)

**Implementation Requirements**:

1. **Workflow Control Bar**:
   ```tsx
   // Features
   - Pause/Resume toggle button
   - Cancel button (with confirmation)
   - Progress bar (0-100%)
   - Status badge (color-coded)
   - Current step name
   - Steps remaining count
   ```

2. **Progress Modal**:
   ```tsx
   // Features
   - Show for operations >10 seconds
   - Step list with checkmarks
   - Current step highlighted
   - Estimated time remaining
   - Background operation (user can continue)
   - "Minimize" button to hide modal
   ```

3. **Mobile Considerations**:
   - Full-screen modal on mobile (use `dvh`)
   - Touch targets ≥44px
   - Swipe down to minimize modal
   - Landscape/portrait support

**Acceptance Criteria**:
- [ ] Control bar shows on all workflow executions
- [ ] Pause/resume works mid-execution
- [ ] Cancel shows confirmation dialog
- [ ] Progress updates in real-time
- [ ] Modal auto-shows for long operations
- [ ] Mobile responsive (tested on viewport 390x844)
- [ ] All UI strings use `t()` i18n hook
- [ ] 8-bit styling (no glassmorphism/blur)

**Validation Commands**:
```bash
# TypeScript check
pnpm typecheck

# Check i18n coverage
grep -r ">[A-Z][a-z]" src/presentation/components/workflow --include='*.tsx' | grep -v "t(" | wc -l

# Check mobile targets
grep -r "className.*h-\[44px\]\|min-h-\[44px\]" src/presentation/components/workflow --include='*.tsx'

# Verify no glassmorphism
grep -r "backdrop-blur" src/presentation/components/workflow --include='*.tsx' | wc -l
```

**Expected Artifacts**:
1. `_bmad-output/artifacts/2026-01-06/cycle-3b-workflow-ui-completion.md`
   - Component screenshots (manual test)
   - Mobile responsiveness report
   - i18n compliance check

2. Updated Ralph Loop state

**Dependencies**:
- Requires 3A (workspace sync needed for cross-workspace workflows)

---

### Sub-Cycle 3C: Mobile-Aware Error Handling

**Objective**: Add fallback mechanisms for mobile-specific limitations

**Files to Create**:
1. `/src/lib/error/mobile-fallback-handler.ts`
   - Detect mobile environment
   - Provide fallbacks for File System Access API
   - Circuit-breaker pattern for WebContainer failures

2. `/src/lib/sync/sync-recovery-agent.ts`
   - Retry logic with exponential backoff
   - Partial sync recovery
   - Conflict resolution for mobile sync

**Files to Modify**:
1. `/src/lib/workspace/file-sync-manager.ts` (if exists)
   - Add mobile detection
   - Fallback to IndexedDB when FSA fails
   - Progressive enhancement strategy

2. `/src/lib/webcontainer/webcontainer-manager.ts` (if exists)
   - Add circuit-breaker pattern
   - Graceful degradation on mobile
   - User notification for unsupported features

**Implementation Requirements**:

1. **Mobile Detection**:
   ```typescript
   export function isMobileDevice(): boolean {
     return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
     || ('ontouchstart' in window && window.innerWidth < 768);
   }
   ```

2. **File System Access Fallback**:
   ```typescript
   // Try FSA API
   try {
     await fileHandle = showSaveFilePicker();
   } catch (error) {
     // Fallback to IndexedDB download
     if (isMobileDevice()) {
       await downloadFileViaIndexedDB();
     }
   }
   ```

3. **Circuit-Breaker Pattern**:
   ```typescript
   class WebContainerCircuitBreaker {
     private failureCount = 0;
     private threshold = 3;
     private state: 'closed' | 'open' | 'half-open' = 'closed';

     async execute(operation) {
       if (this.state === 'open') {
         throw new Error('WebContainer unavailable (circuit open)');
       }
       try {
         return await operation();
       } catch (error) {
         this.failureCount++;
         if (this.failureCount >= this.threshold) {
           this.state = 'open';
           setTimeout(() => this.state = 'half-open', 60000);
         }
         throw error;
       }
     }
   }
   ```

4. **Sync Recovery**:
   ```typescript
   class SyncRecoveryAgent {
     async recoverSync(failedOperation) {
       // Step 1: Detect conflict
       const conflict = await this.detectConflict(failedOperation);

       // Step 2: Resolve conflict
       if (conflict) {
         await this.resolveConflict(conflict);
       }

       // Step 3: Retry with backoff
       return this.retryWithBackoff(failedOperation);
     }
   }
   ```

**Acceptance Criteria**:
- [ ] Mobile detection works on iOS/Android
- [ ] FSA API gracefully falls back on mobile
- [ ] WebContainer failures don't crash app
- [ ] Sync failures retry automatically
- [ ] User notified of fallback behavior
- [ ] Zero TypeScript errors

**Validation Commands**:
```bash
# TypeScript check
pnpm typecheck

# Verify fallback patterns
grep -r "isMobileDevice\|fallback" src/lib/error src/lib/sync --include='*.ts' | wc -l

# Check error boundaries
grep -r "ErrorBoundary" src/presentation --include='*.tsx' | wc -l
```

**Expected Artifacts**:
1. `_bmad-output/artifacts/2026-01-06/cycle-3c-mobile-error-handling-completion.md`
   - Mobile detection test results
   - Fallback mechanism documentation
   - Sync recovery test cases

2. Updated Ralph Loop state

**Dependencies**: None (can run in parallel with 3A and 3B)

---

## Part 3: Cycle 4 - State & Key Management

### Sub-Cycle 4A: God Store Elimination (Corrected)

**Objective**: Split 12 god stores into focused slices ≤120 lines each

**Clarification**: Previous estimate of 69 god stores was **incorrect**. Actual count is **12 stores** (excluding test files and infrastructure).

**Target Stores** (>300 lines, excluding tests):
1. `/src/infrastructure/persistence/dexie-db.ts` (1081 lines) → **Infrastructure**
2. `/src/infrastructure/events/event-bus.ts` (764 lines) → **Infrastructure**
3. `/src/lib/workflow/executor/workflow-executor.ts` (713 lines) → **Already split** (has test)
4. `/src/lib/workflow/agents/debate-agent.ts` (752 lines) → **Split into slices**
5. `/src/presentation/components/ui/resizable.tsx` (745 lines) → **Component** (split if >300)

**Files to Analyze**:
```bash
# Determine which stores are actual god stores
find src/infrastructure/persistence/stores -name "*-store.ts" -exec wc -l {} \; | sort -rn | head -20
```

**Implementation Strategy**:

1. **For Each God Store**:
   ```bash
   # Step 1: Analyze store structure
   grep -n "export function\|export const\|interface\|type" <store-file>

   # Step 2: Identify bounded contexts
   # Group related functions/state by domain

   # Step 3: Create slices
   # - slice-1.ts (≤120 lines)
   # - slice-2.ts (≤120 lines)
   # - slice-3.ts (≤120 lines)

   # Step 4: Create facade
   # Re-export all slices from original store path
   ```

2. **Example Split Pattern**:
   ```typescript
   // Original: debate-agent.ts (752 lines)
   //
   // Split into:
   // - debate-core.ts (debate orchestration)
   // - debate-personas.ts (persona definitions)
   // - debate-evaluation.ts (result evaluation)
   // - debate-agent.ts (facade, re-exports all)
   ```

3. **Backward Compatibility**:
   ```typescript
   // debate-agent.ts (becomes facade)
   export * from './debate-core';
   export * from './debate-personas';
   export * from './debate-evaluation';
   export { DebateAgent } from './debate-core';
   ```

**Acceptance Criteria**:
- [ ] All slices ≤120 lines
- [ ] Original import paths still work
- [ ] Zero breaking changes
- [ ] Zero TypeScript errors
- [ ] All tests pass

**Validation Commands**:
```bash
# Check slice sizes
find src/lib/workflow/agents -name "debate-*.ts" -exec wc -l {} \; | sort -rn

# Verify imports still work
grep -r "from.*debate-agent" src --include='*.ts' --include='*.tsx'

# TypeScript check
pnpm typecheck

# Test suite
pnpm test -- debate-agent
```

**Expected Artifacts**:
1. `_bmad-output/artifacts/2026-01-06/cycle-4a-god-store-elimination-completion.md`
   - Before/after line counts
   - Slice breakdown
   - Import verification report

2. Updated Ralph Loop state

**Dependencies**: None (can run in parallel with 3A-3C)

---

### Sub-Cycle 4B: Centralized Key Orchestration

**Objective**: Create unified layer for LLM provider key management

**Files to Create**:
1. `/src/lib/llm/key-orchestration-service.ts`
   - Unified access to provider configs
   - Security vs convenience balance
   - Key rotation support
   - Cross-workspace key sync

2. `/src/lib/llm/key-migration-workflow.ts`
   - Migrate existing keys to new format
   - Validate key format
   - Rollback on failure

**Files to Modify**:
1. `/src/infrastructure/persistence/dexie-db-class.ts`
   - Add `providerConfigs` table access (line 96 already exists)
   - Add `llmKeys` table (if needed)

2. `/src/infrastructure/persistence/stores/providers/provider-config-store.ts` (if exists)
   - Integrate with key orchestration service
   - Add key validation

**Implementation Requirements**:

1. **Key Orchestration Service**:
   ```typescript
   class KeyOrchestrationService {
     // Get provider API key (unified access)
     async getProviderKey(providerId: string): Promise<string | null> {
       // Check IndexedDB first (convenience)
       // Check secure storage (security)
       // Return null if not found
     }

     // Save provider key
     async saveProviderKey(providerId: string, key: string): Promise<void> {
       // Validate key format
       // Encrypt before storage
       // Save to IndexedDB
       // Emit cross-workspace event
     }

     // Rotate key
     async rotateProviderKey(providerId: string, oldKey: string, newKey: string): Promise<void> {
       // Verify old key matches
       // Update with new key
       // Invalidate old key
     }

     // Sync across workspaces
     syncKeyAcrossWorkspaces(providerId: string): void {
       // Emit provider:config:change event
       crossWorkspaceEventBus.emitProviderConfigChange({
         workspaceId: 'ide',
         providerId,
         changeType: 'credentials_updated',
       });
     }
   }
   ```

2. **Key Validation**:
   ```typescript
   function validateProviderKey(providerId: string, key: string): boolean {
     const validators = {
       'openai': (key) => key.startsWith('sk-') && key.length > 40,
       'gemini': (key) => key.length > 30,
       'anthropic': (key) => key.startsWith('sk-ant-'),
     };

     return validators[providerId]?.(key) ?? false;
   }
   ```

3. **Migration Workflow**:
   ```typescript
   async function migrateKeysToOrchestration() {
     // Step 1: Scan existing providerConfigs
     const existingConfigs = await db.providerConfigs.toArray();

     // Step 2: Validate each key
     for (const config of existingConfigs) {
       if (!validateProviderKey(config.providerId, config.apiKey)) {
         console.warn(`Invalid key for ${config.providerId}`);
         continue;
       }

       // Step 3: Save via orchestration service
       await keyOrchestration.saveProviderKey(config.providerId, config.apiKey);
     }

     // Step 4: Verify migration
     const migratedKeys = await Promise.all(
       existingConfigs.map(c => keyOrchestration.getProviderKey(c.providerId))
     );

     return migratedKeys.every(key => key !== null);
   }
   ```

**Acceptance Criteria**:
- [ ] Unified key access from all workspaces
- [ ] Key validation before storage
- [ ] Key sync across workspaces via event bus
- [ ] Migration completes without data loss
- [ ] Zero TypeScript errors

**Validation Commands**:
```bash
# TypeScript check
pnpm typecheck

# Verify key orchestration usage
grep -r "KeyOrchestrationService\|keyOrchestration" src --include='*.ts' | wc -l

# Check provider config table usage
grep -r "providerConfigs" src/infrastructure/persistence --include='*.ts'
```

**Expected Artifacts**:
1. `_bmad-output/artifacts/2026-01-06/cycle-4b-key-orchestration-completion.md`
   - Key migration results
   - Validation test report
   - Cross-workspace sync verification

2. Updated Ralph Loop state

**Dependencies**: None (can run in parallel with all other sub-cycles)

---

### Sub-Cycle 4C: Agent Config Template System

**Objective**: Create unified agent configuration templates for cross-workspace consistency

**Files to Create**:
1. `/src/lib/agent/agent-config-template-service.ts`
   - Define agent config templates
   - Template inheritance (base → workspace-specific)
   - Template validation

2. `/src/lib/agent/agent-config-sync-workflow.ts`
   - Bring agent configs across workspace switches
   - Preserve similarity matching
   - Auto-select best matching agent

**Files to Modify**:
1. `/src/infrastructure/persistence/dexie-db-class.ts`
   - Add `agentConfigTemplates` table (or use existing `agentConfigs` on line 97)

2. `/src/lib/events/cross-workspace-event-bus.ts`
   - Already has `AgentConfigChangeEvent` (lines 253-283)
   - Emit template sync events

**Implementation Requirements**:

1. **Agent Config Templates**:
   ```typescript
   interface AgentConfigTemplate {
     id: string;
     name: string;
     description: string;
     workspaceType: 'ide' | 'knowledge' | 'study' | 'notes' | 'all';
     providerId: string;
     modelId: string;
     temperature: number;
     maxTokens: number;
     systemPrompt: string;
     capabilities: string[];
     permissions: string[];
   }

   class AgentConfigTemplateService {
     // Get template for workspace
     async getTemplate(agentId: string, workspaceType: WorkspaceId): Promise<AgentConfigTemplate> {
       // Try workspace-specific template first
       // Fall back to 'all' workspace template
       // Throw if not found
     }

     // Save template
     async saveTemplate(template: AgentConfigTemplate): Promise<void> {
       // Validate template
       // Save to IndexedDB (agentConfigTemplates table)
       // Emit agent:config:change event
     }

     // Find similar agents in other workspace
     async findSimilarAgents(sourceAgentId: string, targetWorkspace: WorkspaceId): Promise<string[]> {
       // Match by: providerId, modelId, temperature
       // Return list of agent IDs sorted by similarity score
     }
   }
   ```

2. **Workspace Switch Bring-Over**:
   ```typescript
   class AgentConfigSyncWorkflow {
     async syncAgentOnWorkspaceSwitch(fromWorkspace: WorkspaceId, toWorkspace: WorkspaceId) {
       // Step 1: Get current agent config
       const currentAgent = await getCurrentAgent(fromWorkspace);

       // Step 2: Find similar agents in target workspace
       const similarAgents = await templateService.findSimilarAgents(currentAgent.id, toWorkspace);

       // Step 3: Select best match
       const bestMatch = similarAgents[0];

       // Step 4: Apply config from template
       const template = await templateService.getTemplate(bestMatch, toWorkspace);
       await applyAgentConfig(template);

       // Step 5: Notify user
       notify(`Switched to ${template.name} in ${toWorkspace}`);
     }
   }
   ```

3. **Template Validation**:
   ```typescript
   function validateAgentTemplate(template: AgentConfigTemplate): ValidationResult {
     const errors = [];

     // Required fields
     if (!template.id) errors.push('Missing id');
     if (!template.providerId) errors.push('Missing providerId');
     if (!template.modelId) errors.push('Missing modelId');

     // Value ranges
     if (template.temperature < 0 || template.temperature > 2) {
       errors.push('Temperature must be 0-2');
     }

     if (template.maxTokens < 1 || template.maxTokens > 128000) {
       errors.push('maxTokens must be 1-128000');
     }

     return { valid: errors.length === 0, errors };
   }
   ```

**Acceptance Criteria**:
- [ ] Agent templates defined for all workspaces
- [ ] Workspace switch auto-selects similar agent
- [ ] Template validation prevents invalid configs
- [ ] Cross-workspace config sync works
- [ ] Zero TypeScript errors

**Validation Commands**:
```bash
# TypeScript check
pnpm typecheck

# Verify template service usage
grep -r "AgentConfigTemplateService\|agentConfigTemplate" src --include='*.ts' | wc -l

# Check agent config events
grep -r "emitAgentConfigChange" src --include='*.ts'
```

**Expected Artifacts**:
1. `_bmad-output/artifacts/2026-01-06/cycle-4c-agent-config-templates-completion.md`
   - Template definitions
   - Similarity matching test results
   - Workspace switch verification

2. Updated Ralph Loop state

**Dependencies**: None (can run in parallel with all other sub-cycles)

---

## Part 4: Ralph Loop State Update Protocol

After each sub-cycle completion, update `.claude/ralph-loop.local.md`:

```yaml
# Example: After 3A completes
current_cycle: 3
current_subcycle: "3B"  # Move to next
last_completed_cycle: 2
last_completed_subcycle: "3A"
phase: "synchronization"

latest_artifacts:
  cycle_3a: "_bmad-output/artifacts/2026-01-06/cycle-3a-bidirectional-events-completion.md"
  cycle_3b: "pending"
  cycle_3c: "pending"

next_actions:
  - execute_cycle_3b_workflow_ui
  - execute_cycle_3c_mobile_error_handling
```

---

## Part 5: Cross-Check Validation

After all sub-cycles complete, run cross-cycle validation:

**Cycle 3 validates against Cycle 4**:
- [ ] Event bus works with new key orchestration (3A ↔ 4B)
- [ ] Workflow UI shows agent config templates (3B ↔ 4C)
- [ ] Mobile error handling respects store splits (3C ↔ 4A)

**Cycle 4 validates against Cycle 3**:
- [ ] Key orchestration emits cross-workspace events (4B ↔ 3A)
- [ ] Agent config templates sync via event bus (4C ↔ 3A)
- [ ] Store slices support pause/resume (4A ↔ 3B)

---

## Part 6: Execution Order

### Parallel Execution Matrix

| Sub-Cycle | Can Run With | Dependencies |
|-----------|--------------|--------------|
| **3A** | 3B (after 3A starts), 3C, 4A, 4B, 4C | None |
| **3B** | 3C, 4A, 4B, 4C | 3A (workspace sync needed) |
| **3C** | 3A, 4A, 4B, 4C | None |
| **4A** | 3A, 3B, 3C, 4B, 4C | None |
| **4B** | 3A, 3B, 3C, 4A, 4C | None |
| **4C** | 3A, 3B, 3C, 4A, 4B | None |

### Suggested Execution Flow

**Option 1: Full Parallel (Fastest)**
```
Thread 1: 3A → 3B
Thread 2: 3C
Thread 3: 4A
Thread 4: 4B
Thread 5: 4C
```

**Option 2: Sequential Dependencies**
```
Phase 1: 3A, 3C, 4A, 4B, 4C (all in parallel)
Phase 2: 3B (after 3A completes)
```

**Option 3: Conservative**
```
Cycle 3: 3A → 3B → 3C
Cycle 4: 4A → 4B → 4C
(Cycles 3 & 4 run in parallel)
```

---

## Part 7: Handoff Template

Each sub-cycle should create a completion artifact with:

```markdown
# Sub-Cycle {N}{L} Completion Report

**Date**: 2026-01-06
**Sub-Cycle**: {N}{L}
**Status**: ✅ COMPLETE / ❌ FAILED

## Objective
{Objective from specification}

## Files Modified
- {file-path}: {changes made}
- {file-path}: {changes made}

## Files Created
- {file-path}: {purpose}

## Acceptance Criteria
- [x] {criterion 1}
- [x] {criterion 2}
- [ ] {criterion 3} (if not met)

## Validation Results
```bash
# TypeScript
pnpm typecheck
# Output: {result}

# Tests
pnpm test
# Output: {result}
```

## Issues Encountered
{Describe any blockers, errors, or deviations}

## Next Actions
{Suggested next steps}

## Ralph Loop Update
```yaml
current_subcycle: "{next sub-cycle}"
last_completed_subcycle: "{current}"
phase: "{current phase}"
latest_artifacts:
  cycle_{n}{l}: "_bmad-output/artifacts/2026-01-06/cycle-{n}{l}-completion.md"
```
```

---

## Part 8: Success Criteria Validation

After all sub-cycles complete, verify:

**Cycle 3 Metrics**:
- [ ] 100% cross-workspace state sync
- [ ] Pause/resume/cancel on all long operations
- [ ] Mobile fallbacks on all error paths

**Cycle 4 Metrics**:
- [ ] 0 god stores (12 stores split into slices)
- [ ] Centralized key orchestration active
- [ ] Agent config templates defined for all workspaces

**Combined Metrics**:
- [ ] Zero TypeScript errors
- [ ] All tests pass
- [ ] No breaking changes
- [ ] Ralph Loop state updated

---

**End of Workflow Specifications**

**Next Action**: Execute sub-cycles in parallel using isolated threads
**Entry Point**: Each sub-cycle can be invoked via `/bmad-core-agents-bmad-master` with sub-cycle flag
**Exit Point**: Completion artifact in `_bmad-output/artifacts/2026-01-06/`
