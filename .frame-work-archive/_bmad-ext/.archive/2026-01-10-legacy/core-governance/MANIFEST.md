# Core Governance & Standards Module

**Module ID**: MOD-A-CGOV
**Governance Tier**: Tier 2 (Controlled & Iterative)
**TTL**: Permanent
**Last Updated**: 2026-01-06
**Status**: Active

---

## description

The Core Governance & Standards module is the central authority for all governance enforcement, platform routing, and state management across the BMAD framework. It serves as the foundation for autonomous operation with near 0% human interference.

### Key Responsibilities

1. **Constitution Enforcement**: Protect Tier 1 governance documents (READ-ONLY validation)
2. **Platform Routing**: Intelligent task routing between Claude Code and Open Code platforms
3. **Unified State Management**: Single source of truth for session state across platforms
4. **Artifact Filtering**: TTL-based artifact management to prevent context poisoning
5. **Time-Boxing Enforcement**: Strict time limits with cascade escalation
6. **Cross-Platform Handoffs**: Seamless context transfer between platforms

---

## Agents

### 1. BMAD-Core-Master Orchestrator
**File**: `agents/bmad-core-master.md`
**Role**: Central coordinator with full autonomous decision-making authority

**Capabilities**:
- ✅ Pause/Block execution without human approval (90%+ autonomy)
- ✅ Route tasks to optimal platform automatically
- ✅ Split stories when time-box exceeded
- ✅ Trigger deep-investigation workflows autonomously
- ✅ Emergency shutdown on critical failures

**Autonomous Decisions** (No approval required):
- Task routing between platforms
- Story splitting (2x time-box exceeded)
- Deep-investigation triggering (first timeout)
- Agent reassignment (underperformance detected)
- Resource reallocation (priority-based)

**Human Approval Required** (Only):
- Delete any artifact (except TTL auto-archive)
- Modify Tier 1 governance documents
- Change sprint priorities mid-execution

### 2. Platform Router Service
**File**: `agents/platform-router.md`
**Role**: Optimal platform selection and load balancing

**Routing Matrix**:
| Task Type | Optimal Platform | Reasoning | Success Rate |
|-----------|-----------------|-----------|--------------|
| Code Generation | Claude Code | Superior at complex refactoring | 92% |
| Documentation | Open Code | Better at structured docs | 89% |
| Real-World Testing | Both | Cross-platform validation | 95% |
| Architecture Design | Claude Code | Stronger technical reasoning | 91% |

**Features**:
- Automatic failover if platform unavailable
- Load balancing across platforms
- Performance tracking and optimization
- Cross-platform handoff coordination

---

## Workflows

### 1. Unified State Management
**File**: `workflows/unified-state-management.md`

**State File**: `.claude/AGENT-STATE.yaml` (shared via symlink to `.opencode/`)

**State Structure**:
```yaml
session:
  id: "UNIFIED-{timestamp}"
  platforms: ["claude-code", "opencode"]
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED"

current:
  agent: "{active_agent}"
  platform: "{current_platform}"
  workflow: "{current_workflow}"
  story: "{story_id}"

handoffs:
  pending: []
  completed: []

autonomous_decisions:
  log: []  # All autonomous decisions with reasoning
```

### 2. Cross-Platform Handoff Protocol
**File**: `workflows/cross-platform-handoff.md`

**Process**:
1. Agent A (Platform X) completes task
2. Creates handoff artifact with platform tags
3. Updates unified AGENT-STATE.yaml
4. Platform Router routes to Platform Y
5. Agent B (Platform Y) loads artifact and context
6. Execution continues seamlessly

### 3. Pre-Execution Validation
**Triggered**: Before every user message is sent to Claude
**Validations**:
1. Stale Artifact Detection (TTL check)
2. Artifact Size Validation (god artifact detection)
3. Tier 1 Protection (constitution read-only)
4. Time-Boxing Compliance (duration check)
5. Context Poisoning Prevention (duplicate detection)

**Hook File**: `.claude/hooks/pre-execution.sh` (v2.0.0)
**Duplicate**: `.opencode/hooks/pre-execution.sh` (identical)

---

## Configuration Files

### 1. Context Filtering
**File**: `config/context-filtering.yaml`

**Artifact Tiers**:
| Tier | Name | TTL | Loading | Validation |
|------|------|-----|---------|------------|
| 1 | Unchangeable (Constitution) | Permanent | Always | Read-only check |
| 2 | Controlled & Iterative | Permanent | On-demand | Full consumption required |
| 3 | Archival | 90 days | If <90 days old | Archive if stale |
| 4 | Ephemeral | 24 hours | If <24h & validated | Ignore if stale |

**Tolerance Thresholds**:
- Tier 4: Warning at 20 hours, Critical at 24 hours
- Tier 3: Warning at 80 days, Critical at 90 days
- Tier 2: No age limit, but partial-read penalty
- Tier 1: Modification attempts = 0 tolerance

### 2. Time-Boxing
**File**: `config/time-boxing.yaml`

**Time Boxes**:
| Level | Duration | Monitoring | On Timeout |
|-------|----------|------------|------------|
| Step Execution | 5 min | Every 30s | Escalate to story |
| Story Implementation | 30 min | Every 1 min | Deep-investigation |
| Deep Investigation | 15 min | Every 30s | Split story |
| Epic Execution | 4 hours | Every 30 min | Assess progress |
| Sprint Execution | 8 hours | Every 1 hour | Health check |

**Cascade Escalation**:
1. **1x Timeout** (30-45 min): Trigger deep-investigation, resume with insights
2. **2x Timeout** (45-60 min): Split story into 2-3 sub-stories
3. **3x Timeout** (>60 min): PAUSE, notify human, await approval

### 3. Platform Matrix
**File**: `config/platform-matrix.yaml`

**Routing Rules**:
```yaml
routing_matrix:
  code_generation:
    optimal_platform: "claude-code"
    fallback: "opencode"
    success_rate: 0.92

  documentation:
    optimal_platform: "opencode"
    fallback: "claude-code"
    success_rate: 0.89
```

---

## Integration Points

### Platform Integration
- **Claude Code**: `.claude/` directory (primary)
- **Open Code**: `.opencode/` directory (symlinked state)
- **Shared State**: `AGENT-STATE.yaml` (unified)
- **Shared Hooks**: Identical pre-execution validation

### Module Dependencies
**Provides To**:
- Architecture Refactoring Module (governance enforcement)
- Sprint Execution Module (time-boxing, state management)
- Integration Testing Module (platform routing)

**Consumes From**:
- All modules (report governance violations)
- All agents (autonomous decision logging)

### Dev Notes Integration
All artifacts include `integration_points:` field:
```yaml
integration_points:
  detected: []
  notify_opposite_team: []  # Auto-populate when cross-team work detected
```

---

## Artifacts Created

### Configuration Files
- `config/context-filtering.yaml` (300+ lines)
- `config/time-boxing.yaml` (300+ lines)
- `config/platform-matrix.yaml` (embedded in platform-router.md)

### Agent Definitions
- `agents/bmad-core-master.md` (600+ lines)
- `agents/platform-router.md` (500+ lines)

### State Files
- `.claude/AGENT-STATE.yaml` (200+ lines, unified)
- `.opencode/AGENT-STATE.yaml` (symlink to .claude)

### Hooks
- `.claude/hooks/pre-execution.sh` (420 lines, v2.0.0)
- `.opencode/hooks/pre-execution.sh` (identical, v2.0.0)

---

## Quality Metrics

### Governance Compliance
- **Target**: 100% enforcement of all governance rules
- **Measurement**: Automated validation catches all violations before execution
- **Status**: ✅ 5 comprehensive validations implemented

### Platform Integration
- **Target**: 100% routing success between platforms
- **Measurement**: Cross-platform handoffs complete without errors
- **Status**: ✅ Unified state management implemented

### Context Quality
- **Target**: 0% context poisoning, 100% artifact freshness
- **Measurement**: Stale artifact detection blocks execution 100% of time
- **Status**: ✅ TTL enforcement active

### Token Efficiency
- **Target**: 70%+ token optimization via TTL enforcement
- **Measurement**: Average context size per story <50K tokens
- **Status**: 🔄 Active monitoring

---

## Success Criteria

✅ **Completed**:
1. Unified AGENT-STATE.yaml with cross-platform synchronization
2. Pre-execution validation hooks (5 comprehensive checks)
3. BMAD-Core-Master with full autonomous authority
4. Platform Router with intelligent load balancing
5. Context filtering with 4-tier TTL system
6. Time-boxing enforcement with cascade escalation

🔄 **In Progress**:
1. Module manifest documentation
2. Cross-platform handoff testing
3. Autonomous decision quality tracking

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-06 | BMAD Framework Transformation - 4-module consolidation |
| 1.0.0 | 2025-12-20 | Initial governance module creation |

---

## Related Files

- **Constitution**: `_bmad/modules/governance/CONSTITUTION.md` (Tier 1, READ-ONLY)
- **Unified Agent Registry**: `.claude/config/unified-agent-registry.yaml`
- **Transformation Plan**: `/Users/apple/.claude/plans/valiant-purring-tower.md`

---

**Module Status**: ✅ ACTIVE
**Next Review**: 2026-02-06 (30 days)
**Maintainer**: BMAD-Core-Master (autonomous)
