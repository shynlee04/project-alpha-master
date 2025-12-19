# CHAM Synthesis Report – via-gent (2025-12-09)

**Audit ID:** cham-via-gent-2025-12-09-v2  
**Inputs:**
- `codebase-map.json`
- `patterns-detected.yaml`
- `issue-reports/architecture.json`
- `phase-discovery.json`
- `phase-scanning.json`
- `remediation-roadmap.md`
- `docs/issues-enlisting-09-dec-2025.md`

---

## 1. Consolidated Diagnosis

### 1.1 Architecture & Structure

- Domains (`agent`, `ide`, `project`, `llm`, `memory`) follow the documented DDD-inspired layout and are structurally sound.
- EventBus + typed event schemas are correctly centralized.
- Tier-2 foundations (DualFileSystem, PermissionManager, WebContainers integration) are in place and consistent with the ADRs.

**Main structural pain points**
- **Routing duplication**: `_workspace/ide/` vs `routes/ide/` creates ambiguity for the IDE entry point.
- **Test scattering**: 16 different test locations plus inline `.test.tsx` files cause fragmentation and cognitive load.
- **State duplication**: domain stores vs `lib/app-store.ts` and other legacy patterns.

### 1.2 TanStack Stack Integration

- TanStack Router is present but not fully aligned with best practices for:
  - `_workspace` layout routes.
  - Centralized search param schemas with Zod and `zodValidator`.
- TanStack AI is **not** wired as the primary orchestration layer:
  - `useAgentChat` implements its own logic instead of using `@tanstack/ai-react useChat` and tool architecture.

### 1.3 Product vs Implementation Drift

From `mission.md` and `issues-enlisting-09-dec-2025.md`:
- The mission focuses on **solo devs and learners** with a **Tier-2, browser-based IDE**.
- The implementation has started to drift toward a much larger surface:
  - Multi-agent UIs
  - PM workspaces
  - Asset/media studio concepts

CHAM confirms that this drift is visible in the code and routing structure, even if some features are only partially implemented.

---

## 2. Crosswalk: Issues Document → CHAM Findings

The high-level concerns in `issues-enlisting-09-dec-2025.md` map directly to CHAM outputs:

- **New stacks confusion (TanStack Start, TanStack AI, WebContainers):**
  - `patterns-detected.yaml` shows only **partial** adherence to TanStack patterns.
  - `architecture.json` flags TanStack AI integration as a **critical** cluster.

- **IDE vs project management vs agentic workflows:**
  - CHAM sees a solid IDE shell foundation but no clear separation in UX yet.
  - MVP-0 scope refocuses on the **IDE-first** experience.

- **Unplanned structure & scattered tests:**
  - `codebase-map.json` and `architecture.json` both flag test scattering and mixed store patterns.

- **Standards & planning alignment:**
  - There are many strong standards docs (`global-settings/**`, `new-ADR-total-client-side/**`), but they are not consistently enforced in the current code.

---

## 3. Decision: Controlled Stabilization Path

The CHAM evidence supports the earlier recommendation:

- **No full rewrite** – core domains, Dual FS, EventBus and IDE shell are valuable.
- **No "continue as-is"** – drift and fragmentation will worsen without guardrails.
- **Adopt controlled stabilization:**
  1. Freeze and audit (done: discovery + architecture scanning).
  2. Re-anchor product in **MVP-0 scope**.
  3. Consolidate architecture per remediation clusters.

MVP-0 is now codified in:
- `agent-os/product/mvp-0-scope.md`
- `agent-os/product/anti-scope.md`

---

## 4. Remediation Strategy Overview

### 4.1 Critical Clusters

1. **Cluster 1 – TanStack AI Integration**
   - Replace ad-hoc agent orchestration with TanStack AI `useChat` + tools.
   - Wire Gemini adapter through TanStack AI, not custom clients.

2. **Cluster 2 – Route Structure Consolidation**
   - Single authoritative IDE route: `_workspace/ide/`.
   - Centralized search schema and Zod validation.

### 4.2 High-Priority Clusters

3. **Cluster 3 – Test Consolidation**
   - Move tests into `src/__tests__/` mirroring source structure.

4. **Cluster 4 – Domain API Enforcement**
   - Forbid cross-domain imports of internals (`domains/*/core/*`).
   - Require public APIs from `domains/*/index.ts`.

### 4.3 Medium-Priority Cluster

5. **Cluster 5 – Cleanup & Hygiene**
   - Remove empty or legacy directories.
   - Standardize imports to `@/` alias.

---

## 5. Product-Level Outputs from Synthesis

Synthesis produces two **product artifacts** that must guide all future work:

1. `agent-os/product/mvp-0-scope.md`
   - Defines exactly what via-gent must deliver in MVP-0.
   - Anchors implementation to a single-project, one-screen IDE with a single Coder agent.

2. `agent-os/product/anti-scope.md`
   - Lists advanced workspaces, asset studio, multi-agent UIs, etc. as **explicitly out of scope** for MVP-0.
   - Prevents future drift during refactors.

These docs are now part of the **single source of truth** alongside mission, roadmap, and tech-stack documents.

---

## 6. Ready for Remediation Phase

With discovery, architecture scanning, and synthesis completed:

- The codebase has:
  - A concrete issues manifest (`issues-enlisting-09-dec-2025.md`).
  - Machine-readable CHAM artifacts (`codebase-map.json`, `patterns-detected.yaml`, `architecture.json`).
  - A prioritized remediation roadmap (`remediation-roadmap.md`).
  - Product-level constraints (`mvp-0-scope.md`, `anti-scope.md`).

**Remediation phase** can now proceed cluster by cluster, with each change:
- Improving alignment with MVP-0.
- Reducing fragmentation according to CHAM.
- Updating status and validation docs as work completes.
