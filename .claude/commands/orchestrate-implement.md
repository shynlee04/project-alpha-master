# orchestrate-implement

Orchestrate and coordinate complex development workflows across multiple projects with built-in guardrails, validation, and compliance checking.

## Prerequisites

- Current project must have:
  - `tasks.md` file with structured task list
  - `CLAUDE.md` or `AGENTS.md` with guidelines
  - Active git repository
  - Test suite configuration

## Usage

```
/orchestrate-implement [phase-number] [--parallel] [--skip-tests]
```

**Parameters:**
- `phase-number`: Optional specific phase from tasks.md to execute
- `--parallel`: Enable parallel execution for independent tasks
- `--skip-tests`: Skip validation tests (not recommended)

## Workflow Overview

This command implements a 10-phase orchestration pipeline with strict validation gates:

### Phase 0: Preparation & Template Loading
1. **Load Ultrathink** to establish coordinating pipelines
2. **Scan MCP servers, SKILLS, commands, and plugins**
3. **Identify optimal agent/task combinations**
4. **Set up dynamic port allocation (3000-3009)**

### Phase 1: Context Gathering
1. **Fetch codebase context**
   - Analyze actual code files (not just docs)
   - Read all artifacts and specifications
   - Parse tasks.md with status tracking
   - Identify prerequisite dependencies

2. **Validate prerequisites**
   - Check completed tasks status
   - Verify TDD compliance for refactoring/implementing/debug tasks
   - Ensure all prerequisite tests pass
   - Cross-reference constitution/AGENTS.md/CLAUDE.md guidelines

### Phase 2: Orchestration Planning
1. **Create master TODO list**
   - Main orchestrator tasks
   - Agent-specific task lists
   - Sub-agent task breakdowns

2. **Determine execution strategy**
   - Parallel vs sequential task routing
   - Agent assignment based on domain expertise
   - MCP server utilization plan

### Phase 3: Agent Coordination
1. **Launch specialized agents** with:
   - Clear task definitions
   - Success criteria
   - MCP server guidance
   - Constitution compliance reminders

2. **Assign domain-specific agents:**
   - Coding agents → Implement features
   - Debugging agents → Fix issues
   - Architecture agents → Refactor design
   - Testing agents → Validate changes

### Phase 4: Execution & Monitoring
1. **Task execution**
   - Run agents with real-time monitoring
   - Track progress in TODO list
   - Manage background tasks (max 3 parallel dev servers)
   - Dynamically allocate ports (3000-3009)

2. **Validation gates**
   - Type error checks after each code save
   - API contract validation
   - Schema sync verification
   - Cross-dependency validation

### Phase 5: Gatekeeping & Validation
1. **Double-check all agent reports**
   - Never trust completion claims at face value
   - Run independent validation commands
   - Verify actual results vs reported results
   - Check compliance with constitution

2. **Quality assurance**
   - Test suite execution
   - Linting and type checking
   - Code review against guidelines
   - Documentation verification

### Phase 6: Status Tracking
1. **Update documentation**
   - Mark completed tasks in tasks.md
   - Update AGENTS.md/CLAUDE.md with status
   - Add brief notes under each item
   - Document issues and transitions

2. **Maintain hierarchy**
   - Use clean, systematic structure
   - Include IDs for all entries
   - Use frontmatter format
   - Follow single-source-of-truth principle

### Phase 7: Issue Resolution
1. **Address problems immediately**
   - Fix small bugs during execution
   - Re-run affected validation steps
   - Document all changes
   - Update TODO status

2. **Escalate complex issues**
   - Create new tasks for unresolved problems
   - Schedule for next cycle
   - Maintain clear documentation

### Phase 8: Consolidation
1. **Verify one phase completion**
   - Ensure only one tasks.md phase covered
   - Validate all gatekeeping passed
   - Confirm status tracking updated
   - Ready for next cycle

### Phase 9: Git Workflow
1. **Commit changes**
   - Stage modified files
   - Write descriptive commit message matching code changes
   - Include phase completion details
   - Create pull request for review

2. **Repository status**
   - Push to remote
   - Track PR creation
   - Maintain clean git history

## Non-Negotiable Rules

### Constitution Compliance
- ✅ All coding/debugging/architecturing agents must follow: **Plan → TODO List → Execution → Validation**
- ✅ No task can be certified complete without validation
- ✅ Strong typing enforced with type error checks
- ✅ API contracts and schema-sync validated
- ✅ Cross-dependencies checked
- ✅ Single-source-of-truth maintained

### Background Task Management
- ✅ Kill and reset terminals before pipeline
- ✅ Never run >3 terminal tasks in parallel for dev channels
- ✅ Dynamic port allocation: 3000-3009 (no fixed ports)
- ✅ Clean terminal state between cycles

### Documentation Standards
- ✅ TODO list maintained for orchestrator, agents, and sub-agents
- ✅ Clear status and tracking for every item
- ✅ Brief, concise notes under each entry
- ✅ Hierarchical ID system
- ✅ Iterative editing over new document generation

## Success Criteria

- [ ] All prerequisite tasks validated and completed
- [ ] TDD compliance verified for all coding tasks
- [ ] Type checking passes without errors
- [ ] API contracts validated
- [ ] Schema sync confirmed
- [ ] Tests pass (unit, integration, e2e)
- [ ] Linting clean
- [ ] No breaking changes
- [ ] Documentation updated
- [ ] Git commit and PR created
- [ ] Constitution compliance verified

## Examples

Execute next phase:
```
/orchestrate-implement
```

Execute specific phase with parallel execution:
```
/orchestrate-implement 3 --parallel
```

Skip to validation phase only:
```
/orchestrate-implement 5
```

## Integration Points

### MCP Servers Used
- **deepwiki**: Research dependencies and patterns
- **context7**: Framework documentation lookup
- **tavily**: Community solutions and best practices
- **repomix**: Codebase analysis
- **supabase**: Database schema validation (if applicable)

### Commands Leveraged
- **ultrathink**: Establish coordinating pipelines
- **code-review**: Validate implementations
- **test-automator**: Execute test suites
- **planning**: Create detailed task breakdowns

### Agents Deployed
- **code**: Direct implementation
- **debug**: Issue resolution
- **architect**: Design and refactoring
- **tester**: Validation and verification
- **git**: Repository management

## Notes

- Each cycle should cover exactly one phase from tasks.md
- Always validate before moving to next phase
- Use parallel execution only when tasks are truly independent
- Maintain strict compliance with project constitution
- Document all decisions and changes
- Never skip validation gates