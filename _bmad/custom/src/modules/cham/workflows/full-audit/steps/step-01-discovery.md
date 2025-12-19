---
nextStepFile: '{installed_path}/steps/step-02-scanning.md'
statusFile: '{project-root}/.bmad/custom/src/modules/cham/status/audit-status.json'
phaseOutputFile: '{project-root}/.bmad/custom/src/modules/cham/status/phase-discovery.json'
---

# Step 1: Discovery Phase

## STEP GOAL

Execute discovery phase with Cartographer and Pattern Analyzer agents to map codebase structure and detect architectural patterns.

## EXECUTION PROTOCOLS

1. **Update Status**
   - Set `currentPhase: "discovery"` in audit-status.json
   - Set `status: "in_progress"`

2. **Run Cartographer Agent**
   - Execute cartographer agent mapping workflow
   - Generate codebase-map.json
   - Build dependency graph
   - Identify orphaned files

3. **Run Pattern Analyzer Agent**
   - Execute pattern analyzer detection workflow
   - Compare stated vs. actual architecture
   - Detect violations and anti-patterns
   - Generate patterns-detected.yaml

4. **Save Phase Results**
   - Write phase-discovery.json with results
   - Include codebase-map.json reference
   - Include patterns-detected.yaml reference

5. **Update Status**
   - Set discovery phase `status: "completed"`
   - Record duration
   - Set `currentPhase: "scanning"`

6. **Proceed to Next Phase**
   - Load and execute step-02-scanning.md

## OUTPUTS

- `codebase-map.json` - Complete codebase structure
- `patterns-detected.yaml` - Architectural patterns and violations
- `phase-discovery.json` - Phase results summary

## SUCCESS CRITERIA

- Codebase map generated with all files
- Dependency graph complete
- Pattern violations identified
- Status file updated

## NEXT STEP

Proceed to Phase 2: Scanning (8 agents in parallel)
