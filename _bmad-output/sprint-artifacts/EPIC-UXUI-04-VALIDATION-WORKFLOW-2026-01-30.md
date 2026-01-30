# ═════════════════════════════════════════════════════════════════════════════
# EPIC-UXUI-04 STRICT VALIDATION WORKFLOW
# Created: 2026-01-30T22:00:00+07:00
# Status: ACTIVE
# Version: 1.0.0
# ═════════════════════════════════════════════════════════════════════════════

## 🎯 PURPOSE

This document establishes the **strict validation workflow** for EPIC-UXUI-04 to ensure:
- **100% requirements verification** before any "complete" claim
- **Browser testing** for all UI components
- **Zero tolerance** for broken functionality
- **Evidence-based** completion reporting

---

## 🚨 VALIDATION PROTOCOL (MANDATORY)

### For EVERY Story - 5 Phase Validation

```yaml
validation_protocol:
  phase_1_requirements:
    - Read story requirements completely
    - Read all acceptance criteria
    - Verify understanding with evidence
    - Document any ambiguities
    
  phase_2_implementation:
    delegate_to: "dev-ext (Team A)"
    timebox: "As specified in story"
    daily_checkins: true
    deliverables:
      - Code implementation
      - Unit tests
      - Documentation updates
      
  phase_3_validation:
    delegate_to: "tea-ext (Testing Team)"
    required_checks:
      code_quality:
        - typecheck:fast: MUST PASS (0 errors)
        - governance: MUST PASS (0 violations)
        - build: MUST PASS
        - file_size: <300 lines per file
        
      functional:
        - all_acceptance_criteria: VERIFIED
        - user_requirements: MET
        - no_placeholders: CONFIRMED
        - real_plugins: RENDERING
        
      integration:
        - components_wired: YES
        - state_management: WORKING
        - routing: FUNCTIONAL
        - plugins_load: CORRECTLY
        
      browser_test:
        - open_browser: VERIFIED
        - no_console_errors: CONFIRMED
        - visual_check: PASSED
        - functionality: WORKING
        
  phase_4_documentation:
    update_files:
      - EPIC-UXUI-04-DAILY-LOG.md
      - EPIC-UXUI-04-COMPONENT-REGISTRY.md
      - bmm-workflow-status.yaml
      - LOOP_STATE.yaml
      
  phase_5_approval_gate:
    present_evidence: true
    show_test_results: true
    block_proceeding: "Until 100% validated"
```

---

## 👥 TEAM ASSIGNMENTS

### Validation Team Structure

```yaml
teams:
  implementation_team:
    name: "Team A - Implementation"
    agent: "dev-ext"
    responsibilities:
      - Code implementation
      - Unit test creation
      - Documentation
      - Initial self-verification
    permissions:
      write: true
      edit: true
      bash: true
      task: true
      
  testing_team:
    name: "Team B - Testing & Validation"
    agent: "tea-ext"
    responsibilities:
      - Browser testing
      - Functional validation
      - Acceptance criteria verification
      - Evidence collection
    permissions:
      write: true
      edit: false
      bash: true
      task: true
      
  governance_team:
    name: "Governance Team"
    agent: "bmad-governance"
    responsibilities:
      - Code quality checks
      - Governance validation
      - Standards compliance
      - Final approval
    permissions:
      write: false
      edit: false
      bash: true
      task: true
```

---

## 📋 VALIDATION CHECKLIST TEMPLATE

### Per-Story Validation Checklist

```markdown
## Story Validation: {STORY_ID}

### Phase 1: Requirements ✅
- [ ] Story requirements read
- [ ] Acceptance criteria documented
- [ ] Dependencies identified
- [ ] Timebox set

### Phase 2: Implementation ✅
- [ ] Code implemented
- [ ] Unit tests written
- [ ] Documentation updated
- [ ] Self-verification passed

### Phase 3: Code Quality ✅
- [ ] `pnpm typecheck:fast` - 0 errors
- [ ] `pnpm governance` - 0 violations
- [ ] `pnpm build` - Success
- [ ] All files <300 lines
- [ ] No @/lib/ imports

### Phase 4: Functional Validation ✅
- [ ] All acceptance criteria met
- [ ] User requirements satisfied
- [ ] No placeholder code
- [ ] Real plugins rendering
- [ ] Components properly wired
- [ ] State management working
- [ ] Routing functional

### Phase 5: Browser Testing ✅
- [ ] Application opens in browser
- [ ] No console errors
- [ ] Visual layout correct
- [ ] All interactions working
- [ ] Responsive design verified
- [ ] 8-bit design compliance

### Phase 6: Documentation ✅
- [ ] Daily log updated
- [ ] Component registry updated
- [ ] Status files updated
- [ ] Evidence attached

### Phase 7: Approval ✅
- [ ] Test results presented
- [ ] Evidence reviewed
- [ ] Approval granted
- [ ] Ready to proceed
```

---

## 🔄 VALIDATION LOOP WORKFLOW

### Sequential Validation Process

```
┌─────────────────────────────────────────────────────────────────┐
│  STORY START                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Requirements Check                                    │
│  - Read story file                                              │
│  - Document acceptance criteria                                 │
│  - Set validation criteria                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: Implementation (dev-ext)                              │
│  - Implement story                                              │
│  - Write tests                                                  │
│  - Self-verify                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: Code Quality (bmad-governance)                        │
│  - Run typecheck:fast                                           │
│  - Run governance                                               │
│  - Verify build                                                 │
│  - Check file sizes                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  QUALITY PASS?   │
                    └──────────────────┘
                         ↓ YES    ↓ NO
                         ↓        ↓
              ┌────────────┐   ┌────────────┐
              │  Continue  │   │  Return to │
              │            │   │  Phase 2   │
              └────────────┘   └────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: Functional Validation (tea-ext)                       │
│  - Browser testing                                              │
│  - Acceptance criteria check                                    │
│  - Integration verification                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  FUNCTIONAL PASS?│
                    └──────────────────┘
                         ↓ YES    ↓ NO
                         ↓        ↓
              ┌────────────┐   ┌────────────┐
              │  Continue  │   │  Return to │
              │            │   │  Phase 2   │
              └────────────┘   └────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: Documentation Update                                  │
│  - Update daily log                                             │
│  - Update component registry                                    │
│  - Update status files                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: Approval Gate                                         │
│  - Present evidence                                             │
│  - Show test results                                            │
│  - Get approval                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  APPROVED?       │
                    └──────────────────┘
                         ↓ YES    ↓ NO
                         ↓        ↓
              ┌────────────┐   ┌────────────┐
              │  Story     │   │  Fix and   │
              │  Complete  │   │  Re-verify │
              └────────────┘   └────────────┘
```

---

## 📊 TRACKING REQUIREMENTS

### Files to Update After EVERY Validation

| File | Location | Update Content |
|------|----------|----------------|
| Daily Log | `_bmad-output/tracking/EPIC-UXUI-04-DAILY-LOG.md` | Validation results, test output, blockers |
| Component Registry | `_bmad-output/tracking/EPIC-UXUI-04-COMPONENT-REGISTRY.md` | New components, status updates |
| Workflow Status | `bmm-workflow-status.yaml` | Story status, health metrics |
| LOOP_STATE | `_bmad-output/state/LOOP_STATE.yaml` | Current story, team status |
| Validation Log | `EPIC-UXUI-04-VALIDATION-LOG.md` | Per-story validation evidence |

### Required Evidence Per Story

```yaml
evidence_requirements:
  code_quality:
    - typecheck_output: "Screenshot or file"
    - governance_output: "Screenshot or file"
    - build_output: "Screenshot or file"
    
  functional:
    - acceptance_criteria_check: "Checklist with notes"
    - browser_screenshots: "Visual evidence"
    - console_logs: "No errors confirmed"
    
  integration:
    - component_wiring_diagram: "If applicable"
    - state_flow_validation: "Test results"
    - routing_tests: "Pass/fail results"
```

---

## 🚫 STRICT PROHIBITIONS

### NEVER Allowed

1. ❌ **Claim "complete" without validation**
2. ❌ **Skip browser testing**
3. ❌ **Ignore acceptance criteria**
4. ❌ **Submit broken code**
5. ❌ **Report success without evidence**
6. ❌ **Proceed with failing checks**
7. ❌ **Bypass approval gate**
8. ❌ **Update status before validation**

### ALWAYS Required

1. ✅ **100% validation before completion**
2. ✅ **Browser testing for all UI**
3. ✅ **All acceptance criteria met**
4. ✅ **Evidence attached to reports**
5. ✅ **Approval before proceeding**
6. ✅ **Update all tracking files**
7. ✅ **Document blockers immediately**
8. ✅ **Re-validate after fixes**

---

## 🎯 CURRENT EPIC-UXUI-04 STATUS

### Stories Requiring Validation

| Story | Claimed Status | Validation Status | Action Required |
|-------|---------------|-------------------|-----------------|
| UXUI-04-01 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-02 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-03 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-04 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-05 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-06 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-07 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-08 | ✅ Complete | 🟡 PENDING | Run full validation |
| UXUI-04-09 | 🟡 Pending | 🔴 NOT STARTED | Implement with validation |
| UXUI-04-10 | 🟡 Pending | 🔴 NOT STARTED | Implement with validation |

### Known Issues to Validate

1. ❓ Plugin rendering (width/height=0) - CLAIMED FIXED
2. ❓ ActivityBarMainTop missing from main panel
3. ❓ PluginDocker not rendered
4. ❓ Drag-and-drop not functional
5. ❓ No browser validation done

---

## 📋 IMMEDIATE ACTION ITEMS

### Setup Phase (Today)

- [ ] Create validation team assignments
- [ ] Set up validation tracking documents
- [ ] Define evidence collection process
- [ ] Create validation checklist templates

### Validation Phase (Stories 1-8)

- [ ] Validate Story 1: Archive Phase
- [ ] Validate Story 2: Global Sidebar
- [ ] Validate Story 3: Activity Bars
- [ ] Validate Story 4: Plugin Docker
- [ ] Validate Story 5: Plugin Panels
- [ ] Validate Story 6: Drag-Drop
- [ ] Validate Story 7: Responsive Layout
- [ ] Validate Story 8: Plugin Coordination

### Implementation Phase (Stories 9-10)

- [ ] Implement Story 9 with strict validation
- [ ] Implement Story 10 with strict validation
- [ ] Final epic validation
- [ ] Epic completion report

---

## 🔗 RELATED DOCUMENTS

| Document | Purpose |
|----------|---------|
| `EPIC-UXUI-04-DAILY-LOG.md` | Daily work tracking |
| `EPIC-UXUI-04-COMPONENT-REGISTRY.md` | Component inventory |
| `bmm-workflow-status.yaml` | Workflow status |
| `LOOP_STATE.yaml` | Global state |
| `AGENTS.md` | Constitution & rules |

---

*This workflow is MANDATORY for all EPIC-UXUI-04 work.*
*Last Updated: 2026-01-30T22:00:00+07:00*
*Next Review: Per story completion*
