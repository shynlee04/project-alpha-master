---
nextStepFile: '{installed_path}/steps/step-01a-user-journey.md'
continueFile: '{installed_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 1: Init - Deep Project Context Loading

## STEP GOAL

Load story context AND perform deep project analysis to understand:
- How this story connects to the broader system
- Cross-impact analysis with other epics/stories
- Code architecture mapping and dead/overlap detection

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Load story context AND perform code analysis
- 📋 Run grep/glob searches to map affected areas
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Story Context (Standard)

```
Story Key: {from frontmatter or user input}

Find story context file:
- {project-root}/_bmad-output/{story_key}-context.xml
- {project-root}/_bmad-output/sprint-artifacts/{story_key}.md
- {project-root}/_bmad-output/planning-artifacts/epics.md (for epic reference)
```

### 2. DEEP PROJECT ANALYSIS (NEW - Required)

Before proceeding, execute comprehensive code analysis:

```yaml
deep_analysis_required:
  file_pattern_search:
    - pattern: "**/*.{ts,tsx,js,jsx}"
      scope: "src/"

  grep_searches:
    - name: "related_imports"
      pattern: "{keyword_from_story}|{component_name}|{store_name}"
      include: "*.ts,*.tsx"
      
    - name: "route_definitions"
      pattern: "{route_path}"
      include: "*.ts"
      
    - name: "component_usages"
      pattern: "{ComponentName}"
      include: "*.tsx"
      
    - name: "store_subscriptions"
      pattern: "useStore|useShallow"
      include: "*.ts,*.tsx"

  glob_searches:
    - pattern: "src/**/{component,feature,domain}*/**"
      description: "Locate related feature directories"
```

### 3. CROSS-IMPACT MAPPING (NEW - Required)

Analyze how this story impacts other parts of the system:

```yaml
cross_impact_analysis:
  epic_dependencies:
    - "What other epics reference this epic's work?"
    - "What stories depend on this story?"
    - "What stories does this story depend on?"

  feature_interconnections:
    - "Which components touch the data/business logic being modified?"
    - "Which routes are affected by UI changes?"
    - "Which stores subscribe to data being changed?"

  architectural_boundaries:
    - "Does this cross domain/infrastructure/presentation boundaries?"
    - "Are there circular dependencies being created?"
    - "Does this align with clean architecture paths?"
```

### 4. DETECT DEAD CODE & OVERLAPS (NEW - Required)

```yaml
dead_code_detection:
  checks:
    - name: "orphaned_files"
      glob: "**/*.{ts,tsx}"
      filter: "No imports reference this file"
      
    - name: "duplicate_logic"
      grep: "Similar.*function.*implementation"
      description: "Find duplicate implementations"
      
    - name: "zombie_features"
      pattern: "Feature.*exists.*but.*never.*used"
      description: "Detect features without entry points"
      
    - name: "overlapping_changes"
      compare: "Multiple stories modifying same files"
      description: "Identify conflicting changes"
```

### 5. Display Comprehensive Story Summary

```
═══════════════════════════════════════════════════════════════════
STORY INITIALIZED - WITH DEEP ANALYSIS
═══════════════════════════════════════════════════════════════════

Story: {story_key}
Title: {story_title}
Sprint: {sprint_id}
Epic: {epic_name} (EPIC-{N})

┌─────────────────────────────────────────────────────────────────┐
│ DEEP ANALYSIS SUMMARY                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Files Analyzed: {count}                                         │
│ Files Affected: {count} (create + modify)                       │
│ Cross-References: {count} other stories/components              │
│ Dependencies: {list}                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ IMPACT ASSESSMENT                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Epic Position: {where in epic flow}                             │
│ Downstream Stories: {list or "None"}                            │
│ Upstream Dependencies: {list or "None"}                         │
│ Architectural Impact: {LOW|MEDIUM|HIGH}                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ARCHITECTURE MAPPING                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Touched Domains:                                                │
│   - {domain}/types/                                             │
│   - {domain}/services/                                          │
│   - infrastructure/persistence/{store|dexie}/                   │
│   - presentation/components/{component}/                        │
│   - routes/{route}/                                             │
│                                                                 │
│ Clean Architecture: {COMPLIANT|NON_COMPLIANT}                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ DEAD CODE/OVERLAPS DETECTED                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Orphaned Files: {count}                                         │
│ Duplicate Logic: {count}                                        │
│ Conflicting Changes: {count}                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Acceptance Criteria:
{list of criteria}

Dependencies:
{list of dependencies}

Options:
[C] Continue to User Journey (with full context)
[H] Hold story (set to on_hold)
[X] Cancel story initiation
```

### 6. Handle User Choice

**C**: Proceed to Step 1a (User Journey) with deep analysis loaded
**H**: Update sprint-status.yaml, exit
**X**: Exit without changes

### 7. Update Frontmatter

On proceeding, update:
```yaml
---
stepsCompleted: [1]
storyKey: "{story_key}"
sprintId: "{sprint_id}"
startedAt: "{timestamp}"
status: "in_progress"
storyTitle: "{title}"

# Deep Analysis Results (NEW)
deepAnalysis:
  filesAnalyzed: {count}
  filesAffected: {list}
  crossReferences: {count}
  impactLevel: "LOW|MEDIUM|HIGH"
  architectureCompliance: true/false
  deadCodeFound:
    orphanedFiles: {count}
    duplicateLogic: {count}
    conflicts: {count}
  epicConnections:
    upstream: {list}
    downstream: {list}
---
```

---

## SUCCESS METRICS

- ✅ Story context loaded successfully
- ✅ Deep analysis executed (grep/glob searches)
- ✅ Cross-impact mapping complete
- ✅ Dead code/overlap detection performed
- ✅ Frontmatter updated with analysis results

## FAILURE METRICS

- ❌ Story context file not found
- ❌ Deep analysis not executed
- ❌ Cross-impact mapping incomplete
- ❌ Dead code detection skipped

**ONLY WHEN complete, load {nextStepFile}**
