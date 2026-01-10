---
active: false
iteration: 0
max_iterations: 100
completion_promise: "KSI MODULE TRULY COMPLETE WITH _bmad-output/bmb-creations/arc-module/LOOP_STATE.yaml all done checked at 100%"
started_at: "2025-12-31T19:22:10+07:00"
module: "ksi-module"
---

# KSI Module Ralph Loop Prompt

Execute Knowledge Synthesis Integration Module course correction.

## Execution Instructions

1. **Read Current State**: Load `_bmad-output/bmb-creations/ksi-module/LOOP_STATE.yaml` for current phase and task
2. **Execute Current Task** using the appropriate workflow from `_bmad-output/bmb-creations/ksi-module/workflows/`
3. **Validate with Build**: Run `pnpm build` after each significant change
4. **Update State**: Update LOOP_STATE.yaml with completion status, notes, and next task
5. **Continue Loop**: Proceed to next task until all Phase 0-7 tasks complete

## Quick Reference

### Module Location
```
_bmad-output/bmb-creations/ksi-module/
├── module.yaml           # Module definition
├── LOOP_STATE.yaml       # Current execution state (READ/UPDATE THIS)
├── agents/               # Agent personas
├── workflows/            # Execution workflows
├── templates/            # Output templates
└── data/
    ├── integration-gaps.yaml  # 6 gaps to fix
    ├── gemini-prompts.yaml    # Gemini API prompts
    └── use-cases.yaml         # 4 use case specs
```

### Phase Summary
| Phase | Name | Focus |
|-------|------|-------|
| 0 | Analysis | Scan implementations, map use cases, identify gaps |
| 1 | Source→RAG | Wire import to Orama indexing |
| 2 | Synthesis UI | Add synthesize button, create service |
| 3 | Chat→RAG | Unified ChatPanel with RAG integration |
| 4 | Canvas Linkage | AI-powered connection discovery |
| 5 | Gemini Multimodal | PDF, image, audio, URL processing |
| 6 | Knowledge Matrix | Auto-organization system |
| 7 | Final Validation | 12-level sweep + demo prep |

### Core Gaps to Fix
1. **GAP-001**: Source Import → Orama Index (6h)
2. **GAP-002**: ChatPanel → Hybrid Retriever (8h)
3. **GAP-003**: Synthesis Button + Service (10h)
4. **GAP-004**: Canvas → Linkage Analyzer (12h)
5. **GAP-005**: CitationSidebar → Chat (6h)
6. **GAP-006**: Knowledge Matrix Auto-Org (16h)

### 4 Use Cases to Validate
1. **Initial Vault Population**: Batch import → process → synthesize → organize
2. **Canvas Linkage Discovery**: Multi-node → AI analysis → connection proposals
3. **Conversational Knowledge Exploration**: Query → RAG → synthesis → citations
4. **Dynamic Knowledge Matrix**: Large vault → analysis → reorganization recommendations

### Validation Reference
- Sweeping Validation: `_bmad-output/validation/sweeping-validation.md`
- 12-Level Framework: `_bmad-output/validation/12-level-framework-integration-2025-12-29.md`

### Completion Criteria
- All 4 use cases demonstrable end-to-end
- Source → RAG pipeline working
- Synthesis UI generating frontmatter
- Chat → RAG wired with citations
- Canvas showing AI linkage suggestions
- Build passing with no TypeScript errors
- 12-level validation at ≥80% health score

## When Done

Output `<promise>KSI MODULE COMPLETE</promise>` when:
1. All phases marked DONE in LOOP_STATE.yaml
2. All 4 use cases pass validation
3. `pnpm build` passes
4. Health score ≥80%
