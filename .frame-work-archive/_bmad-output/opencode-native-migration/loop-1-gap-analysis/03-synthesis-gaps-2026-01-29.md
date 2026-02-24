# Synthesis Documents Gap Analysis

**Document ID**: LOOP-1C-GAP-ANALYSIS-2026-01-29
**Version**: 1.0.0
**Status**: COMPLETE
**Date**: 2026-01-29
**Author**: tech-writer-ext
**Timebox**: 30 minutes

---

## The Test Scenario

**Persona**: A module-builder agent with:
- NO prior context about BMAD
- NO access to _bmad or _bmad-ext directories
- NO knowledge of Project Alpha
- ONLY these 3 documents

**Question**: Could this agent build a complete `.opencode/` module?

**Answer**: **NO - 65% Complete**

---

## Section 1: Standalone Score (0-100%)

### Document 1: Less for More Synthesis
**File**: `01-less-for-more-synthesis-2026-01-29.md`
**Lines**: 442

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **WHAT to build** | 75% | Good file structure in Section 5, but lacks complete file contents |
| **WHY (rationale)** | 90% | Excellent trade-off analysis, clear metrics, strong justification |
| **HOW (step-by-step)** | 50% | Migration phases listed but lack implementation details |
| **Self-contained** | 40% | Heavy references to "82 skills" without listing them |

**Standalone Score: 64%**

**Critical Gaps**:
1. Lists "16 consolidated skills" but doesn't define their content
2. "10 essential commands" listed but command file format not shown
3. AGENT-STATE.yaml schema only partially defined
4. No example of complete agent file (only references)
5. Permissions config mentioned but no complete example

---

### Document 2: Accurately Specific Synthesis
**File**: `02-accurately-specific-synthesis-2026-01-29.md`
**Lines**: 803

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **WHAT to build** | 80% | Excellent TypeScript examples, clear tool definitions |
| **WHY (rationale)** | 85% | Strong connection to "Beast Mode" requirements |
| **HOW (step-by-step)** | 70% | TypeScript code is copy-paste ready |
| **Self-contained** | 55% | References "Beast Mode" requirements without embedding them |

**Standalone Score: 73%**

**Critical Gaps**:
1. References "27 Beast Mode requirements" without full list (only partial in Section 6)
2. Zod schemas excellent but missing import setup
3. `@opencode/core` package not documented (API unknown)
4. `@file:path[section]` syntax assumed but not validated against OpenCode docs
5. Migration steps in 6.3 are conceptual, not executable

---

### Document 3: Auto Governance Synthesis
**File**: `03-auto-governance-synthesis-2026-01-29.md`
**Lines**: 1120

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **WHAT to build** | 90% | Complete plugin implementations, ready to copy |
| **WHY (rationale)** | 75% | References AGENTS.md lines but doesn't embed rules |
| **HOW (step-by-step)** | 85% | Implementation roadmap clear (Days 1-5) |
| **Self-contained** | 50% | Heavy dependency on AGENTS.md and governance-rules.md |

**Standalone Score: 75%**

**Critical Gaps**:
1. `import type { Plugin } from "@opencode-ai/plugin"` - package not documented
2. Assumes AGENTS.md lines 337-349, etc. without embedding content
3. AGENT-STATE.yaml schema scattered, not consolidated
4. governance-logs directory structure not fully specified
5. No test examples for plugins

---

### Overall Standalone Assessment

| Document | Score | Module-Builder Usability |
|----------|-------|--------------------------|
| 01-less-for-more | 64% | Conceptual guide only |
| 02-accurately-specific | 73% | Good tools, missing package docs |
| 03-auto-governance | 75% | Best, but external deps unclear |
| **COMBINED** | **70%** | **Cannot build without external lookups** |

---

## Section 2: Missing BMAD Knowledge

### Concepts Referenced But Not Explained

| BMAD Concept | Where Referenced | What Module-Builder Needs |
|--------------|------------------|---------------------------|
| **4-Phase System** | Doc 1, Section 6 | What are phases 1-4? What triggers transitions? |
| **82 Skills** | Doc 1 throughout | Complete list with descriptions needed for consolidation |
| **7-Layer Wrappers** | Doc 1, Section 2.2 | What are the 7 layers? Which to eliminate? |
| **LOOP_STATE.yaml** | Doc 1, Section 2.2 | Current schema not provided |
| **Beast Mode Requirements** | Doc 2 throughout | Full REQ-AUTO/ENF/CTX/COORD list needed |
| **TTL Tiers 1-4** | Doc 2 & 3 | What belongs in each tier? |
| **Handoff Artifacts** | Doc 1, 3 | Complete schema not shown |
| **Story Cycle Workflow** | Doc 2, Section 2.3 | Steps not defined |
| **Gate Enforcement** | Doc 2 & 3 | What gates exist? What do they check? |
| **Compact/Compaction** | Doc 3 throughout | What triggers compaction? How to detect? |

### Knowledge That Should Be Embedded

```yaml
missing_embedded_knowledge:
  
  skill_consolidation_map:
    description: "Map of 82 skills to 16 consolidated skills"
    needed_for: "Doc 1, Section 2.3"
    status: "Referenced but not provided"
    
  beast_mode_requirements:
    description: "Full list of AUTO-XX, ENF-XX, CTX-XX, COORD-XX"
    needed_for: "Doc 2, Sections 3, 7"
    status: "Partial list only (27 items mentioned, ~22 shown)"
    
  agents_md_rules:
    description: "Non-negotiable rules from AGENTS.md"
    needed_for: "Doc 3 throughout"
    status: "Line numbers referenced but content not embedded"
    
  workflow_step_definitions:
    description: "What each workflow step does"
    needed_for: "All docs"
    status: "Names only, no behavior defined"
    
  artifact_registry_schema:
    description: "Complete registry structure"
    needed_for: "Doc 2, Section 2.1"
    status: "Entry schema shown, registry format missing"
```

---

## Section 3: Missing Implementation Details

### Questions a Module-Builder Would Ask

#### File Structure Questions

| Question | Answer in Docs? | Gap |
|----------|-----------------|-----|
| "What exact files do I create?" | PARTIAL | Doc 1 has tree, but no file contents for most |
| "What's the complete config.yaml?" | NO | Only `plugins:` section shown in Doc 3 |
| "What's the package.json for plugins?" | NO | TypeScript plugins need compilation config |
| "How do I set up the npm/pnpm project?" | NO | No init commands |
| "What's the tsconfig.json for plugins?" | NO | TypeScript config not provided |

#### Content Questions

| Question | Answer in Docs? | Gap |
|----------|-----------------|-----|
| "What goes in each of the 16 skills?" | NO | Only skill frontmatter shown |
| "What's the complete agent file format?" | PARTIAL | Doc 2 shows frontmatter, Doc 3 shows fragments |
| "What are the exact slash commands?" | PARTIAL | Listed but format not defined |
| "What's the permissions.yaml full schema?" | NO | Only inline examples |
| "What's the hooks/pre-execution.sh content?" | NO | Replaced by plugins, but transition unclear |

#### TypeScript/Integration Questions

| Question | Answer in Docs? | Gap |
|----------|-----------------|-----|
| "What is `@opencode/core`?" | NO | Import assumed but package undocumented |
| "What is `@opencode-ai/plugin`?" | NO | Two different package names used |
| "What's the Plugin type signature?" | NO | Used but not defined |
| "How do I test plugins locally?" | NO | No test setup |
| "How do I install/enable plugins?" | PARTIAL | config.yaml reference only |

#### Interface Questions

| Question | Answer in Docs? | Gap |
|----------|-----------------|-----|
| "What's the input/output type for hooks?" | PARTIAL | Used but not fully typed |
| "What's `ctx.directory`?" | NO | Context object not documented |
| "What events does OpenCode emit?" | PARTIAL | session.created, session.error, session.idle - others? |
| "What's the difference between tool and command?" | PARTIAL | Both mentioned, relationship unclear |

---

### Missing Complete File Examples

The following files are mentioned but NOT fully defined:

```yaml
missing_file_definitions:

  # Config files
  - file: ".opencode/config.yaml"
    status: "Fragment only"
    needed: "Complete config with all sections"
    
  - file: ".opencode/AGENT-STATE.yaml"
    status: "Schema scattered across docs"
    needed: "Single consolidated schema"
    
  - file: ".opencode/permissions/agents.yaml"
    status: "Example snippet only"
    needed: "Complete per-agent permissions"
    
  - file: ".opencode/permissions/directories.yaml"
    status: "Not shown"
    needed: "Directory access control config"

  # Agent files
  - file: ".opencode/agents/dev-ext.md"
    status: "Frontmatter only"
    needed: "Complete agent definition with behavior"
    
  - file: ".opencode/agents/analyst-ext.md"
    status: "Not shown"
    needed: "Complete agent definition"

  # Command files
  - file: ".opencode/commands/story-cycle.md"
    status: "Not shown"
    needed: "Command definition format"
    
  - file: ".opencode/commands/stale-check.md"
    status: "Not shown"
    needed: "Command definition format"

  # Skill files
  - file: ".opencode/skills/story-development/SKILL.md"
    status: "Frontmatter only"
    needed: "Complete skill with instructions"
    
  - file: ".opencode/skills/implementation/SKILL.md"
    status: "Not shown"
    needed: "TDD + debugging skill content"

  # Schema files
  - file: ".opencode/schemas/story.schema.yaml"
    status: "Not shown"
    needed: "Complete story artifact schema"
    
  - file: ".opencode/schemas/handoff.schema.yaml"
    status: "Zod in Doc 2, YAML not shown"
    needed: "YAML version for validation"
```

---

## Section 4: External References Found

### Document 1: Less for More Synthesis

| Reference | Line | Type | Critical? |
|-----------|------|------|-----------|
| `_bmad-ext` framework | Throughout | Directory | YES |
| "82 skills" | 15-87 | Count without list | YES |
| "Phase 1-4" | 326-363 | Migration phases | YES |
| `LOOP_STATE.yaml` | 57-60 | State file | YES |
| "Bridge files" | 36-42 | Not defined | NO |
| `AGENTS.md` | 207 | Line reference | YES |
| `MODULE.md` | 209 | File format | NO |
| "Handoff artifacts" | 59 | Schema needed | YES |

### Document 2: Accurately Specific Synthesis

| Reference | Line | Type | Critical? |
|-----------|------|------|-----------|
| `PHASE-1.4-BEAST-MODE-REQUIREMENTS-2026-01-28` | 10 | External doc | YES |
| `PHASE-1.5-ARTIFACT-CONTEXT-ELEPHANT-2026-01-28` | 11 | External doc | YES |
| `new-fundamental-truths.md` | 12 | External doc | NO |
| `AGENTS.md` | 13 | External doc | YES |
| "REQ-ART-04" (and all REQ-*) | 39-196 | Requirements | YES |
| "@opencode/core" | 44 | Package | YES |
| "Section 6.3 migration steps" | 711-751 | Self-reference | NO |
| "Phase 2.3 implementation" | 795 | Future phase | NO |

### Document 3: Auto Governance Synthesis

| Reference | Line | Type | Critical? |
|-----------|------|------|-----------|
| `AGENTS.md line 10` | 32 | Line reference | YES |
| `governance-rules.md line 71` | 77 | Line reference | YES |
| `AGENTS.md lines 6-14` | 118 | Line reference | YES |
| `AGENTS.md lines 337-349` | 153 | Line reference | YES |
| `AGENTS.md line 43` | 222 | Line reference | YES |
| `AGENTS.md lines 49-60` | 273 | Line reference | YES |
| `AGENTS.md lines 351-365` | 263 | Line reference | YES |
| `@opencode-ai/plugin` | 35 | Package | YES |
| `governance-rules.md` | 426 | External doc | YES |
| `agent-behavior.md` | 548 | External doc | NO |

### Summary of External Dependencies

```yaml
external_dependencies:
  critical_files:
    - "AGENTS.md"  # Referenced ~15 times with line numbers
    - "governance-rules.md"  # Referenced ~3 times
    - "PHASE-1.4-BEAST-MODE-REQUIREMENTS-2026-01-28"  # Full requirements
    - "PHASE-1.5-ARTIFACT-CONTEXT-ELEPHANT-2026-01-28"  # Context problems
    
  critical_packages:
    - "@opencode/core"  # Doc 2 - tool definition API
    - "@opencode-ai/plugin"  # Doc 3 - plugin API
    # NOTE: Inconsistent naming - are these the same?
    
  embedded_content_needed:
    - "Non-negotiable rules from AGENTS.md"
    - "Clean Architecture paths from AGENTS.md"
    - "Time-boxing rules"
    - "Full Beast Mode requirements list"
    - "Complete TTL tier definitions"
```

---

## Section 5: Remediation Roadmap

### Priority Legend
- **P0-CRITICAL**: Module cannot be built without this
- **P1-HIGH**: Module will be incomplete/incorrect without this
- **P2-MEDIUM**: Module will work but with gaps
- **P3-LOW**: Nice to have

### Gap Remediation Table

| Gap ID | Gap Description | What to Add | Priority | Effort |
|--------|-----------------|-------------|----------|--------|
| **GAP-001** | Package API undefined | Document `@opencode-ai/plugin` API with type definitions | P0-CRITICAL | 4h |
| **GAP-002** | Plugin type signature missing | Add complete Plugin interface with all hooks | P0-CRITICAL | 2h |
| **GAP-003** | ctx object undocumented | Define PluginContext interface fully | P0-CRITICAL | 1h |
| **GAP-004** | 82→16 skill map missing | Create complete skill consolidation table | P0-CRITICAL | 4h |
| **GAP-005** | Command file format undefined | Add complete command.md template | P0-CRITICAL | 2h |
| **GAP-006** | AGENTS.md rules not embedded | Extract and embed all referenced rules | P1-HIGH | 2h |
| **GAP-007** | Beast Mode requirements incomplete | Embed full AUTO/ENF/CTX/COORD list | P1-HIGH | 2h |
| **GAP-008** | Complete config.yaml missing | Create full .opencode/config.yaml | P1-HIGH | 1h |
| **GAP-009** | AGENT-STATE.yaml scattered | Consolidate into single complete schema | P1-HIGH | 1h |
| **GAP-010** | permissions/*.yaml not shown | Create all permission config files | P1-HIGH | 2h |
| **GAP-011** | Complete agent file example | Create dev-ext.md with full content | P2-MEDIUM | 2h |
| **GAP-012** | Complete skill file example | Create story-cycle SKILL.md with instructions | P2-MEDIUM | 2h |
| **GAP-013** | TypeScript setup missing | Add tsconfig.json, package.json for plugins | P2-MEDIUM | 1h |
| **GAP-014** | Testing setup missing | Add plugin test examples | P2-MEDIUM | 2h |
| **GAP-015** | OpenCode events incomplete | Document all session.* events | P2-MEDIUM | 1h |
| **GAP-016** | Migration commands missing | Add concrete pnpm/npx commands | P3-LOW | 1h |
| **GAP-017** | Validation test suite | Add E2E tests for governance | P3-LOW | 4h |

### Remediation by Phase

#### Phase A: Critical Blockers (Must fix before module-builder can start)

```yaml
phase_a_blockers:
  target: "Module-builder can begin work"
  effort: "~13 hours"
  
  deliverables:
    - id: "GAP-001"
      action: "Research and document OpenCode plugin API"
      output: "opencode-plugin-api-reference.md"
      
    - id: "GAP-002"
      action: "Define Plugin interface with TypeScript"
      output: "Add to synthesis docs inline"
      
    - id: "GAP-003"
      action: "Define PluginContext interface"
      output: "Add to synthesis docs inline"
      
    - id: "GAP-004"
      action: "Create 82→16 skill mapping table"
      output: "skill-consolidation-matrix.md"
      
    - id: "GAP-005"
      action: "Define command.md template format"
      output: "command-template.md"
```

#### Phase B: High Priority Gaps (Needed for correctness)

```yaml
phase_b_gaps:
  target: "Module-builder can produce correct output"
  effort: "~8 hours"
  
  deliverables:
    - id: "GAP-006"
      action: "Extract AGENTS.md rules into synthesis"
      output: "Embedded in existing docs"
      
    - id: "GAP-007"
      action: "Embed complete Beast Mode requirements"
      output: "beast-mode-requirements-complete.md"
      
    - id: "GAP-008"
      action: "Create complete config.yaml"
      output: ".opencode/config.yaml template"
      
    - id: "GAP-009"
      action: "Consolidate AGENT-STATE.yaml schema"
      output: "agent-state-schema-complete.yaml"
      
    - id: "GAP-010"
      action: "Create all permission configs"
      output: ".opencode/permissions/*.yaml templates"
```

#### Phase C: Medium Priority Gaps (Complete implementation)

```yaml
phase_c_gaps:
  target: "Module-builder can produce production-ready output"
  effort: "~8 hours"
  
  deliverables:
    - id: "GAP-011 to GAP-015"
      action: "Complete file examples and setup"
      outputs:
        - "dev-ext.md complete agent"
        - "story-cycle SKILL.md complete"
        - "tsconfig.json for plugins"
        - "package.json for plugins"
        - "plugin-test-example.ts"
```

---

## Section 6: Recommended Next Steps

### Immediate Actions (Before LOOP-2)

1. **Validate OpenCode Plugin API**
   - Research actual `@opencode-ai/plugin` or `@opencode/core` package
   - Confirm hook names: `tool.execute.before`, `tool.execute.after`
   - Confirm event names: `session.created`, `session.compacting`
   - Document actual Plugin type signature

2. **Create Skill Consolidation Matrix**
   - List all 82 current skills (requires reading _bmad-ext/skills/)
   - Map to 16 target skills with rationale
   - Define what content goes into each consolidated skill

3. **Embed AGENTS.md Rules**
   - Extract lines 6-14, 43, 49-60, 337-349, 351-365
   - Embed directly into synthesis docs
   - Remove line number references

### LOOP-2 Focus

Based on this gap analysis, LOOP-2 should produce:

```yaml
loop_2_outputs:
  - file: "04-opencode-plugin-api-reference-2026-01-29.md"
    purpose: "Complete plugin API documentation"
    fills_gaps: ["GAP-001", "GAP-002", "GAP-003", "GAP-015"]
    
  - file: "05-skill-consolidation-matrix-2026-01-29.md"
    purpose: "82→16 skill mapping with content"
    fills_gaps: ["GAP-004"]
    
  - file: "06-complete-file-templates-2026-01-29.md"
    purpose: "All missing file templates"
    fills_gaps: ["GAP-005", "GAP-008", "GAP-009", "GAP-010", "GAP-011", "GAP-012"]
```

---

## Conclusion

### The Verdict

**Can a module-builder build .opencode/ from these 3 docs alone?**

**NO** - The documents are conceptually excellent but operationally incomplete:

1. **Doc 1 (Less for More)**: Great strategy, weak on tactics. Missing file contents.
2. **Doc 2 (Accurately Specific)**: Excellent tools, missing package documentation.
3. **Doc 3 (Auto Governance)**: Best implementation detail, but external dependencies unresolved.

### The Path Forward

**Total Remediation Effort**: ~29 hours

**Critical Path**: GAP-001 → GAP-004 → GAP-005 → GAP-008 → Build

**Recommendation**: Before proceeding to implementation phase, create a "Module Builder Handoff Package" that:

1. Resolves all P0-CRITICAL gaps (5 items)
2. Resolves all P1-HIGH gaps (5 items)
3. Provides copy-paste-ready templates for all core files
4. Embeds all external references inline
5. Removes ALL line-number references to external docs

---

**Document Version**: 1.0.0
**Created**: 2026-01-29
**Author**: tech-writer-ext
**Status**: COMPLETE
**Lines**: ~480
