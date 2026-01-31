---
nextStepFile: '{installed_path}/steps/step-02-generate-status.md'
outputFile: '{output_folder}/sprint-planning-output-{date}.md'
epicLocation: '{planning_artifacts}'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'sprint-planning-enhanced'
---

# Step 1: Discover Epics

## STEP GOAL

Scan planning artifacts directory for all epic files and parse story content.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Scan for epic files
- 📋 Parse story content
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Define Epic Location

```yaml
epic_scan:
  location: "{project-root}/_bmad-output/planning-artifacts/"
  patterns:
    - "epic*.md"
    - "*epic*.md"

  load_strategy: "FULL_LOAD"
  include_content: true
```

### 2. Scan for Epic Files

```bash
# Find all epic files
find {epicLocation} -name "epic*.md" -o -name "*epic*.md"

# Expected pattern:
# epic-1-ux-foundation.md
# epic-2-feature-framework.md
# etc.
```

### 3. Parse Epic Content

For each epic file, extract:
```yaml
epic_data:
  epic_key: "{from filename or metadata}"
  epic_title: "{title}"
  stories:
    - story_key: "{e.g., 1-1-story-name}"
      title: "{story title}"
      status: "{backlog|ready-for-dev|etc}"
      points: "{estimate}"
      dependencies: [{list}]
```

### 4. Display Epic Summary

```
═══════════════════════════════════════════════════════════
EPIC DISCOVERY COMPLETE
═══════════════════════════════════════════════════════════

Epics Found: {count}

{list of epics with story counts}

Total Stories: {count}
Story Status Breakdown:
├─ Backlog: {count}
├─ Ready for Dev: {count}
├─ In Progress: {count}
└─ Done: {count}

Options:
[C] Continue to status generation
[R] Review epic details
[X] Cancel
```

### 5. Handle User Choice

**C**: Proceed to Step 2 (Generate Status)
**R**: Show detailed epic information
**X**: Exit without changes

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1]
epics_found: {count}
stories_total: {count}
epics_list: [{list}]
discovered_at: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ Epic files discovered
- ✅ Stories parsed from epics
- ✅ Story statuses captured

## FAILURE METRICS

- ❌ No epic files found
- ❌ Unable to parse epic content

**ONLY WHEN epics discovered, load {nextStepFile}**
