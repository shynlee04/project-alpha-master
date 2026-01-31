# Planning Artifacts Best Practices Report

**Date:** 2026-01-11
**Research Focus:** ADR management, planning artifact organization, numbering schemes, and documentation-codebase sync

---

## 1. Architecture Decision Records (ADR) Management

### 1.1 What Makes a GOOD ADR

Based on industry research from MADR (Markdown Architectural Decision Records), AWS Prescriptive Guidance, and practitioner experience:

**Essential Components (MADR Template):**
- **Title**: Short, descriptive phrase representing the solved problem and solution
- **Context and Problem Statement**: 2-3 sentences explaining the situation and decision need
- **Decision Drivers**: Forces, concerns, or requirements driving the decision
- **Considered Options**: At least 2-3 alternatives evaluated (never just one)
- **Decision Outcome**: Chosen option with explicit justification
- **Consequences**: Both positive and negative outcomes documented
- **Status**: One of: proposed, accepted, rejected, deprecated, superseded

**Critical Qualities:**

| Quality | Description |
|---------|-------------|
| **Singular Focus** | One decision per ADR, no combining multiple architectural choices |
| **Immutability** | Don't alter existing info; amend or supersede with new ADRs |
| **Traceability** | Link to requirements and architecturally-significant requirements (ASRs) |
| **Rigor** | Document alternatives, pros/cons, trade-offs explicitly |
| **Confidence Disclosure** | State confidence level honestly; acknowledge uncertainty |

**Good ADR Lifecycle (from GitHub/joelparkerhenderson):**
```
Initiating → Researching → Evaluating → Implementing → Maintaining → Sunsetting
```

**File Naming Convention:**
- Format: `NNNN-short-descriptive-title.md` (e.g., `0005-use-postgres-database.md`)
- Lowercase with dashes for readability
- Consecutive numbering suggests no more than 9,999 ADRs per repo

### 1.2 Warning Signs of FALSE or POISONED ADRs

**Anti-Patterns Identified (Ozimmer, 2023):**

| Anti-Pattern | Symptoms | Why It's Poisonous |
|--------------|----------|-------------------|
| **Fairy Tale / Wishful Thinking** | Only pros documented, no cons; truisms used as justification | Creates false confidence, hides trade-offs |
| **Sales Pitch** | Marketing language, exaggerations, superlatives | Undermines objectivity, hides limitations |
| **Free Lunch Coupon** | No consequences or only positive ones documented | Misses long-term costs and risks |
| **Dummy Alternative** | One "alternative" that doesn't work in context | Fake justification, real decisions not made |
| **Sprint / Rush** | Only one option considered; short-term focus only | Locks in decisions without proper evaluation |
| **Tunnel Vision** | Only considers one stakeholder perspective | Misses operational/maintenance consequences |
| **Maze** | Content derails from stated problem | Readers can't find the actual decision |
| **Mega-ADR** | Document serves as architecture bible; multi-page detail | Bloated, unfocused, harder to maintain |
| **Blueprint in Disguise** | Commanding/authoritative voice, not journaling style | Loses decision rationale character |
| **Magic Tricks** | Pseudo-problems, problem-solution mismatch, pseudo-accuracy | Misleads future developers |

**Specific Red Flags:**
- Decisions made before problem is clearly articulated
- No "Rejected Alternatives" section or empty alternatives
- Status never updated after implementation
- No linked requirements or ASRs
- Justifications are circular or tautological ("We chose X because X is good")
- No decision makers or stakeholders identified

### 1.3 ADR Quality Checklist

```
□ Decision addresses an architecturally-significant requirement
□ Problem statement is clear and specific
□ At least 2 options were considered and documented
□ Pros/cons are balanced and honest
□ Trade-offs are explicitly called out
□ Justification traces back to actual requirements
□ Confidence level is disclosed
□ All relevant stakeholders are identified
□ Status reflects current state
□ Consequences (good and bad) are documented
□ Links to superseded ADRs if applicable
□ Editorial quality (no typos, consistent formatting)
```

---

## 2. Planning Artifact Organization

### 2.1 Best Practice Structure for Planning Artifacts

Based on project management standards and documentation practices:

**Recommended Folder Hierarchy:**

```
planning-artifacts/
├── architecture/           # System architecture documentation
│   ├── adr/               # Architecture Decision Records
│   │   ├── active/        # Currently valid ADRs
│   │   ├── deprecated/    # Superseded or outdated ADRs
│   │   └── index.md       # ADR log/index
│   ├── diagrams/          # Architecture diagrams (version-controlled)
│   └── views/             # C4 model or similar views
├── backlog/               # Product and sprint backlogs
│   ├── epics/            # Epic definitions
│   ├── features/         # Feature specifications
│   └── stories/          # User story definitions
├── prd/                  # Product Requirements Documents
├──ux-specification.md    # UX/UI specifications
├── roadmap/              # Strategic roadmap artifacts
├── decisions/            # Non-architectural decisions
└── index.md             # Master index of all artifacts
```

**Key Principles:**

| Principle | Description |
|-----------|-------------|
| **Single Source of Truth** | Each artifact has one canonical location |
| **Separation of Concerns** | ADRs separate from stories, separate from specs |
| **Lifecycle Staging** | Active vs. deprecated/archived artifacts clearly separated |
| **Discoverability** | Index files guide navigation |
| **Co-location** | Related artifacts grouped by context |

### 2.2 Artifact Naming Conventions

**File Naming Rules:**
- Use kebab-case: `yyyy-mm-dd-descriptive-name.md`
- Include dates for chronological sorting
- Use consistent prefixes: `adr-`, `epic-`, `story-`, `prd-`
- Avoid spaces and special characters

**Recommended Prefixes:**

| Prefix | Artifact Type | Example |
|--------|--------------|---------|
| `adr-` | Architecture Decision Record | `adr-0015-database-selection.md` |
| `epic-` | Epic definition | `epic-08-file-system.md` |
| `story-` | User story | `story-fs-03-file-creation.md` |
| `prd-` | Product requirements | `prd-notes-workspace.md` |
| `adr-index` | ADR log | `adr-index.md` |

### 2.3 Artifact Lifecycle Management

**TTL-Based Categorization (from BMAD research):**

| Tier | Type | TTL | Action When Expired |
|------|------|-----|-------------------|
| 1 | Constitution/Governance | Permanent | Read-only, protected |
| 2 | Planning/Architecture | Permanent | Review quarterly |
| 3 | Sprint/Iteration | 90 days | Archive to `.archive/` |
| 4 | Ephemeral/WIP | 24 hours | Clean up if stale |

**Validation Gates:**
- Stale check before loading (TTL verification)
- Size check for "god documents" (>5000 lines)
- Tier protection verification
- Duplicate detection

---

## 3. Epic and Story Numbering Schemes

### 3.1 Logical Numbering Approaches

**Scheme A: Monotonic Sequential (Recommended)**

```
Epic Format: EPIC-XX (e.g., EPIC-01, EPIC-02, ...)
Story Format: XX-YY (Epic-Story, e.g., 01-03, 02-01, 02-02)

Example:
├── EPIC-01 (40% complete)
│   ├── 01-01 (done)
│   ├── 01-02 (done)
│   ├── 01-03 (in progress)
│   └── 01-04 (blocked)
├── EPIC-02 (pending)
├── EPIC-03 (pending)
```

**Advantages:**
- Monotonic ensures order dependency (Epic N requires Epic N-1 to be 80%+)
- Stories stay within epic context
- Easy to reference across documents
- Natural sorting works correctly

**Scheme B: Hierarchical Dot Notation**

```
Epic: EPIC.XX
Story: EPIC.XX.SS (e.g., EPIC.01.03)

Example: EPIC.02.05 = Epic 2, Story 5
```

**Scheme C: Prefix-Based Flat**

```
Format: EPIC-XXXX (epic), ST-XXXX (story)
Separate namespaces for epics and stories
```

### 3.2 Naming Best Practices

**Epic Naming:**
- Use noun phrases describing the feature/outcome
- Include core development being done AND business reason
- Example: `EPIC-08 - 8-bit Design Compliance`
- Example: `EPIC-FS - File System Foundation`

**Story Naming:**
- Format: `[Epic]-[StoryNumber]-[Action]-[Object]`
- Example: `FS-05` (File System Epic, Story 5)
- Keep titles brief but descriptive

**Anti-Patterns to Avoid:**
- Non-sequential gaps in numbering
- Reusing numbers after completion
- Mixed numbering schemes
- Numbers without semantic meaning

### 3.3 Progress Tracking Schema

**Recommended Progress Metrics:**

| Epic State | Meaning |
|------------|---------|
| 0% | Not started |
| 1-79% | In progress |
| 80%+ | Near completion (can start next epic) |
| 100% | Complete |

**Story State Indicators:**
- `TODO` - Not started
- `IN_PROGRESS` - Active development
- `IN_REVIEW` - Under code review
- `BLOCKED` - Blocker exists
- `DONE` - Complete

---

## 4. Reconciling Planning Documents with Codebase State

### 4.1 Documentation Sync Anti-Patterns

**Common Problems:**

| Problem | Symptom | Impact |
|---------|---------|--------|
| **Documentation Drift** | Docs describe old system state | Developers misled, wrong assumptions |
| **Stale Artifacts** | Planning docs not updated after implementation | Context poisoning |
| **Orphaned Decisions** | ADRs exist but code doesn't reflect them | False sense of governance |
| **Implemented but Undocumented** | Code changes, docs not updated | Knowledge loss |
| **False ADRs** | ADRs document decisions never made | Noise, confusion |

### 4.2 Audit Framework for Planning Artifacts

**5-Audit Checklist:**

```
1. FRESHNESS AUDIT
   □ Check last modified dates vs. implementation dates
   □ Flag artifacts older than 90 days without review
   □ Verify git history matches document claims

2. ACCURACY AUDIT
   □ Cross-reference ADR decisions with actual code
   □ Verify epics/stories map to implemented features
   □ Check PRD requirements against completed work

3. COMPLETENESS AUDIT
   □ All completed stories have corresponding code
   □ All implemented features have acceptance criteria met
   □ ADR consequences are tracked

4. CONSISTENCY AUDIT
   □ Numbering scheme is consistent
   □ Status indicators are accurate
   □ No duplicate or conflicting artifacts

5. UTILITY AUDIT
   □ Artifacts provide value to new developers
   □ Context is sufficient for decision understanding
   □ Link rot checked for external references
```

### 4.3 Sync Enforcement Mechanisms

**Automated Checks:**
- Run freshness validation before loading artifacts
- Compare artifact timestamps with code commit timestamps
- Flag "god artifacts" (>5000 lines) for split review
- Check for ADR status vs. code reality mismatches

**Manual Processes:**
- Quarterly ADR review sessions
- Epic done-gate verification
- Story completion requires documentation update
- Sprint retrospective includes documentation audit

**Verification Commands:**
```bash
# Example validation commands
pnpm tsc --noEmit && pnpm vitest run  # Code validity
git diff --name-only                  # Changed files
find . -name "*.md" -mtime +90        # Stale docs
```

### 4.4 Context Poisoning Detection

**Warning Signs:**

| Indicator | Action Required |
|-----------|----------------|
| Multiple ADRs with contradictory decisions | Audit and deconflict |
| Story status contradicts code state | Update story or code |
| Epic progress >100% or <0% | Fix calculation |
| Artifacts >48 hours old in active context | Re-validate freshness |
| God artifact (>5000 lines) | Split into focused docs |

**Recovery Actions:**
1. Run stale-check on all context artifacts
2. Cross-reference with git history
3. Update or archive outdated items
4. Create missing artifacts for implemented features
5. Deprecate/merge conflicting ADRs

---

## 5. Summary Recommendations

### Quick Reference Cards

**ADR Creation:**
1. One decision per document
2. Document 2+ alternatives with pros/cons
3. Link to requirements (ASRs)
4. State confidence level
5. Update status as decisions evolve

**Artifact Organization:**
1. Separate ADRs from stories from specs
2. Use consistent naming (kebab-case with prefixes)
3. Stage artifacts (active vs. archived)
4. Maintain index files for discovery
5. Review quarterly for staleness

**Numbering:**
1. Use monotonic sequential (EPIC-XX, XX-YY)
2. Never reuse numbers
3. Keep stories within epic context
4. Track progress percentages
5. Update status indicators

**Codebase Sync:**
1. Run freshness checks before loading context
2. Cross-validate artifacts against code
3. Audit quarterly for drift
4. Flag and clean stale artifacts
5. Enforce documentation updates with code changes

---

## Sources

1. GitHub - joelparkerhenderson/architecture-decision-record (13.5k stars)
2. MADR (Markdown Architectural Decision Records) - adr.github.io/madr
3. AWS Prescriptive Guidance - ADR Process
4. Ozimmer (2023) - "How to create Architectural Decision Records (ADRs) — and how not to"
5. Atlassian - Agile epics and user stories documentation
6. Mintlify (2025) - "How to audit and overhaul your software documentation"
7. Azure DevOps - Agile workflow documentation
8. Agile Alliance - Epic and story management resources

---

**End of Report**
