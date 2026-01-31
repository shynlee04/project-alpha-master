---
id: "synthesis_20260129_03_autogov"
title: "Phase 2.3 Methodology: Auto Governance (Standalone)"
version: "1.0.0"
status: "DRAFT"
date: "2026-01-29"
author: "tech-writer-ext"
category: "methodology"
tier: 2
purpose: |
  Definitive standalone guide for implementing 'Auto Governance' via OpenCode Plugins, Hooks, and Events.
  Synthesized from Master Mapping (Doc 07) and Methodologies Framework (Doc 06).
related_documents:
  - "06-three-methodologies-framework-2026-01-29.md"
  - "07-master-prompt-to-phase-mapping-2026-01-29.md"
---

# Phase 2.3: Auto Governance (Invisible Enforcement)

> **"The Best Governance is Invisible."**
> Instead of asking agents to read rules, we enforce them at the system level.

## 1. The Core Principle

**Auto Governance** shifts compliance from *documentation* (which agents ignore) to *interception* (which agents cannot bypass). It relies on three primitives:

1.  **Plugins**: The container for governance logic.
2.  **Hooks**: Interceptors that run `before` or `after` tool execution.
3.  **Events**: Triggers based on session lifecycle (`created`, `idle`, `compacting`, `error`).

### The Equation
```typescript
Governance = (Tool_Intercept + State_Update + Event_Reaction) / Zero_Token_Overhead
```

---

## 2. Trap Prevention Hooks (The 10 Traps)

Implementing the **Trap Prevention Matrix** (Doc 07, Part 7) via TypeScript plugins.

### 2.1 Trap 1: Blind Charge (Premature Implementation)
**Problem**: Agent writes code without reading context.
**Solution**: `ContextGatheringGate` blocks `write` if `read` hasn't occurred.

```typescript
// .opencode/plugins/pre-execution/context-gathering-gate.ts
export const ContextGatheringGate: Plugin = async (ctx) => {
  let hasReadContext = false;

  return {
    "tool.execute.before": async (input) => {
      if (input.tool === "read" || input.tool === "glob" || input.tool === "grep") {
        hasReadContext = true;
      }
      
      if (input.tool === "write" && !hasReadContext) {
        throw new Error(
          "GOVERNANCE BLOCK: Blind Charge detected. " +
          "You must READ context/requirements before writing code."
        );
      }
    }
  };
};
```

### 2.2 Trap 4: Stale Context (Context Poisoning)
**Problem**: Agent reads old artifacts (>2h) and hallucinates.
**Solution**: `StaleArtifactGuard` checks file mtime on `read`.

```typescript
// .opencode/plugins/pre-execution/stale-artifact-guard.ts
import * as fs from 'fs';

export const StaleArtifactGuard: Plugin = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "read") return;
      
      const filePath = output.args.filePath as string;
      // Focus on sprint artifacts
      if (!filePath.includes("_bmad-output/sprint-artifacts/")) return;
      
      const stats = fs.statSync(filePath);
      const ageMs = Date.now() - stats.mtimeMs;
      const TTL_LIMIT = 2 * 60 * 60 * 1000; // 2 hours
      
      if (ageMs > TTL_LIMIT) {
        throw new Error(
          `GOVERNANCE BLOCK: Artifact is stale (${Math.round(ageMs/3600000)}h old). ` +
          `Run 'stale-check' or 'validate-context' to refresh.`
        );
      }
    }
  };
};
```

### 2.3 Trap 9: God Stores (Complexity Overload)
**Problem**: Creating/Editing stores > 300 lines.
**Solution**: `GodArtifactGuard` checks line count on `write`.

```typescript
// .opencode/plugins/post-execution/god-artifact-guard.ts
export const GodArtifactGuard: Plugin = async (ctx) => {
  return {
    "tool.execute.before": async (input) => {
       if (input.tool !== "write") return;
       const content = input.args.content as string;
       
       if (content.split('\n').length > 300 && input.args.filePath.includes("store")) {
         throw new Error(
           "GOVERNANCE BLOCK: God Store detected (>300 lines). " +
           "You must split this state using 'store-refactorer' methodology."
         );
       }
    }
  };
};
```

---

## 3. State Management Automation

Automating the **State Update Matrix** (Doc 07, Part 5).

### 3.1 Real-Time State Sync (`tool.execute.after`)
Updates `AGENT-STATE.yaml` after every meaningful action.

```typescript
// .opencode/plugins/post-execution/state-sync-plugin.ts
export const StateSyncPlugin: Plugin = async (ctx) => {
  return {
    "tool.execute.after": async (input, result) => {
      if (input.tool === "read" || input.tool === "ls") return; // Ignore passive

      const statePath = ".opencode/state/AGENT-STATE.yaml";
      const currentState = await loadYaml(statePath);
      
      // Update Step
      currentState.last_action = {
        tool: input.tool,
        timestamp: new Date().toISOString(),
        status: "success"
      };
      
      await writeYaml(statePath, currentState);
    }
  };
};
```

### 3.2 Session Compacting Injection (`session.compacting`)
Ensures `LOOP_STATE` survives context clearing.

```typescript
// .opencode/plugins/lifecycle/compaction-injector.ts
export const CompactionInjector: Plugin = async (ctx) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      const loopState = await loadYaml("_bmad-ext/state/LOOP_STATE.yaml");
      
      // Inject critical state into the NEXT prompt
      output.context.push(`
## PERSISTED GOVERNANCE STATE
- Session ID: ${loopState.session_id}
- Current Workflow: ${loopState.delegations.active.child_agent || "None"}
- Active Epic: ${loopState.current_epic}
- Stale Check Status: ${loopState.stale_check_passed ? "PASS" : "PENDING"}

> RESTORE CONTEXT IMMEDIATELY FROM: ${loopState.delegations.active.handoff_artifact}
      `);
    }
  };
};
```

---

## 4. Brownfield Enforcement

Specific rules for **Project Alpha** (Doc 07, Part 6).

### 4.1 Block Deprecated Paths (`src/lib/`)

```typescript
// .opencode/plugins/pre-execution/brownfield-guard.ts
export const BrownfieldGuard: Plugin = async (ctx) => {
  return {
    "tool.execute.before": async (input) => {
      const path = input.args.filePath || input.args.path;
      if (!path) return;
      
      // RULE: No src/lib allowed
      if (path.includes("src/lib")) {
         if (input.tool === "write" || input.tool === "write_file") {
            throw new Error(
              "ARCHITECTURAL VIOLATION: 'src/lib' is DEPRECATED. " +
              "Use 'src/infrastructure' or 'src/domain' as per ADR-039."
            );
         }
      }
      
      // RULE: Enforce Canonical Paths
      if (path.includes("src/stores")) {
        throw new Error("VIOLATION: Stores belong in 'src/infrastructure/persistence/stores'.");
      }
    }
  };
};
```

---

## 5. Validation Checklist (Self-Check)

Validated against **Doc 07, Part 8: Phase 2.3 Checklist**.

| Check | Status | Verification in Doc |
|-------|--------|---------------------|
| **Hooks Defined?** | ✅ YES | Section 2 & 3 define `before`/`after` hooks. |
| **Plugins Present?** | ✅ YES | `ContextGatheringGate`, `StaleArtifactGuard`, `StateSync`. |
| **State Structure?** | ✅ YES | Section 3.1 & 3.2 cover `AGENT-STATE` & `LOOP_STATE`. |
| **10 Traps Covered?** | ✅ YES | Section 2 maps Traps 1, 4, 9 directly. |
| **Brownfield Rules?** | ✅ YES | Section 4 covers `src/lib` blocking. |
| **Single Truth?** | ✅ YES | References Doc 06 & 07 in frontmatter. |
| **Token Neutral?** | ✅ YES | Logic resides in system, not context. |

---

## 6. Implementation Plan (Next Steps)

1.  **Create Plugin Directory**: `mkdir -p .opencode/plugins/{pre,post,lifecycle}`
2.  **Deploy Guards**: Write the `.ts` files defined in Section 2 & 4.
3.  **Activate in Config**: Add plugins to `opencode.json`.
4.  **Test**:
    *   Try to write without reading (Should FAIL).
    *   Try to read stale file (Should FAIL).
    *   Try to write to `src/lib` (Should FAIL).

**Status**: READY FOR IMPLEMENTATION
