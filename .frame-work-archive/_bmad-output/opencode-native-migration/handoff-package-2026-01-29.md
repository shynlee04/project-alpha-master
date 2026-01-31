---
artifact_id: "hnd_20260129_150000_beast_mode_pkg"
artifact_type: "handoff"
version: "1.0.0"
status: "READY_FOR_BUILD"
date: "2026-01-29"
source_agent: "antigravity-agent"
target_agent: "module-builder"
story_id: "MIGRATION-PHASE-2"
---

# Handoff Package: Module Builder (BMAD Beast Mode)

## 1. Module Definition

The `module-builder` is tasked with scaffolding the following module structure.

*   **Module Name**: `bmad-beast-mode`
*   **Version**: `2.0.0`
*   **Root Directory**: `.opencode/`
*   **Purpose**: To implement the "Less for More", "Accurately Specific", and "Auto Governance" methodologies natively in OpenCode.

## 2. File Generation Map

| Source Doc | Content Section | Target File | Description |
|------------|-----------------|-------------|-------------|
| `02-accurately-specific...` | **Section 2.1** (Core Schema Definitions) | `.opencode/schemas/artifacts.ts` | Zod schemas for all artifacts. |
| `02-accurately-specific...` | **Section 4.1** (Tool: validate_artifact) | `.opencode/tools/validation.ts` | Tool to validate artifacts against schemas. |
| `02-accurately-specific...` | **Section 4.2** (Tool: track_context_budget) | `.opencode/tools/context-budget.ts` | Tool to track token usage. |
| `02-accurately-specific...` | **Section 4.3** (Tool: load_minimal_context) | `.opencode/tools/context-loader.ts` | Tool to load @file sections dynamically. |
| `01-less-for-more...` | **Section 2** (Agent Configuration Matrix) | `.opencode/agents/*.md` | Agent definitions (dev-ext, architect-ext, etc.). |
| `02-accurately-specific...` | **Section 3.1** (Agent Frontmatter) | `.opencode/agents/dev-ext.md` | Specific frontmatter example for dev-ext. |
| `01-less-for-more...` | **Section 3** (Skill Loading Strategy) | `.opencode/skills/SKILL_MAP.json` | Mapping of Prompt Types (A1-F3) to required Skills. |
| `03-auto-governance...` | **Section 2** (Trap Prevention Hooks) | `.opencode/plugins/pre-execution/*.ts` | Governance plugins (ContextGatheringGate, StaleArtifactGuard). |
| `03-auto-governance...` | **Section 3** (State Management) | `.opencode/plugins/post-execution/state-sync.ts` | Plugin to sync AGENT-STATE.yaml. |
| `03-auto-governance...` | **Section 4** (Brownfield Enforcement) | `.opencode/plugins/pre-execution/brownfield-guard.ts` | Plugin to block `src/lib` and enforce canonical paths. |
| `08-master-framework...` | **Section 1** (Prompt Types Map) | `.opencode/commands/prompt-router.ts` | Logic to route prompts to phases/skills. |

## 3. Execution Instructions for Module Builder

**Sequence is critical.** You must build the primitives (schemas/tools) before the consumers (agents/plugins).

1.  **STEP 1: Foundation (Schemas & Tools)**
    *   Read **Doc 02 (`02-accurately-specific...`)**, specifically **Section 2.1**.
    *   Generate `.opencode/schemas/artifacts.ts` exactly as defined (Zod definitions).
    *   Read **Doc 02**, **Section 4**.
    *   Generate `.opencode/tools/validation.ts`, `.opencode/tools/context-budget.ts`, and `.opencode/tools/context-loader.ts`.

2.  **STEP 2: Agents & Skills**
    *   Read **Doc 01 (`01-less-for-more...`)**, **Section 2**.
    *   Generate `.opencode/agents/{agent}.md` for each agent listed in the matrix (ext-master, dev-ext, etc.).
    *   *CRITICAL*: Use the Frontmatter template from **Doc 02 Section 3.1** for `dev-ext`.
    *   Read **Doc 01**, **Section 3**.
    *   Generate `.opencode/skills/SKILL_MAP.json` representing the "Skill Loading Strategy" table.

3.  **STEP 3: Auto-Governance (Plugins)**
    *   Read **Doc 03 (`03-auto-governance...`)**, **Sections 2, 3, and 4**.
    *   Generate the TypeScript plugin files:
        *   `.opencode/plugins/pre-execution/context-gathering-gate.ts` (from Sec 2.1)
        *   `.opencode/plugins/pre-execution/stale-artifact-guard.ts` (from Sec 2.2)
        *   `.opencode/plugins/post-execution/god-artifact-guard.ts` (from Sec 2.3)
        *   `.opencode/plugins/post-execution/state-sync-plugin.ts` (from Sec 3.1)
        *   `.opencode/plugins/pre-execution/brownfield-guard.ts` (from Sec 4.1)

4.  **STEP 4: Validation**
    *   Read **Doc 08 (`08-meta-framework...`)**, **Section 5** (Handoff Checklist).
    *   Verify that all generated files match the checklist requirements.

## 4. Context Injection (Direct Paths)

Use these absolute paths to read the source code for generation.

*   **Doc 01 (Methodology 2.1 - Agents & Skills)**:
    *   `_bmad-output/opencode-native-migration/phase-2-synthesis/01-less-for-more-standalone-2026-01-29.md`
*   **Doc 02 (Methodology 2.2 - Schemas & Tools)**:
    *   `_bmad-output/opencode-native-migration/phase-2-synthesis/02-accurately-specific-standalone-2026-01-29.md`
*   **Doc 03 (Methodology 2.3 - Governance Plugins)**:
    *   `_bmad-output/opencode-native-migration/phase-2-synthesis/03-auto-governance-standalone-2026-01-29.md`
*   **Doc 08 (Master Map - Validation)**:
    *   `_bmad-output/opencode-native-migration/loop-1-gap-analysis/08-meta-framework-master-map-2026-01-29.md`
