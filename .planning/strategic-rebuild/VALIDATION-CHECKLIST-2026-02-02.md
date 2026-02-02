# Strategic Rebuild Validation Checklist

**Version:** 1.0.0
**Created:** 2026-02-02
**Purpose:** Track validation gates for each phase of Strategic Rebuild

---

## How to Use This Checklist

1. **Before starting a phase:** Review the pre-gate requirements
2. **During execution:** Check off tasks as completed
3. **After phase:** Complete ALL validation checks before marking phase done
4. **If validation fails:** Document in GAPS-TRACKER.yaml and escalate

---

## Phase R-0: Foundation

### Pre-Gate
- [ ] Read `.planning/SOURCE-OF-TRUTH.md` Part 2 (Platform Operators)
- [ ] Read `.planning/strategic-rebuild/STRATEGIC-REBUILD-ROADMAP-2026-02-02.md`
- [ ] Understand: Platform Operators are NOT plugins
- [ ] Understand: projectId ONLY (no workspaceId)

### Execution Checklist
- [ ] R-0-01: Directory structure created
- [ ] R-0-02: Platform types defined (no workspaceId)
- [ ] R-0-03: PlatformProvider context created
- [ ] R-0-04: Clean project route created
- [ ] R-0-05: PlatformLayout created

### Validation Gate
```yaml
automated:
  - [ ] pnpm typecheck:fast # New code 0 errors
  - [ ] pnpm test:fast # No regressions
  - [ ] pnpm governance # Passes

manual:
  - [ ] Navigate to / → Hub renders
  - [ ] Navigate to /$projectId → PlatformLayout renders
  - [ ] FileTree placeholder visible (left)
  - [ ] Chat placeholder visible (right)
  - [ ] Browser refresh → still works

artifacts:
  - [ ] src/platform/ directory exists
  - [ ] src/modules/ directory exists
  - [ ] No @/lib imports in new code
  - [ ] No workspaceId in new code
  - [ ] R-0-SUMMARY.md created
```

### Phase Complete
- [ ] All automated checks pass
- [ ] All manual checks pass
- [ ] All artifacts created
- [ ] User approval received

---

## Phase R-1: Platform Layer

### Pre-Gate
- [ ] R-0 complete and validated
- [ ] Reviewed FileTree plugin structure (`src/plugins/filetree/`)
- [ ] Reviewed Chat plugin structure (`src/plugins/chat/`)

### Execution Checklist
- [ ] R-1-01: FileTree operator ported to `src/platform/operators/filetree/`
- [ ] R-1-02: Chat operator ported to `src/platform/operators/chat/`
- [ ] R-1-03: PlatformLayout wired to actual operators
- [ ] R-1-04: Operators render without hydration
- [ ] R-1-05: Activity-bar store updated (operators removed)

### Validation Gate
```yaml
automated:
  - [ ] pnpm typecheck:fast # 0 new errors
  - [ ] pnpm governance # Passes

manual:
  - [ ] Enter project → FileTree ALWAYS visible
  - [ ] Enter project → Chat ALWAYS visible
  - [ ] No "Loading..." for Platform layer
  - [ ] Browser refresh → operators still there
  - [ ] FileTree shows project files
  - [ ] Chat shows conversation (or empty state)

artifacts:
  - [ ] src/platform/operators/filetree/ exists
  - [ ] src/platform/operators/chat/ exists
  - [ ] Operators NOT in activity-bar store
  - [ ] R-1-SUMMARY.md created
```

### Phase Complete
- [ ] All automated checks pass
- [ ] All manual checks pass
- [ ] All artifacts created
- [ ] User approval received

---

## Phase R-2: Port Infrastructure

### Pre-Gate
- [ ] R-1 complete and validated
- [ ] Reviewed BYOK infrastructure (`src/infrastructure/ai/`)
- [ ] Reviewed FSA adapter (`src/infrastructure/filesystem/`)
- [ ] Reviewed Dexie schema

### Execution Checklist
- [ ] R-2-01: Storage compatibility layer created
- [ ] R-2-02: Project store ported (clean types)
- [ ] R-2-03: File-tree-store ported (clean types)
- [ ] R-2-04: FSA sync verified working
- [ ] R-2-05: BYOK verified working

### Validation Gate
```yaml
automated:
  - [ ] pnpm typecheck:fast # 0 new errors
  - [ ] pnpm test:fast # Storage tests pass

manual:
  - [ ] Create project → persists in Dexie
  - [ ] Old projects still load (compatibility)
  - [ ] Add API key → persists and loads models
  - [ ] FSA project → files sync to disk
  - [ ] Browser refresh → all data preserved

artifacts:
  - [ ] Storage compatibility layer documented
  - [ ] No NEW workspaceId in new code
  - [ ] R-2-SUMMARY.md created
```

### Phase Complete
- [ ] All automated checks pass
- [ ] All manual checks pass
- [ ] All artifacts created
- [ ] User approval received

---

## Phase R-3: Port Modules

### Pre-Gate
- [ ] R-2 complete and validated
- [ ] Reviewed Notes plugin (22 BlockNote blocks)
- [ ] Reviewed Monaco plugin
- [ ] Reviewed Terminal plugin
- [ ] Reviewed Preview plugin

### Execution Checklist
- [ ] R-3-01: Module loader system created
- [ ] R-3-02: Monaco module ported
- [ ] R-3-03: Notes module ported (all 22 blocks)
- [ ] R-3-04: Terminal module ported
- [ ] R-3-05: Preview module ported
- [ ] R-3-06: Module panel wired to activity-bar

### Validation Gate
```yaml
automated:
  - [ ] pnpm typecheck:fast # 0 new errors
  - [ ] pnpm test:fast # All tests pass
  - [ ] pnpm governance # Passes

manual:
  - [ ] Monaco: open file, edit, save
  - [ ] Notes: create note, all blocks work
  - [ ] Notes: AI blocks work (stubbed OK)
  - [ ] Terminal: run npm command
  - [ ] Preview: see dev server output
  - [ ] Toggle modules via activity bar
  - [ ] Module state persists on refresh

artifacts:
  - [ ] src/modules/monaco/ exists
  - [ ] src/modules/notes/ exists
  - [ ] src/modules/terminal/ exists
  - [ ] src/modules/preview/ exists
  - [ ] Feature parity checklist completed
  - [ ] R-3-SUMMARY.md created
```

### Phase Complete
- [ ] All automated checks pass
- [ ] All manual checks pass
- [ ] All artifacts created
- [ ] User approval received

---

## Phase R-4: Cutover

### Pre-Gate
- [ ] R-3 complete and validated
- [ ] Feature parity confirmed
- [ ] E2E tests ready to run

### Execution Checklist
- [ ] R-4-01: Full E2E test suite passes
- [ ] R-4-02: src/lib/ archived to _archived/
- [ ] R-4-03: All imports updated
- [ ] R-4-04: Final governance check
- [ ] R-4-05: Documentation updated

### Validation Gate
```yaml
automated:
  - [ ] pnpm typecheck:fast # 0 TOTAL errors
  - [ ] pnpm test:fast # All pass
  - [ ] pnpm test:e2e # All pass
  - [ ] pnpm governance # Passes

manual:
  - [ ] Deploy to preview environment
  - [ ] Smoke test all features
  - [ ] Performance check (no regression)
  - [ ] Mobile/tablet layout works

artifacts:
  - [ ] _archived/ contains old src/lib/
  - [ ] @/lib imports: 0 total
  - [ ] workspaceId in new code: 0
  - [ ] R-4-SUMMARY.md created
```

### Phase Complete
- [ ] All automated checks pass
- [ ] All manual checks pass
- [ ] All artifacts created
- [ ] User approval received
- [ ] **STRATEGIC REBUILD COMPLETE**

---

## Phase R-5: Resume Roadmap

### Pre-Gate
- [ ] R-4 complete and validated
- [ ] Clean architecture confirmed
- [ ] Team briefed on new structure

### Execution
- [ ] Phase B (AI Gateway) can now proceed
- [ ] Phase C (Notes AI) unblocked
- [ ] Future phases build on solid foundation

### Success Criteria
- [ ] Architecture matches SOURCE-OF-TRUTH.md
- [ ] AI agents can work productively
- [ ] No more "prerequisite" phases needed
- [ ] Velocity increased

---

## Escalation Triggers

If ANY of these occur, STOP and escalate:

| Trigger | Action |
|---------|--------|
| Schema needs changing | Document in GAPS-TRACKER, escalate to architect |
| Feature can't be ported | Document why, escalate |
| Type errors cascade | Don't patch, escalate |
| Validation gate fails repeatedly | Stop, investigate root cause |
| Users' data at risk | STOP immediately, escalate |

---

## Summary Tracking

| Phase | Status | Started | Completed | Validated By |
|-------|--------|---------|-----------|--------------|
| R-0 | PENDING | - | - | - |
| R-1 | PENDING | - | - | - |
| R-2 | PENDING | - | - | - |
| R-3 | PENDING | - | - | - |
| R-4 | PENDING | - | - | - |
| R-5 | PENDING | - | - | - |

---

*Validation Checklist v1.0.0*
*Created: 2026-02-02*
