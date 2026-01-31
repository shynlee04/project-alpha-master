---
artifact_id: "governance-failure-analysis-2026-01-29"
artifact_type: "research-analysis"
version: "1.0.0"
status: "COMPLETE"
date: "2026-01-29"
created_by: "governance-analysis-team"
phase: "research-only"
---

# Governance Failure Analysis: BMAD Framework → OpenCode Native Migration

## Executive Summary

**Reality Score**: 35-40% governance effectiveness despite 450,189 lines of documentation

This research-only analysis identifies **5 critical governance failure categories** that explain why the BMAD framework achieved only **1.1% compliance** despite extensive documentation. The analysis reveals that **80% of governance failures trace back to protocols that are documented but never enforced**.

---

## 1. Governance Mechanisms That Failed

### 1.1 The 10 Traps - Prevention Mechanisms That Never Activated

| Trap | Prevention Mechanism | Why It Failed | Evidence |
|------|---------------------|---------------|----------|
| **BLIND_CHARGE** | Context gathering gate | No pre-execution hook | 0% of stories run pre-checks |
| **SYMPTOM_PATCH** | Root cause analysis | No enforcement of investigation | 40% of failures = symptom fixes |
| **TS_EQUALS_DONE** | E2E validation required | TypeScript-only validation accepted | 98.9% skip E2E validation |
| **STALE_CONTEXT_POISONING** | TTL validation | No automatic staleness detection | 434 archived files, many stale |
| **VALIDATION_DEFER** | Immediate validation | "Validate later" never happens | 46-60 hours of documented waste |
| **TRUST_ASSUMPTION** | Evidence required | No evidence verification gate | False completions accepted |
| **SCOPE_CREEP_ACCEPTANCE** | Scope lock | No story boundary enforcement | 4-hour stories take 12 hours |
| **TEMP_CODE_LEAK** | Paired revert story | No temporary code tracking | Tech-debt accumulation |
| **PARALLEL_COLLISION** | Team registration | No file locking mechanism | Teams step on each other |
| **UNBOUND_DELEGATION** | Constraint gate | No tool permission enforcement | Delegation without constraints |

### 1.2 Core Governance Failures

#### Failure 1: Documentation ≠ Enforcement

**Problem**: BMAD documents governance but doesn't automate enforcement.

**Evidence**:
- 35+ governance shortcomings documented
- 0 pre-execution hooks implemented
- 98.9% non-compliance rate
- Governance is aspirational, not operational

**Root Cause**: Team prioritized writing governance docs over enforcing them.

#### Failure 2: No Gate Enforcement

**Problem**: Governance gates exist in documentation but are never enforced.

**Evidence**:
- 8 gates defined in documentation
- 0 gates actually block violations
- Agents bypass gates without consequence
- No escalation automation

**Root Cause**: Gates rely on agent memory, which is lost after compact.

#### Failure 3: No Evidence Validation

**Problem**: "TypeScript passes" = "Done" is accepted without verification.

**Evidence**:
- 35% of failures = "TypeScript = Complete"
- 0% of implementations have E2E evidence
- False completions create rework
- No journey validation required

**Root Cause**: No automated evidence collection or verification.

---

## 2. Missing Governance Gates

### 2.1 Gates That Should Have Existed

| Missing Gate | Purpose | Impact of Absence |
|--------------|---------|-------------------|
| **Pre-Execution Hook** | Run validation before any action | 80% of failures from bypassed governance |
| **Context Freshness Gate** | Reject stale artifacts automatically | Context poisoning leads to hallucinations |
| **Story Boundary Gate** | Enforce 4-hour story limit | Scope creep wastes time |
| **Evidence Gate** | Require evidence before "done" | False completions create rework |
| **File Lock Gate** | Prevent parallel edits | Teams step on each other |
| **ADR Reference Gate** | Require ADR for architectural changes | 503 files in wrong location |
| **Canonical Path Gate** | Enforce file structure rules | 654 @/lib/ import violations |
| **State Boundary Gate** | Validate Zustand vs Dexie usage | 49 persist() violations |
| **Size Limit Gate** | Block files >300 LOC | 108 god files >500 LOC |
| **Compact-Resilient Gate** | Inject state after context reset | Protocol amnesia after compact |

### 2.2 Gate Implementation Gaps

#### Gap 1: No Pre-Execution Hooks

**What Should Exist**:
```yaml
pre_execution_hook:
  trigger: "before any agent action"
  checks:
    - context_freshness: "< 2 hours"
    - skill_loaded: "required skill present"
    - dry_reading: "grep/glob completed"
    - gate_passed: "all validation checks"
  blocking: true
  on_failure: "BLOCK_AND_ESCALATE"
```

**What Actually Exists**: Nothing. Agents proceed without validation.

#### Gap 2: No Context Freshness Gate

**What Should Exist**:
```yaml
context_freshness_gate:
  trigger: "before loading any artifact"
  checks:
    - file_modification_time: "< 2 hours"
    - git_status: "no uncommitted changes"
    - ttl_validation: "artifact not expired"
  blocking: true
  on_failure: "REFRESH_OR_REJECT"
```

**What Actually Exists**: Manual 2-hour rule in AGENTS.md, never enforced.

#### Gap 3: No Evidence Gate

**What Should Exist**:
```yaml
evidence_gate:
  trigger: "before claiming 'done'"
  required_evidence:
    - typescript_check: "pnpm typecheck:fast"
    - test_check: "pnpm test:fast"
    - governance_check: "pnpm governance"
    - e2e_journey: "screenshots or logs"
    - state_persistence: "reload and verify"
  blocking: true
  on_failure: "BLOCK_COMPLETION"
```

**What Actually Exists**: Manual checklist in AGENTS.md, rarely followed.

---

## 3. Context Validation Gaps

### 3.1 How Stale Context Got Through

#### Gap 1: No TTL Enforcement

**Problem**: 434 archived files, many stale, but no automatic staleness detection.

**Evidence**:
- AUTO-02: No artifact TTL enforcement
- 434 archived files in _bmad-output
- No metadata, no IDs, no frontmatter
- No validation status tracking

**How It Got Through**:
1. Agents load artifacts without checking modification time
2. No TTL system exists
3. No validation status tracking
4. Stale artifacts treated as fresh

#### Gap 2: No Context Fingerprinting

**Problem**: Stale detection fails because no fingerprinting mechanism.

**Evidence**:
- CTX-05: No context fingerprinting
- Agents trust outdated info
- No way to detect if artifact changed

**How It Got Through**:
1. No hash or checksum of artifact content
2. No version tracking
3. No change detection
4. Stale artifacts loaded as fresh

#### Gap 3: No Compact-Resilient State

**Problem**: Protocol amnesia after every compact.

**Evidence**:
- CTX-01: No compact-resilient state
- Governance forgotten after compact
- No state persistence
- No way to resume work

**How It Got Through**:
1. Compact resets context window
2. No state injection into continuation
3. Protocols lost
4. Agents start from scratch

### 3.2 Context Window Overhead

**Problem**: 35% of context consumed by framework before work begins.

**Evidence**:
- 35.4% context overhead
- 1,500 lines loaded before task
- 7-layer wrapper hierarchy
- 82 skills, only 31% utilized

**How It Got Through**:
1. No context budget tracking
2. No priority-based loading
3. All artifacts loaded equally
4. No filtering mechanism

### 3.3 Context Poisoning Mechanisms

| Mechanism | How It Works | Impact |
|-----------|---------------|--------|
| **No Filtering** | All artifacts loaded every time | Too much noise, no signal |
| **No Metadata** | No IDs, no frontmatter, no TTL | Can't track freshness |
| **No Validation** | No automatic staleness detection | Stale context treated as fresh |
| **No Priority** | Critical rules = same priority as optional | Wrong context first |
| **No Fingerprinting** | No hash or checksum | Can't detect changes |

---

## 4. Delegation Failures

### 4.1 How Agent Delegation Went Wrong

#### Failure 1: No Tool Permission Enforcement

**Problem**: Delegation without constraints specified.

**Evidence**:
- AGENTS.md Rule 4 requires tool permissions
- 0% of delegations specify permissions
- No enforcement mechanism exists

**How It Went Wrong**:
1. Agent delegates without specifying permissions
2. Sub-agent has unrestricted access
3. No validation of tool usage
4. No audit trail of actions

#### Failure 2: No Role Boundary Enforcement

**Problem**: Sub-agents exceed their defined roles.

**Evidence**:
- No role boundary checking
- Agents can do anything
- No constraint gate
- No escalation protocol

**How It Went Wrong**:
1. Agent delegates task
2. Sub-agent expands scope
3. No boundary checking
4. Scope creep accepted

#### Failure 3: No Output Validation

**Problem**: Sub-agent results not verified before acceptance.

**Evidence**:
- No output validation gate
- Sub-agent claims trusted blindly
- No evidence required
- No verification mechanism

**How It Went Wrong**:
1. Agent delegates task
2. Sub-agent returns result
3. Result accepted without verification
4. False results propagate

### 4.2 Parallel Agent Coordination Failures

#### Failure 1: No File Locking

**Problem**: Teams step on each other editing same files.

**Evidence**:
- 19 coordination gaps in EPIC-0.5
- Team A and Team B conflicts
- No file locking mechanism
- No change notification

**How It Went Wrong**:
1. Team A edits file
2. Team B edits same file
3. No conflict detection
4. Changes lost or corrupted

#### Failure 2: No Shared State

**Problem**: No shared state for active documents.

**Evidence**:
- No shared document state
- No write-lock mechanism
- No event schema contracts
- No plugin capability declarations

**How It Went Wrong**:
1. Multiple agents work independently
2. No coordination mechanism
3. Conflicts arise
4. No resolution strategy

#### Failure 3: No Conflict Detection

**Problem**: Conflicting changes not detected.

**Evidence**:
- No pre-save check
- No content hash validation
- No merge strategy
- No conflict notification

**How It Went Wrong**:
1. Agent saves changes
2. Another agent saved conflicting changes
3. No detection
4. Silent corruption

---

## 5. Internet-Based Governance Needs

### 5.1 What Governance Needs Internet Validation

#### Need 1: Technology Choice Validation

**Problem**: Implementing unfamiliar patterns without research.

**Evidence**:
- GOV-06: No POC detection
- Production bugs from unvalidated patterns
- No MCP research protocol enforcement

**What Needs Internet Validation**:
- New frameworks or libraries
- Unfamiliar patterns
- Best practices for specific technologies
- Recent examples and case studies
- Known issues and workarounds

**Required MCP Servers**:
- Context7: Official documentation
- DeepWiki: Semantic understanding
- Exa/Tavily: Recent examples
- Google Search: Current information

#### Need 2: Architecture Decision Validation

**Problem**: Architectural changes made without research.

**Evidence**:
- ADR-039 created but 503 files still in wrong location
- No impact analysis
- No migration path validation
- No best practices research

**What Needs Internet Validation**:
- Architecture patterns
- Migration strategies
- Best practices for specific scenarios
- Known anti-patterns
- Industry standards

#### Need 3: Security and Compliance Validation

**Problem**: Security decisions made without research.

**Evidence**:
- No security validation
- No compliance checking
- No vulnerability scanning
- No best practices enforcement

**What Needs Internet Validation**:
- Security best practices
- Compliance requirements
- Known vulnerabilities
- Security patterns
- Industry standards

### 5.2 Research Trigger Gaps

#### Gap 1: No Automatic Research Triggering

**Problem**: Research not triggered when needed.

**Evidence**:
- No research trigger automation
- Agents skip research
- Unvalidated implementations
- Production bugs

**What Should Exist**:
```yaml
research_trigger:
  trigger_conditions:
    - unfamiliar_pattern: "true"
    - new_framework: "true"
    - architectural_change: "true"
    - security_decision: "true"
  required_mcp_servers:
    - context7: "official docs"
    - deepwiki: "semantic understanding"
    - tavily: "recent examples"
  minimum_validation:
    - mcp_servers_queried: "3+"
    - successful_iterations: "5+ per topic"
  blocking: true
  on_failure: "BLOCK_AND_RESEARCH"
```

#### Gap 2: No Research Evidence Validation

**Problem**: Research findings not validated.

**Evidence**:
- No evidence validation
- Research not documented
- Findings not applied
- Lessons lost

**What Should Exist**:
```yaml
research_validation:
  required_evidence:
    - official_documentation: "from Context7"
    - semantic_understanding: "from DeepWiki"
    - recent_examples: "from Tavily"
    - best_practices: "from multiple sources"
  documentation:
    - context_xml: "findings documented"
    - adr: "decisions recorded"
    - lessons_learned: "captured"
  blocking: true
  on_failure: "BLOCK_AND_VALIDATE"
```

---

## 6. The 10 Traps - Governance Prevention Analysis

### Trap 1: BLIND_CHARGE

**How Governance Should Have Prevented It**:
- Pre-execution hook should have blocked action without context gathering
- Context gathering gate should have required dry reading
- Skill loading should have been automatic

**Why It Failed**:
- No pre-execution hook exists
- Context gathering is manual, not enforced
- Skill loading is manual, 31% utilization

### Trap 2: SYMPTOM_PATCH

**How Governance Should Have Prevented It**:
- Root cause analysis should have been enforced
- Investigation should have been required before fixes
- Evidence should have been required

**Why It Failed**:
- No root cause analysis enforcement
- Investigation is optional
- Evidence not required

### Trap 3: SCOPE_CREEP_ACCEPTANCE

**How Governance Should Have Prevented It**:
- Story boundary gate should have enforced 4-hour limit
- Scope lock should have prevented mid-story additions
- Story decomposition should have been required

**Why It Failed**:
- No story boundary gate exists
- No scope lock mechanism
- Story decomposition is optional

### Trap 4: STATE_BOUNDARY_VIOLATION

**How Governance Should Have Prevented It**:
- State boundary audit should have validated Zustand vs Dexie usage
- Zustand v5 rules should have been enforced
- State management should have been mapped

**Why It Failed**:
- No state boundary audit exists
- Zustand v5 rules not enforced
- State management not mapped

### Trap 5: TEMP_CODE_PERMANENCE

**How Governance Should Have Prevented It**:
- Paired revert story should have been required
- Temporary code should have been tracked
- Tech-debt should have been monitored

**Why It Failed**:
- No paired revert story requirement
- No temporary code tracking
- No tech-debt monitoring

### Trap 6: FILE_TREE_ANARCHY

**How Governance Should Have Prevented It**:
- Canonical path check should have been enforced
- File tree governance should have been automated
- Pre-commit hooks should have blocked violations

**Why It Failed**:
- No canonical path check exists
- File tree governance is manual
- No pre-commit hooks

### Trap 7: GOD_COMPONENT/STORE_SYNDROME

**How Governance Should Have Prevented It**:
- Size monitor should have blocked files >300 LOC
- Component splitter should have been triggered automatically
- Store refactorer should have been required

**Why It Failed**:
- No size monitor exists
- Component splitter is manual
- Store refactorer is optional

### Trap 8: TYPESCRIPT_ONLY_VALIDATION

**How Governance Should Have Prevented It**:
- E2E journey validation should have been required
- Real-world validator should have been enforced
- Evidence should have been required before "done"

**Why It Failed**:
- No E2E journey validation exists
- Real-world validator is optional
- Evidence not required

### Trap 9: NONSENSE_SPRINT_COHESION

**How Governance Should Have Prevented It**:
- Cohesion scanner should have validated sprint cohesion
- Dependency scanner should have mapped dependencies
- Sprint planning should have been validated

**Why It Failed**:
- Cohesion scanner is optional
- Dependency scanner is optional
- Sprint planning not validated

### Trap 10: DOCUMENTATION_DRIFT

**How Governance Should Have Prevented It**:
- Bi-directional sync should have been enforced
- Doc update workflow should have been automatic
- Documentation should have been validated against implementation

**Why It Failed**:
- No bi-directional sync exists
- Doc update workflow is manual
- No validation against implementation

---

## 7. New Governance Mechanisms for OpenCode Native

### 7.1 Required Mechanisms

#### Mechanism 1: Pre-Execution Hooks

**Purpose**: Run validation before any agent action.

**Implementation**:
```yaml
hooks:
  pre_execution:
    - context_freshness_check
    - skill_loading_check
    - dry_reading_check
    - gate_validation_check
  blocking: true
  on_failure: "BLOCK_AND_ESCALATE"
```

#### Mechanism 2: Context Freshness Validation

**Purpose**: Automatically reject stale artifacts.

**Implementation**:
```yaml
context_validation:
  ttl_system:
    constitution: "permanent"
    controlled: "90 days"
    archival: "24 hours"
    ephemeral: "2 hours"
  fingerprinting:
    algorithm: "sha256"
    tracking: "automatic"
    detection: "on_load"
  blocking: true
  on_failure: "REFRESH_OR_REJECT"
```

#### Mechanism 3: Evidence-Based Completion

**Purpose**: Require evidence before claiming "done".

**Implementation**:
```yaml
completion_gate:
  required_evidence:
    - typescript: "pnpm typecheck:fast"
    - tests: "pnpm test:fast"
    - governance: "pnpm governance"
    - e2e_journey: "screenshots or logs"
    - state_persistence: "reload and verify"
  blocking: true
  on_failure: "BLOCK_COMPLETION"
```

#### Mechanism 4: File Locking

**Purpose**: Prevent parallel edits to same files.

**Implementation**:
```yaml
file_locking:
  lock_on_read: false
  lock_on_edit: true
  lock_timeout: "30 minutes"
  notification:
    on_conflict: "alert_both_agents"
    on_unlock: "notify_waiting_agents"
  detection:
    pre_save_check: true
    content_hash_validation: true
```

#### Mechanism 5: Compact-Resilient State

**Purpose**: Inject state after context reset.

**Implementation**:
```yaml
state_injection:
  format: "json"
  location: "injected"
  size: "50 lines max"
  content:
    - current_session_state
    - active_artifacts
    - governance_status
    - team_assignments
  blocking: false
  on_failure: "WARN_AND_CONTINUE"
```

#### Mechanism 6: Research Trigger

**Purpose**: Automatically trigger research when needed.

**Implementation**:
```yaml
research_trigger:
  trigger_conditions:
    - unfamiliar_pattern: "true"
    - new_framework: "true"
    - architectural_change: "true"
    - security_decision: "true"
  required_mcp_servers:
    - context7: "official docs"
    - deepwiki: "semantic understanding"
    - tavily: "recent examples"
  minimum_validation:
    - mcp_servers_queried: "3+"
    - successful_iterations: "5+ per topic"
  blocking: true
  on_failure: "BLOCK_AND_RESEARCH"
```

### 7.2 OpenCode Native Advantages

| Aspect | BMAD Framework | OpenCode Native |
|--------|----------------|-----------------|
| **Context Load** | ~1,500 lines | ~200 lines |
| **Authority Sources** | 5 (conflicts) | 1 (no conflicts) |
| **Enforcement** | Honor system | Hook-based (automatic) |
| **Skill Discovery** | 82 to search | 10 directly available |
| **Wrapper Depth** | 7 layers | 2 layers max |
| **After Compact** | Lost protocols | Injected state |
| **Pre-Execution** | Manual | Automatic hooks |
| **Context Freshness** | Manual TTL | Automatic validation |
| **Evidence Required** | Optional | Mandatory |
| **File Locking** | None | Built-in |

---

## 8. Root Cause Analysis

### 8.1 Why Governance Failed

#### Root Cause 1: Documentation Over Automation

**Problem**: Team prioritized writing governance docs over enforcing them.

**Evidence**:
- 450,189 lines of documentation
- 0 pre-execution hooks
- 0 automatic gates
- 0 enforcement mechanisms

**Impact**: 98.9% non-compliance

#### Root Cause 2: Frameworks Designed for Humans, Not LLMs

**Problem**: BMAD assumes agents will follow protocols voluntarily.

**Evidence**:
- 35% context overhead
- 31% skill utilization
- 1.1% governance compliance
- Protocol amnesia after compact

**Impact**: Reality Score 35-40%

#### Root Cause 3: No State Persistence

**Problem**: Stateless + No memory = Protocols forgotten after compact.

**Evidence**:
- No compact-resilient state
- No state injection
- No cross-session persistence
- Each session is isolated

**Impact**: Can't continue work after compact

#### Root Cause 4: No Enforcement Mechanisms

**Problem**: Governance is aspirational, not operational.

**Evidence**:
- 8 gates defined, 0 enforced
- No blocking behavior
- No escalation automation
- No consequence for violations

**Impact**: 80% of failures from bypassed governance

#### Root Cause 5: Context Window Exhaustion

**Problem**: 35% of context consumed by framework before work begins.

**Evidence**:
- 35.4% context overhead
- 1,500 lines loaded before task
- 7-layer wrapper hierarchy
- 82 skills, only 31% utilized

**Impact**: Shorter conversations, more compacts, more amnesia

---

## 9. Recommendations

### 9.1 Immediate Actions (P0)

1. **Implement pre-execution hooks** that actually run before every action
2. **Create enforcement scripts** that block non-compliant actions
3. **Add compact-resilient state** that survives context reset
4. **Require evidence for completion** - no more "TypeScript passes = done"

### 9.2 Architectural Changes (P1)

1. **Flatten the hierarchy** from 7 layers to 2
2. **Consolidate 82 skills** to 15-20 that actually get used
3. **Remove overlapping workflows** - one path per outcome
4. **Add automation** for everything currently "documented"

### 9.3 Cultural Changes (P2)

1. **Enforce before document** - governance must be automated
2. **Simplify before extend** - no new features until old ones work
3. **Measure compliance** - track actual vs expected behavior
4. **Learn from failures** - integrate retrospective findings

---

## 10. Conclusion

BMAD has 35+ shortcomings across 6 categories. The fundamental problem is that it **documents governance without enforcing it**. Until enforcement is automated, compliance will remain at 1.1%.

**The path forward**: Stop adding documentation, start adding automation.

**OpenCode Native** provides the solution:
- Flat hierarchy (2 layers vs 7)
- Automatic enforcement (hooks vs honor system)
- Compact-resilient state (injected vs lost)
- Evidence-based completion (mandatory vs optional)
- Internet-based validation (automatic vs manual)

**Reality Score**: 35-40% → Target: 85%+

---

**Document Version**: 1.0.0
**Created**: 2026-01-29
**Status**: COMPLETE
**Next**: OpenCode Native Implementation Planning